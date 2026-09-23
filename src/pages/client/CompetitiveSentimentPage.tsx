import {
  Bar, BarChart, CartesianGrid, Cell, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { SectionCard } from '@/components/common/Cards';
import { DataTable, type Column } from '@/components/common/DataTable';
import { EmptyState } from '@/components/common/States';
import { SENTIMENT_COLORS, chartAxisProps, chartTooltipStyle } from '@/lib/charts';
import { formatNumber, formatPercent } from '@/lib/format';
import { CompetitiveReport, type SectorView } from './CompetitiveParts';
import { companyLabel, sentimentRows, type SentimentRow } from './competitive';

function scoreColor(score: number) {
  if (score > 0) return SENTIMENT_COLORS.positive;
  if (score < 0) return SENTIMENT_COLORS.negative;
  return SENTIMENT_COLORS.neutral;
}

function SentimentView({ view }: { view: SectorView }) {
  const rows = sentimentRows(view.sector, view.companies).filter((r) => r.total > 0);

  const columns: Column<SentimentRow>[] = [
    { key: 'company', header: 'Company', cell: (r) => <span className="font-medium">{companyLabel(r.company, view.baseName)}</span> },
    { key: 'positive', header: 'Positive', align: 'right', cell: (r) => `${formatNumber(r.positive)} (${formatPercent(r.positivePct)})` },
    { key: 'neutral', header: 'Neutral', align: 'right', cell: (r) => `${formatNumber(r.neutral)} (${formatPercent(r.neutralPct)})` },
    { key: 'negative', header: 'Negative', align: 'right', cell: (r) => `${formatNumber(r.negative)} (${formatPercent(r.negativePct)})` },
    { key: 'total', header: 'Total', align: 'right', cell: (r) => formatNumber(r.total) },
    { key: 'score', header: 'Score', align: 'right', cell: (r) => r.score.toFixed(2) },
  ];

  if (!rows.length) {
    return (
      <SectionCard title="Media sentiment">
        <EmptyState title="No rated coverage in this sector" description="None of the stories in this sector have a sentiment rating." />
      </SectionCard>
    );
  }

  const height = Math.max(200, rows.length * 44 + 60);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Sentiment frequency" description="Positive, neutral and negative stories per company.">
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} {...chartAxisProps} />
              <YAxis type="category" dataKey="company" width={150} interval={0} {...chartAxisProps} />
              <Tooltip {...chartTooltipStyle} />
              <Legend />
              <Bar dataKey="positive" name="Positive" stackId="s" fill={SENTIMENT_COLORS.positive} barSize={22} />
              <Bar dataKey="neutral" name="Neutral" stackId="s" fill={SENTIMENT_COLORS.neutral} barSize={22} />
              <Bar dataKey="negative" name="Negative" stackId="s" fill={SENTIMENT_COLORS.negative} barSize={22} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Sentiment score" description="(Positive − negative) ÷ total, from −1 (all negative) to +1 (all positive).">
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[-1, 1]} ticks={[-1, -0.5, 0, 0.5, 1]} {...chartAxisProps} />
              <YAxis type="category" dataKey="company" width={150} interval={0} {...chartAxisProps} />
              <Tooltip {...chartTooltipStyle} formatter={(value: number) => value.toFixed(2)} />
              <ReferenceLine x={0} stroke={SENTIMENT_COLORS.neutral} />
              <Bar dataKey="score" name="Score" barSize={22}>
                {rows.map((r) => <Cell key={r.company} fill={scoreColor(r.score)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Sentiment by company" description="Frequency and share of each tone.">
        <DataTable columns={columns} rows={rows} getRowKey={(r) => r.company} />
      </SectionCard>
    </div>
  );
}

export default function CompetitiveSentimentPage() {
  return (
    <CompetitiveReport theme="competitive-sentiment" title="Competitive sentiment" description="Tone of coverage for your brand and your competitors">
      {(view) => <SentimentView view={view} />}
    </CompetitiveReport>
  );
}
