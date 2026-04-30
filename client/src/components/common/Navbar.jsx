import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = ['rrhh', 'supervisor'].includes(user?.rol);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="bg-primary-800 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/marcar" className="font-bold text-lg tracking-tight">Marcación GO</Link>
          <Link to="/marcar" className="text-sm hover:text-primary-100">Marcar</Link>
          <Link to="/historial" className="text-sm hover:text-primary-100">Historial</Link>
          {isAdmin && (
            <>
              <Link to="/admin/dashboard" className="text-sm hover:text-primary-100">Dashboard</Link>
              <Link to="/admin/empleados" className="text-sm hover:text-primary-100">Empleados</Link>
              <Link to="/admin/reportes" className="text-sm hover:text-primary-100">Reportes</Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-primary-100">{user?.nombre}</span>
          <button onClick={handleLogout} className="text-sm bg-primary-700 hover:bg-primary-600 px-3 py-1 rounded-lg">
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
