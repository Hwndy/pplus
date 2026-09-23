import { useEffect, useState } from 'react';
import { useFieldArray, useForm, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormDialog } from '@/components/common/FormDialog';
import { ComboboxField, TextField, TextareaField } from '@/components/common/FormFields';
import { BulletList, DetailGrid, DetailSection, ReviewNotes } from '@/components/common/Detail';
import { useCompanies } from '@/hooks/useLookups';
import { createContent, updateContent } from '@/api/content';
import { formatDate, toDateInput } from '@/lib/format';
import { getErrorMessage } from '@/lib/api-client';
import type { SwotAnalysis } from '@/types/api';
import { ContentListPage } from './ContentListPage';
import { useContentPermissions } from './useContentPermissions';
import { useCreateFromQuery } from './useCreateFromQuery';

const QUADRANTS = [
  { key: 'strengths', label: 'Strengths' },
  { key: 'weaknesses', label: 'Weaknesses' },
  { key: 'opportunities', label: 'Opportunities' },
  { key: 'threats', label: 'Threats' },
] as const;

const item = z.object({ analysis: z.string().trim().min(1, 'Enter a point or remove it') });
const schema = z.object({
  company_id: z.number({ required_error: 'Select a company' }),
  date: z.string().min(1, 'Select a date'),
  strengths: z.array(item),
  weaknesses: z.array(item),
  opportunities: z.array(item),
  threats: z.array(item),
  analyst_note: z.string().optional(),
}).refine((v) => QUADRANTS.some((q) => v[q.key].length > 0), {
  path: ['strengths'], message: 'Add at least one point to any quadrant',
});
type Values = z.infer<typeof schema>;

const emptyValues = (): Values => ({
  company_id: undefined as unknown as number, date: '', strengths: [], weaknesses: [], opportunities: [], threats: [], analyst_note: '',
});

function QuadrantEditor({ control, name, label }: { control: Control<Values>; name: (typeof QUADRANTS)[number]['key']; label: string }) {
  const { fields, append, remove } = useFieldArray({ control, name });
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{label}</h4>
        <Button type="button" variant="ghost" size="sm" onClick={() => append({ analysis: '' })}><Plus /> Add</Button>
      </div>
      {fields.length === 0 && <p className="text-xs text-muted-foreground">No points yet.</p>}
      {fields.map((field, index) => (
        <FormField
          key={field.id}
          control={control}
          name={`${name}.${index}.analysis`}
          render={({ field: input }) => (
            <FormItem>
              <div className="flex gap-2">
                <FormControl><Input {...input} placeholder={`${label.slice(0, -1)} ${index + 1}`} /></FormControl>
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove point">
                  <Trash2 />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}

function SwotFormDialog({ open, onOpenChange, record }: { open: boolean; onOpenChange: (o: boolean) => void; record: SwotAnalysis | null }) {
  const queryClient = useQueryClient();
  const companies = useCompanies();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: emptyValues() });

  useEffect(() => {
    if (!open) return;
    form.reset(record ? {
      company_id: record.company_id,
      date: toDateInput(record.date),
      strengths: record.strengths ?? [],
      weaknesses: record.weaknesses ?? [],
      opportunities: record.opportunities ?? [],
      threats: record.threats ?? [],
      analyst_note: record.analyst_note ?? '',
    } : emptyValues());
  }, [open, record, form]);

  async function onSubmit(values: Values) {
    try {
      if (record) await updateContent('swot', record.id, values);
      else await createContent('swot', values);
      toast.success(record ? 'SWOT analysis updated and resubmitted for review' : 'SWOT analysis submitted for review');
      await queryClient.invalidateQueries({ queryKey: ['content', 'swot'] });
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={record ? 'Edit SWOT analysis' : 'New SWOT analysis'}
      description="Saving sends the analysis to your supervisor for review."
      form={form}
      onSubmit={onSubmit}
      submitLabel={record ? 'Save and resubmit' : 'Submit for review'}
      size="xl"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <ComboboxField control={form.control} name="company_id" label="Company" required numeric loading={companies.isLoading}
          options={(companies.data ?? []).map((c) => ({ value: String(c.id), label: c.company_name }))} />
        <TextField control={form.control} name="date" label="Date" type="date" required />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {QUADRANTS.map((q) => <QuadrantEditor key={q.key} control={form.control} name={q.key} label={q.label} />)}
      </div>
      {form.formState.errors.strengths?.root?.message || form.formState.errors.strengths?.message ? (
        <p className="text-sm font-medium text-destructive">{form.formState.errors.strengths?.message ?? form.formState.errors.strengths?.root?.message}</p>
      ) : null}
      <TextareaField control={form.control} name="analyst_note" label="Note for your supervisor" />
    </FormDialog>
  );
}

export default function SwotAnalysesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SwotAnalysis | null>(null);
  const perms = useContentPermissions();
  const openCreate = () => { setEditing(null); setFormOpen(true); };
  useCreateFromQuery(perms.canCreate, openCreate);

  return (
    <>
      <ContentListPage
        resource="swot"
        title="SWOT analyses"
        description="Strengths, weaknesses, opportunities and threats recorded for monitored companies."
        columns={[
          { key: 'company', header: 'Company', cell: (r) => <span className="font-medium">{r.company?.company_name ?? '—'}</span> },
          { key: 'date', header: 'Date', cell: (r) => formatDate(r.date) },
          {
            key: 'points', header: 'Points', align: 'right',
            cell: (r) => QUADRANTS.reduce((sum, q) => sum + (r[q.key]?.length ?? 0), 0),
          },
        ]}
        createAction={<Button onClick={openCreate}><Plus /> New SWOT analysis</Button>}
        onEdit={(r) => { setEditing(r); setFormOpen(true); }}
        rowTitle={(r) => `${r.company?.company_name ?? 'SWOT analysis'} — ${formatDate(r.date)}`}
        renderDetail={(r) => (
          <div className="space-y-6">
            <DetailGrid items={[
              { label: 'Company', value: r.company?.company_name },
              { label: 'Date', value: formatDate(r.date) },
              { label: 'Reviewed by', value: r.approver_data?.username },
              { label: 'Reviewed on', value: formatDate(r.reviewed_at, '') },
            ]}
            />
            {QUADRANTS.map((q) => (
              <DetailSection key={q.key} title={q.label}>
                <BulletList items={(r[q.key] ?? []).map((i) => i.analysis)} />
              </DetailSection>
            ))}
            <ReviewNotes analystNote={r.analyst_note} supervisorNote={r.supervisor_note} />
          </div>
        )}
      />
      <SwotFormDialog open={formOpen} onOpenChange={setFormOpen} record={editing} />
    </>
  );
}
