import { format, isValid, parseISO } from 'date-fns';

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : parseISO(value);
  return isValid(date) ? date : null;
}

/** 12 Mar 2025 */
export function formatDate(value: string | Date | null | undefined, fallback = '—'): string {
  const date = toDate(value);
  return date ? format(date, 'd MMM yyyy') : fallback;
}

/** 12 Mar 2025, 14:05 */
export function formatDateTime(value: string | Date | null | undefined, fallback = '—'): string {
  const date = toDate(value);
  return date ? format(date, 'd MMM yyyy, HH:mm') : fallback;
}

/** Value for <input type="date"> (YYYY-MM-DD) from an API date. */
export function toDateInput(value: string | Date | null | undefined): string {
  const date = toDate(value);
  return date ? format(date, 'yyyy-MM-dd') : '';
}

/** Current month as YYYY-MM. */
export function currentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

export function formatNumber(value: number | string | null | undefined, fallback = '—'): string {
  if (value === null || value === undefined || value === '') return fallback;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? new Intl.NumberFormat('en-GB').format(n) : String(value);
}

export function formatPercent(value: number | string | null | undefined, digits = 1): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isFinite(n) ? `${n.toFixed(digits)}%` : String(value);
}

/** "social_media_type" → "Social media type" */
export function humanize(value: string | null | undefined): string {
  if (!value) return '';
  const text = value.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim().toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}
