import { useState, type ReactNode } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CheckCircle2, Download, Eye, MoreHorizontal, Pencil, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type Column } from '@/components/common/DataTable';
import { FilterBar, FilterDate, FilterSelect, REVIEW_STATUS_OPTIONS, SearchInput } from '@/components/common/Filters';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
import {
  CONTENT_RESOURCES, deleteContent, listContent, reviewContent, updateContent, type ContentKey, type ContentTypes,
} from '@/api/content';
import { exportApi, type ExportResource } from '@/api/audit';
import { getErrorMessage } from '@/lib/api-client';
import { formatDate } from '@/lib/format';
import type { ReviewStatus, UserRef } from '@/types/api';
import { ReviewDialog } from './ReviewDialog';
import { useContentPermissions } from './useContentPermissions';
import { useBulkContentActions } from './useBulkContentActions';

const EXPORT_RESOURCE: Record<ContentKey, ExportResource> = {
  editorials: 'editorials',
  dailyMentions: 'daily-mentions',
  swot: 'swot-analysis',
  socialMedia: 'social-media-mentions',
  outcomeInsights: 'outcome-insights',
  industryLandscape: 'industry-landscape-overview',
};

type Row<K extends ContentKey> = ContentTypes[K] & { id: number; status: ReviewStatus };

interface ContentListPageProps<K extends ContentKey> {
  resource: K;
  title: string;
  description: string;
  /** Resource-specific columns shown before the status/submitted-by/actions columns. */
  columns: Column<ContentTypes[K]>[];
  /** Primary "create" button (a link or a button that opens a dialog). */
  createAction?: ReactNode;
  /** Opens the edit experience for a row. */
  onEdit?: (row: ContentTypes[K]) => void;
  /** Full details for the side panel. */
  renderDetail: (row: ContentTypes[K]) => ReactNode;
  /** Title used in the side panel for a row. */
  rowTitle: (row: ContentTypes[K]) => string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  /** Supervisors may also create (editorials). */
  supervisorCanCreate?: boolean;
  /** Extra content under the header (e.g. an upload panel). */
  children?: ReactNode;
}

function submitter(row: { creator_data?: UserRef | null; created_by?: unknown }): string {
  if (row.creator_data?.username) return row.creator_data.username;
  const createdBy = row.created_by as UserRef | null | undefined;
  return typeof createdBy === 'object' && createdBy?.username ? createdBy.username : '—';
}

/**
 * Standard list screen for approval-based content: filters, paginated table,
 * row actions (view / edit / delete / approve / reject) according to the
 * user's role, and a detail side panel.
 */
export function ContentListPage<K extends ContentKey>({
  resource, title, description, columns, createAction, onEdit, renderDetail, rowTitle,
  showSearch, searchPlaceholder, supervisorCanCreate, children,
}: ContentListPageProps<K>) {
  const def = CONTENT_RESOURCES[resource];
  const perms = useContentPermissions();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<ContentTypes[K] | null>(null);
  const [deleting, setDeleting] = useState<Row<K> | null>(null);
  const [reviewing, setReviewing] = useState<{ row: Row<K>; decision: 'approved' | 'rejected' } | null>(null);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      await exportApi.download(EXPORT_RESOURCE[resource], 'csv', { status: status || undefined, date_from: dateFrom || undefined, date_to: dateTo || undefined });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  }

  const params = {
    page, limit, status: status as ReviewStatus | '', date_from: dateFrom, date_to: dateTo, search: showSearch ? search : undefined,
  };
  const queryKey = ['content', resource, perms.scope, params];
  const list = useQuery({
    queryKey,
    queryFn: () => listContent(resource, perms.scope, params),
    placeholderData: keepPreviousData,
  });

  const invalidate = [['content', resource], ['review']];
  const bulk = useBulkContentActions<ContentTypes[K]>(resource, JSON.stringify(params));
  const remove = useMutationWithToast({
    mutationFn: (row: Row<K>) => (perms.role === 'Admin' ? deleteContent(resource, row.id) : updateContent(resource, row.id, { is_deleted: true })),
    successMessage: `${def.label} deleted`,
    invalidate,
  });
  const review = useMutationWithToast({
    mutationFn: ({ row, decision, note }: { row: Row<K>; decision: 'approved' | 'rejected'; note: string }) =>
      reviewContent(resource, row.id, decision, note),
    successMessage: (_, v) => `${def.label} ${v.decision}`,
    invalidate,
  });

  const filtersActive = Boolean(status || dateFrom || dateTo || search);
  const reset = () => { setStatus(''); setDateFrom(''); setDateTo(''); setSearch(''); setPage(1); };
  const withPageReset = (setter: (v: string) => void) => (v: string) => { setter(v); setPage(1); };

  const allColumns: Column<ContentTypes[K]>[] = [
    ...columns,
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={(r as Row<K>).status} /> },
    ...(perms.scope === 'mine' ? [] : [{ key: 'submitted_by', header: 'Submitted by', cell: (r: ContentTypes[K]) => submitter(r as never) }]),
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (raw) => {
        const row = raw as Row<K>;
        const editable = perms.canEdit(row as never) && onEdit;
        const deletable = perms.canDelete(row as never);
        const reviewable = perms.canReview(row as never);
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Row actions" onClick={(e) => e.stopPropagation()}><MoreHorizontal /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onSelect={() => setViewing(raw)}><Eye /> View details</DropdownMenuItem>
              {editable && <DropdownMenuItem onSelect={() => onEdit(raw)}><Pencil /> Edit</DropdownMenuItem>}
              {reviewable && row.status !== 'approved' && (
                <DropdownMenuItem onSelect={() => setReviewing({ row, decision: 'approved' })}><CheckCircle2 /> Approve</DropdownMenuItem>
              )}
              {reviewable && row.status !== 'rejected' && (
                <DropdownMenuItem onSelect={() => setReviewing({ row, decision: 'rejected' })}><XCircle /> Reject</DropdownMenuItem>
              )}
              {deletable && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setDeleting(row)} className="text-destructive focus:text-destructive">
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const scopeHint = perms.scope === 'mine'
    ? 'Your submissions. Rejected items are listed first so you can rework them.'
    : perms.scope === 'team' ? 'Submissions from your analysts. Pending items are listed first.' : description;

  return (
    <>
      <PageHeader
        title={title}
        description={perms.scope === 'all' ? description : scopeHint}
        actions={(
          <>
            {perms.role === 'Admin' && (
              <Button variant="outline" onClick={handleExport} disabled={exporting}><Download /> Export CSV</Button>
            )}
            {(perms.canCreate || (supervisorCanCreate && perms.role === 'Supervisor')) && createAction}
          </>
        )}
      />
      {children}
      <FilterBar onReset={filtersActive ? reset : undefined}>
        {showSearch && <SearchInput value={search} onChange={withPageReset(setSearch)} placeholder={searchPlaceholder} />}
        <FilterSelect label="Status" value={status} onChange={withPageReset(setStatus)} options={REVIEW_STATUS_OPTIONS} allLabel="All statuses" />
        <FilterDate label="From" value={dateFrom} onChange={withPageReset(setDateFrom)} max={dateTo || undefined} />
        <FilterDate label="To" value={dateTo} onChange={withPageReset(setDateTo)} min={dateFrom || undefined} />
      </FilterBar>
      {bulk.toolbar}
      <DataTable
        columns={allColumns}
        rows={list.data?.data}
        getRowKey={(r) => (r as Row<K>).id}
        isLoading={list.isLoading}
        error={list.error}
        onRetry={() => list.refetch()}
        pagination={list.data?.pagination}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setLimit(size); setPage(1); }}
        selection={bulk.selection}
        onRowClick={setViewing}
        emptyTitle={`No ${def.pluralLabel.toLowerCase()} found`}
        emptyDescription={filtersActive ? 'Try adjusting your filters.' : undefined}
      />

      <Sheet open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {viewing && (
            <>
              <SheetHeader className="mb-6 space-y-2 text-left">
                <SheetTitle>{rowTitle(viewing)}</SheetTitle>
                <SheetDescription asChild>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={(viewing as Row<K>).status} />
                    <span>Submitted by {submitter(viewing as never)} on {formatDate((viewing as { createdAt?: string }).createdAt)}</span>
                  </div>
                </SheetDescription>
              </SheetHeader>
              {renderDetail(viewing)}
            </>
          )}
        </SheetContent>
      </Sheet>

      {bulk.dialogs}
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${def.label.toLowerCase()}?`}
        description="It will be removed from lists and reports. This can't be undone from the app."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleting && remove.mutateAsync(deleting)}
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
