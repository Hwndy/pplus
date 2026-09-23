import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, isValid, parseISO } from 'date-fns';
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ArrowRight, Building2, ClipboardCheck, Settings, UserPlus, Users, UserCog, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard, StatCard, StatGrid } from '@/components/common/Cards';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { StatusBadge } from '@/components/common/StatusBadge';
import { auditApi } from '@/api/audit';
import { CHART_COLORS, SENTIMENT_COLORS, chartAxisProps, chartTooltipStyle } from '@/lib/charts';
import { formatDateTime, formatNumber, humanize } from '@/lib/format';

const RECENT_CRITICAL_PARAMS = { severity: 'CRITICAL' as const, limit: 5, page: 1 };

function dayLabel(value: string): string {
  const date = parseISO(value);
  return isValid(date) ? format(date, 'EEE d MMM') : value;
}

export default function AdminHome() {
  const stats = useQuery({ queryKey: ['audit-stats'], queryFn: () => auditApi.stats() });
  const critical = useQuery({
    queryKey: ['audit-logs', RECENT_CRITICAL_PARAMS],
    queryFn: () => auditApi.list(RECENT_CRITICAL_PARAMS),
  });

  const s = stats.data;
  const loading = stats.isLoading;
  const timeline = (s?.timeline ?? []).map((t) => ({ ...t, label: dayLabel(t.date) }));
  const hasActivity = timeline.some((t) => t.count > 0);
  const contentStatus = [
    { status: 'Pending', count: s?.content_pending ?? 0, color: CHART_COLORS[3] },
    { status: 'Approved', count: s?.content_approved ?? 0, color: SENTIMENT_COLORS.positive },
    { status: 'Rejected', count: s?.content_rejected ?? 0, color: SENTIMENT_COLORS.negative },
  ];
  const contentTotal = contentStatus.reduce((sum, c) => sum + c.count, 0);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Users, content review and system activity at a glance."
        actions={(
          <>
            <Button variant="outline" asChild><Link to="/dashboard/users?new=1"><UserPlus /> Add user</Link></Button>
            <Button variant="outline" asChild><Link to="/dashboard/companies?new=1"><Building2 /> Add company</Link></Button>
            <Button variant="outline" asChild><Link to="/dashboard/parameters"><Settings /> Parameters</Link></Button>
          </>
        )}
      />

      {stats.error ? (
        <ErrorState error={stats.error} onRetry={() => stats.refetch()} />
      ) : (
        <div className="space-y-6">
          <StatGrid>
            <StatCard
              label="Total users"
              value={formatNumber(s?.total_users)}
              icon={Users}
              loading={loading}
              hint={s ? `${formatNumber(s.total_admins)} admin${s.total_admins === 1 ? '' : 's'}` : undefined}
            />
            <StatCard label="Clients" value={formatNumber(s?.total_clients)} icon={Briefcase} loading={loading} />
            <StatCard
              label="Analysts & supervisors"
              value={formatNumber(s ? s.total_analysts + s.total_supervisors : undefined)}
              icon={UserCog}
              loading={loading}
              hint={s ? `${formatNumber(s.total_analysts)} analysts · ${formatNumber(s.total_supervisors)} supervisors` : undefined}
            />
            <StatCard
              label="Pending review"
              value={formatNumber(s?.content_pending)}
              icon={ClipboardCheck}
              loading={loading}
              hint={(
                <Link to="/dashboard/review" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                  Review now <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            />
          </StatGrid>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SectionCard title="Activity" description="Audit log entries per day over the last 7 days." className="lg:col-span-2">
              {loading ? <LoadingState /> : !hasActivity ? (
                <EmptyState title="No activity this week" description="Recorded actions will appear here." />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={timeline} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" {...chartAxisProps} />
                    <YAxis allowDecimals={false} {...chartAxisProps} />
                    <Tooltip {...chartTooltipStyle} />
                    <Line type="monotone" dataKey="count" name="Actions" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </SectionCard>

            <SectionCard title="Content status" description="All content items across every workflow.">
              {loading ? <LoadingState /> : contentTotal === 0 ? (
                <EmptyState title="No content yet" description="Submitted content will be counted here." />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={contentStatus} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="status" {...chartAxisProps} />
                    <YAxis allowDecimals={false} {...chartAxisProps} />
                    <Tooltip {...chartTooltipStyle} cursor={{ fillOpacity: 0.1 }} />
                    <Bar dataKey="count" name="Items" radius={[4, 4, 0, 0]}>
                      {contentStatus.map((c) => <Cell key={c.status} fill={c.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </SectionCard>
          </div>
        </div>
      )}

      <SectionCard
        title="Recent critical events"
        description="The latest entries marked critical in the audit log."
        className="mt-6"
        actions={(
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/audit-log">View audit log <ArrowRight /></Link>
          </Button>
        )}
      >
        {critical.isLoading ? <LoadingState /> : critical.error ? (
          <ErrorState error={critical.error} onRetry={() => critical.refetch()} />
        ) : (critical.data?.data ?? []).length === 0 ? (
          <EmptyState title="No critical events" description="Nothing critical has been recorded." />
        ) : (
          <ul className="divide-y">
            {(critical.data?.data ?? []).map((log) => (
              <li key={log.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium">{log.description || `${humanize(log.action)} · ${humanize(log.resource_type)}`}</p>
                  <p className="text-xs text-muted-foreground">
                    {humanize(log.action)} · {log.user?.username ?? 'System'} · {formatDateTime(log.createdAt)}
                  </p>
                </div>
                <StatusBadge status={log.severity} className="self-start" />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </>
  );
}
