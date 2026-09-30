# Encuesta de hábitos de salud

1. `npm install`
2. Copiá `.env.example` a `.env` y completá las credenciales de Firebase.
3. `npm run dev`

## Seguridad: pasos en la consola de Firebase
- **Firestore**: creá la base y publicá `firestore.rules` (`firebase deploy --only firestore:rules`).
- **App Check**: registrá la app web con reCAPTCHA v3, pegá la clave de sitio en `VITE_RECAPTCHA_SITE_KEY` y activá "Enforce" para Cloud Firestore.
- **Clave de API**: en Google Cloud > Credenciales, restringila por referente HTTP a tu dominio.
- **Hosting**: `npm run build && firebase deploy --only hosting` aplica los encabezados de seguridad de `firebase.json`.
- Con App Check activo, en desarrollo aparece un token de depuración en la consola del navegador: registralo en App Check > Aplicaciones > Tokens de depuración.
