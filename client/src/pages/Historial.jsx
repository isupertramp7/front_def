import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../services/api';

export default function Historial() {
  const [marcaciones, setMarcaciones] = useState([]);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setLoading(true);
    try {
      const params = {};
      if (desde) params.desde = desde;
      if (hasta) params.hasta = hasta + 'T23:59:59';
      const res = await api.get('/marcaciones', { params });
      setMarcaciones(res.data);
    } catch {}
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Mis marcaciones</h1>

      <div className="card flex gap-4 items-end flex-wrap">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Desde</label>
          <input type="date" className="input-field w-40" value={desde} onChange={e => setDesde(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hasta</label>
          <input type="date" className="input-field w-40" value={hasta} onChange={e => setHasta(e.target.value)} />
        </div>
        <button onClick={cargar} className="btn-primary">Filtrar</button>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-400 py-8">Cargando...</p>
        ) : marcaciones.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Sin marcaciones</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4">Fecha</th>
                <th className="pb-2 pr-4">Hora</th>
                <th className="pb-2 pr-4">Tipo</th>
                <th className="pb-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {marcaciones.map(m => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 pr-4">{format(new Date(m.fecha_hora), 'dd/MM/yyyy')}</td>
                  <td className="py-2 pr-4 tabular-nums">{format(new Date(m.fecha_hora), 'HH:mm')}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.tipo === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${m.estado === 'aprobado' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                      {m.estado}
                    </span>
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
