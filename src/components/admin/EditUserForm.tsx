import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import {
  CalendarIcon,
  Pencil,
  Image,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
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
import { User } from '@/services/apiService';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// ──────────────────────────────────────────────────────────────────────────────
// Zod Schema (same as Create)
// ──────────────────────────────────────────────────────────────────────────────
const companyMonitoringSchema = z.object({
  company_id: z.string().min(1, 'Company is required'),
  competitor_company_ids: z
    .array(z.string())
    .min(1, 'At least one competitor is required'),
  media_prominence: z
    .array(z.string())
    .min(1, 'At least one media prominence is required'),
  monitoring_date: z.date({ required_error: 'Monitoring date is required' }),
});

const subsidiaryMonitoringSchema = z.object({
  subsidiary_company_id: z.string().min(1, 'Subsidiary is required'),
  competitor_subsidiary_ids: z
    .array(z.string())
    .min(1, 'At least one competitor subsidiary is required'),
  media_prominence: z
    .array(z.string())
    .min(1, 'At least one media prominence is required'),
});

const formSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    country_code: z.string(),
    mobile_number: z.string().min(5, 'Mobile number is required'),
    gender: z.string().optional(),
    role: z.string(),
    supervisorId: z.string().optional(),
    joinDate: z.date(),
    expirationDate: z.date(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    confirmPassword: z.string().optional(),
    company_monitorings: z.array(companyMonitoringSchema).optional(),
    subsidiary_monitorings: z.array(subsidiaryMonitoringSchema).optional(),
  })
  .refine((d) => !d.password || d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ──────────────────────────────────────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────────────────────────────────────
interface EditUserFormProps {
  user: User;
  onSave: (user: User) => void;
  onCancel: () => void;
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
export default function EditUserForm({
  user,
  onSave,
  onCancel,
}: EditUserFormProps) {
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [showSupervisorField, setShowSupervisorField] = useState(false);
  const [showClientFields, setShowClientFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [companies, setCompanies] = useState<
    { id: number; company_name: string }[]
  >([]);
  const [subsidiaries, setSubsidiaries] = useState<
    {
      id: number;
      subsidiary_company_id: number;
      company_name: string;
    }[]
  >([]);
  const [mediaProminenceOptions, setMediaProminenceOptions] = useState<string[]>([]);

  // ────────────────────────────────────────────────────────────────────────
  // Form
  // ────────────────────────────────────────────────────────────────────────
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user.username || '',
      email: user.email || '',
      role: user.role?.name || user.role || '',
      mobile_number: user.mobile_number?.split(' ')[1] || '',
      country_code: user.mobile_number?.split(' ')[0] || '+234',
      gender: user.gender || '',
      joinDate: user.joinDate ? new Date(user.joinDate) : new Date(),
      expirationDate: user.expirationDate
        ? new Date(user.expirationDate)
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      supervisorId: user.supervisor_id?.toString() || '',
      password: '',
      confirmPassword: '',
      company_monitorings: [],
      subsidiary_monitorings: [],
    },
  });

  const selectedRole = form.watch('role');

  // ────────────────────────────────────────────────────────────────────────
  // Load reference data
  // ────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch =  async () => {
      setLoading(true);
      try {
        const [
          rolesRes,
          supervisorsRes,
          companiesRes,
          subsidiariesRes,
          mediaRes,
        ] = await Promise.all([
          apiService.getRoles(),
          apiService.getSupervisors(),
          apiService.getCompaniesForUser(),
          apiService.getSubsidiaries(),
          apiService.getMediaProminence(),
        ]);

        setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
        setSupervisors(Array.isArray(supervisorsRes.data) ? supervisorsRes.data : []);

        const compData = companiesRes.data?.data ?? [];
        setCompanies(Array.isArray(compData) ? compData : []);

        const subsData = Array.isArray(subsidiariesRes.data)
          ? subsidiariesRes.data.map((i: any) => ({
              id: i.id,
              subsidiary_company_id: i.subsidiary_company_id,
              company_name: i.subsidiaryCompany.company_name,
            }))
          : [];
        setSubsidiaries(subsData);

        const mediaOpts = Array.isArray(mediaRes.data)
          ? mediaRes.data.flatMap((i: any) =>
              Array.isArray(i.categories)
                ? i.categories.flatMap((c: any) =>
                    Array.isArray(c.values) ? c.values.map((v: any) => v.value) : []
                  )
                : []
            )
          : [];
        setMediaProminenceOptions(mediaOpts);
      } catch (e) {
        toast.error('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ────────────────────────────────────────────────────────────────────────
  // Role-based UI
  // ────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const isClient = selectedRole === 'Client';
    const isAnalyst = selectedRole === 'Analyst';

    setShowSupervisorField(isAnalyst);
    setShowClientFields(isClient);

    if (!isAnalyst) form.setValue('supervisorId', '');
    if (!isClient) {
      form.setValue('company_monitorings', []);
      form.setValue('subsidiary_monitorings', []);
    }
  }, [selectedRole, form]);

  // ────────────────────────────────────────────────────────────────────────
  // Initialize client monitorings from user (only once)
  // ────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (selectedRole !== 'Client' || !user.company_monitorings?.length) return;

    const initCompany = (user.company_monitorings || []).map((c: any) => ({
      company_id: c.company_id.toString(),
      competitor_company_ids: (c.competitor_company_ids || []).map(String),
      media_prominence: c.media_prominence || [],
      monitoring_date: c.monitoring_date ? new Date(c.monitoring_date) : null,
    }));
    form.setValue('company_monitorings', initCompany, { shouldValidate: true });

    const initSubs = (user.subsidiary_monitorings || []).map((s: any) => ({
      subsidiary_company_id: s.subsidiary_company_id.toString(),
      competitor_subsidiary_ids: (s.competitor_subsidiary_ids || []).map(String),
      media_prominence: s.media_prominence || [],
    }));
    form.setValue('subsidiary_monitorings', initSubs, { shouldValidate: true });
  }, [user, selectedRole, form]);

  // ────────────────────────────────────────────────────────────────────────
  // Row helpers
  // ────────────────────────────────────────────────────────────────────────
  const addCompanyMonitoring = () => {
    const cur = form.getValues('company_monitorings') ?? [];
    form.setValue(
      'company_monitorings',
      [
        ...cur,
        {
          company_id: '',
          competitor_company_ids: [],
          media_prominence: [],
          monitoring_date: null,
        },
      ],
      { shouldValidate: true, shouldDirty: true, shouldTouch: true }
    );
  };

  const removeCompanyMonitoring = (idx: number) => {
    const cur = form.getValues('company_monitorings') ?? [];
    const updated = cur.filter((_, i) => i !== idx);
    form.setValue(
      'company_monitorings',
      updated.length
        ? updated
        : [
            {
              company_id: '',
              competitor_company_ids: [],
              media_prominence: [],
              monitoring_date: null,
            },
          ],
      { shouldValidate: true, shouldDirty: true, shouldTouch: true }
    );
  };

  const addSubsidiaryMonitoring = () => {
    const cur = form.getValues('subsidiary_monitorings') ?? [];
    form.setValue(
      'subsidiary_monitorings',
      [
        ...cur,
        {
          subsidiary_company_id: '',
          competitor_subsidiary_ids: [],
          media_prominence: [],
        },
      ],
      { shouldValidate: true, shouldDirty: true, shouldTouch: true }
    );
  };

  const removeSubsidiaryMonitoring = (idx: number) => {
    const cur = form.getValues('subsidiary_monitorings') ?? [];
    const updated = cur.filter((_, i) => i !== idx);
    form.setValue(
      'subsidiary_monitorings',
      updated.length
        ? updated
        : [
            {
              subsidiary_company_id: '',
              competitor_subsidiary_ids: [],
              media_prominence: [],
            },
          ],
      { shouldValidate: true, shouldDirty: true, shouldTouch: true }
    );
  };

  // ────────────────────────────────────────────────────────────────────────
  // Submit – FIXED: always send username + gender
  // ────────────────────────────────────────────────────────────────────────
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Ensure id is a string/number
      const userId = typeof user.id === 'object' ? user.id.toString() : user.id;

      const payload: any = {
        id: userId,
        // Always send username (required by backend)
        username: values.username || user.username,
        // Include gender if it exists (helps satisfy backend rule)
        gender: values.gender || user.gender || undefined,
        email: values.email,
        role: values.role,
        country_code: values.country_code,
        mobile_number: values.mobile_number,
        supervisor_id: values.supervisorId ? Number(values.supervisorId) : undefined,
        joinDate: values.joinDate?.toISOString(),
        expiration_date: values.expirationDate?.toISOString(),
        avatar,
        // Only send password if user typed something
        ...(values.password && { password: values.password }),
      };

      // Client monitoring
      if (values.role === 'Client') {
        payload.company_monitorings = (values.company_monitorings ?? []).map((c) => ({
          company_id: Number(c.company_id),
          competitor_company_ids: (c.competitor_company_ids ?? []).map(Number),
          media_prominence: c.media_prominence ?? [],
          monitoring_date: c.monitoring_date?.toISOString(),
        }));

        payload.subsidiary_monitorings = (values.subsidiary_monitorings ?? []).map((s) => ({
          subsidiary_company_id: Number(s.subsidiary_company_id),
          competitor_subsidiary_ids: (s.competitor_subsidiary_ids ?? []).map(Number),
          media_prominence: s.media_prominence ?? [],
        }));
      }

      console.log('Update payload:', payload); // Debug

      const res = await apiService.updateUser(payload);
      toast.success(res.message ?? 'User updated successfully');
      onSave(res.data);
      onCancel();
    } catch (e: any) {
      console.error('Update error:', e.response?.data);
      toast.error(e.response?.data?.message ?? 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const companyMonitorings = form.getValues('company_monitorings') ?? [];
  const subsidiaryMonitorings = form.getValues('subsidiary_monitorings') ?? [];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Avatar */}
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
              const seed = Math.random().toString(36).substring(7);
              setAvatar(`https://api.dicebear.com/7.x/personas/svg?seed=${seed}`);
            }}
            type="button"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Fields */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter username" className="bg-gray-50 border-gray-200" />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Enter email" className="bg-gray-50 border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-2">
            <FormField
              control={form.control}
              name="country_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-50 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="+234">+234 (NG)</SelectItem>
                      <SelectItem value="+1">+1 (US/CA)</SelectItem>
                      <SelectItem value="+44">+44 (UK)</SelectItem>
                      <SelectItem value="+91">+91 (IN)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile_number"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="Enter mobile number" className="bg-gray-50 border-gray-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.name}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Supervisor */}
          {showSupervisorField && (
            <FormField
              control={form.control}
              name="supervisorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Supervisor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Choose supervisor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supervisors.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Client Monitoring */}
          {showClientFields && (
            <>
              {/* Company Monitoring */}
              <div className="space-y-4">
                <Label className="font-semibold text-lg">Company Monitoring</Label>
                {companyMonitorings.map((_, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border p-4 rounded-md relative"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCompanyMonitoring(idx)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      disabled={companyMonitorings.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <FormField
                      control={form.control}
                      name={`company_monitorings.${idx}.company_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Select company" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {companies.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                  {c.company_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`company_monitorings.${idx}.competitor_company_ids`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Competitors *</FormLabel>
                          <MultiSelect
                            options={companies.map((c) => ({
                              value: c.id.toString(),
                              label: c.company_name,
                            }))}
                            selected={field.value ?? []}
                            onChange={(v) => {
                              field.onChange(v ?? []);
                              form.trigger(`company_monitorings.${idx}.competitor_company_ids`);
                            }}
                            placeholder="Select competitors"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`company_monitorings.${idx}.media_prominence`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Media Prominence *</FormLabel>
                          <MultiSelect
                            options={mediaProminenceOptions.map((v) => ({
                              value: v,
                              label: v,
                            }))}
                            selected={field.value ?? []}
                            onChange={(v) => {
                              field.onChange(v ?? []);
                              form.trigger(`company_monitorings.${idx}.media_prominence`);
                            }}
                            placeholder="Select at least one"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`company_monitorings.${idx}.monitoring_date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal bg-gray-50 border-gray-200',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value
                                    ? format(field.value, 'dd MMM yyyy')
                                    : 'Pick a date'}
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
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}

                <Button type="button" onClick={addCompanyMonitoring} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Company Monitoring
                </Button>
              </div>

              {/* Subsidiary Monitoring */}
              <div className="space-y-4 pt-6">
                <Label className="font-semibold text-lg">Subsidiary Monitoring</Label>
                {subsidiaryMonitorings.map((_, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 rounded-md relative"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSubsidiaryMonitoring(idx)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      disabled={subsidiaryMonitorings.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <FormField
                      control={form.control}
                      name={`subsidiary_monitorings.${idx}.subsidiary_company_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subsidiary *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Select subsidiary" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subsidiaries.map((s) => (
                                <SelectItem key={s.id} value={s.subsidiary_company_id.toString()}>
                                  {s.company_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`subsidiary_monitorings.${idx}.competitor_subsidiary_ids`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Competitor Subsidiaries *</FormLabel>
                          <MultiSelect
                            options={subsidiaries.map((s) => ({
                              value: s.subsidiary_company_id.toString(),
                              label: s.company_name,
                            }))}
                            selected={field.value ?? []}
                            onChange={(v) => {
                              field.onChange(v ?? []);
                              form.trigger(`subsidiary_monitorings.${idx}.competitor_subsidiary_ids`);
                            }}
                            placeholder="Select competitors"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`subsidiary_monitorings.${idx}.media_prominence`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Media Prominence *</FormLabel>
                          <MultiSelect
                            options={mediaProminenceOptions.map((v) => ({
                              value: v,
                              label: v,
                            }))}
                            selected={field.value ?? []}
                            onChange={(v) => {
                              field.onChange(v ?? []);
                              form.trigger(`subsidiary_monitorings.${idx}.media_prominence`);
                            }}
                            placeholder="Select at least one"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}

                <Button type="button" onClick={addSubsidiaryMonitoring} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Subsidiary Monitoring
                </Button>
              </div>
            </>
          )}

          {/* Dates */}
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
                            'pl-3 text-left font-normal bg-gray-50 border-gray-200',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'dd MMM yyyy') : 'Select date'}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
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
                            'pl-3 text-left font-normal bg-gray-50 border-gray-200',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'dd MMM yyyy') : 'Select date'}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Password (optional) */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password (leave blank to keep current)</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Enter new password" className="bg-gray-50 border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Confirm new password" className="bg-gray-50 border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="bg-gray-50 hover:bg-gray-100">
              Discard
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-950">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
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