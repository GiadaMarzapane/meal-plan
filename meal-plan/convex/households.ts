import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { membershipCorrente, richiediHousehold } from "./lib";
import { macro } from "./schema";
import { categorieBase } from "./seedData/categorieBase";

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generaCodice(): string {
  let codice = "";
  for (let i = 0; i < 6; i++) {
    codice += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return codice;
}

/** Stato corrente: chi sono, in che household sono, chi sono i commensali. */
export const corrente = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    const membership = await membershipCorrente(ctx);
    if (membership === null) {
      return { userId, household: null, membri: [], io: null };
    }

    const household = await ctx.db.get(membership.householdId);
    const membri = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", membership.householdId))
      .collect();

    return { userId, household, membri, io: membership };
  },
});

/** Crea un nuovo gruppo e ci mette dentro l'utente loggato. */
export const crea = mutation({
  args: { nome: v.string(), displayName: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Devi essere autenticato.");

    const esistente = await membershipCorrente(ctx);
    if (esistente !== null) throw new Error("Sei già in un gruppo.");

    const householdId = await ctx.db.insert("households", {
      name: args.nome,
      codiceInvito: generaCodice(),
    });
    await ctx.db.insert("householdMembers", {
      householdId,
      userId,
      displayName: args.displayName,
    });
    // Categorie di partenza per il frigo, poi modificabili dall'app.
    for (const nome of categorieBase) {
      await ctx.db.insert("categorie", { householdId, nome });
    }
    return householdId;
  },
});

/** Entra in un gruppo esistente usando il codice invito. */
export const entra = mutation({
  args: { codice: v.string(), displayName: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Devi essere autenticato.");

    const esistente = await membershipCorrente(ctx);
    if (esistente !== null) throw new Error("Sei già in un gruppo.");

    const codice = args.codice.trim().toUpperCase();
    const household = await ctx.db
      .query("households")
      .withIndex("by_codice", (q) => q.eq("codiceInvito", codice))
      .first();
    if (household === null) throw new Error("Codice invito non valido.");

    // Se esiste già un commensale senza account con questo nome, lo collego.
    const membri = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", household._id))
      .collect();
    const daCollegare = membri.find(
      (m) => m.userId === undefined && m.displayName === args.displayName
    );
    if (daCollegare !== undefined) {
      await ctx.db.patch(daCollegare._id, { userId });
      return household._id;
    }

    await ctx.db.insert("householdMembers", {
      householdId: household._id,
      userId,
      displayName: args.displayName,
    });
    return household._id;
  },
});

/** Aggiunge un commensale senza account (es. Davide). */
export const aggiungiCommensale = mutation({
  args: { displayName: v.string() },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const nome = args.displayName.trim();
    if (nome === "") throw new Error("Il nome non può essere vuoto.");

    const membri = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", householdId))
      .collect();
    if (membri.some((m) => m.displayName === nome)) {
      throw new Error("C'è già un commensale con questo nome.");
    }

    return await ctx.db.insert("householdMembers", { householdId, displayName: nome });
  },
});

/** Rimuove un commensale senza account. Chi ha un login non si tocca. */
export const rimuoviCommensale = mutation({
  args: { membroId: v.id("householdMembers") },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const membro = await ctx.db.get(args.membroId);
    if (membro === null || membro.householdId !== householdId) {
      throw new Error("Commensale non trovato.");
    }
    if (membro.userId !== undefined) {
      throw new Error("Non puoi rimuovere un membro con account.");
    }
    await ctx.db.delete(args.membroId);
  },
});

/**
 * Imposta (o azzera, passando null) l'obiettivo nutrizionale giornaliero di un
 * commensale. Serve per chi segue una dieta con grammature da rispettare.
 */
export const impostaObiettivo = mutation({
  args: {
    membroId: v.id("householdMembers"),
    obiettivo: v.union(macro, v.null()),
  },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const membro = await ctx.db.get(args.membroId);
    if (membro === null || membro.householdId !== householdId) {
      throw new Error("Commensale non trovato.");
    }
    await ctx.db.patch(args.membroId, {
      obiettivo: args.obiettivo ?? undefined,
    });
  },
});

/** Istruzioni libere per il generatore con AI: come vi piace mangiare. */
export const impostaPreferenze = mutation({
  args: { preferenze: v.string() },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const testo = args.preferenze.trim();
    await ctx.db.patch(householdId, {
      preferenze: testo === "" ? undefined : testo,
    });
  },
});
