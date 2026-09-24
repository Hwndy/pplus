import { useEffect, useState, type ReactNode } from 'react';
import { CheckCircle2, Trash2, X, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { RowKey, RowSelection } from '@/components/common/DataTable';
import { useMutationWithToast } from '@/hooks/useMutationWithToast';
import {
  BULK_MAX, CONTENT_RESOURCES, bulkDeleteContent, bulkReviewContent, type ContentKey,
} from '@/api/content';
import { formatNumber } from '@/lib/format';
import type { ReviewStatus, UserRef } from '@/types/api';
import { ReviewDialog } from './ReviewDialog';
import { useContentPermissions } from './useContentPermissions';

type Decision = 'approved' | 'rejected';
interface BulkRow { id: number; status?: ReviewStatus; created_by?: string | UserRef | null }

interface BulkActions<T> {
  /** Pass to DataTable; undefined when the user has no batch actions. */
  selection: RowSelection<T> | undefined;
  /** Action bar shown above the table while rows are selected. */
  toolbar: ReactNode;
  /** Confirmation dialogs; render once next to the table. */
  dialogs: ReactNode;
}

/**
 * Batch approve / reject (admins, and supervisors for their own analysts' work)
 * and batch delete (admins) for one content type. Selection is cleared whenever
 * `resetKey` changes (page, filters, page size) and after every action.
 */
export function useBulkContentActions<T>(resource: ContentKey, resetKey: string): BulkActions<T> {
  const perms = useContentPermissions();
  const def = CONTENT_RESOURCES[resource];
  const [selected, setSelected] = useState<Set<RowKey>>(new Set());
  const [reviewing, setReviewing] = useState<Decision | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { setSelected(new Set()); }, [resetKey]);

  const canReview = perms.role === 'Admin' || perms.role === 'Supervisor';
  const canDelete = perms.role === 'Admin';
  const ids = Array.from(selected).map(Number);
  const invalidate = [['content', resource], ['review']];
  const noun = (n: number) => `${formatNumber(n)} ${n === 1 ? def.label.toLowerCase() : def.pluralLabel.toLowerCase()}`;

  const review = useMutationWithToast({
    mutationFn: ({ decision, note }: { decision: Decision; note: string }) => bulkReviewContent(resource, ids, decision, note),
    successMessage: (r) => `${noun(r.updated)} ${r.status}`,
    invalidate,
    onSuccess: () => setSelected(new Set()),
  });
  const remove = useMutationWithToast({
    mutationFn: () => bulkDeleteContent(resource, ids),
    successMessage: (r) => `${noun(r.deleted)} deleted`,
    invalidate,
    onSuccess: () => setSelected(new Set()),
  });

  if (!canReview) return { selection: undefined, toolbar: null, dialogs: null };

  const selection: RowSelection<T> = {
    selected,
    onChange: setSelected,
    // Supervisors only get checkboxes on submissions they are allowed to review.
    canSelect: (row) => perms.canReview(row as unknown as BulkRow),
  };

  const tooMany = ids.length > BULK_MAX;
  const toolbar = ids.length > 0 && (
    <div className="mb-3 flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium">
        {noun(ids.length)} selected
        {tooMany && <span className="ml-2 font-normal text-destructive">Select at most {formatNumber(BULK_MAX)} at a time.</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setReviewing('approved')} disabled={tooMany}><CheckCircle2 /> Approve</Button>
        <Button size="sm" variant="outline" onClick={() => setReviewing('rejected')} disabled={tooMany}><XCircle /> Reject</Button>
        {canDelete && (
          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleting(true)} disabled={tooMany}>
            <Trash2 /> Delete
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}><X /> Clear</Button>
      </div>
    </div>
  );

  const dialogs = (
    <>
      {reviewing && (
        <ReviewDialog
          open
          onOpenChange={(open) => !open && setReviewing(null)}
          decision={reviewing}
          itemLabel={def.label}
          count={ids.length}
          pluralLabel={def.pluralLabel}
          onSubmit={(note) => review.mutateAsync({ decision: reviewing, note })}
        />
      )}
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={`Delete ${noun(ids.length)}?`}
        description="They will be removed from lists and reports. This can't be undone from the app."
        confirmLabel={`Delete ${formatNumber(ids.length)}`}
        destructive
        onConfirm={() => remove.mutateAsync()}
      />
    </>
  );

  return { selection, toolbar, dialogs };
}
