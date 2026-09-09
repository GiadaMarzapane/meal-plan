import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { richiediHousehold } from "./lib";

const campiProdotto = {
  nome: v.string(),
  categoria: v.optional(v.string()),
  pezzi: v.optional(v.number()),
  quantita: v.optional(v.number()),
  unita: v.optional(v.string()),
  generico: v.optional(v.string()),
  dataAcquisto: v.optional(v.string()),
  dataScadenza: v.optional(v.string()),
};

/** Prodotti in frigo, ordinati per scadenza più vicina. */
export const lista = query({
  args: {},
  handler: async (ctx) => {
    const householdId = await richiediHousehold(ctx);
    const prodotti = await ctx.db
      .query("prodottiFrigo")
      .withIndex("by_household_scadenza", (q) => q.eq("householdId", householdId))
      .collect();
    // L'indice mette per primi quelli senza scadenza; qui invece interessa
    // vedere in cima quello che sta per scadere, e la dispensa in fondo.
    return [...prodotti].sort((a, b) => {
      if (a.dataScadenza === undefined) return b.dataScadenza === undefined ? 0 : 1;
      if (b.dataScadenza === undefined) return -1;
      return a.dataScadenza.localeCompare(b.dataScadenza);
    });
  },
});

export const aggiungi = mutation({
  args: campiProdotto,
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    return await ctx.db.insert("prodottiFrigo", { householdId, ...args });
  },
});

export const modifica = mutation({
  args: { prodottoId: v.id("prodottiFrigo"), ...campiProdotto },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const { prodottoId, ...campi } = args;
    const prodotto = await ctx.db.get(prodottoId);
    if (prodotto === null || prodotto.householdId !== householdId) {
      throw new Error("Prodotto non trovato.");
    }
    await ctx.db.patch(prodottoId, campi);
  },
});

export const rimuovi = mutation({
  args: { prodottoId: v.id("prodottiFrigo") },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const prodotto = await ctx.db.get(args.prodottoId);
    if (prodotto === null || prodotto.householdId !== householdId) {
      throw new Error("Prodotto non trovato.");
    }
    await ctx.db.delete(args.prodottoId);
  },
});
