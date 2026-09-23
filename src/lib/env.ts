/**
 * Runtime configuration. The frontend has no environment variables: the API
 * address is fixed here, so every build talks to the production backend.
 */
export const env = {
  apiBaseUrl: 'https://pplus-backend.onrender.com/api/v1',
  appName: 'P+ Media Analytics',
} as const;
