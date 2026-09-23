import { fetchReport, type ReportFilters, type ReportName } from '@/api/reports';
import { SENTIMENT_COLORS } from '@/lib/charts';
import { formatDate, formatNumber, formatPercent, humanize } from '@/lib/format';
import { reportTheme, type ReportThemeKey } from '@/lib/reportThemes';
import { mergeWeekly, toNumber } from '@/pages/client/reportUtils';
import { companiesOf, sectorsOf } from '@/pages/client/competitive';
import type { MonitoringPair, ReportPeriod } from '@/types/api';
import {
  SENTIMENT_CLASSIFICATIONS,
  type BrandMediaAnalysisReport,
  type BrandSentimentReport,
  type CompetitiveIntelligenceReport,
  type DailyMentionsReport,
  type ExecutiveSummaryReport,
  type IndustryLandscapeReport,
  type OutcomeInsightsReport,
  type PublicationsAnalysisReport,
  type ReportSwotItem,
  type SocialCoverageReport,
  type SwotReport,
  type ThematicDistributionReport,
} from '@/types/reports';
import type { Block, ReportPack, Section } from './types';

const pct = (v: string | number | null | undefined) => formatPercent(toNumber(v));
const num = (v: number | string | null | undefined) => formatNumber(v, '0');

type Loaded<T> = { data: T | null; message: string; error?: string };

async function load<T>(name: ReportName, filters: ReportFilters): Promise<Loaded<T>> {
  try {
    return await fetchReport<T>(name, filters);
  } catch (err) {
    return { data: null, message: '', error: err instanceof Error ? err.message : 'The report could not be generated.' };
  }
}

function section(theme: ReportThemeKey, title: string, loaded: Loaded<unknown>, build: () => Block[], subtitle?: string): Section {
  const { accent } = reportTheme(theme);
  if (loaded.error) return { title, accent, subtitle, blocks: [{ kind: 'note', text: `This section could not be generated: ${loaded.error}` }] };
  if (!loaded.data) return { title, accent, subtitle, blocks: [{ kind: 'note', text: loaded.message || 'No coverage was recorded for this period.' }] };
  const blocks = build().filter((b) => !isEmptyBlock(b));
  return { title, accent, subtitle, blocks: blocks.length ? blocks : [{ kind: 'note', text: 'No coverage was recorded for this period.' }] };
}

function isEmptyBlock(b: Block): boolean {
  switch (b.kind) {
    case 'kpis': return b.items.length === 0;
    case 'bar': return b.categories.length === 0 || b.series.every((s) => s.values.every((v) => !v));
    case 'pie': return b.values.every((v) => !v);
    case 'table': return b.rows.length === 0;
    case 'bullets': return b.items.length === 0;
    default: return false;
  }
}

function weeklyBlock(title: string, trend: ExecutiveSummaryReport['summary']['weeklyTrendOnBrandMediaExposure']): Block {
  const weeks = mergeWeekly(trend);
  return {
    kind: 'bar',
    title,
    categories: weeks.map((w) => w.week),
    series: [{ name: 'Print', values: weeks.map((w) => w.print) }, { name: 'Online', values: weeks.map((w) => w.online) }],
  };
}

// ------------------------------------------------------------------ sections

function executiveSummary(r: ExecutiveSummaryReport): Block[] {
  const s = r.summary;
  return [
    {
      kind: 'kpis',
      items: [
        { label: 'Total media exposure', value: num(s.totalMediaExposure), hint: 'Stories mentioning the brand' },
        { label: 'Local media', value: num(s.brandExposureInLocalMedia), hint: 'Coverage in Nigerian media' },
        { label: 'International media', value: num(s.brandExposureInInternationalMedia), hint: 'Coverage outside Nigeria' },
        { label: 'Reputation score', value: s.brandMediaReputationScore.toFixed(2), hint: '(positive − negative) ÷ total' },
      ],
    },
    {
      kind: 'pie',
      title: 'Sentiment',
      categories: ['Positive', 'Neutral', 'Negative'],
      values: [s.positiveMediaExposure, s.neutralMediaExposure, s.negativeMediaExposure],
      colors: [SENTIMENT_COLORS.positive, SENTIMENT_COLORS.neutral, SENTIMENT_COLORS.negative],
    },
    { kind: 'bar', title: 'Media vehicle', categories: ['Print', 'Online'], series: [{ name: 'Stories', values: [s.mediaVehicle.print, s.mediaVehicle.online] }], colorByCategory: true },
    weeklyBlock('Weekly exposure trend', s.weeklyTrendOnBrandMediaExposure),
    {
      kind: 'bar',
      title: 'Share of voice',
      horizontal: true,
      colorByCategory: true,
      categories: s.competitiveMediaShare.shares.map((x) => x.company),
      series: [{ name: 'Stories', values: s.competitiveMediaShare.shares.map((x) => x.frequency) }],
    },
    {
      kind: 'table',
      title: 'Languages',
      columns: ['Language', 'Stories'],
      rows: Object.entries(s.language.breakdown).sort((a, b) => b[1] - a[1]).map(([name, n]) => [humanize(name), num(n)]),
    },
  ];
}

function brandSentiment(r: BrandSentimentReport): Block[] {
  const drivers: string[][] = [];
  for (const key of SENTIMENT_CLASSIFICATIONS) {
    const list = r.key_brand_reputational_drivers[key];
    if (Array.isArray(list)) list.forEach((h) => drivers.push([humanize(key), h]));
  }
  return [
    {
      kind: 'kpis',
      items: [
        { label: 'Stories classified', value: num(r.totals.total_categorized) },
        { label: 'Not classified', value: num(r.totals.total_uncategorized) },
      ],
    },
    {
      kind: 'bar',
      title: 'Sentiment index',
      horizontal: true,
      colorByCategory: true,
      categories: SENTIMENT_CLASSIFICATIONS.map((k) => humanize(k)),
      series: [{ name: 'Stories', values: SENTIMENT_CLASSIFICATIONS.map((k) => r.sentiment_breakdown[k]?.count ?? 0) }],
    },
    { kind: 'table', title: 'Key reputational drivers', columns: ['Classification', 'Headline'], rows: drivers },
  ];
}

function brandMedia(r: BrandMediaAnalysisReport): Block[] {
  const a = r.analysis;
  const exposure = a.brand_subsidiary_exposure;
  return [
    {
      kind: 'kpis',
      items: [
        { label: 'News mentions', value: num(a.news_mention.total), hint: `${num(a.news_mention.breakdown.headline)} headline · ${num(a.news_mention.breakdown.advertorial)} advertorial` },
        { label: 'Photo mentions', value: num(a.photo_mention.total) },
        { label: 'Video mentions', value: num(a.video_mention.total) },
        { label: 'Print reach', value: num(a.potential_reach.print.total_reach), hint: `${num(a.potential_reach.print.unique_sources)} unique sources` },
      ],
    },
    {
      kind: 'bar',
      title: 'Thematic distribution (top 10)',
      horizontal: true,
      colorByCategory: true,
      categories: a.thematic_distribution.top_10.map((t) => t.activity),
      series: [{ name: 'Stories', values: a.thematic_distribution.top_10.map((t) => t.count) }],
    },
    {
      kind: 'bar',
      title: 'Brand message placement',
      horizontal: true,
      colorByCategory: true,
      categories: a.brand_message_placement.placements.map((p) => p.placement),
      series: [{ name: 'Stories', values: a.brand_message_placement.placements.map((p) => p.count) }],
    },
    weeklyBlock('Weekly volume trend', a.weekly_volume_trend),
    {
      kind: 'bar',
      title: 'Monthly volume trend',
      categories: a.monthly_volume_trend.monthly_breakdown.map((m) => m.month),
      series: [
        { name: 'Print', values: a.monthly_volume_trend.monthly_breakdown.map((m) => m.print.count) },
        { name: 'Online', values: a.monthly_volume_trend.monthly_breakdown.map((m) => m.online.count) },
      ],
    },
    {
      kind: 'table',
      title: 'Brand and subsidiary exposure',
      columns: ['Brand', 'Stories', 'Share'],
      rows: exposure.top_10.map((b) => [b.brand, num(b.count), pct(b.percentage)]),
    },
  ];
}

function thematic(r: ThematicDistributionReport): Block[] {
  return [
    {
      kind: 'kpis',
      items: [
        { label: 'Stories analysed', value: num(r.total_editorials) },
        { label: 'Distinct themes', value: num(r.unique_activities) },
      ],
    },
    {
      kind: 'table',
      title: 'Themes and top headlines',
      columns: ['Theme', 'Stories', 'Share', 'Top headline'],
      rows: r.activities.map((x) => [x.activity, num(x.frequency), pct(x.percentage), x.sample_editorials.find((e) => e.title)?.title ?? '—']),
    },
  ];
}

function publications(r: PublicationsAnalysisReport): Block[] {
  const a = r.analysis;
  const sources = (title: string, v: PublicationsAnalysisReport['analysis']['print_publications_volume']): Block => ({
    kind: 'table', title, columns: ['Publication', 'Stories', 'Share'], rows: v.sources.map((s) => [s.source, num(s.count), pct(s.percentage)]),
  });
  const reporters = (title: string, v: PublicationsAnalysisReport['analysis']['print_reporters']): Block => ({
    kind: 'table', title, columns: ['Reporter', 'Stories', 'Share'], rows: v.reporters.map((s) => [s.reporter, num(s.count), pct(s.percentage)]),
  });
  return [
    sources('Print publications', a.print_publications_volume),
    sources('Online publications (top 10)', a.online_publications_volume),
    reporters('Print reporters (top 10)', a.print_reporters),
    reporters('Online reporters (top 10)', a.online_reporters),
    {
      kind: 'table',
      title: 'Top 3 reporters overall',
      columns: ['Reporter', 'Stories', 'Share', 'Media'],
      rows: a.top_3_reporters_overall.reporters.map((x) => [x.reporter, num(x.count), pct(x.percentage), x.media_types.filter(Boolean).join(', ')]),
    },
    {
      kind: 'table',
      title: 'Spokespersons',
      columns: ['Spokesperson', 'Stories', 'Share'],
      rows: a.spokesperson_volume.spokespersons.map((x) => [x.spokesperson, num(x.count), pct(x.percentage)]),
    },
  ];
}

function social(r: SocialCoverageReport): Block[] {
  const m = r.social_media_metrics;
  return [
    {
      kind: 'kpis',
      items: [
        { label: 'X followers', value: num(m.x.total_followers), hint: `${num(m.x.total_posts)} posts` },
        { label: 'Facebook page likes', value: num(m.facebook.total_page_likes), hint: `${num(m.facebook.total_monthly_posts)} posts` },
        { label: 'Instagram followers', value: num(m.instagram.total_followers), hint: `${num(m.instagram.total_posts)} posts` },
        { label: 'Countries covered', value: num(r.online_country_coverage.unique_countries), hint: 'Online coverage' },
      ],
    },
    {
      kind: 'bar',
      title: 'Online coverage by country',
      horizontal: true,
      colorByCategory: true,
      categories: r.online_country_coverage.countries.slice(0, 10).map((c) => c.country),
      series: [{ name: 'Stories', values: r.online_country_coverage.countries.slice(0, 10).map((c) => c.count) }],
    },
  ];
}

function competitive(r: CompetitiveIntelligenceReport, baseName: string): Section[] {
  const { accent } = reportTheme('competitive-intelligence');
  return sectorsOf(r).map((sector) => {
    const a = sector.analysis;
    const companies = companiesOf(sector, baseName);
    const all: Block[] = [
      {
        kind: 'bar',
        title: 'Competitive media share',
        horizontal: true,
        colorByCategory: true,
        categories: a.competitive_media_share.shares.map((x) => x.company),
        series: [{ name: 'Stories', values: a.competitive_media_share.shares.map((x) => x.frequency) }],
      },
      ...Object.entries(a.media_prominence_analysis).map(([activity, v]): Block => ({
        kind: 'bar',
        title: `Media prominence: ${activity}`,
        horizontal: true,
        colorByCategory: true,
        categories: v.companies.map((c) => c.company),
        series: [{ name: 'Stories', values: v.companies.map((c) => c.frequency) }],
      })),
      {
        kind: 'table',
        title: 'CEOs with media prominence',
        columns: ['CEO', 'Mentions', 'Share'],
        rows: a.top_ceos_with_media_prominence.ceos.map((c) => [c.ceo, num(c.frequency), pct(c.percentage)]),
      },
      {
        kind: 'table',
        title: 'Media sentiment index',
        columns: ['Company', 'Positive', 'Neutral', 'Negative', 'Total'],
        rows: companies.filter((c) => a.media_sentiment_index[c]).map((c) => {
          const s = a.media_sentiment_index[c];
          return [c, `${num(s.positive.frequency)} (${pct(s.positive.percentage)})`, `${num(s.neutral.frequency)} (${pct(s.neutral.percentage)})`, `${num(s.negative.frequency)} (${pct(s.negative.percentage)})`, num(s.total_mentions)];
        }),
      },
      {
        kind: 'table',
        title: 'Competitive PR drivers',
        columns: ['Company', 'Headline'],
        rows: companies.flatMap((c) => (a.competitive_pr_drivers[c]?.sample_titles ?? []).map((t) => [c, t])),
      },
    ];
    const blocks = all.filter((b) => !isEmptyBlock(b));
    return {
      title: `Competitive intelligence — ${sector.sub_industry}`,
      subtitle: `${companies.length} companies · ${num(sector.total_editorials)} stories`,
      accent,
      blocks: blocks.length ? blocks : [{ kind: 'note', text: 'No coverage was recorded for this sector.' }],
    };
  });
}

function swotText(item: ReportSwotItem): string {
  return typeof item === 'string' ? item : item.analysis;
}

function swot(r: SwotReport): Block[] {
  const all = (key: 'strengths' | 'weaknesses' | 'opportunities' | 'threats') =>
    r.analyses.flatMap((a) => (a[key] ?? []).map(swotText)).filter(Boolean);
  const notes = r.analyses.map((a) => a.analyst_note).filter((n): n is string => Boolean(n));
  return [
    { kind: 'bullets', title: 'Strengths', items: all('strengths') },
    { kind: 'bullets', title: 'Weaknesses', items: all('weaknesses') },
    { kind: 'bullets', title: 'Opportunities', items: all('opportunities') },
    { kind: 'bullets', title: 'Threats', items: all('threats') },
    { kind: 'bullets', title: 'Analyst notes', items: notes },
  ];
}

function insights(r: OutcomeInsightsReport): Block[] {
  const notes = r.insights.map((i) => i.analyst_note).filter((n): n is string => Boolean(n));
  return [
    {
      kind: 'table',
      title: 'Outcomes and insights',
      columns: ['Date', 'Category', 'Insight'],
      rows: r.insights.flatMap((entry) => entry.insights.map((i) => [formatDate(entry.date), i.category, i.insight ?? i.analysis ?? '—'])),
    },
    { kind: 'bullets', title: 'Analyst notes', items: notes },
  ];
}

function landscape(r: IndustryLandscapeReport): Block[] {
  return r.overviews.map((o): Block => ({
    kind: 'bullets',
    title: `${o.sector} · ${formatDate(o.date)}`,
    items: [...(o.highlights ?? []), ...(o.analyst_note ? [`Analyst note: ${o.analyst_note}`] : [])],
  }));
}

function mentions(r: DailyMentionsReport): Block[] {
  return [
    {
      kind: 'kpis',
      items: [
        { label: 'Daily mention entries', value: num(r.summary.total_mentions) },
        { label: 'Companies covered', value: num(Object.keys(r.summary.by_company).length) },
      ],
    },
    {
      kind: 'table',
      title: 'Entries by company',
      columns: ['Company', 'Entries'],
      rows: Object.entries(r.summary.by_company).sort((a, b) => b[1] - a[1]).map(([c, n]) => [c, num(n)]),
    },
  ];
}

// ------------------------------------------------------------------ public API

function periodOf(data: unknown): ReportPeriod | null {
  const period = (data as { period?: ReportPeriod } | null)?.period;
  return period?.start && period?.end ? period : null;
}

async function loadLogo(): Promise<string | undefined> {
  try {
    const res = await fetch('/uploads/logo.png');
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

/** Fetches every report for the pair and period and assembles the downloadable pack. */
export async function buildReportPack(pair: MonitoringPair, filters: ReportFilters): Promise<ReportPack> {
  const f = { ...filters, pairId: pair.pair_id };
  const [exec, sentiment, media, themes, pubs, soc, comp, sw, ins, land, dm, logo] = await Promise.all([
    load<ExecutiveSummaryReport>('executive-summary', f),
    load<BrandSentimentReport>('brand-media-sentiment-index', f),
    load<BrandMediaAnalysisReport>('brand-media-analysis', f),
    load<ThematicDistributionReport>('top-thematic-distribution-breakdown', f),
    load<PublicationsAnalysisReport>('publication-reporter-spokesperson-analysis', f),
    load<SocialCoverageReport>('social-stats-online-coverage', f),
    load<CompetitiveIntelligenceReport>('competitive-intelligence', f),
    load<SwotReport>('swot-analysis', f),
    load<OutcomeInsightsReport>('outcome-insights', f),
    load<IndustryLandscapeReport>('industry-landscape-overview', f),
    load<DailyMentionsReport>('daily-mentions', f),
    loadLogo(),
  ]);

  const baseName = pair.base_company.company_name;
  const competitiveSections = comp.data
    ? competitive(comp.data, baseName)
    : [section('competitive-intelligence', 'Competitive intelligence', comp, () => [])];

  const sections: Section[] = [
    section('executive-summary', 'Executive summary', exec, () => executiveSummary(exec.data as ExecutiveSummaryReport)),
    section('brand-media-sentiment-index', 'Brand media sentiment index', sentiment, () => brandSentiment(sentiment.data as BrandSentimentReport)),
    section('brand-media-analysis', 'Brand media analysis', media, () => brandMedia(media.data as BrandMediaAnalysisReport)),
    section('top-thematic-distribution-breakdown', 'Thematic distribution', themes, () => thematic(themes.data as ThematicDistributionReport)),
    section('publication-reporter-spokesperson-analysis', 'Publications, reporters and spokespersons', pubs, () => publications(pubs.data as PublicationsAnalysisReport)),
    section('social-stats-online-coverage', 'Social statistics and online coverage', soc, () => social(soc.data as SocialCoverageReport)),
    ...competitiveSections,
    section('swot-analysis', 'SWOT analysis', sw, () => swot(sw.data as SwotReport)),
    section('outcome-insights', 'Outcomes and insights', ins, () => insights(ins.data as OutcomeInsightsReport)),
    section('industry-landscape-overview', 'Industry landscape', land, () => landscape(land.data as IndustryLandscapeReport)),
    section('daily-mentions', 'Daily mentions', dm, () => mentions(dm.data as DailyMentionsReport)),
  ];

  const period = [exec, media, comp, sentiment, dm].map((l) => periodOf(l.data)).find(Boolean)
    ?? (filters.startDate && filters.endDate ? { start: filters.startDate, end: filters.endDate } : null);
  const periodLabel = period ? `${formatDate(period.start)} – ${formatDate(period.end)}` : filters.month ?? '';
  const periodSlug = filters.startDate && filters.endDate ? `${filters.startDate}_${filters.endDate}` : filters.month ?? 'report';

  return {
    company: baseName,
    competitors: pair.competitors.map((c) => c.company_name),
    periodLabel,
    periodSlug,
    generatedAt: new Date(),
    sections,
    logo,
  };
}

export function reportFileName(pack: ReportPack, ext: 'pptx' | 'pdf'): string {
  const company = pack.company.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
  return `P+-Media-Report_${company}_${pack.periodSlug}.${ext}`;
}
