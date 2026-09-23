import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ListPlus, Loader2, MoreHorizontal, Pencil, Plus, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/Cards';
import { DataTable, type Column } from '@/components/common/DataTable';
import { SearchInput } from '@/components/common/Filters';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
import { PARAMETER_CATEGORIES, parametersApi } from '@/api/reference';
import { formatNumber, humanize } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ParameterCategory, ParameterValue } from '@/types/api';
import { ParameterCategoryDialog, ParameterValueRenameDialog, ParameterValuesDialog } from './ParametersDialogs';

const QUERY_KEY = ['parameters'] as const;
const LOOKUP_KEY = ['lookups', 'parameter'] as const;
const VALUES_PAGE_SIZE = 25;
const FORM_CATEGORIES = new Set<string>(Object.values(PARAMETER_CATEGORIES));

export default function ParametersPage() {
  const queryClient = useQueryClient();
  const root = useQuery({ queryKey: QUERY_KEY, queryFn: parametersApi.root });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [valueSearch, setValueSearch] = useState('');
  const [valuePage, setValuePage] = useState(1);
  const [categoryForm, setCategoryForm] = useState<{ open: boolean; category: ParameterCategory | null }>({ open: false, category: null });
  const [deletingCategory, setDeletingCategory] = useState<ParameterCategory | null>(null);
  const [valuesOpen, setValuesOpen] = useState(false);
  const [renaming, setRenaming] = useState<ParameterValue | null>(null);
  const [deletingValue, setDeletingValue] = useState<ParameterValue | null>(null);

  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: LOOKUP_KEY }),
  ]);

  const createRoot = useMutationWithToast({
    mutationFn: () => parametersApi.createRoot(),
    successMessage: 'Parameters set up',
    invalidate: [QUERY_KEY],
  });
  const removeCategory = useMutationWithToast({
    mutationFn: (c: ParameterCategory) => parametersApi.removeCategory(c.id),
    successMessage: (_, c) => `${humanize(c.name)} was deleted`,
    invalidate: [QUERY_KEY, LOOKUP_KEY],
    onSuccess: (_, c) => { if (selectedId === c.id) setSelectedId(null); },
  });
  const removeValue = useMutationWithToast({
    mutationFn: (v: ParameterValue) => parametersApi.removeValue(v.id),
    successMessage: (_, v) => `"${v.value}" was deleted`,
    invalidate: [QUERY_KEY, LOOKUP_KEY],
  });

  const categories = useMemo(
    () => [...(root.data?.categories ?? [])].sort((a, b) => humanize(a.name).localeCompare(humanize(b.name))),
    [root.data],
  );
  const visibleCategories = useMemo(() => {
    const term = categorySearch.trim().toLowerCase();
    if (!term) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(term) || humanize(c.name).toLowerCase().includes(term)
      || (c.description ?? '').toLowerCase().includes(term));
  }, [categories, categorySearch]);
  const selected = categories.find((c) => c.id === selectedId) ?? categories[0] ?? null;

  const values = useMemo(() => {
    const term = valueSearch.trim().toLowerCase();
    return [...(selected?.values ?? [])]
      .filter((v) => !term || v.value.toLowerCase().includes(term))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [selected, valueSearch]);
  const totalValuePages = Math.max(1, Math.ceil(values.length / VALUES_PAGE_SIZE));
  const currentValuePage = Math.min(valuePage, totalValuePages);
  const valueRows = values.slice((currentValuePage - 1) * VALUES_PAGE_SIZE, currentValuePage * VALUES_PAGE_SIZE);

  function selectCategory(id: number) {
    setSelectedId(id);
    setValueSearch('');
    setValuePage(1);
  }

  if (root.isLoading) return <LoadingState label="Loading parameters…" />;
  if (root.error) return <ErrorState error={root.error} onRetry={() => root.refetch()} />;

  const header = (
    <PageHeader
      title="Parameters"
      description="Manage the option lists offered in form dropdowns."
      actions={root.data ? <Button onClick={() => setCategoryForm({ open: true, category: null })}><Plus /> Add category</Button> : undefined}
    />
  );

  if (!root.data) {
    return (
      <>
        {header}
        <EmptyState
          icon={Settings}
          title="Parameters are not set up yet"
          description="Create the parameter store to start adding option lists such as industries, placements and reporters."
          action={(
            <Button onClick={() => createRoot.mutate()} disabled={createRoot.isPending}>
              {createRoot.isPending && <Loader2 className="animate-spin" />}
              Set up parameters
            </Button>
          )}
        />
      </>
    );
  }

  const valueColumns: Column<ParameterValue>[] = [
    { key: 'value', header: 'Value', cell: (v) => <span className="break-words">{v.value}</span> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (v) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Actions for ${v.value}`}><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setRenaming(v)}>
              <Pencil /> Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setDeletingValue(v)} className="text-destructive focus:text-destructive">
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      {header}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(260px,340px)_1fr]">
        <SectionCard
          title="Categories"
          description={`${formatNumber(categories.length)} option list${categories.length === 1 ? '' : 's'}`}
          contentClassName="space-y-3"
        >
          <SearchInput value={categorySearch} onChange={setCategorySearch} placeholder="Search categories" className="sm:w-full" />
          {visibleCategories.length === 0 ? (
            <EmptyState
              title={categories.length ? 'No matching categories' : 'No categories yet'}
              description={categories.length ? 'Try a different search.' : 'Add a category to create the first option list.'}
              className="py-8"
            />
          ) : (
            <ul className="max-h-[60vh] space-y-1 overflow-y-auto pr-1" aria-label="Categories">
              {visibleCategories.map((c) => {
                const active = selected?.id === c.id;
                return (
                  <li key={c.id} className={cn('flex items-center gap-1 rounded-md', active ? 'bg-muted' : 'hover:bg-muted/60')}>
                    <button
                      type="button"
                      onClick={() => selectCategory(c.id)}
                      aria-current={active ? 'true' : undefined}
                      className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className={cn('truncate', active && 'font-medium')}>{humanize(c.name)}</span>
                      <Badge variant="muted">{formatNumber(c.values?.length ?? 0)}</Badge>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label={`Actions for ${humanize(c.name)}`}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setCategoryForm({ open: true, category: c })}>
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setDeletingCategory(c)} className="text-destructive focus:text-destructive">
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        {selected ? (
          <SectionCard
            title={humanize(selected.name)}
            description={(
              <span className="flex flex-wrap items-center gap-2">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{selected.name}</code>
                {FORM_CATEGORIES.has(selected.name) && <Badge variant="secondary">Used by forms</Badge>}
                {selected.description && <span>{selected.description}</span>}
              </span>
            )}
            actions={<Button size="sm" onClick={() => setValuesOpen(true)}><ListPlus /> Add values</Button>}
            contentClassName="space-y-3"
          >
            <SearchInput
              value={valueSearch}
              onChange={(v) => { setValueSearch(v); setValuePage(1); }}
              placeholder="Search values"
            />
            <DataTable
              columns={valueColumns}
              rows={valueRows}
              getRowKey={(v) => v.id}
              pagination={{ total: values.length, page: currentValuePage, limit: VALUES_PAGE_SIZE, totalPages: totalValuePages }}
              onPageChange={setValuePage}
              emptyTitle={valueSearch ? 'No matching values' : 'No values yet'}
              emptyDescription={valueSearch ? 'Try a different search.' : 'Add values to populate this dropdown.'}
            />
          </SectionCard>
        ) : (
          <SectionCard title="Values">
            <EmptyState title="No category selected" description="Add a category to start managing its values." />
          </SectionCard>
        )}
      </div>

      <ParameterCategoryDialog
        open={categoryForm.open}
        onOpenChange={(open) => setCategoryForm((s) => ({ ...s, open }))}
        category={categoryForm.category}
        usedByForms={Boolean(categoryForm.category && FORM_CATEGORIES.has(categoryForm.category.name))}
        onSaved={(saved) => {
          toast.success(categoryForm.category ? 'Category updated' : 'Category created');
          selectCategory(saved.id);
          void refresh();
        }}
      />
      <ParameterValuesDialog
        open={valuesOpen}
        onOpenChange={setValuesOpen}
        category={selected}
        onSaved={(count) => {
          toast.success(count === 1 ? 'Value added' : `${formatNumber(count)} values added`);
          void refresh();
        }}
      />
      <ParameterValueRenameDialog
        open={Boolean(renaming)}
        onOpenChange={(open) => !open && setRenaming(null)}
        value={renaming}
        onSaved={() => {
          toast.success('Value renamed');
          void refresh();
        }}
      />
      <ConfirmDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title="Delete category?"
        description={deletingCategory
          ? `${humanize(deletingCategory.name)} and its ${formatNumber(deletingCategory.values?.length ?? 0)} value(s) will be removed.${
            FORM_CATEGORIES.has(deletingCategory.name) ? ' Forms that use this list will show an empty dropdown.' : ''}`
          : ''}
        confirmLabel="Delete category"
        destructive
        onConfirm={() => deletingCategory && removeCategory.mutateAsync(deletingCategory)}
      />
      <ConfirmDialog
        open={Boolean(deletingValue)}
        onOpenChange={(open) => !open && setDeletingValue(null)}
        title="Delete value?"
        description={deletingValue ? `"${deletingValue.value}" will no longer be offered in the ${humanize(selected?.name)} dropdown.` : ''}
        confirmLabel="Delete value"
        destructive
        onConfirm={() => deletingValue && removeValue.mutateAsync(deletingValue)}
      />
    </>
  );
}
