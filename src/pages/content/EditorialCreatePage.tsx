import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFieldArray, useForm, useWatch, type Control, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/Cards';
import { ComboboxField, TextField, TextareaField, toOptions } from '@/components/common/FormFields';
import { useCompanies, useParameterOptions } from '@/hooks/useLookups';
import { PARAMETER_CATEGORIES } from '@/api/reference';
import { createContent } from '@/api/content';
import { getErrorMessage } from '@/lib/api-client';
import { EditorialItemFields } from './EditorialItemFields';
import { editorialItemPayload, editorialItemSchema, emptyEditorialItem } from './EditorialItemSchema';
import { useContentPermissions } from './useContentPermissions';

const LIST_PATH = '/dashboard/editorials';

const schema = z.object({
  company_id: z.number({ required_error: 'Select a company' }),
  date: z.string().min(1, 'Select a date'),
  media_type: z.string().trim().min(1, 'Select a media type'),
  note: z.string().optional(),
  editorials: z.array(editorialItemSchema).min(1, 'Add at least one editorial'),
});
type Values = z.infer<typeof schema>;

const defaultValues = (): Values => ({
  company_id: undefined as unknown as number,
  date: '',
  media_type: '',
  note: '',
  editorials: [emptyEditorialItem()],
});

function ItemHeading({ control, index }: { control: Control<Values>; index: number }) {
  const title = useWatch({ control, name: `editorials.${index}.title` });
  return (
    <div className="min-w-0">
      <p className="text-sm font-semibold">Editorial {index + 1}</p>
      <p className="truncate text-xs text-muted-foreground">{title?.trim() || 'No title yet'}</p>
    </div>
  );
}

export default function EditorialCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const perms = useContentPermissions();
  const companies = useCompanies();
  const mediaTypes = useParameterOptions(PARAMETER_CATEGORIES.mediaType);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: defaultValues() });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'editorials' });
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const submitting = form.formState.isSubmitting;

  // Each role writes its own note field (the backend drops notes written by other roles).
  const noteField = perms.role === 'Admin' ? 'admin_note' : perms.role === 'Supervisor' ? 'supervisor_note' : 'analyst_note';
  const noteLabel = perms.role === 'Admin' ? 'Admin note' : perms.role === 'Supervisor' ? 'Supervisor note' : 'Note for your supervisor';

  const toggle = (id: string) => setCollapsed((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  function onInvalid(errors: FieldErrors<Values>) {
    // Expand every item that has an error so it can be fixed.
    const failing = fields.filter((_, i) => errors.editorials?.[i]).map((f) => f.id);
    if (failing.length) setCollapsed((prev) => new Set([...prev].filter((id) => !failing.includes(id))));
  }

  async function onSubmit(values: Values) {
    try {
      await createContent('editorials', {
        company_id: values.company_id,
        date: values.date,
        media_type: values.media_type.trim(),
        ...(values.note?.trim() ? { [noteField]: values.note.trim() } : {}),
        editorials: values.editorials.map(editorialItemPayload),
      });
      const count = values.editorials.length;
      toast.success(count === 1 ? 'Editorial submitted for review' : `${count} editorials submitted for review`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['content', 'editorials'] }),
        queryClient.invalidateQueries({ queryKey: ['review'] }),
      ]);
      navigate(LIST_PATH);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <>
      <PageHeader
        title="New editorial"
        description="Record one or more editorials that share a company, date and media type."
        actions={(
          <Button variant="ghost" asChild>
            <Link to={LIST_PATH}><ArrowLeft /> Back to editorials</Link>
          </Button>
        )}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} noValidate className="space-y-6">
          <SectionCard title="Shared details" description="Applied to every editorial below.">
            <div className="grid gap-4 sm:grid-cols-3">
              <ComboboxField control={form.control} name="company_id" label="Company" required numeric loading={companies.isLoading}
                options={(companies.data ?? []).map((c) => ({ value: String(c.id), label: c.company_name }))} />
              <TextField control={form.control} name="date" label="Date" type="date" required />
              <ComboboxField control={form.control} name="media_type" label="Media type" required allowCustom
                loading={mediaTypes.isLoading} options={toOptions(mediaTypes.data)} />
            </div>
          </SectionCard>

          <SectionCard
            title="Editorials"
            description={`${fields.length} ${fields.length === 1 ? 'editorial' : 'editorials'} in this submission.`}
          >
            <div className="space-y-4">
              {fields.map((field, index) => {
                const isCollapsed = collapsed.has(field.id);
                const hasError = Boolean(form.formState.errors.editorials?.[index]);
                return (
                  <div key={field.id} className={hasError ? 'rounded-lg border border-destructive' : 'rounded-lg border'}>
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <ItemHeading control={form.control} index={index} />
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => toggle(field.id)}
                          aria-label={isCollapsed ? `Expand editorial ${index + 1}` : `Collapse editorial ${index + 1}`}
                          aria-expanded={!isCollapsed}
                        >
                          {isCollapsed ? <ChevronDown /> : <ChevronUp />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          aria-label={`Remove editorial ${index + 1}`}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                    {!isCollapsed && (
                      <div className="border-t px-4 py-4">
                        <EditorialItemFields control={form.control} prefix={`editorials.${index}.`} />
                      </div>
                    )}
                  </div>
                );
              })}
              <Button type="button" variant="outline" onClick={() => append(emptyEditorialItem())}>
                <Plus /> Add another editorial
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="Note">
            <TextareaField control={form.control} name="note" label={noteLabel} />
          </SectionCard>

          <div className="sticky bottom-0 z-10 -mx-1 flex justify-end gap-2 border-t bg-background/95 px-1 py-4 backdrop-blur">
            <Button type="button" variant="outline" onClick={() => navigate(LIST_PATH)} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              Submit for review
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
