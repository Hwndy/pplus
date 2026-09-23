import { MENTION_CATEGORIES, type DailyMention, type MentionCategory, type MentionSentiment } from '@/types/api';

export const DAILY_MENTIONS_PATH = '/dashboard/daily-mentions';

export const MENTION_SECTIONS: { key: MentionCategory; label: string; description: string }[] = [
  { key: 'industry', label: 'Industry', description: 'Coverage of the wider industry.' },
  { key: 'competitors', label: 'Competitors', description: 'Coverage of competing companies.' },
  { key: 'subsidiaries', label: 'Subsidiaries', description: 'Coverage of the company’s subsidiaries.' },
  { key: 'passive', label: 'Passive', description: 'Stories that mention the company in passing.' },
  { key: 'advert', label: 'Advert', description: 'Adverts placed by the company.' },
];

export const MENTION_SENTIMENT_OPTIONS: { value: MentionSentiment; label: string }[] = [
  { value: 'positive', label: 'Positive' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
];

export function mentionCount(row: Pick<DailyMention, MentionCategory>): number {
  return MENTION_CATEGORIES.reduce((sum, c) => sum + (row[c]?.length ?? 0), 0);
}

/** Splits a "one link per line" text into trimmed, non-empty lines. */
export function splitUrls(text: string | undefined): string[] {
  return (text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
