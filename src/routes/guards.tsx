import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { LoadingState } from '@/components/common/States';

/** Only for signed-in users; everyone else is sent to the login page. */
export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <LoadingState className="h-screen" />;
  if (!isAuthenticated) return <Navigate to="/" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Login and password-recovery pages; signed-in users go straight to their dashboard. */
export function PublicOnly() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingState className="h-screen" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
