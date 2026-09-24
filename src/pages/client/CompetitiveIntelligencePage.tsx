import { SectionCard } from '@/components/common/Cards';
import { formatNumber } from '@/lib/format';
import { CompanyLogo, CompetitiveReport, type SectorView } from './CompetitiveParts';
import { EntityAvatar, PercentBars, SentimentIndexBars, type PercentBarRow } from './ReportParts';
import { isBrand, metricsOf, sentimentRows } from './competitive';
import { noMetricCoverage, toNumber } from './reportUtils';

/** The printed report charts the top ten companies for media share and the top five per metric. */
const TOP_SHARE = 10;
const TOP_METRIC = 5;

function companyRows(view: SectorView, entries: { company: string; frequency: number; percentage: string | number }[], limit: number): PercentBarRow[] {
  return entries.slice(0, limit).map((c) => ({
    key: c.company,
    label: c.company,
    title: c.company,
    count: c.frequency,
    percentage: toNumber(c.percentage),
    highlight: isBrand(view.report, c.company),
    leading: <CompanyLogo report={view.report} company={c.company} />,
  }));
}

function SectorOverview({ view }: { view: SectorView }) {
  const { report, sector } = view;
  const share = sector.analysis.competitive_media_share;
  const metrics = metricsOf(report);
  const ceos = sector.analysis.top_ceos_with_media_prominence.ceos;
  const shareOrder = share.shares.map((s) => s.company);
  const sentiment = sentimentRows(sector, [...shareOrder, ...view.companies.filter((c) => !shareOrder.includes(c))]);

  const ceoRows: PercentBarRow[] = ceos.slice(0, TOP_METRIC).map((c) => {
    const title = c.company ? `${c.ceo} (${c.company})` : c.ceo;
    return {
      key: c.ceo,
      title,
      label: (
        <>
          <span className="block">{c.ceo}</span>
          {c.company && <span className="block text-xs text-muted-foreground">({c.company})</span>}
        </>
      ),
      count: c.frequency,
      percentage: toNumber(c.percentage),
      highlight: c.company ? isBrand(report, c.company) : false,
      leading: <EntityAvatar name={c.ceo} src={c.photo_url} fit="cover" size="md" />,
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <SectionCard
          title={share.shares.length > 5 ? 'Top 10 Competitive Media Share' : 'Top Competitive Media Share'}
          description={`${formatNumber(share.total_mentions)} rated stories in this sector.`}
        >
          <PercentBars rows={companyRows(view, share.shares, TOP_SHARE)} empty="There was no competitive media share for the period under review." />
        </SectionCard>

        {metrics.map((metric) => {
          const entry = sector.analysis.media_prominence_analysis[metric];
          return (
            <SectionCard
              key={metric}
              title={`Top Competitive Metric: ${metric}`}
              description={entry?.total_mentions ? `${formatNumber(entry.total_mentions)} stories on ${metric}.` : undefined}
            >
              <PercentBars rows={entry ? companyRows(view, entry.companies, TOP_METRIC) : []} empty={noMetricCoverage(metric)} />
            </SectionCard>
          );
        })}

        <SectionCard title="Top CEOs With Media Prominence" description="Chief executives most visible in coverage of your competitive metrics.">
          <PercentBars rows={ceoRows} empty="There was no CEO media prominence for the period under review." />
        </SectionCard>
      </div>

      <SectionCard title="Media Sentiment Index" description="Positive, neutral and negative coverage per company; negative coverage extends to the left.">
        <SentimentIndexBars
          empty="There was no rated coverage in this sector for the period under review."
          rows={sentiment.map((r) => ({
            key: r.company,
            title: r.company,
            label: (
              <>
                <span className="hidden min-w-0 truncate sm:inline">{r.company}</span>
                <CompanyLogo report={report} company={r.company} size="sm" />
              </>
            ),
            positive: r.positivePct,
            neutral: r.neutralPct,
            negative: r.negativePct,
            counts: { positive: r.positive, neutral: r.neutral, negative: r.negative },
            highlight: isBrand(report, r.company),
          }))}
        />
      </SectionCard>
    </div>
  );
}

export default function CompetitiveIntelligencePage() {
  return (
    <CompetitiveReport title="Competitive Intelligence" description="Your media presence, competitive metrics, CEOs and sentiment compared with your competitors.">
      {(view) => <SectorOverview view={view} />}
    </CompetitiveReport>
  );
}
