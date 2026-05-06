"use client";

import { useState, useMemo } from "react";

const G = {
  btn:  'linear-gradient(135deg, #1e5799 0%, #2989d8 100%)',
  soft: 'linear-gradient(135deg, #2989d8 0%, #7db9e8 100%)',
  nav:  '#070F1E',
} as const;

// ─── Types & Mock Data ────────────────────────────────────────────────────────

type ViewId = "dashboard" | "asistencia" | "empleados" | "sitios" | "reportes" | "ajustes";
type AttStatus = "on_time" | "late" | "absent" | "overtime";
type EmpStatus = "activo" | "inactivo";

interface AttRecord {
  id: string; name: string; rut: string; site: string; date: string;
  entrada: string | null; salidaColacion: string | null;
  entradaColacion: string | null; salida: string | null;
  horasTrabajadas: string | null; minutosAtraso: number; status: AttStatus;
  photoUrl: string | null;
}

interface Employee {
  id: string; name: string; rut: string; email: string;
  site: string; role: string; status: EmpStatus;
  lastLogin: string; hasDevice: boolean;
}

interface Site {
  id: string; name: string; address: string;
  lat: number; lng: number; radiusMeters: number;
  employeeCount: number; punchesToday: number; active: boolean;
}

const ATT_DATA: AttRecord[] = [
  { id:"1", name:"Ivan Alejandro Rojas",  rut:"12.345.678-9",  site:"GO",                 date:"29-04-2026", entrada:"08:11", salidaColacion:"13:11", entradaColacion:"14:11", salida:"17:35", horasTrabajadas:"08:44", minutosAtraso:11, status:"late",     photoUrl:null },
  { id:"2", name:"Isabel Rojas Eneros",   rut:"10.234.567-K",  site:"Kaufmann Pajaritos", date:"29-04-2026", entrada:"08:00", salidaColacion:"12:45", entradaColacion:"13:45", salida:"18:00", horasTrabajadas:"09:15", minutosAtraso:0,  status:"overtime", photoUrl:null },
  { id:"3", name:"Cristian Teran",        rut:"15.678.901-2",  site:"GO",                 date:"29-04-2026", entrada:null,    salidaColacion:null,    entradaColacion:null,    salida:null,    horasTrabajadas:null,    minutosAtraso:0,  status:"absent",   photoUrl:null },
  { id:"4", name:"Marcelo Matamala",      rut:"13.456.789-3",  site:"Soprole Vitacura",   date:"29-04-2026", entrada:"08:00", salidaColacion:"13:00", entradaColacion:"14:00", salida:"17:25", horasTrabajadas:"08:35", minutosAtraso:0,  status:"on_time",  photoUrl:null },
  { id:"5", name:"Nicolas Sepulveda",     rut:"11.223.344-5",  site:"GO",                 date:"29-04-2026", entrada:"08:45", salidaColacion:"13:30", entradaColacion:"14:30", salida:"17:40", horasTrabajadas:"08:10", minutosAtraso:45, status:"late",     photoUrl:null },
  { id:"6", name:"Pablo Sepulveda",       rut:"17.890.123-6",  site:"Kaufmann Pajaritos", date:"29-04-2026", entrada:"08:02", salidaColacion:"13:00", entradaColacion:"14:00", salida:"17:32", horasTrabajadas:"08:45", minutosAtraso:2,  status:"on_time",  photoUrl:null },
  { id:"7", name:"Fernanda Teran",        rut:"14.567.890-7",  site:"Sura",               date:"29-04-2026", entrada:"07:58", salidaColacion:"12:58", entradaColacion:"13:58", salida:"19:00", horasTrabajadas:"10:17", minutosAtraso:0,  status:"overtime", photoUrl:null },
];

const EMP_DATA: Employee[] = [
  { id:"1", name:"Ivan Alejandro Rojas",  rut:"12.345.678-9",  email:"i.rojas@goalliance.cl",      site:"GO",                 role:"Empleado",       status:"activo",   lastLogin:"hoy 08:11",    hasDevice:true  },
  { id:"2", name:"Isabel Rojas Eneros",   rut:"10.234.567-K",  email:"i.rojas.e@goalliance.cl",    site:"Kaufmann Pajaritos", role:"Empleado",       status:"activo",   lastLogin:"hoy 08:00",    hasDevice:true  },
  { id:"3", name:"Cristian Teran",        rut:"15.678.901-2",  email:"c.teran@goalliance.cl",      site:"GO",                 role:"Empleado",       status:"activo",   lastLogin:"ayer 17:30",   hasDevice:false },
  { id:"4", name:"Marcelo Matamala",      rut:"13.456.789-3",  email:"m.matamala@goalliance.cl",   site:"Soprole Vitacura",   role:"Supervisor",     status:"activo",   lastLogin:"hoy 08:00",    hasDevice:true  },
  { id:"5", name:"Nicolas Sepulveda",     rut:"11.223.344-5",  email:"n.sepulveda@goalliance.cl",  site:"GO",                 role:"Empleado",       status:"activo",   lastLogin:"hoy 08:45",    hasDevice:true  },
  { id:"6", name:"Pablo Sepulveda",       rut:"17.890.123-6",  email:"p.sepulveda@goalliance.cl",  site:"Kaufmann Pajaritos", role:"Empleado",       status:"activo",   lastLogin:"hoy 08:02",    hasDevice:true  },
  { id:"7", name:"Fernanda Teran",        rut:"14.567.890-7",  email:"f.teran@goalliance.cl",      site:"Sura",               role:"Empleado",       status:"activo",   lastLogin:"hoy 07:58",    hasDevice:true  },
  { id:"8", name:"Sofía Herrera Lagos",   rut:"18.901.234-8",  email:"s.herrera@goalliance.cl",    site:"GO",                 role:"Administrador",  status:"activo",   lastLogin:"hoy 07:50",    hasDevice:true  },
  { id:"9", name:"Rodrigo Fuentes Vera",  rut:"16.789.012-9",  email:"r.fuentes@goalliance.cl",    site:"Komatsu",            role:"Empleado",       status:"inactivo", lastLogin:"hace 30 días", hasDevice:false },
];

const SITES_DATA: Site[] = [
  { id:"s1", name:"GO",                 address:"Av. Providencia 1234, Santiago",   lat:-33.4372, lng:-70.6366, radiusMeters:500, employeeCount:4, punchesToday:3, active:true  },
  { id:"s2", name:"Kaufmann Pajaritos", address:"Av. Pajaritos 2000, Maipú",        lat:-33.5100, lng:-70.7500, radiusMeters:500, employeeCount:3, punchesToday:3, active:true  },
  { id:"s3", name:"Soprole Vitacura",   address:"Av. Vitacura 3456, Vitacura",      lat:-33.4050, lng:-70.5980, radiusMeters:500, employeeCount:2, punchesToday:2, active:true  },
  { id:"s4", name:"Sura",               address:"Av. Apoquindo 3000, Las Condes",   lat:-33.4180, lng:-70.5970, radiusMeters:500, employeeCount:1, punchesToday:1, active:true  },
  { id:"s5", name:"Komatsu",            address:"Av. Las Industrias 500, Pudahuel", lat:-33.3900, lng:-70.7800, radiusMeters:500, employeeCount:1, punchesToday:0, active:true  },
  { id:"s6", name:"Soprole renca",      address:"Av. Renca 100, Renca",             lat:-33.3950, lng:-70.7100, radiusMeters:500, employeeCount:0, punchesToday:0, active:false },
];

const WEEKLY = [
  { day:"Lun", present:82, late:8,  absent:10 },
  { day:"Mar", present:90, late:5,  absent:5  },
  { day:"Mié", present:78, late:12, absent:10 },
  { day:"Jue", present:86, late:7,  absent:7  },
  { day:"Vie", present:94, late:3,  absent:3  },
];

const RECENT_PUNCHES = [
  { name:"Isabel Rojas",    type:"salida",   time:"18:00", site:"Kaufmann Pajaritos" },
  { name:"Fernanda Teran",  type:"salida",   time:"19:00", site:"Sura"               },
  { name:"Pablo Sepulveda", type:"salida",   time:"17:32", site:"Kaufmann Pajaritos" },
  { name:"Ivan Rojas",      type:"salida",   time:"17:35", site:"GO"                 },
  { name:"Nicolas Sepulveda", type:"salida", time:"17:40", site:"GO"                 },
];

const SITES    = ["Todos", "GO", "Kaufmann Pajaritos", "Soprole Vitacura", "Sura", "Komatsu"];
const ATT_STATUS_META = {
  on_time:  { label:"A tiempo",  bg:"#ecfdf5", color:"#065f46", dot:"#10b981" },
  late:     { label:"Atraso",    bg:"#fff7ed", color:"#92400e", dot:"#f59e0b" },
  absent:   { label:"Ausente",   bg:"#fef2f2", color:"#991b1b", dot:"#ef4444" },
  overtime: { label:"H. Extra",  bg:"#eff6ff", color:"#1e40af", dot:"#2989d8" },
};

const NAV_ITEMS: { id: ViewId; label: string; icon: string }[] = [
  { id:"dashboard",  label:"Dashboard",  icon:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id:"asistencia", label:"Asistencia", icon:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { id:"empleados",  label:"Empleados",  icon:"M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { id:"sitios",     label:"Sitios",     icon:"M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
  { id:"reportes",   label:"Reportes",   icon:"M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { id:"ajustes",    label:"Ajustes",    icon:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

// ─── Shared Components ────────────────────────────────────────────────────────

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").slice(0, 2).map((n) => n[0]).join("");
  const s = size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  return (
    <div className={`${s} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
         style={{ background: G.soft }}>{initials}</div>
  );
}

function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function PrimaryBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all active:scale-95"
      style={{ background: G.btn, boxShadow: "0 4px 14px rgba(41,137,216,0.3)" }}>
      {children}
    </button>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────────

function DashboardView() {
  const total    = EMP_DATA.filter((e) => e.status === "activo").length;
  const present  = ATT_DATA.filter((r) => r.status !== "absent").length;
  const absent   = ATT_DATA.filter((r) => r.status === "absent").length;
  const alerts   = ATT_DATA.filter((r) => r.minutosAtraso > 30).length;

  const KPIS = [
    { label:"Empleados activos", value:total,   sub:"en plataforma",   color:"#2989d8", icon:"M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" },
    { label:"Presentes hoy",     value:present,  sub:"con marcación",   color:"#10b981", icon:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label:"Ausentes hoy",      value:absent,   sub:"sin marcación",   color:"#ef4444", icon:"M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label:"Alertas activas",   value:alerts,   sub:"atraso >30 min",  color:"#f59e0b", icon:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  ];

  const maxVal = Math.max(...WEEKLY.map((w) => w.present));

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {KPIS.map(({ label, value, sub, color, icon }) => (
          <Card key={label} className="px-5 py-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: `${color}18` }}>
              <svg className="w-5 h-5" fill="none" stroke={color} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon}/>
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-none tabular-nums">{value}</p>
              <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
              <p className="text-[10px] text-gray-400">{sub}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Gráfico semanal */}
        <Card className="col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-semibold text-gray-900">Asistencia semanal</p>
              <p className="text-xs text-gray-400 mt-0.5">Semana del 28 abr – 02 may 2026</p>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              {[{ color:"#2989d8", label:"Presentes" }, { color:"#f59e0b", label:"Atrasos" }, { color:"#ef4444", label:"Ausentes" }].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }}/>
                  <span className="text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-3 h-40">
            {WEEKLY.map(({ day, present, late, absent }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex flex-col gap-0.5 items-stretch"
                     style={{ height: "148px", justifyContent: "flex-end" }}>
                  {/* stacked bars */}
                  <div className="w-full rounded-sm" style={{ height: `${(absent / maxVal) * 130}px`, background: "#fecaca", minHeight: absent > 0 ? 4 : 0 }}/>
                  <div className="w-full rounded-sm" style={{ height: `${(late   / maxVal) * 130}px`, background: "#fde68a", minHeight: late   > 0 ? 4 : 0 }}/>
                  <div className="w-full rounded-t-md" style={{ height: `${(present / maxVal) * 130}px`, background: G.btn }}/>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">{day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Panel lateral */}
        <div className="flex flex-col gap-4">
          {/* Estado por sitio */}
          <Card className="p-4 flex-1">
            <p className="text-sm font-semibold text-gray-900 mb-3">Asistencia por sitio</p>
            <div className="flex flex-col gap-3">
              {SITES_DATA.filter((s) => s.active).map((site) => {
                const pct = Math.round((site.punchesToday / site.employeeCount) * 100);
                return (
                  <div key={site.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 font-medium">{site.name}</span>
                      <span className="text-xs font-semibold tabular-nums" style={{ color:"#2989d8" }}>
                        {site.punchesToday}/{site.employeeCount}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                           style={{ width: `${pct}%`, background: G.btn }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Actividad reciente */}
          <Card className="p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">Última actividad</p>
            <div className="flex flex-col gap-2">
              {RECENT_PUNCHES.map((p, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Avatar name={p.name} size="sm"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{p.name.split(" ")[0]}</p>
                    <p className="text-[10px] text-gray-400 truncate capitalize">{p.type} · {p.site.split(" ")[0]}</p>
                  </div>
                  <span className="text-[10px] font-mono font-semibold" style={{ color:"#2989d8" }}>{p.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Tabla resumen hoy */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Resumen de hoy</p>
          <span className="text-[11px] text-gray-400">Miércoles 29 abr 2026</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["Empleado","Sitio","Entrada","Salida","HT","Estado"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ATT_DATA.slice(0, 5).map((r) => {
                const s = ATT_STATUS_META[r.status];
                return (
                  <tr key={r.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2"><Avatar name={r.name}/><span className="font-medium text-gray-800">{r.name.split(" ").slice(0,2).join(" ")}</span></div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{r.site}</td>
                    <td className="px-4 py-3 font-mono font-medium" style={{ color: r.entrada ? "#1e5799" : "#d1d5db" }}>{r.entrada ?? "—"}</td>
                    <td className="px-4 py-3 font-mono font-medium" style={{ color: r.salida  ? "#1e5799" : "#d1d5db" }}>{r.salida  ?? "—"}</td>
                    <td className="px-4 py-3 font-mono font-bold text-gray-700">{r.horasTrabajadas ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full w-fit"
                            style={{ background:s.bg, color:s.color }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background:s.dot }}/>
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Asistencia View ──────────────────────────────────────────────────────────

type AuditCard = { url: string; name: string; time: string; x: number; y: number };

function AsistenciaView() {
  const [search,     setSearch]     = useState("");
  const [site,       setSite]       = useState("Todos");
  const [status,     setStatus]     = useState("all");
  const [dateFrom,   setDateFrom]   = useState("2026-04-01");
  const [dateTo,     setDateTo]     = useState("2026-04-30");
  const [page,       setPage]       = useState(1);
  const [auditCard,  setAuditCard]  = useState<AuditCard | null>(null);
  const PAGE = 10;

  const filtered = useMemo(() => ATT_DATA.filter((r) => {
    const ms   = r.name.toLowerCase().includes(search.toLowerCase()) || r.rut.includes(search);
    const mSite = site   === "Todos" || r.site === site;
    const mSt  = status === "all"   || r.status === status;
    return ms && mSite && mSt;
  }), [search, site, status]);

  const paginated  = filtered.slice((page - 1) * PAGE, page * PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));

  const handleExport = () => {
    const header = ["Nombre","RUT","Sitio","Fecha","Entrada","Sal.Col","Ent.Col","Salida","HT","Atraso(min)","Estado"];
    const rows = filtered.map((r) => [
      r.name, r.rut, r.site, r.date,
      r.entrada ?? "—", r.salidaColacion ?? "—", r.entradaColacion ?? "—", r.salida ?? "—",
      r.horasTrabajadas ?? "—", r.minutosAtraso, ATT_STATUS_META[r.status].label,
    ].join(","));
    const blob = new Blob([[header.join(","), ...rows].join("\n")], { type:"text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `asistencia_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  const inputCls = "border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 text-gray-700 focus:outline-none w-full";

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* KPI mini */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:"Presentes",  v:filtered.filter(r=>r.status!=="absent").length,  color:"#10b981" },
          { label:"Ausentes",   v:filtered.filter(r=>r.status==="absent").length,   color:"#ef4444" },
          { label:"Con atraso", v:filtered.filter(r=>r.status==="late").length,     color:"#f59e0b" },
          { label:"Horas extra",v:filtered.filter(r=>r.status==="overtime").length, color:"#2989d8" },
        ].map(({ label, v, color }) => (
          <Card key={label} className="px-5 py-4 flex items-center gap-3">
            <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background:color }}/>
            <div>
              <p className="text-xl font-bold text-gray-900 tabular-nums">{v}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card className="px-5 py-4 flex flex-wrap gap-3 items-end">
        {[
          { label:"Desde", el:<input type="date" value={dateFrom} onChange={(e)=>{setDateFrom(e.target.value);setPage(1);}} className={inputCls}/> },
          { label:"Hasta", el:<input type="date" value={dateTo}   onChange={(e)=>{setDateTo(e.target.value);setPage(1);}}   className={inputCls}/> },
          { label:"Sitio", el:<select value={site} onChange={(e)=>{setSite(e.target.value);setPage(1);}} className={inputCls}>{SITES.map(s=><option key={s}>{s}</option>)}</select> },
          { label:"Estado",el:<select value={status} onChange={(e)=>{setStatus(e.target.value);setPage(1);}} className={inputCls}>
            <option value="all">Todos</option><option value="on_time">A tiempo</option>
            <option value="late">Atraso</option><option value="absent">Ausente</option><option value="overtime">H. Extra</option>
          </select> },
        ].map(({ label, el }) => (
          <div key={label} className="flex flex-col gap-1 min-w-[140px]"><label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>{el}</div>
        ))}
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Buscar</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Nombre o RUT" value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}} className={`${inputCls} pl-9`}/>
          </div>
        </div>
        <div className="flex items-end">
          <PrimaryBtn onClick={handleExport}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Exportar .xlsx
          </PrimaryBtn>
        </div>
      </Card>

      {/* Tabla */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background:"linear-gradient(to right, #f8fafc, #eff6ff)" }}>
                {["Empleado","RUT","Sitio","Fecha","Entrada","Sal. Col.","Ent. Col.","Salida","H. Trab.","Atraso","Estado","Verificación"].map((h) => (
                  <th key={h} className="text-left px-4 py-3.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr><td colSpan={12} className="px-4 py-12 text-center text-gray-400 text-sm">Sin resultados</td></tr>
              ) : paginated.map((r) => {
                const s = ATT_STATUS_META[r.status];
                return (
                  <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3.5"><div className="flex items-center gap-2.5"><Avatar name={r.name}/><span className="font-medium text-gray-800 whitespace-nowrap text-xs">{r.name}</span></div></td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">{r.rut}</td>
                    <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">{r.site}</td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">{r.date}</td>
                    <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap font-medium" style={{ color:r.entrada?"#1e5799":"#d1d5db" }}>{r.entrada??"—"}</td>
                    <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap text-gray-500">{r.salidaColacion??"—"}</td>
                    <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap text-gray-500">{r.entradaColacion??"—"}</td>
                    <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap font-medium" style={{ color:r.salida?"#1e5799":"#d1d5db" }}>{r.salida??"—"}</td>
                    <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap font-bold text-gray-800">{r.horasTrabajadas??"—"}</td>
                    <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                      {r.minutosAtraso>0?<span className="font-medium" style={{color:"#f59e0b"}}>{r.minutosAtraso} min</span>:<span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full w-fit" style={{ background:s.bg, color:s.color }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:s.dot }}/>{s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {r.photoUrl ? (
                        <img
                          src={r.photoUrl}
                          alt={r.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-md cursor-pointer transition-transform hover:scale-110 grayscale"
                          onMouseEnter={(e) => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setAuditCard({ url: r.photoUrl!, name: r.name, time: r.entrada ?? "", x: rect.right + 12, y: rect.top });
                          }}
                          onMouseLeave={() => setAuditCard(null)}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-400">{filtered.length} registro{filtered.length!==1?"s":""}</p>
          <div className="flex items-center gap-2">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50">← Ant.</button>
            <span className="text-xs font-medium text-gray-500 px-2">{page} / {totalPages}</span>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 bg-white disabled:opacity-40 hover:bg-gray-50">Sig. →</button>
          </div>
        </div>
      </Card>

      {/* Audit hover-card glassmorphism */}
      {auditCard && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: auditCard.x, top: Math.min(auditCard.y - 80, window.innerHeight - 320) }}
        >
          <div style={{
            background: "rgba(7,15,30,0.55)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "20px",
            boxShadow: "0 12px 48px rgba(7,15,30,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
            padding: "14px",
            width: "212px",
          }}>
            <img
              src={auditCard.url}
              alt="Verificación"
              style={{ width:"184px", height:"184px", borderRadius:"12px", objectFit:"cover", display:"block", filter:"grayscale(1)" }}
            />
            <div style={{ marginTop:"10px" }}>
              <p style={{ color:"#fff", fontSize:"12px", fontWeight:600, margin:0, lineHeight:1.3 }}>
                {auditCard.name.split(" ").slice(0,2).join(" ")}
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:"6px", marginTop:"4px" }}>
                <span style={{
                  background:"rgba(16,185,129,0.2)",
                  border:"1px solid rgba(16,185,129,0.4)",
                  color:"#34d399",
                  fontSize:"10px",
                  fontWeight:600,
                  padding:"2px 8px",
                  borderRadius:"999px",
                }}>Selfie marcación</span>
                {auditCard.time && (
                  <span style={{ color:"rgba(255,255,255,0.45)", fontSize:"10px", fontFamily:"monospace" }}>
                    {auditCard.time}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Empleados View ───────────────────────────────────────────────────────────

type EmpSubView = "list" | "form";

interface EmpForm {
  name: string; rut: string; email: string;
  site: string; role: string; status: EmpStatus;
}

const EMPTY_FORM: EmpForm = { name:"", rut:"", email:"", site:"GO", role:"Empleado", status:"activo" };

function EmpleadosView() {
  const [subView,    setSubView]    = useState<EmpSubView>("list");
  const [employees,  setEmployees]  = useState<Employee[]>(EMP_DATA);
  const [editing,    setEditing]    = useState<Employee | null>(null);
  const [form,       setForm]       = useState<EmpForm>(EMPTY_FORM);
  const [search,     setSearch]     = useState("");
  const [siteF,      setSiteF]      = useState("Todos");
  const [statusF,    setStatusF]    = useState("all");
  const [delConfirm, setDelConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => employees.filter((e) => {
    const ms    = e.name.toLowerCase().includes(search.toLowerCase()) || e.rut.includes(search);
    const mSite = siteF   === "Todos" || e.site === siteF;
    const mSt   = statusF === "all"   || e.status === statusF;
    return ms && mSite && mSt;
  }), [employees, search, siteF, statusF]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSubView("form");
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({ name:emp.name, rut:emp.rut, email:emp.email, site:emp.site, role:emp.role, status:emp.status });
    setSubView("form");
  };

  const saveForm = () => {
    if (editing) {
      setEmployees(prev => prev.map(e => e.id === editing.id ? { ...e, ...form } : e));
    } else {
      setEmployees(prev => [...prev, {
        id: String(Date.now()), ...form,
        lastLogin:"Nunca", hasDevice:false,
      }]);
    }
    setSubView("list");
  };

  const toggleStatus = (id: string) =>
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, status: e.status === "activo" ? "inactivo" : "activo" } : e));

  const deleteEmp = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setDelConfirm(null);
  };

  const inputCls = "border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 text-gray-700 focus:outline-none focus:border-blue-400 transition-colors w-full";

  // ── Form sub-view ──────────────────────────────────────────────────────────
  if (subView === "form") {
    const isNew = !editing;
    return (
      <div className="p-6 flex flex-col gap-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <button onClick={()=>setSubView("list")}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color:"#2989d8" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Empleados
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-700">
            {isNew ? "Nuevo empleado" : `Editar · ${editing!.name.split(" ").slice(0,2).join(" ")}`}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Form card */}
          <Card className="col-span-2 p-6 flex flex-col gap-5">
            <p className="text-sm font-semibold text-gray-900">Datos personales</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Nombre completo</label>
                <input type="text" placeholder="Cristian Florez Revilla" value={form.name}
                  onChange={e=>setForm(f=>({...f,name:e.target.value}))} className={inputCls}/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">RUT</label>
                <input type="text" placeholder="12.345.678-9" value={form.rut}
                  onChange={e=>setForm(f=>({...f,rut:e.target.value}))} className={inputCls}/>
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Correo electrónico</label>
                <input type="email" placeholder="c.florez@goalliance.cl" value={form.email}
                  onChange={e=>setForm(f=>({...f,email:e.target.value}))} className={inputCls}/>
              </div>
            </div>

            <div className="pt-1" style={{ borderTop:"1px solid #f1f5f9" }}>
              <p className="text-sm font-semibold text-gray-900 mb-4">Asignación</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Sitio</label>
                  <select value={form.site} onChange={e=>setForm(f=>({...f,site:e.target.value}))} className={inputCls}>
                    {SITES.filter(s=>s!=="Todos").map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Rol</label>
                  <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} className={inputCls}>
                    {["Empleado","Supervisor","Administrador"].map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Estado</label>
                  <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as EmpStatus}))} className={inputCls}>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2" style={{ borderTop:"1px solid #f1f5f9" }}>
              <PrimaryBtn onClick={saveForm}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
                {isNew ? "Crear empleado" : "Guardar cambios"}
              </PrimaryBtn>
              <button onClick={()=>setSubView("list")}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </div>
          </Card>

          {/* Info lateral */}
          <div className="flex flex-col gap-4">
            {!isNew && (
              <Card className="p-5 flex flex-col gap-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Información</p>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Último acceso</span>
                    <span className="font-medium text-gray-700">{editing!.lastLogin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Passkey</span>
                    <span className={editing!.hasDevice ? "text-emerald-600 font-medium" : "text-gray-300"}>
                      {editing!.hasDevice ? "Registrada" : "Sin passkey"}
                    </span>
                  </div>
                </div>
              </Card>
            )}
            <Card className="p-5 flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Roles disponibles</p>
              {[
                { r:"Empleado",      desc:"Acceso solo a marcaje móvil" },
                { r:"Supervisor",    desc:"Ve asistencia de su sitio"    },
                { r:"Administrador", desc:"Acceso completo al panel"     },
              ].map(({r,desc})=>(
                <div key={r} className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-gray-700">{r}</span>
                  <span className="text-[10px] text-gray-400">{desc}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── List sub-view ──────────────────────────────────────────────────────────
  return (
    <div className="p-6 flex flex-col gap-5">
      <SectionHeader
        title="Empleados"
        sub={`${employees.filter(e=>e.status==="activo").length} activos · ${employees.filter(e=>e.status==="inactivo").length} inactivos`}
        action={
          <PrimaryBtn onClick={openCreate}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Nuevo empleado
          </PrimaryBtn>
        }
      />

      {/* Filtros */}
      <Card className="px-5 py-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Buscar</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Nombre o RUT" value={search} onChange={(e)=>setSearch(e.target.value)} className={`${inputCls} pl-9`}/>
          </div>
        </div>
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Sitio</label>
          <select value={siteF} onChange={(e)=>setSiteF(e.target.value)} className={inputCls}>{SITES.map(s=><option key={s}>{s}</option>)}</select>
        </div>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Estado</label>
          <select value={statusF} onChange={(e)=>setStatusF(e.target.value)} className={inputCls}>
            <option value="all">Todos</option><option value="activo">Activos</option><option value="inactivo">Inactivos</option>
          </select>
        </div>
      </Card>

      {/* Tabla empleados */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background:"linear-gradient(to right, #f8fafc, #eff6ff)" }}>
                {["Empleado","RUT","Sitio","Rol","Dispositivo","Último acceso","Estado","Acciones"].map((h) => (
                  <th key={h} className="text-left px-4 py-3.5 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">Sin resultados</td></tr>
              ) : filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={emp.name}/>
                      <div>
                        <p className="font-medium text-gray-800 text-xs whitespace-nowrap">{emp.name}</p>
                        <p className="text-gray-400 text-[10px]">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">{emp.rut}</td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">{emp.site}</td>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                          style={{ background:"rgba(41,137,216,0.08)", color:"#1e5799" }}>{emp.role}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                    {emp.hasDevice
                      ? <span className="flex items-center gap-1 text-emerald-600"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Registrado</span>
                      : <span className="text-gray-300 text-[10px]">Sin passkey</span>}
                  </td>
                  <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">{emp.lastLogin}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full w-fit
                      ${emp.status==="activo" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${emp.status==="activo" ? "bg-emerald-500" : "bg-gray-300"}`}/>
                      {emp.status==="activo" ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button onClick={()=>openEdit(emp)}
                        className="text-xs font-medium transition-colors" style={{ color:"#2989d8" }}
                        onMouseEnter={(e)=>((e.target as HTMLElement).style.color="#1e5799")}
                        onMouseLeave={(e)=>((e.target as HTMLElement).style.color="#2989d8")}>Editar</button>
                      <span className="text-gray-200">·</span>
                      <button onClick={()=>toggleStatus(emp.id)}
                        className="text-xs font-medium text-gray-400 hover:text-amber-500 transition-colors">
                        {emp.status==="activo" ? "Desactivar" : "Activar"}
                      </button>
                      <span className="text-gray-200">·</span>
                      {delConfirm === emp.id ? (
                        <span className="flex items-center gap-1">
                          <button onClick={()=>deleteEmp(emp.id)}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">Confirmar</button>
                          <span className="text-gray-200">·</span>
                          <button onClick={()=>setDelConfirm(null)}
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors">No</button>
                        </span>
                      ) : (
                        <button onClick={()=>setDelConfirm(emp.id)}
                          className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors">Eliminar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-50">
          <p className="text-xs text-gray-400">{filtered.length} empleado{filtered.length!==1?"s":""}</p>
        </div>
      </Card>
    </div>
  );
}

// ─── Sitios View ──────────────────────────────────────────────────────────────

function SitiosView() {
  const [sites, setSites] = useState(SITES_DATA);

  const toggle = (id: string) =>
    setSites((prev) => prev.map((s) => s.id === id ? { ...s, active: !s.active } : s));

  return (
    <div className="p-6 flex flex-col gap-5">
      <SectionHeader
        title="Sitios de trabajo"
        sub={`${sites.filter(s=>s.active).length} activos · ${sites.filter(s=>!s.active).length} inactivos`}
        action={
          <PrimaryBtn>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Nuevo sitio
          </PrimaryBtn>
        }
      />

      <div className="grid grid-cols-2 gap-4">
        {sites.map((site) => (
          <Card key={site.id} className="p-5 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background:site.active?"rgba(41,137,216,0.10)":"#f1f5f9", border:`1px solid ${site.active?"rgba(41,137,216,0.2)":"#e2e8f0"}` }}>
                  <svg className="w-5 h-5" fill="none" stroke={site.active?"#2989d8":"#94a3b8"} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{site.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{site.address}</p>
                </div>
              </div>
              <button onClick={()=>toggle(site.id)}
                className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${site.active?"":"opacity-60"}`}
                style={{ background:site.active?G.btn:"#e2e8f0" }}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${site.active?"left-5":"left-0.5"}`}/>
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 pt-3" style={{ borderTop:"1px solid #f1f5f9" }}>
              {[
                { label:"Empleados",  value:site.employeeCount },
                { label:"Hoy",        value:site.punchesToday },
                { label:"Radio (m)",  value:site.radiusMeters },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-lg font-bold tabular-nums" style={{ color:site.active?"#1e5799":"#94a3b8" }}>{value}</p>
                  <p className="text-[10px] text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            {/* Coords */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-mono text-gray-400">
                {site.lat.toFixed(4)}, {site.lng.toFixed(4)}
              </p>
              <div className="flex gap-2">
                <button className="text-xs font-medium transition-colors" style={{ color:"#2989d8" }}>Editar</button>
                <span className="text-gray-200">·</span>
                <button className="text-xs font-medium text-gray-400 hover:text-blue-500 transition-colors">Ver mapa</button>
              </div>
            </div>

            {/* Attendance bar */}
            {site.active && site.employeeCount > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-400">Asistencia hoy</span>
                  <span className="text-[10px] font-semibold" style={{ color:"#2989d8" }}>
                    {Math.round((site.punchesToday/site.employeeCount)*100)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100">
                  <div className="h-full rounded-full" style={{ width:`${(site.punchesToday/site.employeeCount)*100}%`, background:G.btn }}/>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Reportes View ────────────────────────────────────────────────────────────

function ReportesView() {
  const [type,      setType]      = useState<"diario"|"semanal"|"mensual">("mensual");
  const [site,      setSite]      = useState("Todos");
  const [dateFrom,  setDateFrom]  = useState("2026-04-01");
  const [dateTo,    setDateTo]    = useState("2026-04-30");
  const [generated, setGenerated] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const generate = async () => {
    setLoading(true); setGenerated(false);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false); setGenerated(true);
  };

  const inputCls = "border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-700 focus:outline-none w-full";

  return (
    <div className="p-6 flex flex-col gap-5">
      <SectionHeader title="Generación de reportes" sub="Exporta datos de asistencia en formato Excel o CSV"/>

      <div className="grid grid-cols-3 gap-5">
        {/* Panel de configuración */}
        <Card className="p-5 flex flex-col gap-4">
          <p className="text-sm font-semibold text-gray-900">Configuración</p>

          {/* Tipo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tipo de reporte</label>
            <div className="flex flex-col gap-2">
              {(["diario","semanal","mensual"] as const).map((t) => (
                <label key={t} className="flex items-center gap-2.5 cursor-pointer">
                  <div onClick={()=>setType(t)}
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{ borderColor:type===t?"#2989d8":"#d1d5db" }}>
                    {type===t && <div className="w-2 h-2 rounded-full" style={{ background:"#2989d8" }}/>}
                  </div>
                  <span className="text-sm text-gray-600 capitalize">{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rango */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Rango de fechas</label>
            <input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} className={inputCls}/>
            <input type="date" value={dateTo}   onChange={(e)=>setDateTo(e.target.value)}   className={inputCls}/>
          </div>

          {/* Sitio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Sitio</label>
            <select value={site} onChange={(e)=>setSite(e.target.value)} className={inputCls}>
              {SITES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>

          <button onClick={generate} disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60"
            style={{ background:G.btn, boxShadow:"0 4px 14px rgba(41,137,216,0.3)" }}>
            {loading ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generando...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>Generar reporte</>
            )}
          </button>
        </Card>

        {/* Panel de resultado */}
        <div className="col-span-2 flex flex-col gap-4">
          {!generated && !loading && (
            <Card className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                   style={{ background:"rgba(41,137,216,0.08)" }}>
                <svg className="w-7 h-7" fill="none" stroke="#2989d8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">Configura y genera el reporte</p>
              <p className="text-xs text-gray-300 text-center max-w-xs">
                Selecciona el tipo, rango de fechas y sitio en el panel izquierdo
              </p>
            </Card>
          )}

          {generated && (
            <>
              {/* Acciones de descarga */}
              <Card className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Reporte listo</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {type.charAt(0).toUpperCase()+type.slice(1)} · {site} · {dateFrom} → {dateTo}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border transition-all hover:bg-gray-50"
                          style={{ borderColor:"#2989d8", color:"#2989d8" }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    CSV
                  </button>
                  <PrimaryBtn>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    Excel .xlsx
                  </PrimaryBtn>
                </div>
              </Card>

              {/* Nota arquitectura S3 */}
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs"
                   style={{ background:"rgba(41,137,216,0.06)", border:"1px solid rgba(41,137,216,0.15)", color:"#1e5799" }}>
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                El archivo .xlsx se genera vía <strong className="mx-1">GET /reports/export</strong> y se sirve como presigned URL de S3 con TTL de 15 minutos.
              </div>

              {/* Preview tabla */}
              <Card className="overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-700">Vista previa ({ATT_DATA.length} registros)</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background:"#f8fafc" }}>
                        {["Empleado","RUT","Sitio","Entrada","Salida","HT","Atraso","Estado"].map(h=>(
                          <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {ATT_DATA.map((r) => {
                        const s = ATT_STATUS_META[r.status];
                        return (
                          <tr key={r.id} className="hover:bg-blue-50/20">
                            <td className="px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">{r.name.split(" ").slice(0,2).join(" ")}</td>
                            <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{r.rut}</td>
                            <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{r.site}</td>
                            <td className="px-4 py-2.5 font-mono font-medium whitespace-nowrap" style={{ color:r.entrada?"#1e5799":"#d1d5db" }}>{r.entrada??"—"}</td>
                            <td className="px-4 py-2.5 font-mono font-medium whitespace-nowrap" style={{ color:r.salida?"#1e5799":"#d1d5db" }}>{r.salida??"—"}</td>
                            <td className="px-4 py-2.5 font-mono font-bold text-gray-700 whitespace-nowrap">{r.horasTrabajadas??"—"}</td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              {r.minutosAtraso>0?<span style={{color:"#f59e0b"}} className="font-medium">{r.minutosAtraso}m</span>:<span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold" style={{ background:s.bg, color:s.color }}>{s.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Ajustes View ─────────────────────────────────────────────────────────────

function AjustesView() {
  type SettingsTab = "empresa" | "turnos" | "integraciones";
  const [tab, setTab] = useState<SettingsTab>("empresa");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaved(false);
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputCls = "border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-700 focus:outline-none focus:border-blue-400 transition-colors w-full";
  const TABS: { id: SettingsTab; label: string }[] = [
    { id:"empresa",       label:"Empresa"       },
    { id:"turnos",        label:"Turnos"        },
    { id:"integraciones", label:"Integraciones" },
  ];

  return (
    <div className="p-6 flex flex-col gap-5">
      <SectionHeader title="Ajustes" sub="Configuración global de la plataforma"/>

      <div className="flex gap-5">
        {/* Tab sidebar */}
        <div className="w-44 flex-shrink-0 flex flex-col gap-1">
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={()=>setTab(id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${tab===id ? "text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}
              style={tab===id ? { background:G.btn } : {}}>
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <Card className="flex-1 p-6">
          {tab === "empresa" && (
            <div className="flex flex-col gap-5 max-w-md">
              <p className="text-sm font-semibold text-gray-900">Información de la empresa</p>
              {[
                { label:"Nombre empresa",    placeholder:"Go tecnologia",           type:"text"  },
                { label:"RUT empresa",       placeholder:"76.123.456-7",            type:"text"  },
                { label:"Correo de contacto",placeholder:"admin@goalliance.cl",    type:"email" },
                { label:"Teléfono",          placeholder:"+56 2 2345 6789",         type:"tel"   },
              ].map(({ label, placeholder, type }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
                  <input type={type} defaultValue={placeholder} className={inputCls}/>
                </div>
              ))}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Zona horaria</label>
                <select className={inputCls} defaultValue="America/Santiago">
                  <option value="America/Santiago">América/Santiago (UTC-4)</option>
                  <option value="America/Lima">América/Lima (UTC-5)</option>
                  <option value="America/Bogota">América/Bogotá (UTC-5)</option>
                </select>
              </div>
            </div>
          )}

          {tab === "turnos" && (
            <div className="flex flex-col gap-5 max-w-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Turnos configurados</p>
                <PrimaryBtn>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  Nuevo turno
                </PrimaryBtn>
              </div>
              {[
                { name:"Turno Mañana",   start:"08:00", end:"17:30", break:60 },
                { name:"Turno Tarde",    start:"14:00", end:"22:00", break:45 },
                { name:"Turno Noche",    start:"22:00", end:"06:00", break:30 },
              ].map(({ name, start, end, break: b }) => (
                <div key={name} className="flex items-center gap-4 p-4 rounded-xl"
                     style={{ border:"1px solid #E4EDF6", background:"#FAFBFF" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                       style={{ background:"rgba(41,137,216,0.08)" }}>
                    <svg className="w-4.5 h-4.5" fill="none" stroke="#2989d8" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{name}</p>
                    <p className="text-xs text-gray-400 font-mono">{start} – {end} · {b} min colación</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button className="font-medium transition-colors" style={{ color:"#2989d8" }}>Editar</button>
                    <span className="text-gray-200">·</span>
                    <button className="font-medium text-red-400 hover:text-red-600 transition-colors">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "integraciones" && (
            <div className="flex flex-col gap-5 max-w-md">
              <p className="text-sm font-semibold text-gray-900">API & Servicios externos</p>
              {[
                { label:"API Key",              value:"gk_live_••••••••••••••••XK9m" },
                { label:"S3 Bucket (reportes)", value:"gotest-reports"               },
                { label:"S3 Bucket (fotos)",    value:"gotest-punches"               },
                { label:"Webhook URL",          value:"https://hooks.empresa.cl/gotest" },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
                  <div className="relative">
                    <input type="text" defaultValue={value} className={`${inputCls} font-mono pr-20`}/>
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors"
                            style={{ background:"rgba(41,137,216,0.08)", color:"#2989d8" }}>Copiar</button>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs"
                   style={{ background:"rgba(41,137,216,0.06)", border:"1px solid rgba(41,137,216,0.15)", color:"#1e5799" }}>
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Las fotos de marcación se suben directamente a S3 vía presigned URL. Lambda no procesa binarios.
              </div>
            </div>
          )}

          {/* Save btn */}
          <div className="flex items-center gap-3 mt-6 pt-5" style={{ borderTop:"1px solid #f1f5f9" }}>
            <PrimaryBtn onClick={save}>
              {saved
                ? <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>Guardado</>
                : "Guardar cambios"
              }
            </PrimaryBtn>
            {saved && <span className="text-xs text-emerald-600 font-medium">Cambios aplicados</span>}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<ViewId>("dashboard");

  const PAGE_TITLES: Record<ViewId, { title: string; sub: string }> = {
    dashboard:  { title:"Dashboard",            sub:"Resumen general · 29 abr 2026"          },
    asistencia: { title:"Control de Asistencia", sub:"Miércoles 29, abr 2026"                },
    empleados:  { title:"Empleados",             sub:`${EMP_DATA.length} personas en plataforma` },
    sitios:     { title:"Sitios de trabajo",     sub:`${SITES_DATA.length} sitios configurados`   },
    reportes:   { title:"Reportes",              sub:"Generación y exportación de datos"      },
    ajustes:    { title:"Ajustes",               sub:"Configuración de la plataforma"         },
  };

  const { title, sub } = PAGE_TITLES[activeView];

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden" style={{ fontFamily:"Poppins, sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background:G.nav }}>
        {/* Logo + dot grid accent */}
        <div className="px-5 py-5 relative overflow-hidden" style={{ borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage:"radial-gradient(circle, rgba(41,137,216,0.15) 1px, transparent 1px)",
            backgroundSize:"20px 20px",
          }}/>
          <img src="/logo.png" alt="GO Tecnología" className="relative z-10 h-9 w-auto object-contain brightness-0 invert opacity-90"/>
        </div>

        <nav className="px-3 py-3 flex-1 overflow-y-auto">
          <p className="text-white/25 text-[9px] font-bold tracking-[0.2em] uppercase px-3 mb-2 mt-1">Navegación</p>
          {NAV_ITEMS.map(({ id, label, icon }) => {
            const active = activeView === id;
            return (
              <button key={id} onClick={()=>setActiveView(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left mb-0.5 transition-all
                  ${active ? "text-white font-medium" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}
                style={active ? { background:G.btn } : {}}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon}/>
                </svg>
                {label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4" style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                 style={{ background:G.btn }}>AD</div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-medium truncate">Administrador</p>
              <p className="text-white/30 text-[10px] truncate">admin@goalliance.cl</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Header sticky */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-7 w-0.5 rounded-full" style={{ background:G.btn }}/>
            <div>
              <h1 className="text-base font-semibold text-gray-900">{title}</h1>
              <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notificaciones mock */}
            <button className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-50"
                    style={{ border:"1px solid #E4EDF6" }}>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500"/>
            </button>
            <Avatar name="Administrador" size="sm"/>
          </div>
        </header>

        {/* View content */}
        {activeView === "dashboard"  && <DashboardView/>}
        {activeView === "asistencia" && <AsistenciaView/>}
        {activeView === "empleados"  && <EmpleadosView/>}
        {activeView === "sitios"     && <SitiosView/>}
        {activeView === "reportes"   && <ReportesView/>}
        {activeView === "ajustes"    && <AjustesView/>}
      </main>
    </div>
  );
}
