export type Macro = {
  kcal?: number;
  proteine?: number;
  carboidrati?: number;
  grassi?: number;
};

export type ChiaveMacro = "kcal" | "proteine" | "carboidrati" | "grassi";

export const CHIAVI_MACRO: { chiave: ChiaveMacro; breve: string; lungo: string }[] = [
  { chiave: "kcal", breve: "kcal", lungo: "Calorie (kcal)" },
  { chiave: "proteine", breve: "P", lungo: "Proteine (g)" },
  { chiave: "carboidrati", breve: "C", lungo: "Carboidrati (g)" },
  { chiave: "grassi", breve: "G", lungo: "Grassi (g)" },
];

/** True se almeno un valore è stato compilato. */
export function macroCompilato(macro: Macro | undefined): boolean {
  if (macro === undefined) return false;
  return CHIAVI_MACRO.some(({ chiave }) => macro[chiave] !== undefined);
}

type PastoConMacro = {
  commensali: { nome: string; porzioni: number }[];
  ricetta: { macro?: Macro } | null;
};

/**
 * Somma i macro di un commensale su un insieme di pasti, moltiplicando i
 * valori per porzione per le porzioni che mangia davvero.
 *
 * Un valore resta `undefined` se nessuna delle ricette lo ha compilato, così
 * la UI può distinguere "zero" da "non lo so".
 */
export function macroDelCommensale(pasti: PastoConMacro[], nome: string): Macro {
  const totale: Macro = {};
  for (const pasto of pasti) {
    const macro = pasto.ricetta?.macro;
    if (macro === undefined) continue;
    const quota = pasto.commensali.find((c) => c.nome === nome);
    if (quota === undefined) continue;

    for (const { chiave } of CHIAVI_MACRO) {
      const valore = macro[chiave];
      if (valore === undefined) continue;
      totale[chiave] = (totale[chiave] ?? 0) + valore * quota.porzioni;
    }
  }
  return totale;
}

/** Arrotonda per la lettura: kcal intere, macro con un decimale al massimo. */
export function arrotonda(valore: number): string {
  const arrotondato = Math.round(valore * 10) / 10;
  return Number.isInteger(arrotondato) ? String(arrotondato) : arrotondato.toFixed(1);
}

/** Quanto manca (o quanto si è sforato) rispetto all'obiettivo. */
export function scostamento(
  consumato: number | undefined,
  obiettivo: number | undefined
): "sotto" | "vicino" | "sopra" | "ignoto" {
  if (consumato === undefined || obiettivo === undefined || obiettivo === 0) {
    return "ignoto";
  }
  const rapporto = consumato / obiettivo;
  if (rapporto < 0.9) return "sotto";
  if (rapporto > 1.1) return "sopra";
  return "vicino";
}
