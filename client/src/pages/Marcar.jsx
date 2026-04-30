import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../services/api';

export default function Marcar() {
  const [hora, setHora] = useState(new Date());
  const [estadoHoy, setEstadoHoy] = useState({ entrada: null, salida: null });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    cargarEstado();
    return () => clearInterval(timer);
  }, []);

  async function cargarEstado() {
    try {
      const res = await api.get('/marcaciones/hoy');
      setEstadoHoy(res.data);
    } catch {}
  }

  async function marcar(tipo) {
    setLoading(true);
    setMensaje(null);
    try {
      const pos = await obtenerPosicion();
      await api.post('/marcaciones', {
        tipo,
        latitud: pos?.coords.latitude,
        longitud: pos?.coords.longitude,
        zona_permitida: !!pos,
      });
      setMensaje({ tipo: 'ok', texto: `${tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada correctamente` });
      cargarEstado();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al registrar' });
    } finally {
      setLoading(false);
    }
  }

  function obtenerPosicion() {
    return new Promise(resolve => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 5000 });
    });
  }

  const tieneEntrada = !!estadoHoy.entrada;
  const tieneSalida = !!estadoHoy.salida;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="card text-center">
        <p className="text-sm text-gray-500 capitalize">
          {format(hora, "EEEE d 'de' MMMM yyyy", { locale: es })}
        </p>
        <p className="text-5xl font-bold text-primary-800 mt-2 tabular-nums">
          {format(hora, 'HH:mm:ss')}
        </p>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-700">Estado de hoy</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-lg p-3 text-center ${tieneEntrada ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
            <p className="text-xs text-gray-500">Entrada</p>
            <p className="font-semibold text-sm mt-1">
              {tieneEntrada ? format(new Date(estadoHoy.entrada.fecha_hora), 'HH:mm') : '—'}
            </p>
          </div>
          <div className={`rounded-lg p-3 text-center ${tieneSalida ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
            <p className="text-xs text-gray-500">Salida</p>
            <p className="font-semibold text-sm mt-1">
              {tieneSalida ? format(new Date(estadoHoy.salida.fecha_hora), 'HH:mm') : '—'}
            </p>
          </div>
        </div>
      </div>

      {mensaje && (
        <div className={`rounded-lg p-3 text-sm font-medium ${mensaje.tipo === 'ok' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => marcar('entrada')}
          disabled={loading || tieneEntrada}
          className="btn-primary py-4 text-lg disabled:opacity-40"
        >
          Entrada
        </button>
        <button
          onClick={() => marcar('salida')}
          disabled={loading || !tieneEntrada || tieneSalida}
          className="bg-gray-800 text-white font-semibold py-4 px-4 rounded-lg hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-lg"
        >
          Salida
        </button>
      </div>
    </div>
  );
}
