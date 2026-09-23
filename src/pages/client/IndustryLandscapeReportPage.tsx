import { useMemo, useState } from 'react';
import { SectionCard } from '@/components/common/Cards';
import { BulletList } from '@/components/common/Detail';
import { FilterBar, FilterSelect } from '@/components/common/Filters';
import { EmptyState } from '@/components/common/States';
import { formatDate, formatNumber } from '@/lib/format';
import type { IndustryLandscapeReport } from '@/types/reports';
import { AnalystNote } from './ReportParts';
import { ReportShell } from './ReportShell';
import { uniqueValues } from './reportUtils';

function Overviews({ data }: { data: IndustryLandscapeReport }) {
  const [sector, setSector] = useState('');

  const sectorOptions = useMemo(
    () => uniqueValues(data.overviews.map((o) => o.sector)).sort((a, b) => a.localeCompare(b)).map((s) => ({ value: s, label: s })),
    [data.overviews],
  );

  const overviews = data.overviews
    .filter((o) => !sector || o.sector.trim() === sector)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <FilterBar className="mb-0" onReset={sector ? () => setSector('') : undefined}>
        <FilterSelect label="Sector" value={sector} onChange={setSector} options={sectorOptions} allLabel="All sectors" className="sm:w-60" />
        <p className="text-sm text-muted-foreground sm:ml-auto sm:self-center">
          Developments across the {data.industry ? <span className="font-medium text-foreground">{data.industry}</span> : 'your'} industry
        </p>
      </FilterBar>

      {overviews.length === 0 ? (
        <SectionCard title="Overviews">
          <EmptyState title="No overviews for this sector" />
        </SectionCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {overviews.map((o) => {
            const highlights = (o.highlights ?? []).map((h) => h.trim()).filter(Boolean);
            return (
              <SectionCard
                key={o.id}
                title={o.sector}
                description={`${formatDate(o.date)} · ${formatNumber(highlights.length)} ${highlights.length === 1 ? 'highlight' : 'highlights'}`}
              >
                <BulletList items={highlights} empty="No highlights recorded" />
                <AnalystNote note={o.analyst_note} />
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function IndustryLandscapeReportPage() {
  return (
    <ReportShell<IndustryLandscapeReport>
      report="industry-landscape-overview"
      title="Industry landscape"
      description="Key developments across your industry's sectors"
    >
      {(data) => <Overviews data={data} />}
    </ReportShell>
  );
}
