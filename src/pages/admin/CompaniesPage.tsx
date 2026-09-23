import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type Column } from '@/components/common/DataTable';
import { FilterBar, SearchInput } from '@/components/common/Filters';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { BulletList, DetailGrid, DetailSection } from '@/components/common/Detail';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
import { lookupKeys } from '@/hooks/useLookups';
import { companiesApi } from '@/api/companies';
import { formatDate, formatNumber } from '@/lib/format';
import type { Company } from '@/types/api';
import { CompanyFormDialog } from './CompanyFormDialog';

const PAGE_SIZE = 10;

function ExternalLink({ href }: { href: string | null }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className="break-all text-primary underline-offset-4 hover:underline">
      {href}
    </a>
  );
}

function industryLine(company: Company): string {
  return [company.industry, company.sub_industry].filter(Boolean).join(' · ');
}

export default function CompaniesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Company | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState<Company | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // "Add company" quick links elsewhere open the form via ?new=1.
  useEffect(() => {
    if (searchParams.get('new') !== '1') return;
    setEditing(null);
    setFormOpen(true);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('new');
      return next;
    }, { replace: true });
  }, [searchParams, setSearchParams]);

  const params = { page, limit: PAGE_SIZE, search: search || undefined };
  const companies = useQuery({
    queryKey: ['companies', params],
    queryFn: () => companiesApi.list(params),
    placeholderData: keepPreviousData,
  });

  const invalidateKeys = [['companies'], lookupKeys.companies, lookupKeys.subsidiaries];

  const remove = useMutationWithToast({
    mutationFn: (c: Company) => companiesApi.remove(c.id),
    successMessage: (_, c) => `${c.company_name} was deleted`,
    invalidate: invalidateKeys,
    onSuccess: (_, c) => {
      if (viewing?.id === c.id) setViewing(null);
    },
  });

  function openForm(company: Company | null) {
    setEditing(company);
    setFormOpen(true);
  }

  const columns: Column<Company>[] = [
    {
      key: 'company',
      header: 'Company',
      cell: (c) => (
        <div className="min-w-0">
          <p className="font-medium">{c.company_name}</p>
          <p className="truncate text-xs text-muted-foreground">{industryLine(c) || 'No industry set'}</p>
        </div>
      ),
    },
    { key: 'ceo', header: 'CEO', cell: (c) => c.ceo || '—' },
    {
      key: 'contact',
      header: 'Contact',
      cell: (c) => (c.email || c.phone_no ? (
        <div className="min-w-0">
          {c.email && <p className="truncate">{c.email}</p>}
          {c.phone_no && <p className="text-xs text-muted-foreground">{c.phone_no}</p>}
        </div>
      ) : '—'),
    },
    { key: 'subsidiaries', header: 'Subsidiaries', align: 'right', cell: (c) => formatNumber(c.subsidiaries?.length ?? 0) },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (c) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${c.company_name}`}><MoreHorizontal /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setViewing(c)}>
                <Eye /> View details
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openForm(c)}>
                <Pencil /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setDeleting(c)} className="text-destructive focus:text-destructive">
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const detailSections: { title: string; items: { label: string; value: ReactNode; wide?: boolean }[] }[] = viewing ? [
    {
      title: 'Company details',
      items: [
        { label: 'Industry', value: viewing.industry },
        { label: 'Sub-industry', value: viewing.sub_industry },
        { label: 'CEO', value: viewing.ceo },
        { label: 'Added on', value: formatDate(viewing.createdAt) },
        { label: 'Additional information', value: viewing.additional_info, wide: true },
      ],
    },
    {
      title: 'Contact',
      items: [
        { label: 'Contact person', value: viewing.contact_person },
        { label: 'Email', value: viewing.email },
        { label: 'Phone number', value: viewing.phone_no },
        { label: 'Office address', value: viewing.office_address },
        { label: 'State', value: viewing.office_state },
        { label: 'Country', value: viewing.office_country },
      ],
    },
    {
      title: 'Online presence',
      items: [
        { label: 'Website', value: <ExternalLink href={viewing.website} />, wide: true },
        { label: 'Facebook', value: <ExternalLink href={viewing.facebook_link} />, wide: true },
        { label: 'Instagram', value: <ExternalLink href={viewing.instagram_link} />, wide: true },
        { label: 'X (Twitter)', value: <ExternalLink href={viewing.twitter_link} />, wide: true },
        { label: 'LinkedIn', value: <ExternalLink href={viewing.linkedin_link} />, wide: true },
        { label: 'YouTube', value: <ExternalLink href={viewing.youtube_link} />, wide: true },
      ],
    },
  ] : [];

  return (
    <>
      <PageHeader
        title="Companies"
        description="Manage monitored companies, their contact details and subsidiaries."
        actions={<Button onClick={() => openForm(null)}><Plus /> Add company</Button>}
      />
      <FilterBar onReset={search ? () => { setSearch(''); setPage(1); } : undefined}>
        <SearchInput
          value={search}
          onChange={(value) => { setSearch(value); setPage(1); }}
          placeholder="Search name or industry"
        />
      </FilterBar>
      <DataTable
        columns={columns}
        rows={companies.data?.data}
        getRowKey={(c) => c.id}
        isLoading={companies.isLoading}
        error={companies.error}
        onRetry={() => companies.refetch()}
        pagination={companies.data?.pagination}
        onPageChange={setPage}
        onRowClick={setViewing}
        emptyTitle="No companies found"
        emptyDescription={search ? 'Try a different search.' : 'Add the first company to get started.'}
      />

      <Sheet open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {viewing && (
            <>
              <SheetHeader className="mb-6 space-y-2 text-left">
                <SheetTitle>{viewing.company_name}</SheetTitle>
                <SheetDescription>{industryLine(viewing) || 'No industry set'}</SheetDescription>
              </SheetHeader>
              <div className="space-y-5">
                {detailSections.map((section) => (
                  <DetailSection key={section.title} title={section.title}>
                    <DetailGrid items={section.items} />
                  </DetailSection>
                ))}
                <DetailSection title="Subsidiaries">
                  <BulletList items={(viewing.subsidiaries ?? []).map((s) => s.company_name)} empty="No subsidiaries" />
                </DetailSection>
                <div className="flex justify-end gap-2 border-t pt-5">
                  <Button variant="outline" onClick={() => setDeleting(viewing)}><Trash2 /> Delete</Button>
                  <Button onClick={() => openForm(viewing)}><Pencil /> Edit</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CompanyFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        company={editing}
        onSaved={() => {
          toast.success(editing ? 'Company updated' : 'Company created');
          invalidateKeys.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
          setViewing(null);
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete company?"
        description={deleting
          ? `${deleting.company_name} and its subsidiary links will be removed. Companies used by an active client monitoring cannot be deleted.`
          : ''}
        confirmLabel="Delete company"
        destructive
        onConfirm={() => deleting && remove.mutateAsync(deleting)}
      />
    </>
  );
}
