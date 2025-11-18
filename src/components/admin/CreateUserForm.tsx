'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User } from '../../services/apiService';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// ──────────────────────────────────────────────────────────────────────────────
// Zod Schema — Updated to match backend: subsidiary_monitorings nested
// ──────────────────────────────────────────────────────────────────────────────
const subsidiaryMonitoringSchema = z.object({
  subsidiary_id: z.string().min(1, 'Subsidiary is required'),
  competitor_subsidiary_ids: z.array(z.string()).min(1, 'At least one competitor is required'),
  media_prominence: z.array(z.string()).min(1, 'At least one media prominence is required'),
});

const companyMonitoringSchema = z.object({
  company_id: z.string().min(1, 'Company is required'),
  competitor_company_ids: z.array(z.string()).min(1, 'At least one competitor is required'),
  media_prominence: z.array(z.string()).min(1, 'At least one media prominence is required'),
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
    supervisorId: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    company_monitorings: z.array(companyMonitoringSchema).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────
interface CreateUserFormProps {
  onSave: (user: User) => void;
  onCancel: () => void;
}

export default function CreateUserForm({
  onSave,
  onCancel,
}: CreateUserFormProps) {
  const [avatar, setAvatar] = useState('');
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
    { id: number; subsidiary_id: number; company_name: string }[]
  >([]);
  const [mediaProminenceOptions, setMediaProminenceOptions] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      role: 'Admin',
      mobile_number: '',
      country_code: '+234',
      password: '',
      confirmPassword: '',
      supervisorId: '',
      company_monitorings: [],
    },
  });

  const { fields: companyFields, append: appendCompany, remove: removeCompany } = useFieldArray({
    control: form.control,
    name: 'company_monitorings',
  });

  const selectedRole = form.watch('role');

  // ────────────────────────────────────────────────────────────────────────
  // Load Data
  // ────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
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

        const companiesData = companiesRes.data?.data ?? [];
        setCompanies(Array.isArray(companiesData) ? companiesData : []);

        const subsData = Array.isArray(subsidiariesRes.data)
          ? subsidiariesRes.data.map((i: any) => ({
              id: i.id,
              subsidiary_id: i.subsidiary_id,
              company_name: i.subsidiaryCompany.company_name,
            }))
          : [];
        setSubsidiaries(subsData);

        const mediaOpts = Array.isArray(mediaRes.data)
          ? mediaRes.data.flatMap((i: any) =>
              Array.isArray(i.categories)
                ? i.categories.flatMap((c: any) =>
                    Array.isArray(c.values)
                      ? c.values.map((v: any) => v.value)
                      : []
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
    fetchData();
  }, []);

  // ────────────────────────────────────────────────────────────────────────
  // Role-Based UI
  // ────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const isClient = selectedRole === 'Client';
    const isAnalyst = selectedRole === 'Analyst';

    setShowSupervisorField(isAnalyst);
    setShowClientFields(isClient);

    if (!isAnalyst) {
      form.setValue('supervisorId', '');
    }

    if (isClient) {
      if (companyFields.length === 0) {
        appendCompany({
          company_id: '',
          competitor_company_ids: [],
          media_prominence: [],
          monitoring_date: null,
          subsidiary_monitorings: [],
        });
      }
    } else {
      form.setValue('company_monitorings', []);
    }
  }, [selectedRole, form, companyFields.length, appendCompany]);

  // ────────────────────────────────────────────────────────────────────────
  // Submit — Now sends nested structure exactly as backend expects
  // ────────────────────────────────────────────────────────────────────────
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload: any = {
        username: values.username,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: values.role,
        country_code: values.country_code,
        mobile_number: values.mobile_number,
        supervisor_id: values.supervisorId ? Number(values.supervisorId) : undefined,
        avatar,
      };

      if (values.role === 'Client' && values.company_monitorings && values.company_monitorings.length > 0) {
        payload.company_monitorings = values.company_monitorings
          .filter(c => c.company_id && c.competitor_company_ids.length > 0 && c.media_prominence.length > 0)
          .map((c) => ({
            company_id: Number(c.company_id),
            competitor_company_ids: c.competitor_company_ids.map(Number),
            media_prominence: c.media_prominence,
            monitoring_date: c.monitoring_date
              ? c.monitoring_date.toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            subsidiary_monitorings: (c.subsidiary_monitorings || [])
              .filter(s => s.subsidiary_id && s.competitor_subsidiary_ids.length > 0 && s.media_prominence.length > 0)
              .map((s) => ({
                subsidiary_id: Number(s.subsidiary_id),
                competitor_subsidiary_ids: s.competitor_subsidiary_ids.map(Number),
                media_prominence: s.media_prominence,
              })),
          }));
      }

      const res = await apiService.createUser(payload);
      toast.success(res.message ?? 'User created successfully');
      onSave(res.data);
      form.reset();
      onCancel();
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to create user');
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
          {/* Username & Email */}
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
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Enter email" className="bg-gray-50 border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
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

          {/* Role */}
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

          {/* Client Monitoring — Now with Nested Subsidiary Monitorings */}
          {showClientFields && (
            <>
              <div className="space-y-4">
                <Label className="font-semibold text-lg">Company Monitoring</Label>

                {companyFields.map((companyField, companyIdx) => (
                  <div
                    key={companyField.id}
                    className="border p-6 rounded-md bg-gray-50 relative space-y-6"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCompany(companyIdx)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      disabled={companyFields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    {/* Company Monitoring Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`company_monitorings.${companyIdx}.company_id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white border-gray-200">
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
                        name={`company_monitorings.${companyIdx}.competitor_company_ids`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Competitors *</FormLabel>
                            <MultiSelect
                              options={companies.map((c) => ({
                                value: c.id.toString(),
                                label: c.company_name,
                              }))}
                              selected={field.value ?? []}
                              onChange={(values) => {
                                field.onChange(values ?? []);
                                form.trigger(`company_monitorings.${companyIdx}.competitor_company_ids`);
                              }}
                              placeholder="Select competitors"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`company_monitorings.${companyIdx}.media_prominence`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Media Prominence *</FormLabel>
                            <MultiSelect
                              options={mediaProminenceOptions.map((v) => ({
                                value: v,
                                label: v,
                              }))}
                              selected={field.value ?? []}
                              onChange={(values) => {
                                field.onChange(values ?? []);
                                form.trigger(`company_monitorings.${companyIdx}.media_prominence`);
                              }}
                              placeholder="Select at least one"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`company_monitorings.${companyIdx}.monitoring_date`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date *</FormLabel>
                            <input
                              type="date"
                              className="w-full px-3 py-2 border rounded-md bg-white border-gray-200"
                              value={field.value ? field.value.toISOString().split('T')[0] : ''}
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Nested Subsidiary Monitorings */}
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-base font-medium">Subsidiary Monitorings (Optional)</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const current = form.getValues(`company_monitorings.${companyIdx}.subsidiary_monitorings`) || [];
                            form.setValue(`company_monitorings.${companyIdx}.subsidiary_monitorings`, [
                              ...current,
                              { subsidiary_id: '', competitor_subsidiary_ids: [], media_prominence: [] },
                            ]);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Subsidiary
                        </Button>
                      </div>

                      {(form.watch(`company_monitorings.${companyIdx}.subsidiary_monitorings`) || []).map((_, subIdx) => (
                        <div
                          key={subIdx}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md bg-white relative"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const subs = form.getValues(`company_monitorings.${companyIdx}.subsidiary_monitorings`) || [];
                              form.setValue(
                                `company_monitorings.${companyIdx}.subsidiary_monitorings`,
                                subs.filter((_, i) => i !== subIdx)
                              );
                            }}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <FormField
                            control={form.control}
                            name={`company_monitorings.${companyIdx}.subsidiary_monitorings.${subIdx}.subsidiary_id`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subsidiary</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-gray-50 border-gray-200">
                                      <SelectValue placeholder="Select subsidiary" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {subsidiaries.map((s) => (
                                      <SelectItem key={s.id} value={s.subsidiary_id.toString()}>
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
                            name={`company_monitorings.${companyIdx}.subsidiary_monitorings.${subIdx}.competitor_subsidiary_ids`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Competitor Subsidiaries</FormLabel>
                                <MultiSelect
                                  options={subsidiaries.map((s) => ({
                                    value: s.subsidiary_id.toString(),
                                    label: s.company_name,
                                  }))}
                                  selected={field.value ?? []}
                                  onChange={(values) => {
                                    field.onChange(values ?? []);
                                    form.trigger(`company_monitorings.${companyIdx}.subsidiary_monitorings.${subIdx}.competitor_subsidiary_ids`);
                                  }}
                                  placeholder="Select competitors"
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`company_monitorings.${companyIdx}.subsidiary_monitorings.${subIdx}.media_prominence`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Media Prominence</FormLabel>
                                <MultiSelect
                                  options={mediaProminenceOptions.map((v) => ({
                                    value: v,
                                    label: v,
                                  }))}
                                  selected={field.value ?? []}
                                  onChange={(values) => {
                                    field.onChange(values ?? []);
                                    form.trigger(`company_monitorings.${companyIdx}.subsidiary_monitorings.${subIdx}.media_prominence`);
                                  }}
                                  placeholder="Select at least one"
                                />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <Button type="button" onClick={() => appendCompany({
                  company_id: '',
                  competitor_company_ids: [],
                  media_prominence: [],
                  monitoring_date: null,
                  subsidiary_monitorings: [],
                })} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Company Monitoring
                </Button>
              </div>
            </>
          )}

          {/* Passwords */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Enter password" className="bg-gray-50 border-gray-200" />
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
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Confirm password" className="bg-gray-50 border-gray-200" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit */}
          <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="bg-gray-50 hover:bg-gray-100">
              Discard
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-950">
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