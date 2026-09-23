import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Gauge, Minus, ThumbsDown, ThumbsUp } from 'lucide-react';
import { SectionCard, StatCard, StatGrid } from '@/components/common/Cards';
import { BulletList } from '@/components/common/Detail';
import { EmptyState } from '@/components/common/States';
import { Badge } from '@/components/ui/badge';
import { SENTIMENT_COLORS, chartAxisProps, chartTooltipStyle } from '@/lib/charts';
import { formatNumber, formatPercent, humanize } from '@/lib/format';
import { SENTIMENT_CLASSIFICATIONS, type BrandSentimentReport, type SentimentClassification } from '@/types/reports';
import { ReportShell } from './ReportShell';
import { shareOf } from './reportUtils';

type Tone = 'positive' | 'neutral' | 'negative';

/** Each classification is drawn in its tone's colour; intensity is shown through opacity. */
const CLASSIFICATION_STYLE: Record<SentimentClassification, { tone: Tone; opacity: number }> = {
  strongly_positive: { tone: 'positive', opacity: 1 },
  positive: { tone: 'positive', opacity: 0.75 },
  moderately_positive: { tone: 'positive', opacity: 0.5 },
  neutral: { tone: 'neutral', opacity: 1 },
  moderately_negative: { tone: 'negative', opacity: 0.5 },
  negative: { tone: 'negative', opacity: 0.75 },
  strongly_negative: { tone: 'negative', opacity: 1 },
};

function SentimentIndex({ data }: { data: BrandSentimentReport }) {
  const total = data.totals.total_categorized;
  const countOf = (key: SentimentClassification) => data.sentiment_breakdown[key]?.count ?? 0;
  const toneCount = (tone: Tone) => SENTIMENT_CLASSIFICATIONS
    .filter((k) => CLASSIFICATION_STYLE[k].tone === tone)
    .reduce((sum, k) => sum + countOf(k), 0);

  const tones = {
    positive: toneCount('positive'),
    neutral: toneCount('neutral'),
    negative: toneCount('negative'),
  };

  const bars = SENTIMENT_CLASSIFICATIONS.map((key) => ({
    key,
    name: humanize(key),
    count: countOf(key),
    percentage: data.sentiment_breakdown[key]?.percentage ?? 0,
  }));

  const pie = (Object.keys(tones) as Tone[])
    .map((tone) => ({ tone, name: humanize(tone), value: tones[tone] }))
    .filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <StatGrid>
        <StatCard
          label="Rated coverage"
          value={formatNumber(total)}
          icon={Gauge}
          hint={data.totals.total_uncategorized > 0
            ? `${formatNumber(data.totals.total_uncategorized)} stories without a sentiment rating`
            : 'Stories with a sentiment rating'}
        />
        <StatCard label="Positive" value={formatPercent(shareOf(tones.positive, total))} icon={ThumbsUp} hint={`${formatNumber(tones.positive)} stories`} />
        <StatCard label="Neutral" value={formatPercent(shareOf(tones.neutral, total))} icon={Minus} hint={`${formatNumber(tones.neutral)} stories`} />
        <StatCard label="Negative" value={formatPercent(shareOf(tones.negative, total))} icon={ThumbsDown} hint={`${formatNumber(tones.negative)} stories`} />
      </StatGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <SectionCard title="Sentiment breakdown" description="Stories per sentiment classification." className="lg:col-span-3">
          {total > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bars}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={70} {...chartAxisProps} />
                <YAxis allowDecimals={false} {...chartAxisProps} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="count" name="Stories" radius={[4, 4, 0, 0]}>
                  {bars.map((b) => (
                    <Cell
                      key={b.key}
                      fill={SENTIMENT_COLORS[CLASSIFICATION_STYLE[b.key].tone]}
                      fillOpacity={CLASSIFICATION_STYLE[b.key].opacity}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No rated coverage" description="None of the stories in this period have a sentiment rating yet." />}
        </SectionCard>

        <SectionCard title="Overall tone" description="Positive, neutral and negative share." className="lg:col-span-2">
          {pie.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {pie.map((d) => <Cell key={d.tone} fill={SENTIMENT_COLORS[d.tone]} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No rated coverage" />}
        </SectionCard>
      </div>

      <SectionCard title="Key reputational drivers" description="Headlines that shaped each sentiment classification.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bars.map((b) => {
            const drivers = data.key_brand_reputational_drivers[b.key];
            const headlines = Array.isArray(drivers) ? drivers : [];
            return (
              <section key={b.key} className="space-y-3 rounded-md border p-4">
                <header className="flex items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: SENTIMENT_COLORS[CLASSIFICATION_STYLE[b.key].tone], opacity: CLASSIFICATION_STYLE[b.key].opacity }}
                    />
                    {b.name}
                  </h3>
                  <Badge variant="muted" className="font-normal">{formatNumber(b.count)} · {formatPercent(b.percentage)}</Badge>
                </header>
                <BulletList items={headlines} empty="No coverage in this classification." />
              </section>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

export default function BrandSentimentPage() {
  return (
    <ReportShell<BrandSentimentReport>
      report="brand-media-sentiment-index"
      title="Brand sentiment"
      description="How the media portrays your brand, by sentiment classification"
    >
      {(data) => <SentimentIndex data={data} />}
    </ReportShell>
  );
}
