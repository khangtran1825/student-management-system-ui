import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const ProtectedRoute = () => {
  const auth = useSelector((state: RootState) => state.auth);

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (auth.user?.mustChangePassword) {
    return <Navigate to="/force-change-password" replace />;
  }

  return <Outlet />;
};