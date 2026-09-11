import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Coffee, Salad, Soup } from "lucide-react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { etichettaGiorno, isoPiuGiorni, lunediDi, meseDiIso, oggiIso } from "../lib/date";
import { messaggioErrore } from "../lib/errori";
import type { Macro } from "../lib/macro";
import {
  CHIAVI_MACRO,
  arrotonda,
  macroCompilato,
  macroDelCommensale,
  scostamento,
} from "../lib/macro";
import { Carta, Errore, Vuoto } from "./ui";
import { formattaQuantita } from "../lib/quantita";

const STATI = [
  { valore: "da_pianificare", etichetta: "Da fare" },
  { valore: "pianificato", etichetta: "Pianificato" },
  { valore: "fuori", etichetta: "Fuori" },
] as const;

type Stato = (typeof STATI)[number]["valore"];
type Tipo = "colazione" | "pranzo" | "cena";
type Commensale = { nome: string; porzioni: number };

/** Un'icona e un colore per ciascun pasto, per riconoscerli a colpo d'occhio. */
const ASPETTO_PASTO = {
  colazione: { Icona: Coffee, etichetta: "Colazione" },
  pranzo: { Icona: Salad, etichetta: "Pranzo" },
  cena: { Icona: Soup, etichetta: "Cena" },
} as const;

/** Passo dello stepper: mezze porzioni bastano per una dieta di casa. */
const PASSO_PORZIONI = 0.5;
const MAX_PORZIONI = 5;

function SelettoreRicetta({
  ricette,
  ricettaId,
  onSeleziona,
}: {
  ricette: Doc<"ricette">[];
  ricettaId: string | null;
  onSeleziona: (ricettaId: Doc<"ricette">["_id"] | null) => void;
}) {
  const selezionata = ricette.find((ricetta) => ricetta._id === ricettaId);
  const [ricerca, setRicerca] = useState(selezionata?.nome ?? "");
  const [aperto, setAperto] = useState(false);

  const parole = ricerca.trim().toLocaleLowerCase("it").split(/\s+/).filter(Boolean);
  const risultati = ricette.filter((ricetta) => {
    const testo = [
      ricetta.nome,
      ...ricetta.tags,
      ...ricetta.ingredienti.map((ingrediente) => ingrediente.nome),
    ].join(" ").toLocaleLowerCase("it");
    return parole.every((parola) => testo.includes(parola));
  });

  return (
    <div
      className="selettore-ricetta"
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) setAperto(false);
      }}
    >
      <div className="riga">
        <input
          className="crescente"
          type="search"
          role="combobox"
          aria-label="Cerca una ricetta"
          aria-expanded={aperto}
          autoComplete="off"
          value={ricerca}
          placeholder="Cerca una ricetta…"
          onFocus={() => { setAperto(true); }}
          onChange={(evento) => {
            setRicerca(evento.target.value);
            setAperto(true);
          }}
        />
        {ricettaId !== null && (
          <button
            type="button"
            className="bottone bottone--piccolo"
            onClick={() => {
              onSeleziona(null);
              setRicerca("");
            }}
          >
            Rimuovi
          </button>
        )}
      </div>
      {aperto && (
        <div className="selettore-ricetta__risultati">
          {risultati.length === 0 ? (
            <span className="dati tenue piccolo">Nessuna ricetta trovata</span>
          ) : (
            risultati.map((ricetta) => (
              <button
                type="button"
                key={ricetta._id}
                aria-current={ricetta._id === ricettaId ? "true" : undefined}
                // Su touch il dito toglie il fuoco all'input prima che scatti
                // il click: `onBlur` smonterebbe la tendina e il click andrebbe
                // perso. Bloccando il default del pointerdown il fuoco non si
                // sposta e la selezione arriva.
                onPointerDown={(evento) => { evento.preventDefault(); }}
                onClick={() => {
                  onSeleziona(ricetta._id);
                  setRicerca(ricetta.nome);
                  setAperto(false);
                }}
              >
                <strong>{ricetta.nome}</strong>
                <span className="dati tenue piccolo">
                  {ricetta.tempoMinuti !== undefined
                    ? `${String(ricetta.tempoMinuti)} min · `
                    : ""}
                  {ricetta.tags.join(" · ")}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AnteprimaRicetta({ ricetta }: { ricetta: Doc<"ricette"> }) {
  return (
    <div className="anteprima-ricetta">
      <strong>Ingredienti per {ricetta.porzioni}</strong>
      <ul className="lista dati piccolo">
        {ricetta.ingredienti.map((ingrediente, indice) => (
          <li key={`${ingrediente.nome}-${String(indice)}`}>
            <span className="crescente">{ingrediente.nome}</span>
            <span className="tenue">
              {formattaQuantita(ingrediente.quantita, ingrediente.unita)}
            </span>
          </li>
        ))}
      </ul>
      {ricetta.preparazione !== undefined && ricetta.preparazione.length > 0 ? (
        <>
          <strong>Procedimento</strong>
          <ol className="passaggi">
            {ricetta.preparazione.map((passo, indice) => (
              <li key={`${String(indice)}-${passo}`}>{passo}</li>
            ))}
          </ol>
        </>
      ) : (
        <span className="dati tenue piccolo">Procedimento non ancora inserito.</span>
      )}
    </div>
  );
}

function Slot({
  data,
  tipoPasto,
  stato,
  commensali,
  ricettaId,
  nomeRicetta,
  avanzo,
  membri,
  ricette,
}: {
  data: string;
  tipoPasto: Tipo;
  stato: Stato;
  commensali: Commensale[];
  avanzo: boolean;
  ricettaId: string | null;
  nomeRicetta: string | null;
  membri: Doc<"householdMembers">[];
  ricette: Doc<"ricette">[];
}) {
  const impostaStato = useMutation(api.pianificatore.impostaStato);
  const impostaRicetta = useMutation(api.pianificatore.impostaRicetta);
  const impostaCommensali = useMutation(api.pianificatore.impostaCommensali);
  const [mostraAnteprima, setMostraAnteprima] = useState(false);
  const ricettaSelezionata = ricette.find((ricetta) => ricetta._id === ricettaId);

  const alternaCommensale = (nome: string) => {
    const nuovi = commensali.some((c) => c.nome === nome)
      ? commensali.filter((c) => c.nome !== nome)
      : [...commensali, { nome, porzioni: 1 }];
    void impostaCommensali({ data, tipoPasto, commensali: nuovi });
  };

  const cambiaPorzioni = (nome: string, delta: number) => {
    const nuovi = commensali.map((c) =>
      c.nome === nome
        ? {
            ...c,
            porzioni: Math.min(
              MAX_PORZIONI,
              Math.max(PASSO_PORZIONI, Math.round((c.porzioni + delta) * 2) / 2)
            ),
          }
        : c
    );
    void impostaCommensali({ data, tipoPasto, commensali: nuovi });
  };

  const { Icona, etichetta } = ASPETTO_PASTO[tipoPasto];
  const fuori = stato === "fuori";

  // Riepilogo dei commensali sulla riga chiusa: l'informazione resta visibile
  // senza aprire, i controlli stanno nel dettaglio.
  const riepilogoCommensali = commensali
    .map((c) => (c.porzioni === 1 ? c.nome : `${c.nome} ×${arrotonda(c.porzioni)}`))
    .join(" · ");

  return (
    <div className={fuori ? "pasto pasto--fuori" : "pasto"}>
      <div className="pasto__testa">
        <span className={`pasto__tipo pasto__tipo--${tipoPasto}`}>
          <Icona size={16} strokeWidth={1.75} aria-hidden="true" />
          {etichetta}
        </span>

        <select
          className="pasto__stato"
          value={stato}
          aria-label={`Stato di ${etichetta} del ${data}`}
          onChange={(evento) => {
            void impostaStato({
              data,
              tipoPasto,
              stato: evento.target.value as Stato,
            });
          }}
        >
          {STATI.map((opzione) => (
            <option key={opzione.valore} value={opzione.valore}>
              {opzione.etichetta}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className="pasto__apri"
          aria-expanded={mostraAnteprima}
          onClick={() => { setMostraAnteprima((v) => !v); }}
        >
          <span className="pasto__nome">
            {fuori ? (
              <span className="tenue">—</span>
            ) : nomeRicetta === null ? (
              <span className="tenue">Scegli una ricetta</span>
            ) : (
              <>
                {avanzo && <span className="etichetta">avanzo</span>} {nomeRicetta}
              </>
            )}
          </span>
        {mostraAnteprima ? (
          <ChevronDown size={18} strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
        )}
      </button>

      {!fuori && riepilogoCommensali !== "" && !mostraAnteprima && (
        <span className="pasto__commensali">{riepilogoCommensali}</span>
      )}

      {mostraAnteprima && !fuori && (
        <div className="pasto__dettaglio">
          <SelettoreRicetta
            key={ricettaId ?? "nessuna"}
            ricette={ricette}
            ricettaId={ricettaId}
            onSeleziona={(nuovaRicettaId) => {
              void impostaRicetta({ data, tipoPasto, ricettaId: nuovaRicettaId });
            }}
          />

          <div className="riga riga--avvolgi">
            {membri.map((membro) => {
              const quota = commensali.find((c) => c.nome === membro.displayName);
              return (
                <span className="commensale" key={membro._id}>
                  <button
                    type="button"
                    className="chip-commensale"
                    aria-pressed={quota !== undefined}
                    onClick={() => { alternaCommensale(membro.displayName); }}
                  >
                    {membro.displayName}
                    {quota !== undefined && quota.porzioni !== 1
                      ? ` ×${arrotonda(quota.porzioni)}`
                      : ""}
                  </button>
                  {quota !== undefined && (
                    <span className="porzioni">
                      <button
                        type="button"
                        aria-label={`Meno porzioni per ${membro.displayName}`}
                        disabled={quota.porzioni <= PASSO_PORZIONI}
                        onClick={() => {
                          cambiaPorzioni(membro.displayName, -PASSO_PORZIONI);
                        }}
                      >
                        −
                      </button>
                      <button
                        type="button"
                        aria-label={`Più porzioni per ${membro.displayName}`}
                        disabled={quota.porzioni >= MAX_PORZIONI}
                        onClick={() => {
                          cambiaPorzioni(membro.displayName, PASSO_PORZIONI);
                        }}
                      >
                        +
                      </button>
                    </span>
                  )}
                </span>
              );
            })}
          </div>

          {ricettaSelezionata !== undefined && (
            <AnteprimaRicetta ricetta={ricettaSelezionata} />
          )}
        </div>
      )}
    </div>
  );
}

function RiepilogoMacro({
  membro,
  pasti,
}: {
  membro: Doc<"householdMembers">;
  pasti: { commensali: Commensale[]; ricetta: { macro?: Macro } | null }[];
}) {
  const obiettivo = membro.obiettivo;
  if (obiettivo === undefined || !macroCompilato(obiettivo)) return null;

  const presente = pasti.some((p) =>
    p.commensali.some((c) => c.nome === membro.displayName)
  );
  if (!presente) return null;

  const consumato = macroDelCommensale(pasti, membro.displayName);
  const senzaDati = !macroCompilato(consumato);

  return (
    <div className="riepilogo-macro">
      <span className="riepilogo-macro__nome">{membro.displayName}</span>
      {senzaDati ? (
        <span className="tenue">
          le ricette del giorno non hanno i valori nutrizionali
        </span>
      ) : (
        <span className="riga riga--avvolgi">
          {CHIAVI_MACRO.map(({ chiave, breve }) => {
            const meta = obiettivo[chiave];
            if (meta === undefined) return null;
            const valore = consumato[chiave];
            return (
              <span
                key={chiave}
                className={`macro macro--${scostamento(valore, meta)}`}
              >
                {breve} {valore === undefined ? "?" : arrotonda(valore)}/{arrotonda(meta)}
              </span>
            );
          })}
        </span>
      )}
      <span className="tenue piccolo">solo pranzo e cena</span>
    </div>
  );
}

export function Pianificatore({ membri }: { membri: Doc<"householdMembers">[] }) {
  const [dataInizio, setDataInizio] = useState(() => lunediDi(oggiIso()));
  const [errore, setErrore] = useState<string | null>(null);
  const [avviso, setAvviso] = useState<string | null>(null);
  const [sprechi, setSprechi] = useState<string[]>([]);
  const [inCorso, setInCorso] = useState(false);
  const riferimentoOggi = useRef<HTMLDivElement>(null);
  const settimanaCentrata = useRef<string | null>(null);

  const settimana = useQuery(api.pianificatore.settimana, { dataInizio });
  const ricette = useQuery(api.ricette.lista, {});
  const genera = useMutation(api.pianificatore.generaSettimana);
  const generaAI = useAction(api.menuAI.generaSettimana);
  const archivia = useMutation(api.pianificatore.archiviaSettimana);

  const generaMenu = () => {
    setErrore(null);
    setAvviso(null);
    setSprechi([]);
    setInCorso(true);
    void genera({ dataInizio })
      .then((esito) => {
        const dettagli = [
          esito.dallaDispensa > 0
            ? `${String(esito.dallaDispensa)} con roba che hai già`
            : null,
          esito.ripetute > 0 ? `${String(esito.ripetute)} ripetute` : null,
          esito.saltati > 0 ? `${String(esito.saltati)} senza candidati` : null,
        ].filter((d) => d !== null);
        setAvviso(
          esito.motivo ??
            `${String(esito.assegnati)} pasti assegnati` +
              (dettagli.length > 0 ? ` (${dettagli.join(", ")})` : "")
        );
        setSprechi(esito.inScadenzaNonUsati);
      })
      .catch((e: unknown) => { setErrore(messaggioErrore(e)); })
      .finally(() => { setInCorso(false); });
  };

  /**
   * Fase 2: la settimana ragionata da Claude. Costa, quindi è un bottone
   * separato e mostra quanto è costata; se fallisce resta il rule-based.
   */
  const generaConAI = () => {
    setErrore(null);
    setAvviso(null);
    setSprechi([]);
    setInCorso(true);
    void generaAI({ oggi: oggiIso(), dataInizio })
      .then((esito) => {
        const costo =
          esito.costoStimato === null
            ? ""
            : ` · costo ${esito.costoStimato.toFixed(3)} $`;
        setAvviso(
          `${String(esito.assegnati)} pasti assegnati da Claude` +
            (esito.ignorate > 0 ? `, ${String(esito.ignorate)} proposte scartate` : "") +
            costo +
            (esito.note === "" ? "" : ` — ${esito.note}`)
        );
      })
      .catch((e: unknown) => { setErrore(messaggioErrore(e)); })
      .finally(() => { setInCorso(false); });
  };

  const archiviaSettimana = () => {
    setErrore(null);
    setAvviso(null);
    void archivia({ dataInizio })
      .then((esito) => {
        setAvviso(`${String(esito.archiviati)} pasti aggiunti allo storico`);
      })
      .catch((e: unknown) => { setErrore(messaggioErrore(e)); });
  };

  const oggi = oggiIso();

  useEffect(() => {
    if (dataInizio !== lunediDi(oggi) || settimana === undefined) {
      settimanaCentrata.current = null;
      return;
    }
    if (settimanaCentrata.current === dataInizio) return;
    settimanaCentrata.current = dataInizio;
    riferimentoOggi.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [dataInizio, oggi, settimana]);

  return (
    <>
      <Carta fitta>
        <div className="riga riga--tra">
          <button
            type="button"
            className="bottone bottone--piccolo"
            onClick={() => { setDataInizio((d) => isoPiuGiorni(d, -7)); }}
          >
            ‹
          </button>
          <span className="dati piccolo">
            {etichettaGiorno(dataInizio)} → {etichettaGiorno(isoPiuGiorni(dataInizio, 6))}
          </span>
          <button
            type="button"
            className="bottone bottone--piccolo"
            onClick={() => { setDataInizio((d) => isoPiuGiorni(d, 7)); }}
          >
            ›
          </button>
        </div>
      </Carta>

      <div className="riga">
        <button
          type="button"
          className="bottone bottone--primario crescente"
          disabled={inCorso}
          onClick={generaMenu}
        >
          {inCorso ? "Genero…" : `Genera menu di ${meseDiIso(dataInizio)}`}
        </button>
        <button type="button" className="bottone" onClick={archiviaSettimana}>
          Archivia
        </button>
      </div>
      <button
        type="button"
        className="bottone bottone--fantasma"
        disabled={inCorso}
        onClick={generaConAI}
      >
        {inCorso ? "Ci penso…" : "✳ Genera con Claude (a pagamento)"}
      </button>

      <Errore messaggio={errore} />
      {avviso !== null && <p className="dati tenue piccolo">{avviso}</p>}
      {sprechi.length > 0 && (
        <p className="errore">
          Sta per scadere e nessun pasto della settimana lo usa:{" "}
          {sprechi.join(", ")}.
        </p>
      )}

      {settimana === undefined || ricette === undefined ? (
        <p className="dati tenue">Carico…</p>
      ) : ricette.length === 0 ? (
        <Vuoto>Aggiungi qualche ricetta prima di pianificare la settimana.</Vuoto>
      ) : (
        settimana.map((giorno) => (
          <div
            key={giorno.data}
            ref={giorno.data === oggi ? riferimentoOggi : undefined}
            className={giorno.data === oggi ? "giorno giorno--oggi" : "giorno"}
          >
            <div className="giorno__testata">
              <span>{etichettaGiorno(giorno.data)}</span>
              {giorno.data === oggi && <span>oggi</span>}
            </div>
            {giorno.slot.map((slot) => (
              <Slot
                key={slot.tipoPasto}
                data={giorno.data}
                tipoPasto={slot.tipoPasto}
                stato={slot.stato}
                commensali={slot.commensali}
                ricettaId={slot.ricettaId}
                nomeRicetta={slot.ricetta?.nome ?? null}
                avanzo={slot.avanzo}
                membri={membri}
                ricette={ricette}
              />
            ))}
            {membri.map((membro) => (
              <RiepilogoMacro
                key={membro._id}
                membro={membro}
                pasti={giorno.slot.filter((s) => s.stato === "pianificato")}
              />
            ))}
          </div>
        ))
      )}
    </>
  );
}
