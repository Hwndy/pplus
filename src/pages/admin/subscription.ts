import type { BadgeProps } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';
import type { CompanyMonitoring, User } from '@/types/api';

/**
 * Client monitoring periods ("subscriptions"). The backend stores the period as
 * UTC timestamps (start of the "From" day, end of the "To" day), so all
 * calendar maths here works on UTC days.
 */

const DAY_MS = 86_400_000;
/** Matches the backend default: a new period lasts 12 months. */
const DEFAULT_MONTHS = 12;
export const EXPIRING_SOON_DAYS = 30;
export const ENDING_THIS_WEEK_DAYS = 7;

export type SubscriptionStatus = 'scheduled' | 'active' | 'expiring' | 'ending' | 'expired';

export interface SubscriptionState {
  status: SubscriptionStatus;
  /** Whole days until the last day of the period (0 = ends today, negative once expired). */
  daysLeft: number | null;
  /** Whole days until the period starts (scheduled only). */
  daysToStart: number | null;
  start: Date | null;
  end: Date | null;
}

/** Midnight UTC of the given date's UTC calendar day, as a day number. */
function utcDayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / DAY_MS);
}

function parse(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** YYYY-MM-DD of a date's UTC calendar day (value for `<input type="date">`). */
function toUtcInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** `<input type="date">` value for an API period date, read as a UTC calendar day. */
export function periodDateInput(value: string | null | undefined): string {
  const date = parse(value);
  return date ? toUtcInput(date) : '';
}

/** Default period for a new monitoring: today → 12 months later minus one day. */
export function defaultPeriod(now = new Date()): { start: string; end: string } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + DEFAULT_MONTHS);
  end.setUTCDate(end.getUTCDate() - 1);
  return { start: toUtcInput(start), end: toUtcInput(end) };
}

/** Formats a period date by its UTC calendar day ("12 Mar 2026"), independent of the viewer's timezone. */
export function formatPeriodDate(date: Date | null): string {
  if (!date) return '—';
  return formatDate(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function subscriptionState(
  monitoring: Pick<CompanyMonitoring, 'monitoring_start_date' | 'monitoring_date'>,
  now = new Date(),
): SubscriptionState {
  const start = parse(monitoring.monitoring_start_date);
  const end = parse(monitoring.monitoring_date);
  const today = utcDayNumber(now);
  const daysLeft = end ? utcDayNumber(end) - today : null;
  const daysToStart = start ? utcDayNumber(start) - today : null;

  let status: SubscriptionStatus;
  if (daysToStart !== null && daysToStart > 0) status = 'scheduled';
  else if (daysLeft !== null && daysLeft < 0) status = 'expired';
  else if (daysLeft !== null && daysLeft <= ENDING_THIS_WEEK_DAYS) status = 'ending';
  else if (daysLeft !== null && daysLeft <= EXPIRING_SOON_DAYS) status = 'expiring';
  else status = 'active';

  return { status, daysLeft, daysToStart: status === 'scheduled' ? daysToStart : null, start, end };
}

/** Lower is more urgent. */
const URGENCY: Record<SubscriptionStatus, number> = { ending: 0, expiring: 1, expired: 2, active: 3, scheduled: 4 };

export const SUBSCRIPTION_VARIANT: Record<SubscriptionStatus, NonNullable<BadgeProps['variant']>> = {
  ending: 'danger',
  expiring: 'warning',
  expired: 'destructive',
  active: 'success',
  scheduled: 'muted',
};

function inDays(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

export function subscriptionLabel(state: SubscriptionState): string {
  switch (state.status) {
    case 'scheduled':
      return state.daysToStart !== null ? `Starts ${inDays(state.daysToStart)}` : 'Scheduled';
    case 'expired':
      return `Expired ${formatPeriodDate(state.end)}`;
    case 'ending':
    case 'expiring':
      return `Ends ${inDays(state.daysLeft ?? 0)}`;
    default:
      return `Active until ${formatPeriodDate(state.end)}`;
  }
}

export interface MonitoringSubscription {
  monitoring: CompanyMonitoring;
  state: SubscriptionState;
}

function byUrgency(a: MonitoringSubscription, b: MonitoringSubscription): number {
  const diff = URGENCY[a.state.status] - URGENCY[b.state.status];
  if (diff !== 0) return diff;
  const aDays = a.state.daysLeft ?? Number.POSITIVE_INFINITY;
  const bDays = b.state.daysLeft ?? Number.POSITIVE_INFINITY;
  // Expired: most recently expired first; otherwise soonest end first.
  return a.state.status === 'expired' ? bDays - aDays : aDays - bDays;
}

/** Every monitoring of a user with its state, most urgent first. */
export function userSubscriptions(user: Pick<User, 'company_monitorings'>, now = new Date()): MonitoringSubscription[] {
  return (user.company_monitorings ?? [])
    .map((monitoring) => ({ monitoring, state: subscriptionState(monitoring, now) }))
    .sort(byUrgency);
}
