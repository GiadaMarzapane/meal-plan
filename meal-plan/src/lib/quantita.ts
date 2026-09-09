/** Formatta un numero senza decimali inutili. */
export function formattaNumero(valore: number): string {
  const arrotondato = Math.round(valore * 100) / 100;
  return arrotondato.toLocaleString("it-IT");
}

/** Formatta una quantità con la sua unità: "400 g", "2", "pz". */
export function formattaQuantita(
  quantita: number | undefined,
  unita: string | undefined
): string {
  if (quantita === undefined) return unita ?? "";
  const numero = formattaNumero(quantita);
  return unita === undefined || unita === "" ? numero : `${numero} ${unita}`;
}

/**
 * Quanto ce n'è in tutto: pezzi × contenuto del singolo pezzo.
 * `undefined` quando non è indicato nulla, per distinguere "non lo so" da zero.
 */
export function scortaTotale(prodotto: {
  pezzi?: number;
  quantita?: number;
}): number | undefined {
  if (prodotto.pezzi === undefined && prodotto.quantita === undefined) {
    return undefined;
  }
  return (prodotto.pezzi ?? 1) * (prodotto.quantita ?? 1);
}

/**
 * Come si legge una scorta in dispensa:
 *   3 confezioni da 700 g  →  "3 × 700 g" (totale "2.100 g")
 *   6 uova                 →  "6 pz"
 *   1 kg di pasta sfusa    →  "1.000 g"
 */
export function formattaScorta(prodotto: {
  pezzi?: number;
  quantita?: number;
  unita?: string;
}): { principale: string; totale: string | null } {
  const { pezzi, quantita, unita } = prodotto;

  if (pezzi !== undefined && quantita !== undefined) {
    const totale = pezzi * quantita;
    return {
      principale: `${formattaNumero(pezzi)} × ${formattaQuantita(quantita, unita)}`,
      // Il totale è ridondante quando il pezzo è uno solo.
      totale: pezzi === 1 ? null : formattaQuantita(totale, unita),
    };
  }

  if (pezzi !== undefined) {
    return { principale: formattaQuantita(pezzi, unita ?? "pz"), totale: null };
  }

  return { principale: formattaQuantita(quantita, unita), totale: null };
}
