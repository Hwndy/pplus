import { useState, type ReactNode } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface Option {
  value: string;
  label: string;
}

/** Turns a list of strings into select options. */
export const toOptions = (values: string[] | undefined): Option[] => (values ?? []).map((v) => ({ value: v, label: v }));

interface BaseFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  description?: ReactNode;
  required?: boolean;
  className?: string;
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <FormLabel>
      {label}
      {required && <span className="ml-0.5 text-destructive" aria-hidden>*</span>}
    </FormLabel>
  );
}

export function TextField<T extends FieldValues>({
  control, name, label, description, required, className, type = 'text', placeholder, autoComplete,
}: BaseFieldProps<T> & { type?: string; placeholder?: string; autoComplete?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FieldLabel label={label} required={required} />
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              {...field}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(type === 'number' ? (e.target.value === '' ? undefined : e.target.valueAsNumber) : e.target.value)}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function TextareaField<T extends FieldValues>({
  control, name, label, description, required, className, placeholder, rows = 3,
}: BaseFieldProps<T> & { placeholder?: string; rows?: number }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FieldLabel label={label} required={required} />
          <FormControl>
            <Textarea placeholder={placeholder} rows={rows} {...field} value={field.value ?? ''} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/** Short fixed option list. For long or remote lists use ComboboxField. */
export function SelectField<T extends FieldValues>({
  control, name, label, description, required, className, options, placeholder = 'Select…',
}: BaseFieldProps<T> & { options: Option[]; placeholder?: string }) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FieldLabel label={label} required={required} />
          <Select value={field.value ? String(field.value) : ''} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface ComboboxProps {
  options: Option[];
  placeholder?: string;
  loading?: boolean;
  /** Allow a free-text value that is not in the list. */
  allowCustom?: boolean;
}

/** Searchable single select. Stores the option value (string); use `numeric` to store numbers. */
export function ComboboxField<T extends FieldValues>({
  control, name, label, description, required, className, options, placeholder = 'Select…', loading, allowCustom, numeric,
}: BaseFieldProps<T> & ComboboxProps & { numeric?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const current = field.value === undefined || field.value === null ? '' : String(field.value);
        const selected = options.find((o) => o.value === current);
        const display = selected?.label ?? (current || '');
        const canAddCustom = allowCustom && query.trim() && !options.some((o) => o.label.toLowerCase() === query.trim().toLowerCase());
        const pick = (value: string) => {
          field.onChange(numeric ? Number(value) : value);
          setOpen(false);
          setQuery('');
        };
        return (
          <FormItem className={cn('flex flex-col', className)}>
            <FieldLabel label={label} required={required} />
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full justify-between font-normal', !display && 'text-muted-foreground')}
                  >
                    <span className="truncate">{loading ? 'Loading…' : display || placeholder}</span>
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search…" value={query} onValueChange={setQuery} />
                  <CommandList>
                    <CommandEmpty>{loading ? 'Loading…' : 'No matches found.'}</CommandEmpty>
                    <CommandGroup>
                      {canAddCustom && (
                        <CommandItem value={`__custom__${query}`} onSelect={() => pick(query.trim())}>
                          Use &ldquo;{query.trim()}&rdquo;
                        </CommandItem>
                      )}
                      {options.map((o) => (
                        <CommandItem key={o.value} value={o.label} onSelect={() => pick(o.value)}>
                          <Check className={cn('mr-2 h-4 w-4', current === o.value ? 'opacity-100' : 'opacity-0')} />
                          {o.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

/** Searchable multi select storing an array of values (numbers when `numeric`). */
export function MultiComboboxField<T extends FieldValues>({
  control, name, label, description, required, className, options, placeholder = 'Select…', loading, numeric,
}: BaseFieldProps<T> & Omit<ComboboxProps, 'allowCustom'> & { numeric?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const values: string[] = (field.value ?? []).map(String);
        const toggle = (value: string) => {
          const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
          field.onChange(numeric ? next.map(Number) : next);
        };
        return (
          <FormItem className={cn('flex flex-col', className)}>
            <FieldLabel label={label} required={required} />
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button type="button" variant="outline" role="combobox" className="h-auto min-h-10 w-full justify-between font-normal">
                    <span className="flex flex-wrap gap-1">
                      {values.length === 0 && <span className="text-muted-foreground">{loading ? 'Loading…' : placeholder}</span>}
                      {values.map((v) => (
                        <Badge key={v} variant="secondary" className="gap-1">
                          {options.find((o) => o.value === v)?.label ?? v}
                          <span
                            role="button"
                            tabIndex={0}
                            aria-label="Remove"
                            onClick={(e) => { e.stopPropagation(); toggle(v); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); toggle(v); } }}
                          >
                            <X className="h-3 w-3" />
                          </span>
                        </Badge>
                      ))}
                    </span>
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search…" />
                  <CommandList>
                    <CommandEmpty>{loading ? 'Loading…' : 'No matches found.'}</CommandEmpty>
                    <CommandGroup>
                      {options.map((o) => (
                        <CommandItem key={o.value} value={o.label} onSelect={() => toggle(o.value)}>
                          <Check className={cn('mr-2 h-4 w-4', values.includes(o.value) ? 'opacity-100' : 'opacity-0')} />
                          {o.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
