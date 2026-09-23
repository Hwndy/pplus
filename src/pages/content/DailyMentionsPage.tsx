import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { ExternalLink, FileText, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormDialog } from '@/components/common/FormDialog';
import { ComboboxField, TextField, toOptions } from '@/components/common/FormFields';
import { DetailGrid, DetailSection, ReviewNotes } from '@/components/common/Detail';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useCompanies, usePublications } from '@/hooks/useLookups';
import { uploadDailyMentionDocument } from '@/api/content';
import { formatDate, formatNumber } from '@/lib/format';
import { getErrorMessage } from '@/lib/api-client';
import type { DailyMention } from '@/types/api';
import { ContentListPage } from './ContentListPage';
import { DAILY_MENTIONS_PATH, MENTION_SECTIONS, mentionCount } from './DailyMentionCategories';

const ACCEPTED_EXTENSIONS = ['.doc', '.docx'];

const uploadSchema = z.object({
  company_id: z.number().optional(),
  publication: z.string().optional(),
  date: z.string().optional(),
});
type UploadValues = z.infer<typeof uploadSchema>;

function UploadDocumentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const companies = useCompanies();
  const publications = usePublications();
  const form = useForm<UploadValues>({ resolver: zodResolver(uploadSchema), defaultValues: { publication: '', date: '' } });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    if (!open) return;
    form.reset({ company_id: undefined, publication: '', date: '' });
    setFile(null);
    setFileError('');
  }, [open, form]);

  function pick(f: File | null) {
    if (f && !ACCEPTED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext))) {
      setFile(null);
      setFileError('Choose a Word document (.doc or .docx).');
      return;
    }
    setFileError('');
    setFile(f);
  }

  async function onSubmit(values: UploadValues) {
    if (!file) {
      setFileError('Choose a document to upload.');
      return;
    }
    try {
      await uploadDailyMentionDocument(file, {
        company_id: values.company_id,
        publication: values.publication?.trim(),
        date: values.date,
      });
      toast.success('Document uploaded and submitted for review');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['content', 'dailyMentions'] }),
        queryClient.invalidateQueries({ queryKey: ['review'] }),
      ]);
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Upload Word document"
      description="The document is stored as a pending daily mention for your supervisor to review."
      form={form}
      onSubmit={onSubmit}
      submitLabel="Upload"
    >
      <div className="space-y-2">
        <Label htmlFor="daily-mention-file">Document<span className="ml-0.5 text-destructive" aria-hidden>*</span></Label>
        <Input
          id="daily-mention-file"
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
          disabled={form.formState.isSubmitting}
        />
        {fileError
          ? <p className="text-sm font-medium text-destructive">{fileError}</p>
          : <p className="text-sm text-muted-foreground">Microsoft Word (.doc or .docx).</p>}
      </div>
      <ComboboxField control={form.control} name="company_id" label="Company" numeric loading={companies.isLoading}
        options={(companies.data ?? []).map((c) => ({ value: String(c.id), label: c.company_name }))} />
      <ComboboxField control={form.control} name="publication" label="Publication" allowCustom loading={publications.isLoading}
        options={toOptions(publications.data?.map((p) => p.name))} />
      <TextField control={form.control} name="date" label="Date" type="date" />
    </FormDialog>
  );
}

function DailyMentionDetail({ row }: { row: DailyMention }) {
  return (
    <div className="space-y-6">
      <DetailGrid items={[
        { label: 'Company', value: row.company?.company_name },
        { label: 'Publication', value: row.publication },
        { label: 'Date', value: formatDate(row.date, '') },
        { label: 'Mentions', value: formatNumber(mentionCount(row)) },
        { label: 'Attachment', value: row.original_name, wide: true },
        { label: 'Reviewed by', value: row.approver_data?.username },
        { label: 'Reviewed on', value: formatDate(row.reviewed_at, '') },
      ]}
      />
      {MENTION_SECTIONS.map((section) => {
        const items = row[section.key] ?? [];
        return (
          <DetailSection key={section.key} title={`${section.label} (${items.length})`}>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">None recorded</p>
            ) : (
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={`${i}-${item.headline ?? ''}`} className="flex items-start justify-between gap-3 text-sm">
                    <span className="min-w-0 break-words">{item.headline || 'Untitled mention'}</span>
                    <StatusBadge status={item.sentiment} className="shrink-0" />
                  </li>
                ))}
              </ul>
            )}
          </DetailSection>
        );
      })}
      <ReviewNotes analystNote={row.analyst_note} supervisorNote={row.supervisor_note} />
      <Button variant="outline" asChild>
        <Link to={`${DAILY_MENTIONS_PATH}/${row.id}`}><ExternalLink /> Open full view</Link>
      </Button>
    </div>
  );
}

export default function DailyMentionsPage() {
  const navigate = useNavigate();
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
      <ContentListPage
        resource="dailyMentions"
        title="Daily mentions"
        description="Daily media mentions grouped by industry, competitors, subsidiaries, passive coverage and adverts."
        columns={[
          { key: 'company', header: 'Company', cell: (r) => <span className="font-medium">{r.company?.company_name ?? '—'}</span> },
          { key: 'publication', header: 'Publication', cell: (r) => r.publication || '—' },
          { key: 'date', header: 'Date', cell: (r) => formatDate(r.date) },
          { key: 'mentions', header: 'Mentions', align: 'right', cell: (r) => formatNumber(mentionCount(r)) },
          {
            key: 'attachment',
            header: 'Attachment',
            cell: (r) => (r.original_name ? (
              <span className="inline-flex max-w-[14rem] items-center gap-1.5 text-muted-foreground" title={r.original_name}>
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate">{r.original_name}</span>
              </span>
            ) : '—'),
          },
        ]}
        createAction={(
          <>
            <Button variant="outline" onClick={() => setUploadOpen(true)}><Upload /> Upload Word document</Button>
            <Button asChild><Link to={`${DAILY_MENTIONS_PATH}/new`}><Plus /> New daily mention</Link></Button>
          </>
        )}
        onEdit={(r) => navigate(`${DAILY_MENTIONS_PATH}/${r.id}/edit`)}
        rowTitle={(r) => `${r.company?.company_name ?? r.original_name ?? 'Daily mention'} — ${formatDate(r.date)}`}
        renderDetail={(r) => <DailyMentionDetail row={r} />}
      />
      <UploadDocumentDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
