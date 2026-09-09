// Catalogo di partenza: piatti semplici di casa, con quantità per 2 porzioni.
// I nomi degli ingredienti sono volutamente quelli che scriveresti in frigo,
// così la lista della spesa riesce a scalarli via quando ce li hai già.

export type RicettaEsempio = {
  nome: string;
  tags: string[];
  porzioni: number;
  stagioni: string[]; // vuoto = tutto l'anno
  pastiAdatti: ("colazione" | "pranzo" | "cena")[];
  ingredienti: { nome: string; quantita?: number; unita?: string }[];
};

const PRANZO_CENA: ("colazione" | "pranzo" | "cena")[] = ["pranzo", "cena"];
const COLAZIONE: ("colazione" | "pranzo" | "cena")[] = ["colazione"];

export const ricetteEsempio: RicettaEsempio[] = [
  {
    nome: "Pasta con la zucca e pancetta",
    tags: ["veloce", "autunno"],
    porzioni: 2,
    pastiAdatti: PRANZO_CENA,
    stagioni: ["settembre", "ottobre", "novembre"],
    ingredienti: [
      { nome: "pasta", quantita: 160, unita: "g" },
      { nome: "zucca", quantita: 400, unita: "g" },
      { nome: "pancetta", quantita: 80, unita: "g" },
      { nome: "cipolla", quantita: 1, unita: "pz" },
      { nome: "parmigiano", quantita: 30, unita: "g" },
    ],
  },
  {
    nome: "Risotto ai funghi",
    tags: ["autunno"],
    porzioni: 2,
    pastiAdatti: PRANZO_CENA,
    stagioni: ["settembre", "ottobre", "novembre"],
    ingredienti: [
      { nome: "riso", quantita: 160, unita: "g" },
      { nome: "funghi", quantita: 250, unita: "g" },
      { nome: "brodo", quantita: 700, unita: "ml" },
      { nome: "burro", quantita: 20, unita: "g" },
      { nome: "parmigiano", quantita: 30, unita: "g" },
    ],
  },
  {
    nome: "Pasta al pomodoro e basilico",
    tags: ["veloce", "vegetariano"],
    porzioni: 2,
    pastiAdatti: PRANZO_CENA,
    stagioni: ["giugno", "luglio", "agosto"],
    ingredienti: [
      { nome: "pasta", quantita: 160, unita: "g" },
      { nome: "pomodori", quantita: 400, unita: "g" },
      { nome: "basilico", quantita: 10, unita: "g" },
      { nome: "aglio", quantita: 1, unita: "pz" },
    ],
  },
  {
    nome: "Melanzane alla parmigiana",
    tags: ["vegetariano", "forno"],
    porzioni: 2,
    pastiAdatti: PRANZO_CENA,
    stagioni: ["giugno", "luglio", "agosto", "settembre"],
    ingredienti: [
      { nome: "melanzane", quantita: 600, unita: "g" },
      { nome: "passata di pomodoro", quantita: 400, unita: "g" },
      { nome: "mozzarella", quantita: 200, unita: "g" },
      { nome: "parmigiano", quantita: 50, unita: "g" },
    ],
  },
  {
    nome: "Orata al forno con patate",
    tags: ["pesce", "forno"],
    porzioni: 2,
    pastiAdatti: PRANZO_CENA,
    stagioni: [],
    ingredienti: [
      { nome: "orata", quantita: 2, unita: "pz" },
      { nome: "patate", quantita: 500, unita: "g" },
      { nome: "limone", quantita: 1, unita: "pz" },
      { nome: "rosmarino" },
    ],
  },
  {
    nome: "Pollo al limone con carote",
    tags: ["veloce", "carne"],
    porzioni: 2,
    pastiAdatti: PRANZO_CENA,
    stagioni: [],
    ingredienti: [
      { nome: "petto di pollo", quantita: 400, unita: "g" },
      { nome: "carote", quantita: 300, unita: "g" },
      { nome: "limone", quantita: 1, unita: "pz" },
    ],
  },
  {
    nome: "Vellutata di broccoli e patate",
    tags: ["vegetariano", "leggero"],
    porzioni: 2,
    pastiAdatti: PRANZO_CENA,
    stagioni: ["ottobre", "novembre", "dicembre", "gennaio", "febbraio", "marzo"],
    ingredienti: [
      { nome: "broccoli", quantita: 400, unita: "g" },
      { nome: "patate", quantita: 300, unita: "g" },
      { nome: "cipolla", quantita: 1, unita: "pz" },
      { nome: "pane", quantita: 100, unita: "g" },
    ],
  },
  {
    nome: "Frittata con zucchine",
    tags: ["veloce", "vegetariano"],
    porzioni: 2,
    pastiAdatti: PRANZO_CENA,
    stagioni: ["maggio", "giugno", "luglio", "agosto", "settembre"],
    ingredienti: [
      { nome: "uova", quantita: 4, unita: "pz" },
      { nome: "zucchine", quantita: 300, unita: "g" },
      { nome: "parmigiano", quantita: 30, unita: "g" },
      { nome: "pane", quantita: 100, unita: "g" },
    ],
  },
  {
    nome: "Pasta con fagiolini e patate",
    tags: ["vegetariano"],
    porzioni: 2,
    pastiAdatti: PRANZO_CENA,
    stagioni: ["giugno", "luglio", "agosto"],
    ingredienti: [
      { nome: "pasta", quantita: 160, unita: "g" },
      { nome: "fagiolini", quantita: 250, unita: "g" },
      { nome: "patate", quantita: 200, unita: "g" },
      { nome: "parmigiano", quantita: 30, unita: "g" },
    ],
  },
  {
    nome: "Salmone al forno con finocchi",
    tags: ["pesce", "forno"],
    porzioni: 2,
    pastiAdatti: PRANZO_CENA,
    stagioni: ["novembre", "dicembre", "gennaio", "febbraio", "marzo"],
    ingredienti: [
      { nome: "salmone", quantita: 300, unita: "g" },
      { nome: "finocchi", quantita: 400, unita: "g" },
      { nome: "limone", quantita: 1, unita: "pz" },
    ],
  },
  {
    nome: "Risotto ai carciofi",
    tags: ["vegetariano", "primavera"],
    porzioni: 2,
    pastiAdatti: PRANZO_CENA,
    stagioni: ["febbraio", "marzo", "aprile"],
    ingredienti: [
      { nome: "riso", quantita: 160, unita: "g" },
      { nome: "carciofi", quantita: 4, unita: "pz" },
      { nome: "brodo", quantita: 700, unita: "ml" },
      { nome: "parmigiano", quantita: 30, unita: "g" },
    ],
  },
  {
    nome: "Polpette al sugo con purè",
    tags: ["carne", "comfort"],
    porzioni: 2,
    pastiAdatti: PRANZO_CENA,
    stagioni: [],
    ingredienti: [
      { nome: "carne macinata", quantita: 400, unita: "g" },
      { nome: "pane", quantita: 60, unita: "g" },
      { nome: "latte", quantita: 100, unita: "ml" },
      { nome: "passata di pomodoro", quantita: 400, unita: "g" },
      { nome: "patate", quantita: 500, unita: "g" },
    ],
  },
  {
    nome: "Spaghetti alle vongole",
    tags: ["pesce", "veloce"],
    porzioni: 2,
    pastiAdatti: PRANZO_CENA,
    stagioni: [],
    ingredienti: [
      { nome: "spaghetti", quantita: 160, unita: "g" },
      { nome: "vongole", quantita: 500, unita: "g" },
      { nome: "aglio", quantita: 1, unita: "pz" },
      { nome: "prezzemolo" },
    ],
  },
  {
    nome: "Zuppa di verza, riso e pancetta",
    tags: ["inverno", "comfort"],
    porzioni: 2,
    pastiAdatti: PRANZO_CENA,
    stagioni: ["novembre", "dicembre", "gennaio", "febbraio"],
    ingredienti: [
      { nome: "verza", quantita: 400, unita: "g" },
      { nome: "riso", quantita: 120, unita: "g" },
      { nome: "pancetta", quantita: 80, unita: "g" },
      { nome: "brodo", quantita: 600, unita: "ml" },
    ],
  },

  // --- Colazioni -----------------------------------------------------------
  {
    nome: "Yogurt con frutta e miele",
    tags: ["veloce"],
    porzioni: 1,
    pastiAdatti: COLAZIONE,
    stagioni: [],
    ingredienti: [
      { nome: "yogurt bianco", quantita: 150, unita: "g" },
      { nome: "frutta fresca", quantita: 120, unita: "g" },
      { nome: "miele", quantita: 10, unita: "g" },
    ],
  },
  {
    nome: "Pane, burro e marmellata",
    tags: ["veloce"],
    porzioni: 1,
    pastiAdatti: COLAZIONE,
    stagioni: [],
    ingredienti: [
      { nome: "pane", quantita: 60, unita: "g" },
      { nome: "burro", quantita: 10, unita: "g" },
      { nome: "marmellata", quantita: 20, unita: "g" },
    ],
  },
  {
    nome: "Latte e cereali",
    tags: ["veloce"],
    porzioni: 1,
    pastiAdatti: COLAZIONE,
    stagioni: [],
    ingredienti: [
      { nome: "latte", quantita: 200, unita: "ml" },
      { nome: "cereali", quantita: 50, unita: "g" },
    ],
  },
  {
    nome: "Uova strapazzate e pane",
    tags: ["proteica"],
    porzioni: 1,
    pastiAdatti: COLAZIONE,
    stagioni: [],
    ingredienti: [
      { nome: "uova", quantita: 2, unita: "pz" },
      { nome: "pane", quantita: 60, unita: "g" },
      { nome: "burro", quantita: 5, unita: "g" },
    ],
  },
  {
    nome: "Ricotta, miele e noci",
    tags: ["proteica", "veloce"],
    porzioni: 1,
    pastiAdatti: COLAZIONE,
    stagioni: [],
    ingredienti: [
      { nome: "ricotta", quantita: 100, unita: "g" },
      { nome: "miele", quantita: 10, unita: "g" },
      { nome: "noci", quantita: 20, unita: "g" },
    ],
  },
  {
    nome: "Fette biscottate e caffellatte",
    tags: ["veloce"],
    porzioni: 1,
    pastiAdatti: COLAZIONE,
    stagioni: [],
    ingredienti: [
      { nome: "fette biscottate", quantita: 40, unita: "g" },
      { nome: "marmellata", quantita: 20, unita: "g" },
      { nome: "latte", quantita: 200, unita: "ml" },
      { nome: "caffè", quantita: 1, unita: "pz" },
    ],
  },
];
