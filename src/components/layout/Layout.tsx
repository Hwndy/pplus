
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useLocation, Navigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState) {
      document.documentElement.setAttribute('data-sidebar-state', savedState);
    } else {
      document.documentElement.setAttribute('data-sidebar-state', 'expanded');
    }
  }, []);

  // If we're loading, show a loading indicator
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

  const isPublicRoute = publicRoutes.includes(location.pathname) || location.pathname.startsWith('/reset-password'); // for query params

  // If the user is not authenticated and not on the login page, redirect to login
  if (!isAuthenticated && !isPublicRoute) {
    return <Navigate to="/" replace />;
  }

  // If we're on the login page and already authenticated, go to dashboard
  if (isAuthenticated && location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  // On login page, don't show the layout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Remove the nested Layout component

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {isAuthenticated && (
        <>
          {isMobile && (
            <div 
              className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ${
                sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <Sidebar 
            className={cn(
              "z-40 shrink-0 transition-all duration-300",
              isMobile ? "" : "w-[240px] data-[sidebar-state=collapsed]:!w-12", // Force width with !important
              "hidden md:block"
            )}
            isOpen={isMobile ? sidebarOpen : true}
            onClose={() => setSidebarOpen(false)}
          />
        </>
      )}
      <div className={cn(
        "flex flex-1 flex-col overflow-hidden",
        "transition-all duration-300 ease-in-out",
        !isMobile && "md:data-[sidebar-state=expanded]:ml-[240px] md:data-[sidebar-state=collapsed]:!ml-12"
      )}>
        {isAuthenticated && (
          <Header>
            {isMobile && (
              <button 
                onClick={toggleSidebar}
                className="mr-2 p-2 rounded-md hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                <Menu size={24} />
              </button>
            )}
          </Header>
        )}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="mx-auto h-full w-full animate-fade-in">
            {children}
          </div>
        </main>
        <footer className="border-t py-3 px-4 md:px-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} P+Analytics Dashboard. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
