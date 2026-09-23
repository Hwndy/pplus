import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/Cards';
import { DetailGrid, ReviewNotes } from '@/components/common/Detail';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DownloadButton } from '@/components/common/DownloadButton';
import { downloadDailyMentionDocument, getContent } from '@/api/content';
import { ApiError } from '@/lib/api-client';
import { formatDate, formatNumber } from '@/lib/format';
import type { MentionItem } from '@/types/api';
import { DAILY_MENTIONS_PATH, MENTION_SECTIONS, isHttpUrl, mentionCount } from './DailyMentionCategories';
import { useContentPermissions } from './useContentPermissions';

function MentionCard({ item }: { item: MentionItem }) {
  const meta = [
    item.source,
    item.reporter ? `By ${item.reporter}` : null,
    item.page !== null && item.page !== undefined && item.page !== '' ? `Page ${item.page}` : null,
    item.publication_date ? formatDate(item.publication_date) : null,
  ].filter(Boolean);
  const urls = item.urls ?? [];
  return (
    <article className="space-y-2 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-words text-sm font-semibold">{item.headline || 'Untitled mention'}</h3>
        <StatusBadge status={item.sentiment} className="shrink-0" />
      </div>
      {meta.length > 0 && <p className="text-xs text-muted-foreground">{meta.join(' · ')}</p>}
      {item.content && <p className="whitespace-pre-line text-sm">{item.content}</p>}
      {urls.length > 0 && (
        <ul className="space-y-1">
          {urls.map((url) => (
            <li key={url} className="min-w-0">
              {isHttpUrl(url) ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{url}</span>
                </a>
              ) : (
                <span className="break-all text-sm text-muted-foreground">{url}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function DailyMentionDetailPage() {
  const { id } = useParams();
  const recordId = Number(id);
  const validId = Number.isInteger(recordId) && recordId > 0;
  const perms = useContentPermissions();

  const record = useQuery({
    queryKey: ['content', 'dailyMentions', 'detail', recordId],
    queryFn: () => getContent('dailyMentions', recordId),
    enabled: validId,
  });

  const backAction = (
    <Button variant="outline" asChild>
      <Link to={DAILY_MENTIONS_PATH}><ArrowLeft /> Back to daily mentions</Link>
    </Button>
  );

  if (!validId || (record.error instanceof ApiError && record.error.status === 404)) {
    return (
      <>
        <PageHeader title="Daily mention" actions={backAction} />
        <EmptyState title="Daily mention not found" description="It may have been deleted or the link is incorrect." action={backAction} />
      </>
    );
  }
  if (record.error) {
    return (
      <>
        <PageHeader title="Daily mention" actions={backAction} />
        <ErrorState error={record.error} onRetry={() => record.refetch()} />
      </>
    );
  }
  if (!record.data) {
    return (
      <>
        <PageHeader title="Daily mention" actions={backAction} />
        <LoadingState />
      </>
    );
  }

  const mention = record.data;
  const total = mentionCount(mention);
  const sections = MENTION_SECTIONS.filter((s) => (mention[s.key] ?? []).length > 0);

  return (
    <>
      <PageHeader
        title={`${mention.company?.company_name ?? 'Daily mention'} — ${formatDate(mention.date)}`}
        description={mention.publication ? `Publication: ${mention.publication}` : undefined}
        actions={(
          <>
            {backAction}
            {perms.canEdit(mention) && (
              <Button asChild><Link to={`${DAILY_MENTIONS_PATH}/${mention.id}/edit`}><Pencil /> Edit</Link></Button>
            )}
          </>
        )}
      />
      <div className="space-y-6">
        <SectionCard title="Overview">
          <div className="space-y-6">
            <DetailGrid
              className="lg:grid-cols-4"
              items={[
                { label: 'Status', value: <StatusBadge status={mention.status} /> },
                { label: 'Company', value: mention.company?.company_name },
                { label: 'Publication', value: mention.publication },
                { label: 'Date', value: formatDate(mention.date, '') },
                { label: 'Mentions', value: formatNumber(total) },
                { label: 'Submitted by', value: mention.creator_data?.username },
                { label: 'Submitted on', value: formatDate(mention.createdAt, '') },
                { label: 'Reviewed by', value: mention.approver_data?.username },
                { label: 'Reviewed on', value: formatDate(mention.reviewed_at, '') },
                {
                  label: 'Attachment',
                  value: mention.original_name ? (
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="break-all">{mention.original_name}</span>
                      <DownloadButton size="sm" variant="outline" onDownload={() => downloadDailyMentionDocument(mention.id)}>Download</DownloadButton>
                    </span>
                  ) : null,
                },
              ]}
            />
            <ReviewNotes analystNote={mention.analyst_note} supervisorNote={mention.supervisor_note} />
          </div>
        </SectionCard>

        {sections.length === 0 ? (
          <SectionCard title="Mentions">
            <EmptyState
              title="No mentions recorded"
              description={mention.original_name ? 'This daily mention was submitted as an attached document.' : undefined}
            />
          </SectionCard>
        ) : sections.map((section) => {
          const items = mention[section.key] ?? [];
          return (
            <SectionCard
              key={section.key}
              title={section.label}
              description={`${items.length} ${items.length === 1 ? 'mention' : 'mentions'}. ${section.description}`}
            >
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {items.map((item, i) => <MentionCard key={`${i}-${item.headline ?? ''}`} item={item} />)}
              </div>
            </SectionCard>
          );
        })}
      </div>
    </>
  );
}
