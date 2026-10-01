import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Titulo, btnPrimario, btnSecundario, inputCls, tarjeta } from "./ui";

// Conviene fijar VITE_URL_PUBLICA (el enlace corto si lo tenés); si no, se usa el dominio actual.
const URL_INICIAL = import.meta.env.VITE_URL_PUBLICA || `${window.location.origin}/`;
const esUrl = (u) => /^https?:\/\/\S+$/.test(u);

export default function Compartir() {
  const [url, setUrl] = useState(URL_INICIAL);
  const [qr, setQr] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!esUrl(url)) { setQr(""); return; }
    let vigente = true;
    QRCode.toDataURL(url, { width: 640, margin: 2, errorCorrectionLevel: "M" })
      .then((d) => vigente && setQr(d))
      .catch(() => vigente && setQr(""));
    return () => { vigente = false; };
  }, [url]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch { /* el navegador no permitió copiar */ }
  };

  return (
    <section className={tarjeta}>
      <Titulo emoji="🔗">Compartir la encuesta</Titulo>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex-1 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-800">Enlace de la encuesta</span>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value.trim())} className={inputCls} />
          </label>
          {!esUrl(url) && <p role="alert" className="text-sm text-red-700">Ingresá un enlace que empiece con https://</p>}
          <button type="button" onClick={copiar} disabled={!esUrl(url)} className={btnSecundario}>
            {copiado ? "¡Copiado!" : "Copiar enlace"}
          </button>
        </div>
        {qr && (
          <div className="flex flex-col items-center gap-3">
            <img src={qr} alt={`Código QR que abre ${url}`} className="h-44 w-44 rounded-2xl bg-white p-2 ring-1 ring-slate-200" />
            <a href={qr} download="qr-encuesta.png" className={`${btnPrimario} inline-block`}>
              Descargar QR (PNG)
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
