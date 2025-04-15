
import { useAuth } from '@/components/auth/AuthContext';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { AnalystDashboard } from '@/components/dashboard/AnalystDashboard';
import { ClientDashboard } from '@/components/dashboard/ClientDashboard';
import { SupervisorDashboard } from '@/components/dashboard/SupervisorDashboard';
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
        {user.role === 'client' && <ClientDashboard />}
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
          user.role === 'supervisor' ? <ReviewPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="content-review" element={
          user.role === 'supervisor' ? <ContentReviewListPage /> : <Navigate to="/dashboard" replace />
        } />
        <Route path="content-review/:contentType/:id" element={
          user.role === 'supervisor' ? <ContentReviewPage /> : <Navigate to="/dashboard" replace />
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

        {/* Fallback - redirect to the main dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default Dashboard;
