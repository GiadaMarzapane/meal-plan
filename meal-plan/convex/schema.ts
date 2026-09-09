import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/** Un ingrediente di una ricetta: quantità numerica così da poterla scalare. */
export const ingrediente = v.object({
  nome: v.string(),
  quantita: v.optional(v.number()),
  unita: v.optional(v.string()), // "g", "ml", "pz", ...
});

export const tipoPasto = v.union(
  v.literal("colazione"),
  v.literal("pranzo"),
  v.literal("cena")
);

/** Un commensale a un pasto, con quante porzioni mangia (1 = porzione piena). */
export const commensale = v.object({
  nome: v.string(),
  porzioni: v.number(),
});

/**
 * Valori nutrizionali. Sulle ricette sono *per porzione*, sui commensali sono
 * l'obiettivo *giornaliero*. Tutti i campi sono opzionali: si compilano solo
 * dove servono davvero.
 */
export const macro = v.object({
  kcal: v.optional(v.number()),
  proteine: v.optional(v.number()),
  carboidrati: v.optional(v.number()),
  grassi: v.optional(v.number()),
});

export const statoPasto = v.union(
  v.literal("da_pianificare"),
  v.literal("fuori"),
  v.literal("pianificato")
);

export default defineSchema({
  // Tabelle di @convex-dev/auth (users, authAccounts, authSessions, ...)
  ...authTables,

  // Gruppo che condivide i dati (es. "Giada & Marco")
  households: defineTable({
    name: v.string(),
    codiceInvito: v.string(), // per far entrare Marco senza inviti via email
    // Istruzioni in italiano per il generatore con AI: come vi piace mangiare.
    preferenze: v.optional(v.string()),
  }).index("by_codice", ["codiceInvito"]),

  // Persone collegate a un household (non necessariamente utenti autenticati:
  // "Davide" può esistere solo come nome commensale senza login)
  householdMembers: defineTable({
    householdId: v.id("households"),
    userId: v.optional(v.id("users")), // presente solo se ha un account
    displayName: v.string(), // es. "Giada", "Marco", "Davide"
    obiettivo: v.optional(macro), // obiettivo giornaliero, per chi segue una dieta
  })
    .index("by_household", ["householdId"])
    .index("by_user", ["userId"]),

  // Categorie proposte per i prodotti in frigo. Sono solo dei suggerimenti:
  // il prodotto salva il nome della categoria, non un riferimento, così
  // cancellare una categoria non lascia prodotti orfani.
  categorie: defineTable({
    householdId: v.id("households"),
    nome: v.string(),
  }).index("by_household", ["householdId"]),

  // Prodotti attualmente in frigo/dispensa
  prodottiFrigo: defineTable({
    householdId: v.id("households"),
    nome: v.string(),
    categoria: v.optional(v.string()),
    // Scorta come "pezzi × contenuto": 3 confezioni di passata da 700 g sono
    // pezzi 3, quantita 700, unita "g" — totale 2100 g. Con `pezzi` assente
    // `quantita` è già il totale; con entrambi assenti la quantità è ignota.
    pezzi: v.optional(v.number()),
    quantita: v.optional(v.number()), // contenuto di UN pezzo
    unita: v.optional(v.string()),
    // Nome con cui le ricette lo chiamano: "fusilli" ha generico "pasta", così
    // una ricetta che chiede pasta sa di poter usare quello che c'è davvero.
    generico: v.optional(v.string()),
    dataAcquisto: v.optional(v.string()), // ISO date
    // Facoltativa: la roba di dispensa (pasta, riso, scatolame) spesso non la
    // si traccia. Senza scadenza il prodotto non compare tra quelli in scadenza.
    dataScadenza: v.optional(v.string()), // ISO date
  })
    .index("by_household", ["householdId"])
    .index("by_household_scadenza", ["householdId", "dataScadenza"]),

  // Catalogo ricette/piatti
  ricette: defineTable({
    householdId: v.id("households"),
    nome: v.string(),
    tags: v.array(v.string()), // es. ["vegetariano", "veloce", "leggero"]
    ingredienti: v.array(ingrediente),
    porzioni: v.number(), // per quante persone sono le quantità indicate
    // A quali pasti si presta. Vuoto o assente = va bene per tutti.
    pastiAdatti: v.optional(v.array(tipoPasto)),
    macro: v.optional(macro), // per porzione
    stagioni: v.array(v.string()), // mesi, es. ["settembre", "ottobre"]; vuoto = sempre
    note: v.optional(v.string()),
  }).index("by_household", ["householdId"]),

  // Un pasto pianificato per giorno: chi c'è, cosa si mangia, se si è fuori
  pastiPianificati: defineTable({
    householdId: v.id("households"),
    data: v.string(), // ISO date, es. "2026-09-14"
    tipoPasto,
    stato: statoPasto,
    commensali: v.array(commensale),
    ricettaId: v.optional(v.id("ricette")),
    // true = qui si mangia l'avanzo di una cottura precedente, non si cucina.
    // Non cambia la spesa: gli ingredienti servono comunque per le porzioni
    // totali, che si cuociano in una volta sola o in due.
    avanzo: v.optional(v.boolean()),
  }).index("by_household_data", ["householdId", "data"]),

  // Lista della spesa, generata automaticamente o aggiunta a mano
  listaSpesa: defineTable({
    householdId: v.id("households"),
    nome: v.string(),
    quantita: v.optional(v.number()),
    unita: v.optional(v.string()),
    presa: v.boolean(),
    generata: v.boolean(), // true = creata dal generatore, si può rigenerare
  }).index("by_household", ["householdId"]),

  // Storico di cosa è stato cucinato, per evitare ripetizioni troppo ravvicinate
  menuStorico: defineTable({
    householdId: v.id("households"),
    ricettaId: v.id("ricette"),
    dataUsata: v.string(), // ISO date
  })
    .index("by_household_ricetta", ["householdId", "ricettaId"])
    .index("by_household_data", ["householdId", "dataUsata"]),
});
