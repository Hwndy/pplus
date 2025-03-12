import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth Services
export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password })
};

// User Services
export const userService = {
    getUsers: () => api.get('/users'),
    createUser: (userData) => api.post('/users', userData),
    updateUser: (id, userData) => api.put(`/users/${id}`, userData),
    deleteUser: (id) => api.delete(`/users/${id}`)
};

// Analytics Services
export const analyticsService = {
    getMetrics: (dateRange) => api.get('/analytics/metrics', { params: dateRange }),
    getEngagementData: (dateRange) => api.get('/analytics/engagement', { params: dateRange }),
    getSentimentData: (dateRange) => api.get('/analytics/sentiment', { params: dateRange }),
    getMediaDistribution: (dateRange) => api.get('/analytics/media-distribution', { params: dateRange })
};

// Data Entry Services
export const dataEntryService = {
    createEntry: (data) => api.post('/entries', data),
    getEntries: (filters) => api.get('/entries', { params: filters }),
    updateEntry: (id, data) => api.put(`/entries/${id}`, data),
    deleteEntry: (id) => api.delete(`/entries/${id}`)
};

// Review Services
export const reviewService = {
    getPendingReviews: () => api.get('/reviews/pending'),
    approveEntry: (id, comment) => api.post(`/reviews/${id}/approve`, { comment }),
    rejectEntry: (id, comment) => api.post(`/reviews/${id}/reject`, { comment })
};

export default api;