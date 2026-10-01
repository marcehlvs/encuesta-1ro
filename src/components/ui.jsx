// Estilos compartidos del panel docente (misma identidad visual que la encuesta).
export const tarjeta = "rounded-3xl bg-white p-5 shadow-lg shadow-indigo-100/60 ring-1 ring-slate-100";
export const btnPrimario =
  "rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md " +
  "shadow-indigo-300/40 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";
export const btnSecundario =
  "rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 " +
  "transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50";
export const btnPeligro =
  "rounded-2xl bg-red-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-red-200 " +
  "transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50";
export const inputCls =
  "w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 transition " +
  "placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100";

export function Titulo({ emoji, children }) {
  return (
    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
      <span aria-hidden="true">{emoji}</span>{children}
    </h3>
  );
}

// Manchas de color de fondo (decorativas)
export function Manchas() {
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />
    </>
  );
}
