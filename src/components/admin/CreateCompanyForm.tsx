import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Copy, Loader2, Plus, Minus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import axios from 'axios';

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

interface ParameterValue {
  id: string | number;
  value: string;
}

interface CreateCompanyFormProps {
  onSave: (company: any) => void;
  onCancel: () => void;
  initialValues?: CompanyFormData | null;
  isViewMode?: boolean;
}

export default function CreateCompanyForm({
  onSave,
  onCancel,
  initialValues = null,
  isViewMode = false,
}: CreateCompanyFormProps) {
  const [apiCompanies, setApiCompanies] = useState<Company[]>([]);
  const [subIndustries, setSubIndustries] = useState<ParameterValue[]>([]);
  const [ceos, setCeos] = useState<ParameterValue[]>([]);
  const [loadingParams, setLoadingParams] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const industryOptions = [
    'Financial Services',
    'Technology',
    'Healthcare',
    'Manufacturing',
    'Retail',
    'Education',
    'Media',
    'Other',
  ];

  const methods = useForm<CompanyFormData>({
    defaultValues: initialValues || {
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
    },
  });

  const { reset, handleSubmit, control } = methods;

  // Fetch companies for subsidiaries
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get('https://pplus-5kdv.onrender.com/api/companies/?limit=1000');
        const companies = res.data?.data?.data || [];
        setApiCompanies(companies.filter((c: Company) => c.id && c.company_name));
      } catch (error) {
        console.error('Failed to fetch companies:', error);
        toast.error('Failed to load companies for subsidiaries');
      }
    };
    fetchCompanies();
  }, []);

  // Fetch Sub-Industry and CEO from data-parameters
  useEffect(() => {
    const fetchParameters = async () => {
      setLoadingParams(true);
      try {
        const res = await axios.get('https://pplus-5kdv.onrender.com/api/data-parameters');
        const categories = res.data?.data?.data?.[0]?.categories || [];

        const subIndustryCat = categories.find((cat: any) =>
          cat.name.toLowerCase().includes('sub industry') || cat.name === 'Sub Industry'
        );
        const ceoCat = categories.find((cat: any) =>
          cat.name.toLowerCase().includes('ceo') || cat.name === 'CEO'
        );

        setSubIndustries(subIndustryCat?.values?.map((v: any) => ({ id: v.id, value: v.value })) || []);
        setCeos(ceoCat?.values?.map((v: any) => ({ id: v.id, value: v.value })) || []);
      } catch (error) {
        console.error('Failed to fetch parameters:', error);
        toast.error('Failed to load Sub-Industry or CEO options');
      } finally {
        setLoadingParams(false);
      }
    };

    fetchParameters();
  }, []);

  // Reset form when editing
  useEffect(() => {
    if (initialValues) {
      reset({
        ...initialValues,
        subsidiaries: initialValues.subsidiaries || [],
      });
    }
  }, [initialValues, reset]);

  const onSubmit = async (data: CompanyFormData) => {
    if (isViewMode || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const companyData = {
        company_name: data.company_name.trim(),
        email: data.email.trim(),
        industry: data.industry,
        sub_industry: data.sub_industry,
        office_address: data.office_address.trim(),
        office_state: data.office_state.trim(),
        office_country: data.office_country.trim(),
        contact_person: data.contact_person.trim(),
        ceo: data.ceo,
        phone_no: data.phone_no.trim(),
        website: data.website.trim(),
        facebook_link: data.facebook_link.trim() || 'https://facebook.com',
        instagram_link: data.instagram_link.trim() || 'https://instagram.com',
        twitter_link: data.twitter_link.trim() || 'https://twitter.com',
        linkedin_link: data.linkedin_link.trim() || 'https://linkedin.com',
        youtube_link: data.youtube_link.trim() || 'https://youtube.com',
      };

      const subsidiaryData = data.subsidiaries
        .filter(sub => sub.subsidiary_id > 0)
        .map(sub => ({ subsidiary_id: sub.subsidiary_id }));

      const payload: any = { ...companyData };
      if (subsidiaryData.length > 0) {
        payload.subsidiaries = subsidiaryData;
      }

      let res;
      if (initialValues?.id) {
        res = await axios.put(
          `https://pplus-5kdv.onrender.com/api/companies/update/${initialValues.id}`,
          payload
        );
      } else {
        res = await axios.post(
          'https://pplus-5kdv.onrender.com/api/companies/create',
          payload
        );
      }

      onSave(res.data);
      toast.success(initialValues ? 'Company updated successfully' : 'Company created successfully');
    } catch (error: any) {
      console.error('Error saving company:', error);
      toast.error(`Failed to save: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isViewMode || loadingParams;

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="p-1">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="border p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="company_name"
                  rules={{ required: 'Company name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Company Name" disabled={isDisabled} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isDisabled}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industryOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="sub_industry"
                  rules={{ required: 'Sub-Industry is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub-Industry *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isDisabled || subIndustries.length === 0}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingParams ? 'Loading...' : 'Select sub-industry'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subIndustries.map((item) => (
                            <SelectItem key={item.id} value={item.value}>
                              {item.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="office_address"
                  rules={{ required: 'Office address is required' }}
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Office Address *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Office Address" disabled={isDisabled} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="office_state"
                  rules={{ required: 'Office state is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office State *</FormLabel>
                      <FormControl>
                        <Input placeholder="Office State" disabled={isDisabled} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="office_country"
                  rules={{ required: 'Office country is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Office Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="Office Country" disabled={isDisabled} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="email"
                  rules={{ required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email" disabled={isDisabled} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="contact_person"
                  rules={{ required: 'Contact person is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person *</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact Person" disabled={isDisabled} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="ceo"
                  rules={{ required: 'CEO is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEO *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isDisabled || ceos.length === 0}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingParams ? 'Loading...' : 'Select CEO'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ceos.map((item) => (
                            <SelectItem key={item.id} value={item.value}>
                              {item.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="phone_no"
                  rules={{ required: 'Phone is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Phone" disabled={isDisabled} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="website"
                  rules={{ required: 'Website is required' }}
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Website *</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" disabled={isDisabled} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Social Links (optional) */}
                <FormField control={control} name="facebook_link" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com" disabled={isDisabled} {...field} />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={control} name="instagram_link" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com" disabled={isDisabled} {...field} />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={control} name="twitter_link" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://twitter.com" disabled={isDisabled} {...field} />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={control} name="linkedin_link" render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com" disabled={isDisabled} {...field} />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={control} name="youtube_link" render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com" disabled={isDisabled} {...field} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>

              {/* Subsidiaries */}
              <div className="border-t pt-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <FormLabel className="text-lg">Subsidiaries</FormLabel>
                  {!isViewMode && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const current = methods.getValues('subsidiaries') || [];
                        methods.setValue('subsidiaries', [...current, { subsidiary_id: 0 }]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Subsidiary
                    </Button>
                  )}
                </div>

                {(methods.watch('subsidiaries') || []).length === 0 ? (
                  <p className="text-gray-500 text-sm">No subsidiaries added.</p>
                ) : (
                  methods.watch('subsidiaries').map((_, index) => (
                    <div key={index} className="flex gap-4 items-end mb-4 p-3 border rounded-md">
                      <div className="flex-1">
                        <FormLabel>Subsidiary Company</FormLabel>
                        <FormField
                          control={control}
                          name={`subsidiaries.${index}.subsidiary_id`}
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value?.toString()}
                                disabled={isDisabled}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a company" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {apiCompanies.map((company) => (
                                    <SelectItem key={company.id} value={company.id.toString()}>
                                      {company.company_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                      {!isViewMode && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const current = methods.getValues('subsidiaries');
                            const updated = current.filter((_, i) => i !== index);
                            methods.setValue('subsidiaries', updated);
                          }}
                          className="text-red-500"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              {isViewMode ? (
                <Button type="button" onClick={onCancel}>
                  Close
                </Button>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Discard
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
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
        </FormProvider>
      </div>
    </ScrollArea>
  );
}