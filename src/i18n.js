// Los valores guardados en Firestore siempre son los canónicos en español (las reglas los validan).
// Aquí solo se traducen las etiquetas que ve la persona.
const IDIOMA_KEY = "encuesta_idioma";

export const IDIOMAS = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
];

export const TEXTOS = {
  es: {
    tituloPagina: "Encuesta de hábitos de salud",
    titulo: "Encuesta de hábitos de salud",
    subtitulo: "Instituto Alfonsina Storni. Es anónima: no guardamos tu nombre ni tus datos personales.",
    idioma: "Idioma",
    rol: "Rol",
    edad: "Rango de edad",
    sueno: (h) => `Horas de sueño promedio: ${h} h`,
    agua: "Vasos de agua por día",
    alim: "Tipo de alimentación",
    pantalla: "Horas de pantalla recreativa al día",
    actividad: "Días de gimnasio o actividad física por semana",
    elegir: "Elegí una opción",
    phAgua: "Ej: 6",
    phPantalla: "Ej: 3",
    enviar: "Enviar respuestas",
    enviando: "Enviando…",
    gracias: "¡Gracias por participar!",
    graciasTxt: "Tu respuesta ya fue registrada. Solo se puede responder una vez desde este dispositivo.",
    errCampos: "Completá todos los campos con valores válidos.",
    errBot: "Revisá las respuestas y volvé a intentar en unos segundos.",
    errEspera: "Esperá unos segundos antes de volver a intentar.",
    errEnvio: "No se pudo enviar. Revisá tu conexión y volvé a intentar.",
    opciones: {
      "Menos de 12": "Menos de 12", "12 a 14": "12 a 14", "15 a 17": "15 a 17", "18 a 25": "18 a 25",
      "26 a 40": "26 a 40", "41 a 60": "41 a 60", "Más de 60": "Más de 60",
      "0": "0 días", "1-2": "1 a 2 días", "3": "3 días (ej. Lunes, Miércoles y Viernes)", "4+": "4 o más días",
    },
  },
  en: {
    tituloPagina: "Health habits survey",
    titulo: "Health habits survey",
    subtitulo: "Instituto Alfonsina Storni. It is anonymous: we do not store your name or any personal data.",
    idioma: "Language",
    rol: "Role",
    edad: "Age range",
    sueno: (h) => `Average hours of sleep: ${h} h`,
    agua: "Glasses of water per day",
    alim: "Type of diet",
    pantalla: "Hours of recreational screen time per day",
    actividad: "Days of gym or physical activity per week",
    elegir: "Choose an option",
    phAgua: "E.g. 6",
    phPantalla: "E.g. 3",
    enviar: "Submit answers",
    enviando: "Submitting…",
    gracias: "Thank you for taking part!",
    graciasTxt: "Your answer has already been recorded. You can only answer once from this device.",
    errCampos: "Fill in every field with valid values.",
    errBot: "Check your answers and try again in a few seconds.",
    errEspera: "Wait a few seconds before trying again.",
    errEnvio: "Could not submit. Check your connection and try again.",
    opciones: {
      Alumno: "Student", Profesor: "Teacher", Preceptor: "Preceptor (student supervisor)", Directivo: "School administrator",
      "Menos de 12": "Under 12", "12 a 14": "12 to 14", "15 a 17": "15 to 17", "18 a 25": "18 to 25",
      "26 a 40": "26 to 40", "41 a 60": "41 to 60", "Más de 60": "Over 60",
      "Omnívora": "Omnivore", Vegetariana: "Vegetarian", Vegana: "Vegan", Otra: "Other",
      "0": "0 days", "1-2": "1 to 2 days", "3": "3 days (e.g. Monday, Wednesday and Friday)", "4+": "4 or more days",
    },
  },
};

export function idiomaInicial() {
  try {
    const guardado = localStorage.getItem(IDIOMA_KEY);
    if (TEXTOS[guardado]) return guardado;
  } catch { /* sin almacenamiento */ }
  return navigator.language?.toLowerCase().startsWith("en") ? "en" : "es";
}

export function guardarIdioma(code) {
  try { localStorage.setItem(IDIOMA_KEY, code); } catch { /* sin almacenamiento */ }
}
