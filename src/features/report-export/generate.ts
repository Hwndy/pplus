import type { ReportFilters } from '@/api/reports';
import type { MonitoringPair } from '@/types/api';
import { loadReportData, reportFileName } from './data';
import { buildDeck } from './slides';

export type ExportFormat = 'pptx' | 'pdf';

export interface GeneratedReport {
  blob: Blob;
  fileName: string;
  /** "October 2025" or the date range, for e-mail subjects. */
  periodTitle: string;
}

/** Loads every report for the pair and period and renders the audit report deck. */
export async function generateReport(pair: MonitoringPair, filters: ReportFilters, format: ExportFormat): Promise<GeneratedReport> {
  const data = await loadReportData(pair, filters);
  const deck = await buildDeck(data);
  const blob = format === 'pptx'
    ? await (await import('./pptx')).renderPptx(deck)
    : await (await import('./pdf')).renderPdf(deck);
  return { blob, fileName: reportFileName(data, format), periodTitle: data.periodTitle };
}
