import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { normalizzaNome } from "./lib";
import { categorieBase } from "./seedData/categorieBase";
import { dispensaIniziale } from "./seedData/dispensaIniziale";
import { ricetteEsempio } from "./seedData/ricetteEsempio";

/**
 * Popola il catalogo con le ricette di esempio. Idempotente: salta quelle
 * il cui nome è già presente, quindi si può rilanciare senza duplicare.
 *
 *   npx convex run seed:ricette '{"householdId": "<id>"}'
 */
export const ricette = internalMutation({
  args: { householdId: v.id("households") },
  handler: async (ctx, args) => {
    const esistenti = await ctx.db
      .query("ricette")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();
    const perNome = new Map(esistenti.map((r) => [r.nome.toLowerCase(), r]));

    let create = 0;
    let aggiornate = 0;
    for (const ricetta of ricetteEsempio) {
      const gia = perNome.get(ricetta.nome.toLowerCase());
      if (gia === undefined) {
        await ctx.db.insert("ricette", { householdId: args.householdId, ...ricetta });
        create++;
        continue;
      }
      // Le ricette già inserite prima che esistesse `pastiAdatti` non sanno a
      // quale pasto servono: senza questo finirebbero anche a colazione.
      if (gia.pastiAdatti === undefined) {
        await ctx.db.patch(gia._id, { pastiAdatti: ricetta.pastiAdatti });
        aggiornate++;
      }
    }
    return {
      create,
      aggiornate,
      invariate: ricetteEsempio.length - create - aggiornate,
    };
  },
});

/**
 * Popola le categorie del frigo. Serve solo per gli household creati prima
 * che le categorie esistessero: i nuovi le ricevono già da `households.crea`.
 *
 *   npx convex run seed:categorie '{"householdId": "<id>"}'
 */
export const categorie = internalMutation({
  args: { householdId: v.id("households") },
  handler: async (ctx, args) => {
    const esistenti = await ctx.db
      .query("categorie")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();
    const nomiPresenti = new Set(esistenti.map((c) => c.nome.toLowerCase()));

    let create = 0;
    for (const nome of categorieBase) {
      if (nomiPresenti.has(nome.toLowerCase())) continue;
      await ctx.db.insert("categorie", { householdId: args.householdId, nome });
      create++;
    }
    return { create, saltate: categorieBase.length - create };
  },
});

/**
 * Popola la dispensa con l'inventario iniziale. Idempotente: salta i prodotti
 * il cui nome è già presente, quindi non duplica se rilanciata.
 *
 *   npx convex run seed:dispensa '{"householdId": "<id>"}'
 */
export const dispensa = internalMutation({
  args: {
    householdId: v.id("households"),
    // Con `allinea` i prodotti già presenti vengono riportati ai valori del
    // seed. Sovrascrive le modifiche fatte a mano, quindi è opt-in.
    allinea: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const esistenti = await ctx.db
      .query("prodottiFrigo")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();
    const perNome = new Map(esistenti.map((p) => [normalizzaNome(p.nome), p]));

    let create = 0;
    let allineati = 0;
    for (const prodotto of dispensaIniziale) {
      const gia = perNome.get(normalizzaNome(prodotto.nome));
      if (gia === undefined) {
        await ctx.db.insert("prodottiFrigo", {
          householdId: args.householdId,
          ...prodotto,
        });
        create++;
        continue;
      }
      if (args.allinea === true) {
        await ctx.db.patch(gia._id, {
          categoria: prodotto.categoria,
          pezzi: prodotto.pezzi,
          quantita: prodotto.quantita,
          unita: prodotto.unita,
          generico: prodotto.generico,
          dataScadenza: prodotto.dataScadenza,
        });
        allineati++;
      }
    }
    return {
      create,
      allineati,
      invariati: dispensaIniziale.length - create - allineati,
    };
  },
});
