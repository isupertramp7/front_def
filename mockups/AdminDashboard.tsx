"use client";

import { useState, useMemo } from "react";

const G = {
  full:  'linear-gradient(to bottom, #1e5799 0%, #2989d8 50%, #207cca 51%, #7db9e8 100%)',
  btn:   'linear-gradient(135deg, #1e5799 0%, #2989d8 100%)',
  soft:  'linear-gradient(135deg, #2989d8 0%, #7db9e8 100%)',
  nav:   'linear-gradient(to bottom, #0c1e3c 0%, #1a3a6b 100%)',
} as const;

interface Record {
  id: string; name: string; rut: string; site: string; date: string;
  entrada: string | null; salidaColacion: string | null;
  entradaColacion: string | null; salida: string | null;
  horasTrabajadas: string | null; minutosAtraso: number;
  status: "on_time" | "late" | "absent" | "overtime";
}

const DATA: Record[] = [
  { id:"1", name:"Cristian Florez Revilla",  rut:"12.345.678-9",  site:"Casa Matriz",   date:"29-04-2026", entrada:"08:41", salidaColacion:"14:26", entradaColacion:"15:13", salida:"18:05", horasTrabajadas:"08:45", minutosAtraso:11, status:"late" },
  { id:"2", name:"María González Silva",     rut:"10.234.567-K",  site:"Sucursal Norte",date:"29-04-2026", entrada:"08:29", salidaColacion:"13:00", entradaColacion:"13:45", salida:"18:00", horasTrabajadas:"09:16", minutosAtraso:0,  status:"overtime" },
  { id:"3", name:"Pedro Ramírez Torres",     rut:"15.678.901-2",  site:"Casa Matriz",   date:"29-04-2026", entrada:null,    salidaColacion:null,    entradaColacion:null,    salida:null,    horasTrabajadas:null,    minutosAtraso:0,  status:"absent" },
  { id:"4", name:"Ana López Muñoz",          rut:"13.456.789-3",  site:"Sucursal Sur",  date:"29-04-2026", entrada:"08:30", salidaColacion:"13:15", entradaColacion:"14:00", salida:"17:55", horasTrabajadas:"08:40", minutosAtraso:0,  status:"on_time" },
  { id:"5", name:"Carlos Vega Mora",         rut:"11.223.344-5",  site:"Casa Matriz",   date:"29-04-2026", entrada:"09:15", salidaColacion:"14:00", entradaColacion:"14:45", salida:"18:10", horasTrabajadas:"08:10", minutosAtraso:45, status:"late" },
  { id:"6", name:"Valeria Reyes Castro",     rut:"17.890.123-6",  site:"Sucursal Norte",date:"29-04-2026", entrada:"08:32", salidaColacion:"13:30", entradaColacion:"14:15", salida:"18:02", horasTrabajadas:"08:45", minutosAtraso:2,  status:"on_time" },
  { id:"7", name:"Andrés Muñoz Pinto",       rut:"14.567.890-7",  site:"Sucursal Sur",  date:"29-04-2026", entrada:"08:28", salidaColacion:"13:10", entradaColacion:"13:55", salida:"19:00", horasTrabajadas:"10:12", minutosAtraso:0,  status:"overtime" },
];

const SITES = ["Todos", "Casa Matriz", "Sucursal Norte", "Sucursal Sur"];

const STATUS = {
  on_time:  { label: "A tiempo", bg: "#ecfdf5", color: "#065f46", dot: "#10b981" },
  late:     { label: "Atraso",   bg: "#fff7ed", color: "#92400e", dot: "#f59e0b" },
  absent:   { label: "Ausente",  bg: "#fef2f2", color: "#991b1b", dot: "#ef4444" },
  overtime: { label: "H. Extra", bg: "#eff6ff", color: "#1e40af", dot: "#2989d8" },
};

const NAV_ITEMS = [
  { label: "Dashboard",  icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { label: "Asistencia", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", active: true },
  { label: "Empleados",  icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { label: "Sitios",     icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
  { label: "Reportes",   icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { label: "Ajustes",    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

function KpiCard({ label, value, sub, icon, dotColor }: { label: string; value: number; sub: string; icon: string; dotColor: string }) {
  return (
    <div className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm border border-gray-100">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
           style={{ background: `${dotColor}18` }}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
             style={{ color: dotColor }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon}/>
        </svg>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
        <p className="text-[10px] text-gray-400">{sub}</p>
      </div>
    </div>
  );
}

function handleExport(records: Record[]) {
  const header = ["Nombre","RUT","Sitio","Fecha","Entrada","Sal.Col","Ent.Col","Salida","HT","Atraso(min)","Estado"];
  const rows = records.map((r) => [
    r.name, r.rut, r.site, r.date,
    r.entrada ?? "—", r.salidaColacion ?? "—", r.entradaColacion ?? "—", r.salida ?? "—",
    r.horasTrabajadas ?? "—", r.minutosAtraso, STATUS[r.status].label,
  ].join(","));
  const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `asistencia_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [search,   setSearch]   = useState("");
  const [site,     setSite]     = useState("Todos");
  const [status,   setStatus]   = useState("all");
  const [dateFrom, setDateFrom] = useState("2026-04-01");
  const [dateTo,   setDateTo]   = useState("2026-04-30");
  const [page,     setPage]     = useState(1);
  const PAGE = 10;

  const filtered = useMemo(() => DATA.filter((r) => {
    const ms = r.name.toLowerCase().includes(search.toLowerCase()) || r.rut.includes(search);
    const mSite = site === "Todos" || r.site === site;
    const mSt = status === "all" || r.status === status;
    return ms && mSite && mSt;
  }), [search, site, status]);

  const paginated  = filtered.slice((page - 1) * PAGE, page * PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const sum = useMemo(() => ({
    present:  filtered.filter((r) => r.status !== "absent").length,
    absent:   filtered.filter((r) => r.status === "absent").length,
    late:     filtered.filter((r) => r.status === "late").length,
    overtime: filtered.filter((r) => r.status === "overtime").length,
  }), [filtered]);

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden" style={{ fontFamily: 'Poppins, sans-serif' }}>

      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: G.nav }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <img src="/logo.png" alt="GO Tecnología" className="h-10 w-auto object-contain brightness-0 invert opacity-90"/>
        </div>

        <div className="px-3 py-2 flex-1 overflow-y-auto">
          <p className="text-white/30 text-[10px] font-semibold tracking-widest uppercase px-2 mb-2 mt-2">Menú</p>
          {NAV_ITEMS.map(({ label, icon, active }) => (
            <button key={label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left
                          mb-0.5 transition-all duration-150
                ${active ? "text-white font-medium" : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}
              style={active ? { background: G.btn } : {}}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon}/>
              </svg>
              {label}
            </button>
          ))}
        </div>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                 style={{ background: G.soft }}>AD</div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-medium truncate">Administrador</p>
              <p className="text-white/40 text-[10px] truncate">admin@gotecnologia.cl</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Control de Asistencia</h1>
            <p className="text-gray-400 text-xs mt-0.5">Miércoles 29, abr 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExport(filtered)}
              className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-xl
                         transition-all active:scale-95 shadow-sm"
              style={{ background: G.btn, boxShadow: '0 4px 14px rgba(41,137,216,0.3)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Exportar .xlsx
            </button>
          </div>
        </header>

        <div className="p-6 flex flex-col gap-5">
          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard label="Presentes hoy"  value={sum.present}  sub="con marcación"  icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" dotColor="#10b981"/>
            <KpiCard label="Ausentes"        value={sum.absent}   sub="sin registro"   icon="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" dotColor="#ef4444"/>
            <KpiCard label="Con atraso"      value={sum.late}     sub="ingresaron tarde" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" dotColor="#f59e0b"/>
            <KpiCard label="Horas extra"     value={sum.overtime} sub="empleados"      icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" dotColor="#2989d8"/>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-end">
            {[
              { label: "Desde", el: <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="input-field"/> },
              { label: "Hasta", el: <input type="date" value={dateTo}   onChange={(e) => { setDateTo(e.target.value);   setPage(1); }} className="input-field"/> },
              { label: "Sitio",  el: (
                <select value={site} onChange={(e) => { setSite(e.target.value); setPage(1); }} className="input-field">
                  {SITES.map((s) => <option key={s}>{s}</option>)}
                </select>
              )},
              { label: "Estado", el: (
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field">
                  <option value="all">Todos</option>
                  <option value="on_time">A tiempo</option>
                  <option value="late">Atraso</option>
                  <option value="absent">Ausente</option>
                  <option value="overtime">H. Extra</option>
                </select>
              )},
            ].map(({ label, el }) => (
              <div key={label} className="flex flex-col gap-1 min-w-[140px]">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
                <div className="[&_.input-field]:border [&_.input-field]:border-gray-200 [&_.input-field]:rounded-xl
                                [&_.input-field]:px-3 [&_.input-field]:py-2 [&_.input-field]:text-sm
                                [&_.input-field]:focus:outline-none [&_.input-field]:bg-gray-50
                                [&_.input-field]:text-gray-700 [&_.input-field]:w-full">
                  {el}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Buscar</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="text" placeholder="Nombre o RUT" value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm
                             bg-gray-50 text-gray-700 focus:outline-none"/>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'linear-gradient(to right, #f8fafc, #eff6ff)' }}>
                    {["Empleado","RUT","Sitio","Fecha","Entrada","Sal. Col.","Ent. Col.","Salida","H. Trab.","Atraso","Estado"]
                      .map((h) => (
                      <th key={h} className="text-left px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                          style={{ color: '#64748b' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center text-gray-400 text-sm">
                        Sin resultados para los filtros aplicados
                      </td>
                    </tr>
                  ) : (
                    paginated.map((r) => {
                      const s = STATUS[r.status];
                      return (
                        <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                                   style={{ background: G.soft }}>
                                {r.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                              </div>
                              <span className="font-medium text-gray-800 whitespace-nowrap text-xs">{r.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">{r.rut}</td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">{r.site}</td>
                          <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">{r.date}</td>
                          <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap font-medium" style={{ color: r.entrada ? '#1e5799' : '#d1d5db' }}>{r.entrada ?? "—"}</td>
                          <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap text-gray-500">{r.salidaColacion ?? "—"}</td>
                          <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap text-gray-500">{r.entradaColacion ?? "—"}</td>
                          <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap font-medium" style={{ color: r.salida ? '#1e5799' : '#d1d5db' }}>{r.salida ?? "—"}</td>
                          <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap font-bold text-gray-800">{r.horasTrabajadas ?? "—"}</td>
                          <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                            {r.minutosAtraso > 0
                              ? <span className="font-medium" style={{ color: '#f59e0b' }}>{r.minutosAtraso} min</span>
                              : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full w-fit"
                                  style={{ background: s.bg, color: s.color }}>
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }}/>
                              {s.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400">
                {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200
                             bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors">← Ant.</button>
                <span className="text-xs font-medium text-gray-500 px-2">{page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200
                             bg-white disabled:opacity-40 hover:bg-gray-50 transition-colors">Sig. →</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
