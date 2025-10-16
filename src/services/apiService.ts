import { get, post, put, del } from '@/utils/api';

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  country_code: string;
  mobile_number: string;
  joinDate: string;
  role: string;
  avatar?: string;
  supervisor_id?: string;
  expiration_date?: string;
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
  monitoring_date: string | null;
}

export interface SubsidiaryMonitoring {
  subsidiary_company_id: string;
  competitor_subsidiary_ids: string[]; 
  media_prominence: string;
}

export interface Company {
        id: string;
        company_name: string;
        industry: string;
        sub_industry: string;
        office_address: string;
        // subsidiary: company.subsidiary ? SubsidiaryArray(company.subsidiary) : [],
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

// Query parameters interface
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

// API Response wrapper interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

// API Service Class
class ApiService {
  private token: string | null = null;
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://pplus-fbec.onrender.com/api';

  constructor() {
    console.log('ApiService initialized with baseUrl:', this.baseUrl);

    // Test backend connectivity
    this.testBackendConnectivity();

    const storedToken = localStorage.getItem('token');
    if (storedToken && this.isTokenValid(storedToken)) {
      this.token = storedToken;
    } else {
      this.clearToken();
    }
  }

  private async testBackendConnectivity() {
    try {
      console.log('Testing backend connectivity...');
      const response = await fetch(`${this.baseUrl}/users?limit=1`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        console.log('✅ Backend is reachable');
      } else {
        console.warn('⚠️ Backend responded with status:', response.status);
      }
    } catch (error) {
      console.error('❌ Backend connectivity test failed:', error);
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp && payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private getAuthHeaders(includeContentType: boolean = true) {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

   private async post<T>(url: string, data: any, config: any = {}): Promise<ApiResponse<T>> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...this.getAuthHeaders(), ...config.headers },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Request failed');
    }
    return result;
  }

  private async get<T>(url: string): Promise<ApiResponse<T>> {
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Request failed');
    }
    return result;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private buildQuery(params?: QueryParams) {
    if (!params) return '';

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString() ? `?${searchParams.toString()}` : '';
  }

  // Helper method to extract API response from axios response
  private extractApiResponse<T>(axiosResponse: { data: unknown }): ApiResponse<T> {
    return axiosResponse.data as ApiResponse<T>;
  }

  // AUTH
   async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    try {
      const loginUrl = `${this.baseUrl}/auth/login`;
      console.log('Attempting login to:', loginUrl);
      const response = await this.post<{ token: string; user: User }>(loginUrl, { email, password });
      if (response.success && response.data?.token) {
        this.setToken(response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.get<User>(`${this.baseUrl}/auth/me`);
      return response;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  async getCompaniesForUser(): Promise<ApiResponse<{ data: { id: number; company_name: string }[]; pagination: any }>> {
    return this.get<{ data: { id: number; company_name: string }[]; pagination: any }>(`${this.baseUrl}/companies?limit=1000`);
  }

  async getSubsidiaries(): Promise<ApiResponse<{ id: number; subsidiary_company_id: number; subsidiaryCompany: SubsidiaryCompany; company_name: string }[]>> {
    return this.get<{ id: number; subsidiary_company_id: number; subsidiaryCompany: SubsidiaryCompany; company_name: string }[]>(`${this.baseUrl}/subsidiaries?limit=1000`);
  }

  async getMediaProminence(): Promise<ApiResponse<string[]>> {
    return this.get<string[]>(`${this.baseUrl}/data-parameters/category/Media_Prominence`);
  }

  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const response = await post(`${this.baseUrl}/auth/change-password`, { currentPassword, newPassword }, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const response = await post(`${this.baseUrl}/auth/logout`, {}, {
        headers: this.getAuthHeaders(),
      });
      this.clearToken();
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      this.clearToken(); // Clear token even if logout fails
      throw error;
    }
  }

  async getUsers(params?: QueryParams): Promise<ApiResponse<User[]>> {
    try {
      console.log('Fetching users with params:', params);
      const axiosResponse = await get(`${this.baseUrl}/users${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      console.log('Users API response:', axiosResponse);
      return this.extractApiResponse<User[]>(axiosResponse);
    } catch (error) {
      console.error('Get users error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  }

  // async getSupervisors() {
  //   try {
  //     console.log('Fetching supervisors');
  //     const response = await get(`${this.baseUrl}/users/supervisors`, {
  //       headers: this.getAuthHeaders(false),
  //     });
  //     console.log('Supervisors API response:', response);
  //     return response;
  //   } catch (error) {
  //     console.error('Get supervisors error:', error);
  //     console.error('Error details:', {
  //       message: error instanceof Error ? error.message : 'Unknown error',
  //       status: (error as any)?.response?.status,
  //       data: (error as any)?.response?.data
  //     });
  //     throw error;
  //   }
  // }

  async getSupervisors(): Promise<ApiResponse<User[]>> {
    return this.get<User[]>(`${this.baseUrl}/users/supervisors`);
  }

  async getUserById(id: string) {
    try {
      console.log('Fetching user by ID:', id);
      const response = await get(`${this.baseUrl}/users/${id}`, {
        headers: this.getAuthHeaders(false),
      });
      console.log('User by ID API response:', response);
      return response;
    } catch (error) {
      console.error('Get user by ID error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  }


  async createUser(data: Partial<User> & {
    password: string;
    confirmPassword: string;
    company_monitorings?: CompanyMonitoring[];
    subsidiary_monitorings?: SubsidiaryMonitoring[];
  }): Promise<ApiResponse<User>> {
    try {
      const payload = {
        username: data.username,
        email: data.email,
        country_code: data.country_code,
        mobile_number: data.mobile_number,
        expiration_date: data.expiration_date ? new Date(data.expiration_date).toISOString() : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        joinDate: data.joinDate ? new Date(data.joinDate).toISOString() : new Date().toISOString(),
        role: data.role,
        password: data.password,
        supervisor_id: data.supervisor_id ? Number(data.supervisor_id) : undefined,
        company_monitorings: data.company_monitorings?.map(cm => ({
          company_id: Number(cm.company_id),
          competitor_company_ids: cm.competitor_company_ids.map(Number),
          monitoring_date: cm.monitoring_date ? new Date(cm.monitoring_date).toISOString() : new Date().toISOString(),
        })),
        subsidiary_monitorings: data.subsidiary_monitorings?.map(sm => ({
          subsidiary_company_id: Number(sm.subsidiary_company_id),
          competitor_subsidiary_ids: sm.competitor_subsidiary_ids.map(Number),
          media_prominence: sm.media_prominence,
        })),
      };

      console.log('Creating user with payload:', payload);
      const response = await this.post<User>(`${this.baseUrl}/auth/create-user`, payload);
      return response;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  async updateUser(id: string, data: Partial<User>) {
    try {
      console.log('Updating user:', id, 'with data:', data);
      const response = await put(`${this.baseUrl}/users/update/${id}`, data, {
        headers: this.getAuthHeaders(),
      });
      console.log('Update user API response:', response);
      return response;
    } catch (error) {
      console.error('Update user error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      console.log('Deleting user:', id);
      const response = await put(`${this.baseUrl}/users/delete/${id}`, {}, {
        headers: this.getAuthHeaders(),
      });
      console.log('Delete user API response:', response);
      return response;
    } catch (error) {
      console.error('Delete user error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  }

  async exportUsers(params?: QueryParams): Promise<ApiResponse<unknown>> {
    try {
      // Handle export with proper error handling for 400 responses
      const axiosResponse = await get(`${this.baseUrl}/export/users${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<unknown>(axiosResponse);
    } catch (error) {
      console.error('Export users error:', error);
      // Return a fallback response instead of throwing
      return {
        success: false,
        data: null,
        message: 'Export functionality not available'
      };
    }
  }

  // COMPANIES - Fixed endpoints to match Postman collection
// Inside apiService.ts
async getCompanies(params?: QueryParams): Promise<{
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
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  try {
    const axiosResponse = await get(
      `${this.baseUrl}/companies${this.buildQuery(params)}`,
      {
        headers: this.getAuthHeaders(false),
      }
    );

    const rawResponse = this.extractApiResponse<any>(axiosResponse);

    // Normalize company records
    const companies = rawResponse.data.data.map((c: any) => ({
      id: c.id,
      company: c.company_name,
      industry: c.industry,
      contact: `${c.contact_person} (${c.email})`,
      status: c.ceo,
      logo: null,      
      website: c.website ?? null,
      phone_no: c.phone_no ?? null,
    }));

    // Use backend pagination object directly
    const pagination = rawResponse.data.pagination;

    return { companies, pagination };
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}

  async getCompanyById(id: string) {
    try {
      console.log('Fetching company by ID:', id);
      const response = await get(`${this.baseUrl}/companies/${id}`, {
        headers: this.getAuthHeaders(false),
      });
      console.log('Company by ID API response:', response);
      return response;
    } catch (error) {
      console.error('Get company by ID error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  }

  async createCompany(data: Partial<Company>) {
    try {
      console.log('Creating company with data:', data);
      const response = await post(`${this.baseUrl}/companies/create`, data, {
        headers: this.getAuthHeaders(),
      });
      console.log('Create company API response:', response);
      return response;
    } catch (error) {
      console.error('Create company error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  }

  async updateCompany(id: string, data: Partial<Company>) {
    try {
      const response = await put(`${this.baseUrl}/companies/${id}`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Update company error:', error);
      throw error;
    }
  }

  async deleteCompany(id: string) {
    try {
      const response = await del(`${this.baseUrl}/companies/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Delete company error:', error);
      throw error;
    }
  }

  async exportCompanies(params?: QueryParams): Promise<ApiResponse<unknown>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/export/companies${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<unknown>(axiosResponse);
    } catch (error) {
      console.error('Export companies error:', error);
      throw error;
    }
  }

  // PUBLICATIONS
async getPublications(params?: QueryParams): Promise<ApiResponse<PublicationsResponse>> {
  try {
    const axiosResponse = await get(
      `${this.baseUrl}/publications${this.buildQuery(params)}`,
      { headers: this.getAuthHeaders(false) }
    );
    return this.extractApiResponse<PublicationsResponse>(axiosResponse);
  } catch (error) {
    console.error('Get publications error:', error);
    throw error;
  }
}
  async getPublicationById(id: string) {
    try {
      const response = await get(`${this.baseUrl}/publications/${id}`, {
        headers: this.getAuthHeaders(false),
      });
      return response;
    } catch (error) {
      console.error('Get publication by ID error:', error);
      throw error;
    }
  }

  async createPublication(data: Partial<Publication>) {
    try {
      const response = await post(`${this.baseUrl}/publications`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Create publication error:', error);
      throw error;
    }
  }

  async updatePublication(id: string, data: Partial<Publication>) {
    try {
      const response = await put(`${this.baseUrl}/publications/${id}`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Update publication error:', error);
      throw error;
    }
  }

  async deletePublication(id: string) {
    try {
      const response = await del(`${this.baseUrl}/publications/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Delete publication error:', error);
      throw error;
    }
  }

  async exportPublications(params?: QueryParams): Promise<ApiResponse<unknown>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/export/publications${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<unknown>(axiosResponse);
    } catch (error) {
      console.error('Export publications error:', error);
      throw error;
    }
  }

  // EDITORIALS - Fixed endpoints to match Postman collection
  async getEditorials(params?: QueryParams): Promise<ApiResponse<Editorial[]>> {
    try {
      console.log('Fetching editorials with params:', params);
      const axiosResponse = await get(`${this.baseUrl}/editorials${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      console.log('Editorials API response:', axiosResponse);
      return this.extractApiResponse<Editorial[]>(axiosResponse);
    } catch (error) {
      console.error('Get editorials error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  }

  async getEditorialById(id: string) {
    try {
      console.log('Fetching editorial by ID:', id);
      const response = await get(`${this.baseUrl}/editorials/${id}`, {
        headers: this.getAuthHeaders(false),
      });
      console.log('Editorial by ID API response:', response);
      return response;
    } catch (error) {
      console.error('Get editorial by ID error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  }

  async createEditorial(data: Partial<Editorial>) {
    try {
      const response = await post(`${this.baseUrl}/editorials`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Create editorial error:', error);
      throw error;
    }
  }

  async updateEditorial(id: string, data: Partial<Editorial>) {
    try {
      const response = await put(`${this.baseUrl}/editorials/${id}`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Update editorial error:', error);
      throw error;
    }
  }

  async deleteEditorial(id: string) {
    try {
      const response = await del(`${this.baseUrl}/editorials/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Delete editorial error:', error);
      throw error;
    }
  }

  async exportEditorials(params?: QueryParams): Promise<ApiResponse<unknown>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/export/editorials${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<unknown>(axiosResponse);
    } catch (error) {
      console.error('Export editorials error:', error);
      throw error;
    }
  }

  async batchUploadEditorials(file: File): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await post(`${this.baseUrl}/editorials/batch-upload`, formData, {
        headers: this.getAuthHeaders(false), // Don't include Content-Type for FormData
      });
      return this.extractApiResponse<any>(response);
    } catch (error) {
      console.error('Batch upload editorials error:', error);
      throw error;
    }
  }

  async downloadEditorialTemplate(): Promise<Blob> {
    try {
      const response = await get(`${this.baseUrl}/editorials/template`, {
        headers: this.getAuthHeaders(false),
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Download editorial template error:', error);
      // Return a fallback template if the API endpoint doesn't exist
      return this.generateFallbackTemplate();
    }
  }

  private generateFallbackTemplate(): Blob {
    // Create a simple CSV template with all the editorial fields
    const headers = [
      'Date', 'Company', 'Industry', 'Brand', 'Sub-Industry', 'Source', 'Placement',
      'Title', 'Print/Web Clips', 'Reporter', 'Country', 'Language', 'Spokesperson',
      'CEO Media Presence', 'CEO Thought Leadership', 'Activity', 'Circulation',
      'Audience Reach', 'Media Type', 'Online Channel', 'Sentiment',
      'Sentiment Classification', 'Sentiment Score', 'Advert Spend', 'Page Size',
      'Status', 'Analyst Note', 'Supervisor Note', 'Admin Note'
    ];

    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    return blob;
  }

  // SWOT ANALYSIS
  async getSwotAnalyses(params?: QueryParams): Promise<ApiResponse<SwotAnalysis[]>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/swot-analysis${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<SwotAnalysis[]>(axiosResponse);
    } catch (error) {
      console.error('Get SWOT analyses error:', error);
      throw error;
    }
  }

  async getSwotAnalysisById(id: string) {
    try {
      const response = await get(`${this.baseUrl}/swot-analysis/${id}`, {
        headers: this.getAuthHeaders(false),
      });
      return response;
    } catch (error) {
      console.error('Get SWOT analysis by ID error:', error);
      throw error;
    }
  }

  async createSwotAnalysis(data: Partial<SwotAnalysis>) {
    try {
      const response = await post(`${this.baseUrl}/swot-analysis`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Create SWOT analysis error:', error);
      throw error;
    }
  }

  async updateSwotAnalysis(id: string, data: Partial<SwotAnalysis>) {
    try {
      const response = await put(`${this.baseUrl}/swot-analysis/${id}`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Update SWOT analysis error:', error);
      throw error;
    }
  }

  async deleteSwotAnalysis(id: string) {
    try {
      const response = await del(`${this.baseUrl}/swot-analysis/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Delete SWOT analysis error:', error);
      throw error;
    }
  }

  // ANALYTICS
  async getDashboardSummary(params?: QueryParams): Promise<ApiResponse<unknown>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/analytics/dashboard-summary${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<unknown>(axiosResponse);
    } catch (error) {
      console.error('Get dashboard summary error:', error);
      throw error;
    }
  }

  async getMentionsTrend(params?: QueryParams): Promise<ApiResponse<unknown>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/analytics/mentions-trend${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<unknown>(axiosResponse);
    } catch (error) {
      console.error('Get mentions trend error:', error);
      throw error;
    }
  }

  async getSentimentAnalysis(params?: QueryParams): Promise<ApiResponse<unknown>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/analytics/sentiment-analysis${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<unknown>(axiosResponse);
    } catch (error) {
      console.error('Get sentiment analysis error:', error);
      throw error;
    }
  }

  async getMediaChannelAnalysis(params?: QueryParams): Promise<ApiResponse<unknown>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/analytics/media-channel-analysis${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<unknown>(axiosResponse);
    } catch (error) {
      console.error('Get media channel analysis error:', error);
      throw error;
    }
  }

  async getCompanyComparison(params?: QueryParams): Promise<ApiResponse<unknown>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/analytics/company-comparison${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<unknown>(axiosResponse);
    } catch (error) {
      console.error('Get company comparison error:', error);
      throw error;
    }
  }

  // ACTIVITIES / AUDIT LOGS
  async getAllActivities(params?: QueryParams): Promise<ApiResponse<AuditLog[]>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/audit-logs${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<AuditLog[]>(axiosResponse);
    } catch (error) {
      console.error('Get all activities error:', error);
      throw error;
    }
  }

  async getActivity(id: string) {
    try {
      const response = await get(`${this.baseUrl}/activities/${id}`, {
        headers: this.getAuthHeaders(false),
      });
      return response;
    } catch (error) {
      console.error('Get activity error:', error);
      throw error;
    }
  }

  async createActivity(data: { name: string }) {
    try {
      const response = await post(`${this.baseUrl}/activities/create`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Create activity error:', error);
      throw error;
    }
  }

  async updateActivity(id: string, data: { name: string }) {
    try {
      const response = await put(`${this.baseUrl}/activities/update/${id}`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Update activity error:', error);
      throw error;
    }
  }

  async deleteActivity(id: string) {
    try {
      const response = await put(`${this.baseUrl}/activities/delete/${id}`, {}, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Delete activity error:', error);
      throw error;
    }
  }

  // AUDIT LOGS
  async getAuditLogs(params?: QueryParams): Promise<ApiResponse<AuditLog[]>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/audit-logs${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<AuditLog[]>(axiosResponse);
    } catch (error) {
      console.error('Get audit logs error:', error);
      throw error;
    }
  }

  async getAuditLogsStats() {
    try {
      const response = await get(`${this.baseUrl}/audit-logs/stats`, {
        headers: this.getAuthHeaders(false),
      });
      return response;
    } catch (error) {
      console.error('Get audit logs stats error:', error);
      throw error;
    }
  }

  async getAuditLogById(id: string) {
    try {
      const response = await get(`${this.baseUrl}/audit-logs/${id}`, {
        headers: this.getAuthHeaders(false),
      });
      return response;
    } catch (error) {
      console.error('Get audit log by ID error:', error);
      throw error;
    }
  }

  async createAuditLog(data: Partial<AuditLog>) {
    try {
      const response = await post(`${this.baseUrl}/audit-logs`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Create audit log error:', error);
      throw error;
    }
  }

  // CAMPAIGN TYPES
  async getCampaignTypes(params?: QueryParams): Promise<ApiResponse<unknown[]>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/campaign-types${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<unknown[]>(axiosResponse);
    } catch (error) {
      console.error('Get campaign types error:', error);
      throw error;
    }
  }

  async getCampaignTypeById(id: string) {
    try {
      const response = await get(`${this.baseUrl}/campaign-types/${id}`, {
        headers: this.getAuthHeaders(false),
      });
      return response;
    } catch (error) {
      console.error('Get campaign type by ID error:', error);
      throw error;
    }
  }

  async createCampaignType(data: { name: string }) {
    try {
      const response = await post(`${this.baseUrl}/campaign-types/create`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Create campaign type error:', error);
      throw error;
    }
  }

  async updateCampaignType(id: string, data: { name: string }) {
    try {
      const response = await put(`${this.baseUrl}/campaign-types/update/${id}`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Update campaign type error:', error);
      throw error;
    }
  }

  async deleteCampaignType(id: string) {
    try {
      const response = await put(`${this.baseUrl}/campaign-types/delete/${id}`, {}, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Delete campaign type error:', error);
      throw error;
    }
  }

  // FILES
  async getAllFiles(params?: QueryParams): Promise<ApiResponse<FileUpload[]>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/files${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<FileUpload[]>(axiosResponse);
    } catch (error) {
      console.error('Get all files error:', error);
      throw error;
    }
  }

  // Alias for compatibility with hooks
  async getFiles(params?: QueryParams): Promise<ApiResponse<FileUpload[]>> {
    return this.getAllFiles(params);
  }

  async uploadFile(formData: FormData) {
    try {
      const response = await post(`${this.baseUrl}/files/upload`, formData, {
        headers: this.getAuthHeaders(false), // Don't include Content-Type for FormData
      });
      return response;
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  }

  async uploadMultipleFiles(formData: FormData) {
    try {
      const response = await post(`${this.baseUrl}/files/upload-multiple`, formData, {
        headers: this.getAuthHeaders(false), // Don't include Content-Type for FormData
      });
      return response;
    } catch (error) {
      console.error('Upload multiple files error:', error);
      throw error;
    }
  }

  async getFileById(id: string) {
    try {
      const response = await get(`${this.baseUrl}/files/${id}`, {
        headers: this.getAuthHeaders(false),
      });
      return response;
    } catch (error) {
      console.error('Get file by ID error:', error);
      throw error;
    }
  }

  async updateFile(id: string, formData: FormData) {
    try {
      const response = await put(`${this.baseUrl}/files/${id}`, formData, {
        headers: this.getAuthHeaders(false), // Don't include Content-Type for FormData
      });
      return response;
    } catch (error) {
      console.error('Update file error:', error);
      throw error;
    }
  }

  async deleteFile(id: string) {
    try {
      const response = await put(`${this.baseUrl}/files/delete/${id}`, {}, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }

  async downloadFile(id: string) {
    try {
      const response = await get(`${this.baseUrl}/files/download/${id}`, {
        headers: this.getAuthHeaders(false),
      });
      return response;
    } catch (error) {
      console.error('Download file error:', error);
      throw error;
    }
  }

  // NATURES
  async getAllNatures(params?: QueryParams): Promise<ApiResponse<unknown[]>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/natures${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<unknown[]>(axiosResponse);
    } catch (error) {
      console.error('Get all natures error:', error);
      throw error;
    }
  }

  async createNature(data: { name: string }) {
    try {
      const response = await post(`${this.baseUrl}/natures/create`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Create nature error:', error);
      throw error;
    }
  }

  // PERMISSIONS
  async createPermission(data: { name: string }) {
    try {
      const response = await post(`${this.baseUrl}/permissions/create`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Create permission error:', error);
      throw error;
    }
  }

  async getAllPermissions(params?: QueryParams): Promise<ApiResponse<unknown[]>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/permissions${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<unknown[]>(axiosResponse);
    } catch (error) {
      console.error('Get all permissions error:', error);
      throw error;
    }
  }

  // ROLES
  async getRoles(): Promise<ApiResponse<{ id: number; name: string }[]>> {
    const response = await this.get<{ data: { id: number; name: string }[] }>(`${this.baseUrl}/roles?limit=1000`);
    return {
      success: response.success,
      data: response.data.data, // Extract the inner data array
      message: response.message,
    };
  }

  async getUserRole(userId: string) {
    try {
      const response = await get(`${this.baseUrl}/roles/user/${userId}`, {
        headers: this.getAuthHeaders(false),
      });
      return response;
    } catch (error) {
      console.error('Get user role error:', error);
      throw error;
    }
  }

  // DAILY MENTIONS
  async getDailyMentions(params?: QueryParams): Promise<ApiResponse<DailyMention[]>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/daily-mentions${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<DailyMention[]>(axiosResponse);
    } catch (error) {
      console.error('Get daily mentions error:', error);
      throw error;
    }
  }

  async getDailyMentionById(id: string) {
    try {
      const response = await get(`${this.baseUrl}/daily-mentions/${id}`, {
        headers: this.getAuthHeaders(false),
      });
      return response;
    } catch (error) {
      console.error('Get daily mention by ID error:', error);
      throw error;
    }
  }

  async createDailyMention(data: Partial<DailyMention>) {
    try {
      const response = await post(`${this.baseUrl}/daily-mentions`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Create daily mention error:', error);
      throw error;
    }
  }

  async updateDailyMention(id: string, data: Partial<DailyMention>) {
    try {
      const response = await put(`${this.baseUrl}/daily-mentions/${id}`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Update daily mention error:', error);
      throw error;
    }
  }

  async deleteDailyMention(id: string) {
    try {
      const response = await del(`${this.baseUrl}/daily-mentions/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Delete daily mention error:', error);
      throw error;
    }
  }

  async exportDailyMentions(params?: QueryParams): Promise<ApiResponse<unknown>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/export/daily-mentions${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<unknown>(axiosResponse);
    } catch (error) {
      console.error('Export daily mentions error:', error);
      throw error;
    }
  }

  // DATA ENTRIES - Fixed endpoints to match Postman collection
  async getDataEntries(params?: QueryParams): Promise<ApiResponse<any[]>> {
    try {
      console.log('Fetching data entries with params:', params);
      const axiosResponse = await get(`${this.baseUrl}/data-entries${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      console.log('Data entries API response:', axiosResponse);
      return this.extractApiResponse<any[]>(axiosResponse);
    } catch (error) {
      console.error('Get data entries error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  }

  async getDataEntryById(id: string): Promise<ApiResponse<any>> {
    try {
      console.log('Fetching data entry by ID:', id);
      const axiosResponse = await get(`${this.baseUrl}/data-entries/${id}`, {
        headers: this.getAuthHeaders(false),
      });
      console.log('Data entry by ID API response:', axiosResponse);
      return this.extractApiResponse<any>(axiosResponse);
    } catch (error) {
      console.error('Get data entry error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  }

  // DATA PARAMETERS (Missing methods)
  async getDataParameters(params?: QueryParams): Promise<ApiResponse<any[]>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/data-parameters${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<any[]>(axiosResponse);
    } catch (error) {
      console.error('Get data parameters error:', error);
      throw error;
    }
  }

  async getDataParameterById(id: string): Promise<ApiResponse<any>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/data-parameters/${id}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<any>(axiosResponse);
    } catch (error) {
      console.error('Get data parameter error:', error);
      throw error;
    }
  }



  // OUTCOME INSIGHTS
  async getOutcomeInsights(params?: QueryParams): Promise<ApiResponse<OutcomeInsight[]>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/outcome-insights${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<OutcomeInsight[]>(axiosResponse);
    } catch (error) {
      console.error('Get outcome insights error:', error);
      throw error;
    }
  }

  async getOutcomeInsightById(id: string) {
    try {
      const response = await get(`${this.baseUrl}/outcome-insights/${id}`, {
        headers: this.getAuthHeaders(false),
      });
      return response;
    } catch (error) {
      console.error('Get outcome insight by ID error:', error);
      throw error;
    }
  }

  async createOutcomeInsight(data: Partial<OutcomeInsight>) {
    try {
      const response = await post(`${this.baseUrl}/outcome-insights/create`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Create outcome insight error:', error);
      throw error;
    }
  }

  async updateOutcomeInsight(id: string, data: Partial<OutcomeInsight>) {
    try {
      const response = await put(`${this.baseUrl}/outcome-insights/${id}`, data, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Update outcome insight error:', error);
      throw error;
    }
  }

  async deleteOutcomeInsight(id: string) {
    try {
      const response = await del(`${this.baseUrl}/outcome-insights/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response;
    } catch (error) {
      console.error('Delete outcome insight error:', error);
      throw error;
    }
  }

  // EXPORT ENDPOINTS
  async exportSwotAnalysis(params?: QueryParams): Promise<ApiResponse<unknown>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/export/swot-analysis${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<unknown>(axiosResponse);
    } catch (error) {
      console.error('Export SWOT analysis error:', error);
      throw error;
    }
  }

  async exportAnalytics(params?: QueryParams): Promise<ApiResponse<unknown>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/export/analytics${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<unknown>(axiosResponse);
    } catch (error) {
      console.error('Export analytics error:', error);
      throw error;
    }
  }



  // SEARCH (Missing method)
  async searchCompanies(query: string, limit?: number): Promise<ApiResponse<any[]>> {
    try {
      const params = { search: query, limit: limit || 10 };
      const axiosResponse = await get(`${this.baseUrl}/companies/search${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<any[]>(axiosResponse);
    } catch (error) {
      console.error('Search companies error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
