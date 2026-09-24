import { useEffect, useRef, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Pagination } from '@/types/api';
import { EmptyState, ErrorState } from './States';

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Right-align (numbers, actions). */
  align?: 'left' | 'right';
}

export type RowKey = string | number;

/** Optional row checkboxes (batch actions). Only rows passing `canSelect` get a checkbox. */
export interface RowSelection<T> {
  selected: ReadonlySet<RowKey>;
  onChange: (next: Set<RowKey>) => void;
  canSelect?: (row: T) => boolean;
}

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  getRowKey: (row: T) => string | number;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  emptyAction?: ReactNode;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  selection?: RowSelection<T>;
  /** Shows a rows-per-page picker when provided. */
  onPageSizeChange?: (size: number) => void;
}

function Checkbox({ checked, indeterminate, onChange, label, disabled }: {
  checked: boolean; indeterminate?: boolean; onChange: (checked: boolean) => void; label: string; disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = Boolean(indeterminate); }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      className="h-4 w-4 cursor-pointer rounded border-input align-middle accent-primary disabled:cursor-not-allowed disabled:opacity-40"
      checked={checked}
      disabled={disabled}
      aria-label={label}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}

/** Standard list table: loading skeleton, error + retry, empty state and pagination in one place. */
export function DataTable<T>({
  columns, rows, getRowKey, isLoading, error, onRetry, emptyTitle = 'Nothing here yet',
  emptyDescription, emptyAction, pagination, onPageChange, onRowClick, selection, onPageSizeChange,
}: DataTableProps<T>) {
  if (error) return <ErrorState error={error} onRetry={onRetry} />;

  const selectable = selection && rows ? rows.filter((r) => selection.canSelect?.(r) ?? true) : [];
  const selectedOnPage = selectable.filter((r) => selection?.selected.has(getRowKey(r))).length;
  const toggleAll = (checked: boolean) => {
    if (!selection) return;
    const next = new Set(selection.selected);
    for (const r of selectable) {
      if (checked) next.add(getRowKey(r)); else next.delete(getRowKey(r));
    }
    selection.onChange(next);
  };
  const toggleRow = (row: T, checked: boolean) => {
    if (!selection) return;
    const next = new Set(selection.selected);
    if (checked) next.add(getRowKey(row)); else next.delete(getRowKey(row));
    selection.onChange(next);
  };
  const showPager = pagination && onPageChange && (pagination.totalPages > 1 || (onPageSizeChange && pagination.total > PAGE_SIZE_OPTIONS[0]));

  const alignClass = (col: Column<T>) => (col.align === 'right' ? 'text-right' : undefined);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {selection && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectable.length > 0 && selectedOnPage === selectable.length}
                    indeterminate={selectedOnPage > 0 && selectedOnPage < selectable.length}
                    disabled={isLoading || selectable.length === 0}
                    onChange={toggleAll}
                    label="Select all on this page"
                  />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead key={col.key} className={cn('whitespace-nowrap', alignClass(col), col.className)}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {selection && <TableCell />}
                {columns.map((col) => (
                  <TableCell key={col.key}><Skeleton className="h-4 w-full max-w-[160px]" /></TableCell>
                ))}
              </TableRow>
            ))}
            {!isLoading && rows && rows.map((row) => (
              <TableRow
                key={getRowKey(row)}
                className={onRowClick ? 'cursor-pointer' : undefined}
                data-state={selection?.selected.has(getRowKey(row)) ? 'selected' : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {selection && (
                  <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                    {(selection.canSelect?.(row) ?? true) && (
                      <Checkbox
                        checked={selection.selected.has(getRowKey(row))}
                        onChange={(checked) => toggleRow(row, checked)}
                        label="Select row"
                      />
                    )}
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell key={col.key} className={cn(alignClass(col), col.className)}>{col.cell(row)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!isLoading && rows && rows.length === 0 && (
          <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
        )}
      </div>
      {showPager && pagination && onPageChange && (
        <TablePagination pagination={pagination} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} disabled={isLoading} />
      )}
    </div>
  );
}

export function TablePagination({ pagination, onPageChange, onPageSizeChange, disabled }: {
  pagination: Pagination; onPageChange: (page: number) => void; onPageSizeChange?: (size: number) => void; disabled?: boolean;
}) {
  const { page, totalPages, total, limit } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className="flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
      <div className="flex flex-wrap items-center gap-3">
        <span>Showing {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}</span>
        {onPageSizeChange && (
          <label className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground"
              value={limit}
              disabled={disabled}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={disabled || page <= 1}>
          <ChevronLeft /> Previous
        </Button>
        <span className="px-2">Page {page} of {totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={disabled || page >= totalPages}>
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
