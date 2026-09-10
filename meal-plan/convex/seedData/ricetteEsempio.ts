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
  tempoMinuti: number;
  preparazione: string[];
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
    tempoMinuti: 30,
    preparazione: [
      "Rosola cipolla e pancetta, poi aggiungi la zucca a cubetti e falla ammorbidire.",
      "Cuoci la pasta, scolala al dente e saltala con il condimento.",
      "Completa con il parmigiano e servi.",
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
    tempoMinuti: 35,
    preparazione: [
      "Cuoci i funghi in padella con una noce di burro.",
      "Tosta il riso e portalo a cottura aggiungendo il brodo poco alla volta.",
      "Unisci i funghi e manteca con burro e parmigiano.",
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
    tempoMinuti: 20,
    preparazione: [
      "Rosola l’aglio, aggiungi i pomodori e cuoci il sugo per 10 minuti.",
      "Cuoci la pasta e saltala nel sugo.",
      "Aggiungi il basilico prima di servire.",
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
    tempoMinuti: 60,
    preparazione: [
      "Affetta e cuoci le melanzane finché sono morbide.",
      "Alterna in teglia melanzane, passata, mozzarella e parmigiano.",
      "Cuoci in forno a 190 °C per circa 30 minuti.",
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
    tempoMinuti: 50,
    preparazione: [
      "Taglia le patate sottili e sistemale in teglia con olio e rosmarino.",
      "Aggiungi le orate condite con limone.",
      "Cuoci in forno a 190 °C per 30–35 minuti.",
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
    tempoMinuti: 30,
    preparazione: [
      "Taglia pollo e carote a pezzi e rosolali in padella.",
      "Aggiungi succo di limone e poca acqua.",
      "Copri e cuoci finché pollo e carote sono teneri.",
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
    tempoMinuti: 35,
    preparazione: [
      "Cuoci broccoli, patate e cipolla in acqua salata finché sono teneri.",
      "Frulla fino a ottenere una crema liscia.",
      "Servi con il pane tostato.",
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
    tempoMinuti: 25,
    preparazione: [
      "Cuoci le zucchine a rondelle in padella.",
      "Sbatti le uova con il parmigiano e versale sulle zucchine.",
      "Cuoci la frittata da entrambi i lati e servi con il pane.",
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
    tempoMinuti: 30,
    preparazione: [
      "Taglia le patate a cubetti e lessale con i fagiolini.",
      "Aggiungi la pasta nella stessa pentola e portala a cottura.",
      "Scola e condisci con olio e parmigiano.",
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
    tempoMinuti: 35,
    preparazione: [
      "Affetta i finocchi e disponili in una teglia.",
      "Adagia sopra il salmone e condisci con il limone.",
      "Cuoci in forno a 190 °C per circa 20 minuti.",
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
    tempoMinuti: 40,
    preparazione: [
      "Pulisci e affetta i carciofi, poi falli stufare in padella.",
      "Tosta il riso e cuocilo aggiungendo il brodo poco alla volta.",
      "Unisci i carciofi e manteca con il parmigiano.",
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
    tempoMinuti: 50,
    preparazione: [
      "Impasta la carne con pane ammollato nel latte e forma le polpette.",
      "Rosolale, aggiungi la passata e cuoci per circa 25 minuti.",
      "Lessa le patate, schiacciale e servi il purè con le polpette.",
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
    tempoMinuti: 25,
    preparazione: [
      "Fai aprire le vongole in padella con l’aglio e filtra il loro liquido.",
      "Cuoci gli spaghetti e scolali al dente.",
      "Saltali con le vongole, il loro fondo e il prezzemolo.",
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
    tempoMinuti: 40,
    preparazione: [
      "Rosola la pancetta, poi aggiungi la verza affettata.",
      "Versa il brodo e cuoci per 15 minuti.",
      "Aggiungi il riso e prosegui fino a cottura.",
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
    tempoMinuti: 5,
    preparazione: ["Metti lo yogurt in una ciotola e completa con frutta e miele."],
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
    tempoMinuti: 5,
    preparazione: ["Tosta il pane, spalma il burro e completa con la marmellata."],
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
    tempoMinuti: 2,
    preparazione: ["Versa il latte in una ciotola e aggiungi i cereali."],
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
    tempoMinuti: 10,
    preparazione: [
      "Sciogli il burro in padella e versa le uova sbattute.",
      "Mescola a fuoco dolce fino alla consistenza desiderata e servi con il pane.",
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
    tempoMinuti: 5,
    preparazione: ["Metti la ricotta in una ciotola e completa con miele e noci."],
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
    tempoMinuti: 5,
    preparazione: [
      "Prepara il caffè e uniscilo al latte caldo.",
      "Spalma la marmellata sulle fette biscottate e servi insieme al caffellatte.",
    ],
  },
];
