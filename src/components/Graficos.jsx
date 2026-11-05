import { Titulo, tarjeta } from "./ui";
import { MIN_GRUPO } from "../agregacion";

const nf = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });
const PALETA = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#0ea5e9", "#8b5cf6", "#f97316", "#64748b"];
const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);

function Barras({ datos, total }) {
  const max = Math.max(1, ...datos.map((d) => d.n));
  return (
    <ul className="space-y-2">
      {datos.map((d, i) => (
        <li key={d.nombre} className="flex items-center gap-2 text-sm">
          <span className="w-28 shrink-0 text-fg-soft">{d.nombre}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface ring-1 ring-line">
            <div className="h-3 rounded-full" style={{ width: `${(d.n / max) * 100}%`, background: PALETA[i % PALETA.length] }} />
          </div>
          <span className="w-16 shrink-0 text-right font-semibold tabular-nums text-fg">{d.n} · {pct(d.n, total)}%</span>
        </li>
      ))}
    </ul>
  );
}

function Torta({ datos, total, titulo }) {
  const R = 60;
  let acum = -Math.PI / 2;
  const trozos = datos.map((d, i) => {
    const ang = (d.n / total) * Math.PI * 2;
    const [x1, y1] = [Math.cos(acum) * R, Math.sin(acum) * R];
    acum += ang;
    const [x2, y2] = [Math.cos(acum) * R, Math.sin(acum) * R];
    const fill = PALETA[i % PALETA.length];
    return datos.length === 1
      ? <circle key={d.nombre} r={R} fill={fill} />
      : <path key={d.nombre} d={`M0 0 L${x1} ${y1} A${R} ${R} 0 ${ang > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`} fill={fill} style={{ stroke: "var(--surface)" }} strokeWidth="2" />;
  });
  return (
    <svg viewBox="-70 -70 140 140" role="img" aria-label={`Gráfico circular: ${titulo}`} className="mx-auto h-40 w-40 shrink-0">
      {trozos}
    </svg>
  );
}

export function Histograma({ cajas, color, unidad }) {
  const max = Math.max(1, ...cajas.map((c) => c.n));
  const W = 320, H = 130, base = H - 22, ancho = W / cajas.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Histograma en ${unidad}. ` + cajas.map((c) => `de ${nf.format(c.desde)} a ${nf.format(c.hasta)}: ${c.n} ${c.n === 1 ? "respuesta" : "respuestas"}`).join("; ")} className="w-full">
      {cajas.map((c, i) => {
        const h = (c.n / max) * (base - 14);
        return (
          <g key={c.desde}>
            <rect x={i * ancho + 2} y={base - h} width={ancho - 4} height={h} rx="4" fill={color} />
            <text x={i * ancho + ancho / 2} y={base - h - 3} textAnchor="middle" fontSize="10" fontWeight="700" style={{ fill: "var(--fg)" }}>{c.n}</text>
            <text x={i * ancho + ancho / 2} y={H - 6} textAnchor="middle" fontSize="9" style={{ fill: "var(--muted)" }}>
              {cajas[0].hasta - cajas[0].desde === 1 && Number.isInteger(c.desde) ? c.desde : `${nf.format(c.desde)}–${nf.format(c.hasta)}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Graficos({ est }) {
  return (
    <div className="space-y-6">
      <section className={tarjeta}>
        <Titulo emoji="📊">Distribución de las respuestas</Titulo>
        <p className="mb-4 text-xs text-muted">
          Cada gráfico cuenta cuántas personas eligieron cada opción. Las opciones con menos de {MIN_GRUPO} respuestas se agrupan en “Otras respuestas”.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {est.categoricas.map((c) => {
            const total = c.datos.reduce((a, d) => a + d.n, 0);
            return (
              <div key={c.key} className="rounded-2xl bg-surface-2 p-4 ring-1 ring-line">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-fg"><span aria-hidden="true">{c.emoji}</span>{c.label}</h4>
                {total === 0 ? <p className="text-sm text-muted">Sin datos suficientes.</p> : (
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <Torta datos={c.datos} total={total} titulo={c.label} />
                    <div className="w-full flex-1"><Barras datos={c.datos} total={total} /></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className={tarjeta}>
        <Titulo emoji="📉">Histogramas de las variables numéricas</Titulo>
        <p className="mb-4 text-xs text-muted">Cada barra cuenta cuántas respuestas caen en ese intervalo. Muestran la “forma” de los datos: dónde se juntan y qué tan repartidos están.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {est.numericas.map((m) => (
            <div key={m.key} className="rounded-2xl bg-surface-2 p-4 ring-1 ring-line">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-fg"><span aria-hidden="true">{m.emoji}</span>{m.label} <span className="text-xs font-normal text-muted">({m.unidad})</span></h4>
              {m.resumen ? <Histograma cajas={m.cajas} color={m.color} unidad={m.unidad} /> : <p className="text-sm text-muted">Todavía hay pocos datos.</p>}
            </div>
          ))}
        </div>
      </section>

      <section className={tarjeta}>
        <Titulo emoji="🔢">Frecuencia de cada valor</Titulo>
        <p className="mb-4 text-xs text-muted">
          Para cada pregunta numérica, cuántas personas respondieron exactamente cada valor. “%” es la parte del total y “% acumulado” suma los valores hasta esa fila.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {est.numericas.map((m) => (
            <div key={m.key} className="rounded-2xl bg-surface-2 p-4 ring-1 ring-line">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-fg"><span aria-hidden="true">{m.emoji}</span>{m.label}</h4>
              {m.frecs.length ? <TablaFrecuencias m={m} /> : <p className="text-sm text-muted">Todavía hay pocos datos.</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const nfv = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });

// Cuántas personas respondieron cada valor exacto (por ejemplo: 7 horas → 5 personas).
function TablaFrecuencias({ m }) {
  const total = m.frecs.reduce((a, f) => a + f.n, 0);
  const max = Math.max(1, ...m.frecs.map((f) => f.n));
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-line">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Frecuencia de cada valor: {m.label}</caption>
        <thead className="bg-brand-soft text-brand-text">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">Valor ({m.unidad})</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">Personas</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">%</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">% acumulado</th>
            <th scope="col" className="w-1/3 px-3 py-2"><span className="sr-only">Barra</span></th>
          </tr>
        </thead>
        <tbody>
          {m.frecs.map((f) => (
            <tr key={f.valor} className="border-t border-line even:bg-surface-2/60">
              <th scope="row" className="px-3 py-1.5 font-semibold tabular-nums text-fg">{nfv.format(f.valor)}</th>
              <td className="px-3 py-1.5 text-right tabular-nums text-fg">{f.n}</td>
              <td className="px-3 py-1.5 text-right tabular-nums text-fg-soft">{Math.round(f.pct)} %</td>
              <td className="px-3 py-1.5 text-right tabular-nums text-fg-soft">{Math.round(f.acumPct)} %</td>
              <td className="px-3 py-1.5" aria-hidden="true">
                <div className="h-2.5 overflow-hidden rounded-full bg-surface ring-1 ring-line">
                  <div className="h-2.5 rounded-full" style={{ width: `${(f.n / max) * 100}%`, background: m.color }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-line bg-surface-2">
            <th scope="row" className="px-3 py-1.5 font-semibold text-fg">Total</th>
            <td className="px-3 py-1.5 text-right font-semibold tabular-nums text-fg">{total}</td>
            <td colSpan={3} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
