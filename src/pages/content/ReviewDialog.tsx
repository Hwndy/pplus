import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: 'approved' | 'rejected';
  itemLabel: string;
  /** Batch review: how many records, and the plural label for the wording. */
  count?: number;
  pluralLabel?: string;
  onSubmit: (note: string) => Promise<unknown>;
}

/** Approve/reject confirmation with an optional note for the analyst (required when rejecting). */
export function ReviewDialog({ open, onOpenChange, decision, itemLabel, count, pluralLabel, onSubmit }: ReviewDialogProps) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const rejecting = decision === 'rejected';
  const batch = count !== undefined && count > 1;
  const what = batch ? `${count} ${(pluralLabel ?? `${itemLabel}s`).toLowerCase()}` : `${itemLabel.toLowerCase()}`;

  useEffect(() => { if (open) setNote(''); }, [open]);

  async function submit() {
    setBusy(true);
    try {
      await onSubmit(note.trim());
      onOpenChange(false);
    } catch {
      // Error already reported by the caller's toast.
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {batch ? `${rejecting ? 'Reject' : 'Approve'} ${what}` : rejecting ? 'Reject submission' : 'Approve submission'}
          </DialogTitle>
          <DialogDescription>
            {rejecting
              ? `${batch ? `These ${what} go` : `The ${what} goes`} back to the analyst for rework. Explain what needs to change.`
              : `${batch ? `These ${what} become` : `The ${what} becomes`} available in client reports.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="review-note">
            {batch ? 'Note for the analysts' : 'Note for the analyst'}{rejecting ? <span className="text-destructive"> *</span> : ' (optional)'}
          </Label>
          <Textarea id="review-note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button
            variant={rejecting ? 'destructive' : 'default'}
            onClick={submit}
            disabled={busy || (rejecting && !note.trim())}
          >
            {busy ? <Loader2 className="animate-spin" /> : rejecting ? <XCircle /> : <CheckCircle2 />}
            {rejecting ? 'Reject' : 'Approve'}{batch ? ` ${count}` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
