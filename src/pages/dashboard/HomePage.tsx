import { useAuth } from '@/components/auth/AuthContext';
import { roleOf } from '@/lib/roles';
import AnalystHome from '@/pages/dashboard/AnalystHome';
import ReviewPage from '@/pages/review/ReviewPage';
import AdminHome from './AdminHome';

/** Role-based landing page for staff (clients land on their executive summary instead). */
export default function HomePage() {
  const { user } = useAuth();
  switch (roleOf(user)) {
    case 'Admin':
      return <AdminHome />;
    case 'Supervisor':
      return <ReviewPage />;
    case 'Analyst':
      return <AnalystHome />;
    default:
      return null;
  }
}
