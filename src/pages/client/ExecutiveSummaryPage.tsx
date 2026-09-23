import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Globe2, Languages, MapPin, Newspaper, TrendingUp } from 'lucide-react';
import { SectionCard, StatCard, StatGrid } from '@/components/common/Cards';
import { EmptyState } from '@/components/common/States';
import { SENTIMENT_COLORS, chartAxisProps, chartTooltipStyle } from '@/lib/charts';
import { useChartColors } from '@/lib/reportThemes';
import { formatNumber, formatPercent, humanize } from '@/lib/format';
import type { ExecutiveSummaryReport } from '@/types/reports';
import { ReportShell } from './ReportShell';
import { mergeWeekly } from './reportUtils';

function reputationLabel(score: number) {
  if (score > 0.2) return 'Favourable';
  if (score < -0.2) return 'Unfavourable';
  return 'Balanced';
}

function Summary({ data }: { data: ExecutiveSummaryReport }) {
  const CHART_COLORS = useChartColors();
  const s = data.summary;
  const sentiment = [
    { name: 'Positive', value: s.positiveMediaExposure, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: s.neutralMediaExposure, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: s.negativeMediaExposure, color: SENTIMENT_COLORS.negative },
  ].filter((d) => d.value > 0);

  const weekly = mergeWeekly(s.weeklyTrendOnBrandMediaExposure);

  const share = s.competitiveMediaShare.shares.map((x) => ({ company: x.company, mentions: x.frequency, percentage: Number(x.percentage) }));
  const languages = Object.entries(s.language.breakdown).map(([name, value]) => ({ name: humanize(name), value }));

  return (
    <div className="space-y-6">
      <StatGrid>
        <StatCard label="Total media exposure" value={formatNumber(s.totalMediaExposure)} icon={Newspaper} hint="Stories mentioning your brand" />
        <StatCard label="Local media" value={formatNumber(s.brandExposureInLocalMedia)} icon={MapPin} hint="Coverage in Nigerian media" />
        <StatCard label="International media" value={formatNumber(s.brandExposureInInternationalMedia)} icon={Globe2} hint="Coverage outside Nigeria" />
        <StatCard
          label="Reputation score"
          value={s.brandMediaReputationScore.toFixed(2)}
          icon={TrendingUp}
          hint={`${reputationLabel(s.brandMediaReputationScore)} · (positive − negative) ÷ total`}
        />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Sentiment" description="Tone of coverage mentioning your brand.">
          {sentiment.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={sentiment} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {sentiment.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No sentiment recorded" />}
        </SectionCard>

        <SectionCard title="Media vehicle" description="Where your coverage appeared.">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={[{ name: 'Print', value: s.mediaVehicle.print }, { name: 'Online', value: s.mediaVehicle.online }]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" {...chartAxisProps} />
              <YAxis allowDecimals={false} {...chartAxisProps} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="value" name="Stories" radius={[4, 4, 0, 0]}>
                <Cell fill={CHART_COLORS[0]} />
                <Cell fill={CHART_COLORS[1]} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Weekly exposure trend" description="Stories per week, print versus online.">
        {weekly.length ? (
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
        ) : <EmptyState title="No weekly data" description="No print or online stories in this period." />}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Share of voice" description={`${formatNumber(s.competitiveMediaShare.total_mentions)} stories across your brand and competitors.`}>
          {share.length ? (
            <div className="space-y-3">
              {share.map((row, i) => (
                <div key={row.company} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{row.company}</span>
                    <span className="text-muted-foreground">{formatNumber(row.mentions)} · {formatPercent(row.percentage)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full" style={{ width: `${row.percentage}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState title="No competitor coverage" />}
        </SectionCard>

        <SectionCard title="Languages" description="Language of the coverage.">
          {languages.length ? (
            <ul className="divide-y text-sm">
              {languages.map((l) => (
                <li key={l.name} className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-2"><Languages className="h-4 w-4 text-muted-foreground" />{l.name}</span>
                  <span className="font-medium">{formatNumber(l.value)}</span>
                </li>
              ))}
            </ul>
          ) : <EmptyState title="No language data" />}
        </SectionCard>
      </div>
    </div>
  );
}

export default function ExecutiveSummaryPage() {
  return (
    <ReportShell<ExecutiveSummaryReport>
      report="executive-summary"
      title="Executive summary"
      description="Headline view of your brand's media exposure"
    >
      {(data) => <Summary data={data} />}
    </ReportShell>
  );
}
