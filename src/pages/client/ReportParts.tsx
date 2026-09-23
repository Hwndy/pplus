import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MessageSquareQuote } from 'lucide-react';
import { EmptyState } from '@/components/common/States';
import { chartAxisProps, chartTooltipStyle } from '@/lib/charts';
import { useChartColors } from '@/lib/reportThemes';
import { formatNumber, formatPercent } from '@/lib/format';

export interface ShareRow {
  label: string;
  value: number;
  percentage: number;
}

/** Ranked list with proportional bars (share of voice, top publications, reporters…). */
export function ShareList({ rows, limit, emptyTitle = 'Nothing recorded', emptyDescription, colorful = true }: {
  rows: ShareRow[];
  /** Show only the first N rows and say how many there are in total. */
  limit?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  colorful?: boolean;
}) {
  const CHART_COLORS = useChartColors();
  if (!rows.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  const shown = limit ? rows.slice(0, limit) : rows;
  return (
    <div className="space-y-3">
      {shown.map((row, i) => (
        <div key={row.label} className="space-y-1">
          <div className="flex justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium" title={row.label}>{row.label}</span>
            <span className="shrink-0 text-muted-foreground">{formatNumber(row.value)} · {formatPercent(row.percentage)}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${Math.min(100, Math.max(0, row.percentage))}%`,
                backgroundColor: colorful ? CHART_COLORS[i % CHART_COLORS.length] : CHART_COLORS[0],
              }}
            />
          </div>
        </div>
      ))}
      {limit && rows.length > limit && (
        <p className="text-xs text-muted-foreground">Showing the top {limit} of {formatNumber(rows.length)}.</p>
      )}
    </div>
  );
}

/** Horizontal bar chart for ranked categories with long labels. */
export function RankedBarChart({ data, seriesName, emptyTitle = 'Nothing recorded', colorful = false }: {
  data: { name: string; value: number }[];
  seriesName: string;
  emptyTitle?: string;
  colorful?: boolean;
}) {
  const CHART_COLORS = useChartColors();
  if (!data.length) return <EmptyState title={emptyTitle} />;
  const height = Math.max(160, data.length * 36 + 40);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} {...chartAxisProps} />
        <YAxis type="category" dataKey="name" width={150} interval={0} {...chartAxisProps} />
        <Tooltip {...chartTooltipStyle} />
        <Bar dataKey="value" name={seriesName} radius={[0, 4, 4, 0]} barSize={20}>
          {data.map((d, i) => (
            <Cell key={d.name} fill={colorful ? CHART_COLORS[i % CHART_COLORS.length] : CHART_COLORS[0]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

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
        <p className="font-medium">Analyst note</p>
        <p className="whitespace-pre-line text-muted-foreground">{note}</p>
      </div>
    </div>
  );
}
