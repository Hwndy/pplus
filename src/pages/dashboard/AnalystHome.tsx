import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { CheckCircle2, ClipboardList, Clock, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard, StatCard, StatGrid } from '@/components/common/Cards';
import { DataTable, type Column } from '@/components/common/DataTable';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { listContent, type ContentKey } from '@/api/content';
import { formatDate, formatNumber } from '@/lib/format';
import {
  CONTENT_KEYS, CONTENT_NEW_PATHS, CONTENT_PAGE_PATHS, CONTENT_TYPE_LABELS, contentCompanyName, contentDate,
  contentSupervisorNote, contentTitle, contentUpdatedAt, contentViewPath, type AnyContent,
} from '@/pages/content/ContentSummary';

const COUNTED = ['pending', 'approved'] as const;
const REWORK_PER_TYPE = 5;
const REWORK_LIMIT = 10;

/** Analyst home: status of the analyst's own submissions and anything sent back for rework. */
export default function AnalystHome() {
  const counts = useQueries({
    queries: CONTENT_KEYS.flatMap((key) => COUNTED.map((status) => ({
      queryKey: ['content', key, 'mine', 'count', status],
      queryFn: async () => (await listContent(key, 'mine', { status, limit: 1 })).pagination.total,
    }))),
  });
  // The rejected lists double as the "rejected" counts (pagination.total).
  const rejected = useQueries({
    queries: CONTENT_KEYS.map((key) => ({
      queryKey: ['content', key, 'mine', 'rejected', REWORK_PER_TYPE],
      queryFn: () => listContent(key, 'mine', { status: 'rejected', limit: REWORK_PER_TYPE }),
    })),
  });

  const countOf = (key: ContentKey, status: (typeof COUNTED)[number]) =>
    counts[CONTENT_KEYS.indexOf(key) * COUNTED.length + COUNTED.indexOf(status)];
  const rejectedOf = (key: ContentKey) => rejected[CONTENT_KEYS.indexOf(key)];

  const countsLoading = counts.some((q) => q.isLoading) || rejected.some((q) => q.isLoading);
  const sum = (values: (number | undefined)[]) => values.reduce<number>((acc, v) => acc + (v ?? 0), 0);
  const totalPending = sum(CONTENT_KEYS.map((k) => countOf(k, 'pending').data));
  const totalApproved = sum(CONTENT_KEYS.map((k) => countOf(k, 'approved').data));
  const totalRejected = sum(CONTENT_KEYS.map((k) => rejectedOf(k).data?.pagination.total));

  const cellCount = (loading: boolean, value: number | undefined, error: unknown) => {
    if (loading) return <Skeleton className="ml-auto h-4 w-8" />;
    return error ? '—' : formatNumber(value ?? 0);
  };

  const typeColumns: Column<ContentKey>[] = [
    {
      key: 'type',
      header: 'Content type',
      cell: (key) => <Link to={CONTENT_PAGE_PATHS[key]} className="font-medium hover:underline">{CONTENT_TYPE_LABELS[key]}</Link>,
    },
    ...COUNTED.map((status) => ({
      key: status,
      header: status === 'pending' ? 'Pending' : 'Approved',
      align: 'right' as const,
      cell: (key: ContentKey) => {
        const q = countOf(key, status);
        return cellCount(q.isLoading, q.data, q.error);
      },
    })),
    {
      key: 'rejected',
      header: 'Rejected',
      align: 'right',
      cell: (key) => {
        const q = rejectedOf(key);
        return cellCount(q.isLoading, q.data?.pagination.total, q.error);
      },
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (key) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" asChild><Link to={CONTENT_PAGE_PATHS[key]}>Open</Link></Button>
          <Button variant="outline" size="sm" asChild><Link to={CONTENT_NEW_PATHS[key]}><Plus /> New</Link></Button>
        </div>
      ),
    },
  ];

  const rework = CONTENT_KEYS
    .flatMap((key) => (rejectedOf(key).data?.data ?? []).map((row) => ({ key, row })))
    .sort((a, b) => contentUpdatedAt(b.row).localeCompare(contentUpdatedAt(a.row)))
    .slice(0, REWORK_LIMIT);
  const reworkLoading = rejected.some((q) => q.isLoading);
  const reworkError = rejected.find((q) => q.error);

  return (
    <>
      <PageHeader title="Dashboard" description="Your submissions at a glance" />
      <StatGrid className="mb-6">
        <StatCard label="Awaiting review" value={formatNumber(totalPending)} loading={countsLoading} icon={Clock} />
        <StatCard label="Approved" value={formatNumber(totalApproved)} loading={countsLoading} icon={CheckCircle2} />
        <StatCard label="Needs rework" value={formatNumber(totalRejected)} loading={countsLoading} icon={RotateCcw} />
        <StatCard
          label="Total submissions"
          value={formatNumber(totalPending + totalApproved + totalRejected)}
          loading={countsLoading}
          icon={ClipboardList}
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <SectionCard title="Your content" description="Submissions by type and review status." className="xl:col-span-3">
          <DataTable columns={typeColumns} rows={CONTENT_KEYS} getRowKey={(key) => key} />
        </SectionCard>

        <SectionCard
          title="Needs rework"
          description="Rejected submissions with your supervisor's feedback."
          className="xl:col-span-2"
        >
          {reworkLoading ? (
            <LoadingState />
          ) : reworkError && rework.length === 0 ? (
            <ErrorState error={reworkError.error} onRetry={() => rejected.forEach((q) => q.refetch())} />
          ) : rework.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Nothing needs rework"
              description="Rejected submissions will appear here with your supervisor's note."
            />
          ) : (
            <ul className="divide-y">
              {rework.map(({ key, row }: { key: ContentKey; row: AnyContent }) => (
                <li key={`${key}-${row.id}`} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-medium">{contentTitle(key, row)}</p>
                    <p className="text-xs text-muted-foreground">
                      {CONTENT_TYPE_LABELS[key]} · {contentCompanyName(row)} · {formatDate(contentDate(row))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {contentSupervisorNote(row) ? <>&ldquo;{contentSupervisorNote(row)}&rdquo;</> : 'No note from your supervisor.'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild className="shrink-0">
                    <Link to={contentViewPath(key, row)}>Open</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}
