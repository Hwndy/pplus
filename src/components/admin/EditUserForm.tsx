import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, Pencil, Image, Loader2, Plus, Trash2 } from 'lucide-react';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { User, apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// ──────────────────────────────────────────────────────────────────────────────
// Zod Schema — mirrors the updated backend structure exactly
// ──────────────────────────────────────────────────────────────────────────────
const subsidiaryMonitoringSchema = z.object({
  id: z.number().optional(),                                                      // present = update existing
  subsidiary_id: z.string().min(1, 'Subsidiary is required'),
  competitor_subsidiary_ids: z.array(z.string()).min(1, 'At least one competitor subsidiary required'),
  media_prominence: z.array(z.string()).min(1, 'Media prominence required'),
});

const companyMonitoringSchema = z.object({
  id: z.number().optional(),                                                      // present = update existing
  company_id: z.string().min(1, 'Company is required'),
  competitor_company_ids: z.array(z.string()).min(1, 'At least one competitor required'),
  media_prominence: z.array(z.string()).min(1, 'At least one media prominence required'),
  monitoring_date: z.date({ required_error: 'Monitoring date is required' }),
  subsidiary_monitorings: z.array(subsidiaryMonitoringSchema).optional().default([]),
});

const formSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    country_code: z.string(),
    mobile_number: z.string().min(5, 'Mobile number is required'),
    role: z.string(),
    supervisor_id: z.string().optional(),
    // password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
    // confirmPassword: z.string().optional().or(z.literal('')),
    company_monitorings: z.array(companyMonitoringSchema).optional().default([]),
  })
  // .refine((d) => !d.password || d.password === d.confirmPassword, {
  //   message: "Passwords don't match",
  //   path: ['confirmPassword'],
  // })
  .refine((d) => d.role !== 'Analyst' || (d.supervisor_id && d.supervisor_id.trim() !== ''), {
    message: 'Supervisor is required for Analyst role',
    path: ['supervisor_id'],
  });

type FormValues = z.infer<typeof formSchema>;

interface EditUserFormProps {
  user: User;
  onSave: (user: User) => void;
  onCancel: () => void;
}

export default function EditUserForm({ user, onSave, onCancel }: EditUserFormProps) {
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [showSupervisorField, setShowSupervisorField] = useState(false);
  const [showClientFields, setShowClientFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [companies, setCompanies] = useState<{ id: number; company_name: string }[]>([]);
  const [subsidiaries, setSubsidiaries] = useState<{ id: number; company_name: string }[]>([]);
  const [mediaProminenceOptions, setMediaProminenceOptions] = useState<string[]>([]);

  // ────────────────────────────────────────────────────────────────────────────
  // Derive the role name from the user object for defaultValues
  // ────────────────────────────────────────────────────────────────────────────
  const userRoleName = user.role?.name ?? '';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user.username ?? '',
      email: user.email ?? '',
      role: userRoleName,
      mobile_number: user.mobile_number?.split(' ')[1] ?? user.mobile_number ?? '',
      country_code: user.mobile_number?.split(' ')[0] ?? '+234',
      supervisor_id: user.supervisor_id?.toString() ?? '',
      // password: '',
      // confirmPassword: '',
      // Pre-populate nested structure from existing user data
      company_monitorings: (user.company_monitorings ?? []).map((cm: any) => ({
        id: cm.id,
        company_id: cm.company_id?.toString() ?? '',
        competitor_company_ids: (cm.competitor_company_ids ?? []).map(String),
        media_prominence: cm.media_prominence ?? [],
        monitoring_date: cm.monitoring_date ? new Date(cm.monitoring_date) : new Date(),
        // Map nested subsidiary_monitorings from the company monitoring
        subsidiary_monitorings: (cm.subsidiary_monitorings ?? []).map((sm: any) => ({
          id: sm.id,
          subsidiary_id: sm.subsidiary_id?.toString() ?? '',
          competitor_subsidiary_ids: (sm.competitor_subsidiary_ids ?? []).map(String),
          media_prominence: sm.media_prominence ?? [],
        })),
      })),
    },
  });

  // Top-level company monitorings field array
  const { fields: companyFields, append: appendCompany, remove: removeCompany } = useFieldArray({
    control: form.control,
    name: 'company_monitorings',
  });

  const selectedRole = form.watch('role');

  // ────────────────────────────────────────────────────────────────────────────
  // Fetch all reference data — same pattern as create form
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rolesRes, supervisorsRes, companiesRes, subsidiariesRes, mediaRes] = await Promise.all([
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

        // ── Match the create form's subsidiary mapping exactly ──
        const subsData = subsidiariesRes.data?.data ?? subsidiariesRes.data ?? [];
        setSubsidiaries(
          Array.isArray(subsData)
            ? subsData.map((s: any) => ({
                id: s.id,
                company_name: s.company_name,
              }))
            : []
        );

        // ── Match the create form's media prominence mapping exactly ──
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
      } catch {
        toast.error('Failed to load form data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // Role-based UI toggling — same logic as create form
  // ────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const isClient = selectedRole === 'Client';
    const isAnalyst = selectedRole === 'Analyst';

    setShowSupervisorField(isAnalyst);
    setShowClientFields(isClient);

    if (!isAnalyst) form.setValue('supervisor_id', '');

    if (isClient && companyFields.length === 0) {
      appendCompany({
        company_id: '',
        competitor_company_ids: [],
        media_prominence: [],
        monitoring_date: new Date(),
        subsidiary_monitorings: [],
      });
    } else if (!isClient) {
      form.setValue('company_monitorings', []);
    }
  }, [selectedRole]); // eslint-disable-line react-hooks/exhaustive-deps

  // ────────────────────────────────────────────────────────────────────────────
  // Submit — build payload matching updated backend exactly
  // ────────────────────────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload: any = {
        username: values.username,
        email: values.email,
        country_code: values.country_code,
        mobile_number: values.mobile_number,
        role: values.role,
      };

      // if (values.password) {
      //   payload.password = values.password;
      // }

      if (values.role === 'Analyst' && values.supervisor_id) {
        payload.supervisor_id = values.supervisor_id;
      }

      if (values.role === 'Client' && values.company_monitorings?.length) {
        payload.company_monitorings = values.company_monitorings.map((cm) => {
          const built: any = {
            company_id: Number(cm.company_id),
            competitor_company_ids: cm.competitor_company_ids.map(Number),
            media_prominence: cm.media_prominence,
            monitoring_date: cm.monitoring_date.toISOString().split('T')[0],
            subsidiary_monitorings: (cm.subsidiary_monitorings ?? []).map((sm) => {
              const builtSm: any = {
                subsidiary_id: Number(sm.subsidiary_id),
                competitor_subsidiary_ids: sm.competitor_subsidiary_ids.map(Number),
                media_prominence: sm.media_prominence,
              };
              if (sm.id) builtSm.id = sm.id; // include id only when updating existing
              return builtSm;
            }),
          };
          if (cm.id) built.id = cm.id; // include id only when updating existing
          return built;
        });
      }

      const res = await apiService.updateUser(user.id.toString(), payload);
      toast.success(res.message ?? 'User updated successfully');
      onSave(res.data);
      onCancel();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            size="icon" variant="outline" type="button"
            className="absolute bottom-0 right-0 rounded-full h-7 w-7 bg-background border border-input shadow-sm"
            onClick={() => setAvatar(`https://api.dicebear.com/7.x/personas/svg?seed=${Math.random().toString(36).substring(7)}`)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Username & Email */}
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter username" className="bg-gray-50 border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Enter email" className="bg-gray-50 border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Phone */}
          <div className="grid grid-cols-3 gap-2">
            <FormField control={form.control} name="country_code" render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-50 border-gray-200"><SelectValue /></SelectTrigger>
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
            )} />
            <FormField control={form.control} name="mobile_number" render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" placeholder="Enter mobile number" className="bg-gray-50 border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Role */}
          <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          {/* Supervisor (Analyst only) */}
          {showSupervisorField && (
            <FormField control={form.control} name="supervisor_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Assign Supervisor <span className="text-red-600">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select a supervisor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {supervisors.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.username} {s.email ? `(${s.email})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          )}

          {/* ── Client: Company Monitoring with nested Subsidiary Monitorings ── */}
          {showClientFields && (
            <div className="space-y-6">
              <Label className="font-semibold text-lg">Company Monitoring Configuration</Label>

              {companyFields.map((companyField, companyIdx) => (
                <CompanyMonitoringBlock
                  key={companyField.id}
                  companyIdx={companyIdx}
                  form={form}
                  companies={companies}
                  subsidiaries={subsidiaries}
                  mediaProminenceOptions={mediaProminenceOptions}
                  canRemove={companyFields.length > 1}
                  onRemove={() => removeCompany(companyIdx)}
                />
              ))}

              <Button
                type="button" variant="outline" className="w-full"
                onClick={() => appendCompany({
                  company_id: '',
                  competitor_company_ids: [],
                  media_prominence: [],
                  monitoring_date: new Date(),
                  subsidiary_monitorings: [],
                })}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Another Company Monitoring
              </Button>
            </div>
          )}

          {/* Password (optional on edit) */}
          {/* <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Enter new password" className="bg-gray-50 border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Confirm new password" className="bg-gray-50 border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div> */}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Discard</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-950 hover:bg-indigo-800">
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-component: one company monitoring block with its nested subsidiaries
// Extracted to keep the parent clean and avoid re-render issues with watch()
// ──────────────────────────────────────────────────────────────────────────────
function CompanyMonitoringBlock({
  companyIdx, form, companies, subsidiaries, mediaProminenceOptions, canRemove, onRemove,
}: {
  companyIdx: number;
  form: any;
  companies: { id: number; company_name: string }[];
  subsidiaries: { id: number; company_name: string }[];
  mediaProminenceOptions: string[];
  canRemove: boolean;
  onRemove: () => void;
}) {
  const subsidiaryMonitorings = form.watch(`company_monitorings.${companyIdx}.subsidiary_monitorings`) ?? [];

  const addSubsidiary = () => {
    form.setValue(
      `company_monitorings.${companyIdx}.subsidiary_monitorings`,
      [...subsidiaryMonitorings, { subsidiary_id: '', competitor_subsidiary_ids: [], media_prominence: [] }],
      { shouldDirty: true }
    );
  };

  const removeSubsidiary = (subIdx: number) => {
    form.setValue(
      `company_monitorings.${companyIdx}.subsidiary_monitorings`,
      subsidiaryMonitorings.filter((_: any, i: number) => i !== subIdx),
      { shouldDirty: true }
    );
  };

  return (
    <div className="border p-6 rounded-lg bg-gray-50 relative space-y-6">
      <Button
        type="button" variant="ghost" size="icon" disabled={!canRemove} onClick={onRemove}
        className="absolute top-2 right-2 text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Company monitoring fields */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FormField control={form.control} name={`company_monitorings.${companyIdx}.company_id`} render={({ field }) => (
          <FormItem>
            <FormLabel>Company *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.company_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name={`company_monitorings.${companyIdx}.competitor_company_ids`} render={({ field }) => (
          <FormItem>
            <FormLabel>Competitor Companies *</FormLabel>
            <MultiSelect
              options={companies.map((c) => ({ value: c.id.toString(), label: c.company_name }))}
              selected={field.value ?? []}
              onChange={(vals) => field.onChange(vals)}
              placeholder="Select competitors"
            />
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name={`company_monitorings.${companyIdx}.media_prominence`} render={({ field }) => (
          <FormItem>
            <FormLabel>Media Prominence *</FormLabel>
            <MultiSelect
              options={mediaProminenceOptions.map((v) => ({ value: v, label: v }))}
              selected={field.value ?? []}
              onChange={(vals) => field.onChange(vals)}
              placeholder="Select items"
            />
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name={`company_monitorings.${companyIdx}.monitoring_date`} render={({ field }) => (
          <FormItem>
            <FormLabel>Date *</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button variant="outline" className={cn('w-full pl-3 text-left font-normal bg-white border-gray-300', !field.value && 'text-muted-foreground')}>
                    {field.value ? format(field.value, 'dd MMM yyyy') : 'Pick a date'}
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
        )} />
      </div>

      {/* Nested subsidiary monitorings */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex justify-between items-center">
          <Label className="font-medium">Subsidiary Monitorings <span className="text-gray-400 font-normal">(Optional)</span></Label>
          <Button type="button" size="sm" variant="outline" onClick={addSubsidiary}>
            <Plus className="h-4 w-4 mr-1" /> Add Subsidiary
          </Button>
        </div>

        {subsidiaryMonitorings.map((_: any, subIdx: number) => (
          <div key={subIdx} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-white relative">
            <Button
              type="button" variant="ghost" size="icon" onClick={() => removeSubsidiary(subIdx)}
              className="absolute top-2 right-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <FormField control={form.control} name={`company_monitorings.${companyIdx}.subsidiary_monitorings.${subIdx}.subsidiary_id`} render={({ field }) => (
              <FormItem>
                <FormLabel>Subsidiary</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select subsidiary" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subsidiaries.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.company_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name={`company_monitorings.${companyIdx}.subsidiary_monitorings.${subIdx}.competitor_subsidiary_ids`} render={({ field }) => (
              <FormItem>
                <FormLabel>Competitor Subsidiaries</FormLabel>
                <MultiSelect
                  options={subsidiaries.map((s) => ({ value: s.id.toString(), label: s.company_name }))}
                  selected={field.value ?? []}
                  onChange={(vals) => field.onChange(vals)}
                  placeholder="Select competitors"
                />
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name={`company_monitorings.${companyIdx}.subsidiary_monitorings.${subIdx}.media_prominence`} render={({ field }) => (
              <FormItem>
                <FormLabel>Media Prominence</FormLabel>
                <MultiSelect
                  options={mediaProminenceOptions.map((v) => ({ value: v, label: v }))}
                  selected={field.value ?? []}
                  onChange={(vals) => field.onChange(vals)}
                  placeholder="Select items"
                />
                <FormMessage />
              </FormItem>
            )} />
          </div>
        ))}
      </div>
    </div>
  );
}