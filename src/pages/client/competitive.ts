/** Typed selectors shared by the competitive intelligence pages (one backend report, two views). */
import type { CompetitiveIntelligenceReport, CompetitiveSector } from '@/types/reports';
import { toNumber } from './reportUtils';

/** Sectors (sub-industries) with the client's own sector first, then alphabetical. */
export function sectorsOf(report: CompetitiveIntelligenceReport): CompetitiveSector[] {
  const own = report.base_company.sub_industry?.trim();
  return Object.values(report.competitive_intelligence).sort((a, b) => {
    if (a.sub_industry === own) return -1;
    if (b.sub_industry === own) return 1;
    return a.sub_industry.localeCompare(b.sub_industry);
  });
}

/** Companies in a sector, the client's brand first. */
export function companiesOf(sector: CompetitiveSector, baseName: string): string[] {
  const names = Array.from(new Set(sector.companies_in_category));
  return names.sort((a, b) => {
    if (a === baseName) return -1;
    if (b === baseName) return 1;
    return a.localeCompare(b);
  });
}

/** Competitive metrics tracked for the client (media prominence activities). */
export function metricsOf(report: CompetitiveIntelligenceReport): string[] {
  return report.monitoring_summary.competitive_metrics ?? report.monitoring_summary.media_prominences;
}

/** True for the client's own companies (base company and monitored subsidiaries). */
export function isBrand(report: CompetitiveIntelligenceReport, company: string): boolean {
  const profile = report.company_profiles?.[company];
  if (profile) return profile.is_brand;
  return (report.brand_companies ?? [report.base_company.name]).includes(company);
}

export function logoOf(report: CompetitiveIntelligenceReport, company: string): string | null {
  return report.company_profiles?.[company]?.logo_url ?? null;
}

export interface SentimentRow {
  company: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
}

/** Media sentiment index per company, in the order of the sector's media share. */
export function sentimentRows(sector: CompetitiveSector, companies: string[]): SentimentRow[] {
  const index = sector.analysis.media_sentiment_index;
  return companies
    .filter((company) => index[company] && index[company].total_mentions > 0)
    .map((company) => {
      const s = index[company];
      return {
        company,
        positive: s.positive.frequency,
        neutral: s.neutral.frequency,
        negative: s.negative.frequency,
        total: s.total_mentions,
        positivePct: toNumber(s.positive.percentage),
        neutralPct: toNumber(s.neutral.percentage),
        negativePct: toNumber(s.negative.percentage),
      };
    });
}
