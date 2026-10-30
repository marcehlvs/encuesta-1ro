import { Titulo, tarjeta } from "./ui";
import { Histograma } from "./Graficos";

const nf = new Intl.NumberFormat("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
const f = (v) => (v === null || v === undefined ? "—" : nf.format(v));

const GLOSARIO = [
  { grupo: "Posición: ¿dónde están los datos?", items: [
    ["Media (promedio)", "Se suman todos los valores y se divide por la cantidad de datos.", "Resume todo en un número, pero un valor muy alto o muy bajo la “arrastra”."],
    ["Mediana", "El valor del medio cuando los datos están ordenados: la mitad de las personas está por debajo y la otra mitad por encima.", "No se deja arrastrar por valores extremos. Si media y mediana difieren mucho, hay datos atípicos o la distribución es asimétrica."],
    ["Moda", "El valor que más se repite.", "Muestra la respuesta más común. Puede no existir o haber más de una."],
    ["Cuartiles (Q1 y Q3)", "Si ordenás las respuestas de menor a mayor y las dividís en cuatro partes con la misma cantidad de personas, los cuartiles son los puntos de corte. Q1 (primer cuartil) deja por debajo a la cuarta parte de las respuestas (25 %). Q3 (tercer cuartil) deja por debajo a las tres cuartas partes (75 %). El corte del medio es la mediana.", "Entre Q1 y Q3 queda el 50 % central de las respuestas, sin contar el cuarto más bajo ni el cuarto más alto. Ejemplo: si Q1 es 5,5 y Q3 es 6,75 horas, la mitad de las personas duerme entre 5,5 y 6,75 horas."],
  ]},
  { grupo: "Dispersión: ¿qué tan repartidos están?", items: [
    ["Rango", "Diferencia entre el valor máximo y el mínimo.", "Es fácil de calcular, pero depende solo de los dos extremos."],
    ["Rango intercuartílico (RIC)", "Es la distancia entre Q3 y Q1: se calcula Q3 − Q1. Dice qué tan ancho es el 50 % central de las respuestas.", "Mide qué tan repartidas están las respuestas sin que los valores extremos la distorsionen. Con Q1 = 5,5 y Q3 = 6,75, el RIC es 1,25."],
    ["Valor atípico", "Una respuesta que se aleja mucho del resto. Usamos una regla estándar: se calculan dos límites, el inferior (Q1 − 1,5 × RIC) y el superior (Q3 + 1,5 × RIC), y lo que queda fuera es atípico. Con Q1 = 5,5 y Q3 = 6,75, los límites son 3,6 y 8,6 horas.", "No significa que esté mal: puede ser un caso real o un error de carga (por ejemplo, escribir 24 en vez de 2,4). Conviene revisarlo."],
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
  if (r.atipicos > 0) {
    const partes = [];
    if (r.atipicosBajos > 0) partes.push(`${r.atipicosBajos} por debajo de ${f(r.limInf)}`);
    if (r.atipicosAltos > 0) partes.push(`${r.atipicosAltos} por encima de ${f(r.limSup)}`);
    frases.push(
      `Hay ${r.atipicos === 1 ? "1 valor atípico" : `${r.atipicos} valores atípicos`} (${partes.join(" y ")} ${unidad}). ` +
      "Se alejan mucho del resto: conviene revisar si son casos reales o errores de carga."
    );
  } else {
    frases.push("No hay valores atípicos.");
  }
  return frases.join(" ");
}

function Medida({ nombre, valor, ayuda }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-2 ring-1 ring-line">
      <p className="text-xs font-semibold text-muted">{nombre}</p>
      <p className="text-lg font-extrabold tabular-nums text-fg">{valor}</p>
      {ayuda && <p className="text-xs leading-tight text-muted">{ayuda}</p>}
    </div>
  );
}

function Tarjeta({ m }) {
  const r = m.resumen;
  return (
    <section className={tarjeta}>
      <Titulo emoji={m.emoji}>{m.label} <span className="text-sm font-normal text-muted">({m.unidad})</span></Titulo>
      {!r ? <p className="text-sm text-muted">Todavía hay pocos datos para calcular estas medidas.</p> : (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-2xl bg-surface-2 p-3 ring-1 ring-line"><Histograma cajas={m.cajas} color={m.color} unidad={m.unidad} /></div>
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-bold text-brand-text">Posición</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                <Medida nombre="Media" valor={f(r.media)} />
                <Medida nombre="Mediana" valor={f(r.mediana)} ayuda="el valor del medio" />
                <Medida nombre="Moda" valor={r.modas.length ? r.modas.map(f).join(" y ") : "No hay"} />
                <Medida nombre="Cuartil 1 (Q1)" valor={f(r.q1)} ayuda="25 % por debajo" />
                <Medida nombre="Cuartil 3 (Q3)" valor={f(r.q3)} ayuda="75 % por debajo" />
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold text-ok">Dispersión</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                <Medida nombre="Rango" valor={f(r.rango)} ayuda="máximo − mínimo" />
                <Medida nombre="RIC" valor={f(r.ric)} ayuda="Q3 − Q1" />
                <Medida nombre="Varianza" valor={f(r.varianza)} />
                <Medida nombre="Desvío" valor={f(r.desvio)} />
                <Medida nombre="Coef. de variación" valor={r.cv === null ? "—" : `${Math.round(r.cv)} %`} />
              </div>
            </div>
            <p className="rounded-2xl bg-brand-soft px-3 py-2 text-sm leading-relaxed text-brand-text"><span aria-hidden="true">💡 </span><span className="font-semibold">En palabras: </span>{lectura(r, m.unidad)}</p>
            <p className="text-xs text-muted">Mínimo {f(r.min)} · máximo {f(r.max)} · {r.n} respuestas.</p>
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
        <p className="text-sm leading-relaxed text-fg-soft">
          Cuando recolectamos datos tenemos muchas respuestas sueltas, y hace falta resumirlas para poder leerlas. Un solo número no alcanza:
          dos cursos pueden tener el mismo promedio de sueño y, sin embargo, en uno todos duermen entre 7 y 8 horas y en el otro hay quienes duermen 4 y quienes duermen 10.
          Las <strong>medidas de posición</strong> dicen dónde se ubican los datos y las <strong>medidas de dispersión</strong> dicen qué tan parecidos o distintos son.
          Mirarlas juntas permite comparar grupos con justicia, detectar datos atípicos o errores de carga y saber cuánta confianza darle a un promedio.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {GLOSARIO.map((g) => (
            <div key={g.grupo} className="rounded-2xl bg-surface-2 p-4 ring-1 ring-line">
              <h4 className="mb-2 font-semibold text-fg">{g.grupo}</h4>
              <dl className="space-y-3 text-sm">
                {g.items.map(([t, que, porque]) => (
                  <div key={t}>
                    <dt className="font-semibold text-brand-text">{t}</dt>
                    <dd className="text-fg-soft">{que}</dd>
                    <dd className="text-muted"><span className="font-semibold">Para qué sirve:</span> {porque}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>
      {est.numericas.map((m) => <Tarjeta key={m.key} m={m} />)}
      <p className="text-xs text-muted">
        Las medidas se calculan con todas las respuestas incluidas (sin separar por grupo). Los días de actividad física se muestran como categorías porque se preguntan por rangos (“1-2”, “4+”).
      </p>
    </div>
  );
}
