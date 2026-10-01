import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { auth } from "../firebaseAuth";
import { db } from "../firebaseConfig";
import PanelResultados from "./PanelResultados";
import Compartir from "./Compartir";
import BorrarDatos from "./BorrarDatos";
import { explicarErrorFirebase } from "../diagnostico";

import { Manchas, btnPrimario, btnSecundario, inputCls, tarjeta } from "./ui";

const ERRORES_LOGIN = {
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/invalid-email": "El correo no es válido.",
  "auth/too-many-requests": "Demasiados intentos. Esperá unos minutos y volvé a probar.",
  "auth/network-request-failed": "No hay conexión. Revisala y volvé a intentar.",
};

function Login() {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setError("");
    setEnviando(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), clave);
    } catch (err) {
      setError(ERRORES_LOGIN[err.code] ?? "No se pudo iniciar sesión.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={entrar} className={`${tarjeta} mx-auto max-w-sm space-y-4 p-6`}>
      <div className="text-center">
        <p aria-hidden="true" className="text-4xl">🔐</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">Ingreso docente</h2>
        <p className="mt-1 text-sm text-slate-500">Entrá para ver los resultados de la encuesta.</p>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-800">Correo</span>
        <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-800">Contraseña</span>
        <input type="password" autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} className={inputCls} />
      </label>
      {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-700 ring-1 ring-red-100">{error}</p>}
      <button type="submit" disabled={enviando} className={`${btnPrimario} w-full py-3.5 text-base`}>
        {enviando ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}

export default function Panel() {
  const [user, setUser] = useState(undefined); // undefined: comprobando sesión, null: sin sesión
  const [estado, setEstado] = useState("cargando"); // cargando | sinPermiso | listo | error
  const [filas, setFilas] = useState([]);
  const [refs, setRefs] = useState([]); // referencias de los documentos, para poder borrarlos
  const [fallo, setFallo] = useState(null); // { paso, codigo, pista } cuando falla la carga

  useEffect(() => {
    document.title = "Panel de resultados";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    const off = onAuthStateChanged(auth, setUser);
    return () => { off(); meta.remove(); };
  }, []);

  // silencioso: vuelve a leer sin tapar la pantalla con "Cargando" (se usa después de borrar)
  const cargar = useCallback(async (u, silencioso = false) => {
    if (!silencioso) setEstado("cargando");
    setFallo(null);
    let paso = "comprobar permiso de docente";
    try {
      // Las reglas solo dejan leer las respuestas a quienes tienen un documento en /docentes/{uid}.
      const perfil = await getDoc(doc(db, "docentes", u.uid));
      if (!perfil.exists()) return setEstado("sinPermiso");
      paso = "leer las respuestas";
      const snap = await getDocs(collection(db, "encuestas_habitos"));
      setFilas(snap.docs.map((d) => d.data()));
      setRefs(snap.docs.map((d) => d.ref));
      setEstado("listo");
    } catch (err) {
      console.error(`Panel: falló al ${paso}`, err);
      setFallo({ paso, ...explicarErrorFirebase(err) });
      setEstado("error");
    }
  }, []);

  useEffect(() => { if (user) cargar(user); }, [user, cargar]);

  let contenido;
  if (user === undefined) contenido = <p className="text-center text-slate-600">Cargando…</p>;
  else if (user === null) contenido = <Login />;
  else if (estado === "cargando") contenido = <p role="status" className="text-center text-slate-600">Cargando resultados…</p>;
  else if (estado === "sinPermiso")
    contenido = (
      <p role="alert" className={`${tarjeta} p-6 text-slate-800`}>
        Tu cuenta ({user.email}) no tiene permiso para ver los resultados. Pedile a quien administra la encuesta que te autorice.
      </p>
    );
  else if (estado === "error")
    contenido = (
      <div role="alert" className={`${tarjeta} space-y-2 p-6 text-slate-800`}>
        <p>No se pudieron cargar los datos.</p>
        {fallo && (
          <>
            <p className="text-sm">
              Falló al {fallo.paso}. Código: <code className="rounded bg-slate-100 px-1.5 py-0.5">{fallo.codigo}</code>
            </p>
            <p className="text-sm text-slate-600">{fallo.pista}</p>
          </>
        )}
        <p className="text-sm text-slate-600">Cuando lo corrijas, tocá “Actualizar”.</p>
      </div>
    );
  else
    contenido = (
      <div className="space-y-6">
        <PanelResultados filas={filas} />
        <Compartir />
        <BorrarDatos refs={refs} onTerminado={() => cargar(user, true)} />
      </div>
    );

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-emerald-50 px-4 py-8">
      <Manchas />
      <div className="relative mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm ring-1 ring-indigo-100">
              <span aria-hidden="true">🏫</span>Panel docente
            </p>
            <h1 className="mt-3 bg-gradient-to-r from-indigo-700 to-violet-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Resultados de la encuesta
            </h1>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => cargar(user)} className={btnSecundario}>Actualizar</button>
              <button type="button" onClick={() => signOut(auth)} className={btnSecundario}>Salir</button>
            </div>
          )}
        </header>
        {contenido}
      </div>
    </main>
  );
}
