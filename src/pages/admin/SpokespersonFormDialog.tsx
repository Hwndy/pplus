import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { FormDialog } from '@/components/common/FormDialog';
import { ComboboxField, TextField } from '@/components/common/FormFields';
import { useCompanies } from '@/hooks/useLookups';
import { spokespersonsApi, type SpokespersonInput } from '@/api/spokespersons';
import { ApiError, getErrorMessage } from '@/lib/api-client';
import type { Spokesperson } from '@/types/api';
import { ImagePicker } from './ImagePicker';

/** Combobox value meaning "not linked to a company". */
const NO_COMPANY = 0;

const schema = z.object({
  name: z.string().trim().min(1, 'Enter the name').max(255, 'At most 255 characters'),
  title: z.string().trim().max(255, 'At most 255 characters'),
  company_id: z.number(),
});
type Values = z.infer<typeof schema>;

function toValues(person: Spokesperson | null): Values {
  return { name: person?.name ?? '', title: person?.title ?? '', company_id: person?.company_id ?? NO_COMPANY };
}

function toInput(values: Values): SpokespersonInput {
  return {
    name: values.name,
    title: values.title || null,
    company_id: values.company_id === NO_COMPANY ? null : values.company_id,
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spokesperson: Spokesperson | null;
  /** Called after a successful create or update (the dialog closes itself). */
  onSaved: (created: boolean) => void;
}

export function SpokespersonFormDialog({ open, onOpenChange, spokesperson, onSaved }: Props) {
  const isEdit = Boolean(spokesperson);
  const personId = spokesperson?.id ?? null;
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(spokesperson) });
  const queryClient = useQueryClient();
  const companies = useCompanies();
  /** New spokesperson: photo chosen before the record exists, uploaded after it is created. */
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  /** Existing spokesperson: photo URL after a change made in this dialog (undefined = unchanged). */
  const [photoUrl, setPhotoUrl] = useState<string | null | undefined>(undefined);
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    form.reset(toValues(spokesperson));
    setPendingPhoto(null);
    setPhotoUrl(undefined);
    setPhotoBusy(false);
  }, [open, spokesperson, form]);

  async function selectPhoto(file: File) {
    if (personId === null) {
      setPendingPhoto(file);
      return;
    }
    setPhotoBusy(true);
    try {
      const updated = await spokespersonsApi.uploadPhoto(personId, file);
      setPhotoUrl(updated.photo_url);
      queryClient.invalidateQueries({ queryKey: ['spokespersons'] });
      toast.success('Photo saved');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPhotoBusy(false);
    }
  }

  async function removePhoto() {
    if (personId === null) {
      setPendingPhoto(null);
      return;
    }
    setPhotoBusy(true);
    try {
      await spokespersonsApi.removePhoto(personId);
      setPhotoUrl(null);
      queryClient.invalidateQueries({ queryKey: ['spokespersons'] });
      toast.success('Photo removed');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPhotoBusy(false);
    }
  }

  async function onSubmit(values: Values) {
    try {
      if (spokesperson) {
        await spokespersonsApi.update(spokesperson.id, toInput(values));
      } else {
        const created = await spokespersonsApi.create(toInput(values));
        if (pendingPhoto) {
          try {
            await spokespersonsApi.uploadPhoto(created.id, pendingPhoto);
          } catch (error) {
            toast.error(`${created.name} was added, but the photo could not be uploaded: ${getErrorMessage(error)}. Edit the spokesperson to try again.`, { duration: 10000 });
          }
        }
      }
      onSaved(!spokesperson);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError) {
        error.fieldErrors.forEach((f) => {
          if (f.field && f.field in values) form.setError(f.field as keyof Values, { message: f.message });
        });
      }
      toast.error(getErrorMessage(error));
    }
  }

  const companyOptions = [
    { value: String(NO_COMPANY), label: 'No company' },
    ...(companies.data ?? []).map((c) => ({ value: String(c.id), label: c.company_name })),
  ];
  const savedPhoto = photoUrl !== undefined ? photoUrl : spokesperson?.photo_url ?? null;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit spokesperson' : 'Add spokesperson'}
      description="Their name, title and photo appear in client reports wherever they are quoted."
      form={form}
      onSubmit={onSubmit}
      submitLabel={isEdit ? 'Save changes' : 'Add spokesperson'}
    >
      <TextField control={form.control} name="name" label="Name" required autoComplete="off" />
      <TextField control={form.control} name="title" label="Title" placeholder="e.g. Chief Executive Officer" autoComplete="off" />
      <ComboboxField
        control={form.control}
        name="company_id"
        label="Company"
        numeric
        options={companyOptions}
        loading={companies.isLoading}
      />
      <ImagePicker
        label="Photo"
        description={isEdit ? 'Changes to the photo are saved immediately.' : 'JPEG, PNG, GIF or WebP, up to 5 MB.'}
        shape="round"
        imageUrl={isEdit ? savedPhoto : null}
        pendingFile={isEdit ? null : pendingPhoto}
        busy={photoBusy}
        disabled={form.formState.isSubmitting}
        onSelect={selectPhoto}
        onRemove={removePhoto}
      />
    </FormDialog>
  );
}
