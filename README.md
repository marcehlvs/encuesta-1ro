# Encuesta de hábitos de salud

1. `npm install`
2. Copiá `.env.example` a `.env` y completá las credenciales de Firebase.
3. `npm run dev`

La encuesta está en `/` y el panel docente en `/panel`.

## Seguridad: pasos en la consola de Firebase
- **Firestore**: creá la base y publicá `firestore.rules` (pegándolo en Firestore > Reglas, o con `firebase deploy --only firestore:rules`). Si el proyecto lo comparten otras apps, combiná las reglas a mano: una base de datos tiene un solo conjunto de reglas.
- **App Check**: el código usa **reCAPTCHA Enterprise** (`ReCaptchaEnterpriseProvider` en `src/firebaseConfig.js`). Registrá la app web en App Check con una clave de reCAPTCHA Enterprise de tipo web y por puntuación, con los dominios del sitio, y pegá la clave de sitio en `VITE_RECAPTCHA_SITE_KEY`. Si registrás la app con reCAPTCHA v3 clásico, cambiá el proveedor a `ReCaptchaV3Provider`. Activá "Exigir" para Cloud Firestore solo después de ver solicitudes **verificadas** en las métricas.
- **Clave de API**: en Google Cloud > Credenciales, restringila por referente HTTP a tu dominio.
- **Hosting**: `npm run build && firebase deploy --only hosting` aplica los encabezados de seguridad de `firebase.json` (incluida la política CSP, que ya permite App Check y el login).
- Con App Check activo, en desarrollo aparece un token de depuración en la consola del navegador: registralo en App Check > Aplicaciones > Tokens de depuración.

## Panel de resultados (`/panel`)
Muestra promedios de sueño, agua, pantalla, actividad, desayuno y uso del celular antes de dormir por rol y por rango de edad, con gráficos y descarga de planilla (CSV para Excel/Sheets).

**Alta de docentes (una vez por persona):**
1. Authentication > Método de acceso: activá **Correo electrónico/contraseña**.
2. Authentication > Usuarios: agregá el correo y una contraseña a cada docente y copiá su **UID**.
3. Firestore > colección `docentes` (raíz de la base): creá un documento cuyo **ID sea ese UID** (con un campo cualquiera, por ejemplo `nombre`).

Quien no tenga su documento en `docentes` no puede leer respuestas, aunque logre crear una cuenta. Para dar de baja a alguien, borrá su documento en `docentes`.

**Privacidad:** no se muestran ni se exportan los roles ni las edades con menos de 5 respuestas (`MIN_GRUPO` en `src/agregacion.js`), y esas respuestas tampoco entran en los totales. La planilla solo contiene datos agregados. Este filtro se aplica en el navegador del docente: protege lo que se ve y se descarga, pero quien tenga acceso a la consola de Firebase sigue viendo las respuestas individuales.

**Borrar datos:** la tarjeta roja del final del panel elimina todas las respuestas, previa confirmación escribiendo `BORRAR`. No se puede deshacer, y cualquier persona de `docentes` puede hacerlo. Requiere que `firestore.rules` tenga `allow delete: if esDocente()`.

## Compartir: enlace corto y QR
- Un enlace corto gratis: creá un sitio de Hosting con nombre corto (`firebase hosting:sites:create encuesta-storni`, queda en `https://encuesta-storni.web.app`) y desplegá ahí.
- Poné ese enlace en `VITE_URL_PUBLICA` (en `.env`, antes de compilar). El panel genera el QR y permite descargarlo en PNG.

## Cambiar o agregar preguntas
Cada pregunta vive en cinco archivos. Según lo que quieras hacer:

| Quiero… | Archivos |
|---|---|
| Cambiar el **texto** de una pregunta o de una opción | `src/i18n.js` (español e inglés). Los valores guardados no cambian. |
| Cambiar las **opciones** de una pregunta (roles, edades, tipos de alimentación, etc.) | `src/validacion.js` (la lista), `firestore.rules` (el mismo `in [...]`) y `src/i18n.js` (traducción). Publicá las reglas. |
| **Agregar** una pregunta nueva | Los cinco pasos de abajo. |
| **Quitar** una pregunta | Sacala de `EncuestaForm.jsx` y de `validacion.js`. Dejala en `firestore.rules` como opcional hasta que ya no queden pestañas abiertas con la versión vieja. |

**Agregar una pregunta nueva** (ejemplo: `diasDesayuno`, que ya está hecha, sirve de modelo):
1. `src/validacion.js`: agregá la lista de opciones (si es de opciones) y el campo en `limpiarRespuestas` con su validación.
2. `src/components/EncuestaForm.jsx`: agregá el campo en `INICIAL` y en `REQUERIDOS`, y un bloque `<Pregunta>` con `<Opciones>` (botones) o `<Numero>`.
3. `src/i18n.js`: el texto de la pregunta y de sus opciones, en `es` y en `en`.
4. `firestore.rules`: sumá el campo a la lista `hasOnly([...])` del `create` y su validación. Si no lo hacés, Firestore rechaza todas las respuestas. Hacelo opcional (`!('campo' in request.resource.data) || ...`) para no perder respuestas de pestañas con la versión anterior.
5. Para verla en el panel y en el CSV: `src/agregacion.js` (una entrada en `METRICAS`) y `src/components/PanelResultados.jsx` (emoji y color en `ADORNO`).

**Orden de publicación:** primero las reglas (Firestore > Reglas > Publicar) y después `npm run build && firebase deploy --only hosting`.

**Ojo con las opciones ya usadas:** si cambiás o quitás un valor de `ROLES` o `EDADES` (por ejemplo, "12 a 14" por "12 a 13"), las respuestas viejas con el valor anterior dejan de aparecer en el panel y cuentan como excluidas. Mejor agregar opciones nuevas que renombrar las existentes, o borrar los datos antes de cambiarlas.

## Aviso a la dirección
Hay un borrador en `docs/nota-direccion.md`.

## Diagnóstico de errores
Si algo falla, el panel muestra el paso y el código de Firebase. La encuesta muestra el motivo técnico si se abre con `?debug` al final de la dirección (por ejemplo `https://tu-sitio.web.app/?debug`). El error completo también queda en la consola del navegador.
