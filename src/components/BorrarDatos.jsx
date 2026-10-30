import { useState } from "react";
import { deleteDoc } from "firebase/firestore";
import { explicarErrorFirebase } from "../diagnostico";
import { nuevaRonda } from "../ronda";
import { armarTablas } from "../agregacion";
import { descargarCsv } from "./PanelResultados";
import { Aviso, btnPeligro, btnSecundario } from "./ui";

const PALABRA = "BORRAR";
// Se borra de a 20 pedidos en paralelo: cada borrado se valida por separado en las reglas de Firestore,
// y así no se supera el límite de consultas por lote que tienen las reglas.
const LOTE = 20;


export default function BorrarDatos({ refs, filas = [], onTerminado }) {
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
    if (!confirmado || ocupado) return;
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
      // Habilita de nuevo a quienes ya habían participado (cambia la ronda en Firestore).
      try {
        await nuevaRonda();
        setEstado("listo");
      } catch (err) {
        console.error("Panel: se borraron las respuestas pero no se pudo reiniciar la participación", err);
        setFallo(explicarErrorFirebase(err));
        setEstado("errorRonda");
      }
    }
    onTerminado(); // vuelve a leer lo que quedó
  };

  return (
    <section className="rounded-3xl bg-surface p-5 shadow-card ring-1 ring-danger-line">
      <h3 className="flex items-center gap-2 text-lg font-bold text-danger">
        <span aria-hidden="true">🗑️</span>Reiniciar encuesta
      </h3>

      {estado === "listo" && (
        <Aviso tono="ok" icono="✅" className="mt-3">Listo: se borraron {hechos} respuestas y la encuesta quedó habilitada de nuevo para todas las personas.</Aviso>
      )}

      {!abierto ? (
        <div className="mt-2 space-y-3">
          <p className="text-sm text-fg-soft">
            Elimina todas las respuestas guardadas ({total} en este momento), también las que el panel no muestra por tener pocos casos,
            y permite que quienes ya participaron puedan responder otra vez. No se puede deshacer.
          </p>
          <button type="button" onClick={() => { setEstado("quieto"); setAbierto(true); }} className={btnPeligro}>
            Reiniciar encuesta…
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger ring-1 ring-danger-line">
            <p className="font-semibold">Vas a borrar {total} respuestas de forma definitiva y a habilitar de nuevo la encuesta para todas las personas.</p>
            <p className="mt-1">Si querés conservar los resultados, descargá antes la planilla (CSV) desde la parte de arriba del panel.</p>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-fg">
              Para confirmar, escribí <code className="rounded bg-surface-2 px-1.5 py-0.5 font-bold">{PALABRA}</code>
            </span>
            <input type="text" value={texto} onChange={(e) => setTexto(e.target.value)} disabled={ocupado}
              autoComplete="off" autoCapitalize="characters" spellCheck="false"
              className="w-full rounded-2xl border-2 border-line bg-surface-2 px-4 py-3 text-base text-fg transition focus:border-danger focus:bg-surface focus:outline-none focus:ring-4 focus:ring-danger-line" />
          </label>

          {ocupado && (
            <p role="status" className="text-sm text-fg-soft">Borrando… {hechos} de {total}</p>
          )}
          {estado === "errorRonda" && fallo && (
            <Aviso tono="error">
              <p>Se borraron {hechos} respuestas, pero no se pudo habilitar de nuevo la encuesta. Volvé a tocar “Borrar y reiniciar”. Código: <code>{fallo.codigo}</code></p>
              <p className="mt-1 text-xs">{fallo.pista} Revisá que hayas publicado las reglas nuevas de <code>firestore.rules</code> (colección <code>config</code>).</p>
            </Aviso>
          )}
          {estado === "error" && fallo && (
            <Aviso tono="error">
              <p>No se pudo terminar el borrado (se borraron {hechos}). Código: <code>{fallo.codigo}</code></p>
              <p className="mt-1 text-xs">{fallo.pista}</p>
            </Aviso>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => descargarCsv(armarTablas(filas))} disabled={ocupado || filas.length === 0} className={btnSecundario}>
              Descargar CSV antes
            </button>
            <button type="button" onClick={borrar} disabled={!confirmado || ocupado} className={btnPeligro}>
              {ocupado ? "Reiniciando…" : "Borrar y reiniciar"}
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
