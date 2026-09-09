export const GIORNI_SETTIMANA = [
  "lunedì",
  "martedì",
  "mercoledì",
  "giovedì",
  "venerdì",
  "sabato",
  "domenica",
];

export const MESI = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
];

/** Data di oggi come "YYYY-MM-DD" nel fuso locale. */
export function oggiIso(): string {
  const ora = new Date();
  const locale = new Date(ora.getTime() - ora.getTimezoneOffset() * 60000);
  return locale.toISOString().slice(0, 10);
}

/** "YYYY-MM-DD" spostata di `giorni`. */
export function isoPiuGiorni(iso: string, giorni: number): string {
  const base = new Date(`${iso}T00:00:00.000Z`);
  base.setUTCDate(base.getUTCDate() + giorni);
  return base.toISOString().slice(0, 10);
}

/** Il lunedì della settimana che contiene `iso`. */
export function lunediDi(iso: string): string {
  const data = new Date(`${iso}T00:00:00.000Z`);
  const giorno = data.getUTCDay(); // 0 = domenica
  const offset = giorno === 0 ? -6 : 1 - giorno;
  return isoPiuGiorni(iso, offset);
}

/** Giorni interi tra oggi e una data ISO (negativo = già passata). */
export function giorniDaOggi(iso: string): number {
  const a = new Date(`${oggiIso()}T00:00:00.000Z`).getTime();
  const b = new Date(`${iso}T00:00:00.000Z`).getTime();
  return Math.round((b - a) / 86400000);
}

/** Nome del mese italiano di una data ISO. */
export function meseDiIso(iso: string): string {
  return MESI[Number(iso.slice(5, 7)) - 1] ?? "gennaio";
}

/** "lun 14 set" — etichetta compatta per il pianificatore. */
export function etichettaGiorno(iso: string): string {
  const data = new Date(`${iso}T00:00:00.000Z`);
  const indice = (data.getUTCDay() + 6) % 7;
  const giorno = GIORNI_SETTIMANA[indice].slice(0, 3);
  const mese = MESI[data.getUTCMonth()].slice(0, 3);
  return `${giorno} ${data.getUTCDate()} ${mese}`;
}

/** "14 set" — etichetta minima per le scadenze. */
export function etichettaData(iso: string): string {
  const data = new Date(`${iso}T00:00:00.000Z`);
  return `${data.getUTCDate()} ${MESI[data.getUTCMonth()].slice(0, 3)}`;
}
