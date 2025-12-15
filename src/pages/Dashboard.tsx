// src/components/dashboard/Dashboard.tsx
import { useAuth } from '@/components/auth/AuthContext';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { AnalystDashboard } from '@/components/dashboard/AnalystDashboard';
import { ClientDashboard } from '@/components/dashboard/ClientDashboard';
import { ClientMediaDashboard } from '@/components/dashboard/ClientMediaDashboard';
import { SupervisorDashboard } from '@/components/dashboard/SupervisorDashboard';
import { ExecutiveSummaryPage } from '@/components/dashboard/ExecutiveSummaryPage';
import ClientOutcomeInsightsPage from '@/components/dashboard/OutcomeInsightsPage';
import IndustryLandscapePage from '@/components/dashboard/IndustryLandscapePage';
import BrandSentimentPage from '@/components/dashboard/BrandSentimentPage';
import { BrandMediaAnalysisPage } from '@/components/dashboard/BrandMediaAnalysisPage';
import { MediaDistributionPage } from '@/components/dashboard/MediaDistributionPage';
import { PublicationsAnalysisPage } from '@/components/dashboard/PublicationsAnalysisPage';
import { CoverageRegionPage } from '@/components/dashboard/CoverageRegionPage';
import { CompetitiveIntelligencePage } from '@/components/dashboard/CompetitiveIntelligencePage';
import { CompetitiveSentimentPage } from '@/components/dashboard/CompetitiveSentimentPage';
import { CompetitiveCEOsPage } from '@/components/dashboard/CompetitiveCEOsPage';
import { CompetitivePRDriversPage } from '@/components/dashboard/CompetitivePRDriversPage';
import { GlossaryPage } from '@/components/dashboard/GlossaryPage';
import { PrincipleMethodologyPage } from '@/components/dashboard/PrincipleMethodologyPage';
import { DailyMentionsInboxPage } from '@/components/dashboard/DailyMentionsInboxPage';
import { Spinner } from '@/components/ui/spinner';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';

// Helper function to check user roles (case-insensitive and safe)
const hasRole = (user: any, allowedRoles: string | string[]): boolean => {
  if (!user || !user.role || !user.role.name) {
    return false; // No user, no role object, or no role name → deny access
  }

  const userRoleName = user.role.name.toLowerCase();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return roles.some((role) => userRoleName === role.toLowerCase());
};

// Import all page components
import UsersPage from './dashboard/UsersPage';
import ParametersPage from './dashboard/ParametersPage';
import ReportsPage from './dashboard/ReportsPage';
import AnalyticsPage from './dashboard/AnalyticsPage';
// import AuditPage from './dashboard/AuditPage';
import MediaReportsPage from './dashboard/MediaReportsPage';
import PerformancePage from './dashboard/PerformancePage';
import SwotAnalysisPage from './dashboard/SwotAnalysisPage';
import SwotAnalysisEntryPage from './dashboard/SwotAnalysisEntryPage';
import { SwotMentionsPage } from './dashboard/SwotMentionsPage';
import OutcomeInsightsPage from './dashboard/OutcomeInsightsPage';
import SocialMediaMentionsPage from './dashboard/SocialMediaMentionsPage';
import CompaniesPage from './dashboard/CompaniesPage';
import PublicationsPage from './dashboard/PublicationsPage';
import PlacementPage from './dashboard/PlacementPage';
import EditorialPage from './dashboard/EditorialPage';
import CreateEditorialPage from './dashboard/CreateEditorialPage';
import EditorialBatchUploadPage from './dashboard/EditorialBatchUploadPage';
import DailyMentionsPage from './dashboard/DailyMentionsPage';
import DailyMentionsTablePage from './dashboard/DailyMentionsTablePage';
import DailyMentionsViewPage from './dashboard/DailyMentionsViewPage';

// NEW: Industry Landscape Overview (CRUD Page)
import IndustryLandscapeOverviewPage from './dashboard/IndustryLandscapeOverviewPage';

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show spinner while auth is loading OR while we wait for role data
  if (isLoading || !user || !user.role || !user.role.name) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null; // Layout will redirect to login
  }

  // Root dashboard based on role
  if (location.pathname === '/dashboard') {
    return (
      <div className="h-full">
        {hasRole(user, 'admin') && <AdminDashboard />}
        {hasRole(user, 'supervisor') && <SupervisorDashboard />}
        {hasRole(user, 'analyst') && <AnalystDashboard />}
        {hasRole(user, 'client') && <ExecutiveSummaryPage />}
      </div>
    );
  }

  // All sub-routes
  return (
    <div className="h-full">
      <Routes>
        {/* COMMON */}
        <Route path="swot" element={<SwotAnalysisPage />} />
        <Route
          path="swot/create"
          element={hasRole(user, ['admin', 'analyst']) ? <SwotAnalysisEntryPage /> : <Navigate to="/dashboard" replace />}
        />

        {/* ADMIN */}
        <Route path="users" element={hasRole(user, 'admin') ? <UsersPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="parameters" element={hasRole(user, 'admin') ? <ParametersPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="reports" element={hasRole(user, 'admin') ? <ReportsPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="analytics" element={hasRole(user, 'admin') ? <AnalyticsPage /> : <Navigate to="/dashboard" replace />} />
        {/* <Route path="audit" element={hasRole(user, 'admin') ? <AuditPage /> : <Navigate to="/dashboard" replace />} /> */}
        <Route path="companies" element={hasRole(user, 'admin') ? <CompaniesPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="publications-management" element={hasRole(user, 'admin') ? <PublicationsPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="placement" element={hasRole(user, 'admin') ? <PlacementPage /> : <Navigate to="/dashboard" replace />} />

        {/* EDITORIAL (Admin, Analyst, Supervisor) */}
        <Route path="editorial" element={hasRole(user, ['admin', 'analyst', 'supervisor']) ? <EditorialPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="editorial/create" element={hasRole(user, ['admin', 'analyst', 'supervisor']) ? <CreateEditorialPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="editorial/batch-upload" element={hasRole(user, ['admin', 'analyst', 'supervisor']) ? <EditorialBatchUploadPage /> : <Navigate to="/dashboard" replace />} />

        {/* DAILY MENTIONS (Admin, Analyst, Supervisor) */}
        <Route path="daily-mentions" element={hasRole(user, ['admin', 'analyst', 'supervisor']) ? <DailyMentionsTablePage /> : <Navigate to="/dashboard" replace />} />
        <Route path="daily-mentions/create" element={hasRole(user, ['admin', 'analyst', 'supervisor']) ? <DailyMentionsPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="daily-mentions/view/:id" element={hasRole(user, ['admin', 'analyst', 'supervisor']) ? <DailyMentionsViewPage /> : <Navigate to="/dashboard" replace />} />

        {/* SWOT & SOCIAL (Admin, Analyst, Supervisor) */}
        <Route path="swot-mentions" element={hasRole(user, ['admin', 'analyst', 'supervisor']) ? <SwotMentionsPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="social-media-mentions" element={hasRole(user, ['admin', 'analyst', 'supervisor']) ? <SocialMediaMentionsPage /> : <Navigate to="/dashboard" replace />} />

        {/* OUTCOME INSIGHTS (Admin, Analyst, Supervisor) */}
        <Route path="outcome-insights" element={hasRole(user, ['admin', 'analyst', 'supervisor']) ? <OutcomeInsightsPage /> : <Navigate to="/dashboard" replace />} />

        {/* INDUSTRY LANDSCAPE OVERVIEW (Admin, Analyst, Supervisor) - FULL CRUD */}
        <Route
          path="industry-landscape"
          element={
            hasRole(user, ['admin', 'analyst', 'supervisor'])
              ? <IndustryLandscapeOverviewPage />
              : <Navigate to="/dashboard" replace />
          }
        />

        {/* SUPERVISOR */}
        <Route path="supervisordashboard" element={hasRole(user, ['admin', 'supervisor']) ? <SupervisorDashboard /> : <Navigate to="/dashboard" replace />} />
        <Route path="review" element={hasRole(user, ['admin', 'supervisor']) ? <SupervisorDashboard /> : <Navigate to="/dashboard" replace />} />

        {/* CLIENT ROUTES */}
        <Route path="media-reports" element={hasRole(user, 'client') ? <MediaReportsPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="performance" element={hasRole(user, 'client') ? <PerformancePage /> : <Navigate to="/dashboard" replace />} />
        <Route path="media-dashboard" element={hasRole(user, 'client') ? <ClientMediaDashboard /> : <Navigate to="/dashboard" replace />} />

        <Route path="insights" element={hasRole(user, 'client') ? <ClientOutcomeInsightsPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="industry" element={hasRole(user, 'client') ? <IndustryLandscapePage /> : <Navigate to="/dashboard" replace />} />
        <Route path="brand-sentiment" element={hasRole(user, 'client') ? <BrandSentimentPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="brand-media" element={hasRole(user, 'client') ? <BrandMediaAnalysisPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="media-distribution" element={hasRole(user, 'client') ? <MediaDistributionPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="publications" element={hasRole(user, 'client') ? <PublicationsAnalysisPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="coverage-region" element={hasRole(user, 'client') ? <CoverageRegionPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="competitive" element={hasRole(user, 'client') ? <CompetitiveIntelligencePage /> : <Navigate to="/dashboard" replace />} />
        <Route path="competitive-sentiment" element={hasRole(user, 'client') ? <CompetitiveSentimentPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="competitive-ceos" element={hasRole(user, 'client') ? <CompetitiveCEOsPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="competitive-pr" element={hasRole(user, 'client') ? <CompetitivePRDriversPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="glossary" element={hasRole(user, 'client') ? <GlossaryPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="methodology" element={hasRole(user, 'client') ? <PrincipleMethodologyPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="mentions-inbox" element={hasRole(user, 'client') ? <DailyMentionsInboxPage /> : <Navigate to="/dashboard" replace />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default Dashboard;