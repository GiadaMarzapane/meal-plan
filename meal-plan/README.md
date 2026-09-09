# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
# App menu / spesa / frigo

PWA (React + TypeScript + Convex) per pianificare i menu settimanali in base
alla stagionalità e ai commensali, generare automaticamente la lista della
spesa e tenere traccia delle scadenze dei prodotti in frigo. Condivisa con
Marco (e con Davide come commensale occasionale, senza account).

## Roadmap

1. ✅ **Setup progetto e schema dati** — React+TS+Convex, auth con
   `@convex-dev/auth` (Google), tabelle base con `householdId` condiviso.
2. ✅ **Gestione frigo e scadenze** — CRUD prodotti, badge colorati in base a
   quanto manca alla scadenza (verde oltre 5 giorni, senape entro 5, pomodoro
   se scade oggi o è scaduto).
3. ✅ **Catalogo ricette e stagionalità** — anagrafica ricette + calendario
   verdure di stagione, filtro "solo stagionale", generatore rule-based.
4. ✅ **Pianificatore menu settimanale** — vista 7 giorni x pranzo/cena, con
   stato per slot (`da_pianificare` / `fuori` / `pianificato`) e commensali
   selezionabili per ogni pasto.
5. ✅ **Lista della spesa automatica e condivisa** — generata confrontando gli
   ingredienti dei pasti pianificati con quello che c'è già in frigo,
   aggiornamento realtime tra i dispositivi (via Convex).
6. ✅ **PWA, offline e rifiniture** — manifest, service worker, installazione
   da home screen, design system applicato.

Oltre alla roadmap iniziale:

- ✅ **Categorie del frigo** — tabella `categorie` per household, 12 proposte di
  partenza, scelta a chip nel form del prodotto con creazione al volo.
- ✅ **Diete e macro** — porzioni per singolo commensale, valori nutrizionali
  facoltativi sulle ricette, obiettivo giornaliero per commensale e riepilogo
  per giorno nel pianificatore.
- ✅ **Colazione** — terzo pasto della giornata (gli spuntini restano fuori).
  Ogni ricetta dichiara a quali pasti è adatta, così il generatore non propone
  il risotto alle otto di mattina.
- ✅ **Generatore che guarda la dispensa** — a parità di vincoli preferisce le
  ricette che usano quello che hai già, con peso triplo ai prodotti in scadenza,
  scalando le scorte man mano che assegna e segnalando cosa scade senza finire
  in nessun pasto.
- ✅ **Vista "cosa posso cucinare adesso"** — il generatore girato al contrario:
  le ricette ordinate da quelle che riesci a fare subito a quelle che
  richiedono più spesa, con quanto manca di preciso, un bottone per mandarlo in
  lista e uno per dire "ce l'ho già" e metterlo in dispensa.
- ✅ **Criterio unico per la dispensa** — generatore e vista "ora" giudicano le
  scorte con la stessa funzione, quantità comprese.
- ✅ **Nome generico sui prodotti** — i fusilli rispondono anche a "pasta", così
  le ricette usano quello che c'è invece di mandarti a comprare il doppione.
- ✅ **Modifica dei prodotti in dispensa** — serviva per correggere le quantità
  man mano che si consumano.
- ✅ **Modifica delle ricette** — prima si potevano solo creare ed eliminare.

- ✅ **Fase 2 del generatore (AI)** — bottone separato che fa pianificare la
  settimana intera a Claude. Opzionale e a consumo: vedi *Generatore con AI*.

## Setup

```bash
npm install
npx convex dev        # tiene allineati schema e funzioni
npm run dev
```

Le chiavi di firma (`SITE_URL`, `JWT_PRIVATE_KEY`, `JWKS`) sono già impostate
sul deployment di sviluppo. Per far funzionare il login servono le credenziali
OAuth, da creare a mano e impostare così:

```bash
# Google → console.cloud.google.com › API e servizi › Credenziali › ID client OAuth
#   Origine JavaScript autorizzata: http://localhost:5173
#   URI di reindirizzamento:        https://impressive-okapi-915.eu-west-1.convex.site/api/auth/callback/google
npx convex env set AUTH_GOOGLE_ID <client-id>
npx convex env set AUTH_GOOGLE_SECRET <client-secret>
```

Gli URL di callback sopra valgono per il deployment **dev**: sono
`VITE_CONVEX_SITE_URL` (in `.env.local`) + `/api/auth/callback/<provider>`.
Attenzione alla regione: il dominio è `...eu-west-1.convex.site`, non
`...convex.site`. In produzione ripetere con `--prod`, usando il site URL del
deployment di produzione e l'URL del sito al posto di localhost.

Con audience *External* in stato *Testing*, Google lascia entrare solo gli
account elencati come utenti di test: vanno aggiunti sia il tuo che quello di
Marco.

## Andare in produzione (Vercel + Convex)

Il frontend sta su Vercel, il backend sul deployment di produzione di Convex.
`vercel.json` è già configurato: il comando di build è
`npx convex deploy --cmd 'npm run build'`, che in un colpo solo pubblica le
funzioni Convex su produzione, si fa dare da Convex la `VITE_CONVEX_URL` giusta
e costruisce il frontend con quella dentro.

**Il repo ha l'app in una sottocartella**, quindi su Vercel va impostata la
*Root Directory* su `meal-plan`, altrimenti non trova il `package.json`.

Nell'ordine — le prime due date non si conoscono prima di aver fatto il primo
deploy, ed è per questo che i passaggi sono in quest'ordine e non in un altro:

1. **Chiave di deploy**: dashboard Convex → il progetto → Settings → Deploy Keys
   → genera quella di *produzione*.
2. **Vercel**: importa il repo, Root Directory `meal-plan`, e aggiungi la
   variabile d'ambiente `CONVEX_DEPLOY_KEY` con quella chiave. Fai il primo
   deploy: fallirà l'autenticazione dell'app, ma crea il deployment di
   produzione Convex e ti assegna un dominio `...vercel.app`.
3. **Chiavi di firma su produzione** — usa il dominio Vercel del passo 2:

   ```bash
   npx @convex-dev/auth --prod --web-server-url https://<progetto>.vercel.app
   ```

   Imposta `SITE_URL`, `JWT_PRIVATE_KEY` e `JWKS` sul deployment di produzione.

4. **Credenziali OAuth e chiave API su produzione**:

   ```bash
   npx convex env set --prod AUTH_GOOGLE_ID <client-id>
   npx convex env set --prod AUTH_GOOGLE_SECRET <client-secret>
   npx convex env set --prod ANTHROPIC_API_KEY <chiave>
   npx convex env set --prod ANTHROPIC_MODEL claude-sonnet-5
   ```

5. **URI di callback**: nella OAuth app di Google aggiungi quello di
   produzione, *senza togliere* quello di sviluppo — servono entrambi. Il
   dominio è il site URL del deployment di **produzione**, diverso da quello di
   dev:

   ```
   https://<deployment-prod>.<regione>.convex.site/api/auth/callback/google
   ```

   Su Google aggiungi anche `https://<progetto>.vercel.app` fra le origini
   JavaScript autorizzate.

6. **Ridistribuisci** da Vercel. Le variabili Convex si leggono a runtime, quindi
   non serve ripubblicare il backend dopo il passo 4.

7. **Il database di produzione parte vuoto.** Non è una copia di quello di
   sviluppo: household, ricette, dispensa e categorie non ci sono. Dopo il primo
   login su produzione crea il gruppo dall'app (le categorie arrivano da sole),
   recupera l'id del nuovo household e semina il resto:

   ```bash
   npx convex data --prod households                     # per leggere l'id
   npx convex run --prod seed:ricette   '{"householdId": "<id-prod>"}'
   npx convex run --prod seed:dispensa  '{"householdId": "<id-prod>"}'
   ```

   Oppure non seminare niente e inserire le cose vere a mano: il seed nasce come
   dato di partenza per provare, non come contenuto definitivo.

### Chiave di deploy e ambienti Vercel

`CONVEX_DEPLOY_KEY` va impostata **solo sull'ambiente Production**. Se la si
lascia anche su Preview, ogni build di un branch pubblicherebbe le proprie
funzioni e il proprio schema sul deployment di *produzione*. Per avere anche le
preview funzionanti serve una preview deploy key separata, generata a parte.

### Chi può entrare (Google)

L'OAuth app di Google ha uno stato di pubblicazione, e per un'app di casa la
scelta giusta è **restare in *Testing***:

- **Testing**: entrano solo gli account elencati come utenti di test, fino a
  100. È una lista di autorizzazione — esattamente quello che serve a un'app
  privata.
- **In produzione**: entra chiunque abbia un account Google. Per gli scope
  di base (email e profilo) non serve la verifica di Google, quindi si può
  pubblicare senza review; la verifica riguarda gli scope sensibili (Gmail,
  Drive...), che questa app non chiede.

Pubblicare vorrebbe dire lasciare che chiunque crei un household dentro il tuo
deployment. Per Davide non serve comunque nulla: è un commensale senza account.

### Come si condivide con Marco

Chi crea il gruppo trova il **codice invito** nella scheda *Gruppo*. Marco fa
login e sceglie "Ho un codice". Davide, che non ha account, si aggiunge come
commensale sempre dalla scheda *Gruppo*: comparirà tra i selezionabili di ogni
pasto senza bisogno di un login.

## Generatore di menu — logica

- **Fase 1 (rule-based)**, nell'ordine:
  1. tengo solo le ricette adatte al pasto dello slot (`pastiAdatti`);
  2. tengo solo quelle di stagione per il mese di quel giorno;
  3. scarto quelle cucinate negli ultimi 21 giorni (`menuStorico`);
  4. se così non resta nulla allento i vincoli a scalini, invece di lasciare lo
     slot vuoto: prima riammetto quelle già usate di recente, poi quelle già
     usate in settimana partendo dalle meno ripetute;
  5. fra i candidati rimasti preferisco chi **svuota la dispensa**: ogni
     ingrediente ancora disponibile vale 1 punto, 3 se il prodotto scade entro
     5 giorni. A parità di punteggio scelgo a caso, così due generazioni della
     stessa settimana non sono identiche.

  Man mano che assegna, il generatore **scala la dispensa**: dopo aver messo
  300 g di zucchine al lunedì, al martedì ne restano 100 e il bonus si spegne
  quando la scorta finisce. Senza questo passaggio la stessa confezione avrebbe
  fatto da bonus a tutti e 21 gli slot. Quando il conto non si può fare —
  quantità ignota, o unità diverse fra ricetta e dispensa — la scorta viene
  considerata esaurita dopo un uso: è la scelta prudente, perché insistere su un
  prodotto di cui non si sa quanto ce n'è è esattamente ciò che genera sprechi.

  A fine generazione riporta i prodotti **in scadenza che nessun pasto usa**:
  è lo spreco che il generatore da solo non può evitare, perché nessuna ricetta
  in catalogo li prevede.

  Gli slot con stato `fuori` vengono saltati, e le porzioni si scalano sui
  commensali dello slot.
- **Fase 2 (AI-assisted)**: vedi sotto.

## Frigo e dispensa

Sono la stessa tabella (`prodottiFrigo`).

Le scorte si scrivono come **pezzi × contenuto**, perché "3 confezioni di
passata" da solo non basta per calcolare la spesa:

| Cosa hai | pezzi | quantità | unità | totale |
|---|---|---|---|---|
| 3 passate da 700 g | 3 | 700 | g | 2100 g |
| 6 uova | 6 | — | pz | 6 pz |
| 1 kg di pasta sfusa | — | 1000 | g | 1000 g |
| sale (non lo conto) | — | — | — | ignoto |

Il totale è `pezzi × contenuto`; con entrambi assenti la quantità resta ignota,
e la lista della spesa in quel caso assume che basti invece di inventarsi un
numero.

### Nome generico

Le ricette parlano per categorie (`pasta`, `riso`, `frutta fresca`), la
dispensa per prodotti (`fusilli`, `riso basmati`, `pesche`). Il campo
**generico** fa da ponte: un prodotto risponde sia al proprio nome sia a quello
generico, così una ricetta che chiede pasta usa i fusilli che hai davvero senza
costringerti a chiamarli "pasta" sullo scaffale.

Il form suggerisce come generici i nomi che le ricette usano davvero: sceglierne
uno da lì è l'unico modo di essere certi che il collegamento scatti.

La scadenza è **facoltativa**. Un prodotto fresco ce l'ha e finisce in cima alla lista con
il badge colorato; la roba di dispensa (pasta, riso, scatolame) può non averla
e resta in fondo con un badge neutro, senza generare allarmi.

I nomi contano: la lista della spesa sottrae quello che hai già confrontando il
nome dell'ingrediente con quello del prodotto (normalizzato per maiuscole e
spazi), e il generatore usa lo stesso confronto per capire cosa puoi già
cucinare. Per tenerli coerenti, il campo ingrediente nel form delle ricette
suggerisce i nomi già presenti in dispensa e nelle altre ricette.

## Cosa posso cucinare adesso

`convex/cucina.ts` risponde alla domanda opposta a quella del pianificatore:
non "riempi la settimana" ma "stasera cosa tiro fuori". Per ogni ricetta
calcola cosa manca rispetto alla dispensa, scalato sulle persone a tavola, e
ordina mettendo davanti quelle fattibili subito e, a parità, quelle che
consumano roba in scadenza.

È una **fotografia dell'istante**, non un piano: ogni ricetta è valutata da
sola, quindi due piatti in elenco possono contare sulla stessa confezione. Ha
senso così — stai scegliendo un piatto, non sette.

Le due funzioni usano lo stesso metro: `analizzaCopertura` in `convex/lib.ts`.
Un ingrediente conta come coperto solo se ce n'è **abbastanza** per le porzioni
richieste — 125 g di mozzarella non bastano per una parmigiana che ne vuole 200,
e né la vista né il generatore fanno finta di sì.

Dai risultati mancanti si può fare due cose: mandarli in lista della spesa,
oppure — toccando il singolo ingrediente — dichiarare che ce l'hai già e
metterlo in dispensa. Serve per quando te ne eri dimenticata: il prodotto si
somma a quello che c'è già, perché la dispensa ragiona per nome, non per riga.

## Generatore con AI

`convex/menuAI.ts` è una Convex action (runtime Node) che manda a Claude
catalogo, dispensa con le scadenze, storico recente e slot da riempire, e si fa
restituire la settimana intera. Serve a superare il limite principale del
generatore rule-based: guardare i pasti tutti insieme invece che uno alla volta,
e quindi ragionare sugli incastri — la mozzarella da finire prima del 23, il
pacco di pasta da distribuire, i piatti pesanti da non mettere due sere di fila.

Scelte di progetto:

- **È un bottone separato, non il default.** Il generatore rule-based resta
  gratuito e sempre disponibile; l'AI si usa quando la si chiede.
- **Il generatore non inventa ricette**: assegna solo piatti già in catalogo.
  Per aggiungerne di nuovi c'è la funzione apposita (sotto), che passa dalla tua
  approvazione.
- **Il modello propone, il database decide.** `menuContesto.applica` accetta
  solo assegnazioni che corrispondono a una ricetta esistente e a uno slot
  valido della settimana; il resto viene scartato e contato. Gli slot marcati
  `fuori` e quelli già pianificati non si toccano senza `sovrascrivi`. Così una
  risposta sbagliata del modello non può inventare dati.
- **Output strutturato** (`output_config.format` con uno schema JSON), non testo
  libero da interpretare.
- **Il costo è in chiaro**: ogni generazione riporta la spesa stimata dai token
  effettivamente consumati.
- **Le preferenze sono dell'utente, non del codice.** Il campo *Come vi piace
  mangiare* (scheda Gruppo) è testo libero che finisce nel prompt e prevale
  sulle regole generiche. È l'unico posto dove si dice all'app *come* vi piace
  mangiare: tutto il resto sono dati.

### Ricette proposte da Claude

`convex/ricetteAI.ts` propone ricette nuove partendo da quello che hai in casa
e **non compare in nessuna ricetta** — il caso tipico è la feta comprata senza
sapere cosa farci. Riceve anche i nomi di ingrediente già in uso, per non
inventare varianti (`passata` vs `passata di pomodoro`) che romperebbero la
sottrazione della spesa.

Le proposte **non entrano in catalogo da sole**: si vedono per intero e si
aggiungono una alla volta. Il catalogo è il cuore dei dati — spesa,
stagionalità e generatore dipendono da lì — e riempirlo senza guardare sarebbe
il modo più rapido di renderlo inservibile.

### Avanzi

Un pasto può essere marcato `avanzo`: si mangia una cottura precedente della
stessa ricetta invece di rifarla. Serve al modo di cucinare più comune in
settimana — si cuoce di più a cena e si porta la porzione in più a pranzo.

Non cambia la lista della spesa, e vale la pena capire perché: gli ingredienti
servono per le porzioni **totali**, e cuocere quattro porzioni in una volta
costa quanto cuocerne due per due volte. La spesa somma già i due slot.

Configurazione — la chiave vive nelle env del deployment, mai nel repo:

```bash
npx convex env set ANTHROPIC_API_KEY <chiave>
npx convex env set ANTHROPIC_MODEL claude-sonnet-5   # facoltativo
```

Senza `ANTHROPIC_API_KEY` il bottone dà un errore leggibile e il resto dell'app
continua a funzionare. Il default è `claude-opus-5`; l'ordine di grandezza è di
qualche decina di centesimi di dollaro per generazione con Opus, meno della metà
con Sonnet.

## Limiti noti

**Il generatore rule-based è goloso, non ottimizza la settimana.** Sceglie il
piatto migliore per il primo slot, poi per il secondo, e non torna mai indietro.
Non si chiede se spostando la parmigiana al martedì userebbe la mozzarella prima
che scada, né come far tornare i conti su una confezione intera. È esattamente
il limite che il generatore con AI aggira.

**La soglia di urgenza è fissa a 5 giorni** (`GIORNI_URGENZA` in `convex/lib.ts`).
Un prodotto che scade fra 7 giorni non riceve il peso triplo.

## Diete e valori nutrizionali

Pensato per chi in casa segue una dieta con grammature da rispettare.

- **Porzioni per commensale**: in ogni slot ogni commensale ha le sue porzioni
  (passo 0,5). Chi è a dieta può mangiarne 1,5 e la lista della spesa scala di
  conseguenza — il fattore è *somma delle porzioni / porzioni della ricetta*,
  non il numero di teste.
- **Macro sulle ricette**: kcal, proteine, carboidrati e grassi *per porzione*,
  tutti facoltativi. Si compilano solo sulle ricette che interessano davvero;
  dove mancano l'app lo dice invece di far finta che siano zero.
- **Obiettivo per commensale**: si imposta dalla scheda *Gruppo*, sotto il nome.
  Svuotando tutti i campi la dieta viene tolta.
- **Riepilogo giornaliero**: nel pianificatore, sotto ogni giorno, per chi ha un
  obiettivo. Verde se si è entro il ±10% della meta, senape se si è sotto,
  pomodoro se si è sopra.

Un limite dichiarato: **il conteggio copre solo pranzo e cena**, perché
colazione e spuntini l'app non li modella. L'etichetta lo scrive sotto ogni
riepilogo, così il numero non viene scambiato per un totale giornaliero.

## Design system — sintesi

- **Colori**: fondo `#F2E8D5`, testo `#2B2622`, accento primario (pomodoro)
  `#C1432B`, accento secondario (senape) `#D9A02C`, verde salvia `#5F7350`,
  bordi `#D8CBB4`.
- **Font**: Gaegu (Google Fonts) scritto a mano per titoli e UI; monospace da
  macchina da scrivere (IBM Plex Mono) per liste della spesa, scadenze e dati.
  Gaegu ha un'altezza della x molto bassa — alla stessa misura in pixel si legge
  parecchio più piccolo di un grottesco — quindi le misure dei titoli in
  `src/index.css` sono già compensate verso l'alto. Ha solo i pesi 300/400/700:
  chiedere 500 o 600 farebbe sintetizzare il grassetto al browser.
- **Stile**: ispirato a scontrini/ricevute di mercato — bordi tratteggiati
  invece di ombre, poco arrotondamento, niente glass/gradiente decorativo.

Il design system dettagliato e le schermate sono in lavorazione su Claude
Design.

## Struttura

**Backend (`convex/`)**

- `schema.ts` — schema completo delle tabelle (incluse quelle di
  `@convex-dev/auth`).
- `auth.ts`, `auth.config.ts`, `http.ts` — configurazione OAuth.
- `lib.ts` — helper condivisi: risoluzione dell'household dell'utente loggato,
  aritmetica sulle date ISO, normalizzazione dei nomi ingrediente.
- `households.ts` — creazione gruppo, ingresso con codice, commensali senza
  account.
- `frigo.ts`, `ricette.ts`, `stagionalita.ts` — CRUD e stagionalità.
- `categorie.ts` — elenco dei suggerimenti per le categorie del frigo. Il
  prodotto salva il *nome* della categoria, non un riferimento: cancellare una
  categoria non lascia prodotti orfani (ma non rinomina quelli già salvati).
- `seed.ts` — `internalMutation` non raggiungibili dal client, idempotenti:
  `seed:ricette` e `seed:categorie`, entrambe con argomento `householdId`.
- `pianificatore.ts` — settimana, stato degli slot, generatore rule-based,
  archiviazione nello storico.
- `spesa.ts` — lista condivisa e generazione automatica.
- `seedData/` — dati statici di partenza: calendario di stagionalità delle
  verdure in Italia mese per mese, categorie del frigo, ricette di esempio.

**Frontend (`src/`)**

- `index.css` — tutti i token del design system: cambiarli qui riallinea
  l'intera app senza toccare i componenti.
- `components/` — una schermata per sezione, più `ui.tsx` con i mattoncini
  condivisi.
- `lib/date.ts` — date ISO senza sorprese di fuso orario.
- `lib/macro.ts` — somma dei macro per commensale e confronto con l'obiettivo.
