import { MIN_GRUPO, conjuntoPublicable } from "./agregacion.js";
import { ALIMENTACION, ACTIVIDAD, CELULAR, ROLES, EDADES, CURSOS_PANEL, cursoDe } from "./validacion.js";

// Variables numéricas: las medidas de posición y dispersión se calculan sobre sus valores.
export const NUMERICAS = [
  { key: "horasSueno", label: "Horas de sueño", unidad: "h/día", emoji: "😴", color: "#8b5cf6", paso: 1 },
  { key: "vasosAgua", label: "Vasos de agua", unidad: "vasos/día", emoji: "💧", color: "#0ea5e9", paso: 2 },
  { key: "horasPantalla", label: "Pantalla recreativa", unidad: "h/día", emoji: "📱", color: "#06b6d4", paso: 1 },
  { key: "diasDesayuno", label: "Días que desayuna", unidad: "días/sem", emoji: "🍳", color: "#f59e0b", paso: 1 },
];

// Variables por categorías: se muestran con barras y gráfico circular.
export const CATEGORICAS = [
  { key: "rol", label: "Rol", emoji: "🧑‍🎓", orden: ROLES },
  { key: "curso", label: "Curso", emoji: "🏫", orden: CURSOS_PANEL },
  { key: "rangoEdad", label: "Rango de edad", emoji: "🎂", orden: EDADES },
  { key: "alimentacion", label: "Tipo de alimentación", emoji: "🥗", orden: ALIMENTACION },
  { key: "diasActividad", label: "Actividad física (días/sem)", emoji: "🏃", orden: ACTIVIDAD },
  { key: "celularAntesDormir", label: "Celular antes de dormir", emoji: "🌙", orden: CELULAR },
];

// Percentil con interpolación lineal (el mismo método que usan Excel y Sheets: INC).
export function percentil(ordenados, p) {
  const pos = (ordenados.length - 1) * p;
  const i = Math.floor(pos);
  const f = pos - i;
  return ordenados[i] + (ordenados[Math.min(i + 1, ordenados.length - 1)] - ordenados[i]) * f;
}

// Medidas de posición y dispersión. Devuelve null si hay menos de `min` datos.
export function resumenNumerico(valores, min = MIN_GRUPO) {
  const v = valores.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  const n = v.length;
  if (n < min) return null;
  const media = v.reduce((a, b) => a + b, 0) / n;
  const q1 = percentil(v, 0.25);
  const mediana = percentil(v, 0.5);
  const q3 = percentil(v, 0.75);
  const frec = new Map();
  for (const x of v) frec.set(x, (frec.get(x) ?? 0) + 1);
  const maxFrec = Math.max(...frec.values());
  const modas = maxFrec === 1 ? [] : [...frec].filter(([, c]) => c === maxFrec).map(([x]) => x);
  const varianza = n > 1 ? v.reduce((a, x) => a + (x - media) ** 2, 0) / (n - 1) : 0; // muestral (n − 1)
  const desvio = Math.sqrt(varianza);
  const ric = q3 - q1;
  // Regla de Tukey: es atípico lo que queda fuera de [Q1 − 1,5·RIC ; Q3 + 1,5·RIC].
  const limInf = q1 - 1.5 * ric;
  const limSup = q3 + 1.5 * ric;
  const atipicosBajos = v.filter((x) => x < limInf).length;
  const atipicosAltos = v.filter((x) => x > limSup).length;
  const atipicos = atipicosBajos + atipicosAltos;
  return {
    n, media, mediana, modas, min: v[0], max: v[n - 1], q1, q3,
    rango: v[n - 1] - v[0], ric, varianza, desvio,
    cv: media !== 0 ? (desvio / Math.abs(media)) * 100 : null, atipicos, atipicosBajos, atipicosAltos, limInf, limSup, valores: v,
  };
}

// Histograma: cuenta cuántos valores caen en cada intervalo [a, a+paso).
export function histograma(valores, paso) {
  if (!valores.length) return [];
  const ini = Math.floor(Math.min(...valores) / paso) * paso;
  const fin = Math.floor(Math.max(...valores) / paso) * paso;
  const cajas = [];
  for (let a = ini; a <= fin; a += paso) cajas.push({ desde: a, hasta: a + paso, n: 0 });
  for (const x of valores) cajas[Math.floor((x - ini) / paso)].n++;
  return cajas;
}

// Frecuencia de cada valor exacto de una variable numérica (cuántas personas respondieron cada número).
// Sale solo de las respuestas publicables, igual que los histogramas.
export function frecuenciaPorValor(valores) {
  const c = new Map();
  for (const x of valores) if (Number.isFinite(x)) c.set(x, (c.get(x) ?? 0) + 1);
  const total = [...c.values()].reduce((a, b) => a + b, 0);
  let acum = 0;
  return [...c]
    .sort((a, b) => a[0] - b[0])
    .map(([valor, n]) => {
      acum += n;
      return { valor, n, pct: total ? (n / total) * 100 : 0, acumPct: total ? (acum / total) * 100 : 0 };
    });
}

// Frecuencias de una variable por categorías. Las categorías con menos de `min` respuestas
// se agrupan en "Otras respuestas", para no exponer conteos muy chicos.
export function frecuencias(filas, campo, orden, min = MIN_GRUPO) {
  const c = new Map(orden.map((g) => [g, 0]));
  const valor = (r) => (campo === "curso" ? cursoDe(r) : r[campo]);
  for (const r of filas) if (c.has(valor(r))) c.set(valor(r), c.get(valor(r)) + 1);
  const grandes = [...c].filter(([, n]) => n >= min).map(([nombre, n]) => ({ nombre, n }));
  const otras = [...c].filter(([, n]) => n > 0 && n < min).reduce((a, [, n]) => a + n, 0);
  return otras > 0 ? [...grandes, { nombre: "Otras respuestas", n: otras }] : grandes;
}

// Todo lo que usa la pestaña de gráficos y estadística, solo con respuestas publicables.
export function armarEstadistica(rows) {
  const { publicables } = conjuntoPublicable(rows);
  return {
    n: publicables.length,
    numericas: NUMERICAS.map((m) => {
      const r = resumenNumerico(publicables.map((x) => x[m.key]));
      return { ...m, resumen: r, cajas: r ? histograma(r.valores, m.paso) : [], frecs: r ? frecuenciaPorValor(r.valores) : [] };
    }),
    categoricas: CATEGORICAS.map((c) => ({ ...c, datos: frecuencias(publicables, c.key, c.orden) })),
  };
}

// ---- Solapas por curso (1ro A y 1ro B): tablas de frecuencias para calcular a mano ----

// Tabla de frecuencias de una variable numérica: xi, fi, Fi (acumulada), fr (relativa) y xi·fi.
export function tablaFrecuencias(valores) {
  const v = valores.filter((x) => Number.isFinite(x));
  const c = new Map();
  for (const x of v) c.set(x, (c.get(x) ?? 0) + 1);
  const n = v.length;
  let acum = 0;
  const filas = [...c]
    .sort((a, b) => a[0] - b[0])
    .map(([x, fi]) => {
      acum += fi;
      return { x, fi, Fi: acum, fr: n ? fi / n : 0, xfi: x * fi };
    });
  return { n, filas, sumaXfi: v.reduce((a, b) => a + b, 0) };
}

// Frecuencias de una variable por categorías, con el conteo exacto (sin agrupar en "Otras respuestas"),
// porque acá el objetivo es poder rehacer las cuentas a mano.
export function frecuenciasExactas(filas, campo, orden) {
  const c = new Map(orden.map((g) => [g, 0]));
  for (const r of filas) if (c.has(r[campo])) c.set(r[campo], c.get(r[campo]) + 1);
  const total = [...c.values()].reduce((a, b) => a + b, 0);
  let acum = 0;
  return orden.map((nombre) => {
    const fi = c.get(nombre);
    acum += fi;
    return { nombre, fi, Fi: acum, fr: total ? fi / total : 0 };
  });
}

// Variables que se muestran en cada solapa de curso. `ordinal`: tiene un orden natural, así que la acumulada tiene sentido.
export const NUMERICAS_CURSO = [
  ...NUMERICAS,
  { key: "horasLectura", label: "Horas de lectura", unidad: "h/día", emoji: "📖", color: "#10b981" },
];
export const CATEGORICAS_CURSO = [
  { key: "rol", label: "Rol", emoji: "🧑‍🎓", orden: ROLES, ordinal: false },
  { key: "rangoEdad", label: "Rango de edad", emoji: "🎂", orden: EDADES, ordinal: true },
  { key: "alimentacion", label: "Tipo de alimentación", emoji: "🥗", orden: ALIMENTACION, ordinal: false },
  { key: "diasActividad", label: "Actividad física (días/sem)", emoji: "🏃", orden: ACTIVIDAD, ordinal: true },
  { key: "celularAntesDormir", label: "Celular antes de dormir", emoji: "🌙", orden: CELULAR, ordinal: true },
];

// Datos de un solo curso. Parte de las respuestas publicables (mismo filtro de privacidad que el resto del panel).
export function armarCurso(rows, curso) {
  const { publicables } = conjuntoPublicable(rows);
  const filas = publicables.filter((r) => cursoDe(r) === curso);
  return {
    curso,
    n: filas.length,
    numericas: NUMERICAS_CURSO.map((m) => {
      const valores = filas.map((x) => x[m.key]).filter((x) => Number.isFinite(x));
      return { ...m, tabla: tablaFrecuencias(valores), resumen: resumenNumerico(valores) };
    }),
    categoricas: CATEGORICAS_CURSO.map((c) => ({ ...c, datos: frecuenciasExactas(filas, c.key, c.orden) })),
  };
}
