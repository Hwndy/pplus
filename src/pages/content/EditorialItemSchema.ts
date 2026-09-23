import { z } from 'zod';
import type { CompanyRef, Editorial, SentimentKeywordIndicator, UserRef } from '@/types/api';

const text = z.string().max(1000, 'Use at most 1000 characters').optional();
const count = z.number({ invalid_type_error: 'Enter a number' })
  .int('Enter a whole number')
  .min(0, 'Must be 0 or more')
  .nullable()
  .optional();

/** Fields of one editorial item (backend `editorialItemFields`). */
export const editorialItemSchema = z.object({
  title: z.string().trim().min(1, 'Enter a title').max(1000, 'Use at most 1000 characters'),
  source: text,
  online_channel: text,
  placement: text,
  reporter: text,
  spokesperson: text,
  activity: text,
  language: text,
  country: text,
  page_size: text,
  page_number: text,
  ceo_thought_leadership: text,
  print_web_clips: text,
  sentiment: text,
  sentiment_keyword_indicator_id: z.number().int().positive().nullable().optional(),
  audience_reach: count,
  advert_spend: count,
  circulation: count,
});

export type EditorialItemValues = z.infer<typeof editorialItemSchema>;

const TEXT_FIELDS = [
  'source', 'online_channel', 'placement', 'reporter', 'spokesperson', 'activity', 'language', 'country',
  'page_size', 'page_number', 'ceo_thought_leadership', 'print_web_clips', 'sentiment',
] as const;
const NUMBER_FIELDS = ['audience_reach', 'advert_spend', 'circulation'] as const;

export const SENTIMENT_OPTIONS = [
  { value: 'Positive', label: 'Positive' },
  { value: 'Neutral', label: 'Neutral' },
  { value: 'Negative', label: 'Negative' },
];

/** Stored sentiments may be lower case; the form uses the capitalised option values. */
export function normaliseSentiment(value: string | null | undefined): string {
  const match = SENTIMENT_OPTIONS.find((o) => o.value.toLowerCase() === (value ?? '').trim().toLowerCase());
  return match?.value ?? '';
}

export const emptyEditorialItem = (): EditorialItemValues => ({
  title: '',
  ...Object.fromEntries(TEXT_FIELDS.map((f) => [f, ''])),
  sentiment_keyword_indicator_id: null,
  audience_reach: null,
  advert_spend: null,
  circulation: null,
});

/** Request body for one item: trimmed text, empty values sent as null. */
export function editorialItemPayload(values: EditorialItemValues) {
  const out: Record<string, string | number | null> = { title: values.title.trim() };
  for (const field of TEXT_FIELDS) out[field] = values[field]?.trim() || null;
  for (const field of NUMBER_FIELDS) out[field] = values[field] ?? null;
  out.sentiment_keyword_indicator_id = values.sentiment_keyword_indicator_id ?? null;
  return out;
}

/**
 * Admin list and detail endpoints return the EditorialResource shape; the
 * analyst ("mine") and supervisor ("team") lists return raw rows with
 * `company_data`, `sentiment_keyword_indicator_data` and `approver_data`.
 * These helpers read either shape.
 */
interface RawEditorialExtras {
  company_id?: number | null;
  company_data?: CompanyRef | null;
  sentiment_keyword_indicator_id?: number | null;
  sentiment_keyword_indicator_data?: Pick<SentimentKeywordIndicator, 'id' | 'keyword_indicator' | 'sentiment_score' | 'classification'> | null;
  approver_data?: UserRef | null;
  approved_by?: UserRef | string | null;
}

const extras = (row: Editorial) => row as unknown as RawEditorialExtras;

export function editorialCompany(row: Editorial): CompanyRef | null {
  return row.company ?? extras(row).company_data ?? null;
}

export function editorialCompanyId(row: Editorial): number | undefined {
  return editorialCompany(row)?.id ?? extras(row).company_id ?? undefined;
}

export function editorialIndicator(row: Editorial) {
  return row.sentiment_keyword_indicator ?? extras(row).sentiment_keyword_indicator_data ?? null;
}

export function editorialIndicatorId(row: Editorial): number | null {
  return editorialIndicator(row)?.id ?? extras(row).sentiment_keyword_indicator_id ?? null;
}

export function editorialReviewer(row: Editorial): string | undefined {
  const approver = extras(row).approver_data ?? extras(row).approved_by;
  return typeof approver === 'object' && approver ? approver.username : undefined;
}

/** Form values for an existing editorial. */
export function editorialItemValues(row: Editorial): EditorialItemValues {
  return {
    title: row.title ?? '',
    source: row.source ?? '',
    online_channel: row.online_channel ?? '',
    placement: row.placement ?? '',
    reporter: row.reporter ?? '',
    spokesperson: row.spokesperson ?? '',
    activity: row.activity ?? '',
    language: row.language ?? '',
    country: row.country ?? '',
    page_size: row.page_size ?? '',
    page_number: row.page_number === null || row.page_number === undefined ? '' : String(row.page_number),
    ceo_thought_leadership: row.ceo_thought_leadership ?? '',
    print_web_clips: row.print_web_clips ?? '',
    sentiment: normaliseSentiment(row.sentiment),
    sentiment_keyword_indicator_id: editorialIndicatorId(row),
    audience_reach: row.audience_reach ?? null,
    advert_spend: row.advert_spend ?? null,
    circulation: row.circulation ?? null,
  };
}
