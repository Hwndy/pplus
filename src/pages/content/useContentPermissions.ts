import { useAuth } from '@/components/auth/AuthContext';
import type { ContentScope } from '@/api/content';
import { roleOf } from '@/lib/roles';
import type { UserRef } from '@/types/api';

interface Owned {
  created_by?: string | UserRef | null;
}

const ownerId = (record: Owned) => (typeof record.created_by === 'object' ? record.created_by?.id : record.created_by);

/**
 * Mirrors the backend rules for approval-based content:
 * analysts create and edit their own work; supervisors review their analysts'
 * work; admins can do everything.
 */
export function useContentPermissions() {
  const { user } = useAuth();
  const role = roleOf(user);
  const isAdmin = role === 'Admin';
  const isSupervisor = role === 'Supervisor';
  const isAnalyst = role === 'Analyst';

  const scope: ContentScope = isAdmin ? 'all' : isSupervisor ? 'team' : 'mine';

  return {
    role,
    scope,
    canCreate: isAdmin || isAnalyst,
    canEdit: (record: Owned) => isAdmin || (isAnalyst && ownerId(record) === user?.id),
    canDelete: (record: Owned) => isAdmin || (isAnalyst && ownerId(record) === user?.id),
    canReview: (record: Owned) => isAdmin || (isSupervisor && ownerId(record) !== user?.id),
  };
}
