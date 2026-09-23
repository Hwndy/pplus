import { api } from '@/lib/api-client';
import type { Company, Paginated, Subsidiary } from '@/types/api';

export type CompanyInput = Partial<Omit<Company, 'id' | 'subsidiaries' | 'createdAt'>> & {
  company_name: string;
  subsidiaries?: { subsidiary_id: number }[];
};

export interface CompanyListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const companiesApi = {
  list: (params: CompanyListParams = {}) => api.get<Paginated<Company>>('/companies', params),
  /** Every active company (for dropdowns). */
  all: async () => (await api.get<Paginated<Company>>('/companies', { limit: 1000 })).data,
  get: async (id: number) => (await api.get<{ company: Company }>(`/companies/${id}`)).company,
  create: (input: CompanyInput) => api.post<Company>('/companies/create', input),
  update: (id: number, input: Partial<CompanyInput>) => api.put<Record<string, never>>(`/companies/update/${id}`, input),
  remove: (id: number) => api.put<Record<string, never>>(`/companies/delete/${id}`),
  removeSubsidiary: (companyId: number, subsidiaryId: number) =>
    api.put<Record<string, never>>(`/companies/delete/${companyId}/subsidiary/${subsidiaryId}`),
  subsidiaries: () => api.get<Subsidiary[]>('/subsidiaries'),
};
