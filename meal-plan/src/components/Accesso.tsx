import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { messaggioErrore } from "../lib/errori";
import { Errore } from "./ui";

export function Accesso() {
  const { signIn } = useAuthActions();
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState<string | null>(null);

  const accedi = (provider: "github" | "google") => {
    setErrore(null);
    setInCorso(provider);
    void signIn(provider).catch((e: unknown) => {
      setErrore(messaggioErrore(e));
      setInCorso(null);
    });
  };

  return (
    <div className="centrato">
      <div>
        <p className="dati tenue" style={{ letterSpacing: "0.2em" }}>
          MENU · SPESA · FRIGO
        </p>
        <h1>Dispensa</h1>
      </div>
      <section className="carta colonna">
        <p className="dati tenue piccolo">
          Accedi per pianificare i menu della settimana e condividere la lista
          della spesa.
        </p>
        <button
          type="button"
          className="bottone bottone--primario"
          disabled={inCorso !== null}
          onClick={() => { accedi("github"); }}
        >
          {inCorso === "github" ? "Apro GitHub…" : "Entra con GitHub"}
        </button>
        <button
          type="button"
          className="bottone"
          disabled={inCorso !== null}
          onClick={() => { accedi("google"); }}
        >
          {inCorso === "google" ? "Apro Google…" : "Entra con Google"}
        </button>
        <Errore messaggio={errore} />
      </section>
    </div>
  );
}
