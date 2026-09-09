import type { ReactNode } from "react";

export function Carta({
  titolo,
  azione,
  children,
  fitta = false,
}: {
  titolo?: string;
  azione?: ReactNode;
  children: ReactNode;
  fitta?: boolean;
}) {
  return (
    <section className={fitta ? "carta carta--fitta" : "carta"}>
      {titolo !== undefined && (
        <>
          <div className="riga riga--tra">
            <h2>{titolo}</h2>
            {azione}
          </div>
          <hr className="separatore" />
        </>
      )}
      {children}
    </section>
  );
}

export function Vuoto({ children }: { children: ReactNode }) {
  return <p className="vuoto">{children}</p>;
}

export function Errore({ messaggio }: { messaggio: string | null }) {
  if (messaggio === null) return null;
  return (
    <p className="errore" role="alert">
      {messaggio}
    </p>
  );
}

export function Campo({
  etichetta,
  children,
}: {
  etichetta: string;
  children: ReactNode;
}) {
  return (
    <label className="campo">
      <span>{etichetta}</span>
      {children}
    </label>
  );
}
