import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import {
  CheckCircle2, ClipboardCheck, Clock, Eye, MoreHorizontal, Users, XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard, StatGrid } from '@/components/common/Cards';
import { DataTable, type Column } from '@/components/common/DataTable';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
import {
  CONTENT_RESOURCES, getSupervisorDashboard, listContent, reviewContent, type ContentKey,
} from '@/api/content';
import { formatDate, formatNumber } from '@/lib/format';
import type { Pagination, ReviewStatus } from '@/types/api';
import { ReviewDialog } from '@/pages/content/ReviewDialog';
import { useContentPermissions } from '@/pages/content/useContentPermissions';
import {
  CONTENT_KEYS, CONTENT_TYPE_LABELS, contentCompanyName, contentDate, contentSubmitter, contentTitle, contentViewPath,
  type AnyContent,
} from '@/pages/content/ContentSummary';

type Decision = 'approved' | 'rejected';
type Reviewable = AnyContent & { id: number; status: ReviewStatus };

const STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected'];

// ------------------------------------------------------------------ shared table

function ReviewTable({ resource, rows, isLoading, error, onRetry, pagination, onPageChange, emptyDescription }: {
  resource: ContentKey;
  rows: AnyContent[] | undefined;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  pagination?: Pagination;
  onPageChange: (page: number) => void;
  emptyDescription: string;
}) {
  const perms = useContentPermissions();
  const def = CONTENT_RESOURCES[resource];
  const [reviewing, setReviewing] = useState<{ row: Reviewable; decision: Decision } | null>(null);

  const review = useMutationWithToast({
    mutationFn: ({ row, decision, note }: { row: Reviewable; decision: Decision; note: string }) =>
      reviewContent(resource, row.id, decision, note),
    successMessage: (_, v) => `${def.label} ${v.decision}`,
    invalidate: [['review'], ['content', resource]],
  });

  const columns: Column<AnyContent>[] = [
    {
      key: 'title',
      header: 'Title',
      cell: (r) => <span className="block max-w-xs truncate font-medium">{contentTitle(resource, r)}</span>,
    },
    { key: 'company', header: 'Company', cell: (r) => contentCompanyName(r) },
    { key: 'date', header: 'Date', cell: (r) => formatDate(contentDate(r)) },
    { key: 'submitted_by', header: 'Submitted by', cell: (r) => contentSubmitter(r) },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={(r as Reviewable).status} /> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (raw) => {
        const row = raw as Reviewable;
        const reviewable = perms.canReview(row as never);
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Row actions"><MoreHorizontal /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={contentViewPath(resource, raw)}><Eye /> View</Link>
              </DropdownMenuItem>
              {reviewable && row.status !== 'approved' && (
                <DropdownMenuItem onSelect={() => setReviewing({ row, decision: 'approved' })}><CheckCircle2 /> Approve</DropdownMenuItem>
              )}
              {reviewable && row.status !== 'rejected' && (
                <DropdownMenuItem onSelect={() => setReviewing({ row, decision: 'rejected' })}><XCircle /> Reject</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => (r as Reviewable).id}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        pagination={pagination}
        onPageChange={onPageChange}
        emptyTitle="You're all caught up"
        emptyDescription={emptyDescription}
      />
      {reviewing && (
        <ReviewDialog
          open
          onOpenChange={(open) => !open && setReviewing(null)}
          decision={reviewing.decision}
          itemLabel={def.label}
          onSubmit={(note) => review.mutateAsync({ ...reviewing, note })}
        />
      )}
    </>
  );
}

function TabLabel({ resource, pending }: { resource: ContentKey; pending: number | undefined }) {
  return (
    <span className="flex items-center gap-2">
      {CONTENT_TYPE_LABELS[resource]}
      {pending ? <Badge variant="warning" className="px-1.5 py-0">{formatNumber(pending)}</Badge> : null}
    </span>
  );
}

function CaughtUp() {
  return (
    <div className="mb-6 rounded-lg border bg-card">
      <EmptyState icon={CheckCircle2} title="You're all caught up" description="No submissions are waiting for review." />
    </div>
  );
}

// ------------------------------------------------------------------ admin

function useAdminCounts() {
  const queries = useQueries({
    queries: CONTENT_KEYS.flatMap((key) => STATUSES.map((status) => ({
      queryKey: ['review', 'count', key, status],
      queryFn: async () => (await listContent(key, 'all', { status, limit: 1 })).pagination.total,
    }))),
  });
  const count = (key: ContentKey, status: ReviewStatus) =>
    queries[CONTENT_KEYS.indexOf(key) * STATUSES.length + STATUSES.indexOf(status)]?.data;
  const total = (status: ReviewStatus) => CONTENT_KEYS.reduce((sum, key) => sum + (count(key, status) ?? 0), 0);
  return { count, total, isLoading: queries.some((q) => q.isLoading) };
}

function AdminTab({ resource, counts }: { resource: ContentKey; counts: ReturnType<typeof useAdminCounts> }) {
  const [page, setPage] = useState(1);
  const list = useQuery({
    queryKey: ['review', 'pending', resource, page],
    queryFn: () => listContent(resource, 'all', { status: 'pending', page, limit: 10 }),
    placeholderData: keepPreviousData,
  });
  const loading = counts.isLoading;
  return (
    <div className="space-y-4">
      <StatGrid className="xl:grid-cols-3">
        <StatCard label="Pending" value={formatNumber(counts.count(resource, 'pending'))} loading={loading} icon={Clock} />
        <StatCard label="Approved" value={formatNumber(counts.count(resource, 'approved'))} loading={loading} icon={CheckCircle2} />
        <StatCard label="Rejected" value={formatNumber(counts.count(resource, 'rejected'))} loading={loading} icon={XCircle} />
      </StatGrid>
      <ReviewTable
        resource={resource}
        rows={list.data?.data}
        isLoading={list.isLoading}
        error={list.error}
        onRetry={() => list.refetch()}
        pagination={list.data?.pagination}
        onPageChange={setPage}
        emptyDescription={`No ${CONTENT_RESOURCES[resource].pluralLabel.toLowerCase()} are waiting for review.`}
      />
    </div>
  );
}

function AdminReview() {
  const [tab, setTab] = useState<ContentKey>('editorials');
  const counts = useAdminCounts();
  const pending = counts.total('pending');

  return (
    <>
      <PageHeader title="Content review" description="Approve or reject pending submissions across every content type." />
      <StatGrid className="mb-6">
        <StatCard label="Pending review" value={formatNumber(pending)} loading={counts.isLoading} icon={Clock} />
        <StatCard label="Approved" value={formatNumber(counts.total('approved'))} loading={counts.isLoading} icon={CheckCircle2} />
        <StatCard label="Rejected" value={formatNumber(counts.total('rejected'))} loading={counts.isLoading} icon={XCircle} />
        <StatCard
          label="Total submissions"
          value={formatNumber(pending + counts.total('approved') + counts.total('rejected'))}
          loading={counts.isLoading}
          icon={ClipboardCheck}
        />
      </StatGrid>
      {!counts.isLoading && pending === 0 && <CaughtUp />}
      <Tabs value={tab} onValueChange={(v) => setTab(v as ContentKey)}>
        <TabsList className="mb-4 h-auto flex-wrap justify-start">
          {CONTENT_KEYS.map((key) => (
            <TabsTrigger key={key} value={key}><TabLabel resource={key} pending={counts.count(key, 'pending')} /></TabsTrigger>
          ))}
        </TabsList>
        {CONTENT_KEYS.map((key) => (
          <TabsContent key={key} value={key}><AdminTab resource={key} counts={counts} /></TabsContent>
        ))}
      </Tabs>
    </>
  );
}

// ------------------------------------------------------------------ supervisor

const statsFor = (resource: ContentKey, stats: Record<string, number> | undefined) => {
  const key = CONTENT_RESOURCES[resource].statsKey;
  return {
    total: stats?.[`total_${key}`],
    pending: stats?.[`pending_${key}`],
    approved: stats?.[`approved_${key}`],
    rejected: stats?.[`rejected_${key}`],
  };
};

function SupervisorTab({ resource }: { resource: ContentKey }) {
  const [page, setPage] = useState(1);
  const dashboard = useQuery({
    queryKey: ['review', 'supervisor', resource, page],
    queryFn: () => getSupervisorDashboard(resource, page),
    placeholderData: keepPreviousData,
  });
  const stats = statsFor(resource, dashboard.data?.stats);
  const loading = dashboard.isLoading;
  return (
    <div className="space-y-4">
      <StatGrid>
        <StatCard label="Pending" value={formatNumber(stats.pending)} loading={loading} icon={Clock} />
        <StatCard label="Approved" value={formatNumber(stats.approved)} loading={loading} icon={CheckCircle2} />
        <StatCard label="Rejected" value={formatNumber(stats.rejected)} loading={loading} icon={XCircle} />
        <StatCard label="Total submitted" value={formatNumber(stats.total)} loading={loading} icon={ClipboardCheck} />
      </StatGrid>
      <ReviewTable
        resource={resource}
        rows={dashboard.data?.recent.data}
        isLoading={loading}
        error={dashboard.error}
        onRetry={() => dashboard.refetch()}
        pagination={dashboard.data?.recent.pagination}
        onPageChange={setPage}
        emptyDescription={`Your analysts have not submitted any ${CONTENT_RESOURCES[resource].pluralLabel.toLowerCase()} yet.`}
      />
    </div>
  );
}

function SupervisorReview() {
  const [tab, setTab] = useState<ContentKey>('editorials');
  const dashboards = useQueries({
    queries: CONTENT_KEYS.map((key) => ({
      queryKey: ['review', 'supervisor', key, 1],
      queryFn: () => getSupervisorDashboard(key, 1),
    })),
  });
  const loading = dashboards.some((q) => q.isLoading);
  const firstError = dashboards.find((q) => q.error);
  const sum = (field: (i: number) => number | undefined) => CONTENT_KEYS.reduce((acc, _, i) => acc + (field(i) ?? 0), 0);
  const pending = sum((i) => statsFor(CONTENT_KEYS[i], dashboards[i].data?.stats).pending);
  const approvedToday = sum((i) => dashboards[i].data?.stats.approved_today);
  const rejectedToday = sum((i) => dashboards[i].data?.stats.rejected_today);
  const analysts = dashboards.find((q) => q.data)?.data?.analysts ?? [];
  const analystNames = analysts.length > 3
    ? `${analysts.slice(0, 3).map((a) => a.username).join(', ')} and ${analysts.length - 3} more`
    : analysts.map((a) => a.username).join(', ');

  const header = <PageHeader title="Content review" description="Approve or reject submissions from your analysts." />;

  if (loading) return <>{header}<LoadingState /></>;
  if (firstError && dashboards.every((q) => !q.data)) {
    return <>{header}<ErrorState error={firstError.error} onRetry={() => dashboards.forEach((q) => q.refetch())} /></>;
  }
  if (analysts.length === 0) {
    return (
      <>
        {header}
        <div className="rounded-lg border bg-card">
          <EmptyState
            icon={Users}
            title="No analysts assigned to you"
            description="Submissions appear here once an administrator assigns analysts to you. Contact your administrator to set up your team."
          />
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      <StatGrid className="mb-6">
        <StatCard label="Pending review" value={formatNumber(pending)} icon={Clock} />
        <StatCard label="Approved today" value={formatNumber(approvedToday)} icon={CheckCircle2} />
        <StatCard label="Rejected today" value={formatNumber(rejectedToday)} icon={XCircle} />
        <StatCard label="Analysts" value={formatNumber(analysts.length)} hint={analystNames} icon={Users} />
      </StatGrid>
      {pending === 0 && <CaughtUp />}
      <Tabs value={tab} onValueChange={(v) => setTab(v as ContentKey)}>
        <TabsList className="mb-4 h-auto flex-wrap justify-start">
          {CONTENT_KEYS.map((key, i) => (
            <TabsTrigger key={key} value={key}>
              <TabLabel resource={key} pending={statsFor(key, dashboards[i].data?.stats).pending} />
            </TabsTrigger>
          ))}
        </TabsList>
        {CONTENT_KEYS.map((key) => (
          <TabsContent key={key} value={key}><SupervisorTab resource={key} /></TabsContent>
        ))}
      </Tabs>
    </>
  );
}

/** Review queue: the supervisor's home and the admin "Content review" page. */
export default function ReviewPage() {
  const perms = useContentPermissions();
  return perms.role === 'Supervisor' ? <SupervisorReview /> : <AdminReview />;
}
