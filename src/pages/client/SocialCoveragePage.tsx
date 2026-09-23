import { Globe2, MapPin, Share2 } from 'lucide-react';
import { SectionCard, StatCard, StatGrid } from '@/components/common/Cards';
import { DataTable, type Column } from '@/components/common/DataTable';
import { EmptyState } from '@/components/common/States';
import { formatDate, formatNumber, formatPercent } from '@/lib/format';
import type { SocialCoverageReport, SocialPlatformRecords } from '@/types/reports';
import { ReportShell } from './ReportShell';
import { RankedBarChart } from './ReportParts';
import { toNumber } from './reportUtils';

type CountryRow = SocialCoverageReport['online_country_coverage']['countries'][number];

/** Values of the most recent snapshot for a platform (followers etc. are point-in-time figures). */
function latestSnapshot(platform: SocialPlatformRecords) {
  const records = [...platform.records].sort((a, b) => b.date.localeCompare(a.date));
  const latest = records[0];
  const value = (key: string): number | null => {
    if (!latest) return null;
    const values = latest.metrics.map((m) => m[key]).filter((v) => v !== null && v !== undefined && v !== '');
    return values.length ? values.reduce<number>((sum, v) => sum + toNumber(v), 0) : null;
  };
  return { date: latest?.date ?? null, value };
}

function Metric({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-md border p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function PlatformCard({ name, platform, metrics }: {
  name: string;
  platform: SocialPlatformRecords;
  metrics: { label: string; value: string; hint?: string }[];
}) {
  const { date } = latestSnapshot(platform);
  return (
    <SectionCard
      title={name}
      description={platform.records_count > 0
        ? `Latest figures as of ${formatDate(date)} · ${formatNumber(platform.records_count)} ${platform.records_count === 1 ? 'record' : 'records'} in period`
        : 'No figures recorded in this period.'}
    >
      {platform.records_count > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m) => <Metric key={m.label} {...m} />)}
        </div>
      ) : <EmptyState title={`No ${name} data`} className="py-6" />}
    </SectionCard>
  );
}

const countryColumns: Column<CountryRow>[] = [
  { key: 'country', header: 'Country', cell: (r) => <span className="font-medium">{r.country}</span> },
  { key: 'count', header: 'Stories', align: 'right', cell: (r) => formatNumber(r.count) },
  { key: 'share', header: 'Share', align: 'right', cell: (r) => formatPercent(toNumber(r.percentage)) },
];

function Coverage({ data }: { data: SocialCoverageReport }) {
  const { x, facebook, instagram } = data.social_media_metrics;
  const xLatest = latestSnapshot(x);
  const igLatest = latestSnapshot(instagram);
  const fbLatest = latestSnapshot(facebook);
  const countries = data.online_country_coverage.countries;
  const location = [data.location.state, data.location.country].filter(Boolean).join(', ');

  return (
    <div className="space-y-6">
      <StatGrid className="xl:grid-cols-3">
        <StatCard
          label="Active platforms"
          value={formatNumber(data.summary.platforms_active.length)}
          icon={Share2}
          hint={data.summary.platforms_active.length ? data.summary.platforms_active.join(', ') : 'No platform figures recorded'}
        />
        <StatCard
          label="Countries covered"
          value={formatNumber(data.summary.countries_covered)}
          icon={Globe2}
          hint={`${formatNumber(data.online_country_coverage.total_coverage_records)} stories with a country`}
        />
        <StatCard label="Head office" value={<span className="text-lg">{location || '—'}</span>} icon={MapPin} />
      </StatGrid>

      <div className="grid gap-6 xl:grid-cols-3">
        <PlatformCard
          name="X"
          platform={x}
          metrics={[
            { label: 'Followers', value: formatNumber(xLatest.value('followers')) },
            { label: 'Following', value: formatNumber(xLatest.value('following')) },
            { label: 'Posts', value: formatNumber(xLatest.value('posts')) },
            { label: 'Average followers', value: formatNumber(Math.round(toNumber(x.average_followers))), hint: 'Across records in period' },
          ]}
        />
        <PlatformCard
          name="Facebook"
          platform={facebook}
          metrics={[
            { label: 'Page likes', value: formatNumber(fbLatest.value('page_likes')) },
            { label: 'Monthly posts', value: formatNumber(fbLatest.value('monthly_posts')) },
            { label: 'Average likes per post', value: formatNumber(toNumber(facebook.average_likes_per_post)) },
            { label: 'Average comments per post', value: formatNumber(toNumber(facebook.average_comments_per_post)) },
          ]}
        />
        <PlatformCard
          name="Instagram"
          platform={instagram}
          metrics={[
            { label: 'Followers', value: formatNumber(igLatest.value('followers')) },
            { label: 'Following', value: formatNumber(igLatest.value('following')) },
            { label: 'Posts', value: formatNumber(igLatest.value('posts')) },
            { label: 'Average followers', value: formatNumber(Math.round(toNumber(instagram.average_followers))), hint: 'Across records in period' },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Coverage by country" description="Stories per country (top 10).">
          <RankedBarChart
            data={countries.slice(0, 10).map((c) => ({ name: c.country, value: c.count }))}
            seriesName="Stories"
            emptyTitle="No country recorded"
            colorful
          />
        </SectionCard>
        <SectionCard title="All countries" description="Every country where your brand was covered.">
          {countries.length ? (
            <DataTable columns={countryColumns} rows={countries} getRowKey={(r) => r.country} />
          ) : <EmptyState title="No country recorded" />}
        </SectionCard>
      </div>
    </div>
  );
}

export default function SocialCoveragePage() {
  return (
    <ReportShell<SocialCoverageReport>
      report="social-stats-online-coverage"
      title="Social & regional coverage"
      description="Social media statistics and where your brand was covered"
    >
      {(data) => <Coverage data={data} />}
    </ReportShell>
  );
}
