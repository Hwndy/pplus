import { download, request } from '@/lib/api-client';
import type { MonitoringPair } from '@/types/api';

export type ReportName =
  | 'executive-summary'
  | 'daily-mentions'
  | 'swot-analysis'
  | 'outcome-insights'
  | 'industry-landscape-overview'
  | 'brand-media-sentiment-index'
  | 'brand-media-analysis'
  | 'top-thematic-distribution-breakdown'
  | 'publication-reporter-spokesperson-analysis'
  | 'social-stats-online-coverage'
  | 'competitive-intelligence';

export interface ReportFilters {
  pairId?: number;
  /** YYYY-MM; ignored when a start/end date range is given. */
  month?: string;
  startDate?: string;
  endDate?: string;
}

/** Result of a report call: `data` is null when the period has no coverage. */
export interface ReportResult<T> {
  data: T | null;
  message: string;
}

export async function fetchReport<T>(name: ReportName, filters: ReportFilters): Promise<ReportResult<T>> {
  const params: Record<string, string | number> = {};
  if (filters.pairId) params.pair_id = filters.pairId;
  if (filters.startDate && filters.endDate) {
    params.startDate = filters.startDate;
    params.endDate = filters.endDate;
  } else if (filters.month) {
    params.month = filters.month;
  }
  // The backend answers 200 with success:false when there is simply no data for the period.
  const res = await request<T>({ method: 'GET', url: `/report/${name}`, params });
  return {
    data: res.success ? res.data : null,
    message: typeof res.message === 'string' ? res.message : '',
  };
}

export async function fetchMonitoringPairs(): Promise<MonitoringPair[]> {
  const res = await request<{ pairs: MonitoringPair[] }>({ method: 'GET', url: '/report/monitoring-pairs' });
  return res.success ? res.data?.pairs ?? [] : [];
}

/** Downloads the document attached to an approved daily mention in the client's pair. */
export function downloadMentionDocument(id: number, pairId: number) {
  return download(`/report/daily-mentions/${id}/document`, { pair_id: pairId }, `daily-mention-${id}.docx`);
}
