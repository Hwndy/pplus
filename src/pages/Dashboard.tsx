
import { useAuth } from '@/components/auth/AuthContext';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
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
        {user.role === 'admin' && <AdminDashboard />}
        {user.role === 'supervisor' && <SupervisorDashboard />}
        {user.role === 'analyst' && <AnalystDashboard />}
        {user.role === 'client' && <ExecutiveSummaryPage />}
      </div>
    );
  }

  // Otherwise, render the sub-routes
  return (
    <div className="h-full">
      <Routes>
        {/* Common routes accessible to all roles */}
        <Route path="swot" element={
          user.role === 'client' ? <PlaceholderPage title="SWOT Analysis" /> : <SwotAnalysisPage />
        } />
        <Route path="swot/create" element={
          ['admin', 'analyst'].includes(user.role) ? <SwotAnalysisEntryPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* Admin routes */}
        <Route path="users" element={
          user.role === 'admin' ? <UsersPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="parameters" element={
          user.role === 'admin' ? <ParametersPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="reports" element={
          ['admin', 'supervisor'].includes(user.role) ? <ReportsPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="analytics" element={
          ['admin', 'supervisor'].includes(user.role) ? <AnalyticsPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="audit" element={
          user.role === 'admin' ? <AuditPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* Additional admin routes based on the sidebar */}
        <Route path="companies" element={
          user.role === 'admin' ? <CompaniesPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="publications" element={
          user.role === 'admin' ? <PublicationsPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="placement" element={
          user.role === 'admin' ? <PlacementPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* Editorial routes - accessible to admin, analyst, and supervisor */}
        <Route path="editorial" element={
          ['admin', 'analyst', 'supervisor'].includes(user.role) ? <EditorialPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="editorial/create" element={
          ['admin', 'analyst'].includes(user.role) ? <CreateEditorialPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="editorial/batch-upload" element={
          ['admin', 'analyst'].includes(user.role) ? <EditorialBatchUploadPage /> : <Navigate to="/dashboard" replace />
        } />

        <Route path="channels" element={
          user.role === 'admin' ? <div className="p-6"><h1 className="text-2xl font-bold">Channels</h1></div> : <Navigate to="/dashboard" replace />
        } />
        <Route path="campaign-types" element={
          user.role === 'admin' ? <div className="p-6"><h1 className="text-2xl font-bold">Campaign Types</h1></div> : <Navigate to="/dashboard" replace />
        } />
        <Route path="activities" element={
          user.role === 'admin' ? <div className="p-6"><h1 className="text-2xl font-bold">Activities</h1></div> : <Navigate to="/dashboard" replace />
        } />

        {/* Report module routes */}
        <Route path="print-editorial" element={
          user.role === 'admin' ? <div className="p-6"><h1 className="text-2xl font-bold">Print Editorial</h1></div> : <Navigate to="/dashboard" replace />
        } />
        <Route path="online-editorial" element={
          user.role === 'admin' ? <div className="p-6"><h1 className="text-2xl font-bold">Online Editorial</h1></div> : <Navigate to="/dashboard" replace />
        } />
        <Route path="print-advert" element={
          user.role === 'admin' ? <div className="p-6"><h1 className="text-2xl font-bold">Print Advert</h1></div> : <Navigate to="/dashboard" replace />
        } />

        {/* Daily Mentions routes - accessible to admin, analyst, and supervisor */}
        <Route path="daily-mentions" element={
          ['admin', 'analyst', 'supervisor'].includes(user.role) ? <DailyMentionsViewPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="daily-mentions/create" element={
          ['admin', 'analyst', 'supervisor'].includes(user.role) ? <DailyMentionsPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="daily-mentions/view/:id" element={
          ['admin', 'analyst', 'supervisor'].includes(user.role) ? <DailyMentionsViewPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* SWOT Mentions routes - accessible to admin, analyst, and supervisor */}
        <Route path="swot-mentions" element={
          ['admin', 'analyst', 'supervisor'].includes(user.role) ? <SwotMentionsPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="social-media-mentions" element={
          ['admin', 'analyst', 'supervisor'].includes(user.role) ? <SocialMediaMentionsPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* Outcome & Insights routes - accessible to admin, analyst, and supervisor */}
        <Route path="outcome-insights" element={
          ['admin', 'analyst', 'supervisor'].includes(user.role) ? <OutcomeInsightsPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* Supervisor routes */}
        <Route path="review" element={
          ['admin', 'supervisor'].includes(user.role) ? <ReviewPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="content-review" element={
          ['admin', 'supervisor'].includes(user.role) ? <ContentReviewListPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="content-review/:contentType/:id" element={
          ['admin', 'supervisor'].includes(user.role) ? <ContentReviewPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* Analyst routes */}
        <Route path="submissions" element={
          user.role === 'analyst' ? <SubmissionsPage /> : <Navigate to="/dashboard" replace />
        } />

        {/* Client routes */}
        <Route path="media-reports" element={
          user.role === 'client' ? <MediaReportsPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="performance" element={
          user.role === 'client' ? <PerformancePage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="media-dashboard" element={
          user.role === 'client' ? <ClientMediaDashboard /> : <Navigate to="/dashboard" replace />
        } />

        {/* New client routes based on sidebar */}
        <Route path="insights" element={
          user.role === 'client' ? <ClientOutcomeInsightsPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="industry" element={
          user.role === 'client' ? <IndustryLandscapePage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="brand-sentiment" element={
          user.role === 'client' ? <BrandSentimentPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="brand-media" element={
          user.role === 'client' ? <BrandMediaAnalysisPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="media-distribution" element={
          user.role === 'client' ? <MediaDistributionPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="publications" element={
          user.role === 'client' ? <PublicationsAnalysisPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="coverage-region" element={
          user.role === 'client' ? <CoverageRegionPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="competitive" element={
          user.role === 'client' ? <PlaceholderPage title="Competitive Intelligence" /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="competitive-sentiment" element={
          user.role === 'client' ? <PlaceholderPage title="Competitive Sentiment Intelligence" /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="competitive-ceos" element={
          user.role === 'client' ? <PlaceholderPage title="Competitive CEOs Intelligence" /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="competitive-pr" element={
          user.role === 'client' ? <PlaceholderPage title="Competitive PR Drivers" /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="glossary" element={
          user.role === 'client' ? <PlaceholderPage title="Glossary" /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="methodology" element={
          user.role === 'client' ? <PlaceholderPage title="Principle & Methodology" /> : <Navigate to="/dashboard" replace />
        } />

        {/* Fallback - redirect to the main dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default Dashboard;
