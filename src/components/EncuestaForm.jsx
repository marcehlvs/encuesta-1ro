import { useRef, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { ROLES, EDADES, ALIMENTACION, ACTIVIDAD, limpiarRespuestas } from "../validacion";

const INICIAL = {
  rol: "", rangoEdad: "", horasSueno: 8, vasosAgua: "",
  alimentacion: "", horasPantalla: "", diasActividad: "",
};
const MIN_MS = 4000;       // un humano tarda más que esto en completar el formulario
const COOLDOWN_MS = 30000; // espera entre intentos fallidos

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 " +
  "focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-200";

function Campo({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-800">{label}</span>
      {children}
    </label>
  );
}

export default function EncuestaForm({ t, onSuccess }) {
  const [form, setForm] = useState(INICIAL);
  const [trampa, setTrampa] = useState(""); // honeypot: los humanos no lo ven
  const [enviando, setEnviando] = useState(false);
  const [errorKey, setErrorKey] = useState(""); // clave del mensaje, así se traduce si cambia el idioma
  const inicio = useRef(Date.now());
  const ultimoIntento = useRef(0);

  const op = (v) => t.opciones[v] ?? v; // etiqueta traducida; el valor guardado sigue en español
  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setErrorKey("");

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
    } catch {
      setErrorKey("errEnvio");
    } finally {
      setEnviando(false);
    }
  };

  const select = (name, label, valores) => (
    <Campo label={label}>
      <select name={name} value={form[name]} onChange={onChange} className={inputCls}>
        <option value="">{t.elegir}</option>
        {valores.map((v) => <option key={v} value={v}>{op(v)}</option>)}
      </select>
    </Campo>
  );

  return (
    <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-5 rounded-2xl bg-white p-6 shadow">
      {select("rol", t.rol, ROLES)}
      {select("rangoEdad", t.edad, EDADES)}

      <Campo label={t.sueno(form.horasSueno)}>
        <input type="range" name="horasSueno" min="0" max="12" step="0.5"
          value={form.horasSueno} onChange={onChange} className="w-full accent-teal-700" />
      </Campo>

      <Campo label={t.agua}>
        <input type="number" inputMode="numeric" name="vasosAgua" min="0" max="30" step="1"
          value={form.vasosAgua} onChange={onChange} className={inputCls} placeholder={t.phAgua} />
      </Campo>

      {select("alimentacion", t.alim, ALIMENTACION)}

      <Campo label={t.pantalla}>
        <input type="number" inputMode="decimal" name="horasPantalla" min="0" max="24" step="0.5"
          value={form.horasPantalla} onChange={onChange} className={inputCls} placeholder={t.phPantalla} />
      </Campo>

      {select("diasActividad", t.actividad, ACTIVIDAD)}

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Do not fill
          <input type="text" tabIndex={-1} autoComplete="off" value={trampa} onChange={(e) => setTrampa(e.target.value)} />
        </label>
      </div>

      {errorKey && <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{t[errorKey]}</p>}

      <button type="submit" disabled={enviando}
        className="w-full rounded-lg bg-teal-700 py-3 text-base font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
        {enviando ? t.enviando : t.enviar}
      </button>
    </form>
  );
}
