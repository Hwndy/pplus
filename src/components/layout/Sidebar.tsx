
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  BarChart3,
  FileText,
  Users,
  Settings,
  PieChart,
  CheckSquare,
  FileInput,
  ArrowRightLeft,
  LayoutDashboard,
  BarChart,
  BarChart2,
  LineChart,
  Newspaper,
  Share2,
  Target,
  FileCog,
  BookOpen,
  ThumbsUp,
  AlertTriangle,
  Building2,
  Building,
  Briefcase,
  ShieldCheck,
  BookOpenText,
  Mountain,
  Megaphone,
  Globe,
  FileText as FileIcon,
  ClipboardList,
  ClipboardCheck,
  History,
  ChevronLeft,
  Menu,
  ArrowLeft,
  ArrowRight,
  Shield,
  PenTool,
  Search,
  TrendingUp,
  Inbox,
  LogOut,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  hasSubmenu?: boolean;
}

const adminItems: NavItem[] = [
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Companies', href: '/dashboard/companies', icon: Building2 },
  { name: 'Publications', href: '/dashboard/publications', icon: BookOpenText },
  { name: 'Placement', href: '/dashboard/placement', icon: Mountain },
  { name: 'Editorial', href: '/dashboard/editorial', icon: Newspaper },
];

const reportModules: NavItem[] = [
  {
    name: 'Daily Mentions',
    href: '/dashboard/daily-mentions',
    icon: FileText,
    hasSubmenu: true
  },
  {
    name: 'SWOT Mentions',
    href: '/dashboard/swot-mentions',
    icon: Target,
    hasSubmenu: true
  },
  {
    name: 'Social Media Mentions',
    href: '/dashboard/social-media-mentions',
    icon: Share2,
    hasSubmenu: true
  },
  {
    name: 'Outcome & Insights',
    href: '/dashboard/outcome-insights',
    icon: LineChart,
    hasSubmenu: true
  },
  {
    name: 'Audit Log',
    href: '/dashboard/audit-log',
    icon: ClipboardList,
    hasSubmenu: true
  },
];

const navigationItems: NavItem[] = [
  { name: 'Executive Summary', href: '/dashboard', icon: LayoutDashboard },
  { name: 'SWOT Analysis', href: '/dashboard/swot', icon: Target },
  { name: 'Outcome & Insights', href: '/dashboard/insights', icon: LineChart },
  { name: 'PR Drivers', href: '/dashboard/pr-drivers', icon: BarChart3 },
  { name: 'Brand Media Analysis', href: '/dashboard/brand-media', icon: PieChart },
  { name: 'Publication Analysis', href: '/dashboard/publication', icon: Newspaper },
  {
    name: 'Social Media Analysis',
    href: '/dashboard/social-media',
    icon: Share2,
    hasSubmenu: true
  },
  {
    name: 'Competitive Analysis',
    href: '/dashboard/competitive',
    icon: BarChart,
    hasSubmenu: true
  },
  {
    name: 'Competitive PR Drivers',
    href: '/dashboard/competitive-pr',
    icon: Target,
    hasSubmenu: true
  },
  { name: 'Audit Report Process', href: '/dashboard/audit', icon: FileCog },
  { name: 'Principle & Methodology', href: '/dashboard/methodology', icon: BookOpen },
];

const adminRoutes: NavItem[] = [
  { name: 'User Management', href: '/dashboard/users', icon: Users },
  { name: 'Data Parameters', href: '/dashboard/parameters', icon: Settings },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: ArrowRightLeft },
];

// Supervisor-specific navigation items
const supervisorItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Review Entries', href: '/dashboard/review', icon: CheckSquare },
  { name: 'Content Review', href: '/dashboard/content-review', icon: ClipboardCheck },
  { name: 'Editorial', href: '/dashboard/editorial', icon: Newspaper },
  { name: 'Daily Mentions', href: '/dashboard/daily-mentions', icon: FileText },
  { name: 'SWOT Mentions', href: '/dashboard/swot-mentions', icon: Target },
  { name: 'Outcome & Insights', href: '/dashboard/outcome-insights', icon: LineChart },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
];

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className, isOpen = true, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState === 'collapsed') {
      setIsCollapsed(true);
    }
  }, []);

  const { user, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!user) return null;

  // Define the navigation items based on user role
  let navigation = navigationItems;

  // For admin users, include all functionality (admin, supervisor, and analyst)
  if (user.role.toLowerCase() === 'admin') {
    // Group navigation items by role
    const adminItems: NavItem[] = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Users', href: '/dashboard/users', icon: Users },
      { name: 'Companies', href: '/dashboard/companies', icon: Building2 },
      { name: 'Publications', href: '/dashboard/publications-management', icon: BookOpenText },
      { name: 'Parameters', href: '/dashboard/parameters', icon: Settings },
      { name: 'Reports', href: '/dashboard/reports', icon: FileText },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
      { name: 'API Demo', href: '/dashboard/api-demo', icon: Settings },
    ];

    const supervisorItems: NavItem[] = [
      { name: 'Content Review', href: '/dashboard/content-review', icon: ClipboardCheck },
      { name: 'Review Entries', href: '/dashboard/review', icon: CheckSquare },
    ];

    const analystItems: NavItem[] = [
      { name: 'Editorial', href: '/dashboard/editorial', icon: Newspaper },
      { name: 'Daily Mentions', href: '/dashboard/daily-mentions', icon: FileText },
      { name: 'SWOT Mentions', href: '/dashboard/swot-mentions', icon: Target },
      { name: 'Social Media Mentions', href: '/dashboard/social-media-mentions', icon: Share2 },
      { name: 'Outcome & Insights', href: '/dashboard/outcome-insights', icon: LineChart },
    ];

    // Combine all items in the desired order
    const adminFullItems: NavItem[] = [
      ...adminItems,
      { name: 'Supervisor Features', href: '', icon: Shield, disabled: true },
      ...supervisorItems,
      { name: 'Analyst Features', href: '', icon: PenTool, disabled: true },
      ...analystItems,
    ];
    navigation = adminFullItems;
  }
  // For supervisor users, use the supervisor-specific items
  else if (user.role.toLowerCase() === 'supervisor') {
    navigation = supervisorItems;
  }
  // For analyst users, include only essential pages
  else if (user.role.toLowerCase() === 'analyst') {
    const analystItems = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Editorial', href: '/dashboard/editorial', icon: Newspaper },
      { name: 'Daily Mentions', href: '/dashboard/daily-mentions', icon: FileText },
      { name: 'SWOT Mentions', href: '/dashboard/swot-mentions', icon: Target },
      { name: 'Social Media Mentions', href: '/dashboard/social-media-mentions', icon: Share2 },
      { name: 'Outcome & Insights', href: '/dashboard/outcome-insights', icon: LineChart },
      { name: 'Submissions', href: '/dashboard/submissions', icon: ClipboardList }
    ];
    navigation = analystItems;
  }
  // For client users, include client-specific pages
  else if (user.role.toLowerCase() === 'client') {
    const clientItems = [
      { name: 'Executive Summary', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Daily Mentions Inbox', href: '/dashboard/mentions-inbox', icon: Inbox },
      { name: 'SWOT Analysis', href: '/dashboard/swot', icon: Target },
      { name: 'Outcome & Insights', href: '/dashboard/insights', icon: LineChart },
      { name: 'Industry Landscape Overview', href: '/dashboard/industry', icon: Building },
      { name: 'Brand Drivers & Sentiment Distribution', href: '/dashboard/brand-sentiment', icon: BarChart3 },
      { name: 'Brand Media Analysis', href: '/dashboard/brand-media', icon: BarChart2 },
      { name: 'Distribution of Media Activities', href: '/dashboard/media-distribution', icon: PieChart },
      { name: 'Publications & Spokespersons Analysis', href: '/dashboard/publications', icon: Newspaper },
      { name: 'Coverage by Region', href: '/dashboard/coverage-region', icon: Globe },
      { name: 'Competitive Intelligence', href: '/dashboard/competitive', icon: Search },
      { name: 'Competitive Sentiment Intelligence', href: '/dashboard/competitive-sentiment', icon: TrendingUp },
      { name: 'Competitive CEOs Intelligence', href: '/dashboard/competitive-ceos', icon: Users },
      { name: 'Competitive PR Drivers', href: '/dashboard/competitive-pr', icon: Target },
      { name: 'Glossary', href: '/dashboard/glossary', icon: BookOpen },
      { name: 'Principle & Methodology', href: '/dashboard/methodology', icon: FileText }
    ];
    navigation = clientItems;
  }

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-white pt-5 transition-all duration-300 h-[calc(100vh-4rem)]",
        isCollapsed ? "!w-12" : "w-[240px]", // Force width with !important
        isMobile && !isOpen && "w-0 min-w-0 border-none opacity-0 pointer-events-none",
        isMobile && isOpen && "fixed z-40 left-0 shadow-xl w-[80%] max-w-[300px]",
        className
      )}
    >
      <ScrollArea className={cn(
        "flex flex-col h-full",
        isCollapsed ? "!px-0" : "px-3", // Remove padding in collapsed state
        "py-2"
      )}>
        <nav className="grid gap-1">
          <TooltipProvider>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center rounded-md py-2 text-sm font-medium transition-all duration-300",
                        isCollapsed ? "justify-center !px-0" : "px-3 gap-3", // Center icon and remove padding
                        isActive
                          ? "bg-indigo-950 text-white"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                      onClick={isMobile ? onClose : undefined}
                    >
                      <Icon className={cn(
                        "h-5 w-5 min-w-[20px]", // Added min-width to maintain icon size
                        isActive ? "text-white" : "text-gray-500"
                      )} />
                      <span className={isCollapsed ? "hidden" : "block"}>{item.name}</span>
                      {item.hasSubmenu && !isCollapsed && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ml-auto"
                        >
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>
      </ScrollArea>

      {/* Logout Button */}
      <div className="mt-auto border-t py-3 px-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={logout}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-red-50 hover:text-red-600 text-gray-700",
                  isCollapsed && "justify-center px-2"
                )}
                aria-label="Log out"
              >
                <LogOut size={20} className="shrink-0" />
                {!isCollapsed && <span>Log out</span>}
              </button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                Log out
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {!isMobile && (
        <div className="border-t py-3 px-4 flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Toggle sidebar"
                onClick={() => {
                  const newState = !isCollapsed;
                  setIsCollapsed(newState);
                  localStorage.setItem('sidebarState', newState ? 'collapsed' : 'expanded');
                }}
              >
                {isCollapsed ? (
                  <ArrowRight size={20} className="transition-all duration-300" />
                ) : (
                  <ArrowLeft size={20} className="transition-all duration-300" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </aside>
  );
}
