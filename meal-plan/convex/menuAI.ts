"use node";

import Anthropic from "@anthropic-ai/sdk";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { action } from "./_generated/server";

/**
 * Fase 2 del generatore: invece di scegliere slot per slot con delle regole,
 * dà a Claude l'intera settimana e lo lascia ragionare sugli incastri — la
 * mozzarella che scade giovedì, il pacco di pasta da finire, il piatto pesante
 * che non conviene mettere due sere di fila.
 *
 * Il generatore rule-based resta il default: questo è un extra a consumo, e se
 * la chiave manca o l'API sbaglia l'app continua a funzionare senza.
 */

const MODELLO_DEFAULT = "claude-opus-5";

/** Prezzi in dollari per milione di token, per stimare il costo di ogni giro. */
const PREZZI: Record<string, { input: number; output: number }> = {
  "claude-opus-5": { input: 5, output: 25 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-4-5": { input: 1, output: 5 },
};

const schemaRisposta = {
  type: "object",
  properties: {
    assegnazioni: {
      type: "array",
      items: {
        type: "object",
        properties: {
          data: { type: "string", description: "data ISO YYYY-MM-DD" },
          tipoPasto: { type: "string", enum: ["colazione", "pranzo", "cena"] },
          nomeRicetta: {
            type: "string",
            description: "nome esatto di una ricetta del catalogo",
          },
          avanzo: {
            type: "boolean",
            description:
              "true se in questo pasto si mangia l'avanzo di una cottura " +
              "precedente della stessa ricetta, invece di cucinarla di nuovo",
          },
          motivo: {
            type: "string",
            description: "una riga sul perché di questa scelta",
          },
        },
        required: ["data", "tipoPasto", "nomeRicetta", "avanzo", "motivo"],
        additionalProperties: false,
      },
    },
    note: {
      type: "string",
      description: "osservazioni sulla settimana nel suo insieme, in italiano",
    },
  },
  required: ["assegnazioni", "note"],
  additionalProperties: false,
} as const;

type Risposta = {
  assegnazioni: {
    data: string;
    tipoPasto: "colazione" | "pranzo" | "cena";
    nomeRicetta: string;
    avanzo: boolean;
    motivo: string;
  }[];
  note: string;
};

export const generaSettimana = action({
  args: {
    oggi: v.string(),
    dataInizio: v.string(),
    sovrascrivi: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<{
    assegnati: number;
    ignorate: number;
    note: string;
    costoStimato: number | null;
    errore: string | null;
  }> => {
    const chiave = process.env.ANTHROPIC_API_KEY;
    if (chiave === undefined || chiave === "") {
      throw new Error(
        "Manca ANTHROPIC_API_KEY sul deployment: npx convex env set ANTHROPIC_API_KEY <chiave>"
      );
    }

    const contesto = await ctx.runQuery(api.menuContesto.perAI, {
      oggi: args.oggi,
      dataInizio: args.dataInizio,
      sovrascrivi: args.sovrascrivi ?? false,
    });

    if (contesto.ricette.length === 0) {
      return {
        assegnati: 0,
        ignorate: 0,
        note: "Nessuna ricetta in catalogo.",
        costoStimato: null,
        errore: null,
      };
    }
    if (contesto.slotDaRiempire.length === 0) {
      return {
        assegnati: 0,
        ignorate: 0,
        note: "Non c'è niente da pianificare in questa settimana.",
        costoStimato: null,
        errore: null,
      };
    }

    const modello = process.env.ANTHROPIC_MODEL ?? MODELLO_DEFAULT;
    const client = new Anthropic({ apiKey: chiave });

    const response = await client.messages.parse({
      model: modello,
      max_tokens: 16000,
      system:
        "Pianifichi i pasti di una casa italiana. Rispondi sempre in italiano. " +
        "Usa SOLO ricette presenti nel catalogo che ti viene dato, citandone il nome esatto. " +
        "Assegna una ricetta a ciascuno slot richiesto, senza inventarne di nuovi.",
      messages: [{ role: "user", content: costruisciPrompt(contesto) }],
      output_config: { format: { type: "json_schema", schema: schemaRisposta } },
    });

    const risposta = response.parsed_output as Risposta | null;
    if (risposta === null) {
      throw new Error("Claude non ha restituito un piano leggibile.");
    }

    const esito = await ctx.runMutation(internal.menuContesto.applica, {
      dataInizio: args.dataInizio,
      sovrascrivi: args.sovrascrivi ?? false,
      assegnazioni: risposta.assegnazioni,
    });

    const prezzo = PREZZI[modello];
    const costoStimato =
      prezzo === undefined
        ? null
        : (response.usage.input_tokens * prezzo.input +
            response.usage.output_tokens * prezzo.output) /
          1_000_000;

    return {
      assegnati: esito.assegnati,
      ignorate: esito.ignorate,
      note: risposta.note,
      costoStimato,
      errore: null,
    };
  },
});

type Contesto = {
  oggi: string;
  inizioSettimana: string;
  preferenze: string | null;
  obiettivi: {
    nome: string;
    kcal: number | null;
    proteine: number | null;
    carboidrati: number | null;
    grassi: number | null;
  }[];
  ricette: {
    nome: string;
    porzioni: number;
    tags: string[];
    stagioni: string[];
    pastiAdatti: string[];
    ingredienti: string;
  }[];
  dispensa: { nome: string; quantita: string; scadenza: string | null }[];
  storico: { nome: string; dataUsata: string }[];
  slotDaRiempire: {
    data: string;
    tipoPasto: string;
    commensali: string;
    giaPianificato: string | null;
  }[];
};

function costruisciPrompt(c: Contesto): string {
  const righe: string[] = [];

  // Distinguere le due date conta: un prodotto può essere buono oggi e scaduto
  // quando arriva la settimana che si sta pianificando.
  righe.push(`Oggi è il ${c.oggi}.`);
  righe.push(
    `La settimana da pianificare comincia il ${c.inizioSettimana}: valuta le ` +
      "scadenze rispetto al giorno in cui quel pasto verrà cucinato, non rispetto a oggi."
  );
  righe.push("");
  righe.push("## Catalogo ricette");
  righe.push(
    "nome | porzioni | mesi di stagione (vuoto = sempre) | pasti adatti | ingredienti"
  );
  for (const r of c.ricette) {
    righe.push(
      `${r.nome} | per ${String(r.porzioni)} | ${r.stagioni.join(",") || "sempre"} | ${r.pastiAdatti.join(",") || "tutti"} | ${r.ingredienti}`
    );
  }

  righe.push("");
  righe.push("## Cosa c'è già in casa");
  if (c.dispensa.length === 0) {
    righe.push("(niente)");
  } else {
    for (const p of c.dispensa) {
      righe.push(
        `${p.nome}: ${p.quantita}${p.scadenza === null ? "" : ` — scade il ${p.scadenza}`}`
      );
    }
  }

  righe.push("");
  righe.push("## Cucinato di recente (da non ripetere subito)");
  righe.push(
    c.storico.length === 0
      ? "(niente)"
      : c.storico.map((s) => `${s.nome} il ${s.dataUsata}`).join("; ")
  );

  righe.push("");
  righe.push("## Slot da riempire");
  for (const s of c.slotDaRiempire) {
    righe.push(
      `${s.data} ${s.tipoPasto} — commensali: ${s.commensali}` +
        (s.giaPianificato === null ? "" : ` (ora c'è: ${s.giaPianificato})`)
    );
  }

  if (c.obiettivi.length > 0) {
    righe.push("");
    righe.push("## Chi segue una dieta (obiettivi giornalieri)");
    for (const o of c.obiettivi) {
      const parti = [
        o.kcal === null ? null : `${String(o.kcal)} kcal`,
        o.proteine === null ? null : `${String(o.proteine)} g proteine`,
        o.carboidrati === null ? null : `${String(o.carboidrati)} g carboidrati`,
        o.grassi === null ? null : `${String(o.grassi)} g grassi`,
      ].filter((p) => p !== null);
      righe.push(`${o.nome}: ${parti.join(", ")}`);
    }
    righe.push(
      "Il catalogo non ha i valori nutrizionali, quindi non calcolarli: se puoi, " +
        "suggerisci nel `motivo` una grammatura indicativa (es. «per Davide 100 g " +
        "di pasta invece di 80»), dicendo che è una stima."
    );
  }

  righe.push("");
  righe.push("## Come sceglierle");
  righe.push(
    [
      "- Guarda la settimana nel suo insieme, non uno slot alla volta.",
      "- Consuma per primo quello che scade prima: è la ragione principale di questo lavoro.",
      "- Quando una confezione avanza, riusala in un altro pasto della settimana invece di sprecarla.",
      "- Rispetta la stagionalità e i pasti a cui ogni ricetta è adatta.",
      "- Varia: non ripetere lo stesso piatto a distanza ravvicinata, e alterna piatti pesanti e leggeri.",
      "- Se una ricetta non basta per tutti i commensali va bene lo stesso: si compra il resto.",
      "- Nel campo `motivo` scrivi una riga concreta, del tipo «finisce la mozzarella prima del 23».",
      "",
      "Sugli avanzi: puoi assegnare la stessa ricetta a due pasti vicini e marcare",
      "il secondo con `avanzo: true`. Vuol dire cucinarla una volta sola in quantità",
      "maggiore e mangiarne una parte dopo — tipicamente si cucina a cena e si porta",
      "l'avanzo a pranzo il giorno dopo. Usalo quando ha senso, non ovunque.",
    ].join("\n")
  );

  if (c.preferenze !== null) {
    righe.push("");
    righe.push("## Preferenze di casa");
    righe.push(
      "Queste le scrive chi cucina e vengono prima delle indicazioni generiche qui sopra:"
    );
    righe.push(c.preferenze);
  }

  return righe.join("\n");
}
