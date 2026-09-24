import { fetchReport, type ReportFilters, type ReportName } from '@/api/reports';
import { formatDate } from '@/lib/format';
import type { MonitoringPair, ReportPeriod } from '@/types/api';
import type {
  BrandMediaAnalysisReport, BrandSentimentReport, CompetitiveIntelligenceReport, DailyMentionsReport,
  ExecutiveSummaryReport, IndustryLandscapeReport, OutcomeInsightsReport, PublicationsAnalysisReport,
  SocialCoverageReport, SwotReport, ThematicDistributionReport,
} from '@/types/reports';
import { fetchImage, type ExportImage } from './images';

/** Result of one report request: data, the "no coverage" message, or an error. */
export interface Loaded<T> { data: T | null; message: string; error?: string }

export interface ReportData {
  pair: MonitoringPair;
  filters: ReportFilters;
  periodLabel: string;
  /** "October 2025" for a month, otherwise the date range. */
  periodTitle: string;
  generatedAt: Date;
  executive: Loaded<ExecutiveSummaryReport>;
  sentiment: Loaded<BrandSentimentReport>;
  brandMedia: Loaded<BrandMediaAnalysisReport>;
  thematic: Loaded<ThematicDistributionReport>;
  publications: Loaded<PublicationsAnalysisReport>;
  social: Loaded<SocialCoverageReport>;
  competitive: Loaded<CompetitiveIntelligenceReport>;
  swot: Loaded<SwotReport>;
  insights: Loaded<OutcomeInsightsReport>;
  landscape: Loaded<IndustryLandscapeReport>;
  mentions: Loaded<DailyMentionsReport>;
  images: {
    clientLogo: ExportImage | null;
    cover: ExportImage | null;
    /** Company logos and CEO photos by company name; spokesperson/CEO photos by person name. */
    logos: Map<string, ExportImage>;
    people: Map<string, ExportImage>;
    platforms: { x: ExportImage | null; facebook: ExportImage | null; instagram: ExportImage | null };
    methodology: ExportImage | null;
    principles: ExportImage | null;
  };
}

async function load<T>(name: ReportName, filters: ReportFilters): Promise<Loaded<T>> {
  try {
    return await fetchReport<T>(name, filters);
  } catch (err) {
    return { data: null, message: '', error: err instanceof Error ? err.message : 'This section could not be generated.' };
  }
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function periodOf(...loaded: Loaded<unknown>[]): ReportPeriod | null {
  for (const l of loaded) {
    const period = (l.data as { period?: ReportPeriod } | null)?.period;
    if (period?.start && period?.end) return period;
  }
  return null;
}

const asset = (name: string) => `${import.meta.env.BASE_URL}report-assets/${name}`;

/** Loads every report for the pair and period, plus the images the deck shows. */
export async function loadReportData(pair: MonitoringPair, baseFilters: ReportFilters): Promise<ReportData> {
  const filters = { ...baseFilters, pairId: pair.pair_id };
  const [executive, sentiment, brandMedia, thematic, publications, social, competitive, swot, insights, landscape, mentions] = await Promise.all([
    load<ExecutiveSummaryReport>('executive-summary', filters),
    load<BrandSentimentReport>('brand-media-sentiment-index', filters),
    load<BrandMediaAnalysisReport>('brand-media-analysis', filters),
    load<ThematicDistributionReport>('top-thematic-distribution-breakdown', filters),
    load<PublicationsAnalysisReport>('publication-reporter-spokesperson-analysis', filters),
    load<SocialCoverageReport>('social-stats-online-coverage', filters),
    load<CompetitiveIntelligenceReport>('competitive-intelligence', filters),
    load<SwotReport>('swot-analysis', filters),
    load<OutcomeInsightsReport>('outcome-insights', filters),
    load<IndustryLandscapeReport>('industry-landscape-overview', filters),
    load<DailyMentionsReport>('daily-mentions', filters),
  ]);

  // Images: every company logo and person photo the report refers to.
  const logoUrls = new Map<string, string>();
  const peopleUrls = new Map<string, string>();
  for (const [name, profile] of Object.entries(competitive.data?.company_profiles ?? {})) {
    if (profile.logo_url) logoUrls.set(name, profile.logo_url);
  }
  for (const sector of Object.values(competitive.data?.competitive_intelligence ?? {})) {
    for (const ceo of sector.analysis.top_ceos_with_media_prominence?.ceos ?? []) {
      if (ceo.photo_url) peopleUrls.set(ceo.ceo, ceo.photo_url);
    }
  }
  for (const person of publications.data?.analysis.spokesperson_highlights ?? []) {
    if (person.photo_url) peopleUrls.set(person.spokesperson, person.photo_url);
  }
  const fetchAll = async (urls: Map<string, string>, max: number) => {
    const out = new Map<string, ExportImage>();
    await Promise.all([...urls].map(async ([name, url]) => {
      const img = await fetchImage(url, max);
      if (img) out.set(name, img);
    }));
    return out;
  };
  const [clientLogo, cover, logos, people, x, facebook, instagram, methodology, principles] = await Promise.all([
    fetchImage(pair.base_company.logo_url, 600),
    fetchImage(pair.base_company.cover_image_url, 1920),
    fetchAll(logoUrls, 240),
    fetchAll(peopleUrls, 300),
    fetchImage(asset('x.png'), 160),
    fetchImage(asset('facebook.png'), 160),
    fetchImage(asset('instagram.png'), 160),
    fetchImage(asset('methodology.jpg'), 900),
    fetchImage(asset('barcelona-principles.png'), 900),
  ]);

  const period = periodOf(executive, brandMedia, competitive, sentiment, mentions)
    ?? (filters.startDate && filters.endDate ? { start: filters.startDate, end: filters.endDate } : null);
  const periodLabel = period ? `${formatDate(period.start)} – ${formatDate(period.end)}` : filters.month ?? '';
  let periodTitle = periodLabel;
  if (filters.month && !filters.startDate) {
    const [year, month] = filters.month.split('-').map(Number);
    periodTitle = `${MONTHS[month - 1]} ${year}`;
  }

  return {
    pair, filters, periodLabel, periodTitle, generatedAt: new Date(),
    executive, sentiment, brandMedia, thematic, publications, social, competitive, swot, insights, landscape, mentions,
    images: {
      clientLogo, cover, logos, people, platforms: { x, facebook, instagram }, methodology, principles,
    },
  };
}

/** File name for downloads and e-mail attachments. */
export function reportFileName(data: ReportData, ext: 'pptx' | 'pdf'): string {
  const company = data.pair.base_company.company_name.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
  const period = data.filters.startDate && data.filters.endDate ? `${data.filters.startDate}_${data.filters.endDate}` : data.filters.month ?? 'report';
  return `P+-Media-Performance-Audit_${company}_${period}.${ext}`;
}
