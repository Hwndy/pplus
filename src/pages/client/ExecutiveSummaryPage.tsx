import { Globe2, MapPin, Meh, Newspaper, PieChart, ThumbsDown, ThumbsUp } from 'lucide-react';
import { SectionCard } from '@/components/common/Cards';
import { useReportTheme } from '@/lib/reportThemes';
import { formatNumber, humanize } from '@/lib/format';
import type { ExecutiveSummaryReport } from '@/types/reports';
import { ReportShell } from './ReportShell';
import { DonutChart, INDEX_COLORS, KpiTile, PercentBars, PrintOnlineTrend } from './ReportParts';
import { mergeWeekly, percentLabel, toNumber } from './reportUtils';

type Summary = ExecutiveSummaryReport['summary'];

/** Brand share of voice per sector ("14% Holdings · 11% Bank"), or the overall share when sectors are not available. */
function BrandShareTile({ data, color }: { data: ExecutiveSummaryReport; color: string }) {
  const sectors = data.summary.brandShareBySector ?? [];
  const own = data.summary.competitiveMediaShare.shares.find((s) => s.company === data.company);
  return (
    <KpiTile label="Competitive media share % on brand" icon={PieChart} color={color} className="col-span-2 xl:col-span-1">
      {sectors.length ? (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
          {sectors.map((s) => (
            <div
              key={s.sector}
              className="rounded-md px-2 py-1.5 text-center"
              style={{ backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)` }}
              title={`${s.sector}: ${formatNumber(s.brand_mentions)} of ${formatNumber(s.total_mentions)} stories (${s.brand_companies.join(', ')})`}
            >
              <p className="text-lg font-semibold tabular-nums leading-tight">{percentLabel(toNumber(s.percentage))}</p>
              <p className="truncate text-[11px] font-medium text-muted-foreground">{s.sector}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{own ? percentLabel(toNumber(own.percentage)) : '0%'}</p>
      )}
    </KpiTile>
  );
}

function SummaryView({ data }: { data: ExecutiveSummaryReport }) {
  const theme = useReportTheme();
  const s: Summary = data.summary;
  const palette = theme.palette;

  const languages = Object.entries(s.language.breakdown)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({ name: humanize(name), value, color: palette[i % palette.length] }));
  const vehicle = [
    { name: 'Print Media', value: s.mediaVehicle.print, color: palette[3] ?? palette[1] },
    { name: 'Online Media', value: s.mediaVehicle.online, color: palette[0] },
  ];
  const weekly = mergeWeekly(s.weeklyTrendOnBrandMediaExposure);
  const share = s.competitiveMediaShare.shares.map((x) => ({
    key: x.company,
    label: x.company,
    title: x.company,
    count: x.frequency,
    percentage: toNumber(x.percentage),
    highlight: x.company === data.company,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
        <KpiTile label="Total Media Exposure" sublabel="(Print & Online)" value={formatNumber(s.totalMediaExposure)} icon={Newspaper} color={palette[0]} />
        <BrandShareTile data={data} color={palette[1]} />
        <KpiTile label="Brand exposure in local media" value={formatNumber(s.brandExposureInLocalMedia)} icon={MapPin} color={palette[2]} />
        <KpiTile label="Brand exposure in international media" value={formatNumber(s.brandExposureInInternationalMedia)} icon={Globe2} color={palette[4] ?? palette[3]} />
        <KpiTile label="Positive media exposure" value={formatNumber(s.positiveMediaExposure)} icon={ThumbsUp} color={INDEX_COLORS.positive} />
        <KpiTile label="Neutral media exposure" value={formatNumber(s.neutralMediaExposure)} icon={Meh} color={INDEX_COLORS.neutral} />
        <KpiTile label="Negative media exposure" value={formatNumber(s.negativeMediaExposure)} icon={ThumbsDown} color={INDEX_COLORS.negative} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Language" description="Language of the coverage mentioning your brand.">
          <DonutChart data={languages} empty="No language recorded for the period under review." />
        </SectionCard>
        <SectionCard title="Media Vehicle" description="Share of your coverage in print and online media.">
          <DonutChart data={vehicle} empty="No print or online coverage for the period under review." />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <SectionCard title="Weekly Trend on Brand Media Exposure" description="Stories per week, print versus online." className="lg:col-span-3">
          <PrintOnlineTrend data={weekly} xKey="week" empty="There was no print or online coverage for the period under review." />
        </SectionCard>
        <SectionCard
          title="Share of Voice"
          description={`${formatNumber(s.competitiveMediaShare.total_mentions)} rated stories across your brand and competitors.`}
          className="lg:col-span-2"
        >
          <PercentBars rows={share} empty="There was no competitor coverage for the period under review." />
        </SectionCard>
      </div>
    </div>
  );
}

export default function ExecutiveSummaryPage() {
  return (
    <ReportShell<ExecutiveSummaryReport>
      report="executive-summary"
      title="Executive Summary"
      description="The headline view of your brand's media exposure for the period."
    >
      {(data) => <SummaryView data={data} />}
    </ReportShell>
  );
}
