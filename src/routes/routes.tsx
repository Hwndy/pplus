import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import {
  BarChart2, BarChart3, BookOpen, BookOpenText, Building2, CheckSquare, FileText, Gauge, Globe, History,
  Inbox, LayoutDashboard, LineChart, Newspaper, PieChart, Search, Settings, Share2, SlidersHorizontal,
  Target, TrendingUp, Users,
} from 'lucide-react';
import type { RoleName } from '@/types/api';

export interface AppRoute {
  /** Path relative to /dashboard ('' = the dashboard home). */
  path: string;
  component: LazyExoticComponent<ComponentType>;
  roles: readonly RoleName[];
  /** Sidebar entry; omitted for routes that are only reached from other pages. */
  nav?: { label: string; icon: ComponentType<{ className?: string }>; group: NavGroup };
}

export type NavGroup = 'Overview' | 'Administration' | 'Content' | 'Reports' | 'Reference';

const STAFF = ['Admin', 'Supervisor', 'Analyst'] as const;
const ADMIN = ['Admin'] as const;
const CLIENT = ['Client'] as const;

const page = (loader: () => Promise<{ default: ComponentType }>) => lazy(loader);

export const DASHBOARD_ROUTES: AppRoute[] = [
  {
    path: '',
    component: page(() => import('@/pages/dashboard/HomePage')),
    roles: ['Admin', 'Supervisor', 'Analyst'],
    nav: { label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  },
  {
    path: 'review',
    component: page(() => import('@/pages/review/ReviewPage')),
    roles: ['Admin'],
    nav: { label: 'Content review', icon: CheckSquare, group: 'Overview' },
  },

  // Administration
  { path: 'users', component: page(() => import('@/pages/admin/UsersPage')), roles: ADMIN, nav: { label: 'Users', icon: Users, group: 'Administration' } },
  { path: 'companies', component: page(() => import('@/pages/admin/CompaniesPage')), roles: ADMIN, nav: { label: 'Companies', icon: Building2, group: 'Administration' } },
  { path: 'publications-management', component: page(() => import('@/pages/admin/PublicationsPage')), roles: ADMIN, nav: { label: 'Publications', icon: BookOpenText, group: 'Administration' } },
  { path: 'sentiment-indicators', component: page(() => import('@/pages/admin/SentimentIndicatorsPage')), roles: ADMIN, nav: { label: 'Sentiment indicators', icon: Gauge, group: 'Administration' } },
  { path: 'parameters', component: page(() => import('@/pages/admin/ParametersPage')), roles: ADMIN, nav: { label: 'Parameters', icon: Settings, group: 'Administration' } },
  { path: 'audit-log', component: page(() => import('@/pages/admin/AuditLogPage')), roles: ADMIN, nav: { label: 'Audit log', icon: History, group: 'Administration' } },

  // Content workflow
  { path: 'editorials', component: page(() => import('@/pages/content/EditorialsPage')), roles: STAFF, nav: { label: 'Editorials', icon: Newspaper, group: 'Content' } },
  { path: 'editorials/new', component: page(() => import('@/pages/content/EditorialCreatePage')), roles: STAFF },
  { path: 'daily-mentions', component: page(() => import('@/pages/content/DailyMentionsPage')), roles: STAFF, nav: { label: 'Daily mentions', icon: FileText, group: 'Content' } },
  { path: 'daily-mentions/new', component: page(() => import('@/pages/content/DailyMentionFormPage')), roles: ['Admin', 'Analyst'] },
  { path: 'daily-mentions/:id/edit', component: page(() => import('@/pages/content/DailyMentionFormPage')), roles: ['Admin', 'Analyst'] },
  { path: 'daily-mentions/:id', component: page(() => import('@/pages/content/DailyMentionDetailPage')), roles: STAFF },
  { path: 'swot-analyses', component: page(() => import('@/pages/content/SwotAnalysesPage')), roles: STAFF, nav: { label: 'SWOT analyses', icon: Target, group: 'Content' } },
  { path: 'social-media', component: page(() => import('@/pages/content/SocialMediaMentionsPage')), roles: STAFF, nav: { label: 'Social media', icon: Share2, group: 'Content' } },
  { path: 'outcome-insights', component: page(() => import('@/pages/content/OutcomeInsightsPage')), roles: STAFF, nav: { label: 'Outcome & insights', icon: LineChart, group: 'Content' } },
  { path: 'industry-landscape', component: page(() => import('@/pages/content/IndustryLandscapePage')), roles: STAFF, nav: { label: 'Industry landscape', icon: Globe, group: 'Content' } },

  // Client reports
  { path: '', component: page(() => import('@/pages/client/ExecutiveSummaryPage')), roles: CLIENT, nav: { label: 'Executive summary', icon: LayoutDashboard, group: 'Reports' } },
  { path: 'mentions-inbox', component: page(() => import('@/pages/client/MentionsInboxPage')), roles: CLIENT, nav: { label: 'Daily mentions', icon: Inbox, group: 'Reports' } },
  { path: 'swot', component: page(() => import('@/pages/client/SwotReportPage')), roles: CLIENT, nav: { label: 'SWOT analysis', icon: Target, group: 'Reports' } },
  { path: 'insights', component: page(() => import('@/pages/client/OutcomeInsightsReportPage')), roles: CLIENT, nav: { label: 'Outcome & insights', icon: LineChart, group: 'Reports' } },
  { path: 'industry', component: page(() => import('@/pages/client/IndustryLandscapeReportPage')), roles: CLIENT, nav: { label: 'Industry landscape', icon: Globe, group: 'Reports' } },
  { path: 'brand-sentiment', component: page(() => import('@/pages/client/BrandSentimentPage')), roles: CLIENT, nav: { label: 'Brand sentiment', icon: BarChart3, group: 'Reports' } },
  { path: 'brand-media', component: page(() => import('@/pages/client/BrandMediaAnalysisPage')), roles: CLIENT, nav: { label: 'Brand media analysis', icon: BarChart2, group: 'Reports' } },
  { path: 'media-distribution', component: page(() => import('@/pages/client/ThematicDistributionPage')), roles: CLIENT, nav: { label: 'Thematic distribution', icon: PieChart, group: 'Reports' } },
  { path: 'publications', component: page(() => import('@/pages/client/PublicationsAnalysisPage')), roles: CLIENT, nav: { label: 'Publications & reporters', icon: Newspaper, group: 'Reports' } },
  { path: 'coverage-region', component: page(() => import('@/pages/client/SocialCoveragePage')), roles: CLIENT, nav: { label: 'Social & regional coverage', icon: Globe, group: 'Reports' } },
  { path: 'competitive', component: page(() => import('@/pages/client/CompetitiveIntelligencePage')), roles: CLIENT, nav: { label: 'Competitive intelligence', icon: Search, group: 'Reports' } },
  { path: 'competitive-sentiment', component: page(() => import('@/pages/client/CompetitiveSentimentPage')), roles: CLIENT, nav: { label: 'Competitive sentiment', icon: TrendingUp, group: 'Reports' } },
  { path: 'competitive-ceos', component: page(() => import('@/pages/client/CompetitiveCeosPage')), roles: CLIENT, nav: { label: 'Competitor CEOs', icon: Users, group: 'Reports' } },
  { path: 'competitive-pr', component: page(() => import('@/pages/client/CompetitivePrDriversPage')), roles: CLIENT, nav: { label: 'Competitive PR drivers', icon: SlidersHorizontal, group: 'Reports' } },
  { path: 'glossary', component: page(() => import('@/pages/client/GlossaryPage')), roles: CLIENT, nav: { label: 'Glossary', icon: BookOpen, group: 'Reference' } },
  { path: 'methodology', component: page(() => import('@/pages/client/MethodologyPage')), roles: CLIENT, nav: { label: 'Methodology', icon: FileText, group: 'Reference' } },
];

export const NAV_GROUP_ORDER: NavGroup[] = ['Overview', 'Administration', 'Content', 'Reports', 'Reference'];

export function routesFor(role: RoleName | null): AppRoute[] {
  if (!role) return [];
  return DASHBOARD_ROUTES.filter((r) => r.roles.includes(role));
}

export const dashboardPath = (path: string) => (path ? `/dashboard/${path}` : '/dashboard');
