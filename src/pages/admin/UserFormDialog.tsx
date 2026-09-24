import { useEffect, useMemo } from 'react';
import { useFieldArray, useForm, useWatch, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FormDialog } from '@/components/common/FormDialog';
import { ComboboxField, MultiComboboxField, SelectField, TextField, toOptions } from '@/components/common/FormFields';
import { useCompanies, useParameterOptions, useSubsidiaries, useSupervisors } from '@/hooks/useLookups';
import { PARAMETER_CATEGORIES, categoryLabel } from '@/api/reference';
import { usersApi, type UserInput } from '@/api/users';
import { ALL_ROLES } from '@/lib/roles';
import { ApiError, getErrorMessage } from '@/lib/api-client';
import { toast } from 'sonner';
import type { User } from '@/types/api';
import { defaultPeriod, periodDateInput } from './subscription';

const subsidiaryMonitoringSchema = z.object({
  id: z.number().optional(),
  subsidiary_id: z.number({ required_error: 'Select a subsidiary' }),
  competitor_subsidiary_ids: z.array(z.number()).min(1, 'Select at least one competitor subsidiary'),
  media_prominence: z.array(z.string()).min(1, 'Select at least one item'),
});

const companyMonitoringSchema = z.object({
  id: z.number().optional(),
  company_id: z.number({ required_error: 'Select a company' }),
  competitor_company_ids: z.array(z.number()).min(1, 'Select at least one competitor'),
  media_prominence: z.array(z.string()).min(1, 'Select at least one item'),
  monitoring_start_date: z.string().min(1, 'Choose when monitoring starts'),
  monitoring_date: z.string().min(1, 'Choose when monitoring ends'),
  subsidiary_monitorings: z.array(subsidiaryMonitoringSchema),
}).refine((m) => !m.monitoring_start_date || !m.monitoring_date || m.monitoring_start_date <= m.monitoring_date, {
  path: ['monitoring_date'],
  message: 'The end date must be on or after the start date',
});

function buildSchema(isEdit: boolean) {
  return z.object({
    username: z.string().trim().min(3, 'At least 3 characters').max(20, 'At most 20 characters'),
    email: z.string().trim().email('Enter a valid email address'),
    country_code: z.string().trim().min(1, 'Required'),
    mobile_number: z.string().trim().min(5, 'Enter a valid phone number'),
    role: z.enum(['Admin', 'Supervisor', 'Analyst', 'Client']),
    status: z.enum(['active', 'inactive', 'suspended']),
    password: isEdit
      ? z.string().max(128).refine((v) => v === '' || v.length >= 8, 'At least 8 characters')
      : z.string().min(8, 'At least 8 characters').max(128),
    supervisor_id: z.string().optional(),
    company_monitorings: z.array(companyMonitoringSchema),
  }).superRefine((v, ctx) => {
    if (v.role === 'Analyst' && !v.supervisor_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['supervisor_id'], message: 'Analysts must report to a supervisor' });
    }
    if (v.role === 'Client' && v.company_monitorings.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['company_monitorings'], message: 'Add at least one monitored company' });
    }
  });
}
type Values = z.infer<ReturnType<typeof buildSchema>>;

const emptyMonitoring = (): Values['company_monitorings'][number] => {
  const period = defaultPeriod();
  return {
    company_id: undefined as unknown as number,
    competitor_company_ids: [],
    media_prominence: [],
    monitoring_start_date: period.start,
    monitoring_date: period.end,
    subsidiary_monitorings: [],
  };
};

function toValues(user: User | null): Values {
  if (!user) {
    return {
      username: '', email: '', country_code: '+234', mobile_number: '', role: 'Analyst', status: 'active',
      password: '', supervisor_id: '', company_monitorings: [],
    };
  }
  const subsByMonitoring = (id: number) =>
    (user.company_monitorings?.find((m) => m.id === id)?.subsidiary_monitorings ?? []).map((s) => ({
      id: s.id,
      subsidiary_id: s.subsidiary_id,
      competitor_subsidiary_ids: s.competitor_subsidiary_ids ?? [],
      media_prominence: s.media_prominence ?? [],
    }));
  return {
    username: user.username,
    email: user.email,
    country_code: user.country_code,
    mobile_number: user.mobile_number,
    role: user.role.name,
    status: user.status,
    password: '',
    supervisor_id: user.supervisor_id ?? '',
    company_monitorings: (user.company_monitorings ?? []).map((m) => ({
      id: m.id,
      company_id: m.company_id,
      competitor_company_ids: m.competitor_company_ids ?? [],
      media_prominence: m.media_prominence ?? [],
      monitoring_start_date: periodDateInput(m.monitoring_start_date),
      monitoring_date: periodDateInput(m.monitoring_date),
      subsidiary_monitorings: subsByMonitoring(m.id),
    })),
  };
}

function toInput(values: Values, isEdit: boolean): Partial<UserInput> {
  const input: Partial<UserInput> = {
    username: values.username,
    email: values.email,
    country_code: values.country_code,
    mobile_number: values.mobile_number,
    role: values.role,
    status: values.status,
  };
  if (!isEdit || values.password) input.password = values.password;
  if (values.role === 'Analyst') input.supervisor_id = values.supervisor_id || null;
  if (values.role === 'Client') input.company_monitorings = values.company_monitorings;
  return input;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSaved: () => void;
}

export function UserFormDialog({ open, onOpenChange, user, onSaved }: Props) {
  const isEdit = Boolean(user);
  const schema = useMemo(() => buildSchema(isEdit), [isEdit]);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(user) });
  const role = useWatch({ control: form.control, name: 'role' });
  const supervisors = useSupervisors(open);
  const prefixes = useParameterOptions(PARAMETER_CATEGORIES.phonePrefix);
  const monitorings = useFieldArray({ control: form.control, name: 'company_monitorings' });

  useEffect(() => {
    if (open) form.reset(toValues(user));
  }, [open, user, form]);

  async function onSubmit(values: Values) {
    try {
      if (user) await usersApi.update(user.id, toInput(values, true));
      else await usersApi.create(toInput(values, false) as UserInput);
      onSaved();
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError) {
        error.fieldErrors.forEach((f) => {
          if (f.field && f.field in values) form.setError(f.field as keyof Values, { message: f.message });
        });
      }
      form.setError('root', { message: getErrorMessage(error) });
      toast.error(getErrorMessage(error));
    }
  }

  const prefixOptions = toOptions(Array.from(new Set(['+234', ...(prefixes.data ?? [])])));

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit user' : 'Add user'}
      description={isEdit
        ? 'Update account details. Leave the password blank to keep the current one.'
        : 'The user receives an email with a temporary password and must change it on first sign-in.'}
      form={form}
      onSubmit={onSubmit}
      submitLabel={isEdit ? 'Save changes' : 'Create user'}
      size={role === 'Client' ? 'xl' : 'lg'}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField control={form.control} name="username" label="Username" required autoComplete="off" />
        <TextField control={form.control} name="email" label="Email" type="email" required autoComplete="off" />
        <div className="grid grid-cols-[110px_1fr] gap-2">
          <ComboboxField control={form.control} name="country_code" label="Code" required options={prefixOptions} allowCustom />
          <TextField control={form.control} name="mobile_number" label="Mobile number" type="tel" required />
        </div>
        <SelectField
          control={form.control}
          name="role"
          label="Role"
          required
          options={ALL_ROLES.map((r) => ({ value: r, label: r }))}
        />
        {isEdit && (
          <SelectField
            control={form.control}
            name="status"
            label="Account status"
            required
            options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'suspended', label: 'Suspended' }]}
          />
        )}
        {role === 'Analyst' && (
          <ComboboxField
            control={form.control}
            name="supervisor_id"
            label="Supervisor"
            required
            loading={supervisors.isLoading}
            options={(supervisors.data ?? []).map((s) => ({ value: s.id, label: s.username }))}
          />
        )}
        <TextField
          control={form.control}
          name="password"
          label={isEdit ? 'New password' : 'Temporary password'}
          type="password"
          required={!isEdit}
          autoComplete="new-password"
          description={isEdit ? 'Optional. At least 8 characters.' : 'At least 8 characters. Shared with the user by email.'}
        />
      </div>

      {role === 'Client' && (
        <div className="space-y-4">
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Monitored companies</h3>
              <p className="text-sm text-muted-foreground">Each entry defines a company, its competitors, Competitive Metrics and the monitoring period.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => monitorings.append(emptyMonitoring())}>
              <Plus /> Add company
            </Button>
          </div>
          {form.formState.errors.company_monitorings?.message && (
            <p className="text-sm font-medium text-destructive">{form.formState.errors.company_monitorings.message}</p>
          )}
          {monitorings.fields.map((field, index) => (
            <MonitoringEditor key={field.id} control={form.control} index={index} onRemove={() => monitorings.remove(index)} />
          ))}
        </div>
      )}

      {form.formState.errors.root?.message && (
        <p className="text-sm font-medium text-destructive" role="alert">{form.formState.errors.root.message}</p>
      )}
    </FormDialog>
  );
}

function MonitoringEditor({ control, index, onRemove }: { control: Control<Values>; index: number; onRemove: () => void }) {
  const companies = useCompanies();
  const subsidiaries = useSubsidiaries();
  const prominence = useParameterOptions(PARAMETER_CATEGORIES.mediaProminence);
  const subs = useFieldArray({ control, name: `company_monitorings.${index}.subsidiary_monitorings` });
  const companyId = useWatch({ control, name: `company_monitorings.${index}.company_id` });

  const companyOptions = (companies.data ?? []).map((c) => ({ value: String(c.id), label: c.company_name }));
  const allSubsidiaries = (subsidiaries.data ?? []).map((s) => ({ value: String(s.id), label: s.company_name }));
  const ownSubsidiaries = companies.data?.find((c) => c.id === companyId)?.subsidiaries ?? [];
  const ownSubsidiaryOptions = ownSubsidiaries.map((s) => ({ value: String(s.id), label: s.company_name }));
  const prominenceOptions = toOptions(prominence.data);

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Company {index + 1}</h4>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive">
          <Trash2 /> Remove
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ComboboxField control={control} name={`company_monitorings.${index}.company_id`} label="Company" required numeric options={companyOptions} loading={companies.isLoading} />
        <MultiComboboxField control={control} name={`company_monitorings.${index}.competitor_company_ids`} label="Competitors" required numeric options={companyOptions.filter((o) => Number(o.value) !== companyId)} loading={companies.isLoading} />
        <MultiComboboxField control={control} name={`company_monitorings.${index}.media_prominence`} label={categoryLabel(PARAMETER_CATEGORIES.mediaProminence)} required options={prominenceOptions} loading={prominence.isLoading} className="sm:col-span-2" />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Monitoring period</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField control={control} name={`company_monitorings.${index}.monitoring_start_date`} label="From" type="date" required />
          <TextField control={control} name={`company_monitorings.${index}.monitoring_date`} label="To" type="date" required />
        </div>
        <p className="text-xs text-muted-foreground">Access to reports is limited to this period. Both days are included.</p>
      </fieldset>

      <div className="space-y-3 rounded-md bg-muted/40 p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Subsidiary monitoring <span className="font-normal text-muted-foreground">(optional)</span></p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!companyId}
            onClick={() => subs.append({ subsidiary_id: undefined as unknown as number, competitor_subsidiary_ids: [], media_prominence: [] })}
          >
            <Plus /> Add subsidiary
          </Button>
        </div>
        {!companyId && <p className="text-xs text-muted-foreground">Select the company first.</p>}
        {subs.fields.map((field, subIndex) => (
          <div key={field.id} className="grid grid-cols-1 gap-3 rounded-md border bg-background p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-start">
            <ComboboxField control={control} name={`company_monitorings.${index}.subsidiary_monitorings.${subIndex}.subsidiary_id`} label="Subsidiary" required numeric options={ownSubsidiaryOptions} />
            <MultiComboboxField control={control} name={`company_monitorings.${index}.subsidiary_monitorings.${subIndex}.competitor_subsidiary_ids`} label="Competitor subsidiaries" required numeric options={allSubsidiaries} loading={subsidiaries.isLoading} />
            <MultiComboboxField control={control} name={`company_monitorings.${index}.subsidiary_monitorings.${subIndex}.media_prominence`} label={categoryLabel(PARAMETER_CATEGORIES.mediaProminence)} required options={prominenceOptions} />
            <Button type="button" variant="ghost" size="icon" className="mt-7 text-destructive hover:text-destructive" onClick={() => subs.remove(subIndex)} aria-label="Remove subsidiary">
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
