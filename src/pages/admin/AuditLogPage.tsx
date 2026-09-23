import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Activity, AlertOctagon, CalendarClock, Download, Eye, Loader2, MoreHorizontal, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard, StatGrid } from '@/components/common/Cards';
import { DataTable, type Column } from '@/components/common/DataTable';
import { FilterBar, FilterDate, FilterSelect, SearchInput } from '@/components/common/Filters';
import { DetailGrid, DetailSection } from '@/components/common/Detail';
import { StatusBadge } from '@/components/common/StatusBadge';
import { auditApi, type AuditLogParams } from '@/api/audit';
import { getErrorMessage } from '@/lib/api-client';
import { formatDateTime, formatNumber, humanize } from '@/lib/format';
import type { AuditLog, Severity } from '@/types/api';

const PAGE_SIZE = 20;

const SEVERITY_OPTIONS: { value: Severity; label: string }[] = [
  { value: 'INFO', label: 'Info' },
  { value: 'WARNING', label: 'Warning' },
  { value: 'ERROR', label: 'Error' },
  { value: 'CRITICAL', label: 'Critical' },
];

/** Mirrors ACTION_TYPES in the backend (src/utils/auditTrail.js). */
const ACTIONS = [
  'CREATE', 'CREATE_FAILED', 'READ', 'UPDATE', 'DELETE',
  'LOGIN', 'LOGIN_BLOCKED', 'LOGIN_FAILED', 'LOGIN_SUCCESS', 'LOGOUT',
  'EMAIL_RATE_LIMITED', 'EMAIL_RATE_LIMIT_TRIGGERED', 'IP_RATE_LIMITED', 'IP_RATE_LIMIT_TRIGGERED',
  'PASSWORD_RESET_ATTEMPTED', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_FAILED', 'PASSWORD_RESET',
  'PASSWORD_CHANGED', 'PASSWORD_CHANGE_FAILED', 'ACCOUNT_LOCKED', 'SUSPICIOUS_ACTIVITY',
  'EXPORT', 'IMPORT', 'APPROVE', 'REJECT', 'RESTORE', 'ARCHIVE', 'BULK_CREATE', 'BULK_UPDATE', 'BULK_DELETE',
];
const ACTION_OPTIONS = ACTIONS.map((a) => ({ value: a, label: humanize(a) }));

/** Resource types written by the backend's audit trail. */
const RESOURCE_TYPES = [
  'auth', 'users', 'companies', 'subsidiaries', 'publications', 'sentiment_keyword_indicators',
  'data_parameters', 'data_parameter_categories', 'data_parameter_values',
  'editorials', 'daily_mentions', 'swot_analysis', 'social_media_mentions', 'outcome_insights',
  'industry_landscape_overview', 'files', 'audit_logs',
];
const RESOURCE_OPTIONS = RESOURCE_TYPES.map((r) => ({ value: r, label: humanize(r) }));

function hasContent(value: Record<string, unknown> | null | undefined): value is Record<string, unknown> {
  return Boolean(value && Object.keys(value).length > 0);
}

function JsonBlock({ value }: { value: Record<string, unknown> }) {
  return (
    <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-md border bg-muted/40 p-3 font-mono text-xs leading-relaxed">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function actor(log: AuditLog): string {
  return log.user?.username || log.user?.email || 'System';
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [action, setAction] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewing, setViewing] = useState<AuditLog | null>(null);
  const [exporting, setExporting] = useState<'csv' | 'json' | null>(null);

  const filters: AuditLogParams = {
    search: search || undefined,
    severity: (severity || undefined) as Severity | undefined,
    action: action || undefined,
    resource_type: resourceType || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  };
  const params: AuditLogParams = { ...filters, page, limit: PAGE_SIZE };

  const logs = useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditApi.list(params),
    placeholderData: keepPreviousData,
  });
  const stats = useQuery({ queryKey: ['audit-stats'], queryFn: () => auditApi.stats() });

  const withReset = (setter: (v: string) => void) => (value: string) => { setter(value); setPage(1); };
  const hasFilters = Boolean(search || severity || action || resourceType || dateFrom || dateTo);

  async function handleExport(format: 'csv' | 'json') {
    setExporting(format);
    try {
      await auditApi.export(filters, format);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(null);
    }
  }

  const columns: Column<AuditLog>[] = [
    { key: 'time', header: 'Time', className: 'whitespace-nowrap', cell: (l) => formatDateTime(l.createdAt) },
    {
      key: 'user',
      header: 'User',
      cell: (l) => (l.user ? (
        <div className="min-w-0">
          <p className="font-medium">{l.user.username}</p>
          <p className="truncate text-xs text-muted-foreground">{l.user.email}</p>
        </div>
      ) : <span className="text-muted-foreground">System</span>),
    },
    { key: 'action', header: 'Action', className: 'whitespace-nowrap', cell: (l) => humanize(l.action) },
    {
      key: 'resource',
      header: 'Resource',
      cell: (l) => (
        <div className="min-w-0">
          <p>{humanize(l.resource_type)}</p>
          {l.resource_id && <p className="max-w-[160px] truncate font-mono text-xs text-muted-foreground" title={l.resource_id}>{l.resource_id}</p>}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      cell: (l) => <p className="line-clamp-2 max-w-md text-sm">{l.description || '—'}</p>,
    },
    { key: 'severity', header: 'Severity', cell: (l) => <StatusBadge status={l.severity} /> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (l) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Actions for audit entry"><MoreHorizontal /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setViewing(l)}>
                <Eye /> View details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Every sign-in, change and export recorded by the system."
        actions={(
          <>
            <Button variant="outline" onClick={() => handleExport('csv')} disabled={exporting !== null}>{exporting === 'csv' ? <Loader2 className="animate-spin" /> : <Download />} Export CSV</Button>
            <Button variant="outline" onClick={() => handleExport('json')} disabled={exporting !== null}>{exporting === 'json' ? <Loader2 className="animate-spin" /> : <Download />} Export JSON</Button>
          </>
        )}
      />

      <StatGrid className="mb-6">
        <StatCard label="Total actions" value={formatNumber(stats.data?.totalActions)} icon={Activity} loading={stats.isLoading} />
        <StatCard label="Today" value={formatNumber(stats.data?.todayActions)} icon={CalendarClock} loading={stats.isLoading} />
        <StatCard label="Active users" value={formatNumber(stats.data?.activeUsers)} icon={Users} loading={stats.isLoading} hint="Users with recorded activity" />
        <StatCard label="Critical events" value={formatNumber(stats.data?.criticalEvents)} icon={AlertOctagon} loading={stats.isLoading} />
      </StatGrid>

      <FilterBar
        onReset={hasFilters ? () => {
          setSearch(''); setSeverity(''); setAction(''); setResourceType(''); setDateFrom(''); setDateTo(''); setPage(1);
        } : undefined}
      >
        <SearchInput value={search} onChange={withReset(setSearch)} placeholder="Search description, resource or IP" />
        <FilterSelect label="Severity" value={severity} onChange={withReset(setSeverity)} options={SEVERITY_OPTIONS} allLabel="All severities" />
        <FilterSelect label="Action" value={action} onChange={withReset(setAction)} options={ACTION_OPTIONS} allLabel="All actions" />
        <FilterSelect label="Resource" value={resourceType} onChange={withReset(setResourceType)} options={RESOURCE_OPTIONS} allLabel="All resources" />
        <FilterDate label="From" value={dateFrom} onChange={withReset(setDateFrom)} max={dateTo || undefined} />
        <FilterDate label="To" value={dateTo} onChange={withReset(setDateTo)} min={dateFrom || undefined} />
      </FilterBar>

      <DataTable
        columns={columns}
        rows={logs.data?.data}
        getRowKey={(l) => l.id}
        isLoading={logs.isLoading}
        error={logs.error}
        onRetry={() => logs.refetch()}
        pagination={logs.data?.pagination}
        onPageChange={setPage}
        onRowClick={setViewing}
        emptyTitle="No audit entries found"
        emptyDescription={hasFilters ? 'Try adjusting your filters.' : 'Activity will appear here as people use the system.'}
      />

      <Sheet open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {viewing && (
            <>
              <SheetHeader className="mb-6 space-y-2 text-left">
                <SheetTitle>{humanize(viewing.action)} · {humanize(viewing.resource_type)}</SheetTitle>
                <SheetDescription asChild>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={viewing.severity} />
                    <span>{formatDateTime(viewing.createdAt)} by {actor(viewing)}</span>
                  </div>
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5">
                <DetailSection title="Event">
                  <DetailGrid
                    items={[
                      { label: 'Action', value: humanize(viewing.action) },
                      { label: 'Severity', value: humanize(viewing.severity) },
                      { label: 'Resource type', value: humanize(viewing.resource_type) },
                      { label: 'Resource ID', value: viewing.resource_id ? <span className="font-mono text-xs">{viewing.resource_id}</span> : null },
                      { label: 'Time', value: formatDateTime(viewing.createdAt) },
                      { label: 'Log ID', value: <span className="font-mono text-xs">{viewing.id}</span> },
                      { label: 'Description', value: viewing.description, wide: true },
                    ]}
                  />
                </DetailSection>
                <DetailSection title="Actor">
                  <DetailGrid
                    items={[
                      { label: 'User', value: viewing.user?.username ?? 'System' },
                      { label: 'Email', value: viewing.user?.email },
                      { label: 'IP address', value: viewing.ip_address },
                      { label: 'User agent', value: viewing.user_agent, wide: true },
                    ]}
                  />
                </DetailSection>
                {hasContent(viewing.old_values) && (
                  <DetailSection title="Previous values"><JsonBlock value={viewing.old_values} /></DetailSection>
                )}
                {hasContent(viewing.new_values) && (
                  <DetailSection title="New values"><JsonBlock value={viewing.new_values} /></DetailSection>
                )}
                {hasContent(viewing.metadata) && (
                  <DetailSection title="Metadata"><JsonBlock value={viewing.metadata} /></DetailSection>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
