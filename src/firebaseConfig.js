import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
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

const app = initializeApp(firebaseConfig);

// App Check: solo tu sitio (validado con reCAPTCHA) puede escribir en Firestore.
const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
if (siteKey) {
  if (import.meta.env.DEV) self.FIREBASE_APPCHECK_DEBUG_TOKEN = true; // token de depuración local
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export const db = getFirestore(app);
