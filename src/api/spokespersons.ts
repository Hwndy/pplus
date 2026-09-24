import { api } from '@/lib/api-client';
import type { Paginated, Spokesperson } from '@/types/api';

export interface SpokespersonInput {
  name: string;
  title?: string | null;
  company_id?: number | null;
}

export const spokespersonsApi = {
  list: (params: { page?: number; limit?: number; search?: string; company_id?: number } = {}) =>
    api.get<Paginated<Spokesperson>>('/spokespersons', params),
  create: (input: SpokespersonInput) => api.post<Spokesperson>('/spokespersons', input),
  update: (id: number, input: Partial<SpokespersonInput>) => api.put<Spokesperson>(`/spokespersons/${id}`, input),
  remove: (id: number) => api.delete<Record<string, never>>(`/spokespersons/${id}`),
  uploadPhoto: (id: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.upload<Spokesperson>(`/spokespersons/${id}/photo`, form);
  },
  removePhoto: (id: number) => api.delete<Spokesperson>(`/spokespersons/${id}/photo`),
};
