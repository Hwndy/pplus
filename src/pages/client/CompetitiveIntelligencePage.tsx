import { Building2, Newspaper, PieChart, Target } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/common/Cards';
import { formatNumber, formatPercent } from '@/lib/format';
import { CompetitiveReport, MediaShareSection, ProminenceSection, type SectorView } from './CompetitiveParts';
import { toNumber } from './reportUtils';

function Overview({ view }: { view: SectorView }) {
  const share = view.sector.analysis.competitive_media_share.shares;
  const own = share.find((s) => s.company === view.baseName);
  const rank = own ? share.indexOf(own) + 1 : null;
  const leader = share[0];

  return (
    <div className="space-y-6">
      <StatGrid>
        <StatCard label="Stories in sector" value={formatNumber(view.sector.total_editorials)} icon={Newspaper} />
        <StatCard
          label="Companies compared"
          value={formatNumber(view.companies.length)}
          icon={Building2}
          hint={`${formatNumber(view.report.monitoring_summary.competitor_count)} competitors monitored in total`}
        />
        <StatCard
          label="Your share of voice"
          value={own ? formatPercent(toNumber(own.percentage)) : '—'}
          icon={PieChart}
          hint={rank ? `Ranked ${rank} of ${share.length}` : 'Your brand has no coverage in this sector'}
        />
        <StatCard
          label="Most covered"
          value={<span className="block truncate text-lg" title={leader?.company}>{leader?.company ?? '—'}</span>}
          icon={Target}
          hint={leader ? `${formatNumber(leader.frequency)} stories` : undefined}
        />
      </StatGrid>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2"><MediaShareSection view={view} /></div>
        <div className="lg:col-span-3"><ProminenceSection view={view} /></div>
      </div>
    </div>
  );
}

export default function CompetitiveIntelligencePage() {
  return (
    <CompetitiveReport title="Competitive intelligence" description="Your media presence compared with your competitors">
      {(view) => <Overview view={view} />}
    </CompetitiveReport>
  );
}
