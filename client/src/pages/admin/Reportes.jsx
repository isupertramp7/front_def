import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../services/api';

export default function Reportes() {
  const [empleados, setEmpleados] = useState([]);
  const [form, setForm] = useState({ fecha_inicio: '', fecha_fin: '', tipo_reporte: 'asistencia', formato: 'excel', empleado_id: '' });
  const [historial, setHistorial] = useState([]);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    api.get('/empleados').then(r => setEmpleados(r.data));
    api.get('/reportes').then(r => setHistorial(r.data));
  }, []);

  async function generar(e) {
    e.preventDefault();
    setGenerando(true);
    try {
      const res = await api.post('/reportes/generar', form, { responseType: 'blob' });
      const ext = form.formato === 'pdf' ? 'pdf' : 'xlsx';
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      const res2 = await api.get('/reportes');
      setHistorial(res2.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al generar reporte');
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Generador de Reportes</h1>

      <form onSubmit={generar} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input type="date" className="input-field" required value={form.fecha_inicio} onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input type="date" className="input-field" required value={form.fecha_fin} onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Empleado (opcional)</label>
            <select className="input-field" value={form.empleado_id} onChange={e => setForm(f => ({ ...f, empleado_id: e.target.value }))}>
              <option value="">Todos los empleados</option>
              {empleados.map(e => <option key={e.id} value={e.id}>{e.usuario.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Formato</label>
            <select className="input-field" value={form.formato} onChange={e => setForm(f => ({ ...f, formato: e.target.value }))}>
              <option value="excel">Excel (.xlsx)</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={generando}>
          {generando ? 'Generando...' : 'Generar y descargar'}
        </button>
      </form>

      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-3">Historial de reportes</h2>
        {historial.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin reportes generados</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4">Fecha generación</th>
                <th className="pb-2 pr-4">Período</th>
                <th className="pb-2 pr-4">Tipo</th>
                <th className="pb-2">Formato</th>
              </tr>
            </thead>
            <tbody>
              {historial.map(r => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{format(new Date(r.fecha_generacion), 'dd/MM/yyyy HH:mm')}</td>
                  <td className="py-2 pr-4">{format(new Date(r.fecha_inicio), 'dd/MM')} → {format(new Date(r.fecha_fin), 'dd/MM/yyyy')}</td>
                  <td className="py-2 pr-4">{r.tipo_reporte}</td>
                  <td className="py-2">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs uppercase">{r.formato}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
