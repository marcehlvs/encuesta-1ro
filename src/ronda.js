import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

// "Ronda": número que identifica cada vuelta de la encuesta. Vive en Firestore (config/encuesta).
// Cuando el docente reinicia, la ronda cambia y los dispositivos que habían participado
// en la ronda anterior vuelven a poder responder.
const KEY = "encuesta_completada";
const REF = () => doc(db, "config", "encuesta");

// Valor guardado en el dispositivo: la ronda en la que participó (o null si no participó).
// El valor "true" de versiones anteriores equivale a la ronda 0 (la inicial, sin documento de configuración).
export function rondaLocal() {
  try {
    const v = localStorage.getItem(KEY);
    if (v === null) return null;
    return v === "true" ? 0 : Number(v);
  } catch {
    return null;
  }
}

export function guardarRondaLocal(ronda) {
  try { localStorage.setItem(KEY, String(ronda)); } catch { /* sin almacenamiento */ }
}

// Ronda vigente. Si todavía no existe el documento, es la 0. Si no se puede leer, lanza el error.
export async function rondaRemota() {
  const snap = await getDoc(REF());
  const r = snap.exists() ? snap.data().ronda : 0;
  return Number.isInteger(r) ? r : 0;
}

// Solo desde el panel docente (las reglas exigen estar en /docentes).
export async function nuevaRonda() {
  await setDoc(REF(), { ronda: Date.now() });
}
