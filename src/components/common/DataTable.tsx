import type { ReactNode } from 'react';
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
}

/** Standard list table: loading skeleton, error + retry, empty state and pagination in one place. */
export function DataTable<T>({
  columns, rows, getRowKey, isLoading, error, onRetry, emptyTitle = 'Nothing here yet',
  emptyDescription, emptyAction, pagination, onPageChange, onRowClick,
}: DataTableProps<T>) {
  if (error) return <ErrorState error={error} onRetry={onRetry} />;

  const alignClass = (col: Column<T>) => (col.align === 'right' ? 'text-right' : undefined);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
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
                {columns.map((col) => (
                  <TableCell key={col.key}><Skeleton className="h-4 w-full max-w-[160px]" /></TableCell>
                ))}
              </TableRow>
            ))}
            {!isLoading && rows && rows.map((row) => (
              <TableRow
                key={getRowKey(row)}
                className={onRowClick ? 'cursor-pointer' : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
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
      {pagination && onPageChange && pagination.totalPages > 1 && (
        <TablePagination pagination={pagination} onPageChange={onPageChange} disabled={isLoading} />
      )}
    </div>
  );
}

export function TablePagination({ pagination, onPageChange, disabled }: {
  pagination: Pagination; onPageChange: (page: number) => void; disabled?: boolean;
}) {
  const { page, totalPages, total, limit } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className="flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
      <span>Showing {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}</span>
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
