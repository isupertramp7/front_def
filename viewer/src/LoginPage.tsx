"use client";

import { useState } from "react";

const G = {
  full: 'linear-gradient(to bottom, #1e5799 0%, #2989d8 50%, #207cca 51%, #7db9e8 100%)',
  btn:  'linear-gradient(135deg, #1e5799 0%, #2989d8 100%)',
  soft: 'linear-gradient(135deg, #2989d8 0%, #7db9e8 100%)',
} as const;

export default function LoginPage() {
  const [usuario,  setUsuario]  = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario.trim() || !password.trim()) {
      setError("Completa usuario y contraseña");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 800));
      // En prod: POST /auth/login → JWT
      if (password === "error") throw new Error();
      alert("Sesión iniciada ✓");
    } catch {
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = {
    fontFamily: "Poppins, sans-serif",
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ fontFamily: "Poppins, sans-serif" }}>

      {/* ── Panel izquierdo — brand ── */}
      <div
        className="hidden lg:flex w-[45%] flex-col items-center justify-between py-12 px-10 relative overflow-hidden"
        style={{ background: G.full }}
      >
        {/* Círculos decorativos */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-10"
             style={{ background: "white" }} />
        <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full opacity-[0.07]"
             style={{ background: "white" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px]
                        rounded-full opacity-[0.05]"
             style={{ background: "white" }} />

        {/* Logo */}
        <div className="relative z-10 flex flex-col items-center">
          <img src="/logo.png" alt="GO Tecnología" className="h-28 w-auto object-contain brightness-0 invert" />
        </div>

        {/* Tagline central */}
        <div className="relative z-10 text-center px-6">
          <h2 className="text-white text-3xl font-bold leading-tight">
            Control de asistencia<br />
            <span className="font-light opacity-80">inteligente y seguro</span>
          </h2>
          <p className="text-white/60 text-sm mt-4 font-light leading-relaxed">
            Geofencing · WebAuthn · Reportes en tiempo real
          </p>

          {/* Feature list */}
          <div className="mt-8 flex flex-col gap-3 text-left">
            {[
              { icon: "M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z", text: "Marcación geofence 500m" },
              { icon: "M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4", text: "Autenticación biométrica" },
              { icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", text: "Reportes y exportación Excel" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                  </svg>
                </div>
                <span className="text-white/80 text-sm font-light">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer brand */}
        <p className="relative z-10 text-white/30 text-xs font-light">
          © 2026 GO Tecnología · v1.0.0
        </p>
      </div>

      {/* ── Panel derecho — form ── */}
      <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center px-6 py-12">

        {/* Logo mobile (solo visible < lg) */}
        <div className="lg:hidden mb-8">
          <img src="/logo.png" alt="GO Tecnología" className="h-16 w-auto object-contain" />
        </div>

        {/* Card */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

          {/* Encabezado */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
            <p className="text-gray-400 text-sm mt-1 font-light">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Usuario */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Usuario
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="usuario@empresa.cl"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  autoComplete="username"
                  style={inputBase}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm
                             text-gray-900 bg-gray-50 placeholder:text-gray-300
                             focus:outline-none focus:bg-white transition-all"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2989d8";
                    e.target.style.boxShadow = "0 0 0 3px rgba(41,137,216,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-xs font-medium transition-colors"
                  style={{ color: "#2989d8" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#1e5799")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#2989d8")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={inputBase}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-11 py-3 text-sm
                             text-gray-900 bg-gray-50 placeholder:text-gray-300
                             focus:outline-none focus:bg-white transition-all"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#2989d8";
                    e.target.style.boxShadow = "0 0 0 3px rgba(41,137,216,0.12)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPwd ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Recordarme */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => setRemember((v) => !v)}
                className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: remember ? G.btn : "white",
                  border: remember ? "none" : "1.5px solid #d1d5db",
                }}
              >
                {remember && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-500 font-light">Recordar sesión</span>
            </label>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
                   style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3.5 rounded-xl text-sm
                         transition-all active:scale-[0.98] disabled:opacity-60 mt-1 flex items-center justify-center gap-2"
              style={{
                background: loading ? "#2989d8" : G.btn,
                boxShadow: "0 8px 24px rgba(41,137,216,0.30)",
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divisor SSO (opcional) */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-gray-300 text-xs">o continúa con</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button
            type="button"
            className="mt-4 w-full flex items-center justify-center gap-2.5 border border-gray-200
                       rounded-xl py-3 text-sm font-medium text-gray-600 bg-white
                       hover:bg-gray-50 transition-all"
          >
            {/* Fingerprint — WebAuthn */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 style={{ color: "#2989d8" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0
                   008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0
                   0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3
                   15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
            Passkey / Biometría
          </button>
        </div>

        <p className="mt-6 text-gray-400 text-xs font-light">
          © 2026 GO Tecnología · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
