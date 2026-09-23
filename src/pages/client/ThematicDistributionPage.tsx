import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Layers, Newspaper, Trophy } from 'lucide-react';
import { SectionCard, StatCard, StatGrid } from '@/components/common/Cards';
import { EmptyState } from '@/components/common/States';
import { Badge } from '@/components/ui/badge';
import { chartTooltipStyle } from '@/lib/charts';
import { useChartColors } from '@/lib/reportThemes';
import { formatNumber, formatPercent } from '@/lib/format';
import type { ThematicDistributionReport } from '@/types/reports';
import { ReportShell } from './ReportShell';
import { RankedBarChart } from './ReportParts';
import { toNumber } from './reportUtils';

/** Themes beyond this rank are combined into "Other themes" in the pie chart. */
const PIE_SLICES = 6;

function Distribution({ data }: { data: ThematicDistributionReport }) {
  const CHART_COLORS = useChartColors();
  const activities = data.activities;
  const top = activities[0];

  const bars = activities.slice(0, 10).map((a) => ({ name: a.activity, value: a.frequency }));
  const pie = activities.slice(0, PIE_SLICES).map((a) => ({ name: a.activity, value: a.frequency }));
  const rest = activities.slice(PIE_SLICES).reduce((sum, a) => sum + a.frequency, 0);
  if (rest > 0) pie.push({ name: 'Other themes', value: rest });

  return (
    <div className="space-y-6">
      <StatGrid className="xl:grid-cols-3">
        <StatCard label="Stories analysed" value={formatNumber(data.total_editorials)} icon={Newspaper} />
        <StatCard label="Themes" value={formatNumber(data.unique_activities)} icon={Layers} hint="Distinct media activities" />
        <StatCard
          label="Leading theme"
          value={<span className="block truncate text-lg" title={top?.activity}>{top?.activity ?? '—'}</span>}
          icon={Trophy}
          hint={top ? `${formatNumber(top.frequency)} stories · ${formatPercent(top.percentage)}` : undefined}
        />
      </StatGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <SectionCard title="Distribution of media activities" description="Stories per theme (top 10)." className="lg:col-span-3">
          <RankedBarChart data={bars} seriesName="Stories" emptyTitle="No themes recorded" colorful />
        </SectionCard>
        <SectionCard title="Share of coverage" description="Proportion of stories by theme." className="lg:col-span-2">
          {pie.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {pie.map((d, i) => <Cell key={d.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No themes recorded" />}
        </SectionCard>
      </div>

      <SectionCard title="Top headlines by theme" description="Leading stories for each theme.">
        {activities.length ? (
          <div className="divide-y">
            {activities.map((a, i) => {
              const titles = a.sample_editorials.map((e) => e.title?.trim()).filter((t): t is string => Boolean(t));
              return (
                <section key={a.activity} className="space-y-2 py-4 first:pt-0 last:pb-0">
                  <header className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      {a.activity}
                    </h3>
                    <Badge variant="muted" className="font-normal">
                      {formatNumber(a.frequency)} stories · {formatPercent(toNumber(a.percentage))}
                    </Badge>
                  </header>
                  {titles.length ? (
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {titles.map((t, j) => <li key={`${j}-${t}`}>{t}</li>)}
                    </ul>
                  ) : <p className="text-sm text-muted-foreground">No headlines recorded.</p>}
                </section>
              );
            })}
          </div>
        ) : <EmptyState title="No themes recorded" />}
      </SectionCard>
    </div>
  );
}

export default function ThematicDistributionPage() {
  return (
    <ReportShell<ThematicDistributionReport>
      report="top-thematic-distribution-breakdown"
      title="Thematic distribution"
      description="The media activities and themes driving your coverage"
    >
      {(data) => <Distribution data={data} />}
    </ReportShell>
  );
}
