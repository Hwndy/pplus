import { useMemo, useState, type MouseEvent } from 'react';
import { SectionCard } from '@/components/common/Cards';
import { EmptyState } from '@/components/common/States';
import { formatNumber } from '@/lib/format';
import { MAP_COLORS, buildWorldMap } from '@/lib/worldMap';
import type { SocialCoverageReport } from '@/types/reports';
import { ReportShell } from './ReportShell';
import { PercentBars, ReportHeading } from './ReportParts';
import { formatCompact, toNumber } from './reportUtils';

const asset = (file: string) => `${import.meta.env.BASE_URL}report-assets/${file}`;

function PlatformCard({ name, icon, recorded, stats }: {
  name: string;
  icon: string;
  recorded: boolean;
  stats: { label: string; value: number }[];
}) {
  return (
    <article className="flex flex-col items-center rounded-xl border bg-card p-5 text-center shadow-sm">
      <img src={asset(icon)} alt={name} className="h-12 w-12 rounded-md object-contain" loading="lazy" />
      {recorded ? (
        <dl className="mt-4 grid w-full gap-3">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-sm font-semibold">{s.label}</dt>
              <dd className="text-lg tabular-nums text-muted-foreground" title={formatNumber(s.value)}>{formatCompact(s.value)}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">There were no {name} statistics recorded for the period under review.</p>
      )}
    </article>
  );
}

function CoverageMap({ countries }: { countries: { country: string; count: number }[] }) {
  const map = useMemo(() => buildWorldMap(countries, 960, 480), [countries]);
  const [hover, setHover] = useState<{ name: string; count: number; x: number; y: number } | null>(null);

  const track = (name: string, count: number) => (e: MouseEvent<SVGPathElement>) => {
    const box = e.currentTarget.ownerSVGElement?.parentElement?.getBoundingClientRect();
    if (box) setHover({ name, count, x: e.clientX - box.left, y: e.clientY - box.top });
  };

  return (
    <div className="space-y-3">
      <div className="relative" onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${map.width} ${map.height}`} className="h-auto w-full" role="img" aria-label="World map of online coverage by country">
          {map.paths.map((p) => (
            <path
              key={p.name}
              d={p.d}
              fill={p.fill}
              stroke={MAP_COLORS.border}
              strokeWidth={0.5}
              className="transition-opacity hover:opacity-80"
              onMouseMove={track(p.name, p.count)}
            >
              <title>{p.count ? `${p.name}: ${formatNumber(p.count)} ${p.count === 1 ? 'story' : 'stories'}` : p.name}</title>
            </path>
          ))}
        </svg>
        {hover && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md"
            style={{ left: hover.x, top: hover.y }}
          >
            <span className="font-medium">{hover.name}</span>
            {' · '}{hover.count ? `${formatNumber(hover.count)} ${hover.count === 1 ? 'story' : 'stories'}` : 'No coverage'}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">High Frequency <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: MAP_COLORS.high }} /></span>
        <span className="h-2 w-24 rounded-full" style={{ backgroundImage: `linear-gradient(90deg, ${MAP_COLORS.high}, ${MAP_COLORS.low})` }} aria-hidden />
        <span className="inline-flex items-center gap-1.5">Low Frequency <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: MAP_COLORS.low }} /></span>
      </div>
      {map.unmatched.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">Also covered in: {map.unmatched.join(', ')}</p>
      )}
    </div>
  );
}

function Coverage({ data }: { data: SocialCoverageReport }) {
  const { x, facebook, instagram } = data.social_media_metrics;
  const countries = data.online_country_coverage.countries;
  const mapData = useMemo(() => countries.map((c) => ({ country: c.country, count: c.count })), [countries]);

  return (
    <div className="space-y-6">
      <ReportHeading>Social Stats / Online Coverage by Region</ReportHeading>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <PlatformCard
            name="X"
            icon="x.png"
            recorded={x.records_count > 0}
            stats={[
              { label: x.total_posts === 1 ? 'Total Tweet' : 'Total Tweets', value: x.total_posts },
              { label: 'Followers', value: x.total_followers },
              { label: 'Following', value: x.total_following },
            ]}
          />
          <PlatformCard
            name="Facebook"
            icon="facebook.png"
            recorded={facebook.records_count > 0}
            stats={[
              { label: 'Total Page Likes', value: facebook.total_page_likes },
              { label: 'Total Monthly Posts', value: facebook.total_monthly_posts },
            ]}
          />
          <PlatformCard
            name="Instagram"
            icon="instagram.png"
            recorded={instagram.records_count > 0}
            stats={[
              { label: instagram.total_posts === 1 ? 'Total Post' : 'Total Posts', value: instagram.total_posts },
              { label: 'Followers', value: instagram.total_followers },
              { label: 'Following', value: instagram.total_following },
            ]}
          />
        </div>

        <SectionCard
          title="Online Coverage by Region"
          description={`${formatNumber(data.online_country_coverage.total_coverage_records)} online stories across ${formatNumber(data.online_country_coverage.unique_countries)} ${data.online_country_coverage.unique_countries === 1 ? 'country' : 'countries'}.`}
        >
          {countries.length ? (
            <div className="space-y-4">
              <CoverageMap countries={mapData} />
              <p className="text-center text-sm font-medium">{countries.map((c) => c.country).join(' | ')}</p>
            </div>
          ) : (
            <EmptyState title="There was no online coverage by region for the period under review." className="py-8" />
          )}
        </SectionCard>
      </div>

      {countries.length > 0 && (
        <SectionCard title="Coverage by Country" description="Countries ranked by share of your online coverage.">
          <PercentBars
            rows={countries.map((c) => ({ key: c.country, label: c.country, title: c.country, count: c.count, percentage: toNumber(c.percentage) }))}
            empty="There was no online coverage by region for the period under review."
          />
        </SectionCard>
      )}
    </div>
  );
}

export default function SocialCoveragePage() {
  return (
    <ReportShell<SocialCoverageReport>
      report="social-stats-online-coverage"
      title="Coverage by Region"
      description="Your social media statistics and where your brand was covered online."
    >
      {(data) => <Coverage data={data} />}
    </ReportShell>
  );
}
