import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/AuthContext';
import { DELETE_CONFIRMATION, profileApi } from '@/api/profile';
import { getErrorMessage, tokenStore } from '@/lib/api-client';
import { PASSWORD_RULE_TEXT, PasswordInput } from '@/pages/auth/PasswordInput';

const usernameSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(20, 'Username must be at most 20 characters'),
});

const passwordSchema = z.object({
  current: z.string().min(1, 'Enter your current password'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long'),
  confirm: z.string().min(1, 'Confirm your new password'),
})
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' })
  .refine((v) => v.password !== v.current, { path: ['password'], message: 'Choose a password different from your current one' });

function AccountDetails() {
  const { user, refreshUser } = useAuth();
  const form = useForm<z.infer<typeof usernameSchema>>({ resolver: zodResolver(usernameSchema), defaultValues: { username: user?.username ?? '' } });
  const submitting = form.formState.isSubmitting;

  useEffect(() => {
    if (user) form.reset({ username: user.username });
  }, [user, form]);

  async function onSubmit({ username }: z.infer<typeof usernameSchema>) {
    try {
      await profileApi.updateUsername(username);
      await refreshUser();
      toast.success('Username updated');
    } catch (err) {
      form.setError('username', { message: getErrorMessage(err, 'Your username could not be updated.') });
    }
  }

  if (!user) return null;
  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardHeader>
            <CardTitle className="text-lg">Account details</CardTitle>
            <CardDescription>Your username is shown to your team. Contact an administrator to change your e-mail address.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl><Input autoComplete="username" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="profile-email">E-mail</Label>
              <Input id="profile-email" value={user.email} readOnly disabled />
            </div>
            {user.role.name !== 'Client' && (
              <div className="space-y-2">
                <Label>Role</Label>
                <div><Badge variant="secondary">{user.role.name}</Badge></div>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={submitting || !form.formState.isDirty}>
              {submitting && <Loader2 className="animate-spin" />}
              Save username
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

function ChangePassword() {
  const form = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema), defaultValues: { current: '', password: '', confirm: '' } });
  const submitting = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof passwordSchema>) {
    try {
      const { token } = await profileApi.changePassword(values.current, values.password);
      // Sessions started before the change stop working; this one continues with the new token.
      tokenStore.set(token);
      form.reset();
      toast.success('Password changed. You have been signed out on other devices.');
    } catch (err) {
      form.setError('current', { message: getErrorMessage(err, 'Your password could not be changed.') });
    }
  }

  const fields = [
    { name: 'current', label: 'Current password', autoComplete: 'current-password' },
    { name: 'password', label: 'New password', autoComplete: 'new-password', hint: PASSWORD_RULE_TEXT },
    { name: 'confirm', label: 'Confirm new password', autoComplete: 'new-password' },
  ] as const;

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardHeader>
            <CardTitle className="text-lg">Change password</CardTitle>
            <CardDescription>You will stay signed in here; other devices will be signed out.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {fields.map((f) => (
              <FormField
                key={f.name}
                control={form.control}
                name={f.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{f.label}</FormLabel>
                    <FormControl><PasswordInput autoComplete={f.autoComplete} {...field} /></FormControl>
                    {'hint' in f && <FormDescription>{f.hint}</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              Change password
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

function DeleteAccount() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const confirmed = confirmation === DELETE_CONFIRMATION && password.length > 0;

  useEffect(() => {
    if (open) {
      setPassword('');
      setConfirmation('');
      setError(null);
    }
  }, [open]);

  async function onDelete() {
    if (!confirmed) return;
    setDeleting(true);
    setError(null);
    try {
      await profileApi.deleteAccount(password, confirmation);
      toast.success('Your account has been permanently deleted.');
      await logout().catch(() => {});
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Your account could not be deleted.'));
      setDeleting(false);
    }
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-lg text-destructive">Delete account</CardTitle>
        <CardDescription>
          Permanently delete your account and erase your personal details. This cannot be undone: you will lose access immediately,
          any report subscriptions end, and the account cannot be restored.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end">
        <Button variant="destructive" onClick={() => setOpen(true)}>
          <Trash2 /> Delete my account
        </Button>
      </CardFooter>

      <Dialog open={open} onOpenChange={(next) => !deleting && setOpen(next)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" /> Delete your account permanently?
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be reversed. Your account and personal details will be erased and you will be signed out.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-password">Your password</Label>
              <PasswordInput id="delete-password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm">Type <span className="font-mono font-semibold">{DELETE_CONFIRMATION}</span> to confirm</Label>
              <Input id="delete-confirm" autoComplete="off" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={onDelete} disabled={!confirmed || deleting}>
              {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Permanently delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/** The signed-in user's own account: username, password and account deletion. */
export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Profile" description="Manage your account details, password and account." />
      <AccountDetails />
      <ChangePassword />
      <DeleteAccount />
    </div>
  );
}
