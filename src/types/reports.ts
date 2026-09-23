/**
 * Response shapes of the client report endpoints (Backend: src/controller/ReportController.js).
 */
import type { ReportPeriod } from './api';

/** `week` is "Week 1"…"Week 4" (fixed P+ weeks), prefixed with the month when a range spans months. */
export interface WeeklyPoint { week: string; start_date: string; end_date: string; count: number; percentage: string }

export interface CompetitiveShare {
  total_mentions: number;
  shares: { company: string; frequency: number; percentage: string | number }[];
}

export interface ExecutiveSummaryReport {
  pair_id: number;
  company: string;
  company_id: number;
  industry: string | null;
  sub_industry: string | null;
  period: ReportPeriod;
  summary: {
    totalMediaExposure: number;
    brandExposureInLocalMedia: number;
    brandExposureInInternationalMedia: number;
    positiveMediaExposure: number;
    negativeMediaExposure: number;
    neutralMediaExposure: number;
    brandMediaReputationScore: number;
    language: { english: number; otherLanguages: number; breakdown: Record<string, number> };
    mediaVehicle: { online: number; print: number };
    weeklyTrendOnBrandMediaExposure: {
      print: { total: number; weekly_breakdown: WeeklyPoint[] };
      online: { total: number; weekly_breakdown: WeeklyPoint[] };
    };
    competitiveMediaShare: CompetitiveShare;
  };
}

/** Percentages are computed with `toFixed(2)` on the backend (a string), or `0` when there is nothing to divide. */
export type ReportPercent = string | number;

export type ReportReviewStatus = 'pending' | 'approved' | 'rejected';

/** Header fields shared by most single-company reports. */
export interface CompanyReportHeader {
  pair_id: number;
  company: string;
  company_id: number;
  industry: string | null;
  sub_industry: string | null;
  period: ReportPeriod;
}

export interface ReportBaseCompany {
  id: number;
  name: string;
  industry: string | null;
  sub_industry: string | null;
}

// ---------------------------------------------------------------- Daily mentions

export type ReportMentionSentiment = 'positive' | 'negative' | 'neutral';

export interface ReportMentionItem {
  headline?: string | null;
  content?: string | null;
  reporter?: string | null;
  source?: string | null;
  sentiment?: ReportMentionSentiment | null;
  page?: string | number | null;
  publication_date?: string | null;
  urls?: string[] | null;
}

export const REPORT_MENTION_CATEGORIES = ['industry', 'competitors', 'subsidiaries', 'passive', 'advert'] as const;
export type ReportMentionCategory = (typeof REPORT_MENTION_CATEGORIES)[number];

export interface ReportDailyMention {
  id: number;
  company: { id: number; company_name: string; industry: string | null; sub_industry: string | null };
  publication: string | null;
  date: string | null;
  status: ReportReviewStatus;
  categories: Record<ReportMentionCategory, ReportMentionItem[]>;
  file_info: {
    filename: string;
    original_name: string | null;
    file_size: number | string | null;
    mime_type: string | null;
    file_type: string | null;
  } | null;
}

export interface DailyMentionsReport {
  pair_id: number;
  base_company: ReportBaseCompany;
  monitored_companies: { base: string; competitors: number[]; total: number };
  period: ReportPeriod;
  summary: {
    total_mentions: number;
    by_status: Record<ReportReviewStatus, number>;
    by_company: Record<string, number>;
  };
  daily_mentions: ReportDailyMention[];
}

// ---------------------------------------------------------------- SWOT

/** Items are written as `{ analysis }`; older rows may hold plain strings. */
export type ReportSwotItem = { analysis: string } | string;

export interface SwotReport extends CompanyReportHeader {
  total_analyses: number;
  analyses: {
    id: number;
    date: string;
    status: ReportReviewStatus;
    strengths: ReportSwotItem[] | null;
    weaknesses: ReportSwotItem[] | null;
    opportunities: ReportSwotItem[] | null;
    threats: ReportSwotItem[] | null;
    analyst_note: string | null;
  }[];
}

// ---------------------------------------------------------------- Outcome & insights

/** The API writes `{ category, insight }`; seeded rows carry the text in `analysis`. */
export interface ReportInsightItem {
  category: string;
  insight?: string | null;
  analysis?: string | null;
}

export interface OutcomeInsightsReport extends CompanyReportHeader {
  filter: { category: string } | null;
  total_records: number;
  insights: {
    id: number;
    date: string;
    status: ReportReviewStatus;
    insights: ReportInsightItem[];
    total_insights: number;
    analyst_note: string | null;
  }[];
}

// ---------------------------------------------------------------- Industry landscape

export interface IndustryLandscapeReport extends CompanyReportHeader {
  filter: { sector: string } | null;
  total_overviews: number;
  overviews: {
    id: number;
    date: string;
    sector: string;
    highlights: string[] | null;
    total_highlights: number;
    status: ReportReviewStatus;
    analyst_note: string | null;
  }[];
}

// ---------------------------------------------------------------- Brand media sentiment index

/** Keys of the seven sentiment keyword classifications, strongest positive first. */
export const SENTIMENT_CLASSIFICATIONS = [
  'strongly_positive',
  'positive',
  'moderately_positive',
  'neutral',
  'moderately_negative',
  'negative',
  'strongly_negative',
] as const;
export type SentimentClassification = (typeof SENTIMENT_CLASSIFICATIONS)[number];

export interface BrandSentimentReport extends CompanyReportHeader {
  sentiment_breakdown: Record<SentimentClassification, { count: number; percentage: number }>;
  totals: { total_categorized: number; total_uncategorized: number };
  /** Up to five headlines per classification, or a sentence stating there were none. */
  key_brand_reputational_drivers: Record<SentimentClassification, string[] | string>;
}

// ---------------------------------------------------------------- Brand media analysis

export interface WeeklyVolumeTrend {
  print: { total: number; weekly_breakdown: WeeklyPoint[] };
  online: { total: number; weekly_breakdown: WeeklyPoint[] };
}

export interface BrandMediaAnalysisReport extends CompanyReportHeader {
  analysis: {
    news_mention: { total: number; breakdown: { headline: number; advertorial: number } };
    photo_mention: { total: number };
    video_mention: { total: number };
    potential_reach: {
      print: { total_reach: number; unique_sources: number; sources: string[] };
      online: { total_reach: number; unique_sources: number; sources: string[] };
      combined_reach: number;
    };
    thematic_distribution: {
      total_activities: number;
      top_10: { activity: string; count: number; percentage: string }[];
    };
    brand_subsidiary_exposure: {
      total_brand_mentions: number;
      unique_brands: number;
      top_10: { brand: string; count: number; percentage: ReportPercent }[];
      /** Present when there is nothing to show (no subsidiaries configured, no coverage…). */
      note?: string;
    };
    brand_message_placement: {
      total_placements: number;
      placements: { placement: string; count: number; percentage: string }[];
    };
    weekly_volume_trend: WeeklyVolumeTrend;
    monthly_volume_trend: {
      total_months: number;
      print_total: number;
      online_total: number;
      monthly_breakdown: {
        month: string;
        print: { count: number; percentage: ReportPercent };
        online: { count: number; percentage: ReportPercent };
      }[];
    };
  };
}

// ---------------------------------------------------------------- Thematic distribution

export interface ThematicDistributionReport extends CompanyReportHeader {
  total_editorials: number;
  unique_activities: number;
  activities: {
    activity: string;
    frequency: number;
    percentage: string;
    sample_editorials: { title: string | null }[];
  }[];
}

// ---------------------------------------------------------------- Publications, reporters, spokespersons

export interface PublicationVolume {
  total_count: number;
  unique_sources: number;
  sources: { source: string; count: number; percentage: string }[];
}

export interface ReporterVolume {
  total_count: number;
  unique_reporters: number;
  reporters: { reporter: string; count: number; percentage: string }[];
}

export interface PublicationsAnalysisReport extends CompanyReportHeader {
  analysis: {
    print_publications_volume: PublicationVolume;
    online_publications_volume: PublicationVolume;
    print_reporters: ReporterVolume;
    online_reporters: ReporterVolume;
    top_3_reporters_overall: {
      total_count: number;
      reporters: { reporter: string; count: number; percentage: string; media_types: (string | null)[] }[];
    };
    spokesperson_volume: {
      total_count: number;
      unique_spokespersons: number;
      spokespersons: { spokesperson: string; count: number; percentage: ReportPercent }[];
    };
  };
}

// ---------------------------------------------------------------- Social stats & online coverage

export type SocialMetricRecord = Record<string, number | string | null>;

export interface SocialPlatformRecords {
  records_count: number;
  records: { date: string; metrics: SocialMetricRecord[] }[];
}

export interface XOrInstagramMetrics extends SocialPlatformRecords {
  total_posts: number;
  total_followers: number;
  total_following: number;
  average_posts: ReportPercent;
  average_followers: ReportPercent;
  average_following: ReportPercent;
}

export interface FacebookMetrics extends SocialPlatformRecords {
  total_page_likes: number;
  total_monthly_posts: number;
  total_average_likes: number;
  total_average_comments: number;
  average_page_likes: ReportPercent;
  average_monthly_posts: ReportPercent;
  average_likes_per_post: ReportPercent;
  average_comments_per_post: ReportPercent;
}

export interface SocialCoverageReport extends CompanyReportHeader {
  location: { state: string | null; country: string | null };
  social_media_metrics: {
    x: XOrInstagramMetrics;
    facebook: FacebookMetrics;
    instagram: XOrInstagramMetrics;
  };
  online_country_coverage: {
    total_coverage_records: number;
    unique_countries: number;
    countries: { country: string; count: number; percentage: ReportPercent }[];
  };
  summary: {
    total_records: number;
    platforms_active: ('X' | 'Facebook' | 'Instagram')[];
    countries_covered: number;
  };
}

// ---------------------------------------------------------------- Competitive intelligence

export interface CompanyFrequency { company: string; frequency: number; percentage: ReportPercent }

export interface CompanySentimentIndex {
  positive: { frequency: number; percentage: ReportPercent };
  negative: { frequency: number; percentage: ReportPercent };
  neutral: { frequency: number; percentage: ReportPercent };
  total_mentions: number;
}

export interface CompetitiveSector {
  sub_industry: string;
  companies_in_category: string[];
  total_editorials: number;
  analysis: {
    competitive_media_share: { total_mentions: number; shares: CompanyFrequency[] };
    /** Keyed by media prominence activity (configured on the monitoring pair). */
    media_prominence_analysis: Record<string, { total_mentions: number; companies: CompanyFrequency[] }>;
    top_ceos_with_media_prominence: {
      total_ceo_mentions: number;
      ceos: { ceo: string; frequency: number; percentage: ReportPercent }[];
    };
    /** Keyed by company name. */
    media_sentiment_index: Record<string, CompanySentimentIndex>;
    /** Keyed by company name; the backend picks up to five titles at random, seeded by pair and period so the sample is stable. */
    competitive_pr_drivers: Record<string, { total_titles_available: number; sample_titles: string[] }>;
  };
}

export interface CompetitiveIntelligenceReport {
  pair_id: number;
  base_company: ReportBaseCompany;
  period: ReportPeriod;
  monitoring_summary: {
    total_companies_monitored: number;
    base_company_id: number;
    competitor_count: number;
    media_prominences: string[];
    sub_industries_analyzed: number;
  };
  /** Keyed by sub-industry ("Uncategorized" when a company has none). */
  competitive_intelligence: Record<string, CompetitiveSector>;
}
