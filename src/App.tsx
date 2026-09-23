import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/components/auth/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LoadingState } from '@/components/common/States';
import { PublicOnly, RequireAuth } from '@/routes/guards';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardRoutes } from '@/routes/DashboardRoutes';
import { ApiError } from '@/lib/api-client';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const ChangePasswordPage = lazy(() => import('@/pages/auth/ChangePasswordPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
      // Don't retry client errors (validation, permission, not found).
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <Toaster richColors closeButton position="top-right" />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<LoadingState className="h-screen" />}>
              <Routes>
                <Route element={<PublicOnly />}>
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/change-password" element={<ChangePasswordPage />} />
                </Route>
                {/* Older links used this path for the first-login password change. */}
                <Route path="/change-password-first-time" element={<Navigate to="/change-password" replace />} />
                <Route element={<RequireAuth />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard/*" element={<DashboardRoutes />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
