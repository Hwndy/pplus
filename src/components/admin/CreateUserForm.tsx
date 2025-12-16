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
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

// ──────────────────────────────────────────────────────────────────────────────
// Zod Schema — Conditional required + string supervisorId
// ──────────────────────────────────────────────────────────────────────────────
const subsidiaryMonitoringSchema = z.object({
  subsidiary_id: z.string().min(1, 'Subsidiary is required'),
  competitor_subsidiary_ids: z.array(z.string()).min(1, 'At least one competitor subsidiary required'),
  media_prominence: z.array(z.string()).min(1, 'Media prominence required'),
});

const companyMonitoringSchema = z.object({
  company_id: z.string().min(1, 'Company is required'),
  competitor_company_ids: z.array(z.string()).min(1, 'At least one competitor company required'),
  media_prominence: z.array(z.string()).min(1, 'Media prominence required'),
  monitoring_date: z.date({ required_error: 'Monitoring date is required' }),
  subsidiary_monitorings: z.array(subsidiaryMonitoringSchema).optional().default([]),
});

const formSchema = z.object({
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
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.role !== 'Analyst' || (data.supervisorId && data.supervisorId.trim() !== ''), {
    message: 'Supervisor is required for Analyst role',
    path: ['supervisorId'],
  });

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
type Company = { id: number; company_name: string };
type Subsidiary = { id: number; company_name: string };

interface CreateUserFormProps {
  onSave: (user: any) => void;
  onCancel: () => void;
}

export default function CreateUserForm({ onSave, onCancel }: CreateUserFormProps) {
  const [avatar, setAvatar] = useState('');
  const [showSupervisorField, setShowSupervisorField] = useState(false);
  const [showClientFields, setShowClientFields] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
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
  // Load initial data
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

        const subsData = subsidiariesRes.data?.data ?? subsidiariesRes.data ?? [];
        setSubsidiaries(
          Array.isArray(subsData)
            ? subsData.map((s: any) => ({
                id: s.id,
                company_name: s.company_name,
              }))
            : []
        );

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
    fetchData();
  }, []);

  // ────────────────────────────────────────────────────────────────────────
  // Role-based UI toggling
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
          monitoring_date: new Date(),
          subsidiary_monitorings: [],
        });
      }
    } else {
      form.setValue('company_monitorings', []);
    }
  }, [selectedRole, form, companyFields.length, appendCompany]);

  // ────────────────────────────────────────────────────────────────────────
  // Submit — Final fix: send supervisor_id as string only when Analyst
  // ────────────────────────────────────────────────────────────────────────
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload: any = {
        username: values.username,
        email: values.email,
        password: values.password,
        country_code: values.country_code,
        mobile_number: values.mobile_number,
        role: values.role,
        active: true,
        avatar,
      };

      // Only add supervisor_id for Analyst, and as string (UUID)
      if (values.role === 'Analyst' && values.supervisorId) {
        payload.supervisor_id = values.supervisorId; // String UUID
      }

      // Client monitoring config
      if (values.role === 'Client' && values.company_monitorings?.length) {
        payload.company_monitorings = values.company_monitorings
          .filter(c =>
            c.company_id &&
            c.competitor_company_ids.length > 0 &&
            c.media_prominence.length > 0
          )
          .map((c) => ({
            company_id: Number(c.company_id),
            competitor_company_ids: c.competitor_company_ids.map(Number),
            media_prominence: c.media_prominence,
            monitoring_date: c.monitoring_date.toISOString().split('T')[0],
            subsidiary_monitorings: (c.subsidiary_monitorings || [])
              .filter(s =>
                s.subsidiary_id &&
                s.competitor_subsidiary_ids.length > 0 &&
                s.media_prominence.length > 0
              )
              .map((s) => ({
                subsidiary_id: Number(s.subsidiary_id),
                competitor_subsidiary_ids: s.competitor_subsidiary_ids.map(Number),
                media_prominence: s.media_prominence,
              })),
          }));
      }

      // Optional: Remove in production
      console.log('Final payload being sent:', payload);

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
          <div className="grid grid-cols-2 gap-4">
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
          </div>

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

          {/* Supervisor (Analyst only) */}
          {showSupervisorField && (
            <FormField
              control={form.control}
              name="supervisorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Supervisor <span className="text-red-600">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Select a supervisor (required)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supervisors.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.username} {s.email ? `(${s.email})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Client Monitoring Section */}
          {showClientFields && (
            <div className="space-y-6">
              <Label className="font-semibold text-lg">Company Monitoring Configuration</Label>

              {companyFields.map((companyField, companyIdx) => (
                <div key={companyField.id} className="border p-6 rounded-lg bg-gray-50 relative space-y-6">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={companyFields.length === 1}
                    onClick={() => removeCompany(companyIdx)}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name={`company_monitorings.${companyIdx}.company_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
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
                          <FormLabel>Competitor Companies *</FormLabel>
                          <MultiSelect
                            options={companies.map((c) => ({ value: c.id.toString(), label: c.company_name }))}
                            selected={field.value ?? []}
                            onChange={(vals) => field.onChange(vals)}
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
                            options={mediaProminenceOptions.map((v) => ({ value: v, label: v }))}
                            selected={field.value ?? []}
                            onChange={(vals) => field.onChange(vals)}
                            placeholder="Select items"
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
                          <FormControl>
                            <input
                              type="date"
                              className="w-full px-3 py-2 border rounded-md bg-white border-gray-300"
                              value={field.value ? field.value.toISOString().split('T')[0] : ''}
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Subsidiary Monitorings */}
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex justify-between items-center">
                      <Label className="font-medium">Subsidiary Monitorings (Optional)</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const current = form.getValues(`company_monitorings.${companyIdx}.subsidiary_monitorings`) || [];
                          form.setValue(`company_monitorings.${companyIdx}.subsidiary_monitorings`, [
                            ...current,
                            {
                              subsidiary_id: '',
                              competitor_subsidiary_ids: [],
                              media_prominence: [],
                            },
                          ]);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Subsidiary
                      </Button>
                    </div>

                    {(form.watch(`company_monitorings.${companyIdx}.subsidiary_monitorings`) || []).map((_, subIdx) => (
                      <div
                        key={subIdx}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-white relative"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const subs = form.getValues(`company_monitorings.${companyIdx}.subsidiary_monitorings`) || [];
                            form.setValue(
                              `company_monitorings.${companyIdx}.subsidiary_monitorings`,
                              subs.filter((_: any, i: number) => i !== subIdx)
                            );
                          }}
                          className="absolute top-2 right-2 text-red-600"
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
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select subsidiary" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {subsidiaries.map((s) => (
                                    <SelectItem key={s.id} value={s.id.toString()}>
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
                                options={subsidiaries.map((s) => ({ value: s.id.toString(), label: s.company_name }))}
                                selected={field.value ?? []}
                                onChange={(vals) => field.onChange(vals)}
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
                                options={mediaProminenceOptions.map((v) => ({ value: v, label: v }))}
                                selected={field.value ?? []}
                                onChange={(vals) => field.onChange(vals)}
                                placeholder="Select items"
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

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() =>
                  appendCompany({
                    company_id: '',
                    competitor_company_ids: [],
                    media_prominence: [],
                    monitoring_date: new Date(),
                    subsidiary_monitorings: [],
                  })
                }
              >
                <Plus className="h-4 w-4 mr-2" /> Add Another Company Monitoring
              </Button>
            </div>
          )}

          {/* Passwords */}
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Discard
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-950 hover:bg-indigo-800">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}