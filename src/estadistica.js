import { MIN_GRUPO, conjuntoPublicable } from "./agregacion.js";
import { ALIMENTACION, ACTIVIDAD, CELULAR, ROLES, EDADES } from "./validacion.js";

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
  const atipicos = v.filter((x) => x < q1 - 1.5 * ric || x > q3 + 1.5 * ric).length;
  return {
    n, media, mediana, modas, min: v[0], max: v[n - 1], q1, q3,
    rango: v[n - 1] - v[0], ric, varianza, desvio,
    cv: media !== 0 ? (desvio / Math.abs(media)) * 100 : null, atipicos, valores: v,
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

// Frecuencias de una variable por categorías. Las categorías con menos de `min` respuestas
// se agrupan en "Otras respuestas", para no exponer conteos muy chicos.
export function frecuencias(filas, campo, orden, min = MIN_GRUPO) {
  const c = new Map(orden.map((g) => [g, 0]));
  for (const r of filas) if (c.has(r[campo])) c.set(r[campo], c.get(r[campo]) + 1);
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
      return { ...m, resumen: r, cajas: r ? histograma(r.valores, m.paso) : [] };
    }),
    categoricas: CATEGORICAS.map((c) => ({ ...c, datos: frecuencias(publicables, c.key, c.orden) })),
  };
}
