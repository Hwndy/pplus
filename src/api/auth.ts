import { api, request } from '@/lib/api-client';
import type { User } from '@/types/api';

export interface LoginResult {
  token: string;
  user: { id: string; username: string; email: string; role: string; requires_password_change: boolean };
}

export const authApi = {
  login: (email: string, password: string) => api.post<LoginResult>('/auth/login', { email, password }),
  logout: () => api.post<null>('/auth/logout'),
  me: () => api.get<User>('/auth/me'),
  forgotPassword: (email: string) => request<null>({ method: 'POST', url: '/auth/forgot-password', data: { email } }),
  verifyResetToken: (token: string) => api.get<{ email: string }>('/auth/verify-reset-token', { token }),
  resetPassword: (token: string, newPassword: string) =>
    api.post<null>('/auth/reset-password', { token, new_password: newPassword, confirm_password: newPassword }),
  firstTimePasswordChange: (email: string, currentPassword: string, newPassword: string) =>
    api.post<null>('/auth/first-time-password-change', {
      email,
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: newPassword,
    }),
};
