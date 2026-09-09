"use node";

import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";

/**
 * Propone ricette nuove da aggiungere al catalogo, partendo da quello che c'è
 * in dispensa e da come vi piace mangiare.
 *
 * Non salva niente: restituisce delle proposte che l'utente approva una per
 * una. Il catalogo è il cuore dei dati — spesa, stagionalità, generatore
 * dipendono da lì — e riempirlo senza guardare sarebbe il modo più rapido di
 * renderlo inservibile.
 */

const MODELLO_DEFAULT = "claude-opus-5";

const PREZZI: Record<string, { input: number; output: number }> = {
  "claude-opus-5": { input: 5, output: 25 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

const schemaRisposta = {
  type: "object",
  properties: {
    ricette: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nome: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          porzioni: { type: "integer" },
          pastiAdatti: {
            type: "array",
            items: { type: "string", enum: ["colazione", "pranzo", "cena"] },
          },
          stagioni: {
            type: "array",
            items: { type: "string" },
            description: "mesi in italiano minuscolo; vuoto = va bene tutto l'anno",
          },
          ingredienti: {
            type: "array",
            items: {
              type: "object",
              properties: {
                nome: { type: "string" },
                quantita: { type: "number" },
                unita: { type: "string", enum: ["g", "ml", "pz"] },
              },
              required: ["nome", "quantita", "unita"],
              additionalProperties: false,
            },
          },
          perche: {
            type: "string",
            description: "una riga sul perché proponi questa ricetta",
          },
        },
        required: [
          "nome",
          "tags",
          "porzioni",
          "pastiAdatti",
          "stagioni",
          "ingredienti",
          "perche",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["ricette"],
  additionalProperties: false,
} as const;

export type RicettaProposta = {
  nome: string;
  tags: string[];
  porzioni: number;
  pastiAdatti: ("colazione" | "pranzo" | "cena")[];
  stagioni: string[];
  ingredienti: { nome: string; quantita: number; unita: string }[];
  perche: string;
};

export const proponi = action({
  args: {
    oggi: v.string(),
    quante: v.optional(v.number()),
    richiesta: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ ricette: RicettaProposta[]; costoStimato: number | null }> => {
    const chiave = process.env.ANTHROPIC_API_KEY;
    if (chiave === undefined || chiave === "") {
      throw new Error(
        "Manca ANTHROPIC_API_KEY sul deployment: npx convex env set ANTHROPIC_API_KEY <chiave>"
      );
    }

    const contesto = await ctx.runQuery(api.menuContesto.perRicetteAI, {
      oggi: args.oggi,
    });

    const modello = process.env.ANTHROPIC_MODEL ?? MODELLO_DEFAULT;
    const client = new Anthropic({ apiKey: chiave });

    const response = await client.messages.parse({
      model: modello,
      max_tokens: 16000,
      system:
        "Proponi ricette di casa italiane, semplici e realistiche. Rispondi in italiano. " +
        "Le quantità sono per il numero di porzioni che indichi, e devono essere numeri " +
        "sensati per un adulto. Usa nomi di ingredienti comuni e coerenti con quelli " +
        "già usati nel catalogo esistente, così la lista della spesa li riconosce.",
      messages: [
        {
          role: "user",
          content: costruisciPrompt(contesto, args.quante ?? 5, args.richiesta ?? null),
        },
      ],
      output_config: { format: { type: "json_schema", schema: schemaRisposta } },
    });

    const risposta = response.parsed_output as { ricette: RicettaProposta[] } | null;
    if (risposta === null) {
      throw new Error("Claude non ha restituito ricette leggibili.");
    }

    const prezzo = PREZZI[modello];
    const costoStimato =
      prezzo === undefined
        ? null
        : (response.usage.input_tokens * prezzo.input +
            response.usage.output_tokens * prezzo.output) /
          1_000_000;

    return { ricette: risposta.ricette, costoStimato };
  },
});

type ContestoRicette = {
  mese: string;
  preferenze: string | null;
  nomiInCatalogo: string[];
  ingredientiUsati: string[];
  dispensaNonUsata: { nome: string; quantita: string; scadenza: string | null }[];
};

function costruisciPrompt(
  c: ContestoRicette,
  quante: number,
  richiesta: string | null
): string {
  const righe: string[] = [];

  righe.push(`Proponi ${String(quante)} ricette nuove per il catalogo di casa.`);
  righe.push(`Siamo a ${c.mese}.`);

  if (richiesta !== null && richiesta.trim() !== "") {
    righe.push("");
    righe.push("## Cosa è stato chiesto");
    righe.push(richiesta.trim());
  }

  righe.push("");
  righe.push("## Già in catalogo (non riproporle)");
  righe.push(c.nomiInCatalogo.join("; ") || "(catalogo vuoto)");

  righe.push("");
  righe.push("## Roba in casa che nessuna ricetta usa");
  if (c.dispensaNonUsata.length === 0) {
    righe.push("(niente: il catalogo copre già tutta la dispensa)");
  } else {
    for (const p of c.dispensaNonUsata) {
      righe.push(
        `${p.nome}: ${p.quantita}${p.scadenza === null ? "" : ` — scade il ${p.scadenza}`}`
      );
    }
    righe.push("Dai la precedenza a ricette che usano questi.");
  }

  righe.push("");
  righe.push("## Nomi di ingredienti già in uso");
  righe.push(
    "Riusa questi nomi quando l'ingrediente è lo stesso, invece di inventarne varianti:"
  );
  righe.push(c.ingredientiUsati.join(", ") || "(nessuno)");

  if (c.preferenze !== null) {
    righe.push("");
    righe.push("## Preferenze di casa");
    righe.push(c.preferenze);
  }

  righe.push("");
  righe.push("## Regole");
  righe.push(
    [
      "- Piatti di casa, non da ristorante: pochi passaggi e ingredienti da supermercato.",
      "- Niente tofu, seitan o sostituti della carne.",
      "- Indica le stagioni solo se la ricetta ha davvero senso in certi mesi; altrimenti lascia vuoto.",
      "- Metti `pastiAdatti` coerente: una colazione non va a cena.",
      "- Le quantità devono essere numeriche e realistiche per le porzioni indicate.",
      "- Nel campo `perche` scrivi una riga concreta, ad esempio «usa la feta che non compare in nessuna ricetta».",
    ].join("\n")
  );

  return righe.join("\n");
}
