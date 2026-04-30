import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import RoleGuard from './components/common/RoleGuard';
import Login from './pages/Login';
import Marcar from './pages/Marcar';
import Historial from './pages/Historial';
import Dashboard from './pages/admin/Dashboard';
import Empleados from './pages/admin/Empleados';
import Reportes from './pages/admin/Reportes';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route path="/marcar" element={<Marcar />} />
          <Route path="/historial" element={<Historial />} />
          <Route element={<RoleGuard roles={['rrhh', 'supervisor']} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/empleados" element={<Empleados />} />
            <Route path="/admin/reportes" element={<Reportes />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/marcar" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
