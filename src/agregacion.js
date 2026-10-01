import { ROLES, EDADES } from "./validacion.js";

// Un grupo con menos respuestas que esto no se muestra ni se exporta (así nadie es identificable).
export const MIN_GRUPO = 5;

const ACTIVIDAD_MEDIA = new Map([["0", 0], ["1-2", 1.5], ["3", 3], ["4+", 4]]); // aproximación: punto medio del rango
const CELULAR_30 = new Map([["Nunca", 0], ["Menos de 30 min", 0], ["30 a 60 min", 1], ["Más de 60 min", 1]]);
const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);

// `valor` devuelve el número de una respuesta, o undefined si esa respuesta no tiene el dato
// (las respuestas anteriores a las preguntas nuevas no tienen desayuno ni celular).
export const METRICAS = [
  { key: "horasSueno", label: "Sueño (h/día)", valor: (r) => num(r.horasSueno) },
  { key: "vasosAgua", label: "Agua (vasos/día)", valor: (r) => num(r.vasosAgua) },
  { key: "horasPantalla", label: "Pantalla recreativa (h/día)", valor: (r) => num(r.horasPantalla) },
  { key: "diasActividad", label: "Actividad física (días/sem, aprox.)", valor: (r) => ACTIVIDAD_MEDIA.get(r.diasActividad) },
  { key: "diasDesayuno", label: "Desayuno (días/sem)", valor: (r) => num(r.diasDesayuno) },
  { key: "celular30", label: "Celular 30 min o más antes de dormir (%)", pct: true, valor: (r) => CELULAR_30.get(r.celularAntesDormir) },
];

// Promedio (o porcentaje) de una métrica; null si hay menos de `min` datos.
export function media(filas, metrica, min = MIN_GRUPO) {
  const v = filas.map(metrica.valor).filter((x) => x !== undefined);
  if (v.length < min) return null;
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  return metrica.pct ? m * 100 : m;
}

const contar = (filas, campo) => {
  const c = new Map();
  for (const r of filas) c.set(r[campo], (c.get(r[campo]) ?? 0) + 1);
  return c;
};

// Quita las respuestas de roles o edades con menos de `min` respuestas y repite hasta que todos los grupos
// que quedan tengan `min` o más. Así el total es siempre la suma de los grupos mostrados y nadie puede
// deducir a un grupo chico restando (total - grupos visibles).
export function conjuntoPublicable(rows, min = MIN_GRUPO) {
  let actual = rows.filter((r) => ROLES.includes(r.rol) && EDADES.includes(r.rangoEdad));
  for (;;) {
    const cRol = contar(actual, "rol");
    const cEdad = contar(actual, "rangoEdad");
    const siguiente = actual.filter((r) => cRol.get(r.rol) >= min && cEdad.get(r.rangoEdad) >= min);
    if (siguiente.length === actual.length) return { publicables: siguiente, excluidas: rows.length - siguiente.length };
    actual = siguiente;
  }
}

export function armarTablas(rows, min = MIN_GRUPO) {
  const { publicables, excluidas } = conjuntoPublicable(rows, min);
  const resumen = (filas) => ({
    n: filas.length,
    medias: Object.fromEntries(METRICAS.map((m) => [m.key, media(filas, m, min)])),
  });
  const dimension = (campo, orden) => {
    const filas = orden
      .map((grupo) => ({ grupo, ...resumen(publicables.filter((r) => r[campo] === grupo)) }))
      .filter((g) => g.n > 0);
    // Grupos que respondieron pero no se muestran: se avisa cuáles, nunca cuántas respuestas tienen.
    const ocultos = orden.filter((g) => rows.some((r) => r[campo] === g) && !filas.some((f) => f.grupo === g));
    return { filas, ocultos };
  };
  return {
    recibidas: rows.length,
    incluidas: publicables.length,
    excluidas,
    total: resumen(publicables),
    roles: dimension("rol", ROLES),
    edades: dimension("rangoEdad", EDADES),
  };
}

// CSV para Excel/Sheets en configuración regional argentina: separador ";", coma decimal, BOM UTF-8.
// Solo exporta lo agregado y ya filtrado por privacidad, nunca respuestas individuales.
const celda = (v) => {
  const s = String(v ?? "");
  return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const numCsv = (v, m) => (v === null ? "" : v.toFixed(m.pct ? 0 : 1).replace(".", ","));

export function aCsv(t) {
  const cabecera = ["Tipo", "Grupo", "Respuestas", ...METRICAS.map((m) => m.label)];
  const fila = (tipo, grupo, r) => [tipo, grupo, r.n, ...METRICAS.map((m) => numCsv(r.medias[m.key], m))];
  const filas = [
    fila("Total", "Todos los grupos incluidos", t.total),
    ...t.roles.filas.map((g) => fila("Rol", g.grupo, g)),
    ...t.edades.filas.map((g) => fila("Edad", g.grupo, g)),
  ];
  return "\uFEFF" + [cabecera, ...filas].map((f) => f.map(celda).join(";")).join("\r\n");
}
