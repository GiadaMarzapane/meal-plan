import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { oggiIso } from "../lib/date";
import { messaggioErrore } from "../lib/errori";
import { formattaQuantita } from "../lib/quantita";
import { Carta, Errore, Vuoto } from "./ui";

const PASTI = [
  { valore: null, etichetta: "Tutto" },
  { valore: "colazione", etichetta: "Colazione" },
  { valore: "pranzo", etichetta: "Pranzo" },
  { valore: "cena", etichetta: "Cena" },
] as const;

type Pasto = (typeof PASTI)[number]["valore"];

const MAX_PORZIONI = 8;

function EtichettaMancanti({ quante }: { quante: number }) {
  if (quante === 0) {
    return <span className="badge badge--pieno badge--ok">puoi farla</span>;
  }
  return (
    <span className={`badge badge--${quante <= 2 ? "attenzione" : "neutro"}`}>
      manca{quante === 1 ? "" : "no"} {quante}
    </span>
  );
}

export function CucinaOra() {
  const [porzioni, setPorzioni] = useState(2);
  const [pasto, setPasto] = useState<Pasto>(null);
  const [errore, setErrore] = useState<string | null>(null);

  const risultati = useQuery(api.cucina.possibiliOra, {
    oggi: oggiIso(),
    porzioni,
    ...(pasto === null ? {} : { pasto }),
  });
  const aggiungiASpesa = useMutation(api.spesa.aggiungi);
  const aggiungiADispensa = useMutation(api.frigo.aggiungi);

  type Mancante = { nome: string; quantita?: number; unita?: string };

  const mandaInSpesa = (mancanti: Mancante[]) => {
    setErrore(null);
    for (const ingrediente of mancanti) {
      void aggiungiASpesa({
        nome: ingrediente.nome,
        quantita: ingrediente.quantita,
        unita: ingrediente.unita,
      }).catch((e: unknown) => { setErrore(messaggioErrore(e)); });
    }
  };

  /**
   * "In realtà ce l'ho, mi ero dimenticata di segnarlo": mette il prodotto in
   * dispensa con la quantità che mancava. Se un prodotto con quel nome c'è
   * già, questo si somma a quello — la dispensa ragiona per nome, non per riga.
   */
  const segnaCheCeLHai = (mancanti: Mancante[]) => {
    setErrore(null);
    for (const ingrediente of mancanti) {
      void aggiungiADispensa({
        nome: ingrediente.nome,
        quantita: ingrediente.quantita,
        unita: ingrediente.unita,
      }).catch((e: unknown) => { setErrore(messaggioErrore(e)); });
    }
  };

  return (
    <>
      <Carta fitta>
        <div className="riga riga--tra">
          <span className="dati piccolo tenue">Per quante persone</span>
          <span className="porzioni">
            <button
              type="button"
              aria-label="Meno persone"
              disabled={porzioni <= 1}
              onClick={() => { setPorzioni((p) => Math.max(1, p - 1)); }}
            >
              −
            </button>
            <button type="button" disabled aria-hidden="true">
              {porzioni}
            </button>
            <button
              type="button"
              aria-label="Più persone"
              disabled={porzioni >= MAX_PORZIONI}
              onClick={() => { setPorzioni((p) => Math.min(MAX_PORZIONI, p + 1)); }}
            >
              +
            </button>
          </span>
        </div>
      </Carta>

      <div className="gruppo-stato">
        {PASTI.map((opzione) => (
          <button
            key={opzione.etichetta}
            type="button"
            aria-pressed={pasto === opzione.valore}
            onClick={() => { setPasto(opzione.valore); }}
          >
            {opzione.etichetta}
          </button>
        ))}
      </div>

      <Errore messaggio={errore} />

      {risultati === undefined ? (
        <p className="dati tenue">Carico…</p>
      ) : risultati.length === 0 ? (
        <Vuoto>Nessuna ricetta per questo pasto.</Vuoto>
      ) : (
        risultati.map(({ ricetta, mancanti, coperti, totali, urgentiUsati }) => (
          <section className="carta colonna" key={ricetta._id}>
            <div className="riga riga--tra">
              <strong className="crescente">{ricetta.nome}</strong>
              <EtichettaMancanti quante={mancanti.length} />
            </div>

            <span className="dati tenue piccolo">
              {coperti} ingredienti su {totali} ce li hai
              {ricetta.porzioni !== porzioni &&
                ` · ricetta per ${ricetta.porzioni}, conto fatto per ${porzioni}`}
            </span>

            {urgentiUsati.length > 0 && (
              <span className="dati piccolo" style={{ color: "var(--pomodoro)" }}>
                consuma roba in scadenza: {urgentiUsati.join(", ")}
              </span>
            )}

            {mancanti.length > 0 && (
              <>
                <div className="riga riga--avvolgi">
                  {mancanti.map((ingrediente) => (
                    <button
                      type="button"
                      className="etichetta etichetta--azione"
                      key={ingrediente.nome}
                      title={`Segna che hai già ${ingrediente.nome} in dispensa`}
                      onClick={() => { segnaCheCeLHai([ingrediente]); }}
                    >
                      {ingrediente.nome}
                      {ingrediente.quantita !== undefined &&
                        ` ${formattaQuantita(ingrediente.quantita, ingrediente.unita)}`}
                    </button>
                  ))}
                </div>
                <span className="dati tenue piccolo">
                  Tocca un ingrediente per dire che ce l'hai già: finisce in
                  dispensa e sparisce da qui.
                </span>
                <div className="riga">
                  <button
                    type="button"
                    className="bottone bottone--fantasma bottone--piccolo crescente"
                    onClick={() => { mandaInSpesa(mancanti); }}
                  >
                    + In lista della spesa
                  </button>
                  <button
                    type="button"
                    className="bottone bottone--fantasma bottone--piccolo crescente"
                    onClick={() => { segnaCheCeLHai(mancanti); }}
                  >
                    Ce l'ho tutto
                  </button>
                </div>
              </>
            )}
          </section>
        ))
      )}
    </>
  );
}
