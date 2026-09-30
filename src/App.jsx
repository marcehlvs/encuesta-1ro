import { useEffect, useState } from "react";
import EncuestaForm from "./components/EncuestaForm";
import { IDIOMAS, TEXTOS, idiomaInicial, guardarIdioma } from "./i18n";

const KEY = "encuesta_completada";

function yaCompleto() {
  try {
    return localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

export default function App() {
  const [completada, setCompletada] = useState(yaCompleto);
  const [idioma, setIdioma] = useState(idiomaInicial);
  const t = TEXTOS[idioma];

  useEffect(() => {
    document.documentElement.lang = idioma;
    document.title = t.tituloPagina;
  }, [idioma, t]);

  const cambiarIdioma = (code) => {
    setIdioma(code);
    guardarIdioma(code);
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto w-full max-w-lg">
        <div role="group" aria-label={t.idioma} className="mb-4 flex justify-end gap-2">
          {IDIOMAS.map(({ code, label }) => (
            <button key={code} type="button" onClick={() => cambiarIdioma(code)}
              aria-pressed={idioma === code}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                idioma === code ? "bg-teal-700 text-white" : "bg-white text-slate-700 hover:bg-slate-200"
              }`}>
              {label}
            </button>
          ))}
        </div>

        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{t.titulo}</h1>
          <p className="mt-1 text-sm text-slate-600">{t.subtitulo}</p>
        </header>

        {completada ? (
          <div role="status" className="rounded-2xl bg-white p-8 shadow">
            <h2 className="text-xl font-semibold text-slate-900">{t.gracias}</h2>
            <p className="mt-2 text-slate-600">{t.graciasTxt}</p>
          </div>
        ) : (
          <EncuestaForm t={t} onSuccess={() => setCompletada(true)} />
        )}
      </div>
    </main>
  );
}
