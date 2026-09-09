import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import {lunediDi, oggiIso} from "../lib/date";
import { formattaQuantita } from "../lib/quantita";
import { messaggioErrore } from "../lib/errori";
import { Carta, Errore, Vuoto } from "./ui";

function Voce({ voce }: { voce: Doc<"listaSpesa"> }) {
  const segna = useMutation(api.spesa.segna);
  const rimuovi = useMutation(api.spesa.rimuovi);
  const quantita = formattaQuantita(voce.quantita, voce.unita);

  return (
    <li className={voce.presa ? "voce-presa" : undefined}>
      <button
        type="button"
        className="spunta"
        aria-pressed={voce.presa}
        aria-label={voce.presa ? `Rimetti ${voce.nome} da prendere` : `Segna ${voce.nome} come presa`}
        onClick={() => { void segna({ voceId: voce._id, presa: !voce.presa }); }}
      >
        {voce.presa ? "✓" : ""}
      </button>
      <span className="crescente nome-voce dati">{voce.nome}</span>
      {quantita !== "" && <span className="dati tenue">{quantita}</span>}
      {!voce.generata && <span className="etichetta">a mano</span>}
      <button
        type="button"
        className="bottone--icona"
        aria-label={`Rimuovi ${voce.nome}`}
        onClick={() => { void rimuovi({ voceId: voce._id }); }}
      >
        ✕
      </button>
    </li>
  );
}

export function Spesa() {
  const voci = useQuery(api.spesa.lista);
  const genera = useMutation(api.spesa.genera);
  const aggiungi = useMutation(api.spesa.aggiungi);
  const rimuoviPrese = useMutation(api.spesa.rimuoviPrese);

  const [nuova, setNuova] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [avviso, setAvviso] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);

  const generaLista = () => {
    setErrore(null);
    setAvviso(null);
    setInCorso(true);
    void genera({ dataInizio: lunediDi(oggiIso()), giorni: 7 })
      .then((esito) => { setAvviso(`${String(esito.create)} voci aggiunte dai menu`); })
      .catch((e: unknown) => { setErrore(messaggioErrore(e)); })
      .finally(() => { setInCorso(false); });
  };

  const aggiungiAMano = (evento: React.FormEvent) => {
    evento.preventDefault();
    setErrore(null);
    const nome = nuova.trim();
    if (nome === "") return;
    void aggiungi({ nome })
      .then(() => { setNuova(""); })
      .catch((e: unknown) => { setErrore(messaggioErrore(e)); });
  };

  const daPrendere = voci?.filter((v) => !v.presa).length ?? 0;

  return (
    <>
      <div className="riga">
        <button
          type="button"
          className="bottone bottone--primario crescente"
          disabled={inCorso}
          onClick={generaLista}
        >
          {inCorso ? "Genero…" : "Genera dai menu"}
        </button>
        <button
          type="button"
          className="bottone"
          onClick={() => { void rimuoviPrese(); }}
        >
          Pulisci prese
        </button>
      </div>

      <Errore messaggio={errore} />
      {avviso !== null && <p className="dati tenue piccolo">{avviso}</p>}

      <Carta titolo="Lista della spesa" azione={<span className="dati tenue piccolo">{daPrendere} da prendere</span>}>
        <form className="riga" onSubmit={aggiungiAMano}>
          <input
            type="text"
            className="crescente"
            value={nuova}
            placeholder="Aggiungi a mano…"
            onChange={(e) => { setNuova(e.target.value); }}
          />
          <button type="submit" className="bottone bottone--piccolo">
            +
          </button>
        </form>
        <hr className="separatore" />

        {voci === undefined ? (
          <p className="dati tenue">Carico…</p>
        ) : voci.length === 0 ? (
          <Vuoto>
            Lista vuota. Pianifica la settimana e premi “Genera dai menu”.
          </Vuoto>
        ) : (
          <ul className="lista">
            {voci.map((voce) => (
              <Voce key={voce._id} voce={voce} />
            ))}
          </ul>
        )}
      </Carta>
    </>
  );
}
