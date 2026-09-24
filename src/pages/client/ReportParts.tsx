import type { ComponentType, CSSProperties, ReactNode } from 'react';
import {
  CartesianGrid, Cell, LabelList, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { MessageSquareQuote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/common/States';
import { CHART_COLORS, SENTIMENT_COLORS, chartAxisProps, chartTooltipStyle } from '@/lib/charts';
import { useChartColors, useReportTheme } from '@/lib/reportThemes';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { initials, percentLabel } from './reportUtils';

/** Colours of the printed P+ report, used where the web pages mirror its layout. */
export const DECK_BLUE = '#1447E6';
export const DECK_YELLOW = '#FBBF24';

/** Media sentiment index colours: positive teal, neutral grey, negative red (as in the printed report). */
export const INDEX_COLORS = {
  positive: CHART_COLORS[6],
  neutral: SENTIMENT_COLORS.neutral,
  negative: SENTIMENT_COLORS.negative,
} as const;

// ---------------------------------------------------------------- Avatars

/** Company logo or person photo, falling back to initials on a tinted disc. */
export function EntityAvatar({ name, src, fit = 'contain', size = 'md', highlight, className }: {
  name: string;
  src?: string | null;
  /** `contain` for logos, `cover` for photos. */
  fit?: 'contain' | 'cover';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  highlight?: boolean;
  className?: string;
}) {
  const sizes = { sm: 'h-7 w-7 text-[0.6rem]', md: 'h-9 w-9 text-xs', lg: 'h-12 w-12 text-sm', xl: 'h-16 w-16 text-base' };
  return (
    <Avatar
      className={cn(sizes[size], 'border bg-white', highlight && 'ring-2 ring-offset-1 ring-offset-background', className)}
      style={highlight ? ({ '--tw-ring-color': 'var(--report-accent)' } as CSSProperties) : undefined}
      title={name}
    >
      {src && <AvatarImage src={src} alt={name} className={fit === 'contain' ? 'object-contain p-0.5' : 'object-cover'} />}
      <AvatarFallback
        className="font-semibold"
        style={{ backgroundColor: 'color-mix(in srgb, var(--report-accent) 14%, white)', color: 'var(--report-accent)' }}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

// ---------------------------------------------------------------- Hover tooltip

/** Lightweight hover/focus tooltip for HTML charts. */
function HoverTip({ children }: { children: ReactNode }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------- Percentage bars

export interface PercentBarRow {
  key: string;
  /** Visible label (may include markup, e.g. a line break before the publication). */
  label: ReactNode;
  /** Plain-text label for the tooltip. */
  title: string;
  percentage: number;
  count?: number;
  /** Logo or photo shown before the bar. */
  leading?: ReactNode;
  /** The client's own brand; other bars are drawn in a softer tone. */
  highlight?: boolean;
}

/**
 * Horizontal percentage bars with labels, like the printed report's bar charts.
 * The longest bar fills the row; hovering a bar shows the story count.
 */
export function PercentBars({ rows, empty, unit = 'stories', colorful = false, hideLabels = false }: {
  rows: PercentBarRow[];
  /** Message shown when there is nothing to chart. */
  empty: string;
  unit?: string;
  colorful?: boolean;
  /** Only the leading logo identifies the row (the name stays in the tooltip). */
  hideLabels?: boolean;
}) {
  const theme = useReportTheme();
  if (!rows.length) return <EmptyState title={empty} className="py-8" />;
  const max = Math.max(...rows.map((r) => r.percentage), 1);
  const anyHighlight = rows.some((r) => r.highlight);

  return (
    <ul className="space-y-2.5">
      {rows.map((row, i) => {
        let color = theme.accent;
        if (colorful) color = theme.palette[i % theme.palette.length];
        else if (anyHighlight && !row.highlight) color = `color-mix(in srgb, ${theme.accent} 45%, #94a3b8)`;
        const ratio = Math.max(0, row.percentage) / max;
        return (
          <li
            key={row.key}
            className={cn(
              'grid items-center gap-3',
              hideLabels ? 'grid-cols-[auto_minmax(0,1fr)]' : 'grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]',
            )}
          >
            <div className="flex min-w-0 items-center justify-end gap-2 text-right">
              {!hideLabels && (
                <span className={cn('min-w-0 text-xs leading-tight sm:text-sm', row.highlight && 'font-semibold')} title={row.title}>
                  {row.label}
                </span>
              )}
              {row.leading}
            </div>
            <div className="group relative flex h-7 items-center gap-2" tabIndex={0} aria-label={`${row.title}: ${percentLabel(row.percentage)}`}>
              <div
                className="h-full rounded-r-md transition-[filter] group-hover:brightness-110"
                style={{ width: `calc((100% - 3.25rem) * ${ratio})`, minWidth: row.percentage > 0 ? 3 : 0, backgroundColor: color }}
              />
              <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">{percentLabel(row.percentage)}</span>
              <HoverTip>
                <span className="font-medium">{row.title}</span>
                {row.count !== undefined && <> · {formatNumber(row.count)} {unit}</>}
                {' · '}{row.percentage.toFixed(1)}%
              </HoverTip>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------- KPI tiles

/** Large KPI tile: label on top, big figure below (as in the printed report's summary strip). */
export function KpiTile({ label, sublabel, value, title, icon: Icon, color, children, className }: {
  label: string;
  sublabel?: string;
  value?: ReactNode;
  /** Full figure for the tooltip when `value` is abbreviated. */
  title?: string;
  icon?: ComponentType<{ className?: string; style?: CSSProperties }>;
  color: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('flex min-w-0 flex-col rounded-xl border bg-card p-4 shadow-sm', className)}
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug text-muted-foreground">{label}</p>
          {sublabel && <p className="text-xs text-muted-foreground/80">{sublabel}</p>}
        </div>
        {Icon && (
          <span className="shrink-0 rounded-lg p-2" style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}>
            <Icon className="h-4 w-4" style={{ color }} />
          </span>
        )}
      </div>
      {value !== undefined && (
        <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums" title={title}>{value}</p>
      )}
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- Numbered cards

/** "01 | Category | text" card used by the insights and media activity pages. */
export function NumberedCard({ index, category, children }: { index: number; category: string; children: ReactNode }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm sm:flex-row">
      <div className="flex shrink-0 sm:w-72">
        <div className="flex w-16 items-center justify-center text-2xl font-semibold text-white" style={{ backgroundColor: DECK_YELLOW }}>
          {String(index).padStart(2, '0')}
        </div>
        <div className="flex flex-1 items-center px-4 py-3 text-lg font-medium leading-snug text-white" style={{ backgroundColor: DECK_BLUE }}>
          {category}
        </div>
      </div>
      <div className="min-w-0 flex-1 p-4 text-sm leading-relaxed sm:p-5">{children}</div>
    </article>
  );
}

// ---------------------------------------------------------------- Media sentiment index

export interface SentimentIndexRow {
  key: string;
  label: ReactNode;
  title: string;
  /** Percentages of the row's rated stories. */
  positive: number;
  neutral: number;
  negative: number;
  counts?: { positive: number; neutral: number; negative: number };
  highlight?: boolean;
}

function Segment({ pct, color, label }: { pct: number; color: string; label: string }) {
  if (pct <= 0) return null;
  return (
    <div className="flex h-full items-center justify-center overflow-hidden text-[11px] font-semibold text-white" style={{ width: `${pct}%`, backgroundColor: color }}>
      <span className="truncate px-1">{label}</span>
    </div>
  );
}

/** Legend for the media sentiment index. */
export function SentimentLegend() {
  const items = [
    { label: 'Positive', color: INDEX_COLORS.positive },
    { label: 'Negative', color: INDEX_COLORS.negative },
    { label: 'Neutral', color: INDEX_COLORS.neutral },
  ];
  return (
    <div className="flex flex-wrap justify-center gap-4 pt-2 text-xs text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: i.color }} /> {i.label}
        </span>
      ))}
    </div>
  );
}

/**
 * Diverging bars: negative coverage extends to the left of the axis, positive and
 * neutral to the right, each labelled with its percentage.
 */
export function SentimentIndexBars({ rows, empty, compact = false }: { rows: SentimentIndexRow[]; empty: string; compact?: boolean }) {
  const shown = rows.filter((r) => r.positive + r.neutral + r.negative > 0);
  if (!shown.length) return <EmptyState title={empty} className="py-8" />;
  const maxLeft = Math.max(...shown.map((r) => r.negative), 0);
  const maxRight = Math.max(...shown.map((r) => r.positive + r.neutral), 1);
  // Give the negative side room in proportion to the largest negative share (with a small minimum for the axis).
  const leftShare = maxLeft > 0 ? Math.min(0.5, Math.max(0.15, maxLeft / (maxLeft + maxRight))) : 0.06;

  return (
    <div className="space-y-2">
      {shown.map((row) => (
        <div
          key={row.key}
          className={cn('grid items-center gap-3', compact ? 'grid-cols-[auto_minmax(0,1fr)]' : 'grid-cols-[minmax(0,8rem)_minmax(0,1fr)] sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]')}
        >
          <div className={cn('flex min-w-0 items-center justify-end gap-2 text-right text-xs sm:text-sm', row.highlight && 'font-semibold')}>
            {row.label}
          </div>
          <div className="group relative flex h-8 items-stretch" tabIndex={0} aria-label={`${row.title}: ${Math.round(row.positive)}% positive, ${Math.round(row.neutral)}% neutral, ${Math.round(row.negative)}% negative`}>
            <div className="flex justify-end" style={{ width: `${leftShare * 100}%` }}>
              {row.negative > 0 && (
                <div
                  className="flex h-full items-center justify-center overflow-hidden rounded-l-md text-[11px] font-semibold text-white"
                  style={{ width: `${maxLeft > 0 ? (row.negative / maxLeft) * 100 : 0}%`, backgroundColor: INDEX_COLORS.negative }}
                >
                  <span className="truncate px-1">-{percentLabel(row.negative)}</span>
                </div>
              )}
            </div>
            <div className="w-px shrink-0 bg-foreground/40" />
            <div className="flex" style={{ width: `${(1 - leftShare) * 100}%` }}>
              <div className="flex h-full overflow-hidden rounded-r-md" style={{ width: `${((row.positive + row.neutral) / maxRight) * 100}%` }}>
                <Segment pct={(row.positive / (row.positive + row.neutral || 1)) * 100} color={INDEX_COLORS.positive} label={percentLabel(row.positive)} />
                <Segment pct={(row.neutral / (row.positive + row.neutral || 1)) * 100} color={INDEX_COLORS.neutral} label={percentLabel(row.neutral)} />
              </div>
            </div>
            <HoverTip>
              <span className="font-medium">{row.title}</span>
              {' · '}Positive {row.positive.toFixed(1)}%{row.counts && ` (${formatNumber(row.counts.positive)})`}
              {' · '}Neutral {row.neutral.toFixed(1)}%{row.counts && ` (${formatNumber(row.counts.neutral)})`}
              {' · '}Negative {row.negative.toFixed(1)}%{row.counts && ` (${formatNumber(row.counts.negative)})`}
            </HoverTip>
          </div>
        </div>
      ))}
      <SentimentLegend />
    </div>
  );
}

// ---------------------------------------------------------------- Charts

/** Doughnut with percentage labels, as in the printed report's language and media vehicle charts. */
export function DonutChart({ data, empty, unit = 'stories', height = 300 }: {
  data: { name: string; value: number; color: string }[];
  empty: string;
  unit?: string;
  height?: number;
}) {
  const rows = data.filter((d) => d.value > 0);
  const total = rows.reduce((sum, d) => sum + d.value, 0);
  if (!total) return <EmptyState title={empty} className="py-8" />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={rows}
          dataKey="value"
          nameKey="name"
          innerRadius="48%"
          outerRadius="72%"
          paddingAngle={rows.length > 1 ? 1 : 0}
          label={({ name, value }: { name?: string; value?: number }) => `${name ?? ''} ${percentLabel(((value ?? 0) / total) * 100)}`}
          labelLine={false}
          fontSize={12}
          fontWeight={600}
        >
          {rows.map((d) => <Cell key={d.name} fill={d.color} />)}
        </Pie>
        <Tooltip
          {...chartTooltipStyle}
          formatter={(value: number, name: string) => [`${formatNumber(value)} ${unit} (${((value / total) * 100).toFixed(1)}%)`, name]}
        />
        <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Print versus online line chart; `percent` plots each medium's share per period (as in the printed report). */
export function PrintOnlineTrend({ data, xKey, percent = false, empty, height = 300 }: {
  data: Record<string, string | number>[];
  xKey: string;
  percent?: boolean;
  empty: string;
  height?: number;
}) {
  const colors = useChartColors();
  const hasData = data.some((d) => Number(d.print) > 0 || Number(d.online) > 0);
  if (!data.length || !hasData) return <EmptyState title={empty} className="py-8" />;
  const format = (v: number) => (percent ? percentLabel(v) : formatNumber(v));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey} {...chartAxisProps} />
        <YAxis allowDecimals={false} tickFormatter={(v: number) => (percent ? `${v}%` : formatNumber(v))} width={48} {...chartAxisProps} />
        <Tooltip {...chartTooltipStyle} formatter={(v: number) => (percent ? `${v.toFixed(1)}%` : formatNumber(v))} />
        <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
        <Line type="linear" dataKey="online" name="Online Media" stroke={colors[0]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>
          <LabelList dataKey="online" position="top" fontSize={11} formatter={format} />
        </Line>
        <Line type="linear" dataKey="print" name="Print Media" stroke={colors[5] ?? colors[1]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>
          <LabelList dataKey="print" position="bottom" fontSize={11} formatter={format} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------- Notes & headings

/** The analyst's commentary on a report entry, tinted with the report accent. */
export function AnalystNote({ note }: { note: string | null | undefined }) {
  if (!note?.trim()) return null;
  return (
    <div
      className="mt-4 flex gap-3 rounded-md border-l-4 p-3 text-sm"
      style={{ borderColor: 'var(--report-accent)', backgroundColor: 'color-mix(in srgb, var(--report-accent) 8%, transparent)' }}
    >
      <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--report-accent)' }} />
      <div>
        <p className="font-medium">Analyst Note</p>
        <p className="whitespace-pre-line text-muted-foreground">{note}</p>
      </div>
    </div>
  );
}

/** Section heading inside a report (e.g. "Industry Landscape Overview – Banking Highlights"). */
export function ReportHeading({ children, description, actions }: { children: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h2 className="border-l-4 pl-3 text-lg font-semibold tracking-tight" style={{ borderColor: 'var(--report-accent)' }}>{children}</h2>
        {description && <p className="pl-4 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
