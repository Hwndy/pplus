import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/components/auth/AuthContext';
import { roleOf } from '@/lib/roles';
import { dashboardPath, NAV_GROUP_ORDER, routesFor } from '@/routes/routes';

/** Navigation generated from the route map, so menu entries always match accessible pages. */
export function AppSidebar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const items = routesFor(roleOf(user)).filter((r) => r.nav);

  const isActive = (path: string) => {
    const href = dashboardPath(path);
    return path === '' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b px-4">
        <NavLink to="/dashboard" className="flex items-center" aria-label="P+ Media Analytics home">
          <img src="/uploads/logo.png" alt="P+ Media Analytics" className="h-8 w-auto group-data-[collapsible=icon]:hidden" />
          <img src="/ppluslogo.png" alt="" className="hidden h-7 w-7 object-contain group-data-[collapsible=icon]:block" />
        </NavLink>
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUP_ORDER.map((group) => {
          const groupItems = items.filter((r) => r.nav?.group === group);
          if (!groupItems.length) return null;
          return (
            <SidebarGroup key={group}>
              <SidebarGroupLabel>{group}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {groupItems.map(({ path, nav }) => {
                    if (!nav) return null;
                    const Icon = nav.icon;
                    return (
                      <SidebarMenuItem key={`${group}-${path}`}>
                        <SidebarMenuButton asChild isActive={isActive(path)} tooltip={nav.label}>
                          <NavLink to={dashboardPath(path)} end={path === ''} onClick={() => isMobile && setOpenMobile(false)}>
                            <Icon />
                            <span>{nav.label}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
