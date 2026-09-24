import type { ComponentType } from 'react';
import { AlertTriangle, Lightbulb, ThumbsDown, ThumbsUp } from 'lucide-react';
import { formatDate } from '@/lib/format';
import type { ReportSwotItem, SwotReport } from '@/types/reports';
import { AnalystNote, ReportHeading } from './ReportParts';
import { ReportShell } from './ReportShell';

type Analysis = SwotReport['analyses'][number];
type Quadrant = 'strengths' | 'weaknesses' | 'opportunities' | 'threats';

/** Colours and icons of the printed report's SWOT slide. */
const QUADRANTS: { key: Quadrant; title: string; icon: ComponentType<{ className?: string }>; color: string }[] = [
  { key: 'strengths', title: 'Strengths', icon: ThumbsUp, color: '#0FB5AE' },
  { key: 'weaknesses', title: 'Weaknesses', icon: ThumbsDown, color: '#C0161B' },
  { key: 'opportunities', title: 'Opportunities', icon: Lightbulb, color: '#F7925B' },
  { key: 'threats', title: 'Threats', icon: AlertTriangle, color: '#A0679E' },
];

const HEXAGON = 'polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)';

function itemText(item: ReportSwotItem): string {
  return (typeof item === 'string' ? item : item?.analysis ?? '').trim();
}

function SwotAnalysis({ analysis, showDate }: { analysis: Analysis; showDate: boolean }) {
  return (
    <section className="space-y-4">
      {showDate && <ReportHeading>SWOT Analysis – {formatDate(analysis.date)}</ReportHeading>}
      {QUADRANTS.map(({ key, title, icon: Icon, color }) => {
        const items = (analysis[key] ?? []).map(itemText).filter(Boolean);
        return (
          <article
            key={key}
            className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:gap-6"
            style={{ borderLeft: `6px solid ${color}` }}
          >
            <div
              className="flex h-20 w-24 shrink-0 items-center justify-center text-white"
              style={{ backgroundColor: color, clipPath: HEXAGON }}
              aria-hidden
            >
              <Icon className="h-9 w-9" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight" style={{ color }}>{title}</h3>
              {items.length ? (
                <div className="space-y-2 text-sm leading-relaxed text-foreground/90 sm:text-[0.95rem]">
                  {items.map((text, i) => <p key={`${i}-${text.slice(0, 24)}`} className="whitespace-pre-line text-justify">{text}</p>)}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">There were no {title.toLowerCase()} recorded for the period under review.</p>
              )}
            </div>
          </article>
        );
      })}
      <AnalystNote note={analysis.analyst_note} />
    </section>
  );
}

function SwotList({ data }: { data: SwotReport }) {
  const analyses = [...data.analyses].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="space-y-10">
      {analyses.map((analysis) => <SwotAnalysis key={analysis.id} analysis={analysis} showDate={analyses.length > 1} />)}
    </div>
  );
}

export default function SwotReportPage() {
  return (
    <ReportShell<SwotReport>
      report="swot-analysis"
      title="SWOT Analysis"
      description="Strengths, weaknesses, opportunities and threats drawn from your media coverage."
    >
      {(data) => <SwotList data={data} />}
    </ReportShell>
  );
}
