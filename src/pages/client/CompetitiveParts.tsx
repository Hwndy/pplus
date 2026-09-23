import { useState, type ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Layers } from 'lucide-react';
import { SectionCard } from '@/components/common/Cards';
import { EmptyState } from '@/components/common/States';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { chartAxisProps, chartTooltipStyle } from '@/lib/charts';
import { formatNumber } from '@/lib/format';
import type { CompetitiveIntelligenceReport, CompetitiveSector } from '@/types/reports';
import type { ReportThemeKey } from '@/lib/reportThemes';
import { ReportShell } from './ReportShell';
import { ShareList } from './ReportParts';
import { companiesOf, companyColors, companyLabel, prominenceRows, sectorsOf } from './competitive';
import { toNumber } from './reportUtils';

export interface SectorView {
  report: CompetitiveIntelligenceReport;
  sector: CompetitiveSector;
  /** Companies in the sector, the client's brand first. */
  companies: string[];
  colors: Record<string, string>;
  baseName: string;
}

function SectorPicker({ report, children }: { report: CompetitiveIntelligenceReport; children: (view: SectorView) => ReactNode }) {
  const sectors = sectorsOf(report);
  const [selected, setSelected] = useState('');
  const sector = sectors.find((s) => s.sub_industry === selected) ?? sectors[0];

  if (!sector) {
    return <EmptyState icon={Layers} title="No sectors to compare" description="There is no competitor coverage in this period." />;
  }

  const baseName = report.base_company.name;
  const companies = companiesOf(sector, baseName);
  const view: SectorView = { report, sector, companies, colors: companyColors(companies), baseName };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {sectors.length > 1 ? (
          <Tabs value={sector.sub_industry} onValueChange={setSelected}>
            <TabsList className="h-auto max-w-full flex-wrap justify-start">
              {sectors.map((s) => <TabsTrigger key={s.sub_industry} value={s.sub_industry}>{s.sub_industry}</TabsTrigger>)}
            </TabsList>
          </Tabs>
        ) : (
          <p className="text-sm font-medium">{sector.sub_industry}</p>
        )}
        <p className="text-sm text-muted-foreground">
          {formatNumber(companies.length)} {companies.length === 1 ? 'company' : 'companies'} · {formatNumber(sector.total_editorials)} stories in this sector
        </p>
      </div>
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
      {(data) => <SectorPicker report={data}>{children}</SectorPicker>}
    </ReportShell>
  );
}

export function MediaShareSection({ view }: { view: SectorView }) {
  const share = view.sector.analysis.competitive_media_share;
  return (
    <SectionCard title="Competitive media share" description={`${formatNumber(share.total_mentions)} stories with a sentiment rating.`}>
      <ShareList
        rows={share.shares.map((s) => ({ label: companyLabel(s.company, view.baseName), value: s.frequency, percentage: toNumber(s.percentage) }))}
        emptyTitle="No coverage in this sector"
      />
    </SectionCard>
  );
}

export function ProminenceSection({ view }: { view: SectorView }) {
  const activities = view.report.monitoring_summary.media_prominences;
  const rows = prominenceRows(view.sector, view.companies);
  const hasData = Object.values(view.sector.analysis.media_prominence_analysis).some((p) => p.total_mentions > 0);

  return (
    <SectionCard title="Media prominence analysis" description="Stories per company for each media prominence activity you track.">
      {!activities.length ? (
        <EmptyState title="No prominence activities configured" description="Ask your account manager to set the media activities to track for your monitoring." />
      ) : !hasData ? (
        <EmptyState title="No prominence coverage" description={`No stories in this sector matched: ${activities.join(', ')}.`} />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="activity" interval={0} {...chartAxisProps} />
            <YAxis allowDecimals={false} {...chartAxisProps} />
            <Tooltip {...chartTooltipStyle} />
            <Legend />
            {view.companies.map((company) => (
              <Bar key={company} dataKey={(row: Record<string, string | number>) => row[company]} name={company} fill={view.colors[company]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </SectionCard>
  );
}
