import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormDialog } from '@/components/common/FormDialog';
import { ComboboxField, SelectField, TextField, TextareaField } from '@/components/common/FormFields';
import { DetailGrid, DetailSection, ReviewNotes } from '@/components/common/Detail';
import { useCompanies } from '@/hooks/useLookups';
import { createContent, updateContent } from '@/api/content';
import { formatDate, formatNumber, humanize, toDateInput } from '@/lib/format';
import { getErrorMessage } from '@/lib/api-client';
import type { SocialMediaMention, SocialMetrics, SocialPlatform } from '@/types/api';
import { ContentListPage } from './ContentListPage';
import { useContentPermissions } from './useContentPermissions';
import { useCreateFromQuery } from './useCreateFromQuery';

const PLATFORM_OPTIONS: { value: SocialPlatform; label: string }[] = [
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'X', label: 'X' },
];

const METRIC_KEYS = ['page_likes', 'monthly_posts', 'average_likes', 'average_comments', 'posts', 'followers', 'following'] as const;
type MetricKey = (typeof METRIC_KEYS)[number];

/** Metrics the client reports read for each platform. */
const PLATFORM_METRICS: Record<SocialPlatform, { key: MetricKey; label: string }[]> = {
  Facebook: [
    { key: 'page_likes', label: 'Page likes' },
    { key: 'monthly_posts', label: 'Monthly posts' },
    { key: 'average_likes', label: 'Average likes' },
    { key: 'average_comments', label: 'Average comments' },
  ],
  Instagram: [
    { key: 'posts', label: 'Posts' },
    { key: 'followers', label: 'Followers' },
    { key: 'following', label: 'Following' },
  ],
  X: [
    { key: 'posts', label: 'Posts' },
    { key: 'followers', label: 'Followers' },
    { key: 'following', label: 'Following' },
  ],
};

const metric = z.number({ invalid_type_error: 'Enter a number' }).min(0, 'Must be 0 or more').nullable().optional();

const schema = z.object({
  company_id: z.number({ required_error: 'Select a company' }),
  date: z.string().min(1, 'Select a date'),
  social_media_type: z.enum(['Facebook', 'Instagram', 'X'], { required_error: 'Select a platform' }),
  ...Object.fromEntries(METRIC_KEYS.map((k) => [k, metric])) as Record<MetricKey, typeof metric>,
  analyst_note: z.string().optional(),
}).superRefine((values, ctx) => {
  const fields = PLATFORM_METRICS[values.social_media_type] ?? [];
  if (fields.length > 0 && fields.every((f) => values[f.key] === null || values[f.key] === undefined)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [fields[0].key], message: 'Enter at least one metric' });
  }
});
type Values = z.infer<typeof schema>;

const emptyValues = (): Values => ({
  company_id: undefined as unknown as number,
  date: '',
  social_media_type: undefined as unknown as SocialPlatform,
  ...Object.fromEntries(METRIC_KEYS.map((k) => [k, null])) as Record<MetricKey, null>,
  analyst_note: '',
});

function toNumber(value: SocialMetrics[string] | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Headline figure for the list: page likes on Facebook, followers elsewhere. */
function keyMetric(row: SocialMediaMention): string {
  const m = row.metrics?.[0];
  if (!m) return '—';
  const [key, label] = row.social_media_type === 'Facebook' ? ['page_likes', 'page likes'] : ['followers', 'followers'];
  const value = toNumber(m[key]);
  return value === null ? '—' : `${formatNumber(value)} ${label}`;
}

function SocialFormDialog({ open, onOpenChange, record }: {
  open: boolean; onOpenChange: (open: boolean) => void; record: SocialMediaMention | null;
}) {
  const queryClient = useQueryClient();
  const companies = useCompanies();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: emptyValues() });
  const platform = useWatch({ control: form.control, name: 'social_media_type' });

  useEffect(() => {
    if (!open) return;
    if (!record) {
      form.reset(emptyValues());
      return;
    }
    const m = record.metrics?.[0] ?? {};
    form.reset({
      company_id: record.company_id,
      date: toDateInput(record.date),
      social_media_type: record.social_media_type,
      ...Object.fromEntries(METRIC_KEYS.map((k) => [k, toNumber(m[k])])) as Record<MetricKey, number | null>,
      analyst_note: record.analyst_note ?? '',
    });
  }, [open, record, form]);

  async function onSubmit(values: Values) {
    const metrics = Object.fromEntries(PLATFORM_METRICS[values.social_media_type].map((f) => [f.key, values[f.key] ?? null]));
    const payload = {
      company_id: values.company_id,
      date: values.date,
      social_media_type: values.social_media_type,
      metrics: [metrics],
      analyst_note: values.analyst_note?.trim() || null,
    };
    try {
      if (record) await updateContent('socialMedia', record.id, payload);
      else await createContent('socialMedia', payload);
      toast.success(record ? 'Social media mention updated and resubmitted for review' : 'Social media mention submitted for review');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['content', 'socialMedia'] }),
        queryClient.invalidateQueries({ queryKey: ['review'] }),
      ]);
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={record ? 'Edit social media mention' : 'New social media mention'}
      description="Saving sends the metrics to your supervisor for review."
      form={form}
      onSubmit={onSubmit}
      submitLabel={record ? 'Save and resubmit' : 'Submit for review'}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <ComboboxField control={form.control} name="company_id" label="Company" required numeric loading={companies.isLoading}
          options={(companies.data ?? []).map((c) => ({ value: String(c.id), label: c.company_name }))} />
        <TextField control={form.control} name="date" label="Date" type="date" required />
        <SelectField control={form.control} name="social_media_type" label="Platform" required options={PLATFORM_OPTIONS} />
      </div>
      {platform ? (
        <fieldset className="space-y-3 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">{platform} metrics</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {PLATFORM_METRICS[platform].map((f) => (
              <TextField key={f.key} control={form.control} name={f.key} label={f.label} type="number" />
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Select a platform to enter its metrics.</p>
      )}
      <TextareaField control={form.control} name="analyst_note" label="Note for your supervisor" />
    </FormDialog>
  );
}

export default function SocialMediaMentionsPage() {
  const perms = useContentPermissions();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SocialMediaMention | null>(null);
  const openCreate = () => { setEditing(null); setFormOpen(true); };
  useCreateFromQuery(perms.canCreate, openCreate);

  return (
    <>
      <ContentListPage
        resource="socialMedia"
        title="Social media"
        description="Social media performance figures recorded for monitored companies."
        showSearch
        searchPlaceholder="Search by company or note"
        columns={[
          { key: 'company', header: 'Company', cell: (r) => <span className="font-medium">{r.company_data?.company_name ?? '—'}</span> },
          { key: 'platform', header: 'Platform', cell: (r) => r.social_media_type },
          { key: 'date', header: 'Date', cell: (r) => formatDate(r.date) },
          { key: 'metric', header: 'Key metric', align: 'right', cell: keyMetric },
        ]}
        createAction={<Button onClick={openCreate}><Plus /> New social media mention</Button>}
        onEdit={(r) => { setEditing(r); setFormOpen(true); }}
        rowTitle={(r) => `${r.company_data?.company_name ?? 'Social media'} — ${r.social_media_type}, ${formatDate(r.date)}`}
        renderDetail={(r) => (
          <div className="space-y-6">
            <DetailGrid items={[
              { label: 'Company', value: r.company_data?.company_name },
              { label: 'Platform', value: r.social_media_type },
              { label: 'Date', value: formatDate(r.date) },
              { label: 'Reviewed by', value: r.approver_data?.username },
              { label: 'Reviewed on', value: formatDate(r.reviewed_at, '') },
            ]}
            />
            {(r.metrics ?? []).map((m, i, all) => (
              <DetailSection key={i} title={all.length > 1 ? `Metrics (${i + 1})` : 'Metrics'}>
                <DetailGrid items={Object.entries(m).map(([key, value]) => ({
                  label: PLATFORM_METRICS[r.social_media_type]?.find((f) => f.key === key)?.label ?? humanize(key),
                  value: formatNumber(value, ''),
                }))}
                />
              </DetailSection>
            ))}
            <ReviewNotes analystNote={r.analyst_note} supervisorNote={r.supervisor_note} />
          </div>
        )}
      />
      <SocialFormDialog open={formOpen} onOpenChange={setFormOpen} record={editing} />
    </>
  );
}
