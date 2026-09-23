import { Badge, type BadgeProps } from '@/components/ui/badge';
import { humanize } from '@/lib/format';

const VARIANTS: Record<string, BadgeProps['variant']> = {
  approved: 'success',
  active: 'success',
  positive: 'success',
  pending: 'warning',
  neutral: 'muted',
  inactive: 'muted',
  expired: 'muted',
  rejected: 'danger',
  suspended: 'danger',
  negative: 'danger',
  info: 'muted',
  warning: 'warning',
  error: 'danger',
  critical: 'danger',
};

/** Consistent colour coding for review statuses, account states, sentiment and severity. */
export function StatusBadge({ status, className }: { status: string | null | undefined; className?: string }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge variant={VARIANTS[status.toLowerCase()] ?? 'outline'} className={className}>
      {humanize(status)}
    </Badge>
  );
}
