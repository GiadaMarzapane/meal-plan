import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { normalizzaNome, richiediHousehold } from "./lib";

export const lista = query({
  args: {},
  handler: async (ctx) => {
    const householdId = await richiediHousehold(ctx);
    const categorie = await ctx.db
      .query("categorie")
      .withIndex("by_household", (q) => q.eq("householdId", householdId))
      .collect();
    return [...categorie].sort((a, b) => a.nome.localeCompare(b.nome, "it"));
  },
});

export const aggiungi = mutation({
  args: { nome: v.string() },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const nome = args.nome.trim();
    if (nome === "") throw new Error("Il nome non può essere vuoto.");

    const esistenti = await ctx.db
      .query("categorie")
      .withIndex("by_household", (q) => q.eq("householdId", householdId))
      .collect();
    const gia = esistenti.find(
      (c) => normalizzaNome(c.nome) === normalizzaNome(nome)
    );
    if (gia !== undefined) return gia._id;

    return await ctx.db.insert("categorie", { householdId, nome });
  },
});

/**
 * Toglie una categoria dall'elenco dei suggerimenti. I prodotti che la
 * usavano restano invariati: salvano il nome, non un riferimento.
 */
export const rimuovi = mutation({
  args: { categoriaId: v.id("categorie") },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const categoria = await ctx.db.get(args.categoriaId);
    if (categoria === null || categoria.householdId !== householdId) {
      throw new Error("Categoria non trovata.");
    }
    await ctx.db.delete(args.categoriaId);
  },
});
