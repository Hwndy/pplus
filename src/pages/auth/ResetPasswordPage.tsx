import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoadingState } from '@/components/common/States';
import { authApi } from '@/api/auth';
import { getErrorMessage } from '@/lib/api-client';
import { AuthLayout } from './AuthLayout';
import { PASSWORD_RULE_TEXT, PasswordInput } from './PasswordInput';

const newPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long'),
  confirm: z.string().min(1, 'Confirm your new password'),
}).refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' });
type Values = z.infer<typeof newPasswordSchema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Values>({ resolver: zodResolver(newPasswordSchema), defaultValues: { password: '', confirm: '' } });

  const verification = useQuery({
    queryKey: ['reset-token', token],
    queryFn: () => authApi.verifyResetToken(token),
    enabled: Boolean(token),
    retry: false,
  });

  async function onSubmit({ password }: Values) {
    setError(null);
    try {
      await authApi.resetPassword(token, password);
      toast.success('Your password has been reset. Sign in with your new password.');
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (token && verification.isLoading) {
    return <AuthLayout title="Reset your password"><LoadingState label="Checking your reset link…" /></AuthLayout>;
  }

  if (!token || verification.isError) {
    return (
      <AuthLayout title="This link is no longer valid" description="Reset links expire after one hour and can only be used once.">
        <div className="space-y-3">
          <Button asChild className="w-full"><Link to="/forgot-password">Request a new link</Link></Button>
          <Button asChild variant="ghost" className="w-full"><Link to="/"><ArrowLeft /> Back to sign in</Link></Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" description={`Choose a new password for ${verification.data?.email ?? 'your account'}.`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl><PasswordInput autoComplete="new-password" {...field} /></FormControl>
                <FormDescription>{PASSWORD_RULE_TEXT}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm new password</FormLabel>
                <FormControl><PasswordInput autoComplete="new-password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
            Reset password
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
