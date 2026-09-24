import { formatNumber } from '@/lib/format';
import { CompanyLogo, CompetitiveReport, type SectorView } from './CompetitiveParts';
import { DECK_YELLOW } from './ReportParts';
import { isBrand } from './competitive';

function PrDrivers({ view }: { view: SectorView }) {
  const { report, sector } = view;
  const drivers = sector.analysis.competitive_pr_drivers;
  const shareOrder = sector.analysis.competitive_media_share.shares.map((s) => s.company);
  const covered = [...shareOrder, ...view.companies.filter((c) => !shareOrder.includes(c))];
  const companies = [
    ...covered,
    ...(sector.companies_without_coverage ?? []).filter((c) => !covered.includes(c)),
  ];

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {companies.map((company) => {
        const entry = drivers[company];
        const titles = entry?.sample_titles.filter((t) => t.trim()) ?? [];
        const brand = isBrand(report, company);
        return (
          <article
            key={company}
            className="rounded-2xl border-2 bg-card p-5 shadow-sm"
            style={{ borderColor: brand ? 'var(--report-accent)' : 'color-mix(in srgb, var(--report-accent) 45%, transparent)' }}
          >
            <header className="mb-3 flex items-center gap-3">
              <CompanyLogo report={report} company={company} size="lg" />
              <div className="min-w-0">
                <h3 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl" style={{ color: 'var(--report-accent)' }}>{company}</h3>
                {entry && entry.total_titles_available > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(entry.total_titles_available)} {entry.total_titles_available === 1 ? 'story' : 'stories'} in the period
                  </p>
                )}
              </div>
            </header>
            {titles.length ? (
              <ul className="space-y-2">
                {titles.map((title, i) => (
                  <li key={`${i}-${title}`} className="flex gap-3 text-sm leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm" style={{ backgroundColor: DECK_YELLOW }} aria-hidden />
                    <span>{title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">There was no media exposure recorded.</p>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default function CompetitivePrDriversPage() {
  return (
    <CompetitiveReport theme="competitive-pr" title="Competitive PR Drivers" description="The headlines shaping coverage of your brand and your competitors.">
      {(view) => <PrDrivers view={view} />}
    </CompetitiveReport>
  );
}
