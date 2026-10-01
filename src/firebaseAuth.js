import { getAuth, initializeAuth, browserSessionPersistence } from "firebase/auth";
import { app } from "./firebaseConfig";

// Solo lo importa el panel (carga diferida), así el código de Auth no viaja en la encuesta de los alumnos.
// La sesión dura hasta cerrar la pestaña (no queda abierta en computadoras compartidas del instituto).
// Sin popup/redirect: evita cargar scripts de Google y mantiene cerrada la política de seguridad (CSP).
let auth;
try {
  auth = initializeAuth(app, { persistence: browserSessionPersistence });
} catch {
  auth = getAuth(app); // recarga en caliente en desarrollo: ya estaba inicializada
}
export { auth };
