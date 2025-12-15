
import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/components/auth/AuthContext';
import { Layout } from '@/components/layout/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Spinner } from '@/components/ui/spinner';

// Lazy load pages for better performance
const Index = lazy(() => import('./pages/Index'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AuditPage = lazy(() => import('./components/AuditLogViewer')); 
const SocialMediaMentionsPage = lazy(() => import('./pages/dashboard/SocialMediaMentionsPage')); 
// Create a loading fallback component
const LoadingFallback = () => (
  <div className="flex h-full items-center justify-center">
    <Spinner size="lg" />
  </div>
);

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Layout>
              <ErrorBoundary>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/audit-log" element={<AuditPage />} />
                    <Route path="/dashboard/social-media-mentions" element={<SocialMediaMentionsPage />} />
                    <Route path="/dashboard/*" element={<Dashboard />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </Layout>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
