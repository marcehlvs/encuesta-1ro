import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// El panel se carga solo en /panel: el código de login, gráficos y QR no viaja en la encuesta.
const Panel = lazy(() => import("./components/Panel.jsx"));
const esPanel = window.location.pathname.replace(/\/+$/, "") === "/panel";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {esPanel ? (
      <Suspense fallback={null}>
        <Panel />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>
);
