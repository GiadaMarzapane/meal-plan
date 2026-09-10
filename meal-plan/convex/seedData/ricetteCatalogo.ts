// Catalogo ricette generato dai file in ricette_nuove/, convertiti nello
// schema dell'app. Rispetto all'origine:
//   - tenuta solo la versione normocalorica delle quantità (per 1 persona);
//   - le stagioni ("estate", "tutto_anno") sono diventate elenchi di mesi,
//     con l'elenco vuoto a significare "tutto l'anno";
//   - 10 ricette con tofu, tempeh, cous cous o smoothie sono state riscritte
//     con legumi, uova e latticini, perché quegli ingredienti sono esclusi
//     dalle preferenze di casa;
//   - "q.b." resta senza numero invece di fingere una quantità.

export type RicettaCatalogo = {
  slug: string;
  nome: string;
  tags: string[];
  porzioni: number;
  pastiAdatti: ("colazione" | "pranzo" | "cena")[];
  stagioni: string[];
  ingredienti: { nome: string; quantita?: number; unita?: string }[];
  macro?: { kcal?: number };
  tempoMinuti?: number;
  preparazione: string[];
};

export const ricetteCatalogo: RicettaCatalogo[] = [
  {
    "slug": "porridge-avena-mele-cannella",
    "nome": "Porridge di avena con mele e cannella",
    "tags": [
      "veloce",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "colazione"
    ],
    "stagioni": [
      "gennaio",
      "febbraio",
      "settembre",
      "ottobre",
      "novembre",
      "dicembre"
    ],
    "ingredienti": [
      {
        "nome": "fiocchi di avena",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "bevanda vegetale",
        "quantita": 200,
        "unita": "ml"
      },
      {
        "nome": "mela",
        "quantita": 1,
        "unita": "pz"
      },
      {
        "nome": "cannella in polvere",
        "quantita": 1,
        "unita": "cucchiaino"
      }
    ],
    "macro": {
      "kcal": 340
    },
    "tempoMinuti": 10,
    "preparazione": [
      "Scalda la bevanda vegetale in un pentolino.",
      "Versa i fiocchi di avena e cuoci a fuoco basso 5 minuti mescolando.",
      "Aggiungi la mela a cubetti e la cannella, cuoci altri 2 minuti."
    ]
  },
  {
    "slug": "yogurt-greco-frutti-bosco-granola",
    "nome": "Yogurt greco con frutti di bosco e granola",
    "tags": [
      "velocissimo",
      "senza cottura",
      "vegetariano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "colazione"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "yogurt greco",
        "quantita": 200,
        "unita": "g"
      },
      {
        "nome": "frutti di bosco",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "granola",
        "quantita": 30,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 320
    },
    "tempoMinuti": 5,
    "preparazione": [
      "Componi lo yogurt in una ciotola.",
      "Aggiungi i frutti di bosco e la granola sopra."
    ]
  },
  {
    "slug": "yogurt-soia-frutti-bosco-granola",
    "nome": "Yogurt di soia con frutti di bosco e granola",
    "tags": [
      "velocissimo",
      "senza cottura",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "colazione"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "yogurt di soia bianco",
        "quantita": 200,
        "unita": "g"
      },
      {
        "nome": "frutti di bosco",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "granola",
        "quantita": 30,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 300
    },
    "tempoMinuti": 5,
    "preparazione": [
      "Componi lo yogurt in una ciotola.",
      "Aggiungi i frutti di bosco e la granola sopra."
    ]
  },
  {
    "slug": "toast-integrale-avocado-uovo",
    "nome": "Toast integrale con avocado e uovo in camicia",
    "tags": [
      "vegetariano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "colazione"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "pane integrale",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "avocado",
        "quantita": 0.5,
        "unita": "pz"
      },
      {
        "nome": "uovo",
        "quantita": 1,
        "unita": "pz"
      },
      {
        "nome": "succo di limone",
        "quantita": 1,
        "unita": "cucchiaino"
      }
    ],
    "macro": {
      "kcal": 380
    },
    "tempoMinuti": 12,
    "preparazione": [
      "Tosta il pane integrale.",
      "Schiaccia l'avocado con succo di limone, sale e pepe, spalmalo sul pane.",
      "Cuoci l'uovo in camicia e adagialo sopra."
    ]
  },
  {
    "slug": "toast-integrale-avocado-ricotta",
    "nome": "Toast integrale con avocado e ricotta",
    "tags": [
      "vegetariano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "colazione"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "pane integrale",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "avocado",
        "quantita": 0.5,
        "unita": "pz"
      },
      {
        "nome": "ricotta",
        "quantita": 80,
        "unita": "g"
      },
      {
        "nome": "succo di limone",
        "quantita": 1,
        "unita": "cucchiaino"
      }
    ],
    "macro": {
      "kcal": 360
    },
    "tempoMinuti": 5,
    "preparazione": [
      "Tosta il pane integrale.",
      "Schiaccia l'avocado con il succo di limone e spalmalo sul pane.",
      "Completa con la ricotta e una macinata di pepe."
    ]
  },
  {
    "slug": "pancake-proteici-banana-avena",
    "nome": "Pancake proteici con banana e avena",
    "tags": [
      "senza zuccheri aggiunti",
      "vegetariano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "colazione"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "fiocchi di avena",
        "quantita": 50,
        "unita": "g"
      },
      {
        "nome": "uovo",
        "quantita": 2,
        "unita": "pz"
      },
      {
        "nome": "banana",
        "quantita": 1,
        "unita": "pz"
      },
      {
        "nome": "lievito per dolci",
        "quantita": 1,
        "unita": "cucchiaino"
      }
    ],
    "macro": {
      "kcal": 400
    },
    "tempoMinuti": 15,
    "preparazione": [
      "Frulla avena, uova, banana e lievito fino a ottenere una pastella.",
      "Cuoci piccole porzioni in padella antiaderente, 2 minuti per lato."
    ]
  },
  {
    "slug": "pancake-vegan-banana-avena",
    "nome": "Pancake vegani con banana e avena",
    "tags": [
      "senza zuccheri aggiunti",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "colazione"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "fiocchi di avena",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "banana",
        "quantita": 1,
        "unita": "pz"
      },
      {
        "nome": "bevanda vegetale",
        "quantita": 80,
        "unita": "ml"
      },
      {
        "nome": "lievito per dolci",
        "quantita": 1,
        "unita": "cucchiaino"
      }
    ],
    "macro": {
      "kcal": 370
    },
    "tempoMinuti": 15,
    "preparazione": [
      "Frulla avena, banana, bevanda vegetale e lievito fino a ottenere una pastella.",
      "Cuoci piccole porzioni in padella antiaderente, 2 minuti per lato."
    ]
  },
  {
    "slug": "porridge-grano-saraceno-pere-noci",
    "nome": "Porridge di grano saraceno con pere e noci",
    "tags": [
      "senza glutine",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "colazione"
    ],
    "stagioni": [
      "gennaio",
      "febbraio",
      "settembre",
      "ottobre",
      "novembre",
      "dicembre"
    ],
    "ingredienti": [
      {
        "nome": "fiocchi di grano saraceno",
        "quantita": 50,
        "unita": "g"
      },
      {
        "nome": "bevanda vegetale",
        "quantita": 200,
        "unita": "ml"
      },
      {
        "nome": "pera",
        "quantita": 1,
        "unita": "pz"
      },
      {
        "nome": "noci",
        "quantita": 15,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 360
    },
    "tempoMinuti": 12,
    "preparazione": [
      "Cuoci i fiocchi di grano saraceno nella bevanda vegetale a fuoco basso per 5 minuti.",
      "Aggiungi la pera a cubetti e le noci spezzettate."
    ]
  },
  {
    "slug": "ciotola-yogurt-mango-ananas-chia",
    "nome": "Ciotola di yogurt con mango, ananas e semi di chia",
    "tags": [
      "senza cottura",
      "senza glutine",
      "vegetariano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "colazione"
    ],
    "stagioni": [
      "marzo",
      "aprile",
      "maggio",
      "giugno",
      "luglio",
      "agosto"
    ],
    "ingredienti": [
      {
        "nome": "yogurt bianco",
        "quantita": 150,
        "unita": "g"
      },
      {
        "nome": "mango",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "ananas",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "semi di chia",
        "quantita": 15,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 300
    },
    "tempoMinuti": 5,
    "preparazione": [
      "Versa lo yogurt in una ciotola.",
      "Taglia mango e ananas a cubetti e disponili sopra.",
      "Completa con i semi di chia."
    ]
  },
  {
    "slug": "uova-strapazzate-spinaci-pane-integrale",
    "nome": "Uova strapazzate con spinaci e pane integrale",
    "tags": [
      "vegetariano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "colazione"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "uovo",
        "quantita": 2,
        "unita": "pz"
      },
      {
        "nome": "spinaci freschi",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "pane integrale",
        "quantita": 50,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 350
    },
    "tempoMinuti": 10,
    "preparazione": [
      "Salta gli spinaci in padella con un filo d'olio finché appassiscono.",
      "Aggiungi le uova sbattute e strapazza a fuoco medio-basso.",
      "Servi con il pane integrale tostato."
    ]
  },
  {
    "slug": "ricotta-spinaci-pane-integrale",
    "nome": "Ricotta con spinaci saltati e pane integrale",
    "tags": [
      "vegetariano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "colazione"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "ricotta",
        "quantita": 150,
        "unita": "g"
      },
      {
        "nome": "spinaci freschi",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "pane integrale",
        "quantita": 50,
        "unita": "g"
      },
      {
        "nome": "olio extravergine d'oliva",
        "quantita": 1,
        "unita": "cucchiaino"
      }
    ],
    "macro": {
      "kcal": 340
    },
    "tempoMinuti": 10,
    "preparazione": [
      "Salta gli spinaci in padella con l'olio per 3-4 minuti.",
      "Tosta il pane integrale.",
      "Servi la ricotta con gli spinaci accanto e il pane."
    ]
  },
  {
    "slug": "fette-biscottate-ricotta-miele-noci",
    "nome": "Fette biscottate integrali con ricotta, miele e noci",
    "tags": [
      "senza cottura",
      "vegetariano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "colazione"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "fette biscottate integrali",
        "quantita": 4,
        "unita": "pz"
      },
      {
        "nome": "ricotta",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "miele",
        "quantita": 1,
        "unita": "cucchiaino"
      },
      {
        "nome": "noci",
        "quantita": 10,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 340
    },
    "tempoMinuti": 5,
    "preparazione": [
      "Spalma la ricotta sulle fette biscottate.",
      "Completa con miele e noci spezzettate."
    ]
  },
  {
    "slug": "fette-biscottate-crema-mandorle-frutta",
    "nome": "Fette biscottate integrali con crema di mandorle e frutta",
    "tags": [
      "senza cottura",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "colazione"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "fette biscottate integrali",
        "quantita": 4,
        "unita": "pz"
      },
      {
        "nome": "crema di mandorle",
        "quantita": 25,
        "unita": "g"
      },
      {
        "nome": "banana",
        "quantita": 0.5,
        "unita": "pz"
      }
    ],
    "macro": {
      "kcal": 330
    },
    "tempoMinuti": 5,
    "preparazione": [
      "Spalma la crema di mandorle sulle fette biscottate.",
      "Completa con la banana a fettine."
    ]
  },
  {
    "slug": "farfalle-pesto-zucchine-ricotta-pomodorini",
    "nome": "Farfalle con pesto di zucchine e ricotta, pomodorini, basilico e mandorle",
    "tags": [
      "schiscetta",
      "vegetariano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [
      "marzo",
      "aprile",
      "maggio",
      "giugno",
      "luglio",
      "agosto"
    ],
    "ingredienti": [
      {
        "nome": "farfalle",
        "quantita": 90,
        "unita": "g"
      },
      {
        "nome": "zucchine",
        "quantita": 150,
        "unita": "g"
      },
      {
        "nome": "ricotta",
        "quantita": 50,
        "unita": "g"
      },
      {
        "nome": "pomodorini",
        "quantita": 80,
        "unita": "g"
      },
      {
        "nome": "basilico fresco",
        "unita": "q.b."
      },
      {
        "nome": "mandorle",
        "quantita": 15,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 520
    },
    "tempoMinuti": 25,
    "preparazione": [
      "Cuoci le zucchine a tocchetti in padella, poi frullale con la ricotta e il basilico per ottenere il pesto.",
      "Cuoci la pasta, scolala e mantecala con il pesto di zucchine.",
      "Completa con pomodorini tagliati e mandorle tritate."
    ]
  },
  {
    "slug": "riso-basmati-salmone-zucchine-edamame",
    "nome": "Riso basmati con salmone, zucchine, edamame e olio EVO",
    "tags": [
      "schiscetta",
      "senza glutine",
      "onnivoro"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "riso basmati",
        "quantita": 70,
        "unita": "g"
      },
      {
        "nome": "salmone",
        "quantita": 120,
        "unita": "g"
      },
      {
        "nome": "zucchine",
        "quantita": 120,
        "unita": "g"
      },
      {
        "nome": "edamame",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "olio extravergine d'oliva",
        "quantita": 1,
        "unita": "cucchiaio"
      }
    ],
    "macro": {
      "kcal": 560
    },
    "tempoMinuti": 25,
    "preparazione": [
      "Cuoci il riso basmati in acqua salata e scolalo.",
      "Cuoci il salmone in padella o al forno con sale e pepe.",
      "Salta le zucchine in padella, sbollenta gli edamame.",
      "Componi in un unico contenitore e condisci con l'olio."
    ]
  },
  {
    "slug": "riso-basmati-ceci-zucchine-edamame",
    "nome": "Riso basmati con ceci, zucchine, edamame e olio EVO",
    "tags": [
      "schiscetta",
      "senza glutine",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "riso basmati",
        "quantita": 70,
        "unita": "g"
      },
      {
        "nome": "ceci lessati",
        "quantita": 180,
        "unita": "g"
      },
      {
        "nome": "zucchine",
        "quantita": 120,
        "unita": "g"
      },
      {
        "nome": "edamame",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "olio extravergine d'oliva",
        "quantita": 1,
        "unita": "cucchiaio"
      }
    ],
    "macro": {
      "kcal": 510
    },
    "tempoMinuti": 25,
    "preparazione": [
      "Lessa il riso basmati e scolalo.",
      "Salta le zucchine a rondelle in padella per 8 minuti.",
      "Aggiungi ceci ed edamame e scalda ancora 3 minuti.",
      "Unisci al riso e condisci con l'olio."
    ]
  },
  {
    "slug": "riso-hummus-ceci-zucca-spinaci-avocado",
    "nome": "Riso con hummus di ceci, zucca, spinaci e avocado",
    "tags": [
      "schiscetta",
      "senza glutine",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [
      "gennaio",
      "febbraio",
      "settembre",
      "ottobre",
      "novembre",
      "dicembre"
    ],
    "ingredienti": [
      {
        "nome": "riso integrale",
        "quantita": 70,
        "unita": "g"
      },
      {
        "nome": "hummus di ceci",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "zucca",
        "quantita": 150,
        "unita": "g"
      },
      {
        "nome": "spinaci freschi",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "avocado",
        "quantita": 0.5,
        "unita": "pz"
      }
    ],
    "macro": {
      "kcal": 520
    },
    "tempoMinuti": 30,
    "preparazione": [
      "Cuoci il riso integrale in acqua salata.",
      "Cuoci la zucca a cubetti al forno o in padella.",
      "Salta velocemente gli spinaci.",
      "Componi con l'hummus e l'avocado a fettine."
    ]
  },
  {
    "slug": "riso-basmati-zucca-feta-insalata-semi-zucca",
    "nome": "Riso basmati con zucca, feta, insalata e semi di zucca",
    "tags": [
      "schiscetta",
      "senza glutine",
      "vegetariano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [
      "gennaio",
      "febbraio",
      "settembre",
      "ottobre",
      "novembre",
      "dicembre"
    ],
    "ingredienti": [
      {
        "nome": "riso basmati",
        "quantita": 70,
        "unita": "g"
      },
      {
        "nome": "zucca",
        "quantita": 150,
        "unita": "g"
      },
      {
        "nome": "feta",
        "quantita": 50,
        "unita": "g"
      },
      {
        "nome": "insalata mista",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "semi di zucca",
        "quantita": 15,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 500
    },
    "tempoMinuti": 25,
    "preparazione": [
      "Cuoci il riso basmati in acqua salata.",
      "Cuoci la zucca a cubetti al forno.",
      "Componi con l'insalata, la feta sbriciolata e i semi di zucca."
    ]
  },
  {
    "slug": "riso-basmati-zucca-feta-vegetale-insalata-semi-zucca",
    "nome": "Riso basmati con zucca, formaggio vegetale, insalata e semi di zucca",
    "tags": [
      "schiscetta",
      "senza glutine",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [
      "gennaio",
      "febbraio",
      "settembre",
      "ottobre",
      "novembre",
      "dicembre"
    ],
    "ingredienti": [
      {
        "nome": "riso basmati",
        "quantita": 70,
        "unita": "g"
      },
      {
        "nome": "zucca",
        "quantita": 150,
        "unita": "g"
      },
      {
        "nome": "formaggio vegetale tipo feta",
        "quantita": 50,
        "unita": "g"
      },
      {
        "nome": "insalata mista",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "semi di zucca",
        "quantita": 15,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 480
    },
    "tempoMinuti": 25,
    "preparazione": [
      "Cuoci il riso basmati in acqua salata.",
      "Cuoci la zucca a cubetti al forno.",
      "Componi con l'insalata, il formaggio vegetale a cubetti e i semi di zucca."
    ]
  },
  {
    "slug": "patate-dolci-uova-insalata-avocado-paprika",
    "nome": "Patate dolci con uova, insalata, avocado e paprika",
    "tags": [
      "schiscetta",
      "senza glutine",
      "vegetariano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "patate dolci",
        "quantita": 200,
        "unita": "g"
      },
      {
        "nome": "uovo",
        "quantita": 2,
        "unita": "pz"
      },
      {
        "nome": "insalata mista",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "avocado",
        "quantita": 0.5,
        "unita": "pz"
      },
      {
        "nome": "paprika dolce",
        "quantita": 1,
        "unita": "cucchiaino"
      }
    ],
    "macro": {
      "kcal": 480
    },
    "tempoMinuti": 30,
    "preparazione": [
      "Cuoci le patate dolci a spicchi al forno con la paprika.",
      "Rassoda o cuoci le uova come preferisci.",
      "Componi con l'insalata e l'avocado a fettine."
    ]
  },
  {
    "slug": "patate-dolci-ceci-insalata-avocado-paprika",
    "nome": "Patate dolci con ceci speziati, insalata, avocado e paprika",
    "tags": [
      "schiscetta",
      "senza glutine",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "patate dolci",
        "quantita": 200,
        "unita": "g"
      },
      {
        "nome": "ceci lessati",
        "quantita": 180,
        "unita": "g"
      },
      {
        "nome": "insalata mista",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "avocado",
        "quantita": 0.5,
        "unita": "pz"
      },
      {
        "nome": "paprika dolce",
        "quantita": 1,
        "unita": "cucchiaino"
      }
    ],
    "macro": {
      "kcal": 480
    },
    "tempoMinuti": 30,
    "preparazione": [
      "Cuoci le patate dolci a cubetti in forno a 200 °C per 25 minuti.",
      "Negli ultimi 10 minuti aggiungi i ceci conditi con la paprika.",
      "Servi su un letto di insalata con l'avocado a fette."
    ]
  },
  {
    "slug": "pasta-pesto-gamberetti-spinaci-fagiolini",
    "nome": "Pasta al pesto con gamberetti, spinaci e fagiolini",
    "tags": [
      "schiscetta",
      "onnivoro"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [
      "marzo",
      "aprile",
      "maggio",
      "giugno",
      "luglio",
      "agosto"
    ],
    "ingredienti": [
      {
        "nome": "pasta",
        "quantita": 80,
        "unita": "g"
      },
      {
        "nome": "gamberetti",
        "quantita": 150,
        "unita": "g"
      },
      {
        "nome": "spinaci freschi",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "fagiolini",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "pesto di basilico",
        "quantita": 25,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 500
    },
    "tempoMinuti": 20,
    "preparazione": [
      "Cuoci la pasta e i fagiolini in acqua salata.",
      "Salta i gamberetti in padella con un filo d'olio, aggiungi gli spinaci.",
      "Scola la pasta, mantecala con il pesto e unisci gamberetti e verdure."
    ]
  },
  {
    "slug": "pasta-pesto-ceci-spinaci-fagiolini",
    "nome": "Pasta al pesto con ceci, spinaci e fagiolini",
    "tags": [
      "schiscetta",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [
      "marzo",
      "aprile",
      "maggio",
      "giugno",
      "luglio",
      "agosto"
    ],
    "ingredienti": [
      {
        "nome": "pasta",
        "quantita": 80,
        "unita": "g"
      },
      {
        "nome": "ceci lessati",
        "quantita": 150,
        "unita": "g"
      },
      {
        "nome": "spinaci freschi",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "fagiolini",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "pesto di basilico",
        "quantita": 25,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 520
    },
    "tempoMinuti": 20,
    "preparazione": [
      "Cuoci la pasta e i fagiolini in acqua salata.",
      "Scalda i ceci in padella con un filo d'olio, aggiungi gli spinaci.",
      "Scola la pasta, mantecala con il pesto e unisci ceci e verdure."
    ]
  },
  {
    "slug": "riso-fagioli-pomodoro-valeriana-guacamole",
    "nome": "Riso con fagioli al pomodoro, valeriana e guacamole",
    "tags": [
      "schiscetta",
      "senza glutine",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "riso integrale",
        "quantita": 70,
        "unita": "g"
      },
      {
        "nome": "fagioli borlotti",
        "quantita": 150,
        "unita": "g"
      },
      {
        "nome": "passata di pomodoro",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "valeriana",
        "quantita": 50,
        "unita": "g"
      },
      {
        "nome": "guacamole",
        "quantita": 40,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 480
    },
    "tempoMinuti": 25,
    "preparazione": [
      "Cuoci il riso integrale in acqua salata.",
      "Scalda i fagioli nella passata di pomodoro per 10 minuti.",
      "Componi con la valeriana fresca e il guacamole."
    ]
  },
  {
    "slug": "insalata-lenticchie-feta-pomodori-cetrioli-peperoni",
    "nome": "Insalata di lenticchie con feta, pomodori, cetrioli, peperoni, prezzemolo, limone e crostini",
    "tags": [
      "schiscetta",
      "senza cottura (tranne crostini)",
      "vegetariano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [
      "marzo",
      "aprile",
      "maggio",
      "giugno",
      "luglio",
      "agosto"
    ],
    "ingredienti": [
      {
        "nome": "lenticchie lessate",
        "quantita": 180,
        "unita": "g"
      },
      {
        "nome": "feta",
        "quantita": 50,
        "unita": "g"
      },
      {
        "nome": "pomodori",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "cetrioli",
        "quantita": 80,
        "unita": "g"
      },
      {
        "nome": "peperoni",
        "quantita": 80,
        "unita": "g"
      },
      {
        "nome": "prezzemolo fresco",
        "unita": "q.b."
      },
      {
        "nome": "succo di limone",
        "quantita": 1,
        "unita": "cucchiaio"
      },
      {
        "nome": "pane per crostini",
        "quantita": 30,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 460
    },
    "tempoMinuti": 20,
    "preparazione": [
      "Taglia pomodori, cetrioli e peperoni a cubetti.",
      "Tosta il pane a dadini per i crostini.",
      "Unisci tutti gli ingredienti con le lenticchie, condisci con limone, olio e prezzemolo."
    ]
  },
  {
    "slug": "insalata-lenticchie-vegan-feta-pomodori-cetrioli-peperoni",
    "nome": "Insalata di lenticchie con formaggio vegetale, pomodori, cetrioli, peperoni, prezzemolo, limone e crostini",
    "tags": [
      "schiscetta",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [
      "marzo",
      "aprile",
      "maggio",
      "giugno",
      "luglio",
      "agosto"
    ],
    "ingredienti": [
      {
        "nome": "lenticchie lessate",
        "quantita": 180,
        "unita": "g"
      },
      {
        "nome": "formaggio vegetale tipo feta",
        "quantita": 50,
        "unita": "g"
      },
      {
        "nome": "pomodori",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "cetrioli",
        "quantita": 80,
        "unita": "g"
      },
      {
        "nome": "peperoni",
        "quantita": 80,
        "unita": "g"
      },
      {
        "nome": "prezzemolo fresco",
        "unita": "q.b."
      },
      {
        "nome": "succo di limone",
        "quantita": 1,
        "unita": "cucchiaio"
      },
      {
        "nome": "pane per crostini",
        "quantita": 30,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 440
    },
    "tempoMinuti": 20,
    "preparazione": [
      "Taglia pomodori, cetrioli e peperoni a cubetti.",
      "Tosta il pane a dadini per i crostini.",
      "Unisci tutti gli ingredienti con le lenticchie, condisci con limone, olio e prezzemolo."
    ]
  },
  {
    "slug": "insalata-zucchine-salmone-patate-rucola-olive",
    "nome": "Insalata di zucchine con salmone, patate, rucola e olive",
    "tags": [
      "schiscetta",
      "senza glutine",
      "onnivoro"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [
      "marzo",
      "aprile",
      "maggio",
      "giugno",
      "luglio",
      "agosto"
    ],
    "ingredienti": [
      {
        "nome": "zucchine",
        "quantita": 150,
        "unita": "g"
      },
      {
        "nome": "salmone",
        "quantita": 120,
        "unita": "g"
      },
      {
        "nome": "patate",
        "quantita": 120,
        "unita": "g"
      },
      {
        "nome": "rucola",
        "quantita": 50,
        "unita": "g"
      },
      {
        "nome": "olive",
        "quantita": 20,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 500
    },
    "tempoMinuti": 25,
    "preparazione": [
      "Lessa le patate e grigliale insieme alle zucchine a fette.",
      "Cuoci il salmone in padella o al forno.",
      "Componi con la rucola e le olive."
    ]
  },
  {
    "slug": "insalata-zucchine-ceci-patate-rucola-olive",
    "nome": "Insalata di zucchine con ceci, patate, rucola e olive",
    "tags": [
      "schiscetta",
      "senza glutine",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [
      "marzo",
      "aprile",
      "maggio",
      "giugno",
      "luglio",
      "agosto"
    ],
    "ingredienti": [
      {
        "nome": "zucchine",
        "quantita": 150,
        "unita": "g"
      },
      {
        "nome": "ceci lessati",
        "quantita": 180,
        "unita": "g"
      },
      {
        "nome": "patate",
        "quantita": 120,
        "unita": "g"
      },
      {
        "nome": "rucola",
        "quantita": 50,
        "unita": "g"
      },
      {
        "nome": "olive",
        "quantita": 20,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 480
    },
    "tempoMinuti": 25,
    "preparazione": [
      "Lessa le patate e griglia le zucchine a fette.",
      "Scalda i ceci in padella con un filo d'olio e rosmarino.",
      "Componi con la rucola e le olive."
    ]
  },
  {
    "slug": "farro-pollo-verdure-grigliate-yogurt",
    "nome": "Farro con pollo, verdure grigliate e salsa allo yogurt",
    "tags": [
      "schiscetta",
      "onnivoro"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "farro",
        "quantita": 70,
        "unita": "g"
      },
      {
        "nome": "petto di pollo",
        "quantita": 130,
        "unita": "g"
      },
      {
        "nome": "melanzane",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "peperoni",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "yogurt greco",
        "quantita": 40,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 520
    },
    "tempoMinuti": 30,
    "preparazione": [
      "Cuoci il farro in acqua salata.",
      "Griglia melanzane e peperoni a fette.",
      "Cuoci il pollo alla piastra con sale, pepe ed erbe aromatiche.",
      "Componi il piatto e completa con un cucchiaio di yogurt."
    ]
  },
  {
    "slug": "farro-ceci-verdure-grigliate-tahina",
    "nome": "Farro con ceci, verdure grigliate e salsa alla tahina",
    "tags": [
      "schiscetta",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "farro",
        "quantita": 70,
        "unita": "g"
      },
      {
        "nome": "ceci lessati",
        "quantita": 180,
        "unita": "g"
      },
      {
        "nome": "melanzane",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "peperoni",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "tahina",
        "quantita": 15,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 540
    },
    "tempoMinuti": 30,
    "preparazione": [
      "Cuoci il farro in acqua salata.",
      "Griglia melanzane e peperoni a fette.",
      "Scalda i ceci con un filo d'olio e paprika.",
      "Componi il piatto e completa con un filo di tahina diluita con acqua e limone."
    ]
  },
  {
    "slug": "riso-basmati-tonno-verdure-limone",
    "nome": "Riso basmati con tonno, verdure e limone",
    "tags": [
      "schiscetta",
      "veloce",
      "onnivoro"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [
      "marzo",
      "aprile",
      "maggio",
      "giugno",
      "luglio",
      "agosto"
    ],
    "ingredienti": [
      {
        "nome": "riso basmati",
        "quantita": 70,
        "unita": "g"
      },
      {
        "nome": "tonno al naturale",
        "quantita": 120,
        "unita": "g"
      },
      {
        "nome": "zucchine",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "pomodorini",
        "quantita": 80,
        "unita": "g"
      },
      {
        "nome": "succo di limone",
        "quantita": 1,
        "unita": "cucchiaio"
      }
    ],
    "macro": {
      "kcal": 460
    },
    "tempoMinuti": 20,
    "preparazione": [
      "Lessa il riso basmati e lascialo intiepidire.",
      "Salta le zucchine a dadini per 8 minuti; taglia i pomodorini a metà.",
      "Unisci tutto al riso con il tonno sgocciolato e il succo di limone."
    ]
  },
  {
    "slug": "farro-ceci-pomodorini-limone",
    "nome": "Farro con ceci, pomodorini e limone",
    "tags": [
      "schiscetta",
      "veloce",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [
      "marzo",
      "aprile",
      "maggio",
      "giugno",
      "luglio",
      "agosto"
    ],
    "ingredienti": [
      {
        "nome": "farro",
        "quantita": 70,
        "unita": "g"
      },
      {
        "nome": "ceci lessati",
        "quantita": 180,
        "unita": "g"
      },
      {
        "nome": "zucchine",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "pomodorini",
        "quantita": 80,
        "unita": "g"
      },
      {
        "nome": "succo di limone",
        "quantita": 1,
        "unita": "cucchiaio"
      }
    ],
    "macro": {
      "kcal": 470
    },
    "tempoMinuti": 25,
    "preparazione": [
      "Lessa il farro e scolalo.",
      "Salta le zucchine a dadini per 8 minuti.",
      "Unisci ceci e pomodorini, condisci con il succo di limone."
    ]
  },
  {
    "slug": "buddha-bowl-ceci-curcuma-cavolo-riccio-tahina",
    "nome": "Buddha bowl con ceci alla curcuma, cavolo riccio e tahina",
    "tags": [
      "schiscetta",
      "senza glutine",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "pranzo"
    ],
    "stagioni": [
      "gennaio",
      "febbraio",
      "settembre",
      "ottobre",
      "novembre",
      "dicembre"
    ],
    "ingredienti": [
      {
        "nome": "ceci lessati",
        "quantita": 180,
        "unita": "g"
      },
      {
        "nome": "curcuma in polvere",
        "quantita": 1,
        "unita": "cucchiaino"
      },
      {
        "nome": "cavolo riccio",
        "quantita": 80,
        "unita": "g"
      },
      {
        "nome": "riso integrale",
        "quantita": 60,
        "unita": "g"
      },
      {
        "nome": "tahina",
        "quantita": 15,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 500
    },
    "tempoMinuti": 25,
    "preparazione": [
      "Cuoci il riso integrale in acqua salata.",
      "Rosola i ceci in padella con curcuma e un filo d'olio.",
      "Massaggia il cavolo riccio con olio e limone per ammorbidirlo.",
      "Componi la bowl e completa con tahina diluita."
    ]
  },
  {
    "slug": "minestrone-verdure-legumi",
    "nome": "Minestrone di verdure e legumi misti",
    "tags": [
      "senza glutine",
      "avanzi facili",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "cena"
    ],
    "stagioni": [
      "gennaio",
      "febbraio",
      "settembre",
      "ottobre",
      "novembre",
      "dicembre"
    ],
    "ingredienti": [
      {
        "nome": "verdure miste da minestrone",
        "quantita": 300,
        "unita": "g"
      },
      {
        "nome": "legumi misti lessati",
        "quantita": 150,
        "unita": "g"
      },
      {
        "nome": "olio extravergine d'oliva",
        "quantita": 1,
        "unita": "cucchiaio"
      }
    ],
    "macro": {
      "kcal": 320
    },
    "tempoMinuti": 35,
    "preparazione": [
      "Taglia le verdure a cubetti e falle stufare con un filo d'olio.",
      "Copri con acqua o brodo vegetale e cuoci 20 minuti.",
      "Aggiungi i legumi lessati e cuoci altri 10 minuti."
    ]
  },
  {
    "slug": "frittata-zucchine-forno",
    "nome": "Frittata di zucchine al forno",
    "tags": [
      "senza glutine",
      "vegetariano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "cena"
    ],
    "stagioni": [
      "marzo",
      "aprile",
      "maggio",
      "giugno",
      "luglio",
      "agosto"
    ],
    "ingredienti": [
      {
        "nome": "uovo",
        "quantita": 3,
        "unita": "pz"
      },
      {
        "nome": "zucchine",
        "quantita": 200,
        "unita": "g"
      },
      {
        "nome": "grana grattugiato",
        "quantita": 15,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 340
    },
    "tempoMinuti": 25,
    "preparazione": [
      "Taglia le zucchine a rondelle sottili.",
      "Sbatti le uova con il grana, unisci le zucchine.",
      "Versa in una teglia e cuoci in forno a 180°C per 20 minuti."
    ]
  },
  {
    "slug": "frittata-ceci-zucchine-forno",
    "nome": "Frittata vegana di farina di ceci e zucchine al forno",
    "tags": [
      "senza glutine",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "cena"
    ],
    "stagioni": [
      "marzo",
      "aprile",
      "maggio",
      "giugno",
      "luglio",
      "agosto"
    ],
    "ingredienti": [
      {
        "nome": "farina di ceci",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "acqua",
        "quantita": 150,
        "unita": "ml"
      },
      {
        "nome": "zucchine",
        "quantita": 200,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 330
    },
    "tempoMinuti": 25,
    "preparazione": [
      "Mescola la farina di ceci con acqua, sale e pepe fino a ottenere una pastella liscia.",
      "Taglia le zucchine a rondelle sottili e uniscile alla pastella.",
      "Versa in una teglia e cuoci in forno a 180°C per 25 minuti."
    ]
  },
  {
    "slug": "merluzzo-forno-patate-pomodorini",
    "nome": "Merluzzo al forno con patate e pomodorini",
    "tags": [
      "senza glutine",
      "onnivoro"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "cena"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "merluzzo",
        "quantita": 180,
        "unita": "g"
      },
      {
        "nome": "patate",
        "quantita": 150,
        "unita": "g"
      },
      {
        "nome": "pomodorini",
        "quantita": 100,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 400
    },
    "tempoMinuti": 30,
    "preparazione": [
      "Taglia le patate a fette sottili e disponile in teglia con un filo d'olio.",
      "Cuoci in forno a 200°C per 15 minuti.",
      "Aggiungi il merluzzo e i pomodorini, inforna altri 15 minuti."
    ]
  },
  {
    "slug": "feta-forno-patate-pomodorini",
    "nome": "Feta al forno con patate e pomodorini",
    "tags": [
      "senza glutine",
      "vegetariano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "cena"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "feta",
        "quantita": 150,
        "unita": "g"
      },
      {
        "nome": "patate",
        "quantita": 150,
        "unita": "g"
      },
      {
        "nome": "pomodorini",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "olio extravergine d'oliva",
        "quantita": 1,
        "unita": "cucchiaio"
      }
    ],
    "macro": {
      "kcal": 400
    },
    "tempoMinuti": 30,
    "preparazione": [
      "Taglia le patate a spicchi e disponile in teglia con i pomodorini.",
      "Adagia la feta intera al centro e condisci con l'olio.",
      "Inforna a 200 °C per 25-30 minuti."
    ]
  },
  {
    "slug": "ceci-saltati-verdure-salsa-soia",
    "nome": "Ceci saltati con verdure e salsa di soia",
    "tags": [
      "veloce",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "cena"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "ceci lessati",
        "quantita": 200,
        "unita": "g"
      },
      {
        "nome": "verdure miste da saltare",
        "quantita": 250,
        "unita": "g"
      },
      {
        "nome": "salsa di soia",
        "quantita": 1,
        "unita": "cucchiaio"
      }
    ],
    "macro": {
      "kcal": 340
    },
    "tempoMinuti": 20,
    "preparazione": [
      "Salta le verdure in padella a fuoco vivo per 8-10 minuti.",
      "Aggiungi i ceci sgocciolati e falli insaporire 5 minuti.",
      "Sfuma con la salsa di soia e servi."
    ]
  },
  {
    "slug": "zuppa-lenticchie-rosse-curry",
    "nome": "Zuppa di lenticchie rosse al curry",
    "tags": [
      "senza glutine",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "cena"
    ],
    "stagioni": [
      "gennaio",
      "febbraio",
      "settembre",
      "ottobre",
      "novembre",
      "dicembre"
    ],
    "ingredienti": [
      {
        "nome": "lenticchie rosse decorticate",
        "quantita": 80,
        "unita": "g"
      },
      {
        "nome": "latte di cocco",
        "quantita": 100,
        "unita": "ml"
      },
      {
        "nome": "curry in polvere",
        "quantita": 1,
        "unita": "cucchiaino"
      },
      {
        "nome": "spinaci freschi",
        "quantita": 60,
        "unita": "g"
      }
    ],
    "macro": {
      "kcal": 360
    },
    "tempoMinuti": 25,
    "preparazione": [
      "Soffriggi il curry in un filo d'olio per qualche secondo.",
      "Aggiungi le lenticchie rosse, copri con acqua e cuoci 15 minuti.",
      "Unisci il latte di cocco e gli spinaci, cuoci altri 5 minuti."
    ]
  },
  {
    "slug": "petto-pollo-verdure-grigliate-limone",
    "nome": "Petto di pollo con verdure grigliate e limone",
    "tags": [
      "senza glutine",
      "onnivoro"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "cena"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "petto di pollo",
        "quantita": 150,
        "unita": "g"
      },
      {
        "nome": "verdure miste da grigliare",
        "quantita": 250,
        "unita": "g"
      },
      {
        "nome": "succo di limone",
        "quantita": 1,
        "unita": "cucchiaio"
      }
    ],
    "macro": {
      "kcal": 340
    },
    "tempoMinuti": 20,
    "preparazione": [
      "Griglia le verdure tagliate a fette.",
      "Cuoci il petto di pollo alla piastra con sale, pepe ed erbe.",
      "Condisci tutto con succo di limone e un filo d'olio."
    ]
  },
  {
    "slug": "frittata-erbe-verdure-grigliate-limone",
    "nome": "Frittata alle erbe con verdure grigliate e limone",
    "tags": [
      "senza glutine",
      "vegetariano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "cena"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "uova",
        "quantita": 3,
        "unita": "pz"
      },
      {
        "nome": "verdure miste da grigliare",
        "quantita": 250,
        "unita": "g"
      },
      {
        "nome": "grana grattugiato",
        "quantita": 15,
        "unita": "g"
      },
      {
        "nome": "succo di limone",
        "quantita": 1,
        "unita": "cucchiaio"
      }
    ],
    "macro": {
      "kcal": 380
    },
    "tempoMinuti": 20,
    "preparazione": [
      "Griglia le verdure e condiscile con il succo di limone.",
      "Sbatti le uova con il grana e le erbe che hai in casa.",
      "Cuoci la frittata in padella 3 minuti per lato e servi con le verdure."
    ]
  },
  {
    "slug": "insalatona-tonno-fagioli-uovo-sodo",
    "nome": "Insalatona con tonno, fagioli e uovo sodo",
    "tags": [
      "senza glutine",
      "senza cottura (tranne uovo)",
      "onnivoro"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "cena"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "insalata mista",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "tonno al naturale",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "fagioli cannellini",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "uovo",
        "quantita": 1,
        "unita": "pz"
      }
    ],
    "macro": {
      "kcal": 360
    },
    "tempoMinuti": 15,
    "preparazione": [
      "Rassoda l'uovo per 9 minuti, raffredda e taglia a spicchi.",
      "Componi l'insalata con tonno sgocciolato e fagioli.",
      "Aggiungi l'uovo e condisci con olio, sale e pepe."
    ]
  },
  {
    "slug": "insalatona-ceci-fagioli-avocado",
    "nome": "Insalatona con ceci, fagioli e avocado",
    "tags": [
      "senza glutine",
      "senza cottura",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "cena"
    ],
    "stagioni": [],
    "ingredienti": [
      {
        "nome": "insalata mista",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "ceci lessati",
        "quantita": 120,
        "unita": "g"
      },
      {
        "nome": "fagioli cannellini",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "avocado",
        "quantita": 0.4,
        "unita": "pz"
      }
    ],
    "macro": {
      "kcal": 380
    },
    "tempoMinuti": 15,
    "preparazione": [
      "Componi l'insalata con ceci e fagioli.",
      "Aggiungi l'avocado a fettine e condisci con olio, sale, pepe e limone."
    ]
  },
  {
    "slug": "vellutata-zucca-ceci-croccanti",
    "nome": "Vellutata di zucca con ceci croccanti",
    "tags": [
      "senza glutine",
      "vegano"
    ],
    "porzioni": 1,
    "pastiAdatti": [
      "cena"
    ],
    "stagioni": [
      "gennaio",
      "febbraio",
      "settembre",
      "ottobre",
      "novembre",
      "dicembre"
    ],
    "ingredienti": [
      {
        "nome": "zucca",
        "quantita": 300,
        "unita": "g"
      },
      {
        "nome": "ceci lessati",
        "quantita": 100,
        "unita": "g"
      },
      {
        "nome": "olio extravergine d'oliva",
        "quantita": 1,
        "unita": "cucchiaio"
      }
    ],
    "macro": {
      "kcal": 320
    },
    "tempoMinuti": 30,
    "preparazione": [
      "Cuoci la zucca a cubetti in acqua o brodo vegetale finché tenera, poi frulla.",
      "Rosola i ceci in padella o al forno con un filo d'olio finché croccanti.",
      "Versa la vellutata nel piatto e completa con i ceci croccanti."
    ]
  }
];
