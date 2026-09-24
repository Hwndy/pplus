import { api, requestData } from '@/lib/api-client';
import type { User } from '@/types/api';

/** What the user types to confirm that their account should be deleted. */
export const DELETE_CONFIRMATION = 'DELETE';

/** Self-service account management for the signed-in user. */
export const profileApi = {
  get: () => api.get<User>('/profile'),
  updateUsername: (username: string) => api.put<User>('/profile', { username }),
  /** Returns a new session token: older sessions stop working after a password change. */
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<{ token: string }>('/profile/password', {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: newPassword,
    }),
  deleteAccount: (password: string, confirmation: string) =>
    requestData<null>({ method: 'DELETE', url: '/profile', data: { password, confirmation } }),
};
