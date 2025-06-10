
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, Pencil, Image, Phone, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { User } from './EditUserForm';
import { Textarea } from '@/components/ui/textarea';
import { useCreateUser, useSupervisors } from '@/hooks/useApi';
import { toast } from 'sonner';

interface CreateUserFormProps {
  onSave: (user: User) => void;
  onCancel: () => void;
}

export function CreateUserForm({ onSave, onCancel }: CreateUserFormProps) {
  const [avatar, setAvatar] = useState('');
  const [showSupervisorField, setShowSupervisorField] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createUser = useCreateUser();
  const { data: supervisors } = useSupervisors();

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      role: 'ADMIN',
      mobileContact: '',
      countryCode: '+234',
      joinDate: new Date(),
      expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      password: '',
      confirmPassword: '',
      supervisorId: '',
    },
  });

  // Watch for role changes to show/hide supervisor field
  const selectedRole = form.watch('role');
  
  useEffect(() => {
    // Show supervisor field only when 'ANALYST' or 'CLIENT' role is selected
    setShowSupervisorField(selectedRole === 'ANALYST' || selectedRole === 'CLIENT');

    // Reset supervisor value when role changes to non-analyst/client
    if (selectedRole !== 'ANALYST' && selectedRole !== 'CLIENT') {
      form.setValue('supervisorId', '');
    }
  }, [selectedRole, form]);

  const onSubmit = async (values: any) => {
    if (isSubmitting) return;

    // Validate passwords match
    if (values.password !== values.confirmPassword) {
      form.setError('confirmPassword', {
        type: 'manual',
        message: "Passwords don't match!"
      });
      return;
    }

    // Validate that analyst/client has a supervisor
    if ((values.role === 'ANALYST' || values.role === 'CLIENT') && !values.supervisorId) {
      form.setError('supervisorId', {
        type: 'manual',
        message: "Supervisor is required for analysts and clients"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        mobileContact: values.mobileContact,
        countryCode: values.countryCode,
        supervisorId: values.supervisorId || undefined,
        expirationDate: values.role === 'CLIENT' ? values.expirationDate.toISOString() : undefined,
        avatar,
      };

      const result = await createUser.mutate(userData);
      onSave(result);
      toast.success("User created successfully");
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error("Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-1">
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <Avatar className="h-24 w-24 border-2 border-primary/20 bg-gray-100">
            <AvatarImage src={avatar} />
            <AvatarFallback>
              <Image className="h-10 w-10 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          <Button 
            size="icon" 
            variant="outline" 
            className="absolute bottom-0 right-0 rounded-full h-7 w-7 bg-background border border-input shadow-sm"
            onClick={() => {
              // In a real app, this would open a file selection dialog
              // For this demo, we'll just set a random avatar
              const seed = Math.random().toString(36).substring(7);
              setAvatar(`https://api.dicebear.com/7.x/personas/svg?seed=${seed}`);
            }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Name</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    className="bg-gray-50 border-gray-200" 
                    placeholder="Enter user name"
                  />
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
                <FormLabel>Email ID</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    className="bg-gray-50 border-gray-200" 
                    placeholder="Enter email id"
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mobile Contact with Country Code */}
          <div className="grid grid-cols-3 gap-2">
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country Code</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="+1">+1 (US/CA)</SelectItem>
                      <SelectItem value="+44">+44 (UK)</SelectItem>
                      <SelectItem value="+91">+91 (IN)</SelectItem>
                      <SelectItem value="+61">+61 (AU)</SelectItem>
                      <SelectItem value="+86">+86 (CN)</SelectItem>
                      <SelectItem value="+33">+33 (FR)</SelectItem>
                      <SelectItem value="+49">+49 (DE)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobileContact"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input
                        {...field}
                        className="bg-gray-50 border-gray-200"
                        placeholder="Enter mobile number"
                        type="tel"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                    <SelectItem value="ANALYST">Analyst</SelectItem>
                    <SelectItem value="CLIENT">Client</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Supervisor field - only shown for analysts */}
          {showSupervisorField && (
            <FormField
              control={form.control}
              name="supervisorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Supervisor</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Choose Supervisor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supervisors?.map((supervisor: any) => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="joinDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Join Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal bg-gray-50 border-gray-200",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd MMM yyyy")
                          ) : (
                            <span>Select date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expirationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiration Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal bg-gray-50 border-gray-200",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd MMM yyyy")
                          ) : (
                            <span>Select date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
          </div>

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    className="bg-gray-50 border-gray-200" 
                    placeholder="Enter password"
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password Field */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    className="bg-gray-50 border-gray-200" 
                    placeholder="Confirm Password"
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="bg-gray-50 hover:bg-gray-100 text-gray-800"
              disabled={isSubmitting}
            >
              Discard
            </Button>
            <Button
              type="submit"
              className="bg-indigo-950"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
