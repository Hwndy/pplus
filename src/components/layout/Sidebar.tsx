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
  disabled?: boolean;
}

const defaultNavigation: NavItem[] = [];

// Supervisor-specific navigation items
const supervisorItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Editorial', href: '/dashboard/editorial', icon: Newspaper },
  { name: 'Daily Mentions', href: '/dashboard/daily-mentions', icon: FileText },
  { name: 'SWOT Mentions', href: '/dashboard/swot-mentions', icon: Target },
  { name: 'Outcome & Insights', href: '/dashboard/outcome-insights', icon: LineChart },
];

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className, isOpen = true, onClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState === 'collapsed') {
      setIsCollapsed(true);
    }
  }, []);

  // Early return if no user
  if (!user) return null;

  // Safely extract role (with fallbacks)
  const userRole = user.role?.name?.toLowerCase() ?? null;

  // Determine navigation based on role
  let navigation: NavItem[] = defaultNavigation;

  if (userRole === 'admin') {
    const adminItems: NavItem[] = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Users', href: '/dashboard/users', icon: Users },
      { name: 'Companies', href: '/dashboard/companies', icon: Building2 },
      { name: 'Publications', href: '/dashboard/publications-management', icon: BookOpenText },
      { name: 'Parameters', href: '/dashboard/parameters', icon: Settings },
    ];

    const supervisorItems: NavItem[] = [
      { name: 'Content Review', href: '/dashboard/supervisordashboard', icon: CheckSquare },
    ];

    const analystItems: NavItem[] = [
      { name: 'Editorial', href: '/dashboard/editorial', icon: Newspaper },
      { name: 'Daily Mentions', href: '/dashboard/daily-mentions', icon: FileText },
      { name: 'SWOT Mentions', href: '/dashboard/swot-mentions', icon: Target },
      { name: 'Social Media Mentions', href: '/dashboard/social-media-mentions', icon: Share2 },
      { name: 'Outcome & Insights', href: '/dashboard/outcome-insights', icon: LineChart },
    ];

    navigation = [
      ...adminItems,
      { name: 'Supervisor Features', href: '', icon: Shield, disabled: true },
      ...supervisorItems,
      { name: 'Analyst Features', href: '', icon: PenTool, disabled: true },
      ...analystItems,
    ];
  }
  else if (userRole === 'supervisor') {
    navigation = supervisorItems;
  }
  else if (userRole === 'analyst') {
    const analystItems: NavItem[] = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Editorial', href: '/dashboard/editorial', icon: Newspaper },
      { name: 'Daily Mentions', href: '/dashboard/daily-mentions', icon: FileText },
      { name: 'SWOT Mentions', href: '/dashboard/swot-mentions', icon: Target },
      { name: 'Social Media Mentions', href: '/dashboard/social-media-mentions', icon: Share2 },
      { name: 'Outcome & Insights', href: '/dashboard/outcome-insights', icon: LineChart },
    ];
    navigation = analystItems;
  }
  else if (userRole === 'client') {
    const clientItems: NavItem[] = [
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
      { name: 'Principle & Methodology', href: '/dashboard/methodology', icon: FileText },
    ];
    navigation = clientItems;
  }
  // Optional: Show loading state if role is not yet known
  else if (userRole === null) {
    return (
      <aside className={cn(
        "flex flex-col border-r bg-white pt-5 h-[calc(100vh-4rem)] w-[240px]",
        isMobile && !isOpen && "hidden",
        isMobile && isOpen && "fixed z-40 left-0 shadow-xl w-[80%] max-w-[300px]",
        className
      )}>
        <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-600"></div>
        </div>
      </aside>
    );
  }

  // Toggle collapse
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarState', newState ? 'collapsed' : 'expanded');
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-white pt-5 transition-all duration-300 h-[calc(100vh-4rem)]",
        isCollapsed ? "!w-12" : "w-[240px]",
        isMobile && !isOpen && "w-0 min-w-0 border-none opacity-0 pointer-events-none",
        isMobile && isOpen && "fixed z-40 left-0 shadow-xl w-[80%] max-w-[300px]",
        className
      )}
    >
      <ScrollArea className={cn(
        "flex flex-col h-full py-2",
        isCollapsed ? "!px-0" : "px-3"
      )}>
        <nav className="grid gap-1">
          <TooltipProvider>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              const isDisabled = item.disabled;

              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link
                      to={isDisabled ? '#' : item.href}
                      className={cn(
                        "flex items-center rounded-md py-2 text-sm font-medium transition-all duration-300",
                        isCollapsed ? "justify-center !px-0" : "px-3 gap-3",
                        isActive
                          ? "bg-indigo-950 text-white"
                          : isDisabled
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                      onClick={(e) => {
                        if (isDisabled) e.preventDefault();
                        if (isMobile && !isDisabled) onClose?.();
                      }}
                    >
                      <Icon className={cn(
                        "h-5 w-5 min-w-[20px]",
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

      {/* Collapse Button (Desktop Only) */}
      {!isMobile && (
        <div className="mt-auto border-t py-3 px-4 flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Toggle sidebar"
                onClick={toggleCollapse}
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