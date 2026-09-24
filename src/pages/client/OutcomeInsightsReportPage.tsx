import { useMemo, useState } from 'react';
import { FilterBar, FilterSelect } from '@/components/common/Filters';
import { EmptyState } from '@/components/common/States';
import { formatDate } from '@/lib/format';
import type { OutcomeInsightsReport, ReportInsightItem } from '@/types/reports';
import { AnalystNote, NumberedCard, ReportHeading } from './ReportParts';
import { ReportShell } from './ReportShell';
import { uniqueValues } from './reportUtils';

/** Insights created through the app use `insight`; older rows use `analysis`. */
function insightText(item: ReportInsightItem): string {
  return (item.insight ?? item.analysis ?? '').trim();
}

function InsightsList({ data }: { data: OutcomeInsightsReport }) {
  const [category, setCategory] = useState('');

  const categoryOptions = useMemo(
    () => uniqueValues(data.insights.flatMap((r) => r.insights.map((i) => i.category)))
      .sort((a, b) => a.localeCompare(b))
      .map((c) => ({ value: c, label: c })),
    [data.insights],
  );

  const records = [...data.insights]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((record) => ({
      ...record,
      items: record.insights.filter((i) => insightText(i) && (!category || i.category.trim() === category)),
    }))
    .filter((record) => record.items.length > 0);

  return (
    <div className="space-y-6">
      <ReportHeading
        description="Insights, recommendations and suggestions from your P+ analyst."
        actions={categoryOptions.length > 1 ? (
          <FilterBar className="mb-0" onReset={category ? () => setCategory('') : undefined}>
            <FilterSelect label="Category" value={category} onChange={setCategory} options={categoryOptions} allLabel="All categories" className="sm:w-64" />
          </FilterBar>
        ) : undefined}
      >
        Insight / Recommendation / Suggestion
      </ReportHeading>

      {records.length === 0 ? (
        <EmptyState title="There were no insights in this category for the period under review." />
      ) : records.map((record) => (
        <section key={record.id} className="space-y-4">
          {records.length > 1 && <p className="text-sm font-medium text-muted-foreground">{formatDate(record.date)}</p>}
          {record.items.map((item, i) => (
            <NumberedCard key={`${i}-${item.category}`} index={i + 1} category={item.category.trim() || 'Insight'}>
              <p className="whitespace-pre-line text-justify">{insightText(item)}</p>
            </NumberedCard>
          ))}
          <AnalystNote note={record.analyst_note} />
        </section>
      ))}
    </div>
  );
}

export default function OutcomeInsightsReportPage() {
  return (
    <ReportShell<OutcomeInsightsReport>
      report="outcome-insights"
      title="Outcome & Insights"
      description="Analyst insights and recommendations drawn from your coverage."
    >
      {(data) => <InsightsList data={data} />}
    </ReportShell>
  );
}
