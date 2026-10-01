import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getFirestore } from "firebase/firestore";

// Las credenciales salen de variables de entorno (.env), no del código.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

// App Check: solo tu sitio (validado con reCAPTCHA Enterprise) puede usar Firestore.
// El proveedor debe coincidir con el registrado en la consola (App Check > Aplicaciones):
// si la app está registrada con reCAPTCHA Enterprise ("Fraud Defense"), se usa este; con reCAPTCHA v3 clásico, ReCaptchaV3Provider.
const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
if (siteKey) {
  if (import.meta.env.DEV) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true; // token de depuración local
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export const db = getFirestore(app);
