// Calendario indicativo della stagionalità delle verdure in Italia.
// Pensato come dato statico di partenza: puoi affinarlo o personalizzarlo
// in base a quello che trovi davvero al mercato/negozio vicino a te.

export const verdureStagionali: Record<string, string[]> = {
  gennaio: ["cavolo nero", "verza", "radicchio", "finocchi", "broccoli", "carote", "porri", "spinaci"],
  febbraio: ["cavolo nero", "verza", "radicchio", "finocchi", "broccoli", "carciofi", "carote", "porri"],
  marzo: ["carciofi", "asparagi", "spinaci", "piselli", "cipollotti", "radicchio", "finocchi"],
  aprile: ["asparagi", "piselli", "fave", "carciofi", "cipollotti", "insalate primaverili"],
  maggio: ["fave", "piselli", "zucchine", "asparagi", "insalate", "ravanelli"],
  giugno: ["zucchine", "melanzane", "pomodori", "fagiolini", "peperoni", "cetrioli", "insalate"],
  luglio: ["pomodori", "melanzane", "peperoni", "zucchine", "fagiolini", "cetrioli", "basilico"],
  agosto: ["pomodori", "melanzane", "peperoni", "zucchine", "fagiolini", "mais"],
  settembre: ["zucca", "melanzane", "peperoni", "pomodori", "funghi", "ultime zucchine"],
  ottobre: ["zucca", "funghi", "cavolfiori", "broccoli", "radicchio", "carote", "porri"],
  novembre: ["cavoli", "verza", "radicchio", "broccoli", "zucca", "carciofi", "finocchi"],
  dicembre: ["cavolo nero", "verza", "radicchio", "finocchi", "broccoli", "carciofi", "carote"],
};
