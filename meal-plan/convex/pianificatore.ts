import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import {
  GIORNI_URGENZA,
  consumaDallaDispensa,
  costruisciDispensa,
  isoPiuGiorni,
  meseDiIso,
  normalizzaNome,
  punteggioCopertura,
  richiediHousehold,
} from "./lib";
import { commensale, statoPasto, tipoPasto } from "./schema";

const TIPI = ["colazione", "pranzo", "cena"] as const;

type Tipo = (typeof TIPI)[number];

/** Giorni entro cui una ricetta è considerata "usata di recente". */
const GIORNI_NO_RIPETIZIONE = 21;

function giorniSettimana(dataInizio: string): string[] {
  return Array.from({ length: 7 }, (_, i) => isoPiuGiorni(dataInizio, i));
}

/**
 * I 14 slot della settimana (7 giorni x pranzo/cena). Gli slot che non
 * esistono ancora sul db vengono restituiti come `da_pianificare` vuoti.
 */
export const settimana = query({
  args: { dataInizio: v.string() },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const giorni = giorniSettimana(args.dataInizio);

    const pasti = await ctx.db
      .query("pastiPianificati")
      .withIndex("by_household_data", (q) =>
        q
          .eq("householdId", householdId)
          .gte("data", giorni[0])
          .lte("data", giorni[6])
      )
      .collect();

    const ricette = await ctx.db
      .query("ricette")
      .withIndex("by_household", (q) => q.eq("householdId", householdId))
      .collect();
    const perId = new Map(ricette.map((r) => [r._id, r]));

    return giorni.map((data) => ({
      data,
      slot: TIPI.map((tipo) => {
        const pasto = pasti.find((p) => p.data === data && p.tipoPasto === tipo);
        return {
          tipoPasto: tipo,
          pastoId: pasto?._id ?? null,
          stato: pasto?.stato ?? ("da_pianificare" as const),
          commensali: pasto?.commensali ?? [],
          avanzo: pasto?.avanzo ?? false,
          ricettaId: pasto?.ricettaId ?? null,
          ricetta:
            pasto?.ricettaId === undefined
              ? null
              : (perId.get(pasto.ricettaId) ?? null),
        };
      }),
    }));
  },
});

/** Crea lo slot se manca, poi restituisce il documento. */
async function slotEsistente(
  ctx: MutationCtx,
  householdId: Id<"households">,
  data: string,
  tipo: Tipo
): Promise<Doc<"pastiPianificati">> {
  const pasti = await ctx.db
    .query("pastiPianificati")
    .withIndex("by_household_data", (q) =>
      q.eq("householdId", householdId).eq("data", data)
    )
    .collect();
  const esistente = pasti.find((p) => p.tipoPasto === tipo);
  if (esistente !== undefined) return esistente;

  // Di default invito tutti i membri del gruppo.
  const membri = await ctx.db
    .query("householdMembers")
    .withIndex("by_household", (q) => q.eq("householdId", householdId))
    .collect();

  const id = await ctx.db.insert("pastiPianificati", {
    householdId,
    data,
    tipoPasto: tipo,
    stato: "da_pianificare",
    commensali: membri
      .filter((m) => m.userId !== undefined)
      .map((m) => ({ nome: m.displayName, porzioni: 1 })),
  });
  const creato = await ctx.db.get(id);
  if (creato === null) throw new Error("Slot non creato.");
  return creato;
}

export const impostaStato = mutation({
  args: { data: v.string(), tipoPasto, stato: statoPasto },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const slot = await slotEsistente(ctx, householdId, args.data, args.tipoPasto);
    // "fuori" e "da_pianificare" non hanno una ricetta associata.
    await ctx.db.patch(slot._id, {
      stato: args.stato,
      ricettaId: args.stato === "pianificato" ? slot.ricettaId : undefined,
    });
  },
});

export const impostaRicetta = mutation({
  args: {
    data: v.string(),
    tipoPasto,
    ricettaId: v.union(v.id("ricette"), v.null()),
  },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const slot = await slotEsistente(ctx, householdId, args.data, args.tipoPasto);

    if (args.ricettaId === null) {
      await ctx.db.patch(slot._id, {
        ricettaId: undefined,
        stato: "da_pianificare",
      });
      return;
    }

    const ricetta = await ctx.db.get(args.ricettaId);
    if (ricetta === null || ricetta.householdId !== householdId) {
      throw new Error("Ricetta non trovata.");
    }
    await ctx.db.patch(slot._id, {
      ricettaId: args.ricettaId,
      stato: "pianificato",
    });
  },
});

export const impostaCommensali = mutation({
  args: { data: v.string(), tipoPasto, commensali: v.array(commensale) },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const slot = await slotEsistente(ctx, householdId, args.data, args.tipoPasto);
    await ctx.db.patch(slot._id, { commensali: args.commensali });
  },
});

/**
 * Generatore rule-based (fase 1 della roadmap):
 * - solo ricette adatte al pasto dello slot (colazione / pranzo / cena)
 * - solo ricette di stagione per il mese dello slot
 * - esclude quelle cucinate negli ultimi GIORNI_NO_RIPETIZIONE giorni
 * - a parità di vincoli preferisce quelle che usano la dispensa, dando peso
 *   triplo ai prodotti in scadenza
 * - salta gli slot `fuori` e (se non `sovrascrivi`) quelli già pianificati
 */
export const generaSettimana = mutation({
  args: { dataInizio: v.string(), sovrascrivi: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const sovrascrivi = args.sovrascrivi ?? false;
    const giorni = giorniSettimana(args.dataInizio);

    const ricette = await ctx.db
      .query("ricette")
      .withIndex("by_household", (q) => q.eq("householdId", householdId))
      .collect();
    if (ricette.length === 0) {
      return {
        assegnati: 0,
        saltati: 0,
        ripetute: 0,
        dallaDispensa: 0,
        inScadenzaNonUsati: [] as string[],
        motivo: "Nessuna ricetta in catalogo.",
      };
    }

    // Ultimo utilizzo per ricetta, dallo storico recente.
    const limite = isoPiuGiorni(giorni[0], -GIORNI_NO_RIPETIZIONE);
    const storico = await ctx.db
      .query("menuStorico")
      .withIndex("by_household_data", (q) =>
        q.eq("householdId", householdId).gte("dataUsata", limite)
      )
      .collect();
    const usateDiRecente = new Set(storico.map((s) => s.ricettaId));

    // Quello che c'è in dispensa, indicizzato per nome normalizzato.
    const prodotti = await ctx.db
      .query("prodottiFrigo")
      .withIndex("by_household", (q) => q.eq("householdId", householdId))
      .collect();
    const dispensa = costruisciDispensa(prodotti, giorni[0]);

    // Copia per il report finale: cosa scadeva e non è finito in nessun pasto.
    const urgentiDaUsare = new Set(
      prodotti
        .filter(
          (p) =>
            p.dataScadenza !== undefined &&
            p.dataScadenza <= isoPiuGiorni(giorni[0], GIORNI_URGENZA)
        )
        .map((p) => p.nome)
    );

    // Quante volte ho già messo ogni ricetta in questa settimana.
    const usiInSettimana = new Map<Id<"ricette">, number>();
    let assegnati = 0;
    let saltati = 0;
    let ripetute = 0;
    let dallaDispensa = 0;

    for (const data of giorni) {
      const mese = meseDiIso(data);
      for (const tipo of TIPI) {
        const slot = await slotEsistente(ctx, householdId, data, tipo);
        if (slot.stato === "fuori") continue;
        if (slot.ricettaId !== undefined && !sovrascrivi) continue;
        if (slot.commensali.length === 0) continue;

        const adatte = ricette.filter(
          (r) =>
            r.pastiAdatti === undefined ||
            r.pastiAdatti.length === 0 ||
            r.pastiAdatti.includes(tipo)
        );
        const diStagione = adatte.filter(
          (r) => r.stagioni.length === 0 || r.stagioni.includes(mese)
        );
        if (diStagione.length === 0) {
          saltati++;
          continue;
        }

        // Allento i vincoli a scalini, invece di lasciare lo slot vuoto:
        // 1. di stagione, mai vista di recente né in questa settimana
        // 2. di stagione, non ancora usata in questa settimana
        // 3. di stagione, tra quelle meno ripetute in questa settimana
        const mai = diStagione.filter(
          (r) => !usiInSettimana.has(r._id) && !usateDiRecente.has(r._id)
        );
        const nonInSettimana = diStagione.filter((r) => !usiInSettimana.has(r._id));

        let pool = mai;
        let eRipetizione = false;
        if (pool.length === 0) pool = nonInSettimana;
        if (pool.length === 0) {
          const minimo = Math.min(
            ...diStagione.map((r) => usiInSettimana.get(r._id) ?? 0)
          );
          pool = diStagione.filter((r) => (usiInSettimana.get(r._id) ?? 0) === minimo);
          eRipetizione = true;
        }

        // Fra i candidati rimasti preferisco chi svuota la dispensa; a parità
        // di punteggio scelgo a caso, così due generazioni non sono identiche.
        const porzioniSlot = slot.commensali.reduce((somma, c) => somma + c.porzioni, 0);
        const punteggi = pool.map((r) =>
          punteggioCopertura(r.ingredienti, dispensa, porzioniSlot / r.porzioni)
        );
        const massimo = Math.max(...punteggi);
        const migliori = pool.filter((_, i) => punteggi[i] === massimo);

        const scelta = migliori[Math.floor(Math.random() * migliori.length)];
        if (massimo > 0) dallaDispensa++;

        consumaDallaDispensa(
          scelta.ingredienti,
          dispensa,
          porzioniSlot / scelta.porzioni
        );
        for (const ingrediente of scelta.ingredienti) {
          for (const nome of urgentiDaUsare) {
            if (normalizzaNome(nome) === normalizzaNome(ingrediente.nome)) {
              urgentiDaUsare.delete(nome);
            }
          }
        }
        usiInSettimana.set(scelta._id, (usiInSettimana.get(scelta._id) ?? 0) + 1);
        if (eRipetizione) ripetute++;
        await ctx.db.patch(slot._id, {
          ricettaId: scelta._id,
          stato: "pianificato",
        });
        assegnati++;
      }
    }

    return {
      assegnati,
      saltati,
      ripetute,
      dallaDispensa,
      // Sta per scadere e nessun pasto della settimana lo usa: è lo spreco
      // che il generatore, da solo, non riesce a evitare.
      inScadenzaNonUsati: [...urgentiDaUsare],
      motivo: null,
    };
  },
});

/**
 * Segna i pasti pianificati di una settimana come effettivamente cucinati,
 * così il generatore non li ripropone subito.
 */
export const archiviaSettimana = mutation({
  args: { dataInizio: v.string() },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const giorni = giorniSettimana(args.dataInizio);

    const pasti = await ctx.db
      .query("pastiPianificati")
      .withIndex("by_household_data", (q) =>
        q
          .eq("householdId", householdId)
          .gte("data", giorni[0])
          .lte("data", giorni[6])
      )
      .collect();

    let archiviati = 0;
    for (const pasto of pasti) {
      const ricettaId = pasto.ricettaId;
      if (pasto.stato !== "pianificato" || ricettaId === undefined) continue;

      const esistente = await ctx.db
        .query("menuStorico")
        .withIndex("by_household_ricetta", (q) =>
          q.eq("householdId", householdId).eq("ricettaId", ricettaId)
        )
        .collect();
      if (esistente.some((s) => s.dataUsata === pasto.data)) continue;

      await ctx.db.insert("menuStorico", {
        householdId,
        ricettaId,
        dataUsata: pasto.data,
      });
      archiviati++;
    }
    return { archiviati };
  },
});
