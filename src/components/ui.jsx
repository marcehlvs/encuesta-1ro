// Componentes y estilos compartidos (encuesta y panel). Los colores salen de los tokens de src/index.css.
export const tarjeta = "rounded-3xl bg-surface p-5 shadow-card ring-1 ring-line";
export const btnPrimario =
  "rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md " +
  "transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";
export const btnSecundario =
  "rounded-2xl bg-surface px-4 py-2.5 text-sm font-semibold text-fg-soft shadow-sm ring-1 ring-line " +
  "transition hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50";
export const btnPeligro =
  "rounded-2xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-md " +
  "transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50";
export const inputCls =
  "w-full rounded-2xl border-2 border-line bg-surface-2 px-4 py-3 text-base text-fg transition " +
  "placeholder:text-muted focus:border-brand focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand-line";

export function Titulo({ emoji, children }) {
  return (
    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-fg">
      <span aria-hidden="true">{emoji}</span>{children}
    </h3>
  );
}

const TONOS_AVISO = {
  ok: "bg-ok-soft text-ok ring-ok-line",
  error: "bg-danger-soft text-danger ring-danger-line",
  warn: "bg-warn-soft text-warn ring-warn-line",
  info: "bg-info-soft text-info ring-info-line",
  brand: "bg-brand-soft text-brand-text ring-brand-line",
};

// Aviso en línea con el mismo aspecto en todo el sitio. "error" se anuncia de inmediato; el resto, con cortesía.
export function Aviso({ tono = "info", icono, children, className = "" }) {
  return (
    <div role={tono === "error" ? "alert" : "status"}
      className={`rounded-2xl px-4 py-2.5 text-sm ring-1 ${TONOS_AVISO[tono]} ${className}`}>
      {icono && <span aria-hidden="true">{icono} </span>}{children}
    </div>
  );
}

// Estado de carga: indicador + texto (el texto es lo que anuncia el lector de pantalla).
export function Cargando({ texto = "Cargando…" }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-10 text-fg-soft">
      <span aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-brand" />
      <span className="text-sm font-medium">{texto}</span>
    </div>
  );
}

// Manchas de color de fondo (decorativas)
export function Manchas() {
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
    </>
  );
}
