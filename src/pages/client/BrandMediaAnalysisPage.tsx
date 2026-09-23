import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { format, parse } from 'date-fns';
import { Camera, Newspaper, Radio, Video } from 'lucide-react';
import { SectionCard, StatCard, StatGrid } from '@/components/common/Cards';
import { DetailGrid } from '@/components/common/Detail';
import { EmptyState } from '@/components/common/States';
import { chartAxisProps, chartTooltipStyle } from '@/lib/charts';
import { useChartColors } from '@/lib/reportThemes';
import { formatNumber, humanize } from '@/lib/format';
import type { BrandMediaAnalysisReport } from '@/types/reports';
import { ReportShell } from './ReportShell';
import { RankedBarChart, ShareList } from './ReportParts';
import { toNumber, mergeWeekly } from './reportUtils';

function monthLabel(month: string): string {
  const date = parse(month, 'yyyy-MM', new Date());
  return Number.isNaN(date.getTime()) ? month : format(date, 'MMM yyyy');
}

function Analysis({ data }: { data: BrandMediaAnalysisReport }) {
  const CHART_COLORS = useChartColors();
  const a = data.analysis;
  const reach = a.potential_reach;

  const placements = a.brand_message_placement.placements.map((p) => ({ name: humanize(p.placement), value: p.count }));
  const activities = a.thematic_distribution.top_10.map((t) => ({ name: t.activity, value: t.count }));
  const subsidiaries = a.brand_subsidiary_exposure.top_10.map((s) => ({ label: s.brand, value: s.count, percentage: toNumber(s.percentage) }));

  const weekly = mergeWeekly(a.weekly_volume_trend);
  const weeklyTotal = a.weekly_volume_trend.print.total + a.weekly_volume_trend.online.total;

  const monthly = a.monthly_volume_trend.monthly_breakdown.map((m) => ({
    month: monthLabel(m.month),
    print: m.print.count,
    online: m.online.count,
  }));

  return (
    <div className="space-y-6">
      <StatGrid>
        <StatCard
          label="News mentions"
          value={formatNumber(a.news_mention.total)}
          icon={Newspaper}
          hint={`${formatNumber(a.news_mention.breakdown.headline)} headlines · ${formatNumber(a.news_mention.breakdown.advertorial)} advertorials`}
        />
        <StatCard label="Photo mentions" value={formatNumber(a.photo_mention.total)} icon={Camera} hint="Visual brand appearances" />
        <StatCard label="Video mentions" value={formatNumber(a.video_mention.total)} icon={Video} hint="Video brand mentions" />
        <StatCard label="Potential reach" value={formatNumber(reach.combined_reach)} icon={Radio} hint="Print audience plus online traffic" />
      </StatGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Potential reach" description="Audience of each publication counted once, however many stories it ran.">
          <DetailGrid
            items={[
              { label: 'Print reach', value: formatNumber(reach.print.total_reach) },
              { label: 'Print publications', value: formatNumber(reach.print.unique_sources) },
              { label: 'Online reach', value: formatNumber(reach.online.total_reach) },
              { label: 'Online publications', value: formatNumber(reach.online.unique_sources) },
            ]}
          />
        </SectionCard>

        <SectionCard title="Message placement" description="How your brand appeared in coverage.">
          {placements.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={placements} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {placements.map((p, i) => <Cell key={p.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No placement data" />}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Top media activities" description={`Leading themes across ${formatNumber(a.thematic_distribution.total_activities)} stories.`}>
          <RankedBarChart data={activities} seriesName="Stories" emptyTitle="No activities recorded" />
        </SectionCard>

        <SectionCard
          title="Subsidiary and brand exposure"
          description={a.brand_subsidiary_exposure.total_brand_mentions > 0
            ? `${formatNumber(a.brand_subsidiary_exposure.total_brand_mentions)} stories across ${formatNumber(a.brand_subsidiary_exposure.unique_brands)} brands.`
            : 'Coverage of your subsidiaries and their competitors.'}
        >
          <ShareList rows={subsidiaries} emptyTitle="No subsidiary coverage" emptyDescription={a.brand_subsidiary_exposure.note} />
        </SectionCard>
      </div>

      <SectionCard title="Weekly volume trend" description="Stories per week, print versus online.">
        {weekly.length && weeklyTotal > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" {...chartAxisProps} />
              <YAxis allowDecimals={false} {...chartAxisProps} />
              <Tooltip {...chartTooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="print" name="Print" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="online" name="Online" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <EmptyState title="No stories this month" description="No print or online stories in this period." />}
      </SectionCard>

      <SectionCard title="Monthly volume trend" description="Stories per month in the selected period, print versus online.">
        {monthly.length ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" {...chartAxisProps} />
              <YAxis allowDecimals={false} {...chartAxisProps} />
              <Tooltip {...chartTooltipStyle} />
              <Legend />
              <Bar dataKey="print" name="Print" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="online" name="Online" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyState title="No monthly data" />}
      </SectionCard>
    </div>
  );
}

export default function BrandMediaAnalysisPage() {
  return (
    <ReportShell<BrandMediaAnalysisReport>
      report="brand-media-analysis"
      title="Brand media analysis"
      description="Volume, reach and placement of your brand's coverage"
    >
      {(data) => <Analysis data={data} />}
    </ReportShell>
  );
}
