import { useSyncExternalStore } from 'react';
import { currentMonth } from '@/lib/format';

export type PeriodMode = 'month' | 'range';

export interface ReportPeriodState {
  mode: PeriodMode;
  /** YYYY-MM, used in month mode. */
  month: string;
  /** Applied custom range (YYYY-MM-DD), used in range mode. */
  range: { start: string; end: string };
}

const STORAGE_KEY = 'pplus.reportPeriod';
const listeners = new Set<() => void>();

function initial(): ReportPeriodState {
  const fallback: ReportPeriodState = { mode: 'month', month: currentMonth(), range: { start: '', end: '' } };
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<ReportPeriodState> | null;
    if (!saved) return fallback;
    return {
      mode: saved.mode === 'range' ? 'range' : 'month',
      month: typeof saved.month === 'string' && /^\d{4}-\d{2}$/.test(saved.month) ? saved.month : fallback.month,
      range: { start: saved.range?.start ?? '', end: saved.range?.end ?? '' },
    };
  } catch {
    return fallback;
  }
}

let state = initial();

function setState(patch: Partial<ReportPeriodState>) {
  state = { ...state, ...patch };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode); the period still applies for this page load.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * The report period is shared by every client report page and kept for the
 * browser session, so switching between reports keeps the chosen month or range.
 */
export function useReportPeriod() {
  const period = useSyncExternalStore(subscribe, () => state);
  return {
    ...period,
    setMode: (mode: PeriodMode) => setState({ mode }),
    setMonth: (month: string) => setState({ month }),
    applyRange: (range: { start: string; end: string }) => setState({ range }),
  };
}
