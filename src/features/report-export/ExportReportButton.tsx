import { useState } from 'react';
import { ChevronDown, Download, FileText, Loader2, Mail, Presentation } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ReportFilters } from '@/api/reports';
import { getErrorMessage, saveBlob } from '@/lib/api-client';
import type { MonitoringPair } from '@/types/api';
import type { ExportFormat } from './generate';
import { ShareReportDialog } from './ShareReportDialog';

/**
 * Downloads the Media Performance Audit Report (every client report for the
 * selected pair and period) as PowerPoint or PDF, or e-mails it. The export
 * code is loaded on demand.
 */
export function ExportReportButton({ pair, filters }: { pair: MonitoringPair; filters: ReportFilters }) {
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  async function download(format: ExportFormat) {
    setBusy(format);
    const toastId = toast.loading(format === 'pptx' ? 'Preparing your PowerPoint report…' : 'Preparing your PDF report…');
    try {
      const { generateReport } = await import('./generate');
      const report = await generateReport(pair, filters, format);
      saveBlob(report.blob, report.fileName);
      toast.success('Report downloaded', { id: toastId });
    } catch (err) {
      toast.error(getErrorMessage(err, 'The report could not be generated.'), { id: toastId });
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="shrink-0 bg-white text-slate-900 hover:bg-white/90" disabled={busy !== null}>
            {busy ? <Loader2 className="animate-spin" /> : <Download />}
            Download report
            <ChevronDown className="opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal text-muted-foreground">
            Media Performance Audit Report for {pair.base_company.company_name}, selected period
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => download('pptx')}>
            <Presentation /> Download PowerPoint (.pptx)
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => download('pdf')}>
            <FileText /> Download PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setShareOpen(true)}>
            <Mail /> Email report…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ShareReportDialog open={shareOpen} onOpenChange={setShareOpen} pair={pair} filters={filters} />
    </>
  );
}
