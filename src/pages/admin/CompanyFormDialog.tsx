import { useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { FormDialog } from '@/components/common/FormDialog';
import { ComboboxField, MultiComboboxField, TextareaField, TextField, toOptions } from '@/components/common/FormFields';
import { ErrorState, LoadingState } from '@/components/common/States';
import { useCompanies, useParameterOptions } from '@/hooks/useLookups';
import { PARAMETER_CATEGORIES } from '@/api/reference';
import { companiesApi, type CompanyInput } from '@/api/companies';
import { ApiError, getErrorMessage } from '@/lib/api-client';
import type { Company } from '@/types/api';

function isUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const optionalText = z.string().trim().max(255, 'At most 255 characters');
const optionalUrl = z.string().trim().refine((v) => v === '' || isUrl(v), 'Enter a full URL, e.g. https://example.com');

const schema = z.object({
  company_name: z.string().trim().min(1, 'Enter the company name').max(255, 'At most 255 characters'),
  industry: optionalText,
  sub_industry: optionalText,
  ceo: optionalText,
  contact_person: optionalText,
  email: z.string().trim().refine((v) => v === '' || z.string().email().safeParse(v).success, 'Enter a valid email address'),
  phone_no: optionalText,
  office_address: optionalText,
  office_state: optionalText,
  office_country: optionalText,
  website: optionalUrl,
  facebook_link: optionalUrl,
  instagram_link: optionalUrl,
  twitter_link: optionalUrl,
  linkedin_link: optionalUrl,
  youtube_link: optionalUrl,
  additional_info: z.string().trim(),
  subsidiaries: z.array(z.number()),
});
type Values = z.infer<typeof schema>;

const TEXT_FIELDS = [
  'company_name', 'industry', 'sub_industry', 'ceo', 'contact_person', 'email', 'phone_no', 'office_address',
  'office_state', 'office_country', 'website', 'facebook_link', 'instagram_link', 'twitter_link', 'linkedin_link',
  'youtube_link', 'additional_info',
] as const;

function subsidiaryIds(company: Company | null | undefined): number[] {
  return (company?.subsidiaries ?? [])
    .map((s) => s.subsidiary_id ?? s.subsidiary_company_id)
    .filter((id): id is number => typeof id === 'number');
}

function toValues(company: Company | null | undefined): Values {
  const values = Object.fromEntries(TEXT_FIELDS.map((f) => [f, company?.[f] ?? ''])) as Omit<Values, 'subsidiaries'>;
  return { ...values, subsidiaries: subsidiaryIds(company) };
}

function toInput(values: Values): CompanyInput {
  return {
    ...values,
    subsidiaries: values.subsidiaries.map((subsidiary_id) => ({ subsidiary_id })),
  };
}

function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-t pt-5 first:border-t-0 first:pt-0">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  onSaved: () => void;
}

export function CompanyFormDialog({ open, onOpenChange, company, onSaved }: Props) {
  const isEdit = Boolean(company);
  const companyId = company?.id ?? null;
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(company) });

  const detail = useQuery({
    queryKey: ['companies', 'detail', companyId],
    queryFn: () => companiesApi.get(companyId as number),
    enabled: open && companyId !== null,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const companies = useCompanies();
  const industries = useParameterOptions(PARAMETER_CATEGORIES.industry);
  const subIndustries = useParameterOptions(PARAMETER_CATEGORIES.subIndustry);
  const ceos = useParameterOptions(PARAMETER_CATEGORIES.ceo);
  const countries = useParameterOptions(PARAMETER_CATEGORIES.country);

  useEffect(() => {
    if (!open) return;
    form.reset(toValues(companyId !== null ? detail.data ?? company : null));
  }, [open, companyId, company, detail.data, form]);

  async function onSubmit(values: Values) {
    try {
      if (company) await companiesApi.update(company.id, toInput(values));
      else await companiesApi.create(toInput(values));
      onSaved();
      onOpenChange(false);
    } catch (error) {
      const message = getErrorMessage(error);
      if (error instanceof ApiError) {
        error.fieldErrors.forEach((f) => {
          if (f.field && f.field in values) form.setError(f.field as keyof Values, { message: f.message });
        });
        if (error.status === 422 && /company name/i.test(message)) form.setError('company_name', { message });
        else if (error.status === 422 && /email/i.test(message)) form.setError('email', { message });
        else if (/subsidiar/i.test(message)) form.setError('subsidiaries', { message });
      }
      toast.error(message);
    }
  }

  const subsidiaryOptions = (companies.data ?? [])
    .filter((c) => c.id !== companyId)
    .map((c) => ({ value: String(c.id), label: c.company_name }));
  // Wait for fresh data so a late refetch never overwrites what the user has typed.
  const loadingDetail = isEdit && detail.isFetching;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit company' : 'Add company'}
      description={isEdit ? 'Update the company profile and its subsidiaries.' : 'Add a company that can be monitored and reported on.'}
      form={form}
      onSubmit={onSubmit}
      submitLabel={isEdit ? 'Save changes' : 'Create company'}
      size="xl"
    >
      {loadingDetail && <LoadingState label="Loading company…" />}
      {isEdit && detail.error && <ErrorState error={detail.error} onRetry={() => detail.refetch()} />}
      {!loadingDetail && !(isEdit && detail.error) && (
        <>
          <FormSection title="Company details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="company_name" label="Company name" required className="sm:col-span-2" />
              <ComboboxField
                control={form.control}
                name="industry"
                label="Industry"
                options={toOptions(industries.data)}
                loading={industries.isLoading}
                allowCustom
              />
              <ComboboxField
                control={form.control}
                name="sub_industry"
                label="Sub-industry"
                options={toOptions(subIndustries.data)}
                loading={subIndustries.isLoading}
                allowCustom
              />
              <ComboboxField
                control={form.control}
                name="ceo"
                label="CEO"
                options={toOptions(ceos.data)}
                loading={ceos.isLoading}
                allowCustom
              />
              <TextareaField control={form.control} name="additional_info" label="Additional information" className="sm:col-span-2" />
            </div>
          </FormSection>

          <FormSection title="Contact">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="contact_person" label="Contact person" />
              <TextField control={form.control} name="email" label="Email" type="email" autoComplete="off" />
              <TextField control={form.control} name="phone_no" label="Phone number" type="tel" />
              <TextField control={form.control} name="office_address" label="Office address" />
              <TextField control={form.control} name="office_state" label="State" />
              <ComboboxField
                control={form.control}
                name="office_country"
                label="Country"
                options={toOptions(countries.data)}
                loading={countries.isLoading}
                allowCustom
              />
            </div>
          </FormSection>

          <FormSection title="Online presence" description="Full addresses including https://. Leave blank if not applicable.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="website" label="Website" type="url" />
              <TextField control={form.control} name="facebook_link" label="Facebook" type="url" />
              <TextField control={form.control} name="instagram_link" label="Instagram" type="url" />
              <TextField control={form.control} name="twitter_link" label="X (Twitter)" type="url" />
              <TextField control={form.control} name="linkedin_link" label="LinkedIn" type="url" />
              <TextField control={form.control} name="youtube_link" label="YouTube" type="url" />
            </div>
          </FormSection>

          <FormSection title="Subsidiaries" description="Existing companies that belong to this group. Their details are copied as subsidiaries.">
            <MultiComboboxField
              control={form.control}
              name="subsidiaries"
              label="Subsidiary companies"
              numeric
              options={subsidiaryOptions}
              loading={companies.isLoading}
            />
          </FormSection>
        </>
      )}
    </FormDialog>
  );
}
