import type { ComponentType } from 'react';
import { AlertTriangle, Lightbulb, ShieldCheck, TrendingDown } from 'lucide-react';
import { SectionCard } from '@/components/common/Cards';
import { BulletList } from '@/components/common/Detail';
import { formatDate, formatNumber } from '@/lib/format';
import type { ReportSwotItem, SwotReport } from '@/types/reports';
import { AnalystNote } from './ReportParts';
import { ReportShell } from './ReportShell';

type Analysis = SwotReport['analyses'][number];
type Quadrant = 'strengths' | 'weaknesses' | 'opportunities' | 'threats';

const QUADRANTS: { key: Quadrant; title: string; hint: string; icon: ComponentType<{ className?: string }>; accent: string }[] = [
  { key: 'strengths', title: 'Strengths', hint: 'Internal', icon: ShieldCheck, accent: 'text-primary' },
  { key: 'weaknesses', title: 'Weaknesses', hint: 'Internal', icon: TrendingDown, accent: 'text-destructive' },
  { key: 'opportunities', title: 'Opportunities', hint: 'External', icon: Lightbulb, accent: 'text-primary' },
  { key: 'threats', title: 'Threats', hint: 'External', icon: AlertTriangle, accent: 'text-destructive' },
];

function itemText(item: ReportSwotItem): string {
  return (typeof item === 'string' ? item : item?.analysis ?? '').trim();
}

function SwotCard({ analysis }: { analysis: Analysis }) {
  return (
    <SectionCard title={formatDate(analysis.date)} description="SWOT analysis prepared by your P+ analyst.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {QUADRANTS.map(({ key, title, hint, icon: Icon, accent }) => {
          const items = (analysis[key] ?? []).map(itemText).filter(Boolean);
          return (
            <section key={key} className="space-y-3 rounded-md border bg-muted/30 p-4">
              <header className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Icon className={`h-4 w-4 ${accent}`} />
                  {title}
                </h3>
                <span className="text-xs text-muted-foreground">{hint}</span>
              </header>
              <BulletList items={items} empty={`No ${title.toLowerCase()} recorded`} />
            </section>
          );
        })}
      </div>
      <AnalystNote note={analysis.analyst_note} />
    </SectionCard>
  );
}

function SwotList({ data }: { data: SwotReport }) {
  const analyses = [...data.analyses].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {formatNumber(data.total_analyses)} {data.total_analyses === 1 ? 'analysis' : 'analyses'} in this period, newest first.
      </p>
      {analyses.map((analysis) => <SwotCard key={analysis.id} analysis={analysis} />)}
    </div>
  );
}

export default function SwotReportPage() {
  return (
    <ReportShell<SwotReport>
      report="swot-analysis"
      title="SWOT analysis"
      description="Strengths, weaknesses, opportunities and threats from media coverage"
    >
      {(data) => <SwotList data={data} />}
    </ReportShell>
  );
}
