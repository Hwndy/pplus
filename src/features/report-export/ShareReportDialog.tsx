import { useEffect, useState, type FormEvent } from 'react';
import { FileText, Loader2, Plus, Presentation, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SHARE_MAX_EXTRA_RECIPIENTS, shareReport, type ReportFilters } from '@/api/reports';
import { isStaleVersionError, reloadForNewVersion } from '@/lib/appVersion';
import { getErrorMessage } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { MonitoringPair } from '@/types/api';
import type { ExportFormat } from './generate';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MAX = 1000;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pair: MonitoringPair;
  filters: ReportFilters;
}

/** E-mails the generated report to the client's own address and/or up to two others. */
export function ShareReportDialog({ open, onOpenChange, pair, filters }: Props) {
  const { user } = useAuth();
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [sendToMe, setSendToMe] = useState(true);
  const [emails, setEmails] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setFormat('pdf');
      setSendToMe(true);
      setEmails([]);
      setMessage('');
      setError(null);
    }
  }, [open]);

  function validate(): string[] | null {
    const extra = emails.map((e) => e.trim().toLowerCase()).filter(Boolean);
    const invalid = extra.find((e) => !EMAIL.test(e));
    if (invalid) {
      setError(`"${invalid}" is not a valid e-mail address.`);
      return null;
    }
    const unique = Array.from(new Set(extra.filter((e) => e !== user?.email?.toLowerCase())));
    if (!sendToMe && !unique.length) {
      setError('Choose at least one recipient.');
      return null;
    }
    setError(null);
    return unique;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const recipients = validate();
    if (!recipients) return;
    setSending(true);
    const toastId = toast.loading('Preparing and sending your report…');
    try {
      const { generateReport } = await import('./generate');
      const report = await generateReport(pair, filters, format);
      const result = await shareReport({
        file: report.blob, fileName: report.fileName, pairId: pair.pair_id, periodLabel: report.periodTitle,
        sendToMe, emails: recipients, message: message.trim() || undefined,
      });
      if (result.failed.length) {
        toast.warning(`Sent to ${result.delivered.join(', ') || 'nobody'}. Could not send to ${result.failed.join(', ')}.`, { id: toastId });
      } else {
        toast.success(`Report sent to ${result.delivered.join(', ')}`, { id: toastId });
      }
      onOpenChange(false);
    } catch (err) {
      if (isStaleVersionError(err) && reloadForNewVersion()) {
        toast.info('The app was updated. Reloading — please send the report again.', { id: toastId });
        return;
      }
      toast.error(getErrorMessage(err, 'The report could not be sent.'), { id: toastId });
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !sending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Email report</DialogTitle>
            <DialogDescription>
              The Media Performance Audit Report for {pair.base_company.company_name} for the selected period is attached to the e-mail.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Format</Label>
            <div className="grid grid-cols-2 gap-2">
              {([['pdf', 'PDF', FileText], ['pptx', 'PowerPoint', Presentation]] as const).map(([value, label, Icon]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormat(value)}
                  aria-pressed={format === value}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                    format === value ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-muted',
                  )}
                >
                  <Icon className="size-4" /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Recipients</Label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-primary" checked={sendToMe} onChange={(e) => setSendToMe(e.target.checked)} />
              Send to my e-mail{user?.email ? <span className="text-muted-foreground">({user.email})</span> : null}
            </label>
            {emails.map((value, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  type="email"
                  inputMode="email"
                  placeholder="name@company.com"
                  value={value}
                  aria-label={`Other recipient ${i + 1}`}
                  onChange={(e) => setEmails((list) => list.map((v, j) => (j === i ? e.target.value : v)))}
                />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove recipient" onClick={() => setEmails((list) => list.filter((_, j) => j !== i))}>
                  <X />
                </Button>
              </div>
            ))}
            {emails.length < SHARE_MAX_EXTRA_RECIPIENTS ? (
              <Button type="button" variant="outline" size="sm" onClick={() => setEmails((list) => [...list, ''])}>
                <Plus /> Add another e-mail
              </Button>
            ) : null}
            <p className="text-xs text-muted-foreground">You can send the report to up to {SHARE_MAX_EXTRA_RECIPIENTS} other addresses.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="share-message">Message (optional)</Label>
            <Textarea id="share-message" rows={3} maxLength={MESSAGE_MAX} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Add a short note for the recipients" />
          </div>

          {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>Cancel</Button>
            <Button type="submit" disabled={sending}>
              {sending ? <Loader2 className="animate-spin" /> : <Send />}
              Send report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
