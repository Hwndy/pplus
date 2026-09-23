import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authApi } from '@/api/auth';
import { getErrorMessage } from '@/lib/api-client';
import { AuthLayout } from './AuthLayout';

const schema = z.object({
  email: z.string().trim().min(1, 'Enter your email address').email('Enter a valid email address'),
});
type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  async function onSubmit({ email }: Values) {
    setError(null);
    try {
      await authApi.forgotPassword(email);
      setSentTo(email);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (sentTo) {
    return (
      <AuthLayout title="Check your email">
        <div className="space-y-6">
          <div className="flex gap-3 rounded-lg border bg-muted/40 p-4">
            <MailCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              If an account exists for <span className="font-medium text-foreground">{sentTo}</span>, we&apos;ve sent a link to
              reset your password. The link expires in one hour.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/"><ArrowLeft /> Back to sign in</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot your password?" description="Enter the email address on your account and we'll send you a reset link.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" autoComplete="email" placeholder="name@company.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
            Send reset link
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/"><ArrowLeft /> Back to sign in</Link>
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
