"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { checkGeofence } from "./lib/geofence";

const G = {
  btn:  'linear-gradient(135deg, #1e5799 0%, #2989d8 100%)',
  hero: 'linear-gradient(160deg, #060F22 0%, #0B1F3E 55%, #102A54 100%)',
} as const;

const MOCK_USER = { name: "Colaborar", siteId: "site_01" };
const MOCK_SITE = {
  name: "GO",
  lat: -33.4372, lng: -70.6366, radiusMeters: 500,
  shift: { start: "08:00", end: "17:30", breakMinutes: 60 },
};
const MOCK_USER_LOCATION = { lat: -33.4370, lng: -70.6364 };

type PunchType = "entrada" | "salida" | "salida_colacion" | "entrada_colacion";
type Tab       = "asistencia" | "historial" | "mas";
type CamStep   = "preview" | "captured" | "uploading";

interface Punch { type: PunchType; time: string }

const PUNCH_SEQ: PunchType[] = ["entrada", "salida_colacion", "entrada_colacion", "salida"];

const PUNCH_META: Record<PunchType, { label: string; short: string; step: number }> = {
  entrada:         { label: "Entrada",           short: "Entrada",       step: 1 },
  salida_colacion: { label: "Salida a colación",  short: "Sal. Colación", step: 2 },
  entrada_colacion:{ label: "Regreso de colación",short: "Ent. Colación", step: 3 },
  salida:          { label: "Salida",             short: "Salida",        step: 4 },
};

function useRealTimeClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const pad     = (n: number) => String(n).padStart(2, "0");
const fmtDate = (d: Date)   =>
  d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "short", year: "numeric" });

// ─── WebAuthn step-up ────────────────────────────────────────────────────────

const b64Decode = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const b64Encode = (b: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

async function triggerBiometrics(): Promise<string> {
  if (typeof window !== "undefined" && !window.PublicKeyCredential) {
    await new Promise((r) => setTimeout(r, 700));
    return "mock_token_" + Date.now();
  }
  const { challenge, allowCredentials, rpId } = await fetch("/api/auth/challenge", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}),
  }).then((r) => r.json());

  const assertion = await navigator.credentials.get({
    publicKey: { challenge: b64Decode(challenge), rpId, allowCredentials, userVerification: "required", timeout: 60_000 },
  });
  if (!assertion) throw new Error("CANCELLED");

  const cred = assertion as PublicKeyCredential;
  const res  = cred.response as AuthenticatorAssertionResponse;
  const { webAuthnToken } = await fetch("/api/auth/verify", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      credentialId: cred.id, clientDataJSON: b64Encode(res.clientDataJSON),
      authenticatorData: b64Encode(res.authenticatorData), signature: b64Encode(res.signature),
    }),
  }).then((r) => r.json());
  return webAuthnToken as string;
}

// ─── Camera Modal ────────────────────────────────────────────────────────────

function CameraModal({ onCapture, onCancel }: { onCapture: (b: Blob) => void; onCancel: () => void }) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [step,     setStep]     = useState<CamStep>("preview");
  const [camError, setCamError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 640 } })
      .then((s) => {
        if (!active) { s.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => { if (active) setCamError("No se pudo acceder a la cámara."); });
    return () => { active = false; streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const capture = () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth || 640; c.height = v.videoHeight || 640;
    c.getContext("2d")!.drawImage(v, 0, 0);
    setSnapshot(c.toDataURL("image/jpeg", 0.85));
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setStep("captured");
  };

  const retake = () => {
    setSnapshot(null); setStep("preview");
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }).then((s) => {
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
    });
  };

  const confirm = () => {
    if (!snapshot || !canvasRef.current) return;
    setStep("uploading");
    canvasRef.current.toBlob((blob) => { if (blob) onCapture(blob); }, "image/jpeg", 0.85);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-5"
         style={{ background: "rgba(2,6,18,0.97)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-sm flex flex-col gap-4">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"/>
            <span className="text-white/40 text-[10px] font-semibold uppercase tracking-widest">Selfie de marcación</span>
          </div>
          <button onClick={onCancel} className="text-white/25 hover:text-white/60 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="relative w-full aspect-square rounded-2xl overflow-hidden"
             style={{ background: "#060E1D", border: "1px solid rgba(41,137,216,0.3)", boxShadow: "0 0 40px rgba(41,137,216,0.10)" }}>

          {step === "preview" && !camError && (
            <>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-52 h-64 rounded-full"
                     style={{ border: "1.5px dashed rgba(41,137,216,0.45)" }}/>
              </div>
              {/* target corners */}
              {(["top-4 left-4 border-t border-l","top-4 right-4 border-t border-r",
                 "bottom-4 left-4 border-b border-l","bottom-4 right-4 border-b border-r"] as string[]).map((cls) => (
                <div key={cls} className={`absolute ${cls} w-5 h-5 pointer-events-none z-10`}
                     style={{ borderColor: "rgba(41,137,216,0.65)" }}/>
              ))}
            </>
          )}

          {step === "preview" && (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]"/>
          )}
          {step === "captured" && snapshot && (
            <img src={snapshot} alt="selfie" className="w-full h-full object-cover scale-x-[-1]"/>
          )}
          {step === "uploading" && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <svg className="animate-spin w-10 h-10" fill="none" viewBox="0 0 24 24" style={{ color: "#2989d8" }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-white/35 text-sm">Subiendo foto...</p>
            </div>
          )}
          {camError && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 px-6 text-center">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.362a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
              </svg>
              <p className="text-red-300 text-sm">{camError}</p>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden"/>

        <p className="text-white/25 text-xs text-center">
          {step === "preview" && !camError ? "Centra tu rostro en el óvalo" : step === "captured" ? "¿La foto se ve bien?" : ""}
        </p>

        <div className="flex gap-3">
          {step === "preview" && !camError && (
            <button onClick={capture}
              className="flex-1 py-4 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              style={{ background: G.btn, boxShadow: "0 4px 20px rgba(41,137,216,0.4)" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Capturar
            </button>
          )}
          {step === "captured" && (
            <>
              <button onClick={retake}
                className="flex-1 py-4 rounded-xl text-sm font-medium active:scale-95 transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.45)" }}>
                Repetir
              </button>
              <button onClick={confirm}
                className="flex-1 py-4 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                style={{ background: G.btn, boxShadow: "0 4px 20px rgba(41,137,216,0.4)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
                Usar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Punch Zone Card ─────────────────────────────────────────────────────────

interface PunchCardProps {
  next:       PunchType;
  lastPunch:  Punch | null;
  canPunch:   boolean;
  loading:    boolean;
  punchStep:  string | null;
  error:      string | null;
  geo:        { isWithin: boolean; distanceMeters: number };
  onPunch:    (t: PunchType) => void;
}

function PunchCard({ next, lastPunch, canPunch, loading, punchStep, error, geo, onPunch }: PunchCardProps) {
  const meta = PUNCH_META[next];

  const STEPS = [
    { key: "geo", label: "Geofence", done: geo.isWithin,
      d: "M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
    { key: "bio", label: "Biometría",
      d: "M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" },
    { key: "cam", label: "Foto",
      d: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" },
  ];

  return (
    <div className="mx-4 mb-4 rounded-2xl overflow-hidden"
         style={{
           background: "#060E1D",
           border: "1px solid rgba(41,137,216,0.18)",
           boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.03)",
         }}>

      {/* Cabecera de la card */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4"
           style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Paso */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold text-white"
               style={{ background: G.btn }}>
            {meta.step}
          </div>
          <span className="text-white/30 text-[10px] font-semibold uppercase tracking-widest">
            / 4 pasos
          </span>
        </div>

        {/* Indicadores de proceso */}
        <div className="flex items-center gap-2">
          {STEPS.map(({ key, label, d, done }) => (
            <div key={key} title={label}
                 className="flex items-center justify-center w-7 h-7 rounded-lg transition-all"
                 style={{
                   background: done ? "rgba(41,137,216,0.18)" : "rgba(255,255,255,0.04)",
                   border: `1px solid ${done ? "rgba(41,137,216,0.4)" : "rgba(255,255,255,0.06)"}`,
                 }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   style={{ color: done ? "#7db9e8" : "rgba(255,255,255,0.2)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d}/>
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-5 pt-5 pb-5">
        {/* Fuera del área */}
        {!geo.isWithin && (
          <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-4 text-sm"
               style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5" }}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            </svg>
            <span>Estás a {geo.distanceMeters}m — radio máximo 500m</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4 text-sm"
               style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5" }}>
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"/>
            </svg>
            {error}
          </div>
        )}

        {/* Progreso biometría/cámara */}
        {loading && punchStep && (
          <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 mb-4 text-sm"
               style={{ background: "rgba(41,137,216,0.08)", border: "1px solid rgba(41,137,216,0.18)", color: "#7db9e8" }}>
            <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span className="text-xs font-medium">{punchStep}</span>
          </div>
        )}

        {/* Etiqueta de acción */}
        <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest mb-1">
          Siguiente marcación
        </p>
        <p className="text-white font-bold mb-1"
           style={{ fontSize: "1.75rem", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          {meta.label}
        </p>
        {lastPunch && (
          <p className="text-white/25 text-xs mb-4 font-light">
            Anterior: {PUNCH_META[lastPunch.type].short} · {lastPunch.time}
          </p>
        )}
        {!lastPunch && (
          <p className="text-white/20 text-xs mb-4 font-light">
            Turno {MOCK_SITE.shift.start} – {MOCK_SITE.shift.end}
          </p>
        )}

        {/* Barra de progreso de secuencia */}
        <div className="flex gap-1 mb-5">
          {PUNCH_SEQ.map((t) => {
            const done    = lastPunch ? PUNCH_SEQ.indexOf(t) <= PUNCH_SEQ.indexOf(lastPunch.type) : false;
            const current = t === next && !lastPunch || (lastPunch && PUNCH_SEQ.indexOf(t) === PUNCH_SEQ.indexOf(lastPunch.type) + 1);
            return (
              <div key={t} className="flex-1 h-1 rounded-full transition-all"
                   style={{
                     background: done
                       ? "#2989d8"
                       : current
                       ? "rgba(41,137,216,0.45)"
                       : "rgba(255,255,255,0.07)",
                   }}/>
            );
          })}
        </div>

        {/* Botón principal */}
        <button
          onClick={() => onPunch(next)}
          disabled={!canPunch}
          className="w-full py-4 rounded-xl font-bold text-white text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-40"
          style={{
            background:  canPunch ? G.btn : "rgba(255,255,255,0.05)",
            boxShadow:   canPunch ? "0 4px 24px rgba(41,137,216,0.50), 0 1px 0 rgba(255,255,255,0.08) inset" : "none",
            border:      canPunch ? "none" : "1px solid rgba(255,255,255,0.08)",
            letterSpacing: "0.03em",
          }}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Procesando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Marcar {meta.short}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function MobilePunch() {
  const now = useRealTimeClock();

  const [tab,        setTab]        = useState<Tab>("asistencia");
  const [loading,    setLoading]    = useState(false);
  const [punches,    setPunches]    = useState<Punch[]>([]);
  const [error,      setError]      = useState<string | null>(null);
  const [punchStep,  setPunchStep]  = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const captureResolveRef = useRef<((b: Blob)  => void) | null>(null);
  const captureRejectRef  = useRef<((e: Error) => void) | null>(null);

  const geo       = checkGeofence(MOCK_USER_LOCATION, MOCK_SITE, MOCK_SITE.radiusMeters);
  const lastPunch = punches[punches.length - 1] ?? null;

  const nextType = (): PunchType => {
    if (!lastPunch) return "entrada";
    const i = PUNCH_SEQ.indexOf(lastPunch.type);
    return i < PUNCH_SEQ.length - 1 ? PUNCH_SEQ[i + 1] : "entrada";
  };

  const openCameraModal = useCallback((): Promise<Blob> =>
    new Promise((resolve, reject) => {
      captureResolveRef.current = resolve;
      captureRejectRef.current  = reject;
      setShowCamera(true);
    }), []);

  const handleCameraCapture = (blob: Blob) => {
    setShowCamera(false);
    captureResolveRef.current?.(blob);
  };
  const handleCameraCancel = () => {
    setShowCamera(false);
    captureRejectRef.current?.(new Error("CANCELLED"));
  };

  const handlePunch = async (type: PunchType) => {
    if (!geo.isWithin) return;
    setLoading(true); setError(null); setPunchStep(null);
    try {
      setPunchStep("Verificando identidad (biometría)...");
      await triggerBiometrics();
      setPunchStep("Abriendo cámara...");
      const blob = await openCameraModal();
      setPunchStep("Subiendo foto y registrando...");
      await new Promise((r) => setTimeout(r, 700)); // simula POST /punches
      setPunches((p) => [...p, { type, time: `${pad(now.getHours())}:${pad(now.getMinutes())}` }]);
    } catch (e: unknown) {
      if (e instanceof Error && e.message !== "CANCELLED")
        setError("Error al registrar. Intenta de nuevo.");
    } finally {
      setLoading(false); setPunchStep(null);
    }
  };

  const tabItems = [
    { id: "asistencia" as Tab, label: "Asistencia",
      d: "M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" },
    { id: "historial"  as Tab, label: "Historial",
      d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { id: "mas"        as Tab, label: "Más",
      d: "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" },
  ];

  return (
    /* ── Layout: flex column, NO fixed nav ── */
    <div className="flex flex-col max-w-sm mx-auto"
         style={{ height: "100dvh", fontFamily: "Poppins, sans-serif", background: "#0A111E" }}>

      {showCamera && <CameraModal onCapture={handleCameraCapture} onCancel={handleCameraCancel}/>}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* ══════ ASISTENCIA ══════ */}
        {tab === "asistencia" && (
          <>
            {/* Hero */}
            <div className="flex flex-col items-center pt-8 pb-8 px-5 relative overflow-hidden"
                 style={{ background: G.hero }}>
              {/* Dot grid */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "radial-gradient(circle, rgba(41,137,216,0.14) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}/>
              {/* Hexágono */}
              <div className="absolute -top-8 -right-8 w-36 h-36 pointer-events-none opacity-15">
                <svg viewBox="0 0 200 230" fill="none" className="w-full h-full">
                  <polygon points="100,5 195,55 195,175 100,225 5,175 5,55"
                           stroke="#2989d8" strokeWidth="1.5" fill="none"/>
                </svg>
              </div>

              {/* Top row */}
              <div className="relative z-10 w-full flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="GO" className="h-5 w-auto object-contain brightness-0 invert opacity-70"/>
                  <div className="h-3 w-px bg-white/15"/>
                  <span className="text-white/55 text-xs tracking-wider">{MOCK_SITE.name}</span>
                </div>
                {/* Geofence badge */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold
                  ${geo.isWithin
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                    : "bg-red-500/15 text-red-300 border border-red-500/20"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${geo.isWithin ? "bg-emerald-400" : "bg-red-400"}`}/>
                  {geo.isWithin ? `${geo.distanceMeters}m` : `${geo.distanceMeters}m ✕`}
                </div>
              </div>

              {/* Saludo */}
              <p className="relative z-10 text-white/50 text-sm font-light w-full">
                Hola, <span className="text-white font-semibold">{MOCK_USER.name.split(" ")[0]}</span>
              </p>

              {/* Reloj — monospace */}
              <div className="relative z-10 w-full flex items-end gap-0.5 mt-2">
                {[pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].map((seg, i) => (
                  <span key={i} className="flex items-end">
                    <span className="text-5xl font-thin text-white leading-none"
                          style={{ fontFamily: "ui-monospace,'SF Mono',monospace", letterSpacing: "-0.04em" }}>
                      {seg}
                    </span>
                    {i < 2 && (
                      <span className="text-3xl font-thin mb-1 mx-0.5"
                            style={{ color: "rgba(41,137,216,0.5)" }}>:</span>
                    )}
                  </span>
                ))}
              </div>
              <p className="relative z-10 w-full text-white/30 text-xs font-light mt-1 capitalize">
                {fmtDate(now)}
              </p>
            </div>

            {/* Punch Zone — dark card, NOT overlapping hero */}
            <div className="pt-3" style={{ background: "#0A111E" }}>
              <PunchCard
                next={nextType()}
                lastPunch={lastPunch}
                canPunch={geo.isWithin && !loading}
                loading={loading}
                punchStep={punchStep}
                error={error}
                geo={geo}
                onPunch={handlePunch}
              />
            </div>
          </>
        )}

        {/* ══════ HISTORIAL ══════ */}
        {tab === "historial" && (
          <div className="flex flex-col">
            <div className="px-4 pt-8 pb-5 relative overflow-hidden" style={{ background: G.hero }}>
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "radial-gradient(circle, rgba(41,137,216,0.14) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}/>
              <h1 className="relative z-10 text-white text-lg font-semibold">Historial</h1>
              <p className="relative z-10 text-white/35 text-xs mt-0.5 capitalize">{fmtDate(now)}</p>
            </div>

            <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <button className="flex-1 py-3 text-white text-xs font-bold uppercase tracking-widest"
                      style={{ background: G.btn }}>Asistencia</button>
              <button className="flex-1 py-3 text-xs font-medium uppercase tracking-widest"
                      style={{ background: "#0D1625", color: "rgba(255,255,255,0.3)" }}>Turnos</button>
            </div>

            <div className="p-4">
              {punches.length === 0 ? (
                <div className="rounded-2xl p-8 text-center text-sm"
                     style={{ background: "#0D1625", border: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)" }}>
                  Sin marcaciones hoy
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden"
                     style={{ background: "#0D1625", border: "1px solid rgba(41,137,216,0.15)" }}>
                  <div className="flex items-center justify-between p-4"
                       style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <p className="font-semibold text-sm text-white/80">
                        {MOCK_SITE.shift.start} – {MOCK_SITE.shift.end}
                      </p>
                      <p className="text-white/30 text-xs">{MOCK_SITE.shift.breakMinutes} min colación</p>
                    </div>
                    <span className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                          style={{ background: G.btn }}>
                      {now.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-5">
                    {PUNCH_SEQ.map((type) => {
                      const m = punches.find((p) => p.type === type);
                      return (
                        <div key={type} className="flex flex-col gap-0.5">
                          <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider">
                            {PUNCH_META[type].short}
                          </p>
                          <p className={`text-xl font-semibold tabular-nums ${m ? "text-white" : "text-white/15"}`}
                             style={{ fontFamily: m ? "ui-monospace,monospace" : undefined }}>
                            {m?.time ?? "—"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between px-4 py-3 text-xs"
                       style={{ borderTop: "1px solid rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
                    <span>HT: <span className="font-semibold text-white/50">—</span></span>
                    <span>Reposiciones: <span className="font-semibold text-white/50">0</span></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════ MÁS ══════ */}
        {tab === "mas" && (
          <div className="flex flex-col">
            <div className="px-4 pt-8 pb-5 relative overflow-hidden" style={{ background: G.hero }}>
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "radial-gradient(circle, rgba(41,137,216,0.14) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}/>
              <h1 className="relative z-10 text-white text-lg font-semibold">Configuración</h1>
              <div className="relative z-10 flex items-center gap-3 mt-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ background: "rgba(41,137,216,0.15)", border: "1px solid rgba(41,137,216,0.22)" }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{MOCK_USER.name}</p>
                  <p className="text-white/35 text-xs">Empleado</p>
                </div>
              </div>
            </div>

            <div style={{ background: "#0A111E" }}>
              {[
                { label: "Enviar informe",    icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
                { label: "Sincronizar datos", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
                { label: "Acerca de GOTEST",  icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                { label: "Cerrar sesión",     icon: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" },
              ].map(({ label, icon }) => (
                <button key={label}
                  className="w-full px-4 py-4 flex items-center gap-4 text-left transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(41,137,216,0.05)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                       style={{ background: "rgba(41,137,216,0.10)", border: "1px solid rgba(41,137,216,0.18)" }}>
                    <svg className="w-4 h-4" fill="none" stroke="#7db9e8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon}/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>{label}</span>
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="rgba(255,255,255,0.15)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom nav — sticky (NO fixed) ── */}
      <div className="flex-shrink-0 flex"
           style={{ background: "#070E1A", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {tabItems.map(({ id, label, d }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)}
              className="flex-1 flex flex-col items-center py-3 gap-0.5 relative transition-colors"
              style={{ background: active ? "rgba(41,137,216,0.07)" : "transparent" }}>
              {active && (
                <span className="absolute top-0 inset-x-0 h-0.5 rounded-full"
                      style={{ background: G.btn }}/>
              )}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   style={{ color: active ? "#7db9e8" : "rgba(255,255,255,0.2)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d}/>
              </svg>
              <span className="text-[10px] font-medium"
                    style={{ color: active ? "#7db9e8" : "rgba(255,255,255,0.2)" }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
