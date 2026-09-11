import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export const MESI = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
] as const;

export type Mese = (typeof MESI)[number];

/** Nome del mese italiano per una data ISO "YYYY-MM-DD". */
export function meseDiIso(iso: string): Mese {
  const indice = Number(iso.slice(5, 7)) - 1;
  return MESI[indice] ?? "gennaio";
}

/** "YYYY-MM-DD" spostata di `giorni`, senza dipendere dal fuso locale. */
export function isoPiuGiorni(iso: string, giorni: number): string {
  const base = new Date(`${iso}T00:00:00.000Z`);
  base.setUTCDate(base.getUTCDate() + giorni);
  return base.toISOString().slice(0, 10);
}

/**
 * Riporta una quantità all'unità di base della sua famiglia: i chilogrammi
 * diventano grammi e i litri millilitri.
 *
 * Serve perché i confronti fra ricetta e dispensa avvengono su nome + unità:
 * senza questa riduzione 1 kg di pasta in dispensa non coprirebbe i 500 g
 * chiesti da una ricetta, perché "kg" e "g" sarebbero due chiavi diverse.
 */
export function inUnitaBase(
  quantita: number | undefined,
  unita: string | undefined
): { quantita: number | undefined; unita: string | undefined } {
  const u = unita?.trim().toLowerCase();
  if (u === "kg") {
    return { quantita: quantita === undefined ? undefined : quantita * 1000, unita: "g" };
  }
  if (u === "l") {
    return { quantita: quantita === undefined ? undefined : quantita * 1000, unita: "ml" };
  }
  return { quantita, unita };
}

/** Normalizza un nome ingrediente/prodotto per confrontarlo (spesa vs frigo). */
export function normalizzaNome(nome: string): string {
  return nome.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Il membership dell'utente loggato, o null se non è in nessun household. */
export async function membershipCorrente(
  ctx: QueryCtx
): Promise<Doc<"householdMembers"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  return await ctx.db
    .query("householdMembers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}

/** Come sopra ma solleva se manca: da usare in tutte le query/mutation dell'app. */
export async function richiediHousehold(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"households">> {
  const membership = await membershipCorrente(ctx);
  if (membership === null) {
    throw new Error("Nessun household: crea o entra in un gruppo prima.");
  }
  return membership.householdId;
}

/**
 * Quanto ce n'è in tutto: pezzi × contenuto del singolo pezzo.
 * `undefined` quando non è indicato nulla, per distinguere "non lo so" da zero.
 */
export function scortaTotale(prodotto: {
  pezzi?: number;
  quantita?: number;
}): number | undefined {
  if (prodotto.pezzi === undefined && prodotto.quantita === undefined) {
    return undefined;
  }
  return (prodotto.pezzi ?? 1) * (prodotto.quantita ?? 1);
}

/**
 * I nomi sotto cui un prodotto può essere riconosciuto da una ricetta: quello
 * proprio e, se c'è, quello generico. "Fusilli" risponde sia a `fusilli` che a
 * `pasta`.
 */
export function nomiProdotto(prodotto: {
  nome: string;
  generico?: string;
}): string[] {
  const nomi = [normalizzaNome(prodotto.nome)];
  if (prodotto.generico !== undefined && prodotto.generico.trim() !== "") {
    const generico = normalizzaNome(prodotto.generico);
    if (generico !== nomi[0]) nomi.push(generico);
  }
  return nomi;
}

/**
 * Quello che resta in dispensa mentre costruisco la settimana. `rimasto` è
 * `undefined` quando la quantità non è nota: in quel caso assumo che basti per
 * un pasto solo, per non pianificare due volte sulla stessa scorta.
 */
export type Scorta = { rimasto: number | undefined; unita: string | undefined; urgente: boolean };

export type Ingrediente = { nome: string; quantita?: number; unita?: string };

/**
 * Toglie dalla dispensa quello che il pasto appena pianificato consumerà, così
 * lo slot successivo non conta due volte la stessa confezione.
 *
 * Se non riesco a fare il conto (quantità ignota o unità diverse) considero la
 * scorta esaurita: meglio non insistere su un prodotto di cui non so quanto ho,
 * che pianificarci sopra tre cene.
 */
export function consumaDallaDispensa(
  ingredienti: Ingrediente[],
  dispensa: Map<string, Scorta>,
  fattore: number
): void {
  for (const ingrediente of ingredienti) {
    const chiave = normalizzaNome(ingrediente.nome);
    const scorta = dispensa.get(chiave);
    if (scorta === undefined) continue;

    const richiesto = inUnitaBase(ingrediente.quantita, ingrediente.unita);
    const serve =
      richiesto.quantita === undefined ? undefined : richiesto.quantita * fattore;
    const rimasto = scorta.rimasto;
    const stessaUnita = (richiesto.unita ?? "") === (scorta.unita ?? "");

    dispensa.set(chiave, {
      ...scorta,
      rimasto:
        serve !== undefined && rimasto !== undefined && stessaUnita
          ? Math.max(0, rimasto - serve)
          : 0,
    });
  }
}

/** Entro quanti giorni un prodotto è "da consumare subito". */
export const GIORNI_URGENZA = 5;

type ProdottoDispensa = {
  nome: string;
  generico?: string;
  pezzi?: number;
  quantita?: number;
  unita?: string;
  dataScadenza?: string;
};

/**
 * Indicizza la dispensa per nome (proprio e generico), sommando le scorte dello
 * stesso ingrediente e marcando come urgente ciò che scade entro pochi giorni
 * da `isoRiferimento`.
 */
export function costruisciDispensa(
  prodotti: ProdottoDispensa[],
  isoRiferimento: string
): Map<string, Scorta> {
  const limite = isoPiuGiorni(isoRiferimento, GIORNI_URGENZA);
  const dispensa = new Map<string, Scorta>();

  for (const prodotto of prodotti) {
    const urgente =
      prodotto.dataScadenza !== undefined && prodotto.dataScadenza <= limite;
    const base = inUnitaBase(scortaTotale(prodotto), prodotto.unita);
    const totale = base.quantita;

    for (const chiave of nomiProdotto(prodotto)) {
      const precedente = dispensa.get(chiave);
      dispensa.set(chiave, {
        rimasto:
          precedente === undefined
            ? totale
            : precedente.rimasto === undefined || totale === undefined
              ? undefined
              : precedente.rimasto + totale,
        unita: base.unita,
        urgente: urgente || (precedente?.urgente ?? false),
      });
    }
  }
  return dispensa;
}

/**
 * Cosa manca per fare una ricetta con quello che c'è in dispensa.
 *
 * Un ingrediente conta come coperto anche quando non riesco a fare il conto
 * (quantità ignota, o unità diverse fra ricetta e dispensa): è la stessa
 * assunzione della lista della spesa, che in dubbio non ti fa ricomprare.
 */
export function analizzaCopertura(
  ingredienti: Ingrediente[],
  dispensa: Map<string, Scorta>,
  fattore: number
): {
  mancanti: Ingrediente[];
  coperti: { nome: string; urgente: boolean }[];
  urgentiUsati: string[];
} {
  const mancanti: Ingrediente[] = [];
  const coperti: { nome: string; urgente: boolean }[] = [];
  const urgentiUsati: string[] = [];

  for (const ingrediente of ingredienti) {
    const scorta = dispensa.get(normalizzaNome(ingrediente.nome));
    const richiesto = inUnitaBase(ingrediente.quantita, ingrediente.unita);
    const serve =
      richiesto.quantita === undefined ? undefined : richiesto.quantita * fattore;

    if (scorta === undefined) {
      mancanti.push({ ...ingrediente, quantita: serve, unita: richiesto.unita });
      continue;
    }

    if (scorta.urgente) urgentiUsati.push(ingrediente.nome);

    const stessaUnita = (richiesto.unita ?? "") === (scorta.unita ?? "");
    const bastano =
      serve === undefined || scorta.rimasto === undefined || !stessaUnita
        ? true // non so fare il conto: assumo che basti, come fa la lista spesa
        : scorta.rimasto >= serve;

    if (bastano) {
      coperti.push({ nome: ingrediente.nome, urgente: scorta.urgente });
    } else {
      mancanti.push({
        ...ingrediente,
        unita: richiesto.unita,
        quantita:
          serve === undefined || scorta.rimasto === undefined
            ? serve
            : Math.round((serve - scorta.rimasto) * 100) / 100,
      });
    }
  }

  return { mancanti, coperti, urgentiUsati };
}

/**
 * Quanto una ricetta sfrutta la dispensa, con lo stesso metro della vista
 * "cosa posso cucinare adesso": conta solo gli ingredienti di cui ce n'è
 * *abbastanza*, e vale il triplo quello che sta per scadere.
 */
export function punteggioCopertura(
  ingredienti: Ingrediente[],
  dispensa: Map<string, Scorta>,
  fattore: number
): number {
  const { coperti } = analizzaCopertura(ingredienti, dispensa, fattore);
  return coperti.reduce((somma, c) => somma + (c.urgente ? 3 : 1), 0);
}

/** Come si legge una scorta in una riga di testo: "3 x 125 g", "6 pz", "700 g". */
export function formattaScortaTesto(prodotto: {
  pezzi?: number;
  quantita?: number;
  unita?: string;
}): string {
  const { pezzi, quantita, unita } = prodotto;
  const misura = (n: number) => `${String(n)}${unita === undefined ? "" : ` ${unita}`}`;

  if (pezzi !== undefined && quantita !== undefined) {
    return `${String(pezzi)} x ${misura(quantita)} (${misura(pezzi * quantita)} in tutto)`;
  }
  if (pezzi !== undefined) return `${String(pezzi)} ${unita ?? "pz"}`;
  if (quantita !== undefined) return misura(quantita);
  return "quantità non indicata";
}
