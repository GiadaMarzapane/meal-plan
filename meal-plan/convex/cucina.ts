import { v } from "convex/values";
import { query } from "./_generated/server";
import { analizzaCopertura, costruisciDispensa, richiediHousehold } from "./lib";
import { tipoPasto } from "./schema";

/**
 * "Cosa posso cucinare adesso": le ricette ordinate da quelle che riesci a fare
 * subito a quelle che richiedono più spesa. È il generatore girato al
 * contrario — non "riempi la settimana" ma "stasera cosa tiro fuori".
 */
export const possibiliOra = query({
  args: {
    oggi: v.string(), // ISO date, per capire cosa sta per scadere
    porzioni: v.optional(v.number()),
    pasto: v.optional(tipoPasto),
  },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const porzioniVolute = args.porzioni ?? 2;

    const [ricette, prodotti] = await Promise.all([
      ctx.db
        .query("ricette")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect(),
      ctx.db
        .query("prodottiFrigo")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect(),
    ]);

    const dispensa = costruisciDispensa(prodotti, args.oggi);

    const pasto = args.pasto;
    const candidate =
      pasto === undefined
        ? ricette
        : ricette.filter(
            (r) =>
              r.pastiAdatti === undefined ||
              r.pastiAdatti.length === 0 ||
              r.pastiAdatti.includes(pasto)
          );

    const analisi = candidate.map((ricetta) => {
      // Ogni ricetta si valuta da sola: è una fotografia di adesso, non un
      // piano, quindi due piatti possono contare sulla stessa confezione.
      const esito = analizzaCopertura(
        ricetta.ingredienti,
        dispensa,
        porzioniVolute / ricetta.porzioni
      );
      return {
        ricetta,
        mancanti: esito.mancanti,
        coperti: esito.coperti.length,
        totali: ricetta.ingredienti.length,
        urgentiUsati: [...new Set(esito.urgentiUsati)],
      };
    });

    return analisi.sort((a, b) => {
      // Prima quello che puoi fare subito, poi chi consuma roba in scadenza.
      if (a.mancanti.length !== b.mancanti.length) {
        return a.mancanti.length - b.mancanti.length;
      }
      if (a.urgentiUsati.length !== b.urgentiUsati.length) {
        return b.urgentiUsati.length - a.urgentiUsati.length;
      }
      return a.ricetta.nome.localeCompare(b.ricetta.nome, "it");
    });
  },
});
