import { get, post, put, del } from '@/utils/api';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'ANALYST' | 'CLIENT';
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
  name: string;
  industry: string;
  website?: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Publication {
  id: string;
  name: string;
  type: 'PRINT' | 'ONLINE' | 'BOTH';
  website?: string;
  country: string;
  language: string;
  circulation: number;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Service Class
class ApiService {
  private token: string | null = null;

  constructor() {
    const storedToken = localStorage.getItem('token');
    if (storedToken && this.isTokenValid(storedToken)) {
      this.token = storedToken;
    } else {
      this.clearToken();
    }
  }

  private isTokenValid(token: string): boolean {
    // Add logic to validate the token, e.g., check expiration or format
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

  // Authentication
  async login(email: string, password: string) {
    const response = await post<LoginResponse>('/auth/login', { email, password });
    // Handle the wrapped response structure
    if (response.data?.success && response.data?.data?.token) {
      this.setToken(response.data.data.token);
    } else if (response.data?.token) {
      // Fallback for direct token response
      this.setToken(response.data.token);
    }
    return response;
  }

  async getProfile() {
    return get<User>('/auth/me', { headers: this.getAuthHeaders() });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return post<any>('/auth/change-password', 
      { currentPassword, newPassword }, 
      { headers: this.getAuthHeaders() }
    );
  }

  async logout() {
    const response = await post<any>('/auth/logout', {}, { headers: this.getAuthHeaders() });
    this.clearToken();
    return response;
  }

  // Users
  async getUsers(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<PaginatedResponse<User>>(`/users${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getUserById(id: string) {
    return get<User>(`/users/${id}`, { headers: this.getAuthHeaders() });
  }

  async createUser(userData: Partial<User>) {
    return post<User>('/users', userData, { headers: this.getAuthHeaders() });
  }

  async updateUser(id: string, userData: Partial<User>) {
    return put<User>(`/users/${id}`, userData, { headers: this.getAuthHeaders() });
  }

  async deleteUser(id: string) {
    return del<any>(`/users/${id}`, { headers: this.getAuthHeaders() });
  }

  async getSupervisors() {
    return get<User[]>('/users/supervisors', { headers: this.getAuthHeaders() });
  }

  // Companies
  async getCompanies(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<PaginatedResponse<Company>>(`/companies${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getCompanyById(id: string) {
    return get<Company>(`/companies/${id}`, { headers: this.getAuthHeaders() });
  }

  async createCompany(companyData: Partial<Company>) {
    return post<Company>('/companies', companyData, { headers: this.getAuthHeaders() });
  }

  async updateCompany(id: string, companyData: Partial<Company>) {
    return put<Company>(`/companies/${id}`, companyData, { headers: this.getAuthHeaders() });
  }

  async deleteCompany(id: string) {
    return del<any>(`/companies/${id}`, { headers: this.getAuthHeaders() });
  }

  // Publications
  async getPublications(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<PaginatedResponse<Publication>>(`/publications${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getPublicationById(id: string) {
    return get<Publication>(`/publications/${id}`, { headers: this.getAuthHeaders() });
  }

  async createPublication(publicationData: Partial<Publication>) {
    return post<Publication>('/publications', publicationData, { headers: this.getAuthHeaders() });
  }

  async updatePublication(id: string, publicationData: Partial<Publication>) {
    return put<Publication>(`/publications/${id}`, publicationData, { headers: this.getAuthHeaders() });
  }

  async deletePublication(id: string) {
    return del<any>(`/publications/${id}`, { headers: this.getAuthHeaders() });
  }

  // Data Entries
  async getDataEntries(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/data-entries${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getDataEntryById(id: string) {
    return get<any>(`/data-entries/${id}`, { headers: this.getAuthHeaders() });
  }

  async createDataEntry(dataEntryData: any) {
    return post<any>('/data-entries', dataEntryData, { headers: this.getAuthHeaders() });
  }

  async updateDataEntry(id: string, dataEntryData: any) {
    return put<any>(`/data-entries/${id}`, dataEntryData, { headers: this.getAuthHeaders() });
  }

  async deleteDataEntry(id: string) {
    return del<any>(`/data-entries/${id}`, { headers: this.getAuthHeaders() });
  }

  // Editorials
  async getEditorials(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/editorials${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getEditorialById(id: string) {
    return get<any>(`/editorials/${id}`, { headers: this.getAuthHeaders() });
  }

  async createEditorial(editorialData: any) {
    return post<any>('/editorials', editorialData, { headers: this.getAuthHeaders() });
  }

  async updateEditorial(id: string, editorialData: any) {
    return put<any>(`/editorials/${id}`, editorialData, { headers: this.getAuthHeaders() });
  }

  async deleteEditorial(id: string) {
    return del<any>(`/editorials/${id}`, { headers: this.getAuthHeaders() });
  }

  // SWOT Analysis
  async getSwotAnalyses(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/swot-analysis${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getSwotAnalysisById(id: string) {
    return get<any>(`/swot-analysis/${id}`, { headers: this.getAuthHeaders() });
  }

  async createSwotAnalysis(swotData: any) {
    return post<any>('/swot-analysis', swotData, { headers: this.getAuthHeaders() });
  }

  async updateSwotAnalysis(id: string, swotData: any) {
    return put<any>(`/swot-analysis/${id}`, swotData, { headers: this.getAuthHeaders() });
  }

  async deleteSwotAnalysis(id: string) {
    return del<any>(`/swot-analysis/${id}`, { headers: this.getAuthHeaders() });
  }

  // Daily Mentions
  async getDailyMentions(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/daily-mentions${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getDailyMentionById(id: string) {
    return get<any>(`/daily-mentions/${id}`, { headers: this.getAuthHeaders() });
  }

  async createDailyMention(mentionData: any) {
    return post<any>('/daily-mentions', mentionData, { headers: this.getAuthHeaders() });
  }

  async updateDailyMention(id: string, mentionData: any) {
    return put<any>(`/daily-mentions/${id}`, mentionData, { headers: this.getAuthHeaders() });
  }

  async deleteDailyMention(id: string) {
    return del<any>(`/daily-mentions/${id}`, { headers: this.getAuthHeaders() });
  }

  // Analytics
  async getDashboardSummary(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/analytics/dashboard-summary${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getMentionsTrend(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/analytics/mentions-trend${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getSentimentAnalysis(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/analytics/sentiment-analysis${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getMediaChannelAnalysis(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/analytics/media-channel-analysis${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getCompanyComparison(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/analytics/company-comparison${queryString}`, { headers: this.getAuthHeaders() });
  }

  // File Uploads
  async uploadFile(file: File, fieldName: string = 'file') {
    const formData = new FormData();
    formData.append(fieldName, file);

    // Note: For file uploads, we don't use the JSON API utility
    // We need to make a direct fetch request
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/files/upload`, {
      method: 'POST',
      headers: this.getAuthHeaders(false), // Don't include Content-Type for file uploads
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Audit Logs
  async getAuditLogs(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/audit-logs${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getAuditLogById(id: string) {
    return get<any>(`/audit-logs/${id}`, { headers: this.getAuthHeaders() });
  }

  async getAuditLogsByResource(resource: string, resourceId: string, params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/audit-logs/resource/${resource}/${resourceId}${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getAuditLogsByUser(userId: string, params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/audit-logs/user/${userId}${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getAuditLogStats(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/audit-logs/stats${queryString}`, { headers: this.getAuthHeaders() });
  }

  // Media Channels
  async getMediaChannels(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/media-channels${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getMediaChannelById(id: string) {
    return get<any>(`/media-channels/${id}`, { headers: this.getAuthHeaders() });
  }

  async createMediaChannel(channelData: any) {
    return post<any>('/media-channels', channelData, { headers: this.getAuthHeaders() });
  }

  async updateMediaChannel(id: string, channelData: any) {
    return put<any>(`/media-channels/${id}`, channelData, { headers: this.getAuthHeaders() });
  }

  async deleteMediaChannel(id: string) {
    return del<any>(`/media-channels/${id}`, { headers: this.getAuthHeaders() });
  }

  // Data Parameters
  async getDataParameters(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/data-parameters${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getDataParameterById(id: string) {
    return get<any>(`/data-parameters/${id}`, { headers: this.getAuthHeaders() });
  }

  async createDataParameter(parameterData: any) {
    return post<any>('/data-parameters', parameterData, { headers: this.getAuthHeaders() });
  }

  async updateDataParameter(id: string, parameterData: any) {
    return put<any>(`/data-parameters/${id}`, parameterData, { headers: this.getAuthHeaders() });
  }

  async deleteDataParameter(id: string) {
    return del<any>(`/data-parameters/${id}`, { headers: this.getAuthHeaders() });
  }

  // Search endpoints
  async searchCompanies(query: string, limit?: number) {
    const params = new URLSearchParams({ q: query });
    if (limit) params.append('limit', limit.toString());
    return get<any>(`/companies/search?${params}`, { headers: this.getAuthHeaders() });
  }

  // Bulk operations
  async bulkUpdateUsers(updates: Array<{ id: string; data: any }>) {
    return put<any>('/users/bulk-update', { updates }, { headers: this.getAuthHeaders() });
  }

  // Password reset
  async forgotPassword(email: string) {
    return post<any>('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string) {
    return post<any>('/auth/reset-password', { token, newPassword });
  }

  // Export endpoints
  async exportCompanies(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/export/companies${queryString}`, { headers: this.getAuthHeaders() });
  }

  async exportUsers(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/export/users${queryString}`, { headers: this.getAuthHeaders() });
  }

  async exportEditorials(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/export/editorials${queryString}`, { headers: this.getAuthHeaders() });
  }

  async exportAnalytics(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/export/analytics${queryString}`, { headers: this.getAuthHeaders() });
  }

  // File management
  async getFiles(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return get<any>(`/files${queryString}`, { headers: this.getAuthHeaders() });
  }

  async getFileById(id: string) {
    return get<any>(`/files/${id}`, { headers: this.getAuthHeaders() });
  }

  async deleteFile(id: string) {
    return del<any>(`/files/${id}`, { headers: this.getAuthHeaders() });
  }

  async updateFileMetadata(id: string, metadata: any) {
    return put<any>(`/files/${id}/metadata`, { metadata }, { headers: this.getAuthHeaders() });
  }

  // Upload multiple files
  async uploadMultipleFiles(files: FileList) {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/files/upload-multiple`, {
      method: 'POST',
      headers: this.getAuthHeaders(false),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Upload specific file types
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/files/upload-avatar`, {
      method: 'POST',
      headers: this.getAuthHeaders(false),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Avatar upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/files/upload-logo`, {
      method: 'POST',
      headers: this.getAuthHeaders(false),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Logo upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('document', file);

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/files/upload-document`, {
      method: 'POST',
      headers: this.getAuthHeaders(false),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Document upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async uploadDataFile(file: File) {
    const formData = new FormData();
    formData.append('data', file);

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/files/upload-data`, {
      method: 'POST',
      headers: this.getAuthHeaders(false),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Data file upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Batch upload for editorials
  async batchUploadEditorials(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/editorials/batch-upload`, {
      method: 'POST',
      headers: this.getAuthHeaders(false),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Batch upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Download template for batch upload
  async downloadEditorialTemplate() {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/editorials/template`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Template download failed: ${response.statusText}`);
    }

    return response.blob();
  }
}

// Export singleton instance
export const apiService = new ApiService();
