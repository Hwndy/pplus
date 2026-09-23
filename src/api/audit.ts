import { api, download } from '@/lib/api-client';
import type { AuditLog, AuditStats, Pagination, Severity } from '@/types/api';

export interface AuditLogParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  resource_type?: string;
  severity?: Severity | '';
  date_from?: string;
  date_to?: string;
  sort_order?: 'ASC' | 'DESC';
}

function clean(params: object) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));
}

export const auditApi = {
  list: (params: AuditLogParams) =>
    api.get<{ data: AuditLog[]; pagination: Pagination & { hasNextPage: boolean; hasPrevPage: boolean } }>('/audit-logs', clean(params)),
  get: (id: string) => api.get<AuditLog>(`/audit-logs/${id}`),
  stats: (params: { date_from?: string; date_to?: string } = {}) => api.get<AuditStats>('/audit-logs/stats', clean(params)),
  export: (params: AuditLogParams, format: 'csv' | 'json') =>
    download('/audit-logs/export', clean({ ...params, format }), `audit-logs.${format}`),
};

export type ExportResource =
  | 'users' | 'companies' | 'publications' | 'editorials' | 'daily-mentions'
  | 'swot-analysis' | 'outcome-insights' | 'social-media-mentions' | 'industry-landscape-overview';

export const exportApi = {
  download: (resource: ExportResource, format: 'csv' | 'json', params: object = {}) =>
    download(`/export/${resource}`, clean({ ...params, format }), `${resource}.${format}`),
};
