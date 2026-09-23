import type { ContentKey, ContentTypes } from '@/api/content';
import { MENTION_CATEGORIES, type CompanyRef, type UserRef } from '@/types/api';

/** List page of each content type. */
export const CONTENT_PAGE_PATHS: Record<ContentKey, string> = {
  editorials: '/dashboard/editorials',
  dailyMentions: '/dashboard/daily-mentions',
  swot: '/dashboard/swot-analyses',
  socialMedia: '/dashboard/social-media',
  outcomeInsights: '/dashboard/outcome-insights',
  industryLandscape: '/dashboard/industry-landscape',
};

/**
 * Where "New …" goes: full-page forms have their own route; dialog-based pages
 * open their create dialog when visited with `?new=1`.
 */
export const CONTENT_NEW_PATHS: Record<ContentKey, string> = {
  editorials: '/dashboard/editorials/new',
  dailyMentions: '/dashboard/daily-mentions/new',
  swot: `${CONTENT_PAGE_PATHS.swot}?new=1`,
  socialMedia: `${CONTENT_PAGE_PATHS.socialMedia}?new=1`,
  outcomeInsights: `${CONTENT_PAGE_PATHS.outcomeInsights}?new=1`,
  industryLandscape: `${CONTENT_PAGE_PATHS.industryLandscape}?new=1`,
};

/** Sentence-case labels used for tabs and tables. */
export const CONTENT_TYPE_LABELS: Record<ContentKey, string> = {
  editorials: 'Editorials',
  dailyMentions: 'Daily mentions',
  swot: 'SWOT analyses',
  socialMedia: 'Social media',
  outcomeInsights: 'Outcome & insights',
  industryLandscape: 'Industry landscape',
};

export const CONTENT_KEYS: ContentKey[] = ['editorials', 'dailyMentions', 'swot', 'socialMedia', 'outcomeInsights', 'industryLandscape'];

export type AnyContent = ContentTypes[ContentKey];

/**
 * The same record can arrive in different shapes (editorials use a resource
 * formatter on some endpoints and raw rows on others; the company association
 * is `company` or `company_data` depending on the type).
 */
interface LooseContent {
  id: number;
  date?: string | null;
  company?: CompanyRef | null;
  company_data?: CompanyRef | null;
  title?: string | null;
  publication?: string | null;
  original_name?: string | null;
  sector?: string | null;
  social_media_type?: string | null;
  insights?: unknown[];
  creator_data?: UserRef | null;
  created_by?: UserRef | string | null;
  supervisor_note?: string | null;
  updatedAt?: string;
}

const loose = (row: AnyContent) => row as unknown as LooseContent;

export function contentCompanyName(row: AnyContent): string {
  const r = loose(row);
  return r.company?.company_name ?? r.company_data?.company_name ?? '—';
}

export function contentSubmitter(row: AnyContent): string {
  const r = loose(row);
  if (r.creator_data?.username) return r.creator_data.username;
  return typeof r.created_by === 'object' && r.created_by?.username ? r.created_by.username : '—';
}

export function contentDate(row: AnyContent): string | null {
  return loose(row).date ?? null;
}

export function contentSupervisorNote(row: AnyContent): string | null {
  return loose(row).supervisor_note ?? null;
}

export function contentUpdatedAt(row: AnyContent): string {
  return loose(row).updatedAt ?? '';
}

function mentionTotal(row: AnyContent): number {
  const r = row as unknown as Partial<Record<(typeof MENTION_CATEGORIES)[number], unknown[]>>;
  return MENTION_CATEGORIES.reduce((sum, c) => sum + (r[c]?.length ?? 0), 0);
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** One-line description of a record for mixed-type lists. */
export function contentTitle(key: ContentKey, row: AnyContent): string {
  const r = loose(row);
  switch (key) {
    case 'editorials':
      return r.title || 'Untitled editorial';
    case 'dailyMentions':
      if (r.publication) return `${r.publication} — ${plural(mentionTotal(row), 'mention')}`;
      return r.original_name ? `Document: ${r.original_name}` : plural(mentionTotal(row), 'mention');
    case 'swot':
      return 'SWOT analysis';
    case 'socialMedia':
      return r.social_media_type ? `${r.social_media_type} metrics` : 'Social media metrics';
    case 'outcomeInsights':
      return plural(r.insights?.length ?? 0, 'insight');
    case 'industryLandscape':
      return r.sector || 'Industry landscape overview';
    default:
      return '—';
  }
}

/** Page where a record can be looked at (daily mentions have their own detail page). */
export function contentViewPath(key: ContentKey, row: AnyContent): string {
  return key === 'dailyMentions' ? `${CONTENT_PAGE_PATHS.dailyMentions}/${loose(row).id}` : CONTENT_PAGE_PATHS[key];
}
