import { useEffect, useState } from "react";
import EncuestaForm from "./components/EncuestaForm";
import { IDIOMAS, TEXTOS, idiomaInicial, guardarIdioma } from "./i18n";
import { rondaLocal, guardarRondaLocal, rondaRemota } from "./ronda";

export default function App() {
  // Si este dispositivo ya participó, se confirma con Firestore que la ronda siga siendo la misma
  // (el docente puede haber reiniciado la encuesta). Mientras tanto no se muestra ni el formulario ni el agradecimiento.
  const [participo] = useState(() => rondaLocal());
  const [verificando, setVerificando] = useState(participo !== null);
  const [completada, setCompletada] = useState(participo !== null);
  const [idioma, setIdioma] = useState(idiomaInicial);
  const t = TEXTOS[idioma];

  useEffect(() => {
    if (participo === null) return;
    let activo = true;
    rondaRemota()
      .then((r) => { if (activo && r !== participo) setCompletada(false); })
      .catch((err) => console.warn("Encuesta: no se pudo comprobar la ronda; se mantiene lo guardado en el dispositivo", err))
      .finally(() => { if (activo) setVerificando(false); });
    return () => { activo = false; };
  }, [participo]);

  const alEnviar = async () => {
    setCompletada(true);
    let r = 0;
    try { r = await rondaRemota(); } catch { /* sin conexión: queda la ronda inicial */ }
    guardarRondaLocal(r);
  };

  useEffect(() => {
    document.documentElement.lang = idioma;
    document.title = t.tituloPagina;
  }, [idioma, t]);

  const cambiarIdioma = (code) => {
    setIdioma(code);
    guardarIdioma(code);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-emerald-50 px-4 py-8">
      {/* Manchas de color de fondo (decorativas) */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />

      <div className="relative mx-auto w-full max-w-lg">
        <div role="group" aria-label={t.idioma} className="mb-6 flex justify-end gap-2">
          {IDIOMAS.map(({ code, label }) => (
            <button key={code} type="button" onClick={() => cambiarIdioma(code)}
              aria-pressed={idioma === code}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                idioma === code
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-300/50"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-indigo-50"
              }`}>
              {label}
            </button>
          ))}
        </div>

        <header className="mb-8 text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm ring-1 ring-indigo-100">
            <span aria-hidden="true">🏫</span>{t.institucion}
          </p>
          <h1 className="mt-4 bg-gradient-to-r from-indigo-700 to-violet-600 bg-clip-text text-3xl font-extrabold leading-tight tracking-tight text-transparent sm:text-4xl">
            {t.titulo}
          </h1>
          <p className="mt-3 text-base text-slate-600">{t.subtitulo}</p>
        </header>

        {verificando ? (
          <p role="status" className="text-center text-slate-600">…</p>
        ) : completada ? (
          <div role="status" className="rounded-3xl bg-white p-8 text-center shadow-xl shadow-indigo-100 ring-1 ring-slate-100">
            <p aria-hidden="true" className="text-5xl">🎉</p>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">{t.gracias}</h2>
            <p className="mt-2 text-slate-600">{t.graciasTxt}</p>
          </div>
        ) : (
          <EncuestaForm t={t} onSuccess={alEnviar} />
        )}
      </div>
    </main>
  );
}
