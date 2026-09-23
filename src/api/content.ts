import { api, download } from '@/lib/api-client';
import type {
  DailyMention,
  Editorial,
  EditorialCollection,
  IndustryLandscapeOverview,
  OutcomeInsight,
  Paginated,
  Pagination,
  ReviewStatus,
  SocialMediaMention,
  SupervisorDashboard,
  SwotAnalysis,
} from '@/types/api';

/**
 * The six approval-based resources share one backend workflow
 * (create → pending → approved/rejected). This describes how each maps to
 * its endpoints and response keys.
 */
export interface ContentResourceDef {
  key: ContentKey;
  label: string;
  pluralLabel: string;
  basePath: string;
  minePath: string;
  supervisorListPath: string;
  statsKey: string;
  recentKey: string;
  listKey: string;
}

export type ContentKey = 'editorials' | 'dailyMentions' | 'swot' | 'socialMedia' | 'outcomeInsights' | 'industryLandscape';

export const CONTENT_RESOURCES: Record<ContentKey, ContentResourceDef> = {
  editorials: {
    key: 'editorials', label: 'Editorial', pluralLabel: 'Editorials', basePath: '/editorials',
    minePath: 'my-editorials', supervisorListPath: 'supervisor-mentions', statsKey: 'editorials', recentKey: 'recent_editorials', listKey: 'editorial',
  },
  dailyMentions: {
    key: 'dailyMentions', label: 'Daily mention', pluralLabel: 'Daily mentions', basePath: '/daily-mentions',
    minePath: 'my-mentions', supervisorListPath: 'supervisor-mentions', statsKey: 'mentions', recentKey: 'recent_mentions', listKey: 'data',
  },
  swot: {
    key: 'swot', label: 'SWOT analysis', pluralLabel: 'SWOT analyses', basePath: '/swot-analysis',
    minePath: 'my-analysis', supervisorListPath: 'supervisor-mentions', statsKey: 'analysis', recentKey: 'recent_analysis', listKey: 'data',
  },
  socialMedia: {
    key: 'socialMedia', label: 'Social media mention', pluralLabel: 'Social media mentions', basePath: '/social-media-mentions',
    minePath: 'my-social-media-mentions', supervisorListPath: 'supervisor-mentions', statsKey: 'mentions', recentKey: 'recent_mentions', listKey: 'data',
  },
  outcomeInsights: {
    key: 'outcomeInsights', label: 'Outcome insight', pluralLabel: 'Outcome insights', basePath: '/outcome-insights',
    minePath: 'my-insights', supervisorListPath: 'supervisor-mentions', statsKey: 'insights', recentKey: 'recent_insights', listKey: 'data',
  },
  industryLandscape: {
    key: 'industryLandscape', label: 'Industry landscape overview', pluralLabel: 'Industry landscape overviews', basePath: '/industry-landscape-overview',
    minePath: 'my-overview', supervisorListPath: 'supervisor-landscape-overview', statsKey: 'overviews', recentKey: 'recent_overviews', listKey: 'overviews',
  },
};

export interface ContentTypes {
  editorials: Editorial;
  dailyMentions: DailyMention;
  swot: SwotAnalysis;
  socialMedia: SocialMediaMention;
  outcomeInsights: OutcomeInsight;
  industryLandscape: IndustryLandscapeOverview;
}

/** Which list a user sees: everything (admin), their own work (analyst) or their team's (supervisor). */
export type ContentScope = 'all' | 'mine' | 'team';

export interface ContentListParams {
  page?: number;
  limit?: number;
  status?: ReviewStatus | '';
  date_from?: string;
  date_to?: string;
  company_id?: number;
  search?: string;
}

function emptyPagination(page = 1, limit = 10): Pagination {
  return { total: 0, page, limit, totalPages: 0 };
}

function normalisePagination(p: Partial<Pagination> | undefined, page: number, limit: number): Pagination {
  if (!p) return emptyPagination(page, limit);
  return {
    total: p.total ?? 0,
    page: p.page ?? p.currentPage ?? page,
    limit: p.limit ?? p.pageSize ?? limit,
    totalPages: p.totalPages ?? 0,
  };
}

function cleanParams(params: ContentListParams) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));
}

export async function listContent<K extends ContentKey>(
  key: K,
  scope: ContentScope,
  params: ContentListParams = {}
): Promise<Paginated<ContentTypes[K]>> {
  const def = CONTENT_RESOURCES[key];
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const path = scope === 'mine' ? `${def.basePath}/${def.minePath}`
    : scope === 'team' ? `${def.basePath}/${def.supervisorListPath}`
      : def.basePath;
  const res = await api.get<Record<string, unknown>>(path, cleanParams({ ...params, page, limit }));

  // The admin editorial list uses the EditorialCollection shape ({} when empty).
  if (key === 'editorials' && scope === 'all') {
    const col = res as unknown as Partial<EditorialCollection>;
    const meta = col.meta;
    return {
      data: (col.editorial ?? []) as ContentTypes[K][],
      pagination: meta
        ? { total: meta.total, page: meta.currentPage, limit: meta.pageSize, totalPages: meta.totalPage }
        : emptyPagination(page, limit),
    };
  }
  const listKey = scope === 'all' ? def.listKey : 'data';
  return {
    data: ((res[listKey] as ContentTypes[K][]) ?? []),
    pagination: normalisePagination(res.pagination as Partial<Pagination>, page, limit),
  };
}

export async function getContent<K extends ContentKey>(key: K, id: number): Promise<ContentTypes[K]> {
  return api.get<ContentTypes[K]>(`${CONTENT_RESOURCES[key].basePath}/${id}`);
}

export async function createContent<K extends ContentKey>(key: K, payload: object) {
  return api.post<unknown>(`${CONTENT_RESOURCES[key].basePath}/create`, payload);
}

export async function updateContent<K extends ContentKey>(key: K, id: number, payload: object) {
  return api.put<unknown>(`${CONTENT_RESOURCES[key].basePath}/update/${id}`, payload);
}

export async function deleteContent(key: ContentKey, id: number) {
  return api.put<unknown>(`${CONTENT_RESOURCES[key].basePath}/delete/${id}`);
}

export async function reviewContent(key: ContentKey, id: number, status: 'approved' | 'rejected', supervisorNote?: string) {
  return api.patch<unknown>(`${CONTENT_RESOURCES[key].basePath}/${id}/status`, {
    status,
    ...(supervisorNote ? { supervisor_note: supervisorNote } : {}),
  });
}

export async function getSupervisorDashboard<K extends ContentKey>(
  key: K,
  page = 1
): Promise<SupervisorDashboard<ContentTypes[K]>> {
  const def = CONTENT_RESOURCES[key];
  const res = await api.get<Record<string, unknown>>(`${def.basePath}/supervisor-dashboard`, { page, limit: 10 });
  const recent = (res[def.recentKey] ?? { data: [], pagination: emptyPagination(page) }) as { data: ContentTypes[K][]; pagination: Pagination };
  return {
    supervisor: res.supervisor as SupervisorDashboard<ContentTypes[K]>['supervisor'],
    analysts: (res.analysts as SupervisorDashboard<ContentTypes[K]>['analysts']) ?? [],
    stats: (res.stats as Record<string, number>) ?? {},
    recent: { data: recent.data ?? [], pagination: normalisePagination(recent.pagination, page, 10) },
  };
}

/** Uploads an editorial spreadsheet (xlsx/xls/csv). */
export async function uploadEditorialBatch(file: File) {
  const form = new FormData();
  form.append('file', file);
  return api.upload<{
    summary: { total_rows_processed: number; successful_imports: number; failed_imports: number; success_rate: string };
    errors?: { row: number; error: string }[];
    warnings?: { row: number; warnings: string[] }[];
  }>('/editorials/batch-upload', form);
}

/** Uploads a Word document of daily mentions (.doc/.docx) as a pending daily mention. */
export async function uploadDailyMentionDocument(file: File, extra: { company_id?: number; publication?: string; date?: string }) {
  const form = new FormData();
  form.append('file', file);
  Object.entries(extra).forEach(([k, v]) => { if (v !== undefined && v !== '') form.append(k, String(v)); });
  return api.upload<{ id: number; original_name: string }>('/daily-mentions/batch-upload', form);
}

/** Downloads the Word document attached to a daily mention (staff). */
export function downloadDailyMentionDocument(id: number) {
  return download(`/daily-mentions/${id}/document`, {}, `daily-mention-${id}.docx`);
}
