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

// API Service Class
class ApiService {
  private token: string | null = null;
  private baseUrl = 'https://p-analytics.onrender.com/api';

  constructor() {
    const storedToken = localStorage.getItem('token');
    if (storedToken && this.isTokenValid(storedToken)) {
      this.token = storedToken;
    } else {
      this.clearToken();
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

  private buildQuery(params?: Record<string, any>) {
    return params ? `?${new URLSearchParams(params)}` : '';
  }

  // AUTH
  async login(email: string, password: string) {
    return post(`${this.baseUrl}/auth/login`, { email, password });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return post(`${this.baseUrl}/auth/change-password`, { currentPassword, newPassword }, {
      headers: this.getAuthHeaders(),
    });
  }

  async logout() {
    const response = await post(`${this.baseUrl}/auth/logout`, {}, {
      headers: this.getAuthHeaders(),
    });
    this.clearToken();
    return response;
  }

  // USERS
  async getUsers(params?: Record<string, any>) {
    return get(`${this.baseUrl}/users${this.buildQuery(params)}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  async getUserById(id: string) {
    return get(`${this.baseUrl}/users/${id}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  async createUser(data: Partial<User>) {
    return post(`${this.baseUrl}/users`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  async updateUser(id: string, data: Partial<User>) {
    return put(`${this.baseUrl}/users/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  async deleteUser(id: string) {
    return del(`${this.baseUrl}/users/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  async exportUsers(params?: Record<string, any>) {
    return get(`${this.baseUrl}/export/users${this.buildQuery(params)}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  // COMPANIES
  async getCompanies(params?: Record<string, any>) {
    return get(`${this.baseUrl}/companies${this.buildQuery(params)}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  async getCompanyById(id: string) {
    return get(`${this.baseUrl}/companies/${id}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  async createCompany(data: any) {
    return post(`${this.baseUrl}/companies`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  async updateCompany(id: string, data: any) {
    return put(`${this.baseUrl}/companies/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  async deleteCompany(id: string) {
    return del(`${this.baseUrl}/companies/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  async exportCompanies(params?: Record<string, any>) {
    return get(`${this.baseUrl}/export/companies${this.buildQuery(params)}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  // PUBLICATIONS
  async getPublications(params?: Record<string, any>) {
    return get(`${this.baseUrl}/publications${this.buildQuery(params)}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  async getPublicationById(id: string) {
    return get(`${this.baseUrl}/publications/${id}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  async createPublication(data: any) {
    return post(`${this.baseUrl}/publications`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  async updatePublication(id: string, data: any) {
    return put(`${this.baseUrl}/publications/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  async deletePublication(id: string) {
    return del(`${this.baseUrl}/publications/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  async exportPublications(params?: Record<string, any>) {
    return get(`${this.baseUrl}/export/publications${this.buildQuery(params)}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  // EDITORIALS
  async getEditorials(params?: Record<string, any>) {
    return get(`${this.baseUrl}/editorials${this.buildQuery(params)}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  async getEditorialById(id: string) {
    return get(`${this.baseUrl}/editorials/${id}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  async createEditorial(data: any) {
    return post(`${this.baseUrl}/editorials`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  async updateEditorial(id: string, data: any) {
    return put(`${this.baseUrl}/editorials/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  async deleteEditorial(id: string) {
    return del(`${this.baseUrl}/editorials/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  async exportEditorials(params?: Record<string, any>) {
    return get(`${this.baseUrl}/export/editorials${this.buildQuery(params)}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  // SWOT ANALYSIS
  async getSwotAnalyses(params?: Record<string, any>) {
    return get(`${this.baseUrl}/swot-analysis${this.buildQuery(params)}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  async getSwotAnalysisById(id: string) {
    return get(`${this.baseUrl}/swot-analysis/${id}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  async createSwotAnalysis(data: any) {
    return post(`${this.baseUrl}/swot-analysis`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  async updateSwotAnalysis(id: string, data: any) {
    return put(`${this.baseUrl}/swot-analysis/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  async deleteSwotAnalysis(id: string) {
    return del(`${this.baseUrl}/swot-analysis/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // MEDIA CHANNELS
  async getMediaChannels(params?: Record<string, any>) {
    return get(`${this.baseUrl}/media-channels${this.buildQuery(params)}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  async getMediaChannelById(id: string) {
    return get(`${this.baseUrl}/media-channels/${id}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  async createMediaChannel(data: any) {
    return post(`${this.baseUrl}/media-channels`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  async updateMediaChannel(id: string, data: any) {
    return put(`${this.baseUrl}/media-channels/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  async deleteMediaChannel(id: string) {
    return del(`${this.baseUrl}/media-channels/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // ANALYTICS
  async getDashboardSummary(params?: Record<string, any>) {
    return get(`${this.baseUrl}/analytics/dashboard-summary${this.buildQuery(params)}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  async getMentionsTrend(params?: Record<string, any>) {
    return get(`${this.baseUrl}/analytics/mentions-trend${this.buildQuery(params)}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  async getSentimentAnalysis(params?: Record<string, any>) {
    return get(`${this.baseUrl}/analytics/sentiment-analysis${this.buildQuery(params)}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  async getMediaChannelAnalysis(params?: Record<string, any>) {
    return get(`${this.baseUrl}/analytics/media-channel-analysis${this.buildQuery(params)}`, {
      headers: this.getAuthHeaders(false),
    });
  }

  async getCompanyComparison(params?: Record<string, any>) {
    return get(`${this.baseUrl}/analytics/company-comparison${this.buildQuery(params)}`, {
      headers: this.getAuthHeaders(false),
    });
  }
}

export const apiService = new ApiService();
