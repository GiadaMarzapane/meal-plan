// Inventario di partenza della dispensa, trascritto da un giro fra armadietti
// e frigo. Verdura e frutta hanno scadenza al 16/09/2026 ("fra una settimana"
// rispetto al giorno in cui è stato compilato); la bresaola non ce l'ha.
//
// Ricorda che il totale è pezzi × quantita: 3 kefir da 125 g sono
// { pezzi: 3, quantita: 125, unita: "g" }, cioè 375 g in tutto.

export type ProdottoIniziale = {
  nome: string;
  categoria: string;
  pezzi?: number;
  quantita?: number;
  unita?: string;
  generico?: string;
  dataScadenza?: string;
};

export const dispensaIniziale: ProdottoIniziale[] = [
  // --- Dispensa secca -------------------------------------------------------
  { nome: "riso basmati", categoria: "pasta e riso", quantita: 1000, unita: "g", generico: "riso" },
  { nome: "fusilli", categoria: "pasta e riso", quantita: 500, unita: "g", generico: "pasta" },
  { nome: "penne rigate", categoria: "pasta e riso", quantita: 500, unita: "g", generico: "pasta" },
  { nome: "farina", categoria: "dispensa", quantita: 700, unita: "g" },
  { nome: "pangrattato", categoria: "dispensa", quantita: 700, unita: "g" },

  // --- Frigo ----------------------------------------------------------------
  { nome: "mozzarella", categoria: "latticini", pezzi: 1, quantita: 125, unita: "g", dataScadenza: "2026-09-23" },
  { nome: "kefir", categoria: "latticini", pezzi: 3, quantita: 125, unita: "g", dataScadenza: "2026-09-26" },
  { nome: "feta", categoria: "latticini", pezzi: 1, quantita: 100, unita: "g", dataScadenza: "2027-04-26" },
  { nome: "bresaola", categoria: "salumi", quantita: 80, unita: "g" },

  // --- Verdura e frutta -----------------------------------------------------
  { nome: "zucchine", categoria: "verdura", quantita: 400, unita: "g", dataScadenza: "2026-09-16" }, // 2 da ~200 g
  { nome: "cetriolo", categoria: "verdura", quantita: 150, unita: "g", dataScadenza: "2026-09-16" }, // mezzo da ~300 g
  { nome: "pesche", categoria: "frutta", quantita: 300, unita: "g", generico: "frutta fresca", dataScadenza: "2026-09-16" }, // 2 da ~150 g
];
