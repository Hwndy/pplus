import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type Column } from '@/components/common/DataTable';
import { FilterBar, FilterSelect, SearchInput } from '@/components/common/Filters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAuth } from '@/components/auth/AuthContext';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
import { useRoles } from '@/hooks/useLookups';
import { usersApi } from '@/api/users';
import { exportApi } from '@/api/audit';
import { formatDate } from '@/lib/format';
import { getErrorMessage } from '@/lib/api-client';
import { toast } from 'sonner';
import type { User, UserStatus } from '@/types/api';
import { UserFormDialog } from './UserFormDialog';
import { SubscriptionBadge } from './SubscriptionBadge';
import { formatPeriodDate, userSubscriptions } from './subscription';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

export default function UsersPage() {
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<User | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [exporting, setExporting] = useState(false);
  const roles = useRoles();
  const [searchParams, setSearchParams] = useSearchParams();

  // Quick links elsewhere open the "Add user" dialog with ?new=1.
  useEffect(() => {
    if (searchParams.get('new') !== '1') return;
    setEditing(null);
    setFormOpen(true);
    setSearchParams((prev) => { const next = new URLSearchParams(prev); next.delete('new'); return next; }, { replace: true });
  }, [searchParams, setSearchParams]);

  const params = { page, limit: 10, search: search || undefined, role: role ? Number(role) : undefined, status: (status || undefined) as UserStatus | undefined };
  const users = useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  });

  const remove = useMutationWithToast({
    mutationFn: (u: User) => usersApi.remove(u.id),
    successMessage: (_, u) => `${u.username} was removed`,
    invalidate: [['users']],
  });

  const resetPage = <T,>(setter: (v: T) => void) => (value: T) => { setter(value); setPage(1); };

  async function handleExport() {
    setExporting(true);
    try {
      await exportApi.download('users', 'csv', { search: search || undefined, role: role || undefined });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  }

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'User',
      cell: (u) => (
        <div className="min-w-0">
          <p className="font-medium">{u.username}</p>
          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
        </div>
      ),
    },
    { key: 'role', header: 'Role', cell: (u) => u.role?.name ?? '—' },
    { key: 'phone', header: 'Phone', cell: (u) => `${u.country_code} ${u.mobile_number}` },
    {
      key: 'details',
      header: 'Assignment',
      cell: (u) => {
        if (u.role?.name === 'Analyst') return u.supervisor_data?.username ? `Supervisor: ${u.supervisor_data.username}` : '—';
        if (u.role?.name === 'Supervisor') return `${u.analysts_data?.length ?? 0} analyst(s)`;
        if (u.role?.name === 'Client') return `${u.company_monitorings?.length ?? 0} monitored company(ies)`;
        return '—';
      },
    },
    {
      key: 'subscription',
      header: 'Subscription',
      cell: (u) => {
        if (u.role?.name !== 'Client') return <span className="text-muted-foreground">—</span>;
        const subscriptions = userSubscriptions(u);
        if (subscriptions.length === 0) return <span className="text-muted-foreground">None</span>;
        const [first] = subscriptions;
        const others = subscriptions.length - 1;
        return (
          <div
            className="flex min-w-0 flex-col items-start gap-1"
            title={subscriptions
              .map((s) => `${s.monitoring.company?.company_name ?? 'Company'}: ${formatPeriodDate(s.state.start)} – ${formatPeriodDate(s.state.end)}`)
              .join('\n')}
          >
            <SubscriptionBadge state={first.state} />
            <p className="truncate text-xs text-muted-foreground">
              {first.monitoring.company?.company_name ?? 'Company'}
              {others > 0 && ` · +${others} more`}
            </p>
          </div>
        );
      },
    },
    { key: 'status', header: 'Status', cell: (u) => <StatusBadge status={u.status} /> },
    { key: 'created', header: 'Created', cell: (u) => formatDate(u.createdAt) },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (u) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Actions for ${u.username}`}><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => { setEditing(u); setFormOpen(true); }}>
              <Pencil /> Edit
            </DropdownMenuItem>
            {u.id !== me?.id && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setDeleting(u)} className="text-destructive focus:text-destructive">
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage staff and client accounts, roles and monitoring assignments."
        actions={(
          <>
            <Button variant="outline" onClick={handleExport} disabled={exporting}><Download /> Export CSV</Button>
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}><Plus /> Add user</Button>
          </>
        )}
      />
      <FilterBar onReset={search || role || status ? () => { setSearch(''); setRole(''); setStatus(''); setPage(1); } : undefined}>
        <SearchInput value={search} onChange={resetPage(setSearch)} placeholder="Search name or email" />
        <FilterSelect label="Role" value={role} onChange={resetPage(setRole)} options={(roles.data ?? []).map((r) => ({ value: String(r.id), label: r.name }))} allLabel="All roles" />
        <FilterSelect label="Status" value={status} onChange={resetPage(setStatus)} options={STATUS_OPTIONS} allLabel="All statuses" />
      </FilterBar>
      <DataTable
        columns={columns}
        rows={users.data?.data}
        getRowKey={(u) => u.id}
        isLoading={users.isLoading}
        error={users.error}
        onRetry={() => users.refetch()}
        pagination={users.data?.pagination}
        onPageChange={setPage}
        emptyTitle="No users found"
        emptyDescription={search || role || status ? 'Try adjusting your filters.' : 'Add the first user to get started.'}
      />
      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editing}
        onSaved={() => {
          toast.success(editing ? 'User updated' : 'User created. A welcome email has been sent.');
          queryClient.invalidateQueries({ queryKey: ['users'] });
          queryClient.invalidateQueries({ queryKey: ['lookups', 'supervisors'] });
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete user?"
        description={deleting ? `${deleting.username} will lose access immediately. Their past work and audit history are kept.` : ''}
        confirmLabel="Delete user"
        destructive
        onConfirm={() => deleting && remove.mutateAsync(deleting)}
      />
    </>
  );
}
