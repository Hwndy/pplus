import { Globe2, Mic, Newspaper, PenLine } from 'lucide-react';
import { SectionCard, StatCard, StatGrid } from '@/components/common/Cards';
import { EmptyState } from '@/components/common/States';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatPercent, humanize } from '@/lib/format';
import type { PublicationVolume, PublicationsAnalysisReport, ReporterVolume } from '@/types/reports';
import { ReportShell } from './ReportShell';
import { RankedBarChart, ShareList } from './ReportParts';
import { initials, toNumber, uniqueValues } from './reportUtils';

const TOP = 10;

const publicationBars = (v: PublicationVolume) => v.sources.slice(0, TOP).map((s) => ({ name: s.source, value: s.count }));
const reporterRows = (v: ReporterVolume) => v.reporters.map((r) => ({ label: r.reporter, value: r.count, percentage: toNumber(r.percentage) }));

function Analysis({ data }: { data: PublicationsAnalysisReport }) {
  const a = data.analysis;
  const top3 = a.top_3_reporters_overall.reporters;
  const spokespersons = a.spokesperson_volume.spokespersons.map((s) => ({
    label: s.spokesperson, value: s.count, percentage: toNumber(s.percentage),
  }));

  return (
    <div className="space-y-6">
      <StatGrid>
        <StatCard
          label="Print publications"
          value={formatNumber(a.print_publications_volume.unique_sources)}
          icon={Newspaper}
          hint={`${formatNumber(a.print_publications_volume.total_count)} print stories`}
        />
        <StatCard
          label="Online publications"
          value={formatNumber(a.online_publications_volume.unique_sources)}
          icon={Globe2}
          hint={`${formatNumber(a.online_publications_volume.total_count)} online stories`}
        />
        <StatCard
          label="Reporters"
          value={formatNumber(uniqueValues([...a.print_reporters.reporters, ...a.online_reporters.reporters].map((r) => r.reporter)).length)}
          icon={PenLine}
          hint={`${formatNumber(a.print_reporters.unique_reporters)} print · ${formatNumber(a.online_reporters.unique_reporters)} online`}
        />
        <StatCard
          label="Spokespersons"
          value={formatNumber(a.spokesperson_volume.unique_spokespersons)}
          icon={Mic}
          hint={`Quoted in ${formatNumber(a.spokesperson_volume.total_count)} stories`}
        />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Top print publications" description={`Print titles that carried your brand most often (top ${TOP}).`}>
          <RankedBarChart data={publicationBars(a.print_publications_volume)} seriesName="Stories" emptyTitle="No print coverage" />
        </SectionCard>
        <SectionCard title="Top online publications" description={`Websites that carried your brand most often (top ${TOP}).`}>
          <RankedBarChart data={publicationBars(a.online_publications_volume)} seriesName="Stories" emptyTitle="No online coverage" />
        </SectionCard>
      </div>

      <SectionCard title="Top reporters overall" description="Journalists who wrote most about your brand across print and online.">
        {top3.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {top3.map((r, i) => (
              <div key={r.reporter} className="flex items-center gap-3 rounded-md border p-4">
                <Avatar>
                  <AvatarFallback className="text-sm font-medium">{initials(r.reporter)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-semibold" title={r.reporter}>{i + 1}. {r.reporter}</p>
                  <p className="text-xs text-muted-foreground">{formatNumber(r.count)} stories · {formatPercent(toNumber(r.percentage))}</p>
                  <div className="flex flex-wrap gap-1">
                    {r.media_types.filter((m): m is string => Boolean(m)).map((m) => (
                      <Badge key={m} variant="muted" className="font-normal">{humanize(m)}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState title="No reporters recorded" />}
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Print reporters" description="Stories per journalist in print.">
          <ShareList rows={reporterRows(a.print_reporters)} limit={TOP} colorful={false} emptyTitle="No print reporters recorded" />
        </SectionCard>
        <SectionCard title="Online reporters" description="Stories per journalist online.">
          <ShareList rows={reporterRows(a.online_reporters)} limit={TOP} colorful={false} emptyTitle="No online reporters recorded" />
        </SectionCard>
      </div>

      <SectionCard title="Spokespersons" description="People quoted on behalf of your brand.">
        <ShareList rows={spokespersons} limit={TOP} emptyTitle="No spokespersons recorded" />
      </SectionCard>
    </div>
  );
}

export default function PublicationsAnalysisPage() {
  return (
    <ReportShell<PublicationsAnalysisReport>
      report="publication-reporter-spokesperson-analysis"
      title="Publications & reporters"
      description="Where your coverage appeared, who wrote it and who spoke for you"
    >
      {(data) => <Analysis data={data} />}
    </ReportShell>
  );
}
