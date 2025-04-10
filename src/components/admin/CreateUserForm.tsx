
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, Pencil, Image, Phone } from 'lucide-react';
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

// Sample supervisors for the demo
const MOCK_SUPERVISORS = [
  { id: 'sup-1', name: 'John Supervisor' },
  { id: 'sup-2', name: 'Sarah Manager' },
  { id: 'sup-3', name: 'Michael Team Lead' },
];

interface CreateUserFormProps {
  onSave: (user: User) => void;
  onCancel: () => void;
}

export function CreateUserForm({ onSave, onCancel }: CreateUserFormProps) {
  const [avatar, setAvatar] = useState('');
  const [showSupervisorField, setShowSupervisorField] = useState(false);
  
  const form = useForm({
    defaultValues: {
      id: `user-${Math.floor(Math.random() * 10000)}`,
      name: '',
      email: '',
      role: 'admin',
      mobileContact: '',
      countryCode: '+1',
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
    // Show supervisor field only when 'analyst' role is selected
    setShowSupervisorField(selectedRole === 'analyst');
    
    // Reset supervisor value when role changes to non-analyst
    if (selectedRole !== 'analyst') {
      form.setValue('supervisorId', '');
    }
  }, [selectedRole, form]);

  const onSubmit = (values: any) => {
    // Validate passwords match
    if (values.password !== values.confirmPassword) {
      form.setError('confirmPassword', { 
        type: 'manual',
        message: "Passwords don't match!" 
      });
      return;
    }
    
    // Validate that analyst has a supervisor
    if (values.role === 'analyst' && !values.supervisorId) {
      form.setError('supervisorId', { 
        type: 'manual',
        message: "Supervisor is required for analysts" 
      });
      return;
    }
    
    const newUser: User = {
      ...values,
      mobileContact: `${values.countryCode} ${values.mobileContact}`,
      avatar,
      active: true,
    };
    onSave(newUser);
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
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User ID</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    className="bg-gray-50 border-gray-200" 
                    placeholder="#ID"
                    disabled
                  />
                </FormControl>
              </FormItem>
            )}
          />

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
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="client">Company</SelectItem>
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
                      {MOCK_SUPERVISORS.map(supervisor => (
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
            >
              Discard
            </Button>
            <Button type="submit" className="bg-indigo-950">Save</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
