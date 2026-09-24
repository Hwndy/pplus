import { useQuery } from '@tanstack/react-query';
import { SectionCard } from '@/components/common/Cards';
import { LoadingState } from '@/components/common/States';
import { fetchReport } from '@/api/reports';
import { humanize } from '@/lib/format';
import {
  SENTIMENT_CLASSIFICATIONS,
  type BrandSentimentReport,
  type ExecutiveSummaryReport,
  type SentimentClassification,
} from '@/types/reports';
import { ReportShell, type ReportContext } from './ReportShell';
import { INDEX_COLORS, SentimentIndexBars } from './ReportParts';
import { shareOf } from './reportUtils';

type Tone = 'positive' | 'negative' | 'neutral';

const TONE_OF: Record<SentimentClassification, Tone> = {
  strongly_positive: 'positive',
  positive: 'positive',
  moderately_positive: 'positive',
  neutral: 'neutral',
  moderately_negative: 'negative',
  negative: 'negative',
  strongly_negative: 'negative',
};

/** Column order of the printed report's drivers table. */
const COLUMNS: { tone: Tone; title: string }[] = [
  { tone: 'positive', title: 'Positive' },
  { tone: 'negative', title: 'Negative' },
  { tone: 'neutral', title: 'Neutral' },
];

function SentimentIndexCard({ data, context }: { data: BrandSentimentReport; context: ReportContext }) {
  const summary = useQuery({
    queryKey: ['report', 'executive-summary', context.filters],
    queryFn: () => fetchReport<ExecutiveSummaryReport>('executive-summary', context.filters),
  });

  let counts: Record<Tone, number>;
  const s = summary.data?.data?.summary;
  if (s) {
    counts = { positive: s.positiveMediaExposure, neutral: s.neutralMediaExposure, negative: s.negativeMediaExposure };
  } else {
    counts = { positive: 0, neutral: 0, negative: 0 };
    for (const key of SENTIMENT_CLASSIFICATIONS) counts[TONE_OF[key]] += data.sentiment_breakdown[key]?.count ?? 0;
  }
  const total = counts.positive + counts.neutral + counts.negative;

  return (
    <SectionCard title="Brand Media Sentiment Index" description="Percentage distribution of positive, neutral and negative coverage of your brand.">
      {summary.isLoading ? <LoadingState /> : (
        <SentimentIndexBars
          empty="There was no rated media coverage recorded for the period under review."
          rows={[{
            key: 'brand',
            label: data.company,
            title: data.company,
            positive: shareOf(counts.positive, total),
            neutral: shareOf(counts.neutral, total),
            negative: shareOf(counts.negative, total),
            counts,
            highlight: true,
          }]}
        />
      )}
    </SectionCard>
  );
}

function DriversTable({ data }: { data: BrandSentimentReport }) {
  const drivers = (tone: Tone) => {
    const seen = new Set<string>();
    const rows: { headline: string; classification: SentimentClassification }[] = [];
    for (const key of SENTIMENT_CLASSIFICATIONS) {
      if (TONE_OF[key] !== tone) continue;
      const value = data.key_brand_reputational_drivers[key];
      for (const headline of Array.isArray(value) ? value : []) {
        const text = headline.trim();
        if (text && !seen.has(text)) {
          seen.add(text);
          rows.push({ headline: text, classification: key });
        }
      }
    }
    return rows;
  };

  return (
    <SectionCard title="Key Brand Reputational Drivers" description="The pivotal stories that shaped your brand's reputation in the period.">
      <div className="grid grid-cols-1 overflow-hidden rounded-lg border md:grid-cols-3 md:divide-x">
        {COLUMNS.map(({ tone, title }) => {
          const rows = drivers(tone);
          return (
            <div key={tone} className="flex flex-col border-b last:border-b-0 md:border-b-0">
              <div className="px-4 py-2 text-center text-sm font-semibold text-white" style={{ backgroundColor: INDEX_COLORS[tone] }}>{title}</div>
              <ul className="flex-1 list-disc space-y-3 py-4 pl-8 pr-4 text-sm leading-snug">
                {rows.length ? rows.map((r) => (
                  <li key={r.headline}>
                    {r.headline}
                    {r.classification !== tone && (
                      <span className="ml-1.5 whitespace-nowrap text-xs text-muted-foreground">({humanize(r.classification)})</span>
                    )}
                  </li>
                )) : (
                  <li className="text-muted-foreground">There was no {tone} media coverage recorded for the period under review</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

export default function BrandSentimentPage() {
  return (
    <ReportShell<BrandSentimentReport>
      report="brand-media-sentiment-index"
      title="Brand Drivers & Sentiment Index"
      description="How the media portrays your brand and the stories behind it."
    >
      {(data, context) => (
        <div className="space-y-6">
          <SentimentIndexCard data={data} context={context} />
          <DriversTable data={data} />
        </div>
      )}
    </ReportShell>
  );
}
