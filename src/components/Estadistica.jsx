import { Titulo, tarjeta } from "./ui";
import { Histograma } from "./Graficos";

const nf = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
const f = (v) => (v === null || v === undefined ? "—" : nf.format(v));

const GLOSARIO = [
  { grupo: "Posición: ¿dónde están los datos?", items: [
    ["Media (promedio)", "Se suman todos los valores y se divide por la cantidad de datos.", "Resume todo en un número, pero un valor muy alto o muy bajo la “arrastra”."],
    ["Mediana", "El valor del medio cuando los datos están ordenados: la mitad de las personas está por debajo y la otra mitad por encima.", "No se deja arrastrar por valores extremos. Si media y mediana difieren mucho, hay datos atípicos o la distribución es asimétrica."],
    ["Moda", "El valor que más se repite.", "Muestra la respuesta más común. Puede no existir o haber más de una."],
    ["Cuartiles (Q1 y Q3)", "Dividen los datos ordenados en cuatro partes: el 25 % está por debajo de Q1 y el 75 % por debajo de Q3.", "Entre Q1 y Q3 está el 50 % central de las respuestas."],
  ]},
  { grupo: "Dispersión: ¿qué tan repartidos están?", items: [
    ["Rango", "Diferencia entre el valor máximo y el mínimo.", "Es fácil de calcular, pero depende solo de los dos extremos."],
    ["Rango intercuartílico (RIC)", "Q3 − Q1: el ancho del 50 % central.", "Mide la dispersión sin que los extremos la distorsionen. Se usa para detectar valores atípicos."],
    ["Varianza y desvío estándar", "La varianza es el promedio de los cuadrados de las distancias a la media (acá dividimos por n − 1, por ser una muestra). El desvío es su raíz cuadrada, así que queda en las mismas unidades que los datos.", "Cuanto más chico es el desvío, más parecidas son las respuestas; cuanto más grande, más distintas."],
    ["Coeficiente de variación", "Desvío estándar ÷ media, en porcentaje.", "Permite comparar la dispersión de variables con unidades distintas (horas contra vasos)."],
  ]},
];

function lectura(r, unidad) {
  const frases = [];
  const dif = Math.abs(r.media - r.mediana);
  frases.push(
    r.rango > 0 && dif / r.rango > 0.15
      ? `La media (${f(r.media)}) y la mediana (${f(r.mediana)}) se separan bastante: puede haber valores extremos que tiran del promedio.`
      : `La media (${f(r.media)}) y la mediana (${f(r.mediana)}) son parecidas: los datos están bastante equilibrados.`
  );
  frases.push(`La mitad central de las respuestas está entre ${f(r.q1)} y ${f(r.q3)} ${unidad}.`);
  if (r.cv !== null) frases.push(r.cv < 15 ? "Las respuestas son muy parecidas entre sí." : r.cv < 30 ? "Hay una dispersión moderada." : "Las respuestas son muy distintas entre sí.");
  if (r.atipicos > 0) frases.push(`Hay ${r.atipicos === 1 ? "1 valor atípico" : `${r.atipicos} valores atípicos`} (fuera de Q1 − 1,5·RIC o Q3 + 1,5·RIC).`);
  return frases.join(" ");
}

function Medida({ nombre, valor }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{nombre}</p>
      <p className="text-lg font-extrabold tabular-nums text-slate-900">{valor}</p>
    </div>
  );
}

function Tarjeta({ m }) {
  const r = m.resumen;
  return (
    <section className={tarjeta}>
      <Titulo emoji={m.emoji}>{m.label} <span className="text-sm font-normal text-slate-500">({m.unidad})</span></Titulo>
      {!r ? <p className="text-sm text-slate-500">Todavía hay pocos datos para calcular estas medidas.</p> : (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100"><Histograma cajas={m.cajas} color={m.color} unidad={m.unidad} /></div>
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-bold text-indigo-700">Posición</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                <Medida nombre="Media" valor={f(r.media)} />
                <Medida nombre="Mediana" valor={f(r.mediana)} />
                <Medida nombre="Moda" valor={r.modas.length ? r.modas.map(f).join(" y ") : "No hay"} />
                <Medida nombre="Q1" valor={f(r.q1)} />
                <Medida nombre="Q3" valor={f(r.q3)} />
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold text-emerald-700">Dispersión</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                <Medida nombre="Rango" valor={f(r.rango)} />
                <Medida nombre="RIC" valor={f(r.ric)} />
                <Medida nombre="Varianza" valor={f(r.varianza)} />
                <Medida nombre="Desvío" valor={f(r.desvio)} />
                <Medida nombre="C. de var." valor={r.cv === null ? "—" : `${Math.round(r.cv)} %`} />
              </div>
            </div>
            <p className="rounded-2xl bg-indigo-50 px-3 py-2 text-sm text-indigo-950"><span aria-hidden="true">💡 </span>{lectura(r, m.unidad)}</p>
            <p className="text-xs text-slate-500">Mínimo {f(r.min)} · máximo {f(r.max)} · {r.n} respuestas.</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default function Estadistica({ est }) {
  return (
    <div className="space-y-6">
      <section className={tarjeta}>
        <Titulo emoji="🧮">¿Por qué importan estas medidas?</Titulo>
        <p className="text-sm leading-relaxed text-slate-700">
          Cuando recolectamos datos tenemos muchas respuestas sueltas, y hace falta resumirlas para poder leerlas. Un solo número no alcanza:
          dos cursos pueden tener el mismo promedio de sueño y, sin embargo, en uno todos duermen entre 7 y 8 horas y en el otro hay quienes duermen 4 y quienes duermen 10.
          Las <strong>medidas de posición</strong> dicen dónde se ubican los datos y las <strong>medidas de dispersión</strong> dicen qué tan parecidos o distintos son.
          Mirarlas juntas permite comparar grupos con justicia, detectar datos atípicos o errores de carga y saber cuánta confianza darle a un promedio.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {GLOSARIO.map((g) => (
            <div key={g.grupo} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <h4 className="mb-2 font-semibold text-slate-900">{g.grupo}</h4>
              <dl className="space-y-3 text-sm">
                {g.items.map(([t, que, porque]) => (
                  <div key={t}>
                    <dt className="font-semibold text-indigo-800">{t}</dt>
                    <dd className="text-slate-700">{que}</dd>
                    <dd className="text-slate-500"><span className="font-semibold">Para qué sirve:</span> {porque}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>
      {est.numericas.map((m) => <Tarjeta key={m.key} m={m} />)}
      <p className="text-xs text-slate-500">
        Las medidas se calculan con todas las respuestas incluidas (sin separar por grupo). Los días de actividad física se muestran como categorías porque se preguntan por rangos (“1-2”, “4+”).
      </p>
    </div>
  );
}
