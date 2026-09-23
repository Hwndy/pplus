import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useFieldArray, useForm, type Control, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Form } from '@/components/ui/form';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/Cards';
import { ComboboxField, SelectField, TextField, TextareaField, toOptions } from '@/components/common/FormFields';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { useCompanies, usePublications } from '@/hooks/useLookups';
import { createContent, getContent, updateContent } from '@/api/content';
import { ApiError, getErrorMessage } from '@/lib/api-client';
import { toDateInput } from '@/lib/format';
import { MENTION_CATEGORIES, type DailyMention, type MentionCategory, type MentionItem } from '@/types/api';
import {
  DAILY_MENTIONS_PATH, MENTION_SECTIONS, MENTION_SENTIMENT_OPTIONS, isHttpUrl, splitUrls,
} from './DailyMentionCategories';
import { useContentPermissions } from './useContentPermissions';

const mentionSchema = z.object({
  headline: z.string().trim().min(1, 'Enter a headline'),
  source: z.string().optional(),
  reporter: z.string().optional(),
  page: z.string().optional(),
  publication_date: z.string().optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  content: z.string().optional(),
  urls: z.string().optional().refine(
    (text) => splitUrls(text).every(isHttpUrl),
    'Enter one full link per line, starting with http:// or https://',
  ),
});
type MentionValues = z.infer<typeof mentionSchema>;

const baseSchema = z.object({
  company_id: z.number({ required_error: 'Select a company' }),
  publication: z.string().optional(),
  date: z.string().min(1, 'Select a date'),
  industry: z.array(mentionSchema),
  competitors: z.array(mentionSchema),
  subsidiaries: z.array(mentionSchema),
  passive: z.array(mentionSchema),
  advert: z.array(mentionSchema),
  /** A record created from an uploaded document may have no typed mentions. */
  has_attachment: z.boolean(),
});
type Values = z.infer<typeof baseSchema>;

/** Adds the cross-field rules: unique headlines and, unless a document is attached, at least one mention. */
const schema = baseSchema.superRefine((values, ctx) => {
  const seen = new Set<string>();
  for (const category of MENTION_CATEGORIES) {
    values[category].forEach((item, index) => {
      const key = item.headline.trim().toLowerCase();
      if (!key) return;
      if (seen.has(key)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [category, index, 'headline'], message: 'This headline is already used in this daily mention' });
      } else {
        seen.add(key);
      }
    });
  }
  if (!values.has_attachment && MENTION_CATEGORIES.every((c) => values[c].length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['industry'], message: 'Add at least one mention to any section' });
  }
});

const emptyMention = (): MentionValues => ({
  headline: '', source: '', reporter: '', page: '', publication_date: '', sentiment: 'neutral', content: '', urls: '',
});

const emptyValues = (): Values => ({
  company_id: undefined as unknown as number,
  publication: '',
  date: '',
  industry: [],
  competitors: [],
  subsidiaries: [],
  passive: [],
  advert: [],
  has_attachment: false,
});

function toMentionValues(item: MentionItem): MentionValues {
  return {
    headline: item.headline ?? '',
    source: item.source ?? '',
    reporter: item.reporter ?? '',
    page: item.page === null || item.page === undefined ? '' : String(item.page),
    publication_date: toDateInput(item.publication_date),
    sentiment: MENTION_SENTIMENT_OPTIONS.some((o) => o.value === item.sentiment) ? item.sentiment : 'neutral',
    content: item.content ?? '',
    urls: (item.urls ?? []).join('\n'),
  };
}

function toValues(record: DailyMention): Values {
  return {
    company_id: record.company_id as number,
    publication: record.publication ?? '',
    date: toDateInput(record.date),
    ...Object.fromEntries(MENTION_CATEGORIES.map((c) => [c, (record[c] ?? []).map(toMentionValues)])) as Record<MentionCategory, MentionValues[]>,
    has_attachment: Boolean(record.original_name),
  };
}

function toPayload(values: Values) {
  const mention = (m: MentionValues) => ({
    headline: m.headline.trim(),
    source: m.source?.trim() || null,
    reporter: m.reporter?.trim() || null,
    page: m.page?.trim() || null,
    publication_date: m.publication_date || null,
    sentiment: m.sentiment,
    content: m.content?.trim() || null,
    urls: splitUrls(m.urls),
  });
  return {
    company_id: values.company_id,
    publication: values.publication?.trim() || null,
    date: values.date,
    ...Object.fromEntries(MENTION_CATEGORIES.map((c) => [c, values[c].map(mention)])),
  };
}

function MentionSection({ control, category, label, description, open, onOpenChange }: {
  control: Control<Values>;
  category: MentionCategory;
  label: string;
  description: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: category });
  const add = () => { append(emptyMention()); onOpenChange(true); };

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <SectionCard
        title={`${label} (${fields.length})`}
        description={description}
        actions={(
          <div className="flex shrink-0 items-center gap-1">
            <Button type="button" variant="outline" size="sm" onClick={add}><Plus /> Add mention</Button>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="icon" aria-label={open ? `Collapse ${label}` : `Expand ${label}`}>
                {open ? <ChevronUp /> : <ChevronDown />}
              </Button>
            </CollapsibleTrigger>
          </div>
        )}
      >
        <CollapsibleContent>
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No mentions in this section.</p>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{label} mention {index + 1}</p>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label={`Remove ${label.toLowerCase()} mention ${index + 1}`}>
                      <Trash2 />
                    </Button>
                  </div>
                  <TextField control={control} name={`${category}.${index}.headline`} label="Headline" required />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <TextField control={control} name={`${category}.${index}.source`} label="Source" />
                    <TextField control={control} name={`${category}.${index}.reporter`} label="Reporter" />
                    <TextField control={control} name={`${category}.${index}.page`} label="Page" />
                    <TextField control={control} name={`${category}.${index}.publication_date`} label="Publication date" type="date" />
                    <SelectField control={control} name={`${category}.${index}.sentiment`} label="Sentiment" required options={MENTION_SENTIMENT_OPTIONS} />
                  </div>
                  <TextareaField control={control} name={`${category}.${index}.content`} label="Content" rows={4} />
                  <TextareaField
                    control={control}
                    name={`${category}.${index}.urls`}
                    label="Links"
                    description="One link per line."
                    placeholder="https://"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </SectionCard>
    </Collapsible>
  );
}

const allOpen = (): Record<MentionCategory, boolean> =>
  Object.fromEntries(MENTION_CATEGORIES.map((c) => [c, true])) as Record<MentionCategory, boolean>;

export default function DailyMentionFormPage() {
  const { id } = useParams();
  const recordId = id ? Number(id) : null;
  const isEdit = recordId !== null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const perms = useContentPermissions();
  const companies = useCompanies();
  const publications = usePublications();
  const [openSections, setOpenSections] = useState<Record<MentionCategory, boolean>>(allOpen);

  const record = useQuery({
    queryKey: ['content', 'dailyMentions', 'detail', recordId],
    queryFn: () => getContent('dailyMentions', recordId as number),
    enabled: isEdit && Number.isInteger(recordId),
  });

  const hasAttachment = Boolean(record.data?.original_name);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: emptyValues() });
  const submitting = form.formState.isSubmitting;

  useEffect(() => {
    const data = record.data;
    if (!data) return;
    form.reset(toValues(data));
    setOpenSections(Object.fromEntries(MENTION_CATEGORIES.map((c) => [c, (data[c] ?? []).length > 0])) as Record<MentionCategory, boolean>);
  }, [record.data, form]);

  function onInvalid(errors: FieldErrors<Values>) {
    setOpenSections((prev) => {
      const next = { ...prev };
      for (const c of MENTION_CATEGORIES) if (errors[c]) next[c] = true;
      return next;
    });
  }

  async function onSubmit(values: Values) {
    try {
      const payload = toPayload(values);
      if (recordId !== null) await updateContent('dailyMentions', recordId, payload);
      else await createContent('dailyMentions', payload);
      toast.success(!isEdit ? 'Daily mention submitted for review'
        : perms.role === 'Admin' ? 'Changes saved' : 'Daily mention updated and resubmitted for review');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['content', 'dailyMentions'] }),
        queryClient.invalidateQueries({ queryKey: ['review'] }),
      ]);
      navigate(DAILY_MENTIONS_PATH);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const backAction = (
    <Button variant="ghost" asChild>
      <Link to={DAILY_MENTIONS_PATH}><ArrowLeft /> Back to daily mentions</Link>
    </Button>
  );
  const title = isEdit ? 'Edit daily mention' : 'New daily mention';

  if (isEdit && (!Number.isInteger(recordId) || (record.error instanceof ApiError && record.error.status === 404))) {
    return (
      <>
        <PageHeader title={title} actions={backAction} />
        <EmptyState title="Daily mention not found" description="It may have been deleted." action={backAction} />
      </>
    );
  }
  if (isEdit && record.error) {
    return (
      <>
        <PageHeader title={title} actions={backAction} />
        <ErrorState error={record.error} onRetry={() => record.refetch()} />
      </>
    );
  }
  if (isEdit && record.isLoading) {
    return (
      <>
        <PageHeader title={title} actions={backAction} />
        <LoadingState />
      </>
    );
  }

  const sectionError = form.formState.errors.industry?.root?.message ?? form.formState.errors.industry?.message;

  return (
    <>
      <PageHeader
        title={title}
        description={isEdit && perms.role === 'Analyst'
          ? 'Saving sends the daily mention back to your supervisor for review.'
          : 'Record the day’s mentions for a company, grouped by category.'}
        actions={backAction}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-6">
          <SectionCard title="Details">
            <div className="grid gap-4 sm:grid-cols-3">
              <ComboboxField control={form.control} name="company_id" label="Company" required numeric loading={companies.isLoading}
                options={(companies.data ?? []).map((c) => ({ value: String(c.id), label: c.company_name }))} />
              <ComboboxField control={form.control} name="publication" label="Publication" allowCustom loading={publications.isLoading}
                options={toOptions(publications.data?.map((p) => p.name))} />
              <TextField control={form.control} name="date" label="Date" type="date" required />
            </div>
            {hasAttachment && (
              <p className="mt-4 text-sm text-muted-foreground">Attached document: {record.data?.original_name}</p>
            )}
          </SectionCard>

          {sectionError && <p className="text-sm font-medium text-destructive" role="alert">{sectionError}</p>}
          {MENTION_SECTIONS.map((section) => (
            <MentionSection
              key={section.key}
              control={form.control}
              category={section.key}
              label={section.label}
              description={section.description}
              open={openSections[section.key]}
              onOpenChange={(open) => setOpenSections((prev) => ({ ...prev, [section.key]: open }))}
            />
          ))}

          <div className="sticky bottom-0 z-10 -mx-1 flex justify-end gap-2 border-t bg-background/95 px-1 py-4 backdrop-blur">
            <Button type="button" variant="outline" onClick={() => navigate(DAILY_MENTIONS_PATH)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              {isEdit ? (perms.role === 'Admin' ? 'Save changes' : 'Save and resubmit') : 'Submit for review'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
