// Traduce un error de Firebase a un código corto y una pista de qué revisar.
// Es solo para quien administra la encuesta: no incluye datos de ninguna respuesta.
const PISTAS = {
  "permission-denied":
    "Firestore rechazó la operación. Revisá: (1) que las reglas nuevas estén publicadas, (2) que exista el documento docentes/<tu UID> (solo para el panel) y (3) que App Check no esté exigiendo un token que este dominio no puede generar.",
  unauthenticated: "Falta iniciar sesión o la sesión venció. Salí y volvé a ingresar.",
  unavailable:
    "No se pudo contactar a Firestore. Puede ser falta de conexión, una extensión del navegador que bloquea Google, o la política de seguridad (CSP) del hosting desactualizada.",
  "failed-precondition": "Firestore no pudo completar la operación (por ejemplo, la base de datos todavía no está creada).",
  "resource-exhausted": "Se superó una cuota de Firebase. Revisá el uso en la consola.",
};

export function explicarErrorFirebase(err) {
  const codigo = String(err?.code ?? err?.name ?? "desconocido").replace(/^firestore\//, "");
  let pista = PISTAS[codigo];
  if (!pista && codigo.startsWith("appCheck/")) {
    pista = "App Check no pudo obtener un token: revisá la clave de reCAPTCHA v3, que el dominio esté permitido y, en desarrollo, el token de depuración.";
  }
  return { codigo, pista: pista ?? "Error no reconocido. Abrí la consola del navegador (F12) para ver el detalle." };
}
