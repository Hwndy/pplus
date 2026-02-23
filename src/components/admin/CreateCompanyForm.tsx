import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import axios from 'axios';
import { X, Copy, Loader2, Plus, Minus, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Company {
  id: number;
  company_name: string;
}

interface Subsidiary {
  id?: number;
  subsidiary_id: number;
}

interface CompanyFormData {
  id?: number;
  company_name: string;
  email: string;
  industry: string;
  sub_industry: string;
  subsidiaries: Subsidiary[];
  office_address: string;
  office_state: string;
  office_country: string;
  contact_person: string;
  ceo: string;
  phone_no: string;
  website: string;
  facebook_link: string;
  instagram_link: string;
  twitter_link: string;
  linkedin_link: string;
  youtube_link: string;
}

interface CreateCompanyFormProps {
  onSave: (company: any) => void;
  onCancel: () => void;
  initialValues?: CompanyFormData | null;
  isViewMode?: boolean;
}

// ──────────────────────────────────────────────
// Typeable + Searchable Company Field (with fixed dropdown scroll)
// ──────────────────────────────────────────────
const TypeableSearchableCompanyField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  companyOptions: string[];
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}> = ({
  value,
  onChange,
  companyOptions,
  loading = false,
  disabled = false,
  placeholder = 'Type or search company name...',
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = companyOptions.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const isNew = search.trim() && !companyOptions.some(
    (c) => c.toLowerCase() === search.toLowerCase().trim()
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal"
          disabled={disabled || loading}
        >
          <span className="truncate">
            {loading ? 'Loading companies...' : value || placeholder}
          </span>
          {loading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full p-0" 
        align="start"
        sideOffset={4}
        avoidCollisions={true}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search companies or type new name..."
            value={search}
            onValueChange={(val) => {
              setSearch(val);
              onChange(val);
            }}
            autoFocus
          />
          <ScrollArea className="max-h-[380px] md:max-h-[min(70vh,440px)]">
            <CommandList>
              <CommandEmpty>No company found.</CommandEmpty>

              {filtered.length > 0 && (
                <CommandGroup heading="Existing Companies">
                  {filtered.map((company) => (
                    <CommandItem
                      key={company}
                      value={company}
                      onSelect={() => {
                        onChange(company);
                        setSearch(company);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === company ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {company}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {isNew && search.trim() && (
                <CommandGroup heading="Create New">
                  <CommandItem
                    onSelect={() => {
                      onChange(search.trim());
                      setOpen(false);
                    }}
                    className="text-muted-foreground"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{search.trim()}" as new company
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
            {/* Always mounted scrollbar → mouse wheel works instantly, even if scrollbar is hidden */}
            <ScrollBar orientation="vertical" forceMount={true} />
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ──────────────────────────────────────────────
// Reusable Searchable Combobox (with fixed dropdown scroll)
// ──────────────────────────────────────────────
const SearchableCombobox: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  loading?: boolean;
  disabled?: boolean;
}> = ({
  options,
  value,
  onChange,
  placeholder,
  loading = false,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((opt) => opt.value === value)?.label || '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled || loading}
        >
          <span className="truncate">
            {loading ? 'Loading...' : selectedLabel || placeholder}
          </span>
          {loading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full p-0" 
        align="start"
        sideOffset={4}
        avoidCollisions={true}
      >
        <Command>
          <CommandInput placeholder="Search..." autoFocus />
          <ScrollArea className="max-h-[380px] md:max-h-[min(70vh,440px)]">
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? '' : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === option.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {/* Always mounted scrollbar → mouse wheel works instantly, even if scrollbar is hidden */}
            <ScrollBar orientation="vertical" forceMount={true} />
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default function CreateCompanyForm({
  onSave,
  onCancel,
  initialValues = null,
  isViewMode = false,
}: CreateCompanyFormProps) {
  const [companyForms, setCompanyForms] = useState<CompanyFormData[]>([]);
  const [apiCompanies, setApiCompanies] = useState<Company[]>([]);
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);
  const [subIndustryOptions, setSubIndustryOptions] = useState<string[]>([]);
  const [ceoOptions, setCeoOptions] = useState<string[]>([]);
  const [companyNameOptions, setCompanyNameOptions] = useState<string[]>([]);

  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingIndustry, setLoadingIndustry] = useState(true);
  const [loadingSubIndustry, setLoadingSubIndustry] = useState(true);
  const [loadingCeo, setLoadingCeo] = useState(true);
  const [loadingCompanyNames, setLoadingCompanyNames] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultEmptyForm: CompanyFormData = {
    company_name: '',
    email: '',
    industry: '',
    sub_industry: '',
    subsidiaries: [],
    office_address: '',
    office_state: '',
    office_country: '',
    contact_person: '',
    ceo: '',
    phone_no: '',
    website: '',
    facebook_link: '',
    instagram_link: '',
    twitter_link: '',
    linkedin_link: '',
    youtube_link: '',
  };

  const form = useForm<CompanyFormData>({
    defaultValues: defaultEmptyForm,
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
      setCompanyForms([initialValues]);
    } else {
      form.reset(defaultEmptyForm);
      setCompanyForms([defaultEmptyForm]);
    }
  }, [initialValues, form]);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const res = await axios.get('https://pplus-g19c.onrender.com/api/v1/companies/?limit=1000');
        const companies = res.data?.data?.data || [];
        const valid = companies.filter((c: Company) => c.id && c.company_name);
        setApiCompanies(valid);
      } catch (error) {
        console.error('Failed to fetch companies:', error);
        toast.error('Failed to load companies');
        setApiCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchOptions = async (category: string, setter: (opts: string[]) => void, loadingSetter: (v: boolean) => void) => {
      loadingSetter(true);
      try {
        const res = await axios.get(`https://pplus-g19c.onrender.com/api/v1/data-parameters/category/${category}`);
        setter(extractStringOptions(res.data));
      } catch (error) {
        console.error(`Failed to fetch ${category}:`, error);
        toast.error(`Failed to load ${category} options`);
        setter([]);
      } finally {
        loadingSetter(false);
      }
    };

    fetchOptions('Industry', setIndustryOptions, setLoadingIndustry);
    fetchOptions('Sub_Industry', setSubIndustryOptions, setLoadingSubIndustry);
    fetchOptions('CEO', setCeoOptions, setLoadingCeo);
    fetchOptions('Company', setCompanyNameOptions, setLoadingCompanyNames);
  }, []);

  const extractStringOptions = (data: any): string[] => {
    try {
      const categories = data?.data?.[0]?.categories || [];
      const values = categories?.[0]?.values || [];
      return values.map((v: any) => v.value?.trim() || '').filter(Boolean);
    } catch {
      return [];
    }
  };

  const updateCompanyForm = (index: number, field: keyof CompanyFormData, value: string) => {
    setCompanyForms((prev) =>
      prev.map((form, i) => (i === index ? { ...form, [field]: value } : form))
    );
  };

  const handleAddCompanyForm = () => {
    if (isViewMode || companyForms.length >= 2) {
      toast.error('Maximum of 2 company forms allowed');
      return;
    }
    setCompanyForms([...companyForms, { ...defaultEmptyForm }]);
    toast.success('Company form added');
  };

  const handleRemoveCompanyForm = (index: number) => {
    setCompanyForms(companyForms.filter((_, i) => i !== index));
  };

  const handleSubsidiaryChange = (formIndex: number, subIndex: number, value: string) => {
    const numValue = parseInt(value, 10);
    setCompanyForms((prev) =>
      prev.map((form, i) =>
        i === formIndex
          ? {
              ...form,
              subsidiaries: form.subsidiaries.map((sub, j) =>
                j === subIndex
                  ? { ...sub, subsidiary_id: isNaN(numValue) ? 0 : numValue }
                  : sub
              ),
            }
          : form
      )
    );
  };

  const handleAddSubsidiary = (formIndex: number) => {
    setCompanyForms((prev) =>
      prev.map((form, i) =>
        i === formIndex
          ? { ...form, subsidiaries: [...form.subsidiaries, { subsidiary_id: 0 }] }
          : form
      )
    );
  };

  const handleRemoveSubsidiary = (formIndex: number, subIndex: number) => {
    setCompanyForms((prev) =>
      prev.map((form, i) =>
        i === formIndex
          ? {
              ...form,
              subsidiaries: form.subsidiaries.filter((_, j) => j !== subIndex),
            }
          : form
      )
    );
  };

  const onSubmit = async () => {
    if (isViewMode || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const results: any[] = [];

      for (const formData of companyForms) {
        const payload: any = {
          company_name: formData.company_name.trim(),
          email: formData.email,
          industry: formData.industry,
          sub_industry: formData.sub_industry,
          office_address: formData.office_address,
          office_state: formData.office_state,
          office_country: formData.office_country,
          contact_person: formData.contact_person,
          ceo: formData.ceo,
          phone_no: formData.phone_no,
          website: formData.website,
          facebook_link: formData.facebook_link || 'https://facebook.com',
          instagram_link: formData.instagram_link || 'https://instagram.com',
          twitter_link: formData.twitter_link || 'https://twitter.com',
          linkedin_link: formData.linkedin_link || 'https://linkedin.com',
          youtube_link: formData.youtube_link || 'https://youtube.com',
        };

        if (formData.subsidiaries.length > 0) {
          payload.subsidiaries = formData.subsidiaries
            .filter((s) => s.subsidiary_id > 0 && !isNaN(s.subsidiary_id))
            .map((s) => ({ subsidiary_id: s.subsidiary_id }));
        }

        const endpoint = formData.id && initialValues
          ? `https://pplus-g19c.onrender.com/api/v1/companies/update/${formData.id}`
          : 'https://pplus-g19c.onrender.com/api/v1/companies/create';

        const method = formData.id && initialValues ? 'put' : 'post';
        const res = await axios[method](endpoint, payload);

        results.push(res.data);
      }

      onSave(results.length === 1 ? results[0] : results);
      toast.success(
        initialValues
          ? 'Company updated successfully'
          : `${results.length} company(ies) created successfully`
      );
    } catch (error: any) {
      toast.error(`Failed to save: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isViewMode;

  return (
    <ScrollArea className="h-[calc(100vh-280px)] md:h-[calc(100vh-240px)]">
      <div className="p-1 pb-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
            {companyForms.map((companyForm, formIndex) => (
              <div
                key={formIndex}
                className="border p-5 md:p-6 rounded-lg relative mb-8 shadow-sm"
              >
                {formIndex > 0 && !isViewMode && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemoveCompanyForm(formIndex)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div>
                    <FormLabel>Company Name *</FormLabel>
                    <TypeableSearchableCompanyField
                      value={companyForm.company_name}
                      onChange={(val) => updateCompanyForm(formIndex, 'company_name', val)}
                      companyOptions={companyNameOptions}
                      loading={loadingCompanyNames}
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>Industry *</FormLabel>
                    <SearchableCombobox
                      options={industryOptions.map((o) => ({ value: o, label: o }))}
                      value={companyForm.industry}
                      onChange={(val) => updateCompanyForm(formIndex, 'industry', val)}
                      placeholder="Select or search industry..."
                      loading={loadingIndustry}
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>Sub-Industry *</FormLabel>
                    <SearchableCombobox
                      options={subIndustryOptions.map((o) => ({ value: o, label: o }))}
                      value={companyForm.sub_industry}
                      onChange={(val) => updateCompanyForm(formIndex, 'sub_industry', val)}
                      placeholder="Select or search sub-industry..."
                      loading={loadingSubIndustry}
                      disabled={isDisabled}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormLabel>Office Address *</FormLabel>
                    <Textarea
                      value={companyForm.office_address}
                      onChange={(e) => updateCompanyForm(formIndex, 'office_address', e.target.value)}
                      placeholder="Full office address"
                      disabled={isDisabled}
                      className="min-h-[84px]"
                    />
                  </div>

                  <div>
                    <FormLabel>Office State *</FormLabel>
                    <Input
                      value={companyForm.office_state}
                      onChange={(e) => updateCompanyForm(formIndex, 'office_state', e.target.value)}
                      placeholder="e.g. Lagos"
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>Office Country *</FormLabel>
                    <Input
                      value={companyForm.office_country}
                      onChange={(e) => updateCompanyForm(formIndex, 'office_country', e.target.value)}
                      placeholder="e.g. Nigeria"
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>Email *</FormLabel>
                    <Input
                      value={companyForm.email}
                      onChange={(e) => updateCompanyForm(formIndex, 'email', e.target.value)}
                      placeholder="company@example.com"
                      type="email"
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>Contact Person *</FormLabel>
                    <Input
                      value={companyForm.contact_person}
                      onChange={(e) => updateCompanyForm(formIndex, 'contact_person', e.target.value)}
                      placeholder="Full name"
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>CEO *</FormLabel>
                    <SearchableCombobox
                      options={ceoOptions.map((o) => ({ value: o, label: o }))}
                      value={companyForm.ceo}
                      onChange={(val) => updateCompanyForm(formIndex, 'ceo', val)}
                      placeholder="Select or search CEO..."
                      loading={loadingCeo}
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>Phone *</FormLabel>
                    <Input
                      value={companyForm.phone_no}
                      onChange={(e) => updateCompanyForm(formIndex, 'phone_no', e.target.value)}
                      placeholder="+234 123 456 7890"
                      type="tel"
                      disabled={isDisabled}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormLabel>Website *</FormLabel>
                    <Input
                      value={companyForm.website}
                      onChange={(e) => updateCompanyForm(formIndex, 'website', e.target.value)}
                      placeholder="https://example.com"
                      disabled={isDisabled}
                    />
                  </div>

                  {['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'].map((platform) => (
                    <div key={platform}>
                      <FormLabel>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)} Link
                      </FormLabel>
                      <Input
                        value={
                          companyForm[`${platform}_link` as keyof CompanyFormData] as string
                        }
                        onChange={(e) =>
                          updateCompanyForm(
                            formIndex,
                            `${platform}_link` as keyof CompanyFormData,
                            e.target.value
                          )
                        }
                        placeholder={`https://${platform}.com/...`}
                        disabled={isDisabled}
                      />
                    </div>
                  ))}
                </div>

                <div className="border-t pt-6 mt-8">
                  <div className="flex justify-between items-center mb-5">
                    <FormLabel className="text-lg font-medium">Subsidiaries</FormLabel>
                    {!isViewMode && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSubsidiary(formIndex)}
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add Subsidiary
                      </Button>
                    )}
                  </div>

                  {companyForm.subsidiaries.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">
                      No subsidiaries added yet.
                    </p>
                  ) : (
                    companyForm.subsidiaries.map((sub, subIndex) => (
                      <div
                        key={subIndex}
                        className="flex gap-4 items-end mb-5 p-4 border rounded-lg bg-gray-50/50"
                      >
                        <div className="flex-1">
                          <FormLabel>Subsidiary Company</FormLabel>
                          <SearchableCombobox
                            options={apiCompanies.map((c) => ({
                              value: c.id.toString(),
                              label: c.company_name,
                            }))}
                            value={sub.subsidiary_id ? sub.subsidiary_id.toString() : ''}
                            onChange={(val) =>
                              handleSubsidiaryChange(formIndex, subIndex, val)
                            }
                            placeholder="Search subsidiary company..."
                            loading={loadingCompanies}
                            disabled={isDisabled}
                          />
                        </div>
                        {!isViewMode && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSubsidiary(formIndex, subIndex)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Minus className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}

            {!initialValues && !isViewMode && (
              <div className="flex justify-center my-8">
                <Button
                  type="button"
                  onClick={handleAddCompanyForm}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={companyForms.length >= 2}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Clone Current Form
                </Button>
              </div>
            )}

            <div className="border-t pt-6 mt-8"></div>

            <div className="flex justify-end gap-4 pt-4">
              {isViewMode ? (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Close
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Discard
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[140px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {initialValues ? 'Updating...' : 'Creating...'}
                      </>
                    ) : initialValues ? (
                      'Update Company'
                    ) : (
                      'Create Company'
                    )}
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      </div>
      {/* Main form scroll – always scrollable with wheel, scrollbar always mounted */}
      <ScrollBar orientation="vertical" forceMount={true} />
    </ScrollArea>
  );
}