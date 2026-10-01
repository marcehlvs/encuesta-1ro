import { useMemo } from "react";
import { METRICAS, MIN_GRUPO, armarTablas, aCsv } from "../agregacion";
import { Titulo, btnPrimario, tarjeta } from "./ui";

const nf = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmt = (v, m) => (v === null ? "—" : m.pct ? `${Math.round(v)} %` : nf.format(v));

// Emoji y color de barra de cada métrica (clases completas para que Tailwind las detecte).
const ADORNO = {
  horasSueno: { emoji: "😴", barra: "bg-violet-500" },
  vasosAgua: { emoji: "💧", barra: "bg-sky-500" },
  horasPantalla: { emoji: "📱", barra: "bg-cyan-500" },
  diasActividad: { emoji: "🏃", barra: "bg-orange-500" },
  diasDesayuno: { emoji: "🍳", barra: "bg-amber-500" },
  celular30: { emoji: "🌙", barra: "bg-rose-500" },
};

function Dato({ valor, etiqueta, fondo }) {
  return (
    <div className={`rounded-2xl p-4 ${fondo}`}>
      <p className="text-3xl font-extrabold text-slate-900">{valor}</p>
      <p className="mt-1 text-xs font-semibold text-slate-600">{etiqueta}</p>
    </div>
  );
}

function Tabla({ emoji, titulo, filas, ocultos = [] }) {
  return (
    <section className={tarjeta}>
      <Titulo emoji={emoji}>{titulo}</Titulo>
      <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-100">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-indigo-50 text-indigo-950">
            <tr>
              <th scope="col" className="px-3 py-3 font-semibold">Grupo</th>
              <th scope="col" className="px-3 py-3 text-right font-semibold">Resp.</th>
              {METRICAS.map((m) => (
                <th key={m.key} scope="col" className="px-3 py-3 text-right font-semibold">{m.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.grupo} className="border-t border-slate-100 even:bg-slate-50/60">
                <th scope="row" className="px-3 py-2.5 font-semibold text-slate-900">{f.grupo}</th>
                <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{f.n}</td>
                {METRICAS.map((m) => (
                  <td key={m.key} className="px-3 py-2.5 text-right tabular-nums text-slate-800">{fmt(f.medias[m.key], m)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ocultos.length > 0 && (
        <p className="mt-3 text-xs text-slate-500">
          No se muestran (menos de {MIN_GRUPO} respuestas): {ocultos.join(", ")}.
        </p>
      )}
    </section>
  );
}

function Barras({ titulo, filas, metrica, max, color }) {
  return (
    <div>
      <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</h5>
      <ul className="space-y-2">
        {filas.map(({ grupo, medias }) => {
          const v = medias[metrica.key];
          return (
            <li key={grupo} className="flex items-center gap-2 text-sm">
              <span className="w-24 shrink-0 text-slate-700">{grupo}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                {v !== null && (
                  <div className={`h-3 rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(100, (v / max) * 100)}%` }} />
                )}
              </div>
              <span className="w-14 shrink-0 text-right font-semibold tabular-nums text-slate-900">{fmt(v, metrica)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Graficos({ t }) {
  return (
    <section className={tarjeta}>
      <Titulo emoji="📈">Gráficos</Titulo>
      <div className="grid gap-4 md:grid-cols-2">
        {METRICAS.map((m) => {
          const valores = [...t.roles.filas, ...t.edades.filas].map((f) => f.medias[m.key]).filter((v) => v !== null);
          const max = m.pct ? 100 : Math.max(1, ...valores);
          const { emoji, barra } = ADORNO[m.key];
          return (
            <div key={m.key} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                <span aria-hidden="true">{emoji}</span>{m.label}
              </h4>
              <div className="space-y-4">
                <Barras titulo="Por rol" filas={t.roles.filas} metrica={m} max={max} color={barra} />
                <Barras titulo="Por edad" filas={t.edades.filas} metrica={m} max={max} color={barra} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function descargarCsv(t) {
  const blob = new Blob([aCsv(t)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resultados-encuesta-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function PanelResultados({ filas }) {
  const t = useMemo(() => armarTablas(filas), [filas]);

  return (
    <div className="space-y-6">
      <section className={tarjeta}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Dato valor={t.recibidas} etiqueta="Respuestas recibidas" fondo="bg-indigo-50" />
          <Dato valor={t.incluidas} etiqueta="Incluidas en los cálculos" fondo="bg-emerald-50" />
          <Dato valor={t.excluidas} etiqueta="Excluidas por privacidad" fondo="bg-amber-50" />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-xs text-slate-500">
            Los roles y las edades con menos de {MIN_GRUPO} respuestas no se muestran ni se exportan, y sus respuestas no entran en ningún total.
          </p>
          <button type="button" disabled={t.total.n === 0} onClick={() => descargarCsv(t)} className={btnPrimario}>
            Descargar planilla (CSV)
          </button>
        </div>
      </section>

      {t.total.n === 0 ? (
        <p role="status" className={`${tarjeta} text-slate-700`}>
          <span aria-hidden="true">⏳ </span>
          Todavía no hay resultados para mostrar: hace falta que cada rol y cada rango de edad incluido tenga al menos {MIN_GRUPO} respuestas.
        </p>
      ) : (
        <>
          <Tabla emoji="🌎" titulo="Total" filas={[{ grupo: "Todos", ...t.total }]} />
          <Tabla emoji="🧑‍🎓" titulo="Por rol" filas={t.roles.filas} ocultos={t.roles.ocultos} />
          <Tabla emoji="🎂" titulo="Por rango de edad" filas={t.edades.filas} ocultos={t.edades.ocultos} />
          <Graficos t={t} />
        </>
      )}
    </div>
  );
}
