import { api } from '@/lib/api-client';
import type { Paginated, Role, RoleName, Supervisor, User, UserStatus } from '@/types/api';

export interface SubsidiaryMonitoringInput {
  id?: number;
  subsidiary_id: number;
  competitor_subsidiary_ids: number[];
  media_prominence: string[];
}

export interface CompanyMonitoringInput {
  id?: number;
  company_id: number;
  competitor_company_ids: number[];
  media_prominence: string[];
  /** Monitoring period ("From" / "To", YYYY-MM-DD). */
  monitoring_start_date: string;
  monitoring_date: string;
  subsidiary_monitorings: SubsidiaryMonitoringInput[];
}

export interface UserInput {
  username: string;
  email: string;
  country_code: string;
  mobile_number: string;
  role: RoleName;
  status?: UserStatus;
  password?: string;
  supervisor_id?: string | null;
  company_monitorings?: CompanyMonitoringInput[];
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: number;
  status?: UserStatus;
}

export const usersApi = {
  list: (params: UserListParams) => api.get<Paginated<User>>('/users', params),
  get: (id: string) => api.get<User>(`/users/${id}`),
  create: (input: UserInput) => api.post<{ user: User }>('/auth/create-user', input),
  update: (id: string, input: Partial<UserInput> & { current_password?: string }) =>
    api.put<{ user: User }>(`/users/update/${id}`, input),
  remove: (id: string) => api.put<Record<string, never>>(`/users/delete/${id}`),
  supervisors: () => api.get<Supervisor[]>('/users/supervisors'),
  roles: async () => (await api.get<{ data: Role[] }>('/roles', { limit: 100 })).data ?? [],
};
