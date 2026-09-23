import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

/** Authenticated shell: collapsible sidebar, sticky header, scrolling content area. */
export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <AppHeader />
        <main className="flex-1 px-4 py-6 md:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
        <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground md:px-8">
          © {new Date().getFullYear()} P+ Media Analytics. All rights reserved.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
