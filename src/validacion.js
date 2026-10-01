// Única fuente de verdad: las mismas listas se usan en el formulario, la validación y firestore.rules.
export const ROLES = ["Alumno", "Profesor", "Preceptor", "Directivo"];
export const EDADES = ["Menos de 12", "12 a 14", "15 a 17", "18 a 25", "26 a 40", "41 a 60", "Más de 60"];
export const ALIMENTACION = ["Omnívora", "Vegetariana", "Vegana", "Otra"];
export const ACTIVIDAD = ["0", "1-2", "3", "4+"];
export const CELULAR = ["Nunca", "Menos de 30 min", "30 a 60 min", "Más de 60 min"];

const enRango = (v, min, max) => Number.isFinite(v) && v >= min && v <= max;

// Devuelve un objeto limpio (solo campos permitidos, con tipos correctos) o null si algo no es válido.
export function limpiarRespuestas(f) {
  const horasSueno = Number(f.horasSueno);
  const vasosAgua = Number(f.vasosAgua);
  const horasPantalla = Number(f.horasPantalla);
  const diasDesayuno = Number(f.diasDesayuno);

  const ok =
    ROLES.includes(f.rol) &&
    EDADES.includes(f.rangoEdad) &&
    ALIMENTACION.includes(f.alimentacion) &&
    ACTIVIDAD.includes(f.diasActividad) &&
    CELULAR.includes(f.celularAntesDormir) &&
    enRango(horasSueno, 0, 12) &&
    Number.isInteger(vasosAgua) && enRango(vasosAgua, 0, 30) &&
    enRango(horasPantalla, 0, 24) &&
    Number.isInteger(diasDesayuno) && enRango(diasDesayuno, 0, 7) &&
    f.vasosAgua !== "" && f.horasPantalla !== "" && f.diasDesayuno !== "";

  if (!ok) return null;
  return {
    rol: f.rol,
    rangoEdad: f.rangoEdad,
    horasSueno,
    vasosAgua,
    alimentacion: f.alimentacion,
    horasPantalla,
    diasActividad: f.diasActividad,
    diasDesayuno,
    celularAntesDormir: f.celularAntesDormir,
  };
}
