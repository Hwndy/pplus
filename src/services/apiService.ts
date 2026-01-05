import { get, post, put, del } from '@/utils/api';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  username: string;
  country_code: string;
  mobile_number: string;
  // joinDate: string;
  role: string;
  avatar?: string;
  supervisor_id?: string;
  // expiration_date?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubsidiaryCompany {
  id: number;
  company_name: string;
}

export interface CompanyMonitoring {
  company_id: string;
  competitor_company_ids: string[];
  media_prominence: string[];
  monitoring_date: string | null;
  subsidiary_monitorings?: SubsidiaryMonitoring[];
}

export interface SubsidiaryMonitoring {
  subsidiary_id: string;
  competitor_subsidiary_ids: string[];
  media_prominence: string[];
}

export interface Company {
  id: string;
  company_name: string;
  industry: string;
  sub_industry: string;
  office_address: string;
  office_state: string;
  office_country: string;
  contact_person: string;
  ceo: string;
  email: string;
  additional_info: string;
  phone_no: string;
  website: string;
  facebook_link: string;
  instagram_link: string;
  twitter_link: string;
  linkedin_link: string;
  youtube_link: string;
}

/** Publication interface – required for PublicationsResponse */
export interface Publication {
  name: ReactNode;
  id: string;
  title: string;
  source: string;
  date: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

interface PublicationsResponse {
  publication: Publication[];
  meta: {
    total: number;
    currentPage: number;
    totalPage: number;
    pageSize: number;
  };
  links?: {
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
}

export interface Editorial {
  id: string;
  title: string;
  content: string;
  status: string;
  publicationId: string;
  authorId: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SwotAnalysis {
  id: string;
  companyId: string;
  title: string;
  date: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  analystNote?: string;
  supervisorNote?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyMention {
  id: string;
  companyId: string;
  publicationId: string;
  date: string;
  headline: string;
  content: string;
  sentiment: string;
  sentimentScore: number;
  reach: string;
  engagement: number;
  mediaType: string;
  url?: string;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialMediaEngagement {
  likes: number;
  shares: number;
  comments: number;
  reach: number;
  impressions: number;
  platform: string;
}

export interface MediaCoverage {
  articles: number;
  mentions: number;
  sentiment: string;
  reach: number;
  impressions: number;
  channels: string[];
}

export interface CompetitorComparison {
  competitors: string[];
  metrics: Record<string, number>;
  analysis: string;
  benchmarks: Record<string, number>;
}

export interface KeyMetrics {
  engagement: number;
  reach: number;
  sentiment: number;
  shareOfVoice: number;
  impressions: number;
  mentions: number;
}

export interface OutcomeInsight {
  id: string;
  companyId: string;
  title: string;
  date: string;
  socialMediaEngagement: SocialMediaEngagement;
  mediaCoverage: MediaCoverage;
  competitorComparison: CompetitorComparison;
  recommendations: string[];
  insights: string;
  keyMetrics: KeyMetrics;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AudienceDemographics {
  ageGroups: Record<string, number>;
  gender: Record<string, number>;
  interests: string[];
  location: Record<string, number>;
  income: Record<string, number>;
  education: Record<string, number>;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  contactPerson?: string;
}

export interface SocialHandles {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface AuditLogDetails {
  previousValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  description?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: AuditLogDetails;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

interface AuditLogFilters {
  page?: number;
  limit?: number;
  action?: string | string[];
  resource_type?: string | string[];
  user_id?: string | string[];
  severity?: string | string[];
  date_from?: Date | string;
  date_to?: Date | string;
  search?: string;
  ip_address?: string;
}


export interface FileUpload {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  title?: string;
  description?: string;
  uploadedBy: string;
  accessLevel: string;
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Query / Response helpers
// ──────────────────────────────────────────────────────────────────────────────
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// API Service
// ──────────────────────────────────────────────────────────────────────────────
class ApiService {
  private token: string | null = null;
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://pplus-ec37.onrender.com/api';

  constructor() {
    console.log('ApiService initialized with baseUrl:', this.baseUrl);
    this.testBackendConnectivity();

    const stored = localStorage.getItem('token');
    if (stored && this.isTokenValid(stored)) this.token = stored;
    else this.clearToken();
  }

  // --------------------------------------------------------------------------
  // Connectivity test
  // --------------------------------------------------------------------------
  private async testBackendConnectivity() {
    try {
      console.log('Testing backend connectivity...');
      const res = await fetch(`${this.baseUrl}/users?limit=1`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      res.ok ? console.log('Backend reachable') : console.warn('Backend status:', res.status);
    } catch (e) {
      console.error('Backend connectivity test failed:', e);
    }
  }

  // --------------------------------------------------------------------------
  // Token helpers
  // --------------------------------------------------------------------------
  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp && payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private getAuthHeaders(includeContentType = true) {
    const h: Record<string, string> = {};
    if (this.token) h.Authorization = `Bearer ${this.token}`;
    if (includeContentType) h['Content-Type'] = 'application/json';
    return h;
  }

  setToken(t: string) {
    this.token = t;
    localStorage.setItem('token', t);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // --------------------------------------------------------------------------
  // Query builder
  // --------------------------------------------------------------------------
  private buildQuery(p?: QueryParams): string {
    if (!p) return '';
    const sp = new URLSearchParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v != null) sp.append(k, String(v));
    });
    const q = sp.toString();
    return q ? `?${q}` : '';
  }

  // --------------------------------------------------------------------------
  // Generic request (still uses axios helpers under the hood)
  // --------------------------------------------------------------------------
  private async request<T>(
    url: string,
    opts: RequestInit & { useAxios?: boolean } = {}
  ): Promise<ApiResponse<T>> {
    const { useAxios = true, ...fetchOpts } = opts;
    const headers = { ...this.getAuthHeaders(opts.method !== 'GET'), ...fetchOpts.headers };

    if (useAxios) {
      const fn = { GET: get, POST: post, PUT: put, DELETE: del }[opts.method || 'GET'];
      const axiosRes = await fn(url, fetchOpts.body, { headers });
      return this.extract(axiosRes);
    }

    const res = await fetch(url, { ...fetchOpts, headers });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Request failed');
    return json as ApiResponse<T>;
  }

  private extract<T>(axiosRes: { data: unknown }): ApiResponse<T> {
    return axiosRes.data as ApiResponse<T>;
  }

  // --------------------------------------------------------------------------
  // AUTH
  // --------------------------------------------------------------------------
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    const url = `${this.baseUrl}/auth/login`;
    console.log('Login →', url);
    const resp = await this.request<{ token: string; user: User }>(url, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (resp.success && resp.data?.token) {
      this.setToken(resp.data.token);
      localStorage.setItem('user', JSON.stringify(resp.data.user));
    }
    return resp;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>(`${this.baseUrl}/auth/me`, { method: 'GET' });
  }

  async getCompaniesForUser(): Promise<ApiResponse<{ data: { id: number; company_name: string }[]; pagination: any }>> {
    return this.request(`${this.baseUrl}/companies?limit=1000`, { method: 'GET' });
  }

  async getSubsidiaries(): Promise<ApiResponse<{ id: number; subsidiary_company_id: number; subsidiaryCompany: SubsidiaryCompany; company_name: string }[]>> {
    return this.request(`${this.baseUrl}/subsidiaries?limit=1000`, { method: 'GET' });
  }

  async getMediaProminence(): Promise<ApiResponse<string[]>> {
    return this.request(`${this.baseUrl}/data-parameters/category/Media_Prominence`, { method: 'GET' });
  }

  async changePassword(cur: string, newP: string) {
    return post(`${this.baseUrl}/auth/change-password`, { currentPassword: cur, newPassword: newP }, {
      headers: this.getAuthHeaders(),
    });
  }

  async logout() {
    try {
      await post(`${this.baseUrl}/auth/logout`, {}, { headers: this.getAuthHeaders() });
    } finally {
      this.clearToken();
    }
  }

  // --------------------------------------------------------------------------
  // USERS
  // --------------------------------------------------------------------------
  async getUsers(p?: QueryParams): Promise<ApiResponse<User[]>> {
    const res = await get(`${this.baseUrl}/users${this.buildQuery(p)}`, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<User[]>(res);
  }

  async getSupervisors(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>(`${this.baseUrl}/users/supervisors`, { method: 'GET' });
  }

  async getUserById(id: string) {
    return get(`${this.baseUrl}/users/${id}`, { headers: this.getAuthHeaders(false) });
  }

  async createUser(
    data: Partial<User> & {
      password: string;
      confirmPassword: string;
      company_monitorings?: CompanyMonitoring[];
      subsidiary_monitorings?: SubsidiaryMonitoring[];
    }
  ): Promise<ApiResponse<User>> {
    const payload = {
      username: data.username,
      email: data.email,
      country_code: data.country_code,
      mobile_number: data.mobile_number,
      role: data.role,
      password: data.password,
      supervisor_id: data.supervisor_id ? String(data.supervisor_id) : undefined,
      company_monitorings: data.company_monitorings?.map(cm => ({
        company_id: Number(cm.company_id),
        competitor_company_ids: cm.competitor_company_ids.map(Number),
        media_prominence: cm.media_prominence,
        monitoring_date: cm.monitoring_date ? new Date(cm.monitoring_date).toISOString() : new Date().toISOString(),
        subsidiary_monitorings: cm.subsidiary_monitorings?.map(sm => ({
          subsidiary_id: Number(sm.subsidiary_id),
          competitor_subsidiary_ids: sm.competitor_subsidiary_ids.map(Number),
          media_prominence: sm.media_prominence,
        })) || [],
      })),
    };

    return this.request<User>(`${this.baseUrl}/auth/create-user`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateUser(id: string, data: Partial<User>) {
    return put(`${this.baseUrl}/users/update/${id}`, data, { headers: this.getAuthHeaders() });
  }

  async deleteUser(id: string) {
    return put(`${this.baseUrl}/users/delete/${id}`, {}, { headers: this.getAuthHeaders() });
  }

  async exportUsers(p?: QueryParams): Promise<ApiResponse<unknown>> {
    try {
      const res = await get(`${this.baseUrl}/export/users${this.buildQuery(p)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extract<unknown>(res);
    } catch {
      return { success: false, data: null, message: 'Export functionality not available' };
    }
  }

  // --------------------------------------------------------------------------
  // COMPANIES
  // --------------------------------------------------------------------------
  async getCompanies(p?: QueryParams): Promise<{
    companies: {
      id: string;
      company: string;
      industry: string;
      contact: string;
      status: string;
      logo: string | null;
      website: string | null;
      phone_no: string | null;
    }[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const res = await get(`${this.baseUrl}/companies${this.buildQuery(p)}`, {
      headers: this.getAuthHeaders(false),
    });
    const raw = this.extract<any>(res);

    const companies = raw.data.data.map((c: any) => ({
      id: c.id,
      company: c.company_name,
      industry: c.industry,
      contact: `${c.contact_person} (${c.email})`,
      status: c.ceo,
      logo: null,
      website: c.website ?? null,
      phone_no: c.phone_no ?? null,
    }));

    return { companies, pagination: raw.data.pagination };
  }

  async getCompanyById(id: string) {
    return get(`${this.baseUrl}/companies/${id}`, { headers: this.getAuthHeaders(false) });
  }

  async createCompany(data: Partial<Company>) {
    return post(`${this.baseUrl}/companies/create`, data, { headers: this.getAuthHeaders() });
  }

  async updateCompany(id: string, data: Partial<Company>) {
    return put(`${this.baseUrl}/companies/${id}`, data, { headers: this.getAuthHeaders() });
  }

  async deleteCompany(id: string) {
    return del(`${this.baseUrl}/companies/${id}`, { headers: this.getAuthHeaders() });
  }

  async exportCompanies(p?: QueryParams): Promise<ApiResponse<unknown>> {
    const res = await get(`${this.baseUrl}/export/companies${this.buildQuery(p)}`, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<unknown>(res);
  }

  // --------------------------------------------------------------------------
  // PUBLICATIONS
  // --------------------------------------------------------------------------
  async getPublications(p?: QueryParams): Promise<ApiResponse<PublicationsResponse>> {
    const res = await get(`${this.baseUrl}/publications${this.buildQuery(p)}`, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<PublicationsResponse>(res);
  }

  async getPublicationById(id: string) {
    return get(`${this.baseUrl}/publications/${id}`, { headers: this.getAuthHeaders(false) });
  }

  async createPublication(data: Partial<Publication>) {
    return post(`${this.baseUrl}/publications`, data, { headers: this.getAuthHeaders() });
  }

  async updatePublication(id: string, data: Partial<Publication>) {
    return put(`${this.baseUrl}/publications/${id}`, data, { headers: this.getAuthHeaders() });
  }

  async deletePublication(id: string) {
    return del(`${this.baseUrl}/publications/${id}`, { headers: this.getAuthHeaders() });
  }

  async exportPublications(p?: QueryParams): Promise<ApiResponse<unknown>> {
    const res = await get(`${this.baseUrl}/export/publications${this.buildQuery(p)}`, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<unknown>(res);
  }

  // --------------------------------------------------------------------------
  // EDITORIALS
  // --------------------------------------------------------------------------
  async getEditorials(p?: QueryParams): Promise<ApiResponse<Editorial[]>> {
    const res = await get(`${this.baseUrl}/editorials${this.buildQuery(p)}`, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<Editorial[]>(res);
  }

  async getEditorialById(id: string) {
    return get(`${this.baseUrl}/editorials/${id}`, { headers: this.getAuthHeaders(false) });
  }

  async createEditorial(data: Partial<Editorial>) {
    return post(`${this.baseUrl}/editorials`, data, { headers: this.getAuthHeaders() });
  }

  async updateEditorial(id: string, data: Partial<Editorial>) {
    return put(`${this.baseUrl}/editorials/${id}`, data, { headers: this.getAuthHeaders() });
  }

  async deleteEditorial(id: string) {
    return del(`${this.baseUrl}/editorials/${id}`, { headers: this.getAuthHeaders() });
  }

  async exportEditorials(p?: QueryParams): Promise<ApiResponse<unknown>> {
    const res = await get(`${this.baseUrl}/export/editorials${this.buildQuery(p)}`, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<unknown>(res);
  }

  async batchUploadEditorials(file: File): Promise<ApiResponse<any>> {
    const fd = new FormData();
    fd.append('file', file);
    const res = await post(`${this.baseUrl}/editorials/batch-upload`, fd, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<any>(res);
  }

  async downloadEditorialTemplate(): Promise<Blob> {
    try {
      const res = await get(`${this.baseUrl}/editorials/template`, {
        headers: this.getAuthHeaders(false),
        responseType: 'blob',
      });
      return res.data;
    } catch {
      return this.generateFallbackTemplate();
    }
  }

  private generateFallbackTemplate(): Blob {
    const headers = [
      'Date', 'Company', 'Industry', 'Brand', 'Sub-Industry', 'Source', 'Placement',
      'Title', 'Print/Web Clips', 'Reporter', 'Country', 'Language', 'Spokesperson',
      'CEO Thought Leadership', 'Activity', 'Circulation',
      'Audience Reach', 'Media Type', 'Online Channel', 'Sentiment',
      'Sentiment Classification', 'Sentiment Score', 'Advert Spend', 'Page Size',
      'Status', 'Analyst Note', 'Supervisor Note', 'Admin Note',
    ];
    return new Blob([headers.join(',') + '\n'], { type: 'text/csv' });
  }

  // --------------------------------------------------------------------------
  // SWOT ANALYSIS
  // --------------------------------------------------------------------------
  async getSwotAnalyses(p?: QueryParams): Promise<ApiResponse<SwotAnalysis[]>> {
    const res = await get(`${this.baseUrl}/swot-analysis${this.buildQuery(p)}`, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<SwotAnalysis[]>(res);
  }

  async getSwotAnalysisById(id: string) {
    return get(`${this.baseUrl}/swot-analysis/${id}`, { headers: this.getAuthHeaders(false) });
  }

  async createSwotAnalysis(data: Partial<SwotAnalysis>) {
    return post(`${this.baseUrl}/swot-analysis`, data, { headers: this.getAuthHeaders() });
  }

  async updateSwotAnalysis(id: string, data: Partial<SwotAnalysis>) {
    return put(`${this.baseUrl}/swot-analysis/${id}`, data, { headers: this.getAuthHeaders() });
  }

  async deleteSwotAnalysis(id: string) {
    return del(`${this.baseUrl}/swot-analysis/${id}`, { headers: this.getAuthHeaders() });
  }

  // --------------------------------------------------------------------------
  // AUDIT LOGS
  // --------------------------------------------------------------------------

  async getAuditLogs(filters?: AuditLogFilters): Promise<ApiResponse<AuditLog[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (value instanceof Date) {
          params.append(key, value.toISOString());
        } else if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)));
        } else {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/audit-logs?${queryString}` : `${this.baseUrl}/audit-logs`;
    const response = await get(url, { headers: this.getAuthHeaders() });
    return response.data;
  }

  async getAuditLogStats(filters?: { startDate?: Date | string; endDate?: Date | string }) {
    const params = new URLSearchParams();
    if (filters?.startDate) {
      const date = filters.startDate instanceof Date 
        ? filters.startDate.toISOString().split('T')[0] 
        : filters.startDate;
      params.append('date_from', date);
    }
    if (filters?.endDate) {
      const date = filters.endDate instanceof Date 
        ? filters.endDate.toISOString().split('T')[0] 
        : filters.endDate;
      params.append('date_to', date);
    }
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/audit-logs/stats?${queryString}` : `${this.baseUrl}/audit-logs/stats`;
    const response = await get(url, { headers: this.getAuthHeaders() });
    return response.data;
  }

  async getAuditLogById(id: string): Promise<ApiResponse<AuditLog>> {
    const response = await get(`${this.baseUrl}/audit-logs/${id}`, { headers: this.getAuthHeaders() });
    return response.data;
  }

  // --------------------------------------------------------------------------
  // FILES
  // --------------------------------------------------------------------------
  async getAllFiles(p?: QueryParams): Promise<ApiResponse<FileUpload[]>> {
    const res = await get(`${this.baseUrl}/files${this.buildQuery(p)}`, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<FileUpload[]>(res);
  }

  async getFiles(p?: QueryParams): Promise<ApiResponse<FileUpload[]>> {
    return this.getAllFiles(p);
  }

  async uploadFile(fd: FormData) {
    return post(`${this.baseUrl}/files/upload`, fd, { headers: this.getAuthHeaders(false) });
  }

  async uploadMultipleFiles(fd: FormData) {
    return post(`${this.baseUrl}/files/upload-multiple`, fd, { headers: this.getAuthHeaders(false) });
  }

  async getFileById(id: string) {
    return get(`${this.baseUrl}/files/${id}`, { headers: this.getAuthHeaders(false) });
  }

  async updateFile(id: string, fd: FormData) {
    return put(`${this.baseUrl}/files/${id}`, fd, { headers: this.getAuthHeaders(false) });
  }

  async deleteFile(id: string) {
    return put(`${this.baseUrl}/files/delete/${id}`, {}, { headers: this.getAuthHeaders() });
  }

  async downloadFile(id: string) {
    return get(`${this.baseUrl}/files/download/${id}`, { headers: this.getAuthHeaders(false) });
  }

  // --------------------------------------------------------------------------
  // ROLES
  // --------------------------------------------------------------------------
  async getRoles(): Promise<ApiResponse<{ id: number; name: string }[]>> {
    const res = await this.request<{ data: { id: number; name: string }[] }>(`${this.baseUrl}/roles?limit=1000`, {
      method: 'GET',
    });
    return { ...res, data: res.data.data };
  }

  async getUserRole(userId: string) {
    return get(`${this.baseUrl}/roles/user/${userId}`, { headers: this.getAuthHeaders(false) });
  }

  // --------------------------------------------------------------------------
  // DAILY MENTIONS
  // --------------------------------------------------------------------------
  async getDailyMentions(p?: QueryParams): Promise<ApiResponse<DailyMention[]>> {
    const res = await get(`${this.baseUrl}/daily-mentions${this.buildQuery(p)}`, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<DailyMention[]>(res);
  }

  async getDailyMentionById(id: string) {
    return get(`${this.baseUrl}/daily-mentions/${id}`, { headers: this.getAuthHeaders(false) });
  }

  async createDailyMention(data: Partial<DailyMention>) {
    return post(`${this.baseUrl}/daily-mentions`, data, { headers: this.getAuthHeaders() });
  }

  async updateDailyMention(id: string, data: Partial<DailyMention>) {
    return put(`${this.baseUrl}/daily-mentions/${id}`, data, { headers: this.getAuthHeaders() });
  }

  async deleteDailyMention(id: string) {
    return del(`${this.baseUrl}/daily-mentions/${id}`, { headers: this.getAuthHeaders() });
  }

  async exportDailyMentions(p?: QueryParams): Promise<ApiResponse<unknown>> {
    const res = await get(`${this.baseUrl}/export/daily-mentions${this.buildQuery(p)}`, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<unknown>(res);
  }

  // --------------------------------------------------------------------------
  // DATA ENTRIES / PARAMETERS
  // --------------------------------------------------------------------------

  async getDataParameters(p?: QueryParams): Promise<ApiResponse<any[]>> {
    const res = await get(`${this.baseUrl}/data-parameters${this.buildQuery(p)}`, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<any[]>(res);
  }

  async getDataParameterById(id: string): Promise<ApiResponse<any>> {
    const res = await get(`${this.baseUrl}/data-parameters/${id}`, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<any>(res);
  }

  // --------------------------------------------------------------------------
  // OUTCOME INSIGHTS
  // --------------------------------------------------------------------------
  async getOutcomeInsights(p?: QueryParams): Promise<ApiResponse<OutcomeInsight[]>> {
    const res = await get(`${this.baseUrl}/outcome-insights${this.buildQuery(p)}`, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<OutcomeInsight[]>(res);
  }

  async getOutcomeInsightById(id: string) {
    return get(`${this.baseUrl}/outcome-insights/${id}`, { headers: this.getAuthHeaders(false) });
  }

  async createOutcomeInsight(data: Partial<OutcomeInsight>) {
    return post(`${this.baseUrl}/outcome-insights/create`, data, { headers: this.getAuthHeaders() });
  }

  async updateOutcomeInsight(id: string, data: Partial<OutcomeInsight>) {
    return put(`${this.baseUrl}/outcome-insights/${id}`, data, { headers: this.getAuthHeaders() });
  }

  async deleteOutcomeInsight(id: string) {
    return del(`${this.baseUrl}/outcome-insights/${id}`, { headers: this.getAuthHeaders() });
  }

  // --------------------------------------------------------------------------
  // EXPORT ENDPOINTS
  // --------------------------------------------------------------------------
  async exportSwotAnalysis(p?: QueryParams): Promise<ApiResponse<unknown>> {
    const res = await get(`${this.baseUrl}/export/swot-analysis${this.buildQuery(p)}`, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<unknown>(res);
  }

  async exportAnalytics(p?: QueryParams): Promise<ApiResponse<unknown>> {
    const res = await get(`${this.baseUrl}/export/analytics${this.buildQuery(p)}`, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<unknown>(res);
  }

  // --------------------------------------------------------------------------
  // SEARCH
  // --------------------------------------------------------------------------
  async searchCompanies(query: string, limit = 10): Promise<ApiResponse<any[]>> {
    const p = { search: query, limit };
    const res = await get(`${this.baseUrl}/companies/search${this.buildQuery(p)}`, {
      headers: this.getAuthHeaders(false),
    });
    return this.extract<any[]>(res);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
export const apiService = new ApiService();