import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../../services/api';

function StatCard({ label, value, color }) {
  return (
    <div className={`card border-l-4 ${color}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-4xl font-bold mt-1">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/asistencia/dashboard')
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm capitalize">
          {format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: es })}
        </p>
      </div>

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total empleados" value={data.totalEmpleados} color="border-gray-400" />
          <StatCard label="Presentes hoy" value={data.presentes} color="border-green-500" />
          <StatCard label="Ausentes" value={data.ausentes} color="border-red-400" />
          <StatCard label="Atrasados" value={data.atrasados} color="border-yellow-400" />
        </div>
      )}
    </div>
  );
}
