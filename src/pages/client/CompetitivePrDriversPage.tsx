import { SectionCard } from '@/components/common/Cards';
import { EmptyState } from '@/components/common/States';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/format';
import { CompetitiveReport, type SectorView } from './CompetitiveParts';
import { companyLabel } from './competitive';

function PrDrivers({ view }: { view: SectorView }) {
  const drivers = view.sector.analysis.competitive_pr_drivers;
  const companies = view.companies.filter((c) => drivers[c]?.sample_titles.length);

  if (!companies.length) {
    return (
      <SectionCard title="PR drivers">
        <EmptyState title="No headlines in this sector" />
      </SectionCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {companies.map((company) => {
          const entry = drivers[company];
          return (
            <SectionCard
              key={company}
              title={companyLabel(company, view.baseName)}
              description={`Key headlines · ${formatNumber(entry.total_titles_available)} ${entry.total_titles_available === 1 ? 'story' : 'stories'} this period`}
              actions={<span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: view.colors[company] }} aria-hidden />}
            >
              <ol className="space-y-2">
                {entry.sample_titles.map((title, i) => (
                  <li key={`${i}-${title}`} className="flex gap-3 text-sm">
                    <Badge variant="muted" className="h-5 shrink-0 px-2 font-normal">{i + 1}</Badge>
                    <span>{title}</span>
                  </li>
                ))}
              </ol>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}

export default function CompetitivePrDriversPage() {
  return (
    <CompetitiveReport theme="competitive-pr" title="Competitive PR drivers" description="Headlines shaping coverage of your brand and your competitors">
      {(view) => <PrDrivers view={view} />}
    </CompetitiveReport>
  );
}
