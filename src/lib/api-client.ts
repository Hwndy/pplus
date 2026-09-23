import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { env } from './env';

/** Shape of every JSON response from the P+ API. */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string | FieldError[];
  errors?: unknown;
}

export interface FieldError {
  field: string | null;
  message: string;
}

/** Normalised error thrown by every API call. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldError[];
  readonly data: unknown;

  constructor(message: string, status: number, fieldErrors: FieldError[] = [], data: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.data = data;
  }
}

const TOKEN_KEY = 'pplus.token';

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

/** Registered by the auth provider so an expired/revoked session logs the user out everywhere. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 60_000,
});

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<Partial<ApiEnvelope<unknown>>>;
    const status = err.response?.status ?? 0;
    const body = err.response?.data;
    if (!err.response) {
      if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        return new ApiError('The server is taking longer than expected. Refresh in a moment to check whether your change was saved before trying again.', 0);
      }
      return new ApiError('Unable to reach the server. Check your connection and try again.', 0);
    }
    const rawMessage = body?.message;
    if (Array.isArray(rawMessage)) {
      const fieldErrors = rawMessage.map((m) => (typeof m === 'string' ? { field: null, message: m } : m));
      return new ApiError(fieldErrors.map((f) => f.message).join('. '), status, fieldErrors, body?.data ?? null);
    }
    const message = typeof rawMessage === 'string' && rawMessage
      ? rawMessage
      : status >= 500
        ? 'Something went wrong on our side. Please try again.'
        : 'The request could not be completed.';
    return new ApiError(message, status, [], body?.data ?? null);
  }
  return new ApiError(error instanceof Error ? error.message : 'Unexpected error', 0);
}

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    const url = (error as AxiosError)?.config?.url ?? '';
    const isCredentialCall = url.includes('/auth/login') || url.includes('/auth/first-time-password-change');
    if (apiError.status === 401 && !isCredentialCall && onUnauthorized) onUnauthorized();
    return Promise.reject(apiError);
  }
);

/** Returns the full envelope (for endpoints whose `message` or `success` flag matters). */
export async function request<T>(config: AxiosRequestConfig): Promise<ApiEnvelope<T>> {
  const response = await http.request<ApiEnvelope<T>>(config);
  return response.data;
}

/** Returns only `data` from the envelope. */
export async function requestData<T>(config: AxiosRequestConfig): Promise<T> {
  return (await request<T>(config)).data;
}

export const api = {
  get: <T>(url: string, params?: object) => requestData<T>({ method: 'GET', url, params }),
  post: <T>(url: string, data?: unknown) => requestData<T>({ method: 'POST', url, data }),
  put: <T>(url: string, data?: unknown) => requestData<T>({ method: 'PUT', url, data }),
  patch: <T>(url: string, data?: unknown) => requestData<T>({ method: 'PATCH', url, data }),
  delete: <T>(url: string) => requestData<T>({ method: 'DELETE', url }),
  // Imports can take a while on large files; allow up to 5 minutes.
  upload: <T>(url: string, form: FormData) => requestData<T>({ method: 'POST', url, data: form, timeout: 300_000 }),
};

/** Downloads a file (CSV/JSON export) and hands it to the browser. */
export async function download(url: string, params: object, fallbackName: string): Promise<void> {
  const response = await http.get<Blob>(url, { params, responseType: 'blob' });
  const disposition = String(response.headers['content-disposition'] ?? '');
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  saveBlob(response.data, match ? decodeURIComponent(match[1]) : fallbackName);
}

/** Hands a generated file to the browser as a download. */
export function saveBlob(blob: Blob, name: string): void {
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke on the next tick so every browser has started the download.
  setTimeout(() => URL.revokeObjectURL(href), 0);
}

/** Human-readable message for any thrown value. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}
