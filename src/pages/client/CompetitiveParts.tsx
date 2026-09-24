import { useState, type ReactNode } from 'react';
import { Layers } from 'lucide-react';
import { EmptyState } from '@/components/common/States';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatNumber } from '@/lib/format';
import type { ReportThemeKey } from '@/lib/reportThemes';
import type { CompetitiveIntelligenceReport, CompetitiveSector } from '@/types/reports';
import { ReportShell } from './ReportShell';
import { EntityAvatar, ReportHeading } from './ReportParts';
import { companiesOf, isBrand, logoOf, sectorsOf } from './competitive';

export interface SectorView {
  report: CompetitiveIntelligenceReport;
  sector: CompetitiveSector;
  /** Companies with coverage in the sector, the client's brand first. */
  companies: string[];
  baseName: string;
}

/** Company logo (or initials), ringed in the report accent for the client's own brand. */
export function CompanyLogo({ report, company, size = 'md' }: {
  report: CompetitiveIntelligenceReport;
  company: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return <EntityAvatar name={company} src={logoOf(report, company)} size={size} highlight={isBrand(report, company)} />;
}

function SectorPicker({ report, heading, children }: {
  report: CompetitiveIntelligenceReport;
  heading: string;
  children: (view: SectorView) => ReactNode;
}) {
  const sectors = sectorsOf(report);
  const [selected, setSelected] = useState('');
  const sector = sectors.find((s) => s.sub_industry === selected) ?? sectors[0];

  if (!sector) {
    return <EmptyState icon={Layers} title="There was no competitor coverage for the period under review." />;
  }

  const baseName = report.base_company.name;
  const view: SectorView = { report, sector, companies: companiesOf(sector, baseName), baseName };

  return (
    <div className="space-y-6">
      {sectors.length > 1 && (
        <Tabs value={sector.sub_industry} onValueChange={setSelected}>
          <TabsList className="h-auto max-w-full flex-wrap justify-start">
            {sectors.map((s) => <TabsTrigger key={s.sub_industry} value={s.sub_industry}>{s.sub_industry}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      )}
      <ReportHeading
        description={`${formatNumber(view.companies.length)} ${view.companies.length === 1 ? 'company' : 'companies'} · ${formatNumber(sector.total_editorials)} stories in this sector`}
      >
        {heading} – {sector.sub_industry}
      </ReportHeading>
      {children(view)}
    </div>
  );
}

/** ReportShell for the competitive intelligence report plus a sector (sub-industry) picker. */
export function CompetitiveReport({ title, description, theme = 'competitive-intelligence', children }: {
  title: string;
  description: string;
  theme?: ReportThemeKey;
  children: (view: SectorView) => ReactNode;
}) {
  return (
    <ReportShell<CompetitiveIntelligenceReport> report="competitive-intelligence" theme={theme} title={title} description={description}>
      {(data) => <SectorPicker report={data} heading={title}>{children}</SectorPicker>}
    </ReportShell>
  );
}
