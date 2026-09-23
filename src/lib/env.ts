/**
 * Runtime configuration. Everything that differs between environments comes
 * from Vite env variables (see `.env.example`); nothing is hard-coded in code.
 */
function normaliseBaseUrl(url: string | undefined): string {
  const fallback = '/api/v1';
  if (!url || !url.trim()) return fallback;
  return url.trim().replace(/\/+$/, '');
}

export const env = {
  apiBaseUrl: normaliseBaseUrl(import.meta.env.VITE_API_BASE_URL),
  appName: import.meta.env.VITE_APP_NAME || 'P+ Media Analytics',
} as const;
