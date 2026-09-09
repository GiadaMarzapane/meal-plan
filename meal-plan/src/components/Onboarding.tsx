import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { messaggioErrore } from "../lib/errori";
import { Campo, Errore } from "./ui";

/** Mostrata a chi è autenticato ma non fa ancora parte di un gruppo. */
export function Onboarding() {
  const crea = useMutation(api.households.crea);
  const entra = useMutation(api.households.entra);

  const [modo, setModo] = useState<"crea" | "entra">("crea");
  const [nomeGruppo, setNomeGruppo] = useState("Casa");
  const [displayName, setDisplayName] = useState("");
  const [codice, setCodice] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);

  const invia = (evento: React.FormEvent) => {
    evento.preventDefault();
    setErrore(null);
    setInCorso(true);
    const azione =
      modo === "crea"
        ? crea({ nome: nomeGruppo.trim(), displayName: displayName.trim() })
        : entra({ codice: codice.trim(), displayName: displayName.trim() });
    void azione
      .catch((e: unknown) => { setErrore(messaggioErrore(e)); })
      .finally(() => { setInCorso(false); });
  };

  const nomeMancante = displayName.trim() === "";

  return (
    <div className="centrato">
      <h1>Quasi pronti</h1>
      <form className="carta colonna" onSubmit={invia}>
        <div className="gruppo-stato">
          <button
            type="button"
            aria-pressed={modo === "crea"}
            onClick={() => { setModo("crea"); }}
          >
            Nuovo gruppo
          </button>
          <button
            type="button"
            aria-pressed={modo === "entra"}
            onClick={() => { setModo("entra"); }}
          >
            Ho un codice
          </button>
        </div>

        <Campo etichetta="Come ti chiami">
          <input
            type="text"
            value={displayName}
            placeholder="Giada"
            onChange={(e) => { setDisplayName(e.target.value); }}
          />
        </Campo>

        {modo === "crea" ? (
          <Campo etichetta="Nome del gruppo">
            <input
              type="text"
              value={nomeGruppo}
              onChange={(e) => { setNomeGruppo(e.target.value); }}
            />
          </Campo>
        ) : (
          <Campo etichetta="Codice invito">
            <input
              type="text"
              value={codice}
              placeholder="A1B2C3"
              onChange={(e) => { setCodice(e.target.value.toUpperCase()); }}
            />
          </Campo>
        )}

        <button
          type="submit"
          className="bottone bottone--primario"
          disabled={inCorso || nomeMancante}
        >
          {modo === "crea" ? "Crea il gruppo" : "Entra nel gruppo"}
        </button>
        <Errore messaggio={errore} />
      </form>
    </div>
  );
}
