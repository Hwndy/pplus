/**
 * Format-neutral description of a downloadable report. The pack is built once
 * from the API data and then rendered to PowerPoint or PDF.
 */

export interface KpiItem { label: string; value: string; hint?: string }

export type Block =
  | { kind: 'kpis'; items: KpiItem[] }
  | {
    kind: 'bar';
    title: string;
    categories: string[];
    series: { name: string; values: number[] }[];
    /** Horizontal bars suit long labels (rankings); vertical bars suit time series. */
    horizontal?: boolean;
    /** One colour per category instead of one per series. */
    colorByCategory?: boolean;
  }
  | { kind: 'pie'; title: string; categories: string[]; values: number[]; colors?: string[] }
  | { kind: 'table'; title: string; columns: string[]; rows: string[][] }
  | { kind: 'bullets'; title: string; items: string[] }
  | { kind: 'note'; text: string };

export interface Section {
  title: string;
  /** Accent colour (#rrggbb) of the matching dashboard. */
  accent: string;
  subtitle?: string;
  blocks: Block[];
}

export interface ReportPack {
  company: string;
  competitors: string[];
  periodLabel: string;
  /** Short period used in file names, e.g. "2025-10" or "2025-10-01_2025-10-31". */
  periodSlug: string;
  generatedAt: Date;
  sections: Section[];
  logo?: string;
}
