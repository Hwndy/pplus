import { format, parse } from 'date-fns';
import { AtSign, Camera, Globe2, Video } from 'lucide-react';
import { SectionCard } from '@/components/common/Cards';
import { useReportTheme } from '@/lib/reportThemes';
import { formatDate, formatNumber, humanize } from '@/lib/format';
import type { BrandMediaAnalysisReport } from '@/types/reports';
import { ReportShell } from './ReportShell';
import { KpiTile, PercentBars, PrintOnlineTrend } from './ReportParts';
import { mergeWeeklyPercent, toNumber } from './reportUtils';

function monthLabel(month: string): string {
  const date = parse(month, 'yyyy-MM', new Date());
  return Number.isNaN(date.getTime()) ? month : format(date, 'MMM');
}

function Analysis({ data }: { data: BrandMediaAnalysisReport }) {
  const { palette } = useReportTheme();
  const a = data.analysis;
  const reach = a.potential_reach;

  const activities = a.thematic_distribution.top_10.map((t) => ({
    key: t.activity, label: t.activity, title: t.activity, count: t.count, percentage: toNumber(t.percentage),
  }));
  const brands = a.brand_subsidiary_exposure.top_10.map((b) => ({
    key: b.brand, label: b.brand, title: b.brand, count: b.count, percentage: toNumber(b.percentage),
  }));
  const placements = a.brand_message_placement.placements.map((p) => {
    const label = `${humanize(p.placement)} Mentions`;
    return { key: p.placement, label, title: label, count: p.count, percentage: toNumber(p.percentage) };
  });

  const weekly = mergeWeeklyPercent(a.weekly_volume_trend);
  const monthly = a.monthly_volume_trend.monthly_breakdown.map((m) => ({
    month: monthLabel(m.month),
    print: toNumber(m.print.percentage),
    online: toNumber(m.online.percentage),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label="News Mentions"
          value={formatNumber(a.news_mention.total)}
          icon={AtSign}
          color={palette[0]}
        >
          <p className="mt-1 text-xs text-muted-foreground">
            {formatNumber(a.news_mention.breakdown.headline)} headlines · {formatNumber(a.news_mention.breakdown.advertorial)} advertorials
          </p>
        </KpiTile>
        <KpiTile label="Photo Mentions" value={formatNumber(a.photo_mention.total)} icon={Camera} color={palette[1]} />
        <KpiTile label="Video Mentions" value={formatNumber(a.video_mention.total)} icon={Video} color={palette[2]} />
        <KpiTile label="Potential Reach" sublabel="(Print & Online)" value={formatNumber(reach.combined_reach)} icon={Globe2} color={palette[3]}>
          <p className="mt-1 text-xs text-muted-foreground">
            Print {formatNumber(reach.print.total_reach)} · Online {formatNumber(reach.online.total_reach)}
          </p>
        </KpiTile>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <SectionCard title="Thematic Distribution of Media Activities" description={`Share of ${formatNumber(a.thematic_distribution.total_activities)} stories by media activity.`}>
          <PercentBars rows={activities} empty="There were no media activities recorded for the period under review." />
        </SectionCard>
        <SectionCard
          title="Brand & Subsidiaries Media Exposure"
          description={`Share of ${formatNumber(a.brand_subsidiary_exposure.total_brand_mentions)} stories across your brand and subsidiaries.`}
        >
          <PercentBars rows={brands} empty={a.brand_subsidiary_exposure.note || 'There was no subsidiary media exposure for the period under review.'} />
        </SectionCard>
        <SectionCard title="Brand Message Placement In The Media" description="How your brand's message was presented in coverage." className="lg:col-span-2 2xl:col-span-1">
          <PercentBars rows={placements} empty="There was no message placement recorded for the period under review." />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title="Overall Weekly Volume Trend"
          description={`${formatDate(data.period.start)} – ${formatDate(data.period.end)} · share of each medium's stories per week`}
        >
          <PrintOnlineTrend data={weekly} xKey="week" percent empty="There was no print or online coverage for the period under review." />
        </SectionCard>
        <SectionCard
          title="Overall Monthly Volume Trend"
          description={`January – December ${a.monthly_volume_trend.year ?? ''} · share of each medium's stories per month`}
        >
          <PrintOnlineTrend data={monthly} xKey="month" percent empty="There was no print or online coverage this year." />
        </SectionCard>
      </div>
    </div>
  );
}

export default function BrandMediaAnalysisPage() {
  return (
    <ReportShell<BrandMediaAnalysisReport>
      report="brand-media-analysis"
      title="Brand Media Analysis"
      description="Volume, reach, themes and placement of your brand's coverage."
    >
      {(data) => <Analysis data={data} />}
    </ReportShell>
  );
}
