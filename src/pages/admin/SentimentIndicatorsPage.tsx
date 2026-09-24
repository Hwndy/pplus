import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type Column } from '@/components/common/DataTable';
import { FilterBar, FilterSelect, SearchInput } from '@/components/common/Filters';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { FormDialog } from '@/components/common/FormDialog';
import { SelectField, TextField } from '@/components/common/FormFields';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
import { lookupKeys } from '@/hooks/useLookups';
import { sentimentIndicatorsApi, type SentimentIndicatorInput } from '@/api/reference';
import { ApiError, getErrorMessage } from '@/lib/api-client';
import { formatNumber } from '@/lib/format';
import type { SentimentKeywordIndicator } from '@/types/api';

const PAGE_SIZE = 20;
const QUERY_KEY = ['sentiment-indicators'] as const;

const CLASSIFICATIONS = ['Positive', 'Neutral', 'Negative'] as const;
const CLASSIFICATION_OPTIONS = CLASSIFICATIONS.map((c) => ({ value: c, label: c }));

/** Maps stored values such as "positive" onto the option list. */
function normaliseClassification(value: string | null | undefined): string {
  return CLASSIFICATIONS.find((c) => c.toLowerCase() === (value ?? '').trim().toLowerCase()) ?? '';
}

const schema = z.object({
  keyword_indicator: z.string().trim().min(1, 'Enter a keyword').max(255, 'At most 255 characters'),
  sentiment_score: z.number({ required_error: 'Enter a score', invalid_type_error: 'Enter a number' }),
  classification: z.string().min(1, 'Select a classification'),
});
type Values = z.infer<typeof schema>;

function toValues(indicator: SentimentKeywordIndicator | null): Values {
  return {
    keyword_indicator: indicator?.keyword_indicator ?? '',
    sentiment_score: indicator ? Number(indicator.sentiment_score) : (undefined as unknown as number),
    classification: normaliseClassification(indicator?.classification),
  };
}

function IndicatorFormDialog({ open, onOpenChange, indicator, onSaved }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  indicator: SentimentKeywordIndicator | null;
  onSaved: () => void;
}) {
  const isEdit = Boolean(indicator);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(indicator) });

  useEffect(() => {
    if (open) form.reset(toValues(indicator));
  }, [open, indicator, form]);

  async function onSubmit(values: Values) {
    const input: SentimentIndicatorInput = values;
    try {
      if (indicator) await sentimentIndicatorsApi.update(indicator.id, input);
      else await sentimentIndicatorsApi.create(input);
      onSaved();
      onOpenChange(false);
    } catch (error) {
      const message = getErrorMessage(error);
      if (error instanceof ApiError) {
        error.fieldErrors.forEach((f) => {
          if (f.field && f.field in values) form.setError(f.field as keyof Values, { message: f.message });
        });
        if (error.status === 409) form.setError('keyword_indicator', { message });
      }
      toast.error(message);
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit indicator' : 'Add indicator'}
      description="Keywords used to score the sentiment of media coverage."
      form={form}
      onSubmit={onSubmit}
      submitLabel={isEdit ? 'Save changes' : 'Create indicator'}
    >
      <TextField control={form.control} name="keyword_indicator" label="Keyword" required />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          control={form.control}
          name="sentiment_score"
          label="Sentiment score"
          type="number"
          required
          description="Negative values indicate negative sentiment."
        />
        <SelectField control={form.control} name="classification" label="Classification" required options={CLASSIFICATION_OPTIONS} />
      </div>
    </FormDialog>
  );
}

export default function SentimentIndicatorsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [classification, setClassification] = useState('');
  const [editing, setEditing] = useState<SentimentKeywordIndicator | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<SentimentKeywordIndicator | null>(null);

  const indicators = useQuery({ queryKey: QUERY_KEY, queryFn: sentimentIndicatorsApi.all });
  const invalidateKeys = [QUERY_KEY, lookupKeys.indicators];

  const remove = useMutationWithToast({
    mutationFn: (i: SentimentKeywordIndicator) => sentimentIndicatorsApi.remove(i.id),
    successMessage: (_, i) => `"${i.keyword_indicator}" was deleted`,
    invalidate: invalidateKeys,
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (indicators.data ?? [])
      .filter((i) => !term || i.keyword_indicator.toLowerCase().includes(term))
      .filter((i) => !classification || normaliseClassification(i.classification) === classification)
      .sort((a, b) => a.keyword_indicator.localeCompare(b.keyword_indicator));
  }, [indicators.data, search, classification]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = indicators.data ? filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) : undefined;
  const pagination = { total: filtered.length, page: currentPage, limit: PAGE_SIZE, totalPages };

  function openForm(indicator: SentimentKeywordIndicator | null) {
    setEditing(indicator);
    setFormOpen(true);
  }

  const columns: Column<SentimentKeywordIndicator>[] = [
    { key: 'keyword', header: 'Keyword', cell: (i) => <span className="font-medium">{i.keyword_indicator}</span> },
    { key: 'classification', header: 'Classification', cell: (i) => <StatusBadge status={i.classification} /> },
    { key: 'score', header: 'Score', align: 'right', cell: (i) => formatNumber(i.sentiment_score) },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (i) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Actions for ${i.keyword_indicator}`}><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => openForm(i)}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setDeleting(i)} className="text-destructive focus:text-destructive">
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const hasFilters = Boolean(search || classification);

  return (
    <>
      <PageHeader
        title="Sentiment Indicators"
        description="Keywords and scores used to classify the sentiment of coverage."
        actions={<Button onClick={() => openForm(null)}><Plus /> Add indicator</Button>}
      />
      <FilterBar onReset={hasFilters ? () => { setSearch(''); setClassification(''); setPage(1); } : undefined}>
        <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search keywords" />
        <FilterSelect
          label="Classification"
          value={classification}
          onChange={(value) => { setClassification(value); setPage(1); }}
          options={CLASSIFICATION_OPTIONS}
          allLabel="All classifications"
        />
      </FilterBar>
      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(i) => i.id}
        isLoading={indicators.isLoading}
        error={indicators.error}
        onRetry={() => indicators.refetch()}
        pagination={pagination}
        onPageChange={setPage}
        emptyTitle="No indicators found"
        emptyDescription={hasFilters ? 'Try adjusting your filters.' : 'Add the first keyword indicator to get started.'}
      />
      <IndicatorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        indicator={editing}
        onSaved={() => {
          toast.success(editing ? 'Indicator updated' : 'Indicator created');
          invalidateKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete indicator?"
        description={deleting ? `"${deleting.keyword_indicator}" will no longer be used to score sentiment.` : ''}
        confirmLabel="Delete indicator"
        destructive
        onConfirm={() => deleting && remove.mutateAsync(deleting)}
      />
    </>
  );
}
