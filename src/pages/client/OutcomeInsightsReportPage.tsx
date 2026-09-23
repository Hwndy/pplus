import { useMemo, useState } from 'react';
import { SectionCard } from '@/components/common/Cards';
import { BulletList, DetailSection } from '@/components/common/Detail';
import { FilterBar, FilterSelect } from '@/components/common/Filters';
import { EmptyState } from '@/components/common/States';
import { formatDate, formatNumber } from '@/lib/format';
import type { OutcomeInsightsReport, ReportInsightItem } from '@/types/reports';
import { AnalystNote } from './ReportParts';
import { ReportShell } from './ReportShell';
import { groupBy, uniqueValues } from './reportUtils';

/** Insights created through the app use `insight`; seeded rows use `analysis`. */
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
      <FilterBar className="mb-0" onReset={category ? () => setCategory('') : undefined}>
        <FilterSelect label="Category" value={category} onChange={setCategory} options={categoryOptions} allLabel="All categories" className="sm:w-72" />
      </FilterBar>

      {records.length === 0 ? (
        <SectionCard title="Insights">
          <EmptyState title="No insights in this category" description="Choose another category to see more." />
        </SectionCard>
      ) : records.map((record) => (
        <SectionCard
          key={record.id}
          title={formatDate(record.date)}
          description={`${formatNumber(record.items.length)} ${record.items.length === 1 ? 'insight' : 'insights'}`}
        >
          <div className="space-y-5">
            {groupBy(record.items, (i) => i.category.trim() || 'General').map((group) => (
              <DetailSection key={group.key} title={group.key}>
                <BulletList items={group.items.map(insightText)} />
              </DetailSection>
            ))}
          </div>
          <AnalystNote note={record.analyst_note} />
        </SectionCard>
      ))}
    </div>
  );
}

export default function OutcomeInsightsReportPage() {
  return (
    <ReportShell<OutcomeInsightsReport>
      report="outcome-insights"
      title="Outcome & insights"
      description="Analyst insights and recommendations drawn from your coverage"
    >
      {(data) => <InsightsList data={data} />}
    </ReportShell>
  );
}
