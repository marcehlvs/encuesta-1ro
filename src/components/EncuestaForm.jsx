import { useRef, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { explicarErrorFirebase } from "../diagnostico";
import { ROLES, EDADES, ALIMENTACION, ACTIVIDAD, CELULAR, limpiarRespuestas } from "../validacion";

const INICIAL = {
  rol: "", rangoEdad: "", horasSueno: 8, vasosAgua: "",
  alimentacion: "", horasPantalla: "", diasActividad: "",
  diasDesayuno: "", celularAntesDormir: "",
};
const DESAYUNO = ["0", "1", "2", "3", "4", "5", "6", "7"];
// Campos que la persona tiene que completar (el sueño ya viene con un valor inicial en el control deslizante).
const REQUERIDOS = ["rol", "rangoEdad", "vasosAgua", "alimentacion", "horasPantalla", "diasActividad", "diasDesayuno", "celularAntesDormir"];
const MIN_MS = 4000;       // un humano tarda más que esto en completar el formulario
const COOLDOWN_MS = 30000; // espera entre intentos fallidos

// Clases completas (no armadas con variables) para que Tailwind las detecte al compilar.
const TONOS = {
  indigo: "bg-indigo-100", sky: "bg-sky-100", violet: "bg-violet-100", emerald: "bg-emerald-100",
  amber: "bg-amber-100", rose: "bg-rose-100", cyan: "bg-cyan-100", orange: "bg-orange-100", fuchsia: "bg-fuchsia-100",
};

const inputNumCls =
  "w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-lg font-semibold text-slate-900 " +
  "transition placeholder:font-normal placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white " +
  "focus:outline-none focus:ring-4 focus:ring-indigo-100";

function Pregunta({ id, emoji, tono, titulo, children }) {
  return (
    <section aria-labelledby={id} className="rounded-3xl bg-white p-5 shadow-lg shadow-indigo-100/60 ring-1 ring-slate-100">
      <div className="mb-4 flex items-center gap-3">
        <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl ${TONOS[tono]}`}>
          {emoji}
        </span>
        <h3 id={id} className="text-base font-semibold leading-snug text-slate-900">{titulo}</h3>
      </div>
      {children}
    </section>
  );
}

// Opciones como "chips" (botones de radio con estilo): más rápidas de tocar en el celular que una lista desplegable.
function Opciones({ id, name, valores, valor, onChange, op, layout = "grid" }) {
  const contenedor = layout === "grid" ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-2";
  return (
    <div role="radiogroup" aria-labelledby={id} className={contenedor}>
      {valores.map((v) => (
        <label key={v} className="relative">
          <input type="radio" name={name} value={v} checked={valor === v} onChange={onChange} className="peer sr-only" />
          <span className="flex h-full min-h-11 cursor-pointer select-none items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:border-indigo-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-200">
            {op(v)}
          </span>
        </label>
      ))}
    </div>
  );
}

function Numero({ id, unidad, ...props }) {
  return (
    <div className="flex items-center gap-3">
      <input type="number" aria-labelledby={id} className={inputNumCls} {...props} />
      <span className="shrink-0 text-sm font-medium text-slate-500">{unidad}</span>
    </div>
  );
}

export default function EncuestaForm({ t, onSuccess }) {
  const [form, setForm] = useState(INICIAL);
  const [acepta, setAcepta] = useState(false); // consentimiento: sin marcar no se envía
  const [trampa, setTrampa] = useState(""); // honeypot: los humanos no lo ven
  const [enviando, setEnviando] = useState(false);
  const [detalle, setDetalle] = useState(null); // solo se muestra con ?debug en la URL
  const [errorKey, setErrorKey] = useState(""); // clave del mensaje, así se traduce si cambia el idioma
  const inicio = useRef(Date.now());
  const ultimoIntento = useRef(0);

  const op = (v) => t.opciones[v] ?? v; // etiqueta traducida; el valor guardado sigue en español
  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const respondidas = REQUERIDOS.filter((k) => form[k] !== "").length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setErrorKey("");

    if (!acepta) return setErrorKey("errConsent");
    if (trampa || Date.now() - inicio.current < MIN_MS) return setErrorKey("errBot");
    if (Date.now() - ultimoIntento.current < COOLDOWN_MS) return setErrorKey("errEspera");

    const datos = limpiarRespuestas(form);
    if (!datos) return setErrorKey("errCampos");

    setEnviando(true);
    ultimoIntento.current = Date.now();
    try {
      await addDoc(collection(db, "encuestas_habitos"), { ...datos, timestamp: serverTimestamp() });
      try { localStorage.setItem("encuesta_completada", "true"); } catch { /* sin almacenamiento */ }
      onSuccess();
    } catch (err) {
      console.error("Encuesta: falló el envío", err);
      setDetalle(explicarErrorFirebase(err));
      setErrorKey("errEnvio");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-4">
      <section aria-labelledby="aviso-titulo" className="rounded-3xl bg-indigo-50 p-5 ring-1 ring-indigo-100">
        <h2 id="aviso-titulo" className="flex items-center gap-2 font-semibold text-indigo-950">
          <span aria-hidden="true">🔒</span>{t.avisoTitulo}
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-700 marker:text-indigo-400">
          {t.aviso.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-3 text-sm font-medium text-slate-900 ring-1 ring-indigo-100">
          <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-indigo-600" />
          <span>{t.consiento}</span>
        </label>
      </section>

      <div className="sticky top-3 z-10 rounded-2xl bg-white/90 px-4 py-3 shadow-md ring-1 ring-slate-100 backdrop-blur">
        <p className="mb-1.5 text-xs font-semibold text-slate-600">{t.progreso(respondidas, REQUERIDOS.length)}</p>
        <div role="progressbar" aria-label={t.progreso(respondidas, REQUERIDOS.length)}
          aria-valuemin={0} aria-valuemax={REQUERIDOS.length} aria-valuenow={respondidas}
          className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${(respondidas / REQUERIDOS.length) * 100}%` }} />
        </div>
      </div>

      <Pregunta id="q-rol" emoji="👋" tono="indigo" titulo={t.rol}>
        <Opciones id="q-rol" name="rol" valores={ROLES} valor={form.rol} onChange={onChange} op={op} />
      </Pregunta>

      <Pregunta id="q-edad" emoji="🎂" tono="fuchsia" titulo={t.edad}>
        <Opciones id="q-edad" name="rangoEdad" valores={EDADES} valor={form.rangoEdad} onChange={onChange} op={op} layout="wrap" />
      </Pregunta>

      <Pregunta id="q-sueno" emoji="😴" tono="violet" titulo={t.sueno}>
        <p aria-hidden="true" className="mb-3 text-center text-4xl font-extrabold text-indigo-600">
          {form.horasSueno} <span className="text-base font-medium text-slate-500">h</span>
        </p>
        <input type="range" aria-labelledby="q-sueno" name="horasSueno" min="0" max="12" step="0.5"
          value={form.horasSueno} onChange={onChange} className="h-2 w-full cursor-pointer accent-indigo-600" />
        <div aria-hidden="true" className="mt-1 flex justify-between text-xs text-slate-400"><span>0</span><span>12</span></div>
      </Pregunta>

      <Pregunta id="q-agua" emoji="💧" tono="sky" titulo={t.agua}>
        <Numero id="q-agua" unidad={t.uVasos} inputMode="numeric" name="vasosAgua" min="0" max="30" step="1"
          value={form.vasosAgua} onChange={onChange} placeholder={t.phAgua} />
      </Pregunta>

      <Pregunta id="q-alim" emoji="🥗" tono="emerald" titulo={t.alim}>
        <Opciones id="q-alim" name="alimentacion" valores={ALIMENTACION} valor={form.alimentacion} onChange={onChange} op={op} layout="wrap" />
      </Pregunta>

      <Pregunta id="q-pantalla" emoji="📱" tono="cyan" titulo={t.pantalla}>
        <Numero id="q-pantalla" unidad={t.uHoras} inputMode="decimal" name="horasPantalla" min="0" max="24" step="0.5"
          value={form.horasPantalla} onChange={onChange} placeholder={t.phPantalla} />
      </Pregunta>

      <Pregunta id="q-actividad" emoji="🏃" tono="orange" titulo={t.actividad}>
        <Opciones id="q-actividad" name="diasActividad" valores={ACTIVIDAD} valor={form.diasActividad} onChange={onChange} op={op} />
      </Pregunta>

      <Pregunta id="q-desayuno" emoji="🍳" tono="amber" titulo={t.desayuno}>
        <Opciones id="q-desayuno" name="diasDesayuno" valores={DESAYUNO} valor={form.diasDesayuno} onChange={onChange}
          op={(v) => v} layout="wrap" />
      </Pregunta>

      <Pregunta id="q-celular" emoji="🌙" tono="rose" titulo={t.celular}>
        <Opciones id="q-celular" name="celularAntesDormir" valores={CELULAR} valor={form.celularAntesDormir} onChange={onChange} op={op} />
      </Pregunta>

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Do not fill
          <input type="text" tabIndex={-1} autoComplete="off" value={trampa} onChange={(e) => setTrampa(e.target.value)} />
        </label>
      </div>

      {errorKey && (
        <div role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
          <p>{t[errorKey]}</p>
          {errorKey === "errEnvio" && detalle && new URLSearchParams(window.location.search).has("debug") && (
            <p className="mt-1 text-xs text-red-800">Código: {detalle.codigo}. {detalle.pista}</p>
          )}
        </div>
      )}

      <button type="submit" disabled={enviando}
        className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-300/50 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60">
        {enviando ? t.enviando : t.enviar}
      </button>
    </form>
  );
}
