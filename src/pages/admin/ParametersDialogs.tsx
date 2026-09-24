import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FormDialog } from '@/components/common/FormDialog';
import { TextareaField, TextField } from '@/components/common/FormFields';
import { parametersApi } from '@/api/reference';
import { ApiError, getErrorMessage } from '@/lib/api-client';
import type { ParameterCategory, ParameterValue } from '@/types/api';

type SetFieldError<T extends string> = (field: T, message: string) => void;

function reportError<T extends string>(error: unknown, fields: readonly T[], setFieldError: SetFieldError<T>, conflictField: T) {
  const message = getErrorMessage(error);
  if (error instanceof ApiError) {
    error.fieldErrors.forEach((f) => {
      const field = fields.find((name) => name === f.field);
      if (field) setFieldError(field, f.message);
    });
    if (error.status === 409 || error.status === 422) setFieldError(conflictField, message);
  }
  toast.error(message);
}

// ---------------------------------------------------------------- Category

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Enter a category name').max(255, 'At most 255 characters'),
  description: z.string().trim(),
});
type CategoryValues = z.infer<typeof categorySchema>;

export function ParameterCategoryDialog({ open, onOpenChange, category, usedByForms, onSaved }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ParameterCategory | null;
  /** Whether the category (by its current name) feeds a form dropdown. */
  usedByForms: boolean;
  onSaved: (category: ParameterCategory) => void;
}) {
  const isEdit = Boolean(category);
  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category?.name ?? '', description: category?.description ?? '' },
  });
  const name = useWatch({ control: form.control, name: 'name' });
  const renamed = isEdit && name.trim() !== category?.name;

  useEffect(() => {
    if (open) form.reset({ name: category?.name ?? '', description: category?.description ?? '' });
  }, [open, category, form]);

  async function onSubmit(values: CategoryValues) {
    try {
      const saved = category
        ? await parametersApi.updateCategory(category.id, values)
        : await parametersApi.createCategory(values);
      onSaved(saved);
      onOpenChange(false);
    } catch (error) {
      reportError(error, ['name', 'description'] as const, (field, message) => form.setError(field, { message }), 'name');
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit category' : 'Add category'}
      description={isEdit
        ? 'Rename the category or update its description.'
        : 'A category holds one dropdown list, e.g. industries or reporters.'}
      form={form}
      onSubmit={onSubmit}
      submitLabel={isEdit ? 'Save changes' : 'Create category'}
    >
      {isEdit && (
        <Alert variant={usedByForms && renamed ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Renaming can break dropdowns</AlertTitle>
          <AlertDescription>
            Forms look up their options by the exact category name
            {usedByForms ? <> (this one is read as <code className="rounded bg-muted px-1 py-0.5 text-xs">{category?.name}</code>)</> : null}.
            {' '}Changing it will leave those dropdowns empty.
          </AlertDescription>
        </Alert>
      )}
      <TextField
        control={form.control}
        name="name"
        label="Category name"
        required
        autoComplete="off"
        description="Exact name used by forms, e.g. Media_Prominence (shown as Competitive Metrics). Underscores are shown as spaces in lists."
      />
      <TextareaField control={form.control} name="description" label="Description" description="Optional. Where this list is used." />
    </FormDialog>
  );
}

// ---------------------------------------------------------------- Add values

/** Splits the textarea input (one per line or comma separated) into unique, trimmed values. */
function parseValues(raw: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  raw.split(/[\n,]/).map((v) => v.trim()).filter(Boolean).forEach((v) => {
    const key = v.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(v);
    }
  });
  return result;
}

const valuesSchema = z.object({
  values: z.string().superRefine((raw, ctx) => {
    const parsed = parseValues(raw);
    if (parsed.length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Enter at least one value' });
    const tooLong = parsed.find((v) => v.length > 255);
    if (tooLong) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `"${tooLong.slice(0, 40)}…" is longer than 255 characters` });
  }),
});
type ValuesInput = z.infer<typeof valuesSchema>;

export function ParameterValuesDialog({ open, onOpenChange, category, onSaved }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ParameterCategory | null;
  onSaved: (count: number) => void;
}) {
  const form = useForm<ValuesInput>({ resolver: zodResolver(valuesSchema), defaultValues: { values: '' } });
  const raw = useWatch({ control: form.control, name: 'values' });
  const parsed = parseValues(raw ?? '');
  const existing = new Set((category?.values ?? []).map((v) => v.value.toLowerCase()));
  const duplicates = parsed.filter((v) => existing.has(v.toLowerCase()));

  useEffect(() => {
    if (open) form.reset({ values: '' });
  }, [open, form]);

  async function onSubmit(values: ValuesInput) {
    if (!category) return;
    const toAdd = parseValues(values.values).filter((v) => !existing.has(v.toLowerCase()));
    if (toAdd.length === 0) {
      form.setError('values', { message: 'Every value is already in this category' });
      return;
    }
    try {
      await parametersApi.createValues(category.id, toAdd);
      onSaved(toAdd.length);
      onOpenChange(false);
    } catch (error) {
      reportError(error, ['values'] as const, (field, message) => form.setError(field, { message }), 'values');
    }
  }

  const newCount = parsed.length - duplicates.length;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add values"
      description="Enter one value per line, or separate them with commas."
      form={form}
      onSubmit={onSubmit}
      submitLabel={newCount > 1 ? `Add ${newCount} values` : 'Add value'}
    >
      <TextareaField control={form.control} name="values" label="Values" required rows={8} />
      {parsed.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {newCount} new value{newCount === 1 ? '' : 's'} will be added
          {duplicates.length > 0 && <>; {duplicates.length} already exist{duplicates.length === 1 ? 's' : ''} and will be skipped</>}.
        </p>
      )}
    </FormDialog>
  );
}

// ---------------------------------------------------------------- Rename value

const renameSchema = z.object({
  value: z.string().trim().min(1, 'Enter a value').max(255, 'At most 255 characters'),
});
type RenameValues = z.infer<typeof renameSchema>;

export function ParameterValueRenameDialog({ open, onOpenChange, value, onSaved }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: ParameterValue | null;
  onSaved: () => void;
}) {
  const form = useForm<RenameValues>({ resolver: zodResolver(renameSchema), defaultValues: { value: value?.value ?? '' } });

  useEffect(() => {
    if (open) form.reset({ value: value?.value ?? '' });
  }, [open, value, form]);

  async function onSubmit(values: RenameValues) {
    if (!value) return;
    try {
      await parametersApi.updateValue(value.id, values.value);
      onSaved();
      onOpenChange(false);
    } catch (error) {
      reportError(error, ['value'] as const, (field, message) => form.setError(field, { message }), 'value');
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Rename value"
      description="Records that already use the old value keep it; new entries will use the new one."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Save changes"
    >
      <TextField control={form.control} name="value" label="Value" required autoComplete="off" />
    </FormDialog>
  );
}
