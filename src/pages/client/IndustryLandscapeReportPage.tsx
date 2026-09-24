import { Target } from 'lucide-react';
import { formatDate } from '@/lib/format';
import type { IndustryLandscapeReport } from '@/types/reports';
import { AnalystNote, DECK_BLUE, DECK_YELLOW, ReportHeading } from './ReportParts';
import { ReportShell } from './ReportShell';
import { groupBy } from './reportUtils';

const HEXAGON = 'polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)';

type Overview = IndustryLandscapeReport['overviews'][number];

function SectorHighlights({ sector, overviews }: { sector: string; overviews: Overview[] }) {
  const highlights = overviews.flatMap((o) => (o.highlights ?? []).map((h) => ({ text: h.trim(), date: o.date })).filter((h) => h.text));
  const dates = Array.from(new Set(overviews.map((o) => o.date)));
  return (
    <section className="space-y-4">
      <ReportHeading description={dates.length > 1 ? `${dates.length} overviews in this period` : `Overview of ${formatDate(dates[0])}`}>
        Industry Landscape Overview – {sector} Highlights
      </ReportHeading>
      {highlights.length ? highlights.map((h, i) => (
        <article key={`${i}-${h.text.slice(0, 24)}`} className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:gap-6">
          <div className="flex h-16 w-[4.5rem] shrink-0 items-center justify-center" style={{ backgroundColor: DECK_BLUE, clipPath: HEXAGON }} aria-hidden>
            <Target className="h-8 w-8" style={{ color: DECK_YELLOW }} />
          </div>
          <p className="min-w-0 flex-1 whitespace-pre-line text-justify text-sm leading-relaxed sm:text-[0.95rem]">{h.text}</p>
        </article>
      )) : (
        <p className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">There were no {sector} highlights for the period under review.</p>
      )}
      {overviews.map((o) => <AnalystNote key={o.id} note={o.analyst_note} />)}
    </section>
  );
}

function Overviews({ data }: { data: IndustryLandscapeReport }) {
  const groups = groupBy(
    [...data.overviews].sort((a, b) => b.date.localeCompare(a.date)),
    (o) => o.sector.trim() || data.industry || 'Industry',
  );
  return (
    <div className="space-y-10">
      {groups.map((g) => <SectorHighlights key={g.key} sector={g.key} overviews={g.items} />)}
    </div>
  );
}

export default function IndustryLandscapeReportPage() {
  return (
    <ReportShell<IndustryLandscapeReport>
      report="industry-landscape-overview"
      title="Industry Landscape Overview"
      description="Key developments across your industry's sectors."
    >
      {(data) => <Overviews data={data} />}
    </ReportShell>
  );
}
