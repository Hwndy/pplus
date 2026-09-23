import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface DetailItem {
  label: string;
  value: ReactNode;
  /** Span both columns (long text). */
  wide?: boolean;
}

/** Two-column label/value list used in detail panels. */
export function DetailGrid({ items, className }: { items: DetailItem[]; className?: string }) {
  return (
    <dl className={cn('grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2', className)}>
      {items.map((item) => (
        <div key={item.label} className={cn('min-w-0', item.wide && 'sm:col-span-2')}>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 break-words text-sm text-foreground">
            {item.value === null || item.value === undefined || item.value === '' ? '—' : item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Heading + content block inside detail panels. */
export function DetailSection({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('space-y-3 border-t pt-5 first:border-t-0 first:pt-0', className)}>
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

/** Review notes exchanged between analyst and supervisor. */
export function ReviewNotes({ analystNote, supervisorNote, adminNote }: {
  analystNote?: string | null; supervisorNote?: string | null; adminNote?: string | null;
}) {
  if (!analystNote && !supervisorNote && !adminNote) return null;
  return (
    <DetailSection title="Notes">
      <DetailGrid
        items={[
          ...(analystNote ? [{ label: 'Analyst note', value: analystNote, wide: true }] : []),
          ...(supervisorNote ? [{ label: 'Supervisor note', value: supervisorNote, wide: true }] : []),
          ...(adminNote ? [{ label: 'Admin note', value: adminNote, wide: true }] : []),
        ]}
      />
    </DetailSection>
  );
}

/** Bulleted list with a sensible empty value. */
export function BulletList({ items, empty = 'None recorded' }: { items: string[]; empty?: string }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm">
      {items.map((item, i) => <li key={`${i}-${item}`}>{item}</li>)}
    </ul>
  );
}
