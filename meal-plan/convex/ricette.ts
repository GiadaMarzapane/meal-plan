import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ingrediente, macro, tipoPasto } from "./schema";
import { richiediHousehold } from "./lib";

const campiRicetta = {
  nome: v.string(),
  tags: v.array(v.string()),
  ingredienti: v.array(ingrediente),
  porzioni: v.number(),
  pastiAdatti: v.optional(v.array(tipoPasto)),
  macro: v.optional(macro),
  stagioni: v.array(v.string()),
  tempoMinuti: v.optional(v.number()),
  preparazione: v.optional(v.array(v.string())),
  note: v.optional(v.string()),
};

/** Catalogo ricette. Con `mese` filtra solo quelle di stagione. */
export const lista = query({
  args: { mese: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const ricette = await ctx.db
      .query("ricette")
      .withIndex("by_household", (q) => q.eq("householdId", householdId))
      .collect();

    // Ordine alfabetico: è l'unico che rende scorribile un catalogo lungo,
    // e vale per tutti i consumatori (elenco, tendina del pianificatore).
    const ordinate = [...ricette].sort((a, b) => a.nome.localeCompare(b.nome, "it"));

    if (args.mese === undefined) return ordinate;
    const mese = args.mese.toLowerCase();
    // stagioni vuoto = ricetta valida tutto l'anno
    return ordinate.filter(
      (r) => r.stagioni.length === 0 || r.stagioni.includes(mese)
    );
  },
});

export const aggiungi = mutation({
  args: campiRicetta,
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    if (args.porzioni <= 0) throw new Error("Le porzioni devono essere almeno 1.");
    return await ctx.db.insert("ricette", { householdId, ...args });
  },
});

export const modifica = mutation({
  args: { ricettaId: v.id("ricette"), ...campiRicetta },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const { ricettaId, ...campi } = args;
    const ricetta = await ctx.db.get(ricettaId);
    if (ricetta === null || ricetta.householdId !== householdId) {
      throw new Error("Ricetta non trovata.");
    }
    if (campi.porzioni <= 0) throw new Error("Le porzioni devono essere almeno 1.");
    await ctx.db.patch(ricettaId, campi);
  },
});

export const rimuovi = mutation({
  args: { ricettaId: v.id("ricette") },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const ricetta = await ctx.db.get(args.ricettaId);
    if (ricetta === null || ricetta.householdId !== householdId) {
      throw new Error("Ricetta non trovata.");
    }

    // Stacco la ricetta dai pasti che la usavano e pulisco lo storico.
    const storico = await ctx.db
      .query("menuStorico")
      .withIndex("by_household_ricetta", (q) =>
        q.eq("householdId", householdId).eq("ricettaId", args.ricettaId)
      )
      .collect();
    for (const voce of storico) await ctx.db.delete(voce._id);

    const pasti = await ctx.db
      .query("pastiPianificati")
      .withIndex("by_household_data", (q) => q.eq("householdId", householdId))
      .collect();
    for (const pasto of pasti) {
      if (pasto.ricettaId === args.ricettaId) {
        await ctx.db.patch(pasto._id, {
          ricettaId: undefined,
          stato: "da_pianificare",
        });
      }
    }

    await ctx.db.delete(args.ricettaId);
  },
});
