import { useMemo } from "react";
import { MIN_GRUPO } from "../agregacion";
import { armarCurso } from "../estadistica";
import { Titulo, tarjeta } from "./ui";

const nf = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });
const nfr = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const nfp = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const f = (v) => (v === null || v === undefined ? "—" : nf.format(v));

const TH = "px-3 py-2 text-right font-semibold";
const TD = "px-3 py-1.5 text-right tabular-nums";

// Tabla de una variable numérica: xi, fi, Fi, fr, % y xi·fi (para calcular la media a mano: Σ xi·fi ÷ n).
function TablaNumerica({ m }) {
  const { n, filas, sumaXfi } = m.tabla;
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-line">
      <table className="w-full min-w-[480px] text-left text-sm">
        <caption className="sr-only">Tabla de frecuencias: {m.label}</caption>
        <thead className="bg-brand-soft text-brand-text">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">xi ({m.unidad})</th>
            <th scope="col" className={TH}>fi</th>
            <th scope="col" className={TH}>Fi</th>
            <th scope="col" className={TH}>fr</th>
            <th scope="col" className={TH}>%</th>
            <th scope="col" className={TH}>xi · fi</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((r) => (
            <tr key={r.x} className="border-t border-line even:bg-surface-2/60">
              <th scope="row" className="px-3 py-1.5 font-semibold tabular-nums text-fg">{nf.format(r.x)}</th>
              <td className={`${TD} text-fg`}>{r.fi}</td>
              <td className={`${TD} text-fg-soft`}>{r.Fi}</td>
              <td className={`${TD} text-fg-soft`}>{nfr.format(r.fr)}</td>
              <td className={`${TD} text-fg-soft`}>{nfp.format(r.fr * 100)}</td>
              <td className={`${TD} text-fg`}>{nf.format(r.xfi)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-line bg-surface-2 font-semibold text-fg">
            <th scope="row" className="px-3 py-1.5">Σ</th>
            <td className={TD}>{n}</td>
            <td className={TD} />
            <td className={TD}>{nfr.format(1)}</td>
            <td className={TD}>100,0</td>
            <td className={TD}>{nf.format(sumaXfi)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// Para comprobar: está plegado para que primero se pueda calcular a mano sin ver el resultado.
function Comprobar({ m }) {
  const r = m.resumen;
  if (!r) return null;
  const items = [
    ["Media", f(r.media)], ["Mediana", f(r.mediana)], ["Moda", r.modas.length ? r.modas.map(f).join(" y ") : "No hay"],
    ["Q1", f(r.q1)], ["Q3", f(r.q3)], ["Rango", f(r.rango)], ["RIC", f(r.ric)],
    ["Varianza (n − 1)", f(r.varianza)], ["Desvío", f(r.desvio)],
  ];
  return (
    <details className="mt-3 rounded-xl bg-surface px-3 py-2 ring-1 ring-line">
      <summary className="cursor-pointer text-sm font-semibold text-brand-text">Ver resultados para comprobar mi cálculo</summary>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
        {items.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2">
            <dt className="text-muted">{k}</dt>
            <dd className="font-semibold tabular-nums text-fg">{v}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

function TablaCategorica({ c }) {
  const total = c.datos.reduce((a, d) => a + d.fi, 0);
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-line">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Tabla de frecuencias: {c.label}</caption>
        <thead className="bg-brand-soft text-brand-text">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">Categoría</th>
            <th scope="col" className={TH}>fi</th>
            {c.ordinal && <th scope="col" className={TH}>Fi</th>}
            <th scope="col" className={TH}>fr</th>
            <th scope="col" className={TH}>%</th>
          </tr>
        </thead>
        <tbody>
          {c.datos.map((d) => (
            <tr key={d.nombre} className="border-t border-line even:bg-surface-2/60">
              <th scope="row" className="px-3 py-1.5 font-semibold text-fg">{d.nombre}</th>
              <td className={`${TD} text-fg`}>{d.fi}</td>
              {c.ordinal && <td className={`${TD} text-fg-soft`}>{d.Fi}</td>}
              <td className={`${TD} text-fg-soft`}>{nfr.format(d.fr)}</td>
              <td className={`${TD} text-fg-soft`}>{nfp.format(d.fr * 100)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-line bg-surface-2 font-semibold text-fg">
            <th scope="row" className="px-3 py-1.5">Σ</th>
            <td className={TD}>{total}</td>
            {c.ordinal && <td className={TD} />}
            <td className={TD}>{nfr.format(1)}</td>
            <td className={TD}>100,0</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default function CursoResultados({ filas, curso }) {
  const d = useMemo(() => armarCurso(filas, curso), [filas, curso]);

  if (d.n === 0)
    return (
      <p role="status" className={`${tarjeta} text-fg-soft`}>
        <span aria-hidden="true">⏳ </span>
        Todavía no hay datos de {curso} para mostrar: hace falta que haya al menos {MIN_GRUPO} respuestas.
      </p>
    );

  return (
    <div className="space-y-6">
      <section className={tarjeta}>
        <Titulo emoji="🏫">{curso}: {d.n} respuestas</Titulo>
        <p className="text-sm leading-relaxed text-fg-soft">
          <strong>xi</strong> es cada valor, <strong>fi</strong> la frecuencia absoluta (cuántas personas lo eligieron),
          <strong> Fi</strong> la acumulada, <strong>fr</strong> la relativa (fi ÷ n) y <strong>xi · fi</strong> sirve para la media:
          Σ(xi · fi) ÷ n. Solo cuentan las respuestas incluidas en el panel (las excluidas por privacidad no aparecen).
        </p>
      </section>

      {d.numericas.map((m) => (
        <section key={m.key} className={tarjeta}>
          <Titulo emoji={m.emoji}>{m.label} <span className="text-sm font-normal text-muted">({m.unidad})</span></Titulo>
          {m.tabla.n === 0 ? <p className="text-sm text-muted">Sin datos.</p> : (
            <>
              <TablaNumerica m={m} />
              <Comprobar m={m} />
            </>
          )}
        </section>
      ))}

      <div className="grid gap-6 md:grid-cols-2">
        {d.categoricas.map((c) => (
          <section key={c.key} className={tarjeta}>
            <Titulo emoji={c.emoji}>{c.label}</Titulo>
            <TablaCategorica c={c} />
          </section>
        ))}
      </div>
    </div>
  );
}
