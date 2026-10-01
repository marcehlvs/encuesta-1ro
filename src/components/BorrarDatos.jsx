import { useState } from "react";
import { deleteDoc } from "firebase/firestore";
import { explicarErrorFirebase } from "../diagnostico";
import { btnPeligro, btnSecundario } from "./ui";

const PALABRA = "BORRAR";
// Se borra de a 20 pedidos en paralelo: cada borrado se valida por separado en las reglas de Firestore,
// y así no se supera el límite de consultas por lote que tienen las reglas.
const LOTE = 20;


export default function BorrarDatos({ refs, onTerminado }) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState("quieto"); // quieto | borrando | listo | error
  const [hechos, setHechos] = useState(0);
  const [fallo, setFallo] = useState(null);

  const total = refs.length;
  const confirmado = texto.trim() === PALABRA;
  const ocupado = estado === "borrando";

  const cerrar = () => {
    setAbierto(false);
    setTexto("");
    setEstado("quieto");
    setHechos(0);
    setFallo(null);
  };

  const borrar = async () => {
    if (!confirmado || ocupado || total === 0) return;
    setEstado("borrando");
    setHechos(0);
    setFallo(null);
    let ok = 0;
    let primerError = null;
    for (let i = 0; i < refs.length && !primerError; i += LOTE) {
      const res = await Promise.allSettled(refs.slice(i, i + LOTE).map((r) => deleteDoc(r)));
      for (const r of res) {
        if (r.status === "fulfilled") ok += 1;
        else primerError ??= r.reason;
      }
      setHechos(ok);
    }
    setTexto("");
    if (primerError) {
      console.error("Panel: falló el borrado", primerError);
      setFallo(explicarErrorFirebase(primerError));
      setEstado("error");
    } else {
      setEstado("listo");
    }
    onTerminado(); // vuelve a leer lo que quedó
  };

  return (
    <section className="rounded-3xl bg-white p-5 shadow-lg shadow-red-100/60 ring-1 ring-red-200">
      <h3 className="flex items-center gap-2 text-lg font-bold text-red-800">
        <span aria-hidden="true">🗑️</span>Borrar datos
      </h3>

      {estado === "listo" && (
        <p role="status" className="mt-3 rounded-2xl bg-green-50 px-4 py-2.5 text-sm text-green-800 ring-1 ring-green-100">
          Listo: se borraron {hechos} respuestas.
        </p>
      )}

      {!abierto ? (
        <div className="mt-2 space-y-3">
          <p className="text-sm text-slate-700">
            Elimina todas las respuestas guardadas ({total} en este momento), también las que el panel no muestra por tener pocos casos.
            No se puede deshacer.
          </p>
          <button type="button" disabled={total === 0} onClick={() => { setEstado("quieto"); setAbierto(true); }} className={btnPeligro}>
            Borrar todas las respuestas…
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-900 ring-1 ring-red-100">
            <p className="font-semibold">Vas a borrar {total} respuestas de forma definitiva.</p>
            <p className="mt-1">Si querés conservar los resultados, descargá antes la planilla (CSV) desde la parte de arriba del panel.</p>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-800">
              Para confirmar, escribí <code className="rounded bg-slate-100 px-1.5 py-0.5 font-bold">{PALABRA}</code>
            </span>
            <input type="text" value={texto} onChange={(e) => setTexto(e.target.value)} disabled={ocupado}
              autoComplete="off" autoCapitalize="characters" spellCheck="false"
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 transition focus:border-red-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-100" />
          </label>

          {ocupado && (
            <p role="status" className="text-sm text-slate-700">Borrando… {hechos} de {total}</p>
          )}
          {estado === "error" && fallo && (
            <div role="alert" className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-800 ring-1 ring-red-100">
              <p>No se pudo terminar el borrado (se borraron {hechos}). Código: <code>{fallo.codigo}</code></p>
              <p className="mt-1 text-xs">{fallo.pista}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={borrar} disabled={!confirmado || ocupado || total === 0} className={btnPeligro}>
              {ocupado ? "Borrando…" : "Borrar definitivamente"}
            </button>
            <button type="button" onClick={cerrar} disabled={ocupado} className={btnSecundario}>
              {estado === "listo" ? "Cerrar" : "Cancelar"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
