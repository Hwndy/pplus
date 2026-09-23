import { useEffect, useState, type ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

/** Horizontal toolbar that holds a page's filters. */
export function FilterBar({ children, onReset, className }: { children: ReactNode; onReset?: () => void; className?: string }) {
  return (
    <div className={cn('mb-4 flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-end', className)}>
      {children}
      {onReset && (
        <Button variant="ghost" size="sm" onClick={onReset} className="sm:ml-auto">
          <X /> Clear filters
        </Button>
      )}
    </div>
  );
}

/** Text search that notifies the parent after the user stops typing. */
export function SearchInput({ value, onChange, placeholder = 'Search…', className }: {
  value: string; onChange: (value: string) => void; placeholder?: string; className?: string;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (draft === value) return undefined;
    const t = setTimeout(() => onChange(draft), 350);
    return () => clearTimeout(t);
  }, [draft, value, onChange]);

  return (
    <div className={cn('relative w-full sm:w-64', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder} className="pl-9" aria-label={placeholder} />
    </div>
  );
}

const ALL = '__all__';

/** Labelled select whose empty value means "no filter". */
export function FilterSelect({ label, value, onChange, options, allLabel = 'All', className }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex w-full flex-col gap-1.5 sm:w-44', className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? '' : v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{allLabel}</SelectItem>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Labelled native date input used for date-range filters. */
export function FilterDate({ label, value, onChange, min, max }: {
  label: string; value: string; onChange: (value: string) => void; min?: string; max?: string;
}) {
  return (
    <div className="flex w-full flex-col gap-1.5 sm:w-40">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input type="date" value={value} min={min} max={max} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export const REVIEW_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];
