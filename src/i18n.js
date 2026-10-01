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
    institucion: "Instituto Alfonsina Storni",
    titulo: "Contanos cómo cuidás tu salud",
    subtitulo: "Son 2 minutos y es anónima: no guardamos tu nombre ni tus datos personales.",
    idioma: "Idioma",
    avisoTitulo: "Antes de empezar",
    aviso: [
      "Es anónima y voluntaria: no pedimos nombre, DNI, correo ni ningún dato que te identifique.",
      "Usamos las respuestas solo para conocer los hábitos de salud de la comunidad del instituto. Los resultados se muestran en conjunto (promedios por rol y por edad) y no se muestran grupos de menos de 5 respuestas.",
      "Las respuestas se guardan en servidores de Google (Firebase). Como son anónimas, una vez enviadas no se pueden borrar ni modificar.",
      "Si sos menor de edad, hablá con tu familia o con un adulto responsable antes de participar.",
    ],
    consiento: "Leí este aviso y quiero participar.",
    rol: "¿Cuál es tu rol?",
    edad: "¿En qué rango de edad estás?",
    sueno: "¿Cuántas horas dormís, en promedio?",
    agua: "¿Cuántos vasos de agua tomás por día?",
    alim: "¿Cómo es tu alimentación?",
    pantalla: "¿Cuántas horas por día usás pantallas para entretenerte?",
    actividad: "¿Cuántos días por semana hacés gimnasio o actividad física?",
    desayuno: "¿Cuántos días por semana desayunás?",
    progreso: (n, total) => `${n} de ${total} respondidas`,
    uVasos: "vasos",
    uHoras: "horas",
    celular: "¿Cuánto usás el celular en la cama antes de dormir?",
    elegir: "Elegí una opción",
    phAgua: "Ej: 6",
    phPantalla: "Ej: 3",
    phDesayuno: "Ej: 5",
    enviar: "Enviar respuestas",
    enviando: "Enviando…",
    gracias: "¡Gracias por participar!",
    graciasTxt: "Tu respuesta ya fue registrada. Solo se puede responder una vez desde este dispositivo.",
    errConsent: "Para participar tenés que leer el aviso y marcar la casilla.",
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
    institucion: "Instituto Alfonsina Storni",
    titulo: "Tell us how you look after your health",
    subtitulo: "It takes 2 minutes and it is anonymous: we do not store your name or any personal data.",
    idioma: "Language",
    avisoTitulo: "Before you start",
    aviso: [
      "It is anonymous and voluntary: we do not ask for your name, ID number, email or anything that identifies you.",
      "We use the answers only to learn about the health habits of the school community. Results are shown as a whole (averages by role and by age) and groups with fewer than 5 answers are never shown.",
      "Answers are stored on Google servers (Firebase). Because they are anonymous, they cannot be deleted or edited once submitted.",
      "If you are under 18, talk to your family or a responsible adult before taking part.",
    ],
    consiento: "I have read this notice and I want to take part.",
    rol: "What is your role?",
    edad: "What is your age range?",
    sueno: "How many hours do you sleep, on average?",
    agua: "How many glasses of water do you drink per day?",
    alim: "What is your diet like?",
    pantalla: "How many hours a day do you spend on screens for fun?",
    actividad: "How many days a week do you go to the gym or do physical activity?",
    desayuno: "How many days a week do you have breakfast?",
    progreso: (n, total) => `${n} of ${total} answered`,
    uVasos: "glasses",
    uHoras: "hours",
    celular: "How long do you use your phone in bed before sleeping?",
    elegir: "Choose an option",
    phAgua: "E.g. 6",
    phPantalla: "E.g. 3",
    phDesayuno: "E.g. 5",
    enviar: "Submit answers",
    enviando: "Submitting…",
    gracias: "Thank you for taking part!",
    graciasTxt: "Your answer has already been recorded. You can only answer once from this device.",
    errConsent: "To take part you must read the notice and tick the box.",
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
      Nunca: "Never", "Menos de 30 min": "Under 30 min", "30 a 60 min": "30 to 60 min", "Más de 60 min": "Over 60 min",
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
