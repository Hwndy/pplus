import type { ComponentType, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ComponentType<{ className?: string }>;
  loading?: boolean;
  className?: string;
}

/** Single KPI tile. */
export function StatCard({ label, value, hint, icon: Icon, loading, className }: StatCardProps) {
  return (
    <Card className={cn('stat-card', className)}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? <Skeleton className="h-7 w-20" /> : <p className="text-2xl font-semibold tracking-tight">{value}</p>}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className="stat-icon rounded-md p-2">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Titled card section used for charts, tables and detail blocks. */
export function SectionCard({ title, description, actions, children, className, contentClassName }: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={cn('section-card', className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {actions}
      </CardHeader>
      <CardContent className={cn('pt-0', contentClassName)}>{children}</CardContent>
    </Card>
  );
}

/** Responsive grid for StatCards. */
export function StatGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('stat-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>{children}</div>;
}
