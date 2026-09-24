import { api } from '@/lib/api-client';
import type { DataParameter, Paginated, ParameterCategory, Publication, SentimentKeywordIndicator } from '@/types/api';

export interface PublicationInput {
  name: string;
  publication_type: string;
  website?: string;
  description?: string;
}

interface PublicationCollection {
  publication?: Publication[];
  meta?: { total: number; currentPage: number; totalPage: number; pageSize: number };
}

export const publicationsApi = {
  list: async (params: { page?: number; limit?: number; search?: string } = {}): Promise<Paginated<Publication>> => {
    const res = await api.get<PublicationCollection>('/publications', params);
    const meta = res.meta ?? { total: 0, currentPage: params.page ?? 1, totalPage: 0, pageSize: 10 };
    return {
      data: res.publication ?? [],
      pagination: { total: meta.total, page: meta.currentPage, limit: meta.pageSize, totalPages: meta.totalPage },
    };
  },
  /** Every active publication, sorted by name (for dropdowns). */
  all: async () => (await publicationsApi.list({ limit: 1000 })).data.sort((a, b) => a.name.localeCompare(b.name)),
  create: (input: PublicationInput) => api.post<Record<string, never>>('/publications/create', input),
  update: (id: number, input: PublicationInput) => api.put<Record<string, never>>(`/publications/update/${id}`, input),
  remove: (id: number) => api.put<Record<string, never>>(`/publications/delete/${id}`),
};

export interface SentimentIndicatorInput {
  keyword_indicator: string;
  sentiment_score: number;
  classification: string;
}

export const sentimentIndicatorsApi = {
  all: async () => (await api.get<Paginated<SentimentKeywordIndicator>>('/sentiment-keyword-indicators', { limit: 1000 })).data,
  create: (input: SentimentIndicatorInput) => api.post<SentimentKeywordIndicator>('/sentiment-keyword-indicators/create', input),
  update: (id: number, input: Partial<SentimentIndicatorInput>) =>
    api.put<SentimentKeywordIndicator>(`/sentiment-keyword-indicators/update/${id}`, input),
  remove: (id: number) => api.put<Record<string, never>>(`/sentiment-keyword-indicators/delete/${id}`),
};

/**
 * Dropdown option lists (industries, placements, reporters, …) are managed as
 * data-parameter categories and looked up by category name.
 */
/** Display names for categories whose stored name differs from what users see. */
const CATEGORY_LABELS: Record<string, string> = {
  Media_Prominence: 'Competitive Metrics',
  SpokesPerson: 'Spokesperson',
  CEO_Thought_Leadership: 'CEO Thought Leadership',
};

/** Human-readable name of a data-parameter category ("Media_Prominence" → "Competitive Metrics"). */
export function categoryLabel(name: string | null | undefined): string {
  if (!name) return '';
  return CATEGORY_LABELS[name] ?? name.replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();
}

export const PARAMETER_CATEGORIES = {
  industry: 'Industry',
  subIndustry: 'Sub_Industry',
  mediaProminence: 'Media_Prominence',
  spokesperson: 'SpokesPerson',
  placement: 'Placement',
  onlineChannel: 'Online_Channel',
  publications: 'Publications',
  ceoThoughtLeadership: 'CEO_Thought_Leadership',
  language: 'Language',
  country: 'Country',
  activities: 'Activities',
  pageSize: 'Page_Size',
  mediaType: 'Media_Type',
  reporter: 'Reporter',
  insights: 'Insights',
  industryLandscapeSector: 'Industry_Landscape_Sector',
  publicationType: 'Publication_Type',
  ceo: 'CEO',
  phonePrefix: 'Prefix',
} as const;

export const parametersApi = {
  /** The single data parameter with all its categories and values. */
  root: async (): Promise<DataParameter | null> =>
    (await api.get<Paginated<DataParameter>>('/data-parameters', { limit: 1 })).data[0] ?? null,
  createRoot: () => api.post<DataParameter>('/data-parameters/create', {}),
  /** Values of one category, sorted alphabetically. */
  values: async (categoryName: string): Promise<string[]> => {
    const parameters = await api.get<DataParameter[]>(`/data-parameters/category/${encodeURIComponent(categoryName)}`);
    const category = parameters[0]?.categories?.find((c) => c.name === categoryName);
    return (category?.values ?? []).map((v) => v.value);
  },
  createCategory: (input: { name: string; description?: string }) =>
    api.post<ParameterCategory>('/data-parameters-category/create', input),
  updateCategory: (id: number, input: { name?: string; description?: string }) =>
    api.put<ParameterCategory>(`/data-parameters-category/update/${id}`, input),
  removeCategory: (id: number) => api.put<Record<string, never>>(`/data-parameters-category/delete/${id}`),
  createValues: (categoryId: number, values: string[]) =>
    api.post<{ data: unknown[] }>('/data-parameters-category-value/create', { dataParametersCategoryId: categoryId, value: values }),
  updateValue: (id: number, value: string) => api.put<unknown>(`/data-parameters-category-value/update/${id}`, { value }),
  removeValue: (id: number) => api.put<Record<string, never>>(`/data-parameters-category-value/delete/${id}`),
};
