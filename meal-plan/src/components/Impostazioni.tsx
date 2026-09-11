import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { messaggioErrore } from "../lib/errori";
import type { ChiaveMacro, Macro } from "../lib/macro";
import { CHIAVI_MACRO, arrotonda, macroCompilato } from "../lib/macro";
import { Carta, Errore } from "./ui";

type RicettaImport = {
  slug?: string;
  nome: string;
  tags: string[];
  ingredienti: { nome: string; quantita?: number; unita?: string }[];
  porzioni: number;
  pastiAdatti?: ("colazione" | "pranzo" | "cena")[];
  macro?: Macro;
  stagioni: string[];
  tempoMinuti?: number;
  preparazione?: string[];
  note?: string;
};

/**
 * Obiettivo nutrizionale giornaliero di un commensale. Serve a chi segue una
 * dieta: il pianificatore confronta questi valori con i pasti del giorno.
 */
function Obiettivo({ membro }: { membro: Doc<"householdMembers"> }) {
  const impostaObiettivo = useMutation(api.households.impostaObiettivo);
  const [aperto, setAperto] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [valori, setValori] = useState<Record<ChiaveMacro, string>>(() => ({
    kcal: membro.obiettivo?.kcal?.toString() ?? "",
    proteine: membro.obiettivo?.proteine?.toString() ?? "",
    carboidrati: membro.obiettivo?.carboidrati?.toString() ?? "",
    grassi: membro.obiettivo?.grassi?.toString() ?? "",
  }));

  const salva = () => {
    setErrore(null);
    const obiettivo: Macro = {};
    for (const { chiave } of CHIAVI_MACRO) {
      const numero = Number.parseFloat(valori[chiave]);
      if (Number.isFinite(numero)) obiettivo[chiave] = numero;
    }
    void impostaObiettivo({
      membroId: membro._id,
      obiettivo: macroCompilato(obiettivo) ? obiettivo : null,
    })
      .then(() => { setAperto(false); })
      .catch((e: unknown) => { setErrore(messaggioErrore(e)); });
  };

  const attivo = macroCompilato(membro.obiettivo);

  return (
    <div className="colonna">
      <button
        type="button"
        className="bottone bottone--fantasma bottone--piccolo"
        aria-expanded={aperto}
        onClick={() => { setAperto((v) => !v); }}
      >
        {attivo ? "Modifica dieta" : "+ Imposta una dieta"}
      </button>

      {attivo && !aperto && (
        <div className="riga riga--avvolgi">
          {CHIAVI_MACRO.map(({ chiave, breve }) => {
            const valore = membro.obiettivo?.[chiave];
            if (valore === undefined) return null;
            return (
              <span className="etichetta" key={chiave}>
                {breve} {arrotonda(valore)}
              </span>
            );
          })}
        </div>
      )}

      {aperto && (
        <>
          <span className="dati tenue piccolo">
            Obiettivo giornaliero. Lascia vuoto quello che non ti interessa;
            svuotando tutto la dieta viene tolta.
          </span>
          <div className="griglia-campi">
            {CHIAVI_MACRO.map(({ chiave, lungo }) => (
              <input
                key={chiave}
                type="number"
                step="any"
                min="0"
                value={valori[chiave]}
                placeholder={lungo}
                aria-label={`${lungo} per ${membro.displayName}`}
                onChange={(e) => {
                  setValori((p) => ({ ...p, [chiave]: e.target.value }));
                }}
              />
            ))}
          </div>
          <button type="button" className="bottone bottone--piccolo" onClick={salva}>
            Salva
          </button>
          <Errore messaggio={errore} />
        </>
      )}
    </div>
  );
}

const PREFERENZE_ESEMPIO = `Ricette semplici, poco tempo ai fornelli nei giorni feriali.
A pranzo e a cena ci devono essere quasi sempre tutte e tre le categorie: proteine, carboidrati e verdura.
Cucino di piu' a cena: quando ha senso prevedi una porzione in piu' e mettila come avanzo il giorno dopo a pranzo, che ce la portiamo in ufficio.
Alterna i tipi di piatto: non due volte pasta di fila, non due volte pesce di fila.
La domenica a pranzo di solito siamo fuori.`;

/**
 * Istruzioni libere per il generatore con AI. Sono l'unico posto in cui si
 * dice all'app *come* vi piace mangiare: tutto il resto sono dati.
 */
function Preferenze({ household }: { household: Doc<"households"> }) {
  const impostaPreferenze = useMutation(api.households.impostaPreferenze);
  const [testo, setTesto] = useState(household.preferenze ?? "");
  const [salvato, setSalvato] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  const salva = () => {
    setErrore(null);
    void impostaPreferenze({ preferenze: testo })
      .then(() => { setSalvato(true); })
      .catch((e: unknown) => { setErrore(messaggioErrore(e)); });
  };

  return (
    <Carta titolo="Come vi piace mangiare">
      <p className="dati tenue piccolo">
        Le legge solo il generatore con Claude, e vengono prima delle sue regole
        generiche. Scrivi come parleresti a una persona.
      </p>
      <textarea
        rows={8}
        value={testo}
        placeholder="Ricette semplici, poco tempo ai fornelli…"
        onChange={(e) => {
          setTesto(e.target.value);
          setSalvato(false);
        }}
      />
      <div className="riga">
        <button
          type="button"
          className="bottone bottone--primario bottone--piccolo crescente"
          onClick={salva}
        >
          {salvato ? "Salvate" : "Salva preferenze"}
        </button>
        {testo.trim() === "" && (
          <button
            type="button"
            className="bottone bottone--fantasma bottone--piccolo"
            onClick={() => {
              setTesto(PREFERENZE_ESEMPIO);
              setSalvato(false);
            }}
          >
            Parti da un esempio
          </button>
        )}
      </div>
      <Errore messaggio={errore} />
    </Carta>
  );
}

const JSON_RICETTE_ESEMPIO = `[
  {
    "nome": "Pasta con zucchine e ricotta",
    "tags": ["vegetariano", "veloce"],
    "ingredienti": [
      { "nome": "pasta", "quantita": 320, "unita": "g" },
      { "nome": "zucchine", "quantita": 400, "unita": "g" },
      { "nome": "ricotta", "quantita": 200, "unita": "g" }
    ],
    "porzioni": 4,
    "pastiAdatti": ["pranzo", "cena"],
    "stagioni": ["giugno", "luglio", "agosto", "settembre"],
    "tempoMinuti": 25,
    "preparazione": [
      "Cuoci la pasta.",
      "Salta le zucchine in padella.",
      "Manteca con ricotta e poca acqua di cottura."
    ]
  }
]`;

function AdminRicette() {
  const importa = useMutation(api.ricette.importa);
  const [json, setJson] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [esito, setEsito] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);

  const normalizzaRicette = (): RicettaImport[] => {
    const parsed: unknown = JSON.parse(json);
    const ricette = Array.isArray(parsed) ? parsed : [parsed];
    return ricette.map((valore) => {
      if (typeof valore !== "object" || valore === null) {
        throw new Error("Il JSON deve contenere oggetti ricetta.");
      }
      const ricetta = valore as Partial<RicettaImport>;
      if (typeof ricetta.nome !== "string" || ricetta.nome.trim() === "") {
        throw new Error("Ogni ricetta deve avere un nome.");
      }
      if (!Array.isArray(ricetta.ingredienti)) {
        throw new Error(`"${ricetta.nome}" deve avere un array ingredienti.`);
      }
      return {
        nome: ricetta.nome.trim(),
        slug: ricetta.slug?.trim() === "" ? undefined : ricetta.slug,
        tags: Array.isArray(ricetta.tags) ? ricetta.tags.map(String) : [],
        ingredienti: ricetta.ingredienti.map((ingrediente) => ({
          nome: String(ingrediente.nome ?? "").trim(),
          quantita:
            typeof ingrediente.quantita === "number" ? ingrediente.quantita : undefined,
          unita: ingrediente.unita === undefined ? undefined : String(ingrediente.unita),
        })).filter((ingrediente) => ingrediente.nome !== ""),
        porzioni:
          typeof ricetta.porzioni === "number" && ricetta.porzioni > 0
            ? ricetta.porzioni
            : 2,
        pastiAdatti: ricetta.pastiAdatti,
        macro: ricetta.macro,
        stagioni: Array.isArray(ricetta.stagioni) ? ricetta.stagioni.map(String) : [],
        tempoMinuti:
          typeof ricetta.tempoMinuti === "number" && ricetta.tempoMinuti > 0
            ? ricetta.tempoMinuti
            : undefined,
        preparazione: Array.isArray(ricetta.preparazione)
          ? ricetta.preparazione.map(String).filter((passo) => passo.trim() !== "")
          : undefined,
        note: ricetta.note,
      };
    });
  };

  const importaJson = () => {
    setErrore(null);
    setEsito(null);
    let ricette: RicettaImport[];
    try {
      ricette = normalizzaRicette();
    } catch (e: unknown) {
      setErrore(e instanceof Error ? e.message : "JSON non valido.");
      return;
    }

    setInCorso(true);
    void importa({ ricette })
      .then((risultato) => {
        setEsito(`${risultato.inserite} ricette importate.`);
        setJson("");
      })
      .catch((e: unknown) => { setErrore(messaggioErrore(e)); })
      .finally(() => { setInCorso(false); });
  };

  return (
    <Carta titolo="Admin ricette">
      <div className="colonna">
        <p className="dati tenue piccolo">
          Incolla una ricetta o un array di ricette in JSON. L'import aggiunge
          nuove righe al ricettario.
        </p>
        <textarea
          rows={12}
          value={json}
          placeholder={JSON_RICETTE_ESEMPIO}
          onChange={(e) => {
            setJson(e.target.value);
            setErrore(null);
            setEsito(null);
          }}
        />
        <div className="riga">
          <button
            type="button"
            className="bottone bottone--primario bottone--piccolo crescente"
            disabled={json.trim() === "" || inCorso}
            onClick={importaJson}
          >
            {inCorso ? "Importo..." : "Importa JSON"}
          </button>
          {json.trim() === "" && (
            <button
              type="button"
              className="bottone bottone--fantasma bottone--piccolo"
              onClick={() => { setJson(JSON_RICETTE_ESEMPIO); }}
            >
              Esempio
            </button>
          )}
        </div>
        {esito !== null && <span className="badge badge--ok">{esito}</span>}
        <Errore messaggio={errore} />
      </div>
    </Carta>
  );
}

export function Impostazioni({
  household,
  membri,
}: {
  household: Doc<"households">;
  membri: Doc<"householdMembers">[];
}) {
  const { signOut } = useAuthActions();
  const aggiungiCommensale = useMutation(api.households.aggiungiCommensale);
  const rimuoviCommensale = useMutation(api.households.rimuoviCommensale);

  const [nuovo, setNuovo] = useState("");
  const [errore, setErrore] = useState<string | null>(null);

  const aggiungi = (evento: React.FormEvent) => {
    evento.preventDefault();
    setErrore(null);
    const nome = nuovo.trim();
    if (nome === "") return;
    void aggiungiCommensale({ displayName: nome })
      .then(() => { setNuovo(""); })
      .catch((e: unknown) => { setErrore(messaggioErrore(e)); });
  };

  return (
    <>
      <Carta titolo={household.name}>
        <p className="dati tenue piccolo">
          Codice invito — chi lo inserisce entra in questo gruppo.
        </p>
        <p className="dati" style={{ fontSize: "1.4rem", letterSpacing: "0.3em" }}>
          {household.codiceInvito}
        </p>
      </Carta>

      <Preferenze household={household} />

      <AdminRicette />

      <Carta titolo="Commensali">
        <ul className="lista">
          {membri.map((membro) => (
            <li key={membro._id} className="colonna" style={{ alignItems: "stretch" }}>
              <div className="riga">
              <span className="crescente dati">{membro.displayName}</span>
              {membro.userId === undefined ? (
                <>
                  <span className="etichetta">senza account</span>
                  <button
                    type="button"
                    className="bottone--icona"
                    aria-label={`Rimuovi ${membro.displayName}`}
                    onClick={() => {
                      void rimuoviCommensale({ membroId: membro._id }).catch(
                        (e: unknown) => { setErrore(messaggioErrore(e)); }
                      );
                    }}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <span className="badge badge--ok">account</span>
              )}
              </div>
              <Obiettivo membro={membro} />
            </li>
          ))}
        </ul>
        <hr className="separatore" />
        <form className="riga" onSubmit={aggiungi}>
          <input
            type="text"
            className="crescente"
            value={nuovo}
            placeholder="Ospite occasionale…"
            onChange={(e) => { setNuovo(e.target.value); }}
          />
          <button type="submit" className="bottone bottone--piccolo">
            +
          </button>
        </form>
        <Errore messaggio={errore} />
      </Carta>

      <button
        type="button"
        className="bottone"
        onClick={() => { void signOut(); }}
      >
        Esci
      </button>
    </>
  );
}
