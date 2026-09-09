import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { messaggioErrore } from "../lib/errori";

/**
 * Chip per scegliere la categoria di un prodotto: si prende una fra quelle
 * proposte, oppure se ne aggiunge una nuova al volo (che resta disponibile
 * anche per le volte successive).
 */
export function SceltaCategoria({
  valore,
  onCambia,
}: {
  valore: string | null;
  onCambia: (categoria: string | null) => void;
}) {
  const categorie = useQuery(api.categorie.lista);
  const aggiungiCategoria = useMutation(api.categorie.aggiungi);

  const [nuova, setNuova] = useState("");
  const [apriNuova, setApriNuova] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  const confermaNuova = () => {
    const nome = nuova.trim();
    if (nome === "") return;
    setErrore(null);
    void aggiungiCategoria({ nome })
      .then(() => {
        onCambia(nome);
        setNuova("");
        setApriNuova(false);
      })
      .catch((e: unknown) => { setErrore(messaggioErrore(e)); });
  };

  return (
    <div className="campo">
      <span>Categoria</span>
      <div className="riga riga--avvolgi">
        {categorie?.map((categoria) => (
          <button
            key={categoria._id}
            type="button"
            className="chip-commensale"
            aria-pressed={valore === categoria.nome}
            onClick={() => {
              onCambia(valore === categoria.nome ? null : categoria.nome);
            }}
          >
            {categoria.nome}
          </button>
        ))}
        <button
          type="button"
          className="chip-commensale"
          aria-pressed={apriNuova}
          onClick={() => { setApriNuova((v) => !v); }}
        >
          + nuova
        </button>
      </div>

      {apriNuova && (
        <div className="riga">
          <input
            type="text"
            className="crescente"
            value={nuova}
            placeholder="es. conserve"
            onChange={(e) => { setNuova(e.target.value); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Dentro un form, Invio invierebbe il prodotto invece della categoria.
                e.preventDefault();
                confermaNuova();
              }
            }}
          />
          <button
            type="button"
            className="bottone bottone--piccolo"
            onClick={confermaNuova}
          >
            Aggiungi
          </button>
        </div>
      )}

      {errore !== null && <span className="dati piccolo" style={{ color: "var(--pomodoro)" }}>{errore}</span>}
    </div>
  );
}
