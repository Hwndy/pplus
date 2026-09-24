/** Small, pure helpers shared by the client report pages. */
import type { WeeklyVolumeTrend } from '@/types/reports';

/** Report percentages arrive as `toFixed` strings or `0`; normalise them to numbers. */
export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** Share of `part` in `total` as a percentage (0 when the total is 0). */
export function shareOf(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0;
}

/** Whole-number percentage label, as in the printed report ("14%"); "<1%" for tiny shares. */
export function percentLabel(value: number): string {
  if (value > 0 && value < 1) return '<1%';
  return `${Math.round(value)}%`;
}

/** 172000 → "172K" (the full figure goes in a tooltip). */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

/** "Aliko Dangote" → "AD" */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return `${first}${last}`.toUpperCase();
}

/** Only http(s) links are rendered as anchors. */
export function isWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Case- and spacing-insensitive comparison key for labels typed by analysts. */
export function labelKey(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Distinct values in first-seen order, ignoring blanks. */
export function uniqueValues(values: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  for (const v of values) {
    const trimmed = v?.trim();
    if (trimmed) seen.add(trimmed);
  }
  return Array.from(seen);
}

/** Group items under a key while preserving the order in which keys first appear. */
export function groupBy<T>(items: T[], keyOf: (item: T) => string): { key: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }
  return Array.from(groups, ([key, list]) => ({ key, items: list }));
}

/** Newest first; undated entries last. */
export function byDateDesc<T extends { date: string | null }>(a: T, b: T): number {
  if (!a.date) return b.date ? 1 : 0;
  if (!b.date) return -1;
  return b.date.localeCompare(a.date);
}

/** Print and online weekly counts side by side, in the chronological order the API returns. */
export function mergeWeekly(trend: WeeklyVolumeTrend): { week: string; print: number; online: number }[] {
  const weeks = new Map<string, { week: string; print: number; online: number }>();
  for (const p of trend.print.weekly_breakdown) weeks.set(p.week, { week: p.week, print: p.count, online: 0 });
  for (const p of trend.online.weekly_breakdown) {
    weeks.set(p.week, { ...(weeks.get(p.week) ?? { week: p.week, print: 0 }), online: p.count });
  }
  return Array.from(weeks.values());
}

/** Print and online weekly shares (% of each medium's stories in the period), per week. */
export function mergeWeeklyPercent(trend: WeeklyVolumeTrend): { week: string; print: number; online: number }[] {
  const weeks = new Map<string, { week: string; print: number; online: number }>();
  for (const p of trend.print.weekly_breakdown) weeks.set(p.week, { week: p.week, print: toNumber(p.percentage), online: 0 });
  for (const p of trend.online.weekly_breakdown) {
    weeks.set(p.week, { ...(weeks.get(p.week) ?? { week: p.week, print: 0 }), online: toNumber(p.percentage) });
  }
  return Array.from(weeks.values());
}

/** Empty-state wording used by the printed report for a competitive metric with no stories. */
export function noMetricCoverage(metric: string): string {
  return `There was no competitive metric coverage on ${metric} for the period under review.`;
}
