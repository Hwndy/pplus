import { SectionCard } from '@/components/common/Cards';
import { EmptyState } from '@/components/common/States';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatNumber, formatPercent } from '@/lib/format';
import { useChartColors } from '@/lib/reportThemes';
import { CompetitiveReport, MediaShareSection, type SectorView } from './CompetitiveParts';
import { RankedBarChart } from './ReportParts';
import { initials, toNumber } from './reportUtils';

function CeoView({ view }: { view: SectorView }) {
  const CHART_COLORS = useChartColors();
  const { ceos, total_ceo_mentions: total } = view.sector.analysis.top_ceos_with_media_prominence;
  const activities = view.report.monitoring_summary.media_prominences;

  return (
    <div className="space-y-6">
      <SectionCard
        title="Top CEOs with media prominence"
        description={activities.length
          ? `Stories about ${activities.join(', ')} attributed to each company's chief executive (${formatNumber(total)} in total).`
          : 'Stories attributed to each company\'s chief executive.'}
      >
        {ceos.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ceos.map((c, i) => {
              const pct = toNumber(c.percentage);
              return (
                <div key={c.ceo} className="space-y-3 rounded-md border p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="font-medium">{initials(c.ceo)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" title={c.ceo}>{c.ceo}</p>
                      <p className="text-xs text-muted-foreground">Rank {i + 1} · {formatNumber(c.frequency)} stories</p>
                    </div>
                    <span className="ml-auto text-lg font-semibold">{formatPercent(pct)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No CEO prominence in this sector"
            description={activities.length ? undefined : 'No media prominence activities are configured for your monitoring.'}
          />
        )}
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="CEO coverage" description="Stories per chief executive.">
          <RankedBarChart data={ceos.map((c) => ({ name: c.ceo, value: c.frequency }))} seriesName="Stories" emptyTitle="No CEO coverage" colorful />
        </SectionCard>
        <MediaShareSection view={view} />
      </div>
    </div>
  );
}

export default function CompetitiveCeosPage() {
  return (
    <CompetitiveReport theme="competitive-ceos" title="Competitor CEOs" description="Media prominence of chief executives across your competitive set">
      {(view) => <CeoView view={view} />}
    </CompetitiveReport>
  );
}
