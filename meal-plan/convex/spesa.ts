import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  inUnitaBase,
  isoPiuGiorni,
  nomiProdotto,
  normalizzaNome,
  richiediHousehold,
  scortaTotale,
} from "./lib";

type Voce = { nome: string; quantita: number | undefined; unita: string | undefined };

/** Chiave di aggregazione: stesso ingrediente + stessa unità si sommano. */
function chiave(nome: string, unita: string | undefined): string {
  return `${normalizzaNome(nome)}::${unita ?? ""}`;
}

export const lista = query({
  args: {},
  handler: async (ctx) => {
    const householdId = await richiediHousehold(ctx);
    const voci = await ctx.db
      .query("listaSpesa")
      .withIndex("by_household", (q) => q.eq("householdId", householdId))
      .collect();
    // Da prendere prima, già prese in fondo.
    return [...voci].sort((a, b) => {
      if (a.presa !== b.presa) return a.presa ? 1 : -1;
      return a.nome.localeCompare(b.nome, "it");
    });
  },
});

export const aggiungi = mutation({
  args: {
    nome: v.string(),
    quantita: v.optional(v.number()),
    unita: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const nome = args.nome.trim();
    if (nome === "") throw new Error("Il nome non può essere vuoto.");
    return await ctx.db.insert("listaSpesa", {
      householdId,
      nome,
      quantita: args.quantita,
      unita: args.unita,
      presa: false,
      generata: false,
    });
  },
});

export const segna = mutation({
  args: { voceId: v.id("listaSpesa"), presa: v.boolean() },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const voce = await ctx.db.get(args.voceId);
    if (voce === null || voce.householdId !== householdId) {
      throw new Error("Voce non trovata.");
    }
    await ctx.db.patch(args.voceId, { presa: args.presa });
  },
});

export const rimuovi = mutation({
  args: { voceId: v.id("listaSpesa") },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const voce = await ctx.db.get(args.voceId);
    if (voce === null || voce.householdId !== householdId) {
      throw new Error("Voce non trovata.");
    }
    await ctx.db.delete(args.voceId);
  },
});

/** Svuota le voci già prese (tipico dopo essere tornati dal supermercato). */
export const rimuoviPrese = mutation({
  args: {},
  handler: async (ctx) => {
    const householdId = await richiediHousehold(ctx);
    const voci = await ctx.db
      .query("listaSpesa")
      .withIndex("by_household", (q) => q.eq("householdId", householdId))
      .collect();
    let rimosse = 0;
    for (const voce of voci) {
      if (!voce.presa) continue;
      await ctx.db.delete(voce._id);
      rimosse++;
    }
    return { rimosse };
  },
});

/**
 * Genera la lista confrontando gli ingredienti dei pasti pianificati nel
 * periodo con quello che c'è già in frigo. Le voci aggiunte a mano e quelle
 * già segnate come prese non vengono toccate.
 */
export const genera = mutation({
  args: { dataInizio: v.string(), giorni: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const durata = args.giorni ?? 7;
    const dataFine = isoPiuGiorni(args.dataInizio, durata - 1);

    const pasti = await ctx.db
      .query("pastiPianificati")
      .withIndex("by_household_data", (q) =>
        q
          .eq("householdId", householdId)
          .gte("data", args.dataInizio)
          .lte("data", dataFine)
      )
      .collect();

    // 1. Somma gli ingredienti scalati sui commensali di ogni slot.
    const necessario = new Map<string, Voce>();
    for (const pasto of pasti) {
      const ricettaId = pasto.ricettaId;
      if (pasto.stato !== "pianificato" || ricettaId === undefined) continue;
      if (pasto.commensali.length === 0) continue;

      const ricetta = await ctx.db.get(ricettaId);
      if (ricetta === null) continue;

      const porzioniTotali = pasto.commensali.reduce((somma, c) => somma + c.porzioni, 0);
      if (porzioniTotali <= 0) continue;
      const fattore = porzioniTotali / ricetta.porzioni;
      for (const ing of ricetta.ingredienti) {
        // Chilogrammi e litri diventano grammi e millilitri: così le quantità
        // si sommano e si sottraggono anche se ricetta e dispensa usano
        // multipli diversi della stessa unità.
        const base = inUnitaBase(ing.quantita, ing.unita);
        const k = chiave(ing.nome, base.unita);
        const corrente = necessario.get(k);
        const aggiunta = base.quantita === undefined ? undefined : base.quantita * fattore;
        if (corrente === undefined) {
          necessario.set(k, { nome: ing.nome, quantita: aggiunta, unita: base.unita });
        } else if (corrente.quantita !== undefined && aggiunta !== undefined) {
          corrente.quantita += aggiunta;
        } else {
          // Almeno una delle due non ha quantità: la voce resta "senza numero".
          corrente.quantita = undefined;
        }
      }
    }

    // 2. Sottrai quello che c'è già in frigo.
    const frigo = await ctx.db
      .query("prodottiFrigo")
      .withIndex("by_household", (q) => q.eq("householdId", householdId))
      .collect();
    for (const prodotto of frigo) {
      // Il prodotto copre sia il suo nome sia quello generico: 500 g di fusilli
      // valgono per una ricetta che chiede "pasta".
      const scorta = inUnitaBase(scortaTotale(prodotto), prodotto.unita);
      for (const nome of nomiProdotto(prodotto)) {
        const k = `${nome}::${scorta.unita ?? ""}`;
        const voce = necessario.get(k);
        if (voce === undefined) continue;

        const disponibile = scorta.quantita;
        if (disponibile === undefined || voce.quantita === undefined) {
          // Non so quanto ce n'è: assumo che basti e tolgo la voce.
          necessario.delete(k);
          continue;
        }
        const residuo = voce.quantita - disponibile;
        if (residuo <= 0) necessario.delete(k);
        else voce.quantita = residuo;
      }
    }

    // 3. Riscrivi solo le voci generate e non ancora prese.
    const esistenti = await ctx.db
      .query("listaSpesa")
      .withIndex("by_household", (q) => q.eq("householdId", householdId))
      .collect();
    for (const voce of esistenti) {
      if (voce.generata && !voce.presa) await ctx.db.delete(voce._id);
    }
    const daTenere = new Set(
      esistenti
        .filter((v0) => !v0.generata || v0.presa)
        .map((v0) => chiave(v0.nome, v0.unita))
    );

    let create = 0;
    for (const [k, voce] of necessario) {
      if (daTenere.has(k)) continue;
      await ctx.db.insert("listaSpesa", {
        householdId,
        nome: voce.nome,
        quantita:
          voce.quantita === undefined ? undefined : Math.round(voce.quantita * 100) / 100,
        unita: voce.unita,
        presa: false,
        generata: true,
      });
      create++;
    }

    return { create };
  },
});
