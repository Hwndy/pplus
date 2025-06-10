
import { useAuth } from '@/components/auth/AuthContext';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

// Helper function to check user roles (case-insensitive)
const hasRole = (userRole: string, allowedRoles: string | string[]): boolean => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.some(role => userRole.toLowerCase() === role.toLowerCase());
};
import { AnalystDashboard } from '@/components/dashboard/AnalystDashboard';
import { ClientDashboard } from '@/components/dashboard/ClientDashboard';
import { ClientMediaDashboard } from '@/components/dashboard/ClientMediaDashboard';
import { SupervisorDashboard } from '@/components/dashboard/SupervisorDashboard';
import { ExecutiveSummaryPage } from '@/components/dashboard/ExecutiveSummaryPage';
import { OutcomeInsightsPage as ClientOutcomeInsightsPage } from '@/components/dashboard/OutcomeInsightsPage';
import { IndustryLandscapePage } from '@/components/dashboard/IndustryLandscapePage';
import { BrandSentimentPage } from '@/components/dashboard/BrandSentimentPage';
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
import { PlaceholderPage } from '@/components/dashboard/PlaceholderPage';
import { Spinner } from '@/components/ui/spinner';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';

// Import all our page components
import UsersPage from './dashboard/UsersPage';
import ParametersPage from './dashboard/ParametersPage';
import ReportsPage from './dashboard/ReportsPage';
import AnalyticsPage from './dashboard/AnalyticsPage';
import AuditPage from './dashboard/AuditPage';
import ReviewPage from './dashboard/ReviewPage';
import ContentReviewListPage from './dashboard/ContentReviewListPage';
import ContentReviewPage from './dashboard/ContentReviewPage';
import DataEntryPage from './dashboard/DataEntryPage';
import SubmissionsPage from './dashboard/SubmissionsPage';
import MediaReportsPage from './dashboard/MediaReportsPage';
import PerformancePage from './dashboard/PerformancePage';
import SwotAnalysisPage from './dashboard/SwotAnalysisPage';
import SwotAnalysisEntryPage from './dashboard/SwotAnalysisEntryPage';
// import SwotMentionsPage from './dashboard/SwotMentionsPage';
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
import DailyMentionsViewPage from './dashboard/DailyMentionsViewPage';
import ApiDemoPage from './dashboard/ApiDemoPage';

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null; // The Layout component will redirect to login
  }

  // If we're at the dashboard root, render the appropriate dashboard based on user role
  if (location.pathname === '/dashboard') {
    return (
      <div className="h-full">
        {hasRole(user.role, 'admin') && <AdminDashboard />}
        {hasRole(user.role, 'supervisor') && <SupervisorDashboard />}
        {hasRole(user.role, 'analyst') && <AnalystDashboard />}
        {hasRole(user.role, 'client') && <ExecutiveSummaryPage />}
      </div>
    );
  }

  // Otherwise, render the sub-routes
  return (
    <div className="h-full">
      <Routes>
        {/* Common routes accessible to all roles */}
        <Route path="swot" element={<SwotAnalysisPage />} />
        <Route path="swot/create" element={
          hasRole(user.role, ['admin', 'analyst']) ? <SwotAnalysisEntryPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* Admin routes */}
        <Route path="users" element={
          hasRole(user.role, 'admin') ? <UsersPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="parameters" element={
          hasRole(user.role, 'admin') ? <ParametersPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="reports" element={
          hasRole(user.role, ['admin', 'supervisor']) ? <ReportsPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="analytics" element={
          hasRole(user.role, ['admin', 'supervisor']) ? <AnalyticsPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="audit" element={
          hasRole(user.role, 'admin') ? <AuditPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* Additional admin routes based on the sidebar */}
        <Route path="companies" element={
          hasRole(user.role, 'admin') ? <CompaniesPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="publications-management" element={
          hasRole(user.role, 'admin') ? <PublicationsPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="placement" element={
          hasRole(user.role, 'admin') ? <PlacementPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* Editorial routes - accessible to admin, analyst, and supervisor */}
        <Route path="editorial" element={
          hasRole(user.role, ['admin', 'analyst', 'supervisor']) ? <EditorialPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="editorial/create" element={
          hasRole(user.role, ['admin', 'analyst']) ? <CreateEditorialPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="editorial/batch-upload" element={
          hasRole(user.role, ['admin', 'analyst']) ? <EditorialBatchUploadPage /> : <Navigate to="/dashboard" replace />
        } />

        <Route path="channels" element={
          hasRole(user.role, 'admin') ? <div className="p-6"><h1 className="text-2xl font-bold">Channels</h1></div> : <Navigate to="/dashboard" replace />
        } />
        <Route path="campaign-types" element={
          hasRole(user.role, 'admin') ? <div className="p-6"><h1 className="text-2xl font-bold">Campaign Types</h1></div> : <Navigate to="/dashboard" replace />
        } />
        <Route path="activities" element={
          hasRole(user.role, 'admin') ? <div className="p-6"><h1 className="text-2xl font-bold">Activities</h1></div> : <Navigate to="/dashboard" replace />
        } />

        {/* Report module routes */}
        <Route path="print-editorial" element={
          hasRole(user.role, 'admin') ? <div className="p-6"><h1 className="text-2xl font-bold">Print Editorial</h1></div> : <Navigate to="/dashboard" replace />
        } />
        <Route path="online-editorial" element={
          hasRole(user.role, 'admin') ? <div className="p-6"><h1 className="text-2xl font-bold">Online Editorial</h1></div> : <Navigate to="/dashboard" replace />
        } />
        <Route path="print-advert" element={
          hasRole(user.role, 'admin') ? <div className="p-6"><h1 className="text-2xl font-bold">Print Advert</h1></div> : <Navigate to="/dashboard" replace />
        } />

        {/* Daily Mentions routes - accessible to admin, analyst, and supervisor */}
        <Route path="daily-mentions" element={
          hasRole(user.role, ['admin', 'analyst', 'supervisor']) ? <DailyMentionsViewPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="daily-mentions/create" element={
          hasRole(user.role, ['admin', 'analyst', 'supervisor']) ? <DailyMentionsPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="daily-mentions/view/:id" element={
          hasRole(user.role, ['admin', 'analyst', 'supervisor']) ? <DailyMentionsViewPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* SWOT Mentions routes - accessible to admin, analyst, and supervisor */}
        <Route path="swot-mentions" element={
          hasRole(user.role, ['admin', 'analyst', 'supervisor']) ? <SwotMentionsPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="social-media-mentions" element={
          hasRole(user.role, ['admin', 'analyst', 'supervisor']) ? <SocialMediaMentionsPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* Outcome & Insights routes - accessible to admin, analyst, and supervisor */}
        <Route path="outcome-insights" element={
          hasRole(user.role, ['admin', 'analyst', 'supervisor']) ? <OutcomeInsightsPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* Supervisor routes */}
        <Route path="review" element={
          hasRole(user.role, ['admin', 'supervisor']) ? <ReviewPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="content-review" element={
          hasRole(user.role, ['admin', 'supervisor']) ? <ContentReviewListPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="content-review/:contentType/:id" element={
          hasRole(user.role, ['admin', 'supervisor']) ? <ContentReviewPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* Analyst routes */}
        <Route path="submissions" element={
          hasRole(user.role, 'analyst') ? <SubmissionsPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* Client routes */}
        <Route path="media-reports" element={
          hasRole(user.role, 'client') ? <MediaReportsPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="performance" element={
          hasRole(user.role, 'client') ? <PerformancePage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="media-dashboard" element={
          hasRole(user.role, 'client') ? <ClientMediaDashboard /> : <Navigate to="/dashboard" replace />
        } />

        {/* New client routes based on sidebar */}
        <Route path="insights" element={
          hasRole(user.role, 'client') ? <ClientOutcomeInsightsPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="industry" element={
          hasRole(user.role, 'client') ? <IndustryLandscapePage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="brand-sentiment" element={
          hasRole(user.role, 'client') ? <BrandSentimentPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="brand-media" element={
          hasRole(user.role, 'client') ? <BrandMediaAnalysisPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="media-distribution" element={
          hasRole(user.role, 'client') ? <MediaDistributionPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="publications" element={
          hasRole(user.role, 'client') ? <PublicationsAnalysisPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="coverage-region" element={
          hasRole(user.role, 'client') ? <CoverageRegionPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="competitive" element={
          hasRole(user.role, 'client') ? <CompetitiveIntelligencePage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="competitive-sentiment" element={
          hasRole(user.role, 'client') ? <CompetitiveSentimentPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="competitive-ceos" element={
          hasRole(user.role, 'client') ? <CompetitiveCEOsPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="competitive-pr" element={
          hasRole(user.role, 'client') ? <CompetitivePRDriversPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="glossary" element={
          hasRole(user.role, 'client') ? <GlossaryPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="methodology" element={
          hasRole(user.role, 'client') ? <PrincipleMethodologyPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="mentions-inbox" element={
          hasRole(user.role, 'client') ? <DailyMentionsInboxPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* API Demo Page - accessible to admin only */}
        <Route path="api-demo" element={
          hasRole(user.role, 'admin') ? <ApiDemoPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* Fallback - redirect to the main dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default Dashboard;
