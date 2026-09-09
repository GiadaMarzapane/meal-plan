import { useAction, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import {MESI, meseDiIso, oggiIso} from "../lib/date";
import { formattaQuantita } from "../lib/quantita";
import { messaggioErrore } from "../lib/errori";
import type { ChiaveMacro, Macro } from "../lib/macro";
import { CHIAVI_MACRO, arrotonda, macroCompilato } from "../lib/macro";
import { Campo, Carta, Errore, Vuoto } from "./ui";

type RigaIngrediente = { nome: string; quantita: string; unita: string };

const RIGA_VUOTA: RigaIngrediente = { nome: "", quantita: "", unita: "" };

const PASTI = [
  { valore: "colazione", etichetta: "colazione" },
  { valore: "pranzo", etichetta: "pranzo" },
  { valore: "cena", etichetta: "cena" },
] as const;

type Pasto = (typeof PASTI)[number]["valore"];

/** Id della lista di suggerimenti per i nomi degli ingredienti. */
const ID_SUGGERIMENTI = "suggerimenti-ingredienti";

/**
 * Stesso modulo per creare e per modificare: passando `ricetta` i campi
 * partono compilati e il salvataggio aggiorna invece di inserire.
 */
function ModuloRicetta({
  ricetta,
  onFatto,
  onAnnulla,
}: {
  ricetta?: Doc<"ricette">;
  onFatto: () => void;
  onAnnulla?: () => void;
}) {
  const aggiungi = useMutation(api.ricette.aggiungi);
  const modifica = useMutation(api.ricette.modifica);

  const [nome, setNome] = useState(ricetta?.nome ?? "");
  const [porzioni, setPorzioni] = useState(String(ricetta?.porzioni ?? 2));
  const [tags, setTags] = useState(ricetta?.tags.join(", ") ?? "");
  const [stagioni, setStagioni] = useState<string[]>(ricetta?.stagioni ?? []);
  const [pastiAdatti, setPastiAdatti] = useState<Pasto[]>(
    ricetta?.pastiAdatti ?? ["pranzo", "cena"]
  );
  const [righe, setRighe] = useState<RigaIngrediente[]>(() =>
    ricetta === undefined || ricetta.ingredienti.length === 0
      ? [RIGA_VUOTA]
      : ricetta.ingredienti.map((ing) => ({
          nome: ing.nome,
          quantita: ing.quantita?.toString() ?? "",
          unita: ing.unita ?? "",
        }))
  );
  const [macro, setMacro] = useState<Record<ChiaveMacro, string>>(() => ({
    kcal: ricetta?.macro?.kcal?.toString() ?? "",
    proteine: ricetta?.macro?.proteine?.toString() ?? "",
    carboidrati: ricetta?.macro?.carboidrati?.toString() ?? "",
    grassi: ricetta?.macro?.grassi?.toString() ?? "",
  }));
  const [errore, setErrore] = useState<string | null>(null);

  const cambiaRiga = (indice: number, campo: keyof RigaIngrediente, valore: string) => {
    setRighe((precedenti) =>
      precedenti.map((riga, i) => (i === indice ? { ...riga, [campo]: valore } : riga))
    );
  };

  const alternaPasto = (pasto: Pasto) => {
    setPastiAdatti((precedenti) =>
      precedenti.includes(pasto)
        ? precedenti.filter((p) => p !== pasto)
        : [...precedenti, pasto]
    );
  };

  const alternaMese = (mese: string) => {
    setStagioni((precedenti) =>
      precedenti.includes(mese)
        ? precedenti.filter((m) => m !== mese)
        : [...precedenti, mese]
    );
  };

  const invia = (evento: React.FormEvent) => {
    evento.preventDefault();
    setErrore(null);
    const numeroPorzioni = Number.parseInt(porzioni, 10);
    const ingredienti = righe
      .filter((riga) => riga.nome.trim() !== "")
      .map((riga) => {
        const quantita = Number.parseFloat(riga.quantita);
        return {
          nome: riga.nome.trim(),
          quantita: Number.isFinite(quantita) ? quantita : undefined,
          unita: riga.unita.trim() === "" ? undefined : riga.unita.trim(),
        };
      });

    // I macro sono facoltativi: mando l'oggetto solo se almeno un campo c'è.
    const macroCompilati: Macro = {};
    for (const { chiave } of CHIAVI_MACRO) {
      const valore = Number.parseFloat(macro[chiave]);
      if (Number.isFinite(valore)) macroCompilati[chiave] = valore;
    }

    const campi = {
      nome: nome.trim(),
      macro: macroCompilato(macroCompilati) ? macroCompilati : undefined,
      porzioni: Number.isFinite(numeroPorzioni) && numeroPorzioni > 0 ? numeroPorzioni : 2,
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t !== ""),
      stagioni,
      pastiAdatti,
      ingredienti,
      // La nota non è nel modulo: la ricopio per non cancellarla salvando.
      note: ricetta?.note,
    };

    const azione =
      ricetta === undefined
        ? aggiungi(campi)
        : modifica({ ricettaId: ricetta._id, ...campi });

    void azione
      .then(onFatto)
      .catch((e: unknown) => { setErrore(messaggioErrore(e)); });
  };

  return (
    <form className="colonna" onSubmit={invia}>
      <Campo etichetta="Nome della ricetta">
        <input
          type="text"
          value={nome}
          placeholder="Pasta con la zucca"
          onChange={(e) => { setNome(e.target.value); }}
        />
      </Campo>
      <div className="griglia-campi">
        <Campo etichetta="Porzioni">
          <input
            type="number"
            min="1"
            value={porzioni}
            onChange={(e) => { setPorzioni(e.target.value); }}
          />
        </Campo>
        <Campo etichetta="Tag (separati da virgola)">
          <input
            type="text"
            value={tags}
            placeholder="vegetariano, veloce"
            onChange={(e) => { setTags(e.target.value); }}
          />
        </Campo>
      </div>

      <div className="campo">
        <span>Ingredienti (per {porzioni} porzioni)</span>
        {righe.map((riga, indice) => (
          <div className="griglia-campi" key={indice}>
            <input
              type="text"
              value={riga.nome}
              placeholder="zucca"
              list={ID_SUGGERIMENTI}
              onChange={(e) => { cambiaRiga(indice, "nome", e.target.value); }}
            />
            <input
              type="number"
              step="any"
              min="0"
              value={riga.quantita}
              placeholder="400"
              onChange={(e) => { cambiaRiga(indice, "quantita", e.target.value); }}
            />
            <input
              type="text"
              value={riga.unita}
              placeholder="g"
              onChange={(e) => { cambiaRiga(indice, "unita", e.target.value); }}
            />
          </div>
        ))}
        <button
          type="button"
          className="bottone bottone--fantasma bottone--piccolo"
          onClick={() => { setRighe((p) => [...p, RIGA_VUOTA]); }}
        >
          + Ingrediente
        </button>
      </div>

      <div className="campo">
        <span>A quali pasti (nessuno = va bene per tutti)</span>
        <div className="riga riga--avvolgi">
          {PASTI.map((pasto) => (
            <button
              key={pasto.valore}
              type="button"
              className="chip-commensale"
              aria-pressed={pastiAdatti.includes(pasto.valore)}
              onClick={() => { alternaPasto(pasto.valore); }}
            >
              {pasto.etichetta}
            </button>
          ))}
        </div>
      </div>

      <div className="campo">
        <span>Valori nutrizionali per porzione (facoltativi)</span>
        <div className="griglia-campi">
          {CHIAVI_MACRO.map(({ chiave, lungo }) => (
            <input
              key={chiave}
              type="number"
              step="any"
              min="0"
              value={macro[chiave]}
              placeholder={lungo}
              aria-label={lungo}
              onChange={(e) => {
                setMacro((p) => ({ ...p, [chiave]: e.target.value }));
              }}
            />
          ))}
        </div>
      </div>

      <div className="campo">
        <span>Stagionalità (nessun mese = tutto l'anno)</span>
        <div className="riga riga--avvolgi">
          {MESI.map((mese) => (
            <button
              key={mese}
              type="button"
              className="chip-commensale"
              aria-pressed={stagioni.includes(mese)}
              onClick={() => { alternaMese(mese); }}
            >
              {mese.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <div className="riga">
        <button
          type="submit"
          className="bottone bottone--primario crescente"
          disabled={nome.trim() === ""}
        >
          {ricetta === undefined ? "Salva ricetta" : "Salva modifiche"}
        </button>
        {onAnnulla !== undefined && (
          <button type="button" className="bottone" onClick={onAnnulla}>
            Annulla
          </button>
        )}
      </div>
      <Errore messaggio={errore} />
    </form>
  );
}

function VoceRicetta({ ricetta }: { ricetta: Doc<"ricette"> }) {
  const rimuovi = useMutation(api.ricette.rimuovi);
  const [aperta, setAperta] = useState(false);
  const [inModifica, setInModifica] = useState(false);

  if (inModifica) {
    return (
      <li className="colonna" style={{ alignItems: "stretch" }}>
        <ModuloRicetta
          ricetta={ricetta}
          onFatto={() => { setInModifica(false); }}
          onAnnulla={() => { setInModifica(false); }}
        />
      </li>
    );
  }


  return (
    <li className="colonna" style={{ alignItems: "stretch" }}>
      <div className="riga">
        <button
          type="button"
          className="bottone--icona crescente"
          style={{ textAlign: "left" }}
          aria-expanded={aperta}
          onClick={() => { setAperta((v) => !v); }}
        >
          <strong style={{ color: "var(--testo)" }}>{ricetta.nome}</strong>
          <span className="dati tenue piccolo">
            {" "}
            · {ricetta.porzioni} porz.
          </span>
        </button>
        <button
          type="button"
          className="bottone--icona bottone--testo"
          aria-label={`Modifica ${ricetta.nome}`}
          onClick={() => { setInModifica(true); }}
        >
          modifica
        </button>
        <button
          type="button"
          className="bottone--icona"
          aria-label={`Elimina ${ricetta.nome}`}
          onClick={() => { void rimuovi({ ricettaId: ricetta._id }); }}
        >
          ✕
        </button>
      </div>

      <div className="riga riga--avvolgi">
        {ricetta.tags.map((tag) => (
          <span className="etichetta" key={tag}>
            {tag}
          </span>
        ))}
        <span className="etichetta">
          {ricetta.stagioni.length === 0
            ? "tutto l'anno"
            : ricetta.stagioni.map((m) => m.slice(0, 3)).join(" ")}
        </span>
        {ricetta.pastiAdatti !== undefined && ricetta.pastiAdatti.length > 0 && (
          <span className="etichetta">{ricetta.pastiAdatti.join(" · ")}</span>
        )}
      </div>

      {aperta && (
        <>
          <ul className="lista dati piccolo">
            {ricetta.ingredienti.map((ing) => (
              <li key={ing.nome}>
                <span className="crescente">{ing.nome}</span>
                <span className="tenue">{formattaQuantita(ing.quantita, ing.unita)}</span>
              </li>
            ))}
          </ul>
          {macroCompilato(ricetta.macro) && (
            <div className="riga riga--avvolgi">
              {CHIAVI_MACRO.map(({ chiave, breve }) => {
                const valore = ricetta.macro?.[chiave];
                if (valore === undefined) return null;
                return (
                  <span className="etichetta" key={chiave}>
                    {breve} {arrotonda(valore)}
                  </span>
                );
              })}
            </div>
          )}
        </>
      )}
    </li>
  );
}

type Proposta = {
  nome: string;
  tags: string[];
  porzioni: number;
  pastiAdatti: ("colazione" | "pranzo" | "cena")[];
  stagioni: string[];
  ingredienti: { nome: string; quantita: number; unita: string }[];
  perche: string;
};

/**
 * Ricette proposte da Claude. Non entrano in catalogo da sole: si aggiungono
 * una per una, dopo averle lette.
 */
function ProposteAI() {
  const proponi = useAction(api.ricetteAI.proponi);
  const aggiungi = useMutation(api.ricette.aggiungi);

  const [richiesta, setRichiesta] = useState("");
  const [proposte, setProposte] = useState<Proposta[] | null>(null);
  const [aggiunte, setAggiunte] = useState<string[]>([]);
  const [avviso, setAvviso] = useState<string | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);

  const chiedi = () => {
    setErrore(null);
    setAvviso(null);
    setAggiunte([]);
    setInCorso(true);
    void proponi({ oggi: oggiIso(), quante: 5, richiesta })
      .then((esito) => {
        setProposte(esito.ricette);
        setAvviso(
          esito.costoStimato === null
            ? null
            : `costo ${esito.costoStimato.toFixed(3)} $`
        );
      })
      .catch((e: unknown) => { setErrore(messaggioErrore(e)); })
      .finally(() => { setInCorso(false); });
  };

  const salva = (proposta: Proposta) => {
    setErrore(null);
    void aggiungi({
      nome: proposta.nome,
      tags: proposta.tags,
      porzioni: proposta.porzioni,
      pastiAdatti: proposta.pastiAdatti,
      stagioni: proposta.stagioni,
      ingredienti: proposta.ingredienti,
    })
      .then(() => { setAggiunte((p) => [...p, proposta.nome]); })
      .catch((e: unknown) => { setErrore(messaggioErrore(e)); });
  };

  return (
    <Carta titolo="Proposte di Claude">
      <p className="dati tenue piccolo">
        Parte da quello che hai in casa e non usi. Le proposte non entrano in
        catalogo da sole: le aggiungi tu, una alla volta.
      </p>
      <input
        type="text"
        value={richiesta}
        placeholder="Facoltativo: “pranzi freddi da ufficio”, “usa la feta”…"
        onChange={(e) => { setRichiesta(e.target.value); }}
      />
      <button
        type="button"
        className="bottone bottone--fantasma bottone--piccolo"
        disabled={inCorso}
        onClick={chiedi}
      >
        {inCorso ? "Ci penso…" : "✳ Proponi 5 ricette (a pagamento)"}
      </button>

      <Errore messaggio={errore} />
      {avviso !== null && <span className="dati tenue piccolo">{avviso}</span>}

      {proposte?.map((proposta) => {
        const giaAggiunta = aggiunte.includes(proposta.nome);
        return (
          <div className="carta colonna" key={proposta.nome}>
            <div className="riga riga--tra">
              <strong className="crescente">{proposta.nome}</strong>
              <span className="dati tenue piccolo">
                per {proposta.porzioni}
              </span>
            </div>
            <span className="dati tenue piccolo">{proposta.perche}</span>
            <div className="riga riga--avvolgi">
              {proposta.pastiAdatti.map((p) => (
                <span className="etichetta" key={p}>
                  {p}
                </span>
              ))}
              {proposta.tags.map((t) => (
                <span className="etichetta" key={t}>
                  {t}
                </span>
              ))}
              <span className="etichetta">
                {proposta.stagioni.length === 0
                  ? "tutto l'anno"
                  : proposta.stagioni.map((m) => m.slice(0, 3)).join(" ")}
              </span>
            </div>
            <ul className="lista dati piccolo">
              {proposta.ingredienti.map((i) => (
                <li key={i.nome}>
                  <span className="crescente">{i.nome}</span>
                  <span className="tenue">
                    {formattaQuantita(i.quantita, i.unita)}
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="bottone bottone--piccolo"
              disabled={giaAggiunta}
              onClick={() => { salva(proposta); }}
            >
              {giaAggiunta ? "In catalogo ✓" : "Aggiungi al catalogo"}
            </button>
          </div>
        );
      })}
    </Carta>
  );
}

export function Ricette() {
  const meseCorrente = meseDiIso(oggiIso());
  const [soloStagionali, setSoloStagionali] = useState(false);
  const [apriModulo, setApriModulo] = useState(false);

  const ricette = useQuery(
    api.ricette.lista,
    soloStagionali ? { mese: meseCorrente } : {}
  );
  const stagionalita = useQuery(api.stagionalita.perMese, { mese: meseCorrente });
  const dispensa = useQuery(api.frigo.lista);

  // Suggerimenti per i nomi degli ingredienti: quello che hai in dispensa più
  // quello che hai già scritto altrove. Serve soprattutto a tenere i nomi
  // coerenti, perché la lista della spesa sottrae il frigo confrontando i nomi.
  const suggerimenti = [
    ...new Set([
      ...(dispensa ?? []).map((p) => p.nome),
      ...(ricette ?? []).flatMap((r) => r.ingredienti.map((i) => i.nome)),
    ]),
  ].sort((a, b) => a.localeCompare(b, "it"));

  return (
    <>
      <datalist id={ID_SUGGERIMENTI}>
        {suggerimenti.map((nome) => (
          <option key={nome} value={nome} />
        ))}
      </datalist>

      <Carta titolo={`Di stagione a ${meseCorrente}`}>
        {stagionalita === undefined ? (
          <p className="dati tenue">Carico…</p>
        ) : (
          <div className="riga riga--avvolgi">
            {stagionalita[0].verdure.map((verdura) => (
              <span className="etichetta" key={verdura}>
                {verdura}
              </span>
            ))}
          </div>
        )}
      </Carta>

      <ProposteAI />

      <Carta
        titolo="Ricette"
        azione={
          <button
            type="button"
            className="bottone bottone--piccolo"
            onClick={() => { setApriModulo((v) => !v); }}
          >
            {apriModulo ? "Chiudi" : "+ Nuova"}
          </button>
        }
      >
        {apriModulo && (
          <>
            <ModuloRicetta
              onFatto={() => { setApriModulo(false); }}
              onAnnulla={() => { setApriModulo(false); }}
            />
            <hr className="separatore" />
          </>
        )}

        <div className="gruppo-stato">
          <button
            type="button"
            aria-pressed={!soloStagionali}
            onClick={() => { setSoloStagionali(false); }}
          >
            Tutte
          </button>
          <button
            type="button"
            aria-pressed={soloStagionali}
            onClick={() => { setSoloStagionali(true); }}
          >
            Solo stagionali
          </button>
        </div>

        {ricette === undefined ? (
          <p className="dati tenue">Carico…</p>
        ) : ricette.length === 0 ? (
          <Vuoto>
            {soloStagionali
              ? `Nessuna ricetta di stagione per ${meseCorrente}.`
              : "Nessuna ricetta in catalogo."}
          </Vuoto>
        ) : (
          <ul className="lista">
            {ricette.map((ricetta) => (
              <VoceRicetta key={ricetta._id} ricetta={ricetta} />
            ))}
          </ul>
        )}
      </Carta>
    </>
  );
}
