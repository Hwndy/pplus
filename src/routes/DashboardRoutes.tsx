import { Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LoadingState } from '@/components/common/States';
import { roleOf } from '@/lib/roles';
import { DASHBOARD_ROUTES, routesFor } from './routes';

/** Renders only the dashboard routes the signed-in user's role may access. */
export function DashboardRoutes() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const routes = routesFor(roleOf(user));
  const allowed = new Set(routes.map((r) => r.path));
  // Paths other roles may use are still registered (as redirects) so that, for
  // example, "daily-mentions/new" never falls through to "daily-mentions/:id".
  const blocked = [...new Set(DASHBOARD_ROUTES.map((r) => r.path))].filter((path) => path && !allowed.has(path));

  return (
    // Moving to another page clears an error shown for the previous one.
    <ErrorBoundary resetKey={pathname}>
      <Suspense fallback={<LoadingState />}>
        <Routes>
          {routes.map(({ path, component: Component }) => (
            <Route key={path || 'home'} index={path === ''} path={path || undefined} element={<Component />} />
          ))}
          {blocked.map((path) => (
            <Route key={`blocked-${path}`} path={path} element={<Navigate to="/dashboard" replace />} />
          ))}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
