import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/FileUpload';
import { useCreateUser, useUpdateUser, useSupervisors } from '@/hooks/useApi';
import { toast } from 'sonner';
import { Loader2, User, Save, X, Eye, EyeOff } from 'lucide-react';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'ANALYST', 'CLIENT'], {
    required_error: 'Role is required',
  }),
  mobileContact: z.string().optional(),
  countryCode: z.string().default('+234'),
  supervisorId: z.string().optional(),
  expirationDate: z.string().optional(),
  avatar: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: UserFormData & { id?: string };
  onSuccess?: (user: UserFormData & { id?: string }) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

const roles = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'ANALYST', label: 'Analyst' },
  { value: 'CLIENT', label: 'Client' },
];

const countryCodes = [
  { value: '+234', label: '+234 (Nigeria)' },
  { value: '+1', label: '+1 (US/Canada)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+27', label: '+27 (South Africa)' },
  { value: '+233', label: '+233 (Ghana)' },
];

export function UserForm({ user, onSuccess, onCancel, mode = 'create' }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const { data: supervisors } = useSupervisors();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'ANALYST',
      mobileContact: user?.mobileContact || '',
      countryCode: user?.countryCode || '+234',
      supervisorId: user?.supervisorId || '',
      expirationDate: user?.expirationDate ? new Date(user.expirationDate).toISOString().split('T')[0] : '',
      avatar: user?.avatar || '',
    },
  });

  const selectedRole = form.watch('role');

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);
      
      const formData = {
        ...data,
        avatar: avatarUrl,
        expirationDate: data.expirationDate ? new Date(data.expirationDate).toISOString() : undefined,
      };

      // Remove password if it's empty in edit mode
      if (mode === 'edit' && !data.password) {
        delete formData.password;
      }

      let result;
      if (mode === 'edit' && user?.id) {
        result = await updateUser.mutate({ id: user.id, data: formData });
        toast.success('User updated successfully');
      } else {
        result = await createUser.mutate(formData);
        toast.success('User created successfully');
      }

      onSuccess?.(result);
      
      if (mode === 'create') {
        form.reset();
        setAvatarUrl('');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(mode === 'edit' ? 'Failed to update user' : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = (files: any[]) => {
    if (files.length > 0) {
      const uploadedFile = files[0];
      setAvatarUrl(uploadedFile.url);
      form.setValue('avatar', uploadedFile.url);
      toast.success('Avatar uploaded successfully');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {mode === 'edit' ? 'Edit User' : 'Create New User'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password {mode === 'create' ? '*' : '(leave empty to keep current)'}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder={mode === 'create' ? "Enter password" : "Enter new password"}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role and Supervisor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(selectedRole === 'ANALYST' || selectedRole === 'CLIENT') && supervisors && (
                <FormField
                  control={form.control}
                  name="supervisorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supervisor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select supervisor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {supervisors.map((supervisor: any) => (
                            <SelectItem key={supervisor.id} value={supervisor.id}>
                              {supervisor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Code</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countryCodes.map((code) => (
                          <SelectItem key={code.value} value={code.value}>
                            {code.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="mobileContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="xxx-xxx-xxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Expiration Date for Clients */}
            {selectedRole === 'CLIENT' && (
              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Expiration Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Avatar Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Profile Avatar</label>
              <FileUpload
                uploadType="avatar"
                accept="image/*"
                maxSize={2}
                onUploadComplete={handleAvatarUpload}
                className="border-dashed"
              />
              {avatarUrl && (
                <div className="mt-2">
                  <img 
                    src={avatarUrl} 
                    alt="Avatar preview" 
                    className="h-16 w-16 object-cover border rounded-full"
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting || createUser.loading || updateUser.loading}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {mode === 'edit' ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
