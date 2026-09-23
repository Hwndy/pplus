import { useState, type CSSProperties, type ReactNode } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { BarChart3, Building2, CalendarDays, CalendarRange, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { useAuth } from '@/components/auth/AuthContext';
import { fetchReport, type ReportFilters, type ReportName } from '@/api/reports';
import { currentMonth, formatDate } from '@/lib/format';
import type { ReportPeriod } from '@/types/api';
import { ReportThemeContext, reportTheme, type ReportThemeKey } from '@/lib/reportThemes';
import { ExportReportButton } from '@/features/report-export/ExportReportButton';
import { useReportPeriod, type PeriodMode } from './useReportPeriod';

interface ReportShellProps<T> {
  report: ReportName;
  title: string;
  description: string;
  /** Renders the report once data is available. */
  children: (data: T) => ReactNode;
  /** Some reports are period-independent views; hide the period picker. */
  hidePeriod?: boolean;
  /** Colour theme; defaults to the report's own theme. */
  theme?: ReportThemeKey;
}

function periodOf(data: unknown): ReportPeriod | null {
  const period = (data as { period?: ReportPeriod } | null)?.period;
  return period?.start && period?.end ? period : null;
}

/**
 * Shared frame for client reports: period selection (month or custom range),
 * the active monitored company, and consistent loading / error / no-coverage states.
 */
export function ReportShell<T>({ report, title, description, children, hidePeriod, theme }: ReportShellProps<T>) {
  const colors = reportTheme(theme ?? report);
  const { activePair, monitoringPairs } = useAuth();
  const { mode, month, range: appliedRange, setMode, setMonth, applyRange } = useReportPeriod();
  // Draft dates for the custom range; they only take effect when applied.
  const [range, setRange] = useState(appliedRange);

  const filters: ReportFilters = {
    pairId: activePair?.pair_id,
    ...(mode === 'month' ? { month } : { startDate: appliedRange.start, endDate: appliedRange.end }),
  };
  const rangeReady = mode === 'month' || Boolean(appliedRange.start && appliedRange.end);

  const query = useQuery({
    queryKey: ['report', report, filters],
    queryFn: () => fetchReport<T>(report, filters),
    enabled: Boolean(activePair) && !activePair?.is_expired && rangeReady,
    placeholderData: keepPreviousData,
  });

  const rangeInvalid = Boolean(range.start && range.end && range.start > range.end);
  const period = periodOf(query.data?.data);

  let body: ReactNode;
  if (!monitoringPairs.length || !activePair) {
    body = (
      <EmptyState
        icon={BarChart3}
        title="No monitored company yet"
        description="Your account doesn't have a company to report on. Contact your account manager to set up monitoring."
      />
    );
  } else if (activePair.is_expired) {
    body = (
      <EmptyState
        icon={Clock}
        title="Monitoring period has ended"
        description={`Monitoring for ${activePair.base_company.company_name} ended on ${formatDate(activePair.monitoring_date)}. Contact your account manager to renew.`}
      />
    );
  } else if (!rangeReady) {
    body = <EmptyState icon={CalendarRange} title="Choose a date range" description="Select a start and end date, then apply." />;
  } else if (query.isLoading) {
    body = <LoadingState label="Preparing report…" />;
  } else if (query.error) {
    body = <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  } else if (!query.data?.data) {
    body = (
      <EmptyState
        icon={BarChart3}
        title="No coverage in this period"
        description={query.data?.message || 'There is no media coverage recorded for the selected period. Try another period.'}
      />
    );
  } else {
    body = <div className={query.isFetching ? 'opacity-60 transition-opacity' : undefined}>{children(query.data.data)}</div>;
  }

  const themeStyle = {
    '--report-accent': colors.accent,
    '--report-c1': colors.palette[0],
    '--report-c2': colors.palette[1],
    '--report-c3': colors.palette[2],
    '--report-c4': colors.palette[3],
  } as CSSProperties;

  return (
    <ReportThemeContext.Provider value={colors}>
    <div className="report-theme" style={themeStyle}>
      <header
        className="mb-6 flex flex-col gap-4 rounded-xl p-6 text-white shadow-sm sm:flex-row sm:items-start sm:justify-between"
        style={{ backgroundImage: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.gradientTo} 100%)` }}
      >
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-white/85">{description}</p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium">
            {activePair && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1">
                <Building2 className="h-3.5 w-3.5" /> {activePair.base_company.company_name}
              </span>
            )}
            {period && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1">
                <CalendarDays className="h-3.5 w-3.5" /> {formatDate(period.start)} – {formatDate(period.end)}
              </span>
            )}
          </div>
        </div>
        {activePair && !activePair.is_expired && rangeReady && (
          <ExportReportButton pair={activePair} filters={filters} />
        )}
      </header>
      {!hidePeriod && activePair && !activePair.is_expired && (
        <div className="mb-6 flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-end">
          <Tabs value={mode} onValueChange={(v) => setMode(v as PeriodMode)}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="range">Custom range</TabsTrigger>
            </TabsList>
          </Tabs>
          {mode === 'month' ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="report-month" className="text-xs text-muted-foreground">Month</Label>
              <Input id="report-month" type="month" value={month} max={currentMonth()} onChange={(e) => e.target.value && setMonth(e.target.value)} className="w-44" />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="report-start" className="text-xs text-muted-foreground">From</Label>
                <Input id="report-start" type="date" value={range.start} max={range.end || undefined} onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))} className="w-40" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="report-end" className="text-xs text-muted-foreground">To</Label>
                <Input id="report-end" type="date" value={range.end} min={range.start || undefined} onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))} className="w-40" />
              </div>
              <Button onClick={() => applyRange(range)} disabled={!range.start || !range.end || rangeInvalid}>Apply</Button>
              {rangeInvalid && <p className="text-sm text-destructive">The start date must be before the end date.</p>}
            </>
          )}
        </div>
      )}
      {body}
    </div>
    </ReportThemeContext.Provider>
  );
}
