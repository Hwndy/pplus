import { useAuth } from '@/components/auth/AuthContext';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  BarChart2,
  FileText,
  Users,
  Settings,
  PieChart,
  CheckSquare,
  LayoutDashboard,
  Newspaper,
  Share2,
  Target,
  LineChart,
  Globe,
  Building2,
  BookOpenText,
  Shield,
  PenTool,
  Inbox,
  TrendingUp,
  Search,
  BookOpen,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar as ShadSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  hasSubmenu?: boolean;
  disabled?: boolean;
}

const defaultNavigation: NavItem[] = [];

const supervisorItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Editorial', href: '/dashboard/editorial', icon: Newspaper },
  { name: 'Daily Mentions', href: '/dashboard/daily-mentions', icon: FileText },
  { name: 'SWOT Mentions', href: '/dashboard/swot-mentions', icon: Target },
  { name: 'Social Media Mentions', href: '/dashboard/social-media-mentions', icon: Share2 },
  { name: 'Outcome & Insights', href: '/dashboard/outcome-insights', icon: LineChart },
  { name: 'Industry Landscape', href: '/dashboard/industry-landscape', icon: Globe },
];

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const { state: sidebarState, toggleSidebar } = useSidebar(); // shadcn toggle function

  if (!user) return null;

  const userRole = user.role?.name?.toLowerCase() ?? null;

  let navigation: NavItem[] = defaultNavigation;

  if (userRole === 'admin') {
    const adminItems: NavItem[] = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Users', href: '/dashboard/users', icon: Users },
      { name: 'Companies', href: '/dashboard/companies', icon: Building2 },
      { name: 'Publications', href: '/dashboard/publications-management', icon: BookOpenText },
      { name: 'Parameters', href: '/dashboard/parameters', icon: Settings },
    ];

    const supervisorItemsForAdmin: NavItem[] = [
      { name: 'Content Review', href: '/dashboard/supervisordashboard', icon: CheckSquare },
    ];

    const analystItems: NavItem[] = [
      { name: 'Editorial', href: '/dashboard/editorial', icon: Newspaper },
      { name: 'Daily Mentions', href: '/dashboard/daily-mentions', icon: FileText },
      { name: 'SWOT Mentions', href: '/dashboard/swot-mentions', icon: Target },
      { name: 'Social Media Mentions', href: '/dashboard/social-media-mentions', icon: Share2 },
      { name: 'Outcome & Insights', href: '/dashboard/outcome-insights', icon: LineChart },
      { name: 'Industry Landscape', href: '/dashboard/industry-landscape', icon: Globe },
    ];

    navigation = [
      ...adminItems,
      { name: 'Supervisor Features', href: '', icon: Shield, disabled: true },
      ...supervisorItemsForAdmin,
      { name: 'Analyst Features', href: '', icon: PenTool, disabled: true },
      ...analystItems,
    ];
  } else if (userRole === 'supervisor') {
    navigation = supervisorItems;
  } else if (userRole === 'analyst') {
    navigation = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Editorial', href: '/dashboard/editorial', icon: Newspaper },
      { name: 'Daily Mentions', href: '/dashboard/daily-mentions', icon: FileText },
      { name: 'SWOT Mentions', href: '/dashboard/swot-mentions', icon: Target },
      { name: 'Social Media Mentions', href: '/dashboard/social-media-mentions', icon: Share2 },
      { name: 'Outcome & Insights', href: '/dashboard/outcome-insights', icon: LineChart },
      { name: 'Industry Landscape', href: '/dashboard/industry-landscape', icon: Globe },
    ];
  } else if (userRole === 'client') {
    const clientItems: NavItem[] = [
      { name: 'Executive Summary', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Daily Mentions Inbox', href: '/dashboard/mentions-inbox', icon: Inbox },
      { name: 'SWOT Analysis', href: '/dashboard/swot', icon: Target },
      { name: 'Outcome & Insights', href: '/dashboard/insights', icon: LineChart },
      { name: 'Industry Landscape', href: '/dashboard/industry', icon: Globe },
      { name: 'Brand Drivers & Sentiment', href: '/dashboard/brand-sentiment', icon: BarChart3 },
      { name: 'Brand Media Analysis', href: '/dashboard/brand-media', icon: BarChart2 },
      { name: 'Media Distribution', href: '/dashboard/media-distribution', icon: PieChart },
      { name: 'Publications Analysis', href: '/dashboard/publications', icon: Newspaper },
      { name: 'Coverage by Region', href: '/dashboard/coverage-region', icon: Globe },
      { name: 'Competitive Intelligence', href: '/dashboard/competitive', icon: Search },
      { name: 'Competitive Sentiment', href: '/dashboard/competitive-sentiment', icon: TrendingUp },
      { name: 'Competitive CEOs', href: '/dashboard/competitive-ceos', icon: Users },
      { name: 'Competitive PR Drivers', href: '/dashboard/competitive-pr', icon: Target },
      { name: 'Glossary', href: '/dashboard/glossary', icon: BookOpen },
      { name: 'Methodology', href: '/dashboard/methodology', icon: FileText },
    ];
    navigation = clientItems;
  }

  const handleToggle = () => {
    toggleSidebar(); // sync with shadcn state
    const newState = sidebarState === 'expanded' ? 'collapsed' : 'expanded';
    localStorage.setItem('sidebarState', newState);
    document.documentElement.setAttribute('data-sidebar-state', newState);
  };

  return (
    <ShadSidebar collapsible="icon" className="border-r bg-white">
      <SidebarContent className="flex flex-col h-full">
        <ScrollArea className="flex-1 py-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  const isDisabled = item.disabled;
                  const Icon = item.icon;

                  if (isDisabled) {
                    return (
                      <SidebarMenuItem key={item.name}>
                        <div
                          className={cn(
                            "flex items-center rounded-md py-2 px-3 text-sm font-medium text-gray-400 cursor-not-allowed gap-3",
                            sidebarState === 'collapsed' && "justify-center px-0"
                          )}
                        >
                          <Icon className="h-5 w-5 text-gray-500" />
                          {sidebarState !== 'collapsed' && <span>{item.name}</span>}
                        </div>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={sidebarState === 'collapsed' ? item.name : undefined}
                      >
                        <Link to={item.href}>
                          <Icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-gray-500")} />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>

        {/* Restored desktop collapse/expand button at bottom */}
        <div className="mt-auto border-t py-3 px-4 flex justify-center hidden md:flex">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={handleToggle}
                  aria-label={sidebarState === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {sidebarState === 'collapsed' ? (
                    <ArrowRight size={20} className="text-gray-700" />
                  ) : (
                    <ArrowLeft size={20} className="text-gray-700" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {sidebarState === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </SidebarContent>
    </ShadSidebar>
  );
}