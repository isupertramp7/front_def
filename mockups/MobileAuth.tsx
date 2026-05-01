"use client";

import { useState } from "react";

const G = {
  full: 'linear-gradient(to bottom, #1e5799 0%, #2989d8 50%, #207cca 51%, #7db9e8 100%)',
  btn:  'linear-gradient(135deg, #1e5799 0%, #2989d8 100%)',
} as const;

const MOCK_USER = "Cristian Florez";

async function authenticateWithPasskey(): Promise<void> {
  const { challenge, allowCredentials, rpId } = await fetch("/api/auth/challenge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  }).then((r) => r.json());

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: b64Decode(challenge),
      rpId,
      allowCredentials,
      userVerification: "required",
      timeout: 60_000,
    },
  });
  if (!assertion) throw new Error("Cancelado");

  const cred = assertion as PublicKeyCredential;
  const res  = cred.response as AuthenticatorAssertionResponse;
  await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      credentialId:      cred.id,
      clientDataJSON:    b64Encode(res.clientDataJSON),
      authenticatorData: b64Encode(res.authenticatorData),
      signature:         b64Encode(res.signature),
    }),
  });
}

const b64Decode = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
const b64Encode = (b: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

export default function MobileAuth() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleBiometric = async () => {
    setLoading(true);
    setError(null);
    try {
      await authenticateWithPasskey();
      alert("Sesión iniciada ✓");
    } catch {
      setError("Biometría fallida. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-8 py-14 relative overflow-hidden"
      style={{ background: G.full, fontFamily: "Poppins, sans-serif" }}
    >
      {/* Círculos de fondo */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-28 -right-20 w-80 h-80 rounded-full bg-white/[0.06] pointer-events-none" />

      {/* Logo */}
      <div className="relative flex flex-col items-center pt-4">
        <img
          src="/logo.png"
          alt="GO Tecnología"
          className="h-28 w-auto object-contain brightness-0 invert"
        />
      </div>

      {/* Centro — bienvenida */}
      <div className="relative flex flex-col items-center gap-2 text-center">
        <p className="text-white/60 text-sm font-light tracking-wide">Bienvenido de vuelta</p>
        <h1 className="text-white text-2xl font-semibold">{MOCK_USER}</h1>
        <p className="text-white/50 text-xs font-light mt-1">
          Confirma tu identidad para continuar
        </p>
      </div>

      {/* Botones */}
      <div className="relative w-full flex flex-col gap-3">
        {error && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm bg-red-500/20 text-red-100 border border-red-400/30">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <button
          onClick={handleBiometric}
          disabled={loading}
          className="w-full bg-white font-semibold py-4 rounded-2xl flex items-center
                     justify-center gap-2.5 text-base transition-all active:scale-95 disabled:opacity-60"
          style={{ color: "#1e5799", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
        >
          {loading ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916
                   13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118
                   6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99
                   -7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39
                   -2.823 1.07-4" />
            </svg>
          )}
          {loading ? "Verificando..." : "Ingresar con Biometría"}
        </button>

        <button
          type="button"
          className="w-full py-3 rounded-2xl text-sm font-medium text-white/60
                     border border-white/20 hover:bg-white/10 hover:text-white transition-all"
        >
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}
