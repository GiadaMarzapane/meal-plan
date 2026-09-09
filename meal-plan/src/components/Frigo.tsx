import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import {etichettaData, giorniDaOggi, oggiIso} from "../lib/date";
import { formattaScorta } from "../lib/quantita";
import { messaggioErrore } from "../lib/errori";
import { SceltaCategoria } from "./SceltaCategoria";
import { Campo, Carta, Errore, Vuoto } from "./ui";

type Urgenza = "urgente" | "attenzione" | "ok";

/** Id della lista di nomi generici suggeriti. */
const ID_INGREDIENTI = "nomi-ingredienti-ricette";

/** Verde oltre i 5 giorni, senape da 1 a 5, pomodoro se scade oggi o è scaduto. */
function urgenzaDi(giorni: number): Urgenza {
  if (giorni <= 0) return "urgente";
  if (giorni <= 5) return "attenzione";
  return "ok";
}

function testoScadenza(giorni: number): string {
  if (giorni < 0) return `scaduto da ${String(-giorni)}g`;
  if (giorni === 0) return "scade oggi";
  if (giorni === 1) return "domani";
  return `tra ${String(giorni)}g`;
}

function BadgeScadenza({ dataScadenza }: { dataScadenza: string | undefined }) {
  // Senza scadenza (tipico della dispensa: pasta, riso, scatolame) niente
  // allarme: mostro un badge neutro invece di inventarmi una data.
  if (dataScadenza === undefined) {
    return <span className="badge badge--neutro">dispensa</span>;
  }
  const giorni = giorniDaOggi(dataScadenza);
  const urgenza = urgenzaDi(giorni);
  return (
    <span className={`badge badge--pieno badge--${urgenza}`}>
      {testoScadenza(giorni)}
    </span>
  );
}

/**
 * Stesso modulo per aggiungere e per correggere: passando `prodotto` i campi
 * partono compilati e il salvataggio aggiorna invece di inserire.
 */
function ModuloProdotto({
  prodotto,
  onFatto,
  onAnnulla,
}: {
  prodotto?: Doc<"prodottiFrigo">;
  onFatto: () => void;
  onAnnulla: () => void;
}) {
  const aggiungi = useMutation(api.frigo.aggiungi);
  const modifica = useMutation(api.frigo.modifica);

  const [nome, setNome] = useState(prodotto?.nome ?? "");
  const [pezzi, setPezzi] = useState(prodotto?.pezzi?.toString() ?? "1");
  const [quantita, setQuantita] = useState(prodotto?.quantita?.toString() ?? "");
  const [unita, setUnita] = useState(prodotto?.unita ?? "");
  const [generico, setGenerico] = useState(prodotto?.generico ?? "");
  const [categoria, setCategoria] = useState<string | null>(
    prodotto?.categoria ?? null
  );
  const [conScadenza, setConScadenza] = useState(
    prodotto === undefined || prodotto.dataScadenza !== undefined
  );
  const [dataScadenza, setDataScadenza] = useState(
    prodotto?.dataScadenza ?? oggiIso()
  );
  const [errore, setErrore] = useState<string | null>(null);

  const invia = (evento: React.FormEvent) => {
    evento.preventDefault();
    setErrore(null);
    const numeroQuantita = Number.parseFloat(quantita);
    const numeroPezzi = Number.parseFloat(pezzi);
    const campi = {
      nome: nome.trim(),
      pezzi: Number.isFinite(numeroPezzi) ? numeroPezzi : undefined,
      quantita: Number.isFinite(numeroQuantita) ? numeroQuantita : undefined,
      unita: unita.trim() === "" ? undefined : unita.trim(),
      generico: generico.trim() === "" ? undefined : generico.trim(),
      categoria: categoria ?? undefined,
      // Sulla modifica conservo la data d'acquisto originale.
      dataAcquisto: prodotto?.dataAcquisto ?? oggiIso(),
      dataScadenza: conScadenza ? dataScadenza : undefined,
    };

    const azione =
      prodotto === undefined
        ? aggiungi(campi)
        : modifica({ prodottoId: prodotto._id, ...campi });

    void azione
      .then(onFatto)
      .catch((e: unknown) => { setErrore(messaggioErrore(e)); });
  };

  return (
    <form className="colonna" onSubmit={invia}>
      <Campo etichetta="Prodotto">
        <input
          type="text"
          value={nome}
          placeholder="Yogurt greco"
          onChange={(e) => { setNome(e.target.value); }}
        />
      </Campo>
      <div className="griglia-campi">
        <Campo etichetta="Pezzi">
          <input
            type="number"
            step="any"
            min="0"
            value={pezzi}
            placeholder="3"
            onChange={(e) => { setPezzi(e.target.value); }}
          />
        </Campo>
        <Campo etichetta="Contenuto di uno">
          <input
            type="number"
            step="any"
            min="0"
            value={quantita}
            placeholder="700"
            onChange={(e) => { setQuantita(e.target.value); }}
          />
        </Campo>
        <Campo etichetta="Unità">
          <input
            type="text"
            value={unita}
            placeholder="g"
            list="unita-comuni"
            onChange={(e) => { setUnita(e.target.value); }}
          />
        </Campo>
      </div>
      <datalist id="unita-comuni">
        <option value="g" />
        <option value="ml" />
        <option value="pz" />
      </datalist>
      <span className="dati tenue piccolo">
        3 confezioni di passata da 700 g = pezzi 3, contenuto 700, unità g.
        Per le uova basta pezzi 6 e unità pz.
      </span>
      <Campo etichetta="Nome generico (facoltativo)">
        <input
          type="text"
          value={generico}
          placeholder="pasta"
          list={ID_INGREDIENTI}
          onChange={(e) => { setGenerico(e.target.value); }}
        />
      </Campo>
      <span className="dati tenue piccolo">
        Come lo chiamano le ricette: i fusilli hanno generico “pasta”, così una
        ricetta che chiede pasta usa quello che hai davvero.
      </span>

      <SceltaCategoria valore={categoria} onCambia={setCategoria} />
      <div className="campo">
        <span>Scadenza</span>
        <div className="gruppo-stato">
          <button
            type="button"
            aria-pressed={conScadenza}
            onClick={() => { setConScadenza(true); }}
          >
            Ha una scadenza
          </button>
          <button
            type="button"
            aria-pressed={!conScadenza}
            onClick={() => { setConScadenza(false); }}
          >
            Dispensa
          </button>
        </div>
        {conScadenza && (
          <input
            type="date"
            value={dataScadenza}
            aria-label="Data di scadenza"
            onChange={(e) => { setDataScadenza(e.target.value); }}
          />
        )}
      </div>
      <div className="riga">
        <button
          type="submit"
          className="bottone bottone--primario crescente"
          disabled={nome.trim() === ""}
        >
          {prodotto === undefined ? "Aggiungi" : "Salva"}
        </button>
        <button type="button" className="bottone" onClick={onAnnulla}>
          Annulla
        </button>
      </div>
      <Errore messaggio={errore} />
    </form>
  );
}

function VoceProdotto({ prodotto }: { prodotto: Doc<"prodottiFrigo"> }) {
  const rimuovi = useMutation(api.frigo.rimuovi);
  const scorta = formattaScorta(prodotto);
  const [inModifica, setInModifica] = useState(false);

  if (inModifica) {
    return (
      <li className="colonna" style={{ alignItems: "stretch" }}>
        <ModuloProdotto
          prodotto={prodotto}
          onFatto={() => { setInModifica(false); }}
          onAnnulla={() => { setInModifica(false); }}
        />
      </li>
    );
  }

  return (
    <li>
      <div className="crescente">
        <div className="riga">
          <strong>{prodotto.nome}</strong>
          {scorta.principale !== "" && (
            <span className="dati tenue">{scorta.principale}</span>
          )}
          {scorta.totale !== null && (
            <span className="dati tenue piccolo">= {scorta.totale}</span>
          )}
        </div>
        <span className="dati tenue piccolo">
          {prodotto.dataScadenza === undefined
            ? "senza scadenza"
            : `scade il ${etichettaData(prodotto.dataScadenza)}`}
          {prodotto.categoria !== undefined && ` · ${prodotto.categoria}`}
          {prodotto.generico !== undefined && ` · vale come ${prodotto.generico}`}
        </span>
      </div>
      <BadgeScadenza dataScadenza={prodotto.dataScadenza} />
      <button
        type="button"
        className="bottone--icona bottone--testo"
        aria-label={`Modifica ${prodotto.nome}`}
        onClick={() => { setInModifica(true); }}
      >
        modifica
      </button>
      <button
        type="button"
        className="bottone--icona"
        aria-label={`Rimuovi ${prodotto.nome}`}
        onClick={() => { void rimuovi({ prodottoId: prodotto._id }); }}
      >
        ✕
      </button>
    </li>
  );
}

export function Frigo() {
  const prodotti = useQuery(api.frigo.lista);
  const ricette = useQuery(api.ricette.lista, {});
  const [apriModulo, setApriModulo] = useState(false);

  // Suggerisco come generici i nomi che le ricette usano davvero: sceglierne
  // uno da qui è l'unico modo di essere sicuri che il collegamento funzioni.
  const nomiRicette = [
    ...new Set((ricette ?? []).flatMap((r) => r.ingredienti.map((i) => i.nome))),
  ].sort((a, b) => a.localeCompare(b, "it"));

  if (prodotti === undefined) return <p className="dati tenue">Carico…</p>;

  const inScadenza = prodotti.filter(
    (p) => p.dataScadenza !== undefined && giorniDaOggi(p.dataScadenza) <= 5
  );

  return (
    <>
      <datalist id={ID_INGREDIENTI}>
        {nomiRicette.map((nome) => (
          <option key={nome} value={nome} />
        ))}
      </datalist>

      {inScadenza.length > 0 && (
        <Carta fitta>
          <span className="dati piccolo">
            <strong>{inScadenza.length}</strong>{" "}
            {inScadenza.length === 1 ? "prodotto scade" : "prodotti scadono"} entro
            5 giorni.
          </span>
        </Carta>
      )}

      <Carta
        titolo="In frigo"
        azione={
          <button
            type="button"
            className="bottone bottone--piccolo"
            onClick={() => { setApriModulo((v) => !v); }}
          >
            {apriModulo ? "Chiudi" : "+ Aggiungi"}
          </button>
        }
      >
        {apriModulo && (
          <>
            <ModuloProdotto
              onFatto={() => { setApriModulo(false); }}
              onAnnulla={() => { setApriModulo(false); }}
            />
            <hr className="separatore" />
          </>
        )}

        {prodotti.length === 0 ? (
          <Vuoto>Il frigo è vuoto. Aggiungi il primo prodotto.</Vuoto>
        ) : (
          <ul className="lista">
            {prodotti.map((prodotto) => (
              <VoceProdotto key={prodotto._id} prodotto={prodotto} />
            ))}
          </ul>
        )}
      </Carta>
    </>
  );
}
