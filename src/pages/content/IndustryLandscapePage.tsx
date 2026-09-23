import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormDialog } from '@/components/common/FormDialog';
import { ComboboxField, TextField, TextareaField, toOptions } from '@/components/common/FormFields';
import { BulletList, DetailGrid, DetailSection, ReviewNotes } from '@/components/common/Detail';
import { useCompanies, useParameterOptions } from '@/hooks/useLookups';
import { PARAMETER_CATEGORIES } from '@/api/reference';
import { createContent, updateContent } from '@/api/content';
import { formatDate, toDateInput } from '@/lib/format';
import { getErrorMessage } from '@/lib/api-client';
import type { IndustryLandscapeOverview } from '@/types/api';
import { ContentListPage } from './ContentListPage';
import { useContentPermissions } from './useContentPermissions';
import { useCreateFromQuery } from './useCreateFromQuery';

const schema = z.object({
  company_id: z.number({ required_error: 'Select a company' }),
  date: z.string().min(1, 'Select a date'),
  sector: z.string().trim().min(1, 'Select a sector'),
  highlights: z.array(z.object({ value: z.string().trim().min(1, 'Enter a highlight or remove it') }))
    .min(1, 'Add at least one highlight'),
  analyst_note: z.string().optional(),
});
type Values = z.infer<typeof schema>;

const emptyValues = (): Values => ({
  company_id: undefined as unknown as number, date: '', sector: '', highlights: [{ value: '' }], analyst_note: '',
});

function LandscapeFormDialog({ open, onOpenChange, record }: {
  open: boolean; onOpenChange: (open: boolean) => void; record: IndustryLandscapeOverview | null;
}) {
  const queryClient = useQueryClient();
  const companies = useCompanies();
  const sectors = useParameterOptions(PARAMETER_CATEGORIES.industryLandscapeSector);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: emptyValues() });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'highlights' });

  useEffect(() => {
    if (!open) return;
    form.reset(record ? {
      company_id: record.company_id,
      date: toDateInput(record.date),
      sector: record.sector ?? '',
      highlights: record.highlights?.length ? record.highlights.map((value) => ({ value })) : [{ value: '' }],
      analyst_note: record.analyst_note ?? '',
    } : emptyValues());
  }, [open, record, form]);

  async function onSubmit(values: Values) {
    const payload = {
      company_id: values.company_id,
      date: values.date,
      sector: values.sector.trim(),
      highlights: values.highlights.map((h) => h.value.trim()),
      analyst_note: values.analyst_note?.trim() || null,
    };
    try {
      if (record) await updateContent('industryLandscape', record.id, payload);
      else await createContent('industryLandscape', payload);
      toast.success(record ? 'Industry landscape overview updated and resubmitted for review' : 'Industry landscape overview submitted for review');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['content', 'industryLandscape'] }),
        queryClient.invalidateQueries({ queryKey: ['review'] }),
      ]);
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const listError = form.formState.errors.highlights?.root?.message ?? form.formState.errors.highlights?.message;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={record ? 'Edit industry landscape overview' : 'New industry landscape overview'}
      description="One overview per company and date. Saving sends it to your supervisor for review."
      form={form}
      onSubmit={onSubmit}
      submitLabel={record ? 'Save and resubmit' : 'Submit for review'}
      size="lg"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ComboboxField control={form.control} name="company_id" label="Company" required numeric loading={companies.isLoading}
          options={(companies.data ?? []).map((c) => ({ value: String(c.id), label: c.company_name }))} />
        <TextField control={form.control} name="date" label="Date" type="date" required />
        <ComboboxField control={form.control} name="sector" label="Sector" required allowCustom
          loading={sectors.isLoading} options={toOptions(sectors.data)} />
      </div>
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Highlights<span className="ml-0.5 text-destructive" aria-hidden>*</span></h4>
          <Button type="button" variant="ghost" size="sm" onClick={() => append({ value: '' })}><Plus /> Add highlight</Button>
        </div>
        {fields.map((field, index) => (
          <FormField
            key={field.id}
            control={form.control}
            name={`highlights.${index}.value`}
            render={({ field: input }) => (
              <FormItem>
                <div className="flex gap-2">
                  <FormControl><Input {...input} placeholder={`Highlight ${index + 1}`} aria-label={`Highlight ${index + 1}`} /></FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    aria-label={`Remove highlight ${index + 1}`}
                  >
                    <Trash2 />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        {listError && <p className="text-sm font-medium text-destructive">{listError}</p>}
      </div>
      <TextareaField control={form.control} name="analyst_note" label="Note for your supervisor" />
    </FormDialog>
  );
}

export default function IndustryLandscapePage() {
  const perms = useContentPermissions();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IndustryLandscapeOverview | null>(null);
  const openCreate = () => { setEditing(null); setFormOpen(true); };
  useCreateFromQuery(perms.canCreate, openCreate);

  return (
    <>
      <ContentListPage
        resource="industryLandscape"
        title="Industry landscape"
        description="Sector highlights that frame each company's coverage."
        columns={[
          { key: 'company', header: 'Company', cell: (r) => <span className="font-medium">{r.company_data?.company_name ?? '—'}</span> },
          { key: 'sector', header: 'Sector', cell: (r) => r.sector || '—' },
          { key: 'date', header: 'Date', cell: (r) => formatDate(r.date) },
          { key: 'highlights', header: 'Highlights', align: 'right', cell: (r) => r.highlights?.length ?? 0 },
        ]}
        createAction={<Button onClick={openCreate}><Plus /> New overview</Button>}
        onEdit={(r) => { setEditing(r); setFormOpen(true); }}
        rowTitle={(r) => `${r.company_data?.company_name ?? 'Industry landscape'} — ${formatDate(r.date)}`}
        renderDetail={(r) => (
          <div className="space-y-6">
            <DetailGrid items={[
              { label: 'Company', value: r.company_data?.company_name },
              { label: 'Sector', value: r.sector },
              { label: 'Date', value: formatDate(r.date) },
              { label: 'Reviewed by', value: r.approver_data?.username },
              { label: 'Reviewed on', value: formatDate(r.reviewed_at, '') },
            ]}
            />
            <DetailSection title="Highlights">
              <BulletList items={r.highlights ?? []} />
            </DetailSection>
            <ReviewNotes analystNote={r.analyst_note} supervisorNote={r.supervisor_note} />
          </div>
        )}
      />
      <LandscapeFormDialog open={formOpen} onOpenChange={setFormOpen} record={editing} />
    </>
  );
}
