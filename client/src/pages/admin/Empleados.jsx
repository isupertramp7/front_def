import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/empleados'), api.get('/horarios')])
      .then(([e, h]) => { setEmpleados(e.data); setHorarios(h.data); })
      .finally(() => setLoading(false));
  }, []);

  function abrirNuevo() {
    setForm({ nombre: '', correo: '', password: '', rol: 'empleado', rut: '', cargo: '', departamento: '', horario_id: '' });
    setError('');
  }

  async function guardar(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (form.id) {
        const res = await api.put(`/empleados/${form.id}`, form);
        setEmpleados(prev => prev.map(emp => emp.id === form.id ? res.data : emp));
      } else {
        const res = await api.post('/empleados', form);
        setEmpleados(prev => [...prev, res.data]);
      }
      setForm(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function desactivar(id) {
    if (!confirm('¿Desactivar empleado?')) return;
    await api.delete(`/empleados/${id}`);
    setEmpleados(prev => prev.map(e => e.id === id ? { ...e, usuario: { ...e.usuario, activo: false } } : e));
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Empleados</h1>
        <button onClick={abrirNuevo} className="btn-primary">+ Nuevo empleado</button>
      </div>

      {form && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <form onSubmit={guardar} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-3">
            <h2 className="font-bold text-lg">{form.id ? 'Editar empleado' : 'Nuevo empleado'}</h2>
            {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
            {!form.id && (
              <>
                <input className="input-field" placeholder="Nombre completo" required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                <input className="input-field" type="email" placeholder="Correo" required value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} />
                <input className="input-field" type="password" placeholder="Contraseña" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                <input className="input-field" placeholder="RUT (12.345.678-9)" required value={form.rut} onChange={e => setForm(f => ({ ...f, rut: e.target.value }))} />
              </>
            )}
            <input className="input-field" placeholder="Cargo" value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} />
            <input className="input-field" placeholder="Departamento" value={form.departamento} onChange={e => setForm(f => ({ ...f, departamento: e.target.value }))} />
            <select className="input-field" value={form.horario_id} onChange={e => setForm(f => ({ ...f, horario_id: e.target.value }))} required>
              <option value="">Seleccionar horario</option>
              {horarios.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
            </select>
            <select className="input-field" value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
              <option value="empleado">Empleado</option>
              <option value="supervisor">Supervisor</option>
              <option value="rrhh">RRHH</option>
            </select>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button type="button" onClick={() => setForm(null)} className="btn-secondary flex-1">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2 pr-4">Nombre</th>
              <th className="pb-2 pr-4">RUT</th>
              <th className="pb-2 pr-4">Cargo</th>
              <th className="pb-2 pr-4">Horario</th>
              <th className="pb-2 pr-4">Estado</th>
              <th className="pb-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map(emp => (
              <tr key={emp.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-2 pr-4">
                  <div className="font-medium">{emp.usuario.nombre}</div>
                  <div className="text-xs text-gray-400">{emp.usuario.correo}</div>
                </td>
                <td className="py-2 pr-4 text-gray-600">{emp.rut}</td>
                <td className="py-2 pr-4">{emp.cargo}</td>
                <td className="py-2 pr-4 text-gray-600">{emp.horario?.nombre}</td>
                <td className="py-2 pr-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${emp.usuario.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {emp.usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-2 flex gap-2">
                  <button onClick={() => { setForm({ ...emp, ...emp.usuario, horario_id: emp.horario_id }); setError(''); }} className="text-primary-700 text-xs hover:underline">Editar</button>
                  {emp.usuario.activo && (
                    <button onClick={() => desactivar(emp.id)} className="text-red-500 text-xs hover:underline">Desactivar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
