import { useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { useAuth } from '@/components/auth/AuthContext';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
import { useCompanies } from '@/hooks/useLookups';
import { spokespersonsApi } from '@/api/spokespersons';
import { hasRole } from '@/lib/roles';
import type { Spokesperson } from '@/types/api';
import { EntityAvatar } from './EntityAvatar';
import { SpokespersonFormDialog } from './SpokespersonFormDialog';

const PAGE_SIZE = 10;

export default function SpokespersonsPage() {
  const { user } = useAuth();
  const isAdmin = hasRole(user, 'Admin');
  const queryClient = useQueryClient();
  const companies = useCompanies();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [editing, setEditing] = useState<Spokesperson | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Spokesperson | null>(null);

  const params = {
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    company_id: companyId ? Number(companyId) : undefined,
  };
  const people = useQuery({
    queryKey: ['spokespersons', params],
    queryFn: () => spokespersonsApi.list(params),
    placeholderData: keepPreviousData,
  });

  const remove = useMutationWithToast({
    mutationFn: (p: Spokesperson) => spokespersonsApi.remove(p.id),
    successMessage: (_, p) => `${p.name} was deleted`,
    invalidate: [['spokespersons']],
  });

  function openForm(person: Spokesperson | null) {
    setEditing(person);
    setFormOpen(true);
  }

  const hasFilters = Boolean(search || companyId);

  const columns: Column<Spokesperson>[] = [
    {
      key: 'name',
      header: 'Spokesperson',
      cell: (p) => (
        <div className="flex min-w-0 items-center gap-3">
          <EntityAvatar name={p.name} imageUrl={p.photo_url} rounded="full" />
          <p className="truncate font-medium">{p.name}</p>
        </div>
      ),
    },
    { key: 'title', header: 'Title', cell: (p) => p.title || '—' },
    { key: 'company', header: 'Company', cell: (p) => p.company?.company_name ?? '—' },
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
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setDeleting(p)} className="text-destructive focus:text-destructive">
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Spokespersons"
        description="People quoted in coverage; their title and photo appear in client reports."
        actions={<Button onClick={() => openForm(null)}><Plus /> Add spokesperson</Button>}
      />
      <FilterBar onReset={hasFilters ? () => { setSearch(''); setCompanyId(''); setPage(1); } : undefined}>
        <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search name" />
        <FilterSelect
          label="Company"
          value={companyId}
          onChange={(value) => { setCompanyId(value); setPage(1); }}
          options={(companies.data ?? []).map((c) => ({ value: String(c.id), label: c.company_name }))}
          allLabel="All companies"
          className="sm:w-56"
        />
      </FilterBar>
      <DataTable
        columns={columns}
        rows={people.data?.data}
        getRowKey={(p) => p.id}
        isLoading={people.isLoading}
        error={people.error}
        onRetry={() => people.refetch()}
        pagination={people.data?.pagination}
        onPageChange={setPage}
        emptyTitle="No spokespersons found"
        emptyDescription={hasFilters ? 'Try adjusting your filters.' : 'Add the first spokesperson to get started.'}
      />
      <SpokespersonFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        spokesperson={editing}
        onSaved={(created) => {
          toast.success(created ? 'Spokesperson added' : 'Changes saved');
          queryClient.invalidateQueries({ queryKey: ['spokespersons'] });
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete spokesperson?"
        description={deleting ? `${deleting.name} and their photo will be removed from the directory.` : ''}
        confirmLabel="Delete spokesperson"
        destructive
        onConfirm={() => deleting && remove.mutateAsync(deleting)}
      />
    </>
  );
}
