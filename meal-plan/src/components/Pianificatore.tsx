import { useAction, useMutation, useQuery } from "convex/react";
import { useState } from "react";
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

const STATI = [
  { valore: "da_pianificare", etichetta: "Da fare" },
  { valore: "pianificato", etichetta: "Pianificato" },
  { valore: "fuori", etichetta: "Fuori" },
] as const;

type Stato = (typeof STATI)[number]["valore"];
type Tipo = "colazione" | "pranzo" | "cena";
type Commensale = { nome: string; porzioni: number };

/** Passo dello stepper: mezze porzioni bastano per una dieta di casa. */
const PASSO_PORZIONI = 0.5;
const MAX_PORZIONI = 5;

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

  return (
    <div className={stato === "fuori" ? "slot slot--fuori" : "slot"}>
      <div className="riga riga--tra">
        <span className="slot__titolo">{tipoPasto}</span>
        {stato === "pianificato" && nomeRicetta !== null && (
          <span className="dati piccolo">
            {avanzo && <span className="etichetta">avanzo</span>} {nomeRicetta}
          </span>
        )}
      </div>

      <div className="gruppo-stato">
        {STATI.map((opzione) => (
          <button
            key={opzione.valore}
            type="button"
            aria-pressed={stato === opzione.valore}
            onClick={() => {
              void impostaStato({ data, tipoPasto, stato: opzione.valore });
            }}
          >
            {opzione.etichetta}
          </button>
        ))}
      </div>

      {stato !== "fuori" && (
        <>
          <select
            value={ricettaId ?? ""}
            onChange={(e) => {
              const valore = e.target.value;
              void impostaRicetta({
                data,
                tipoPasto,
                ricettaId:
                  valore === ""
                    ? null
                    : (valore as Doc<"ricette">["_id"]),
              });
            }}
          >
            <option value="">— scegli una ricetta —</option>
            {ricette.map((ricetta) => (
              <option key={ricetta._id} value={ricetta._id}>
                {ricetta.nome}
              </option>
            ))}
          </select>

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
        </>
      )}
    </div>
  );
}

/**
 * Riepilogo per chi segue una dieta: quanto porta a casa dai pasti pianificati
 * del giorno rispetto all'obiettivo. Conta solo pranzo e cena — colazione e
 * spuntini l'app non li conosce, e il testo lo dice.
 */
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
