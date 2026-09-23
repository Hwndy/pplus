import { useMemo, useState } from 'react';
import { ExternalLink, FileText, Inbox, Newspaper, ThumbsDown, ThumbsUp } from 'lucide-react';
import { SectionCard, StatCard, StatGrid } from '@/components/common/Cards';
import { DetailGrid, DetailSection } from '@/components/common/Detail';
import { FilterBar, FilterSelect } from '@/components/common/Filters';
import { EmptyState } from '@/components/common/States';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { DownloadButton } from '@/components/common/DownloadButton';
import { downloadMentionDocument } from '@/api/reports';
import { formatDate, formatNumber, humanize, toDateInput } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  REPORT_MENTION_CATEGORIES,
  type DailyMentionsReport,
  type ReportDailyMention,
  type ReportMentionCategory,
  type ReportMentionItem,
} from '@/types/reports';
import { ReportShell } from './ReportShell';
import { byDateDesc, groupBy, isWebUrl } from './reportUtils';

const CATEGORY_OPTIONS = REPORT_MENTION_CATEGORIES.map((c) => ({ value: c, label: humanize(c) }));

function itemsOf(mention: ReportDailyMention, category: ReportMentionCategory): ReportMentionItem[] {
  return mention.categories[category] ?? [];
}

function countItems(mention: ReportDailyMention, categories: readonly ReportMentionCategory[]): number {
  return categories.reduce((sum, c) => sum + itemsOf(mention, c).length, 0);
}

function MentionItemCard({ item }: { item: ReportMentionItem }) {
  const urls = (item.urls ?? []).filter(isWebUrl);
  const meta = [
    item.source,
    item.reporter ? `By ${item.reporter}` : null,
    item.page !== null && item.page !== undefined && item.page !== '' ? `Page ${item.page}` : null,
    item.publication_date ? formatDate(item.publication_date) : null,
  ].filter(Boolean);

  return (
    <article className="space-y-2 rounded-md border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="min-w-0 flex-1 text-sm font-semibold">{item.headline || 'Untitled mention'}</h4>
        {item.sentiment && <StatusBadge status={item.sentiment} />}
      </div>
      {meta.length > 0 && <p className="text-xs text-muted-foreground">{meta.join(' · ')}</p>}
      {item.content && <p className="whitespace-pre-line text-sm text-foreground">{item.content}</p>}
      {urls.length > 0 && (
        <ul className="space-y-1">
          {urls.map((url) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{url}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function MentionDetail({ mention, categories, pairId }: { mention: ReportDailyMention; categories: readonly ReportMentionCategory[]; pairId: number }) {
  const withItems = categories.filter((c) => itemsOf(mention, c).length > 0);
  return (
    <SectionCard
      title={mention.company.company_name}
      description={[mention.publication, formatDate(mention.date)].filter(Boolean).join(' · ')}
    >
      <div className="space-y-5">
        <DetailGrid
          items={[
            { label: 'Company', value: mention.company.company_name },
            { label: 'Publication', value: mention.publication },
            { label: 'Date', value: formatDate(mention.date) },
            { label: 'Articles', value: formatNumber(countItems(mention, categories)) },
          ]}
        />
        {mention.file_info && (
          <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">
              Submitted as a document: <span className="font-medium">{mention.file_info.original_name || mention.file_info.filename}</span>
            </span>
            <DownloadButton size="sm" variant="outline" onDownload={() => downloadMentionDocument(mention.id, pairId)}>Download</DownloadButton>
          </div>
        )}
        {withItems.length ? withItems.map((category) => (
          <DetailSection key={category} title={`${humanize(category)} (${itemsOf(mention, category).length})`}>
            <div className="space-y-3">
              {itemsOf(mention, category).map((item, i) => (
                <MentionItemCard key={`${category}-${i}-${item.headline ?? ''}`} item={item} />
              ))}
            </div>
          </DetailSection>
        )) : (
          <EmptyState
            title="No articles in this entry"
            description={mention.file_info ? 'The mentions for this day were submitted as a document.' : undefined}
          />
        )}
      </div>
    </SectionCard>
  );
}

function MentionsInbox({ data }: { data: DailyMentionsReport }) {
  const [companyId, setCompanyId] = useState('');
  const [category, setCategory] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const categories: readonly ReportMentionCategory[] = category
    ? [category as ReportMentionCategory]
    : REPORT_MENTION_CATEGORIES;

  const companyOptions = useMemo(() => {
    const seen = new Map<number, string>();
    for (const m of data.daily_mentions) seen.set(m.company.id, m.company.company_name);
    return Array.from(seen, ([id, name]) => ({ value: String(id), label: name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data.daily_mentions]);

  const mentions = useMemo(() => {
    const list = data.daily_mentions.filter((m) => {
      if (companyId && String(m.company.id) !== companyId) return false;
      if (category && itemsOf(m, category as ReportMentionCategory).length === 0) return false;
      return true;
    });
    return [...list].sort(byDateDesc);
  }, [data.daily_mentions, companyId, category]);

  const groups = groupBy(mentions, (m) => toDateInput(m.date) || 'undated');
  const selected = mentions.find((m) => m.id === selectedId) ?? mentions[0];

  const allItems = data.daily_mentions.flatMap((m) => REPORT_MENTION_CATEGORIES.flatMap((c) => itemsOf(m, c)));
  const positive = allItems.filter((i) => i.sentiment === 'positive').length;
  const negative = allItems.filter((i) => i.sentiment === 'negative').length;

  return (
    <div className="space-y-6">
      <StatGrid>
        <StatCard label="Daily entries" value={formatNumber(data.summary.total_mentions)} icon={Inbox} hint="Days and publications monitored" />
        <StatCard label="Articles" value={formatNumber(allItems.length)} icon={Newspaper} hint={`Across ${formatNumber(companyOptions.length)} companies`} />
        <StatCard label="Positive articles" value={formatNumber(positive)} icon={ThumbsUp} />
        <StatCard label="Negative articles" value={formatNumber(negative)} icon={ThumbsDown} />
      </StatGrid>

      <FilterBar
        className="mb-0"
        onReset={companyId || category ? () => { setCompanyId(''); setCategory(''); } : undefined}
      >
        <FilterSelect label="Company" value={companyId} onChange={setCompanyId} options={companyOptions} allLabel="All companies" className="sm:w-56" />
        <FilterSelect label="Category" value={category} onChange={setCategory} options={CATEGORY_OPTIONS} allLabel="All categories" />
      </FilterBar>

      {mentions.length === 0 ? (
        <SectionCard title="Mentions">
          <EmptyState title="No mentions match these filters" description="Try another company or category." />
        </SectionCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <SectionCard title="Inbox" description={`${formatNumber(mentions.length)} entries, newest first.`} contentClassName="px-0 pb-2">
            <div className="max-h-[70vh] overflow-y-auto">
              {groups.map((group) => (
                <section key={group.key}>
                  <h3 className="sticky top-0 z-10 border-y bg-muted px-6 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {group.key === 'undated' ? 'Undated' : formatDate(group.key)}
                  </h3>
                  <ul>
                    {group.items.map((m) => {
                      const active = selected?.id === m.id;
                      return (
                        <li key={m.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(m.id)}
                            aria-current={active ? 'true' : undefined}
                            className={cn(
                              'w-full border-b px-6 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none',
                              active && 'bg-primary/5',
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className={cn('truncate text-sm font-medium', active && 'text-primary')}>{m.company.company_name}</span>
                              <span className="shrink-0 text-xs text-muted-foreground">{formatNumber(countItems(m, categories))} articles</span>
                            </div>
                            <p className="truncate text-xs text-muted-foreground">{m.publication || 'Publication not specified'}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {categories.filter((c) => itemsOf(m, c).length > 0).map((c) => (
                                <Badge key={c} variant="muted" className="font-normal">
                                  {humanize(c)} {itemsOf(m, c).length}
                                </Badge>
                              ))}
                              {m.file_info && <Badge variant="outline" className="font-normal">Document</Badge>}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </SectionCard>
          {selected && <MentionDetail mention={selected} categories={categories} pairId={data.pair_id} />}
        </div>
      )}
    </div>
  );
}

export default function MentionsInboxPage() {
  return (
    <ReportShell<DailyMentionsReport>
      report="daily-mentions"
      title="Daily mentions"
      description="Daily press mentions of your brand and competitors"
    >
      {(data) => <MentionsInbox data={data} />}
    </ReportShell>
  );
}
