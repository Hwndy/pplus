import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormDialog } from '@/components/common/FormDialog';
import { ComboboxField, TextField, TextareaField, toOptions } from '@/components/common/FormFields';
import { BulletList, DetailGrid, DetailSection, ReviewNotes } from '@/components/common/Detail';
import { useCompanies, useParameterOptions } from '@/hooks/useLookups';
import { PARAMETER_CATEGORIES } from '@/api/reference';
import { createContent, updateContent } from '@/api/content';
import { formatDate, toDateInput } from '@/lib/format';
import { getErrorMessage } from '@/lib/api-client';
import type { InsightItem, OutcomeInsight } from '@/types/api';
import { ContentListPage } from './ContentListPage';
import { useContentPermissions } from './useContentPermissions';
import { useCreateFromQuery } from './useCreateFromQuery';

const schema = z.object({
  company_id: z.number({ required_error: 'Select a company' }),
  date: z.string().min(1, 'Select a date'),
  insights: z.array(z.object({
    category: z.string().trim().min(1, 'Select a category'),
    insight: z.string().trim().min(1, 'Enter the insight'),
  })).min(1, 'Add at least one insight'),
  analyst_note: z.string().optional(),
});
type Values = z.infer<typeof schema>;

const emptyInsight = () => ({ category: '', insight: '' });
const emptyValues = (): Values => ({
  company_id: undefined as unknown as number, date: '', insights: [emptyInsight()], analyst_note: '',
});

function groupByCategory(items: InsightItem[]): [string, string[]][] {
  const groups = new Map<string, string[]>();
  for (const item of items) {
    const list = groups.get(item.category) ?? [];
    list.push(item.insight);
    groups.set(item.category, list);
  }
  return [...groups.entries()];
}

function InsightFormDialog({ open, onOpenChange, record }: {
  open: boolean; onOpenChange: (open: boolean) => void; record: OutcomeInsight | null;
}) {
  const queryClient = useQueryClient();
  const companies = useCompanies();
  const categories = useParameterOptions(PARAMETER_CATEGORIES.insights);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: emptyValues() });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'insights' });

  useEffect(() => {
    if (!open) return;
    form.reset(record ? {
      company_id: record.company_id,
      date: toDateInput(record.date),
      insights: record.insights?.length ? record.insights.map((i) => ({ category: i.category, insight: i.insight })) : [emptyInsight()],
      analyst_note: record.analyst_note ?? '',
    } : emptyValues());
  }, [open, record, form]);

  async function onSubmit(values: Values) {
    const payload = {
      company_id: values.company_id,
      date: values.date,
      insights: values.insights.map((i) => ({ category: i.category.trim(), insight: i.insight.trim() })),
      analyst_note: values.analyst_note?.trim() || null,
    };
    try {
      if (record) await updateContent('outcomeInsights', record.id, payload);
      else await createContent('outcomeInsights', payload);
      toast.success(record ? 'Outcome insight updated and resubmitted for review' : 'Outcome insight submitted for review');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['content', 'outcomeInsights'] }),
        queryClient.invalidateQueries({ queryKey: ['review'] }),
      ]);
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const listError = form.formState.errors.insights?.root?.message ?? form.formState.errors.insights?.message;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={record ? 'Edit outcome insight' : 'New outcome insight'}
      description="One record per company and date. Saving sends it to your supervisor for review."
      form={form}
      onSubmit={onSubmit}
      submitLabel={record ? 'Save and resubmit' : 'Submit for review'}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ComboboxField control={form.control} name="company_id" label="Company" required numeric loading={companies.isLoading}
          options={(companies.data ?? []).map((c) => ({ value: String(c.id), label: c.company_name }))} />
        <TextField control={form.control} name="date" label="Date" type="date" required />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Insights</h4>
          <Button type="button" variant="ghost" size="sm" onClick={() => append(emptyInsight())}><Plus /> Add insight</Button>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-3 rounded-lg border p-3">
            <div className="flex items-start gap-2">
              <ComboboxField control={form.control} name={`insights.${index}.category`} label="Category" required allowCustom
                className="flex-1" loading={categories.isLoading} options={toOptions(categories.data)} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-7"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                aria-label={`Remove insight ${index + 1}`}
              >
                <Trash2 />
              </Button>
            </div>
            <TextareaField control={form.control} name={`insights.${index}.insight`} label="Insight" required />
          </div>
        ))}
        {listError && <p className="text-sm font-medium text-destructive">{listError}</p>}
      </div>
      <TextareaField control={form.control} name="analyst_note" label="Note for your supervisor" />
    </FormDialog>
  );
}

export default function OutcomeInsightsPage() {
  const perms = useContentPermissions();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<OutcomeInsight | null>(null);
  const openCreate = () => { setEditing(null); setFormOpen(true); };
  useCreateFromQuery(perms.canCreate, openCreate);

  return (
    <>
      <ContentListPage
        resource="outcomeInsights"
        title="Outcome & insights"
        description="Outcomes and insights drawn from each company's coverage."
        columns={[
          { key: 'company', header: 'Company', cell: (r) => <span className="font-medium">{r.company?.company_name ?? '—'}</span> },
          { key: 'date', header: 'Date', cell: (r) => formatDate(r.date) },
          { key: 'insights', header: 'Insights', align: 'right', cell: (r) => r.insights?.length ?? 0 },
        ]}
        createAction={<Button onClick={openCreate}><Plus /> New outcome insight</Button>}
        onEdit={(r) => { setEditing(r); setFormOpen(true); }}
        rowTitle={(r) => `${r.company?.company_name ?? 'Outcome insight'} — ${formatDate(r.date)}`}
        renderDetail={(r) => (
          <div className="space-y-6">
            <DetailGrid items={[
              { label: 'Company', value: r.company?.company_name },
              { label: 'Date', value: formatDate(r.date) },
              { label: 'Reviewed by', value: r.approver_data?.username },
              { label: 'Reviewed on', value: formatDate(r.reviewed_at, '') },
            ]}
            />
            {groupByCategory(r.insights ?? []).map(([category, items]) => (
              <DetailSection key={category} title={category}>
                <BulletList items={items} />
              </DetailSection>
            ))}
            <ReviewNotes analystNote={r.analyst_note} supervisorNote={r.supervisor_note} />
          </div>
        )}
      />
      <InsightFormDialog open={formOpen} onOpenChange={setFormOpen} record={editing} />
    </>
  );
}
