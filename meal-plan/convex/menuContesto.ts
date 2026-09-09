import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  formattaScortaTesto,
  isoPiuGiorni,
  meseDiIso,
  nomiProdotto,
  normalizzaNome,
  richiediHousehold,
} from "./lib";

const TIPI = ["colazione", "pranzo", "cena"] as const;

function giorniSettimana(dataInizio: string): string[] {
  return Array.from({ length: 7 }, (_, i) => isoPiuGiorni(dataInizio, i));
}

/**
 * Tutto quello che serve a Claude per pianificare, già appiattito in testo:
 * catalogo, dispensa con le scadenze, storico recente e slot da riempire.
 */
export const perAI = query({
  args: { oggi: v.string(), dataInizio: v.string(), sovrascrivi: v.boolean() },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const giorni = giorniSettimana(args.dataInizio);
    const household = await ctx.db.get(householdId);

    const [ricette, prodotti, pasti, storico, membri] = await Promise.all([
      ctx.db
        .query("ricette")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect(),
      ctx.db
        .query("prodottiFrigo")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect(),
      ctx.db
        .query("pastiPianificati")
        .withIndex("by_household_data", (q) =>
          q.eq("householdId", householdId).gte("data", giorni[0]).lte("data", giorni[6])
        )
        .collect(),
      ctx.db
        .query("menuStorico")
        .withIndex("by_household_data", (q) =>
          q.eq("householdId", householdId).gte("dataUsata", isoPiuGiorni(giorni[0], -28))
        )
        .collect(),
      ctx.db
        .query("householdMembers")
        .withIndex("by_household", (q) => q.eq("householdId", householdId))
        .collect(),
    ]);

    const nomiRicette = new Map(ricette.map((r) => [r._id, r.nome]));

    const slotDaRiempire: {
      data: string;
      tipoPasto: string;
      commensali: string;
      giaPianificato: string | null;
    }[] = [];

    for (const data of giorni) {
      for (const tipo of TIPI) {
        const pasto = pasti.find((p) => p.data === data && p.tipoPasto === tipo);
        if (pasto?.stato === "fuori") continue;
        if (pasto?.ricettaId !== undefined && !args.sovrascrivi) continue;

        // Uno slot senza commensali non è un pasto da pianificare.
        const commensali = pasto?.commensali ?? [];
        if (pasto !== undefined && commensali.length === 0) continue;

        slotDaRiempire.push({
          data,
          tipoPasto: tipo,
          commensali:
            commensali.length === 0
              ? "da definire"
              : commensali
                  .map((c) => `${c.nome} (${String(c.porzioni)} porzioni)`)
                  .join(", "),
          giaPianificato:
            pasto?.ricettaId === undefined
              ? null
              : (nomiRicette.get(pasto.ricettaId) ?? null),
        });
      }
    }

    return {
      oggi: args.oggi,
      inizioSettimana: giorni[0],
      preferenze: household?.preferenze ?? null,
      // Serve a proporre le grammature a chi segue una dieta.
      obiettivi: membri
        .filter((m) => m.obiettivo !== undefined)
        .map((m) => ({
          nome: m.displayName,
          kcal: m.obiettivo?.kcal ?? null,
          proteine: m.obiettivo?.proteine ?? null,
          carboidrati: m.obiettivo?.carboidrati ?? null,
          grassi: m.obiettivo?.grassi ?? null,
        })),
      ricette: ricette.map((r) => ({
        nome: r.nome,
        porzioni: r.porzioni,
        tags: r.tags,
        stagioni: r.stagioni,
        pastiAdatti: r.pastiAdatti ?? [],
        ingredienti: r.ingredienti
          .map(
            (i) =>
              i.nome +
              (i.quantita === undefined
                ? ""
                : ` ${String(i.quantita)}${i.unita ?? ""}`)
          )
          .join(", "),
      })),
      dispensa: prodotti.map((p) => ({
        nome: p.nome + (p.generico === undefined ? "" : ` (vale come ${p.generico})`),
        quantita: formattaScortaTesto(p),
        scadenza: p.dataScadenza ?? null,
      })),
      storico: storico.map((s) => ({
        nome: nomiRicette.get(s.ricettaId) ?? "?",
        dataUsata: s.dataUsata,
      })),
      slotDaRiempire,
    };
  },
});

/**
 * Scrive il piano proposto da Claude. Le assegnazioni che non corrispondono a
 * una ricetta del catalogo o a uno slot valido vengono ignorate, non inventate:
 * il modello propone, il database resta l'autorità.
 */
export const applica = internalMutation({
  args: {
    dataInizio: v.string(),
    sovrascrivi: v.boolean(),
    assegnazioni: v.array(
      v.object({
        data: v.string(),
        tipoPasto: v.union(
          v.literal("colazione"),
          v.literal("pranzo"),
          v.literal("cena")
        ),
        nomeRicetta: v.string(),
        avanzo: v.boolean(),
        motivo: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const giorni = new Set(giorniSettimana(args.dataInizio));

    const ricette = await ctx.db
      .query("ricette")
      .withIndex("by_household", (q) => q.eq("householdId", householdId))
      .collect();
    const perNome = new Map<string, Id<"ricette">>(
      ricette.map((r) => [normalizzaNome(r.nome), r._id])
    );

    const membri = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", householdId))
      .collect();
    const commensaliDefault = membri
      .filter((m) => m.userId !== undefined)
      .map((m) => ({ nome: m.displayName, porzioni: 1 }));

    let assegnati = 0;
    let ignorate = 0;

    for (const proposta of args.assegnazioni) {
      const ricettaId = perNome.get(normalizzaNome(proposta.nomeRicetta));
      if (ricettaId === undefined || !giorni.has(proposta.data)) {
        ignorate++;
        continue;
      }

      const esistenti = await ctx.db
        .query("pastiPianificati")
        .withIndex("by_household_data", (q) =>
          q.eq("householdId", householdId).eq("data", proposta.data)
        )
        .collect();
      const slot = esistenti.find((p) => p.tipoPasto === proposta.tipoPasto);

      if (slot === undefined) {
        await ctx.db.insert("pastiPianificati", {
          householdId,
          data: proposta.data,
          tipoPasto: proposta.tipoPasto,
          stato: "pianificato",
          commensali: commensaliDefault,
          ricettaId,
          avanzo: proposta.avanzo,
        });
        assegnati++;
        continue;
      }

      // Gli slot "fuori" e quelli già pianificati non si toccano senza permesso.
      if (slot.stato === "fuori") {
        ignorate++;
        continue;
      }
      if (slot.ricettaId !== undefined && !args.sovrascrivi) {
        ignorate++;
        continue;
      }

      await ctx.db.patch(slot._id, {
        ricettaId,
        stato: "pianificato",
        avanzo: proposta.avanzo,
      });
      assegnati++;
    }

    return { assegnati, ignorate };
  },
});

/**
 * Contesto per proporre ricette nuove: cosa c'è già in catalogo (per non
 * ripetersi), quali nomi di ingrediente sono in uso (per restare coerenti) e
 * soprattutto cosa hai in casa che nessuna ricetta usa.
 */
export const perRicetteAI = query({
  args: { oggi: v.string() },
  handler: async (ctx, args) => {
    const householdId = await richiediHousehold(ctx);
    const household = await ctx.db.get(householdId);

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

    const ingredientiUsati = new Set<string>();
    for (const r of ricette) {
      for (const i of r.ingredienti) ingredientiUsati.add(normalizzaNome(i.nome));
    }

    return {
      mese: meseDiIso(args.oggi),
      preferenze: household?.preferenze ?? null,
      nomiInCatalogo: ricette.map((r) => r.nome),
      ingredientiUsati: [...ingredientiUsati].sort((a, b) => a.localeCompare(b, "it")),
      dispensaNonUsata: prodotti
        .filter(
          (p) =>
            !nomiProdotto(p).some((n) => ingredientiUsati.has(n))
        )
        .map((p) => ({
          nome: p.nome,
          quantita: formattaScortaTesto(p),
          scadenza: p.dataScadenza ?? null,
        })),
    };
  },
});
