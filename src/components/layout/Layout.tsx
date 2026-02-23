import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useLocation, Navigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'; // ← shadcn sidebar exports
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Initialize sidebar state from localStorage (for desktop collapsed/expanded)
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState) {
      document.documentElement.setAttribute('data-sidebar-state', savedState);
    } else {
      document.documentElement.setAttribute('data-sidebar-state', 'expanded');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const publicRoutes = [
    '/',
    '/forgot-password',
    '/reset-password',
    '/change-password-first-time'
  ];

  const isPublicRoute = publicRoutes.includes(location.pathname) || 
    location.pathname.startsWith('/reset-password');

  if (!isAuthenticated && !isPublicRoute) {
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated && location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="group/sidebar-wrapper flex min-h-screen w-full flex-col md:flex-row">
        {/* Sidebar – always rendered, visibility/position handled by shadcn */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />

          <SidebarInset className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            <div className="mx-auto h-full w-full animate-fade-in">
              {children}
            </div>
          </SidebarInset>

          <footer className="border-t py-3 px-4 md:px-6 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} P+Analytics Dashboard. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}