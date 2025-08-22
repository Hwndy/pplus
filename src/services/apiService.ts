import { get, post, put, del } from '@/utils/api';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Supervisor' | 'Analyst' | 'Client';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatar?: string;
  mobileContact?: string;
  countryCode?: string;
  supervisorId?: string;
  expirationDate?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
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

export interface Publication {
  id: string;
  name: string;
  type: string;
  website?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
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

export interface MediaChannel {
  id: string;
  name: string;
  type: string;
  category: string;
  website?: string;
  description?: string;
  reach: number;
  audienceDemographics: AudienceDemographics;
  contactInfo: ContactInfo;
  socialHandles: SocialHandles;
  location: string;
  language: string;
  frequency: string;
  status: string;
  rating: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
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
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://p-backend-nhe0.onrender.com/api';

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
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        console.log('✅ Backend is reachable');
      } else {
        console.warn('⚠️ Backend responded with status:', response.status);
      }
    } catch (error) {
      console.error('❌ Backend connectivity test failed:', error);
      console.error('This means the backend at', this.baseUrl, 'is not responding');
      console.error('Pages will show loading states or errors until backend is available');
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
      const axiosResponse = await post(loginUrl, { email, password });

      // Log the raw response to understand the structure
      console.log('Raw axios response:', axiosResponse);
      console.log('Response data:', axiosResponse.data);

      // Handle different response structures from the backend
      let response: ApiResponse<{ token: string; user: User }>;

      if (axiosResponse.data.success !== undefined) {
        // Backend returns { success: true, data: { token, user }, message: '' }
        response = axiosResponse.data as ApiResponse<{ token: string; user: User }>;
      } else if (axiosResponse.data.token) {
        // Backend returns { token, user } directly
        response = {
          success: true,
          data: axiosResponse.data,
          message: 'Login successful'
        };
      } else {
        // Fallback - wrap the response
        response = {
          success: true,
          data: axiosResponse.data,
          message: 'Login successful'
        };
      }

      console.log('Processed response:', response);

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

  // Profile endpoint doesn't exist on backend, user data is stored locally after login
  async getProfile(): Promise<ApiResponse<User>> {
    // Return user data from localStorage since backend doesn't have profile endpoint
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        return {
          success: true,
          data: userData,
          message: 'Profile retrieved from local storage'
        };
      } catch (error) {
        throw new Error('Failed to parse saved user data');
      }
    } else {
      throw new Error('No user data found in local storage');
    }
  }

  async register(userData: { username: string; email: string; gender: string; password: string; role_id?: string; active?: boolean }) {
    try {
      const response = await post(`${this.baseUrl}/auth/register`, userData);
      return response;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
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

  // USERS - Fixed endpoints to match Postman collection
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

  async getSupervisors() {
    try {
      console.log('Fetching supervisors');
      const response = await get(`${this.baseUrl}/users/supervisors`, {
        headers: this.getAuthHeaders(false),
      });
      console.log('Supervisors API response:', response);
      return response;
    } catch (error) {
      console.error('Get supervisors error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      throw error;
    }
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

 async createUser(data: Partial<User>) {
  try {
    const payload = {
      username: data.username,
      email: data.email,
      country_code: data.country_code,
      mobile_number: data.mobile_number,
      role: data.role,
      joinDate: data.joinDate
        ? new Date(data.joinDate).toISOString()
        : new Date().toISOString(),
      expiration_date: data.expiration_date
        ? new Date(data.expiration_date).toISOString()
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      password: data.password,
      confirmPassword: data.confirmPassword,
      supervisor_id: data.role === "Analyst" ? Number(data.supervisor_id) : undefined,
    };

    console.log("Creating user with payload:", payload);
    const response = await post(
      `${this.baseUrl}/auth/create-user`,
      payload,
      { headers: this.getAuthHeaders() }
    );
    return this.extractApiResponse<User>(response);
  } catch (error: any) {
    console.error("Create user error:", error);
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
  async getPublications(params?: QueryParams): Promise<ApiResponse<Publication[]>> {
    try {
      const axiosResponse = await get(`${this.baseUrl}/publications${this.buildQuery(params)}`, {
        headers: this.getAuthHeaders(false),
      });
      return this.extractApiResponse<Publication[]>(axiosResponse);
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

  // // MEDIA CHANNELS
  // async getMediaChannels(params?: QueryParams): Promise<ApiResponse<MediaChannel[]>> {
  //   try {
  //     const axiosResponse = await get(`${this.baseUrl}/media-channels${this.buildQuery(params)}`, {
  //       headers: this.getAuthHeaders(false),
  //     });
  //     return this.extractApiResponse<MediaChannel[]>(axiosResponse);
  //   } catch (error) {
  //     console.error('Get media channels error:', error);
  //     throw error;
  //   }
  // }

  // async getMediaChannelById(id: string) {
  //   try {
  //     const response = await get(`${this.baseUrl}/media-channels/${id}`, {
  //       headers: this.getAuthHeaders(false),
  //     });
  //     return response;
  //   } catch (error) {
  //     console.error('Get media channel by ID error:', error);
  //     throw error;
  //   }
  // }

  // async createMediaChannel(data: Partial<MediaChannel>) {
  //   try {
  //     const response = await post(`${this.baseUrl}/media-channels`, data, {
  //       headers: this.getAuthHeaders(),
  //     });
  //     return response;
  //   } catch (error) {
  //     console.error('Create media channel error:', error);
  //     throw error;
  //   }
  // }

  // async updateMediaChannel(id: string, data: Partial<MediaChannel>) {
  //   try {
  //     const response = await put(`${this.baseUrl}/media-channels/${id}`, data, {
  //       headers: this.getAuthHeaders(),
  //     });
  //     return response;
  //   } catch (error) {
  //     console.error('Update media channel error:', error);
  //     throw error;
  //   }
  // }

  // async deleteMediaChannel(id: string) {
  //   try {
  //     const response = await del(`${this.baseUrl}/media-channels/${id}`, {
  //       headers: this.getAuthHeaders(),
  //     });
  //     return response;
  //   } catch (error) {
  //     console.error('Delete media channel error:', error);
  //     throw error;
  //   }
  // }

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
  async getRoles() {
    try {
      const response = await get(`${this.baseUrl}/roles`, {
        headers: this.getAuthHeaders(false),
      });
      return response;
    } catch (error) {
      console.error('Get roles error:', error);
      throw error;
    }
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
