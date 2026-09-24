import { Quote } from 'lucide-react';
import { SectionCard } from '@/components/common/Cards';
import { EmptyState } from '@/components/common/States';
import { formatNumber } from '@/lib/format';
import type { PublicationVolume, PublicationsAnalysisReport, ReporterVolume, SpokespersonHighlight } from '@/types/reports';
import { ReportShell } from './ReportShell';
import { EntityAvatar, PercentBars, ReportHeading, type PercentBarRow } from './ReportParts';
import { toNumber } from './reportUtils';

const TOP = 10;

const publicationRows = (v: PublicationVolume): PercentBarRow[] => v.sources.slice(0, TOP).map((s) => ({
  key: s.source, label: s.source, title: s.source, count: s.count, percentage: toNumber(s.percentage),
}));

const reporterRows = (v: ReporterVolume): PercentBarRow[] => v.reporters.slice(0, TOP).map((r) => {
  const title = r.publication ? `${r.reporter} (${r.publication})` : r.reporter;
  return {
    key: r.reporter,
    title,
    label: (
      <>
        <span className="block truncate">{r.reporter}</span>
        {r.publication && <span className="block truncate text-xs text-muted-foreground">({r.publication})</span>}
      </>
    ),
    count: r.count,
    percentage: toNumber(r.percentage),
  };
});

function SpokespersonCard({ person }: { person: SpokespersonHighlight }) {
  const role = [person.title, person.company].filter(Boolean).join(', ');
  return (
    <article className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <EntityAvatar name={person.spokesperson} src={person.photo_url} fit="cover" size="xl" />
        <div className="min-w-0">
          <p className="font-semibold leading-tight">{person.spokesperson}</p>
          {role && <p className="text-sm font-medium leading-snug text-muted-foreground">({role})</p>}
          <p className="mt-1 text-xs text-muted-foreground">{formatNumber(person.count)} {person.count === 1 ? 'story' : 'stories'}</p>
        </div>
      </div>
      {person.statement ? (
        <blockquote className="relative rounded-md bg-muted/50 p-3 pl-9 text-sm leading-relaxed">
          <Quote className="absolute left-3 top-3 h-4 w-4" style={{ color: 'var(--report-accent)' }} />
          {person.statement}
        </blockquote>
      ) : person.headline ? (
        <p className="text-sm leading-relaxed">
          Featured in “{person.headline}”{person.source && <span className="text-muted-foreground"> — {person.source}</span>}
        </p>
      ) : null}
    </article>
  );
}

function Analysis({ data }: { data: PublicationsAnalysisReport }) {
  const a = data.analysis;
  const highlights: SpokespersonHighlight[] = a.spokesperson_highlights ?? a.spokesperson_volume.spokespersons.map((s) => ({
    ...s, title: null, company: null, photo_url: null, statement: null, headline: null, source: null,
  }));

  return (
    <div className="space-y-6">
      <ReportHeading>Publications / Reporters / Spokespersons Analysis</ReportHeading>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard title="Print Publications (Volume)" description={`${formatNumber(a.print_publications_volume.total_count)} print stories.`}>
            <PercentBars rows={publicationRows(a.print_publications_volume)} empty="There was no print coverage for the period under review." />
          </SectionCard>
          <SectionCard title="Online Publications (Volume)" description={`${formatNumber(a.online_publications_volume.total_count)} online stories.`}>
            <PercentBars rows={publicationRows(a.online_publications_volume)} empty="There was no online coverage for the period under review." />
          </SectionCard>
          <SectionCard title="Print Reporters (Volume)" description="Journalists who wrote most about your brand in print.">
            <PercentBars rows={reporterRows(a.print_reporters)} empty="There were no print reporters recorded for the period under review." />
          </SectionCard>
          <SectionCard title="Online Reporters (Volume)" description="Journalists who wrote most about your brand online.">
            <PercentBars rows={reporterRows(a.online_reporters)} empty="There were no online reporters recorded for the period under review." />
          </SectionCard>
        </div>

        <SectionCard title="Spokespersons" description="The people who spoke on behalf of your brand.">
          {highlights.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-1">
              {highlights.map((p) => <SpokespersonCard key={p.spokesperson} person={p} />)}
            </div>
          ) : (
            <EmptyState title="There were no spokespersons recorded for the period under review." className="py-8" />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

export default function PublicationsAnalysisPage() {
  return (
    <ReportShell<PublicationsAnalysisReport>
      report="publication-reporter-spokesperson-analysis"
      title="Publications & Spokespersons Analysis"
      description="Where your coverage appeared, who wrote it and who spoke for your brand."
    >
      {(data) => <Analysis data={data} />}
    </ReportShell>
  );
}
