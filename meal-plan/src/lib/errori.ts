/** Estrae un messaggio leggibile dagli errori sollevati dalle mutation Convex. */
export function messaggioErrore(errore: unknown): string {
  if (errore instanceof Error) {
    // Convex antepone "[Request ID: ...] Server Error ... Uncaught Error: <msg>"
    const trovato = /Uncaught Error:\s*(.+?)(?:\n|$)/.exec(errore.message);
    return trovato?.[1] ?? errore.message;
  }
  return "Qualcosa è andato storto.";
}
