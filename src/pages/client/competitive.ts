/** Typed selectors shared by the competitive intelligence pages (one backend report, four views). */
import { CHART_COLORS } from '@/lib/charts';
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

/** Companies in a sector, the client's brand first, so colours stay stable across views. */
export function companiesOf(sector: CompetitiveSector, baseName: string): string[] {
  const names = Array.from(new Set(sector.companies_in_category));
  return names.sort((a, b) => {
    if (a === baseName) return -1;
    if (b === baseName) return 1;
    return a.localeCompare(b);
  });
}

export function companyLabel(company: string, baseName: string): string {
  return company === baseName ? `${company} (your brand)` : company;
}

export function companyColors(companies: string[]): Record<string, string> {
  return Object.fromEntries(companies.map((c, i) => [c, CHART_COLORS[i % CHART_COLORS.length]]));
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
  /** (positive − negative) ÷ total, from −1 to +1. */
  score: number;
}

export function sentimentRows(sector: CompetitiveSector, companies: string[]): SentimentRow[] {
  const index = sector.analysis.media_sentiment_index;
  return companies
    .filter((company) => index[company])
    .map((company) => {
      const s = index[company];
      const total = s.total_mentions;
      return {
        company,
        positive: s.positive.frequency,
        neutral: s.neutral.frequency,
        negative: s.negative.frequency,
        total,
        positivePct: toNumber(s.positive.percentage),
        neutralPct: toNumber(s.neutral.percentage),
        negativePct: toNumber(s.negative.percentage),
        score: total > 0 ? (s.positive.frequency - s.negative.frequency) / total : 0,
      };
    });
}

/** One row per media prominence activity with a column per company (for grouped bar charts). */
export function prominenceRows(sector: CompetitiveSector, companies: string[]): Record<string, string | number>[] {
  return Object.entries(sector.analysis.media_prominence_analysis).map(([activity, entry]) => {
    const row: Record<string, string | number> = { activity };
    for (const company of companies) row[company] = 0;
    for (const c of entry.companies) row[c.company] = c.frequency;
    return row;
  });
}
