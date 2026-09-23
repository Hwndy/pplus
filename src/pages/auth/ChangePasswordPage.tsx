import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authApi } from '@/api/auth';
import { useAuth } from '@/components/auth/AuthContext';
import { getErrorMessage } from '@/lib/api-client';
import { AuthLayout } from './AuthLayout';
import { PASSWORD_RULE_TEXT, PasswordInput } from './PasswordInput';

const schema = z.object({
  email: z.string().trim().min(1, 'Enter your email address').email('Enter a valid email address'),
  current: z.string().min(1, 'Enter the temporary password you received'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long'),
  confirm: z.string().min(1, 'Confirm your new password'),
})
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' })
  .refine((v) => v.password !== v.current, { path: ['password'], message: 'Choose a password different from your current one' });
type Values = z.infer<typeof schema>;

/** First sign-in: accounts created by an administrator must replace their temporary password. */
export default function ChangePasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const initialEmail = (location.state as { email?: string } | null)?.email ?? '';
  const [error, setError] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: initialEmail, current: '', password: '', confirm: '' },
  });

  async function onSubmit(values: Values) {
    setError(null);
    try {
      await authApi.firstTimePasswordChange(values.email, values.current, values.password);
      toast.success('Password updated.');
      try {
        await login(values.email, values.password);
        navigate('/dashboard', { replace: true });
      } catch {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <AuthLayout
      title="Set your password"
      description="Your account was created with a temporary password. Choose a new password to continue."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" autoComplete="email" {...field} readOnly={Boolean(initialEmail)} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="current"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temporary password</FormLabel>
                <FormControl><PasswordInput autoComplete="current-password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            Update password
          </Button>
          <Button asChild variant="ghost" className="w-full"><Link to="/"><ArrowLeft /> Back to sign in</Link></Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
