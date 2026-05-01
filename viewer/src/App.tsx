import { useState } from "react";
import MobileAuth from "@mockups/MobileAuth";
import MobilePunch from "@mockups/MobilePunch";
import AdminDashboard from "@mockups/AdminDashboard";
import LoginPage from "@mockups/LoginPage";

type View = "login" | "auth" | "punch" | "admin";

const VIEWS: { id: View; label: string; hint: string }[] = [
  { id: "login", label: "Login",          hint: "Desktop · Credenciales" },
  { id: "auth",  label: "Mobile Auth",    hint: "Mobile · WebAuthn" },
  { id: "punch", label: "Mobile Punch",   hint: "Asistencia · Geofence" },
  { id: "admin", label: "Admin",          hint: "Dashboard · Reportes" },
];

export default function App() {
  const [view, setView] = useState<View>("login");

  return (
    <div className="min-h-screen bg-[#0c1e3c]">
      {/* Navbar viewer */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-5 py-2.5 border-b border-white/10"
        style={{ background: 'linear-gradient(to right, #0c1e3c 0%, #1e5799 100%)' }}
      >
        <img src="/logo.png" alt="GO Tecnología" className="h-8 w-auto object-contain" />
        <div className="w-px h-5 bg-white/20 mx-1" />
        <span className="text-white/50 text-xs font-medium tracking-widest uppercase">Mockups</span>
        <div className="flex items-center gap-1 ml-3">
          {VIEWS.map(({ id, label, hint }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium
                          transition-all duration-150
                ${view === id
                  ? "text-white shadow-lg"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}
              style={view === id
                ? { background: 'linear-gradient(135deg, #2989d8 0%, #207cca 100%)' }
                : {}}
            >
              {label}
              <span className={`text-[10px] hidden sm:inline ${view === id ? "text-blue-200" : "text-white/30"}`}>
                {hint}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="pt-11">
        {view === "login" && (
          <div className="h-[calc(100vh-44px)]">
            <LoginPage />
          </div>
        )}
        {(view === "auth" || view === "punch") && (
          <div className="flex justify-center items-start py-8 min-h-screen bg-[#0c1e3c]">
            {/* Phone frame */}
            <div
              className="w-[390px] min-h-[780px] rounded-[2.5rem] overflow-hidden shadow-2xl"
              style={{ border: '6px solid #1e5799', boxShadow: '0 30px 80px rgba(41,137,216,0.25)' }}
            >
              {view === "auth"  && <MobileAuth />}
              {view === "punch" && <MobilePunch />}
            </div>
          </div>
        )}
        {view === "admin" && <AdminDashboard />}
      </div>
    </div>
  );
}
