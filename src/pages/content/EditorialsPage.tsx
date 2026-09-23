import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { FileSpreadsheet, Loader2, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormDialog } from '@/components/common/FormDialog';
import { ComboboxField, TextField, TextareaField, toOptions } from '@/components/common/FormFields';
import { DataTable } from '@/components/common/DataTable';
import { DetailGrid, DetailSection, ReviewNotes } from '@/components/common/Detail';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useCompanies, useParameterOptions } from '@/hooks/useLookups';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
import { PARAMETER_CATEGORIES } from '@/api/reference';
import { updateContent, uploadEditorialBatch } from '@/api/content';
import { formatDate, formatNumber, toDateInput } from '@/lib/format';
import { getErrorMessage } from '@/lib/api-client';
import type { Editorial } from '@/types/api';
import { ContentListPage } from './ContentListPage';
import { EditorialItemFields } from './EditorialItemFields';
import {
  editorialCompany, editorialCompanyId, editorialIndicator, editorialItemPayload, editorialItemSchema, editorialItemValues,
  editorialReviewer, emptyEditorialItem,
} from './EditorialItemSchema';
import { useContentPermissions } from './useContentPermissions';

/** Columns the import requires (backend `editorialImportService.REQUIRED_COLUMNS`). */
const REQUIRED_COLUMNS = [
  'date', 'company', 'source', 'title', 'media type', 'sentiment', 'online channel', 'audience reach',
  'placement', 'reporter', 'country', 'spokesperson', 'activity', 'advert spend', 'circulation',
  'page size', 'language', 'ceo media presence', 'ceo thought leadership', 'print web clips',
  'sentiment keyword indicator',
];
const OPTIONAL_COLUMNS = ['page number', 'analyst note'];
const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

type ImportResult = Awaited<ReturnType<typeof uploadEditorialBatch>>;

function UploadSpreadsheetDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useMutationWithToast({
    mutationFn: (f: File) => uploadEditorialBatch(f),
    successMessage: (r) => `${formatNumber(r.summary.successful_imports)} of ${formatNumber(r.summary.total_rows_processed)} rows imported`,
    invalidate: [['content', 'editorials'], ['review']],
    onSuccess: (r) => setResult(r),
  });

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setFileError('');
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [open]);

  function pick(f: File | null) {
    setResult(null);
    if (f && !ACCEPTED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext))) {
      setFile(null);
      setFileError('Choose an Excel (.xlsx, .xls) or CSV file.');
      return;
    }
    setFileError('');
    setFile(f);
  }

  function submit() {
    if (!file) {
      setFileError('Choose a file to upload.');
      return;
    }
    upload.mutate(file);
  }

  const busy = upload.isPending;
  const issues = [
    ...(result?.errors ?? []).map((e) => ({ row: e.row, kind: 'error' as const, message: e.error })),
    ...(result?.warnings ?? []).map((w) => ({ row: w.row, kind: 'warning' as const, message: w.warnings.join('; ') })),
  ].sort((a, b) => a.row - b.row);

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Upload spreadsheet</DialogTitle>
          <DialogDescription>Import editorials from an Excel or CSV file. Every imported row is submitted for review.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="editorial-file">File<span className="ml-0.5 text-destructive" aria-hidden>*</span></Label>
            <Input
              id="editorial-file"
              ref={inputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS.join(',')}
              onChange={(e) => pick(e.target.files?.[0] ?? null)}
              disabled={busy}
            />
            {fileError && <p className="text-sm font-medium text-destructive">{fileError}</p>}
          </div>

          <div className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
            <p className="font-medium">Required columns</p>
            <p className="text-muted-foreground">
              The first row must contain these headers (case does not matter). Companies must match an existing company name;
              dates can be DD/MM/YYYY or YYYY-MM-DD.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {REQUIRED_COLUMNS.map((c) => <Badge key={c} variant="secondary" className="font-normal">{c}</Badge>)}
            </div>
            <p className="pt-1 text-muted-foreground">Optional: {OPTIONAL_COLUMNS.join(', ')}.</p>
          </div>

          {result && (
            <div className="space-y-4">
              <DetailGrid
                className="rounded-lg border p-4 sm:grid-cols-4"
                items={[
                  { label: 'Rows processed', value: formatNumber(result.summary.total_rows_processed) },
                  { label: 'Imported', value: formatNumber(result.summary.successful_imports) },
                  { label: 'Failed', value: formatNumber(result.summary.failed_imports) },
                  { label: 'Success rate', value: result.summary.success_rate },
                ]}
              />
              {issues.length > 0 && (
                <DataTable
                  columns={[
                    { key: 'row', header: 'Row', cell: (r) => r.row },
                    { key: 'kind', header: 'Type', cell: (r) => <StatusBadge status={r.kind} /> },
                    { key: 'message', header: 'Details', cell: (r) => r.message },
                  ]}
                  rows={issues}
                  getRowKey={(r) => `${r.kind}-${r.row}`}
                />
              )}
            </div>
          )}
        </div>
        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>{result ? 'Close' : 'Cancel'}</Button>
          <Button onClick={submit} disabled={busy || !file}>
            {busy ? <Loader2 className="animate-spin" /> : <Upload />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const editSchema = editorialItemSchema.extend({
  company_id: z.number({ required_error: 'Select a company' }),
  date: z.string().min(1, 'Select a date'),
  media_type: z.string().trim().min(1, 'Select a media type'),
  note: z.string().optional(),
});
type EditValues = z.infer<typeof editSchema>;

const emptyEditValues = (): EditValues => ({
  ...emptyEditorialItem(), company_id: undefined as unknown as number, date: '', media_type: '', note: '',
});

function EditEditorialDialog({ record, onOpenChange }: { record: Editorial | null; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const perms = useContentPermissions();
  const companies = useCompanies();
  const mediaTypes = useParameterOptions(PARAMETER_CATEGORIES.mediaType);
  const form = useForm<EditValues>({ resolver: zodResolver(editSchema), defaultValues: emptyEditValues() });
  const isAdmin = perms.role === 'Admin';
  const noteField = isAdmin ? 'admin_note' : 'analyst_note';

  useEffect(() => {
    if (!record) return;
    form.reset({
      ...editorialItemValues(record),
      company_id: editorialCompanyId(record) as number,
      date: toDateInput(record.date),
      media_type: record.media_type ?? '',
      note: (isAdmin ? record.admin_note : record.analyst_note) ?? '',
    });
  }, [record, form, isAdmin]);

  async function onSubmit(values: EditValues) {
    if (!record) return;
    const { company_id, date, media_type, note, ...item } = values;
    try {
      await updateContent('editorials', record.id, {
        ...editorialItemPayload(item),
        company_id,
        date,
        media_type: media_type.trim(),
        [noteField]: note?.trim() || null,
      });
      toast.success(isAdmin ? 'Changes saved' : 'Editorial updated and resubmitted for review');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['content', 'editorials'] }),
        queryClient.invalidateQueries({ queryKey: ['review'] }),
      ]);
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <FormDialog
      open={Boolean(record)}
      onOpenChange={onOpenChange}
      title="Edit editorial"
      description={isAdmin ? 'Changes are saved without changing the review status.' : 'Saving sends the editorial back to your supervisor for review.'}
      form={form}
      onSubmit={onSubmit}
      submitLabel={isAdmin ? 'Save changes' : 'Save and resubmit'}
      size="xl"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ComboboxField control={form.control} name="company_id" label="Company" required numeric loading={companies.isLoading}
          options={(companies.data ?? []).map((c) => ({ value: String(c.id), label: c.company_name }))} />
        <TextField control={form.control} name="date" label="Date" type="date" required />
        <ComboboxField control={form.control} name="media_type" label="Media type" required allowCustom
          loading={mediaTypes.isLoading} options={toOptions(mediaTypes.data)} />
      </div>
      <EditorialItemFields control={form.control} />
      <TextareaField control={form.control} name="note" label={isAdmin ? 'Admin note' : 'Note for your supervisor'} />
    </FormDialog>
  );
}

function EditorialDetail({ row }: { row: Editorial }) {
  const indicator = editorialIndicator(row);
  return (
    <div className="space-y-6">
      <DetailGrid items={[
        { label: 'Title', value: row.title, wide: true },
        { label: 'Company', value: editorialCompany(row)?.company_name },
        { label: 'Date', value: formatDate(row.date) },
        { label: 'Media type', value: row.media_type },
        { label: 'Source', value: row.source },
        { label: 'Online channel', value: row.online_channel },
        { label: 'Placement', value: row.placement },
        { label: 'Activity', value: row.activity },
        { label: 'Language', value: row.language },
        { label: 'Country', value: row.country },
        { label: 'Reviewed by', value: editorialReviewer(row) },
        { label: 'Reviewed on', value: formatDate(row.reviewed_at, '') },
      ]}
      />
      <DetailSection title="People">
        <DetailGrid items={[
          { label: 'Reporter', value: row.reporter },
          { label: 'Spokesperson', value: row.spokesperson },
          { label: 'CEO media presence', value: row.ceo_media_presence },
          { label: 'CEO thought leadership', value: row.ceo_thought_leadership },
        ]}
        />
      </DetailSection>
      <DetailSection title="Sentiment">
        <DetailGrid items={[
          { label: 'Sentiment', value: row.sentiment ? <StatusBadge status={row.sentiment} /> : null },
          {
            label: 'Keyword indicator',
            value: indicator ? (
              <span>
                {indicator.keyword_indicator}
                <span className="text-muted-foreground"> · {indicator.classification} · score {formatNumber(indicator.sentiment_score)}</span>
              </span>
            ) : null,
          },
        ]}
        />
      </DetailSection>
      <DetailSection title="Print and reach">
        <DetailGrid items={[
          { label: 'Page size', value: row.page_size },
          { label: 'Page number', value: row.page_number },
          { label: 'Print / web clips', value: row.print_web_clips },
          { label: 'Audience reach', value: formatNumber(row.audience_reach, '') },
          { label: 'Advert spend', value: formatNumber(row.advert_spend, '') },
          { label: 'Circulation', value: formatNumber(row.circulation, '') },
        ]}
        />
      </DetailSection>
      <ReviewNotes analystNote={row.analyst_note} supervisorNote={row.supervisor_note} adminNote={row.admin_note} />
    </div>
  );
}

export default function EditorialsPage() {
  const perms = useContentPermissions();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editing, setEditing] = useState<Editorial | null>(null);
  // Spreadsheet import is limited to analysts and admins by the backend.
  const canUpload = perms.role === 'Analyst' || perms.role === 'Admin';

  return (
    <>
      <ContentListPage
        resource="editorials"
        title="Editorials"
        description="Press and online coverage recorded for monitored companies."
        showSearch
        searchPlaceholder="Search by company"
        supervisorCanCreate
        columns={[
          {
            key: 'title',
            header: 'Title',
            cell: (r) => <span className="block max-w-xs truncate font-medium" title={r.title ?? undefined}>{r.title || '—'}</span>,
          },
          { key: 'company', header: 'Company', cell: (r) => editorialCompany(r)?.company_name ?? '—' },
          { key: 'media_type', header: 'Media type', cell: (r) => r.media_type || '—' },
          { key: 'source', header: 'Source', cell: (r) => r.source || '—' },
          { key: 'date', header: 'Date', cell: (r) => formatDate(r.date) },
          { key: 'sentiment', header: 'Sentiment', cell: (r) => <StatusBadge status={r.sentiment} /> },
        ]}
        createAction={(
          <>
            {canUpload && (
              <Button variant="outline" onClick={() => setUploadOpen(true)}><FileSpreadsheet /> Upload spreadsheet</Button>
            )}
            <Button asChild><Link to="/dashboard/editorials/new"><Plus /> New editorial</Link></Button>
          </>
        )}
        onEdit={setEditing}
        rowTitle={(r) => r.title || 'Editorial'}
        renderDetail={(r) => <EditorialDetail row={r} />}
      />
      <UploadSpreadsheetDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <EditEditorialDialog record={editing} onOpenChange={(open) => !open && setEditing(null)} />
    </>
  );
}
