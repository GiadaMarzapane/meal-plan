import { Authenticated, AuthLoading, Unauthenticated, useQuery } from "convex/react";
import { useState } from "react";
import {
  BookOpen,
  ChefHat,
  Clock,
  Refrigerator,
  ShoppingCart,
  Users,
} from "lucide-react";
import { api } from "../convex/_generated/api";
import { Accesso } from "./components/Accesso";
import { CucinaOra } from "./components/CucinaOra";
import { Frigo } from "./components/Frigo";
import { Impostazioni } from "./components/Impostazioni";
import { Onboarding } from "./components/Onboarding";
import { Pianificatore } from "./components/Pianificatore";
import { Ricette } from "./components/Ricette";
import { Spesa } from "./components/Spesa";

const SEZIONI = [
  { chiave: "menu", etichetta: "Menu", Icona: ChefHat },
  { chiave: "ora", etichetta: "Ora", Icona: Clock },
  { chiave: "spesa", etichetta: "Spesa", Icona: ShoppingCart },
  { chiave: "frigo", etichetta: "Frigo", Icona: Refrigerator },
  { chiave: "ricette", etichetta: "Ricette", Icona: BookOpen },
  { chiave: "gruppo", etichetta: "Gruppo", Icona: Users },
] as const;

type Sezione = (typeof SEZIONI)[number]["chiave"];

function AppAutenticata() {
  const stato = useQuery(api.households.corrente);
  const [sezione, setSezione] = useState<Sezione>("menu");

  if (stato === undefined) {
    return (
      <div className="centrato">
        <p className="dati tenue">Carico…</p>
      </div>
    );
  }

  if (stato === null || stato.household === null) return <Onboarding />;

  const household = stato.household;

  return (
    <div className="app">
      <header className="intestazione">
        <div>
          <span className="marchio">Dispensa</span>
          <h1>
            {sezione === "ora"
              ? "Cosa posso cucinare adesso"
              : SEZIONI.find((s) => s.chiave === sezione)?.etichetta}
          </h1>
        </div>
        <span className="dati tenue piccolo">{household.name}</span>
      </header>

      <main className="contenuto">
        {sezione === "menu" && <Pianificatore membri={stato.membri} />}
        {sezione === "ora" && <CucinaOra />}
        {sezione === "spesa" && <Spesa />}
        {sezione === "frigo" && <Frigo />}
        {sezione === "ricette" && <Ricette />}
        {sezione === "gruppo" && (
          <Impostazioni household={household} membri={stato.membri} />
        )}
      </main>

      <nav className="barra-nav">
        <div className="barra-nav__interno">
          {SEZIONI.map((voce) => (
            <button
              key={voce.chiave}
              type="button"
              aria-current={sezione === voce.chiave ? "page" : undefined}
              onClick={() => { setSezione(voce.chiave); }}
            >
              <voce.Icona size={20} strokeWidth={1.75} aria-hidden="true" />
              <span>{voce.etichetta}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <>
      <AuthLoading>
        <div className="centrato">
          <p className="dati tenue">Un attimo…</p>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <Accesso />
      </Unauthenticated>
      <Authenticated>
        <AppAutenticata />
      </Authenticated>
    </>
  );
}
