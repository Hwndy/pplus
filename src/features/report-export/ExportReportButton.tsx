import { useState } from 'react';
import { ChevronDown, Download, FileText, Loader2, Presentation } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ReportFilters } from '@/api/reports';
import { getErrorMessage, saveBlob } from '@/lib/api-client';
import type { MonitoringPair } from '@/types/api';

type Format = 'pptx' | 'pdf';

/**
 * Downloads the full report pack (every client report) for the selected pair
 * and period as a PowerPoint deck or a PDF. The export code is loaded on demand.
 */
export function ExportReportButton({ pair, filters }: { pair: MonitoringPair; filters: ReportFilters }) {
  const [busy, setBusy] = useState<Format | null>(null);

  async function exportAs(format: Format) {
    setBusy(format);
    const toastId = toast.loading(format === 'pptx' ? 'Preparing your PowerPoint report…' : 'Preparing your PDF report…');
    try {
      const { buildReportPack, reportFileName } = await import('./pack');
      const pack = await buildReportPack(pair, filters);
      const blob = format === 'pptx'
        ? await (await import('./pptx')).renderPptx(pack)
        : (await import('./pdf')).renderPdf(pack);
      saveBlob(blob, reportFileName(pack, format));
      toast.success('Report downloaded', { id: toastId });
    } catch (err) {
      toast.error(getErrorMessage(err, 'The report could not be generated.'), { id: toastId });
    } finally {
      setBusy(null);
    }
  }

  return (
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
          All reports for {pair.base_company.company_name}, selected period
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => exportAs('pptx')}>
          <Presentation /> PowerPoint (.pptx)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => exportAs('pdf')}>
          <FileText /> PDF document
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
