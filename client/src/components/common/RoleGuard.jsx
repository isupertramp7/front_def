import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RoleGuard({ roles }) {
  const { user } = useAuth();
  if (!roles.includes(user?.rol)) return <Navigate to="/marcar" replace />;
  return <Outlet />;
}
