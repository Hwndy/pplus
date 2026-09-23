import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { FilterBar, SearchInput } from '@/components/common/Filters';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { FormDialog } from '@/components/common/FormDialog';
import { ComboboxField, TextareaField, TextField, toOptions } from '@/components/common/FormFields';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
import { lookupKeys, useParameterOptions } from '@/hooks/useLookups';
import { PARAMETER_CATEGORIES, publicationsApi, type PublicationInput } from '@/api/reference';
import { ApiError, getErrorMessage } from '@/lib/api-client';
import { formatDate } from '@/lib/format';
import type { Publication } from '@/types/api';

const PAGE_SIZE = 10;

function isUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const schema = z.object({
  name: z.string().trim().min(1, 'Enter the publication name').max(255, 'At most 255 characters'),
  publication_type: z.string().trim().min(1, 'Select a publication type').max(255, 'At most 255 characters'),
  website: z.string().trim().refine((v) => v === '' || isUrl(v), 'Enter a full URL, e.g. https://example.com'),
  description: z.string().trim().max(255, 'At most 255 characters'),
});
type Values = z.infer<typeof schema>;

function toValues(publication: Publication | null): Values {
  return {
    name: publication?.name ?? '',
    publication_type: publication?.type ?? '',
    website: publication?.website ?? '',
    description: publication?.description ?? '',
  };
}

function PublicationFormDialog({ open, onOpenChange, publication, onSaved }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publication: Publication | null;
  onSaved: () => void;
}) {
  const isEdit = Boolean(publication);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(publication) });
  const types = useParameterOptions(PARAMETER_CATEGORIES.publicationType);

  useEffect(() => {
    if (open) form.reset(toValues(publication));
  }, [open, publication, form]);

  async function onSubmit(values: Values) {
    const input: PublicationInput = values;
    try {
      if (publication) await publicationsApi.update(publication.id, input);
      else await publicationsApi.create(input);
      onSaved();
      onOpenChange(false);
    } catch (error) {
      const message = getErrorMessage(error);
      if (error instanceof ApiError) {
        error.fieldErrors.forEach((f) => {
          if (f.field && f.field in values) form.setError(f.field as keyof Values, { message: f.message });
        });
        if (error.status === 409) form.setError('name', { message });
      }
      toast.error(message);
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit publication' : 'Add publication'}
      description="Publications are offered as sources when recording editorials and daily mentions."
      form={form}
      onSubmit={onSubmit}
      submitLabel={isEdit ? 'Save changes' : 'Create publication'}
    >
      <TextField control={form.control} name="name" label="Name" required />
      <ComboboxField
        control={form.control}
        name="publication_type"
        label="Publication type"
        required
        options={toOptions(types.data)}
        loading={types.isLoading}
        allowCustom
      />
      <TextField control={form.control} name="website" label="Website" type="url" description="Optional. Full address including https://." />
      <TextareaField control={form.control} name="description" label="Description" description="Optional. Up to 255 characters." />
    </FormDialog>
  );
}

export default function PublicationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Publication | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Publication | null>(null);

  const params = { page, limit: PAGE_SIZE, search: search || undefined };
  const publications = useQuery({
    queryKey: ['publications', params],
    queryFn: () => publicationsApi.list(params),
    placeholderData: keepPreviousData,
  });

  const invalidateKeys = [['publications'], lookupKeys.publications];

  const remove = useMutationWithToast({
    mutationFn: (p: Publication) => publicationsApi.remove(p.id),
    successMessage: (_, p) => `${p.name} was deleted`,
    invalidate: invalidateKeys,
  });

  function openForm(publication: Publication | null) {
    setEditing(publication);
    setFormOpen(true);
  }

  const columns: Column<Publication>[] = [
    {
      key: 'name',
      header: 'Publication',
      cell: (p) => (
        <div className="min-w-0">
          <p className="font-medium">{p.name}</p>
          {p.description && <p className="max-w-md truncate text-xs text-muted-foreground">{p.description}</p>}
        </div>
      ),
    },
    { key: 'type', header: 'Type', cell: (p) => p.type || '—' },
    {
      key: 'website',
      header: 'Website',
      cell: (p) => (p.website ? (
        <a href={p.website} target="_blank" rel="noreferrer noopener" className="break-all text-primary underline-offset-4 hover:underline">
          {p.website}
        </a>
      ) : '—'),
    },
    { key: 'created', header: 'Added', cell: (p) => formatDate(p.createdAt) },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (p) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Actions for ${p.name}`}><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => openForm(p)}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setDeleting(p)} className="text-destructive focus:text-destructive">
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Publications"
        description="Manage the newspapers, magazines and online outlets used as sources."
        actions={<Button onClick={() => openForm(null)}><Plus /> Add publication</Button>}
      />
      <FilterBar onReset={search ? () => { setSearch(''); setPage(1); } : undefined}>
        <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search publications" />
      </FilterBar>
      <DataTable
        columns={columns}
        rows={publications.data?.data}
        getRowKey={(p) => p.id}
        isLoading={publications.isLoading}
        error={publications.error}
        onRetry={() => publications.refetch()}
        pagination={publications.data?.pagination}
        onPageChange={setPage}
        emptyTitle="No publications found"
        emptyDescription={search ? 'Try a different search.' : 'Add the first publication to get started.'}
      />
      <PublicationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        publication={editing}
        onSaved={() => {
          toast.success(editing ? 'Publication updated' : 'Publication created');
          invalidateKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete publication?"
        description={deleting ? `${deleting.name} will no longer be offered as a source when recording content.` : ''}
        confirmLabel="Delete publication"
        destructive
        onConfirm={() => deleting && remove.mutateAsync(deleting)}
      />
    </>
  );
}
