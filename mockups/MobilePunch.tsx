"use client";

import { useState, useEffect } from "react";
import { checkGeofence } from "./lib/geofence";

const G = {
  full: 'linear-gradient(to bottom, #1e5799 0%, #2989d8 50%, #207cca 51%, #7db9e8 100%)',
  btn:  'linear-gradient(135deg, #1e5799 0%, #2989d8 100%)',
} as const;

const MOCK_USER = { name: "Cristian Florez Revilla", siteId: "site_01" };
const MOCK_SITE = {
  name: "ASTRO SPA",
  lat: -33.4372, lng: -70.6366, radiusMeters: 500,
  shift: { start: "08:30", end: "18:00", breakMinutes: 45 },
};
const MOCK_USER_LOCATION = { lat: -33.4370, lng: -70.6364 }; // ~38m → dentro

type PunchType = "entrada" | "salida" | "salida_colacion" | "entrada_colacion";
type Tab = "asistencia" | "historial" | "mas";

interface Punch { type: PunchType; time: string }

const PUNCH_LABEL: Record<PunchType, string> = {
  entrada: "Entrada", salida: "Salida",
  salida_colacion: "Salida a colación", entrada_colacion: "Entrada de colación",
};

function useRealTimeClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  return now;
}

const pad = (n: number) => String(n).padStart(2, "0");
const fmtDate = (d: Date) => d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "short", year: "numeric" });

// ─────────────────────────────────────────────────────────────────────────────

export default function MobilePunch() {
  const now     = useRealTimeClock();
  const [tab,     setTab]     = useState<Tab>("asistencia");
  const [loading, setLoading] = useState(false);
  const [punches, setPunches] = useState<Punch[]>([]);
  const [error,   setError]   = useState<string | null>(null);

  const geo      = checkGeofence(MOCK_USER_LOCATION, MOCK_SITE, MOCK_SITE.radiusMeters);
  const lastPunch = punches[punches.length - 1] ?? null;

  const nextType = (): PunchType => {
    if (!lastPunch) return "entrada";
    const seq: PunchType[] = ["entrada", "salida_colacion", "entrada_colacion", "salida"];
    const i = seq.indexOf(lastPunch.type);
    return i < seq.length - 1 ? seq[i + 1] : "entrada";
  };

  const handlePunch = async (type: PunchType) => {
    if (!geo.isWithin) return;
    setLoading(true); setError(null);
    try {
      await new Promise((r) => setTimeout(r, 500));
      setPunches((p) => [...p, { type, time: `${pad(now.getHours())}:${pad(now.getMinutes())}` }]);
    } catch {
      setError("Error al registrar. Intenta de nuevo.");
    } finally { setLoading(false); }
  };

  const next       = nextType();
  const canPunch   = geo.isWithin && !loading;
  const isEntrada  = next === "entrada";
  const isSalCol   = next === "salida_colacion";
  const isEntCol   = next === "entrada_colacion";
  const isSalida   = next === "salida";

  const btnLeft  = isEntrada ? "ENTRADA" : isEntCol ? "ENT. COLACIÓN" : null;
  const btnRight = isSalCol  ? "SAL. COLACIÓN" : isSalida ? "SALIDA" : null;

  const tabItems = [
    { id: "asistencia" as Tab, label: "Asistencia", d: "M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" },
    { id: "historial"  as Tab, label: "Historial",  d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { id: "mas"        as Tab, label: "Más",         d: "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-sm mx-auto relative" style={{ fontFamily: 'Poppins, sans-serif' }}>

      {/* ══════════════ ASISTENCIA ══════════════ */}
      {tab === "asistencia" && (
        <>
          {/* Hero */}
          <div className="flex flex-col items-center pt-10 pb-10 px-5"
               style={{ background: G.full }}>
            <div className="flex items-center gap-2 mb-5">
              <img src="/logo.png" alt="GO" className="h-7 w-auto object-contain brightness-0 invert opacity-90" />
              <span className="text-white font-semibold text-sm tracking-wider opacity-90">{MOCK_SITE.name}</span>
            </div>

            {/* Geofence badge */}
            <div className={`mb-4 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5
              ${geo.isWithin ? "bg-emerald-500/25 text-emerald-200" : "bg-red-500/25 text-red-200"}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${geo.isWithin ? "bg-emerald-400" : "bg-red-400"}`} />
              {geo.isWithin
                ? `Dentro del área · ${geo.distanceMeters}m`
                : `Fuera del área · ${geo.distanceMeters}m de 500m`}
            </div>

            <p className="text-white/80 text-base font-light">Hola, {MOCK_USER.name.split(" ")[0]}</p>

            {/* Reloj */}
            <div className="flex items-end gap-1 mt-2">
              {[pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].map((seg, i) => (
                <span key={i} className="flex items-end gap-0.5">
                  <span className="text-6xl font-thin text-white tabular-nums leading-none">{seg}</span>
                  {i < 2 && <span className="text-4xl font-thin text-white/50 mb-1">:</span>}
                </span>
              ))}
            </div>
            <div className="flex gap-9 mt-1 text-[10px] font-light text-white/50 tracking-[0.3em]">
              <span>H</span><span>M</span><span>S</span>
            </div>
            <p className="mt-3 text-white/60 text-xs font-light capitalize">{fmtDate(now)}</p>
          </div>

          {/* Card turno */}
          <div className="mx-4 -mt-5 bg-white rounded-2xl shadow-md px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: G.btn }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#2989d8' }}>Turno</p>
              <p className="text-gray-500 text-xs">
                {MOCK_SITE.shift.start} – {MOCK_SITE.shift.end}
                <span className="text-gray-400"> · {MOCK_SITE.shift.breakMinutes} min colación</span>
              </p>
            </div>
          </div>

          {/* Zona marcación */}
          <div className="flex-1 flex flex-col justify-end px-4 pb-24 gap-3 mt-5">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            {!geo.isWithin && (
              <div className="bg-blue-50 border rounded-xl px-4 py-3 text-center" style={{ borderColor: '#7db9e8' }}>
                <p className="font-semibold text-sm" style={{ color: '#1e5799' }}>Fuera del área permitida</p>
                <p className="text-xs mt-0.5" style={{ color: '#2989d8' }}>
                  Estás a {geo.distanceMeters}m. Acércate a {MOCK_SITE.name}.
                </p>
              </div>
            )}
            {lastPunch && (
              <p className="text-center text-gray-400 text-xs">
                Última marca: <span className="font-semibold text-gray-600">{PUNCH_LABEL[lastPunch.type]} {lastPunch.time}</span>
              </p>
            )}

            <div className="flex gap-3">
              {/* Botón izquierdo (Entrada / Ent. Colación) */}
              {(isEntrada || isEntCol) && (
                <button onClick={() => handlePunch(next)} disabled={!canPunch}
                  className="flex-1 font-semibold py-4 rounded-xl text-sm text-white transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: canPunch ? G.btn : '#9ca3af', boxShadow: canPunch ? '0 6px 20px rgba(41,137,216,0.35)' : 'none' }}>
                  {loading ? "..." : btnLeft}
                </button>
              )}
              {/* Botón derecho (Sal. Colación / Salida) */}
              {(isSalCol || isSalida) && (
                <button onClick={() => handlePunch(next)} disabled={!canPunch}
                  className="flex-1 font-semibold py-4 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50"
                  style={{
                    border: `2px solid ${canPunch ? '#2989d8' : '#d1d5db'}`,
                    color: canPunch ? '#1e5799' : '#9ca3af',
                  }}>
                  {loading ? "..." : btnRight}
                </button>
              )}
              {/* Si aún no hay marcas: mostrar ambos */}
              {!lastPunch && (
                <button onClick={() => handlePunch("salida")} disabled={true}
                  className="flex-1 font-semibold py-4 rounded-xl text-sm opacity-40"
                  style={{ border: '2px solid #d1d5db', color: '#9ca3af' }}>
                  SALIDA
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ══════════════ HISTORIAL ══════════════ */}
      {tab === "historial" && (
        <div className="flex-1 flex flex-col pb-20">
          <div className="px-4 pt-10 pb-5" style={{ background: G.full }}>
            <h1 className="text-white text-lg font-semibold text-center">Historial de Trabajo</h1>
            <p className="text-white/60 text-xs text-center mt-0.5 capitalize">{fmtDate(now)}</p>
          </div>

          <div className="flex border-b border-gray-200">
            <button className="flex-1 py-3 text-white text-sm font-semibold"
                    style={{ background: G.btn }}>ASISTENCIA</button>
            <button className="flex-1 py-3 text-gray-400 text-sm font-medium bg-white hover:bg-gray-50">TURNOS</button>
          </div>

          <div className="p-4">
            {punches.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm shadow-sm">
                Sin marcaciones hoy
              </div>
            ) : (
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="flex items-center justify-between p-4 border-b-2" style={{ borderColor: '#7db9e8' }}>
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">
                      Turno: {MOCK_SITE.shift.start} – {MOCK_SITE.shift.end}
                    </p>
                    <p className="text-gray-400 text-xs">({MOCK_SITE.shift.breakMinutes} minutos)</p>
                  </div>
                  <span className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                        style={{ background: G.btn }}>
                    {now.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-center text-xs font-semibold text-white py-1.5 rounded-lg mb-4"
                     style={{ background: G.btn }}>Marcaciones</p>
                  <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    {(["entrada", "salida", "salida_colacion", "entrada_colacion"] as PunchType[]).map((type) => {
                      const m = punches.find((p) => p.type === type);
                      return (
                        <div key={type}>
                          <p className="font-medium text-gray-600 text-xs">{PUNCH_LABEL[type]}</p>
                          <p className={`text-lg font-semibold mt-0.5 ${m ? "text-gray-900" : "text-gray-300"}`}>
                            {m?.time ?? "—"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <span>HT: <span className="font-semibold text-gray-700">—</span></span>
                    <span>Nro. Reps.: <span className="font-semibold text-gray-700">0</span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════ MÁS ══════════════ */}
      {tab === "mas" && (
        <div className="flex-1 flex flex-col pb-20">
          <div className="px-4 pt-10 pb-5" style={{ background: G.full }}>
            <h1 className="text-white text-lg font-semibold text-center">Más</h1>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{MOCK_USER.name}</p>
                <p className="text-white/50 text-xs">Empleado</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 flex-1 divide-y divide-gray-100">
            {[
              { label: "ENVIAR INFORME",   icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
              { label: "SINCRONIZAR",      icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
              { label: "ACERCA DE GOTEST", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "CERRAR SESIÓN",    icon: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" },
            ].map(({ label, icon }) => (
              <button key={label}
                className="w-full bg-white px-4 py-4 flex items-center gap-4 hover:bg-blue-50/50 transition-colors text-left">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                     style={{ border: '1.5px solid #2989d8' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                       style={{ color: '#2989d8' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon}/>
                  </svg>
                </div>
                <span className="font-semibold text-gray-600 text-sm tracking-wide">{label}</span>
                <svg className="w-4 h-4 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom nav ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm
                      bg-white border-t border-gray-100 flex shadow-lg">
        {tabItems.map(({ id, label, d }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 style={{ color: tab === id ? '#2989d8' : '#9ca3af' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d}/>
            </svg>
            <span className="text-[10px] font-medium"
                  style={{ color: tab === id ? '#2989d8' : '#9ca3af' }}>
              {label}
            </span>
            {tab === id && (
              <span className="absolute bottom-0 w-10 h-0.5 rounded-full"
                    style={{ background: G.btn }}/>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
