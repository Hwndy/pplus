import type { ReactNode } from 'react';
import type { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';

const SIZES = { md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' } as const;

interface FormDialogProps<T extends FieldValues> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  submitLabel?: string;
  size?: keyof typeof SIZES;
  children: ReactNode;
}

/**
 * Standard create/edit dialog: scrollable body, Cancel + primary action in the
 * footer, submit button disabled with a spinner while the request runs.
 */
export function FormDialog<T extends FieldValues>({
  open, onOpenChange, title, description, form, onSubmit, submitLabel = 'Save', size = 'md', children,
}: FormDialogProps<T>) {
  const submitting = form.formState.isSubmitting;
  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className={cn('flex max-h-[90vh] flex-col gap-0 p-0', SIZES[size])}>
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col" noValidate>
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">{children}</div>
            <DialogFooter className="border-t px-6 py-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" />}
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
