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
  prefix?: string;
  subsidiary_company_id: number;
}

interface CompanyFormData {
  id?: number;
  company_name: string;
  email: string;
  industry: string;
  sub_industry: string;
  prefix: string; // Retained for subsidiaries, removed from second row
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

export default function CreateCompanyForm({
  onSave,
  onCancel,
  initialValues = null,
  isViewMode = false,
}: CreateCompanyFormProps) {
  const [companyForms, setCompanyForms] = useState<CompanyFormData[]>([
    initialValues || {
      company_name: '',
      email: '',
      industry: '',
      sub_industry: '',
      prefix: '',
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
  ]);

  const [apiCompanies, setApiCompanies] = useState<Company[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CompanyFormData>();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axios.get('https://backend-e79r.onrender.com/api/companies/?limit=1000');
        const companies = res.data?.data?.data || [];
        const validCompanies = companies.filter((company: Company) => company.id && company.id.toString().length > 0);
        setApiCompanies(validCompanies);
      } catch (error) {
        console.error('Failed to fetch companies for subsidiaries:', error);
        toast.error('Failed to load companies for subsidiaries');
        setApiCompanies([]);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (initialValues) {
      setCompanyForms([{
        id: initialValues.id,
        company_name: initialValues.company_name || '',
        email: initialValues.email || '',
        industry: initialValues.industry || '',
        sub_industry: initialValues.sub_industry || '',
        prefix: initialValues.prefix || '', // Retained for subsidiaries
        subsidiaries: initialValues.subsidiaries.map(sub => ({
          id: sub.id,
          prefix: sub.prefix || '',
          subsidiary_company_id: sub.subsidiary_company_id || 0,
        })) || [],
        office_address: initialValues.office_address || '',
        office_state: initialValues.office_state || '',
        office_country: initialValues.office_country || '',
        contact_person: initialValues.contact_person || '',
        ceo: initialValues.ceo || '',
        phone_no: initialValues.phone_no || '',
        website: initialValues.website || '',
        facebook_link: initialValues.facebook_link || '',
        instagram_link: initialValues.instagram_link || '',
        twitter_link: initialValues.twitter_link || '',
        linkedin_link: initialValues.linkedin_link || '',
        youtube_link: initialValues.youtube_link || '',
      }]);
    }
  }, [initialValues]);

  const handleAddCompanyForm = () => {
    if (isViewMode || companyForms.length >= 2) {
      toast.error('Maximum of 2 company forms allowed');
      return;
    }
    setCompanyForms([...companyForms, {
      company_name: '',
      email: '',
      industry: '',
      sub_industry: '',
      prefix: '', // Removed from second row input
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
    }]);
    toast.success('Company form added');
  };

  const handleRemoveCompanyForm = (index: number) => {
    setCompanyForms(companyForms.filter((_, i) => i !== index));
  };

  const handleSubsidiaryChange = (formIndex: number, subIndex: number, field: keyof Subsidiary, value: string | number) => {
    setCompanyForms(prev => prev.map((form, i) => 
      i === formIndex ? {
        ...form,
        subsidiaries: form.subsidiaries.map((sub, j) => 
          j === subIndex ? { ...sub, [field]: field === 'subsidiary_company_id' ? parseInt(value as string) : value } : sub
        )
      } : form
    ));
  };

  const handleAddSubsidiary = (formIndex: number) => {
    setCompanyForms(prev => prev.map((form, i) => 
      i === formIndex ? {
        ...form,
        subsidiaries: [...form.subsidiaries, { subsidiary_company_id: 0, prefix: '' }]
      } : form
    ));
  };

  const handleRemoveSubsidiary = (formIndex: number, subIndex: number) => {
    setCompanyForms(prev => prev.map((form, i) => 
      i === formIndex ? {
        ...form,
        subsidiaries: form.subsidiaries.filter((_, j) => j !== subIndex)
      } : form
    ));
  };

  const updateCompanyForm = (index: number, field: keyof CompanyFormData, value: string) => {
    setCompanyForms(prev => prev.map((form, i) => 
      i === index ? { ...form, [field]: value } : form
    ));
  };

  const onSubmit = async () => {
    if (isViewMode) return;

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const results = [];
      for (const form of companyForms) {
        const companyData = {
          company_name: form.company_name,
          email: form.email,
          industry: form.industry,
          sub_industry: form.sub_industry,
          office_address: form.office_address,
          office_state: form.office_state,
          office_country: form.office_country,
          contact_person: form.contact_person,
          ceo: form.ceo,
          phone_no: form.phone_no,
          website: form.website,
          facebook_link: form.facebook_link || 'https://facebook.com',
          instagram_link: form.instagram_link || 'https://instagram.com',
          twitter_link: form.twitter_link || 'https://twitter.com',
          linkedin_link: form.linkedin_link || 'https://linkedin.com',
          youtube_link: form.youtube_link || 'https://youtube.com',
        };

        const subsidiaryData = form.subsidiaries
          .filter(sub => sub.subsidiary_company_id > 0)
          .map(sub => ({
            prefix: sub.prefix || null,
            subsidiary_company_id: sub.subsidiary_company_id,
          }));

        const payload = { ...companyData };
        if (subsidiaryData.length > 0) {
          payload.subsidiaries = subsidiaryData;
        }

        let res;
        if (initialValues && initialValues.id && index === 0) {
          res = await axios.put(
            `https://backend-e79r.onrender.com/api/companies/update/${initialValues.id}`,
            payload
          );
        } else {
          res = await axios.post(
            'https://backend-e79r.onrender.com/api/companies/create',
            payload
          );
        }
        results.push(res.data);
      }

      onSave(results.length === 1 ? results[0] : results);
      toast.success(
        initialValues ? 'Company updated successfully' : `${results.length} company(ies) created successfully`
      );
    } catch (error: any) {
      console.error('Error saving company:', error.response?.data || error);
      toast.error(
        `Failed to ${initialValues ? 'update' : 'create'} company: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const isDisabled = isViewMode;

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="p-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
            {companyForms.map((companyForm, formIndex) => (
              <div
                key={formIndex}
                className="border p-4 rounded-md relative mb-6"
              >
                {formIndex > 0 && !isViewMode && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveCompanyForm(formIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Company Name *</FormLabel>
                    <Input
                      value={companyForm.company_name}
                      onChange={(e) => updateCompanyForm(formIndex, 'company_name', e.target.value)}
                      placeholder="Company Name"
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>Industry</FormLabel>
                    <Select
                      value={companyForm.industry}
                      onValueChange={(val) => updateCompanyForm(formIndex, 'industry', val)}
                      disabled={isDisabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industryOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <FormLabel>Sub-Industry *</FormLabel>
                    <Input
                      value={companyForm.sub_industry}
                      onChange={(e) => updateCompanyForm(formIndex, 'sub_industry', e.target.value)}
                      placeholder="Sub-Industry"
                      disabled={isDisabled}
                    />
                  </div>

                  {/* Removed prefix from second row */}
                  {/* {formIndex === 0 && (
                    <div>
                      <FormLabel>Prefix</FormLabel>
                      <Input
                        value={companyForm.prefix}
                        onChange={(e) => updateCompanyForm(formIndex, 'prefix', e.target.value)}
                        placeholder="Prefix"
                        disabled={isDisabled}
                      />
                    </div>
                  )} */}

                  <div className="col-span-2">
                    <FormLabel>Office Address *</FormLabel>
                    <Textarea
                      value={companyForm.office_address}
                      onChange={(e) => updateCompanyForm(formIndex, 'office_address', e.target.value)}
                      placeholder="Office Address"
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>Office State *</FormLabel>
                    <Input
                      value={companyForm.office_state}
                      onChange={(e) => updateCompanyForm(formIndex, 'office_state', e.target.value)}
                      placeholder="Office State"
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>Office Country *</FormLabel>
                    <Input
                      value={companyForm.office_country}
                      onChange={(e) => updateCompanyForm(formIndex, 'office_country', e.target.value)}
                      placeholder="Office Country"
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>Email *</FormLabel>
                    <Input
                      value={companyForm.email}
                      onChange={(e) => updateCompanyForm(formIndex, 'email', e.target.value)}
                      placeholder="Email"
                      type="email"
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>Contact Person *</FormLabel>
                    <Input
                      value={companyForm.contact_person}
                      onChange={(e) => updateCompanyForm(formIndex, 'contact_person', e.target.value)}
                      placeholder="Contact Person"
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>CEO *</FormLabel>
                    <Input
                      value={companyForm.ceo}
                      onChange={(e) => updateCompanyForm(formIndex, 'ceo', e.target.value)}
                      placeholder="CEO"
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>Phone *</FormLabel>
                    <Input
                      value={companyForm.phone_no}
                      onChange={(e) => updateCompanyForm(formIndex, 'phone_no', e.target.value)}
                      placeholder="Phone"
                      type="tel"
                      disabled={isDisabled}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormLabel>Website *</FormLabel>
                    <Input
                      value={companyForm.website}
                      onChange={(e) => updateCompanyForm(formIndex, 'website', e.target.value)}
                      placeholder="Website"
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>Facebook Link</FormLabel>
                    <Input
                      value={companyForm.facebook_link}
                      onChange={(e) => updateCompanyForm(formIndex, 'facebook_link', e.target.value)}
                      placeholder="https://facebook.com"
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>Instagram Link</FormLabel>
                    <Input
                      value={companyForm.instagram_link}
                      onChange={(e) => updateCompanyForm(formIndex, 'instagram_link', e.target.value)}
                      placeholder="https://instagram.com"
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>Twitter Link</FormLabel>
                    <Input
                      value={companyForm.twitter_link}
                      onChange={(e) => updateCompanyForm(formIndex, 'twitter_link', e.target.value)}
                      placeholder="https://twitter.com"
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>LinkedIn Link</FormLabel>
                    <Input
                      value={companyForm.linkedin_link}
                      onChange={(e) => updateCompanyForm(formIndex, 'linkedin_link', e.target.value)}
                      placeholder="https://linkedin.com"
                      disabled={isDisabled}
                    />
                  </div>

                  <div>
                    <FormLabel>YouTube Link</FormLabel>
                    <Input
                      value={companyForm.youtube_link}
                      onChange={(e) => updateCompanyForm(formIndex, 'youtube_link', e.target.value)}
                      placeholder="https://youtube.com"
                      disabled={isDisabled}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <FormLabel>Subsidiaries</FormLabel>
                    {!isViewMode && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSubsidiary(formIndex)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Subsidiary
                      </Button>
                    )}
                  </div>
                  {companyForm.subsidiaries.length === 0 ? (
                    <p className="text-gray-500 text-sm">No subsidiaries added.</p>
                  ) : (
                    companyForm.subsidiaries.map((sub, subIndex) => (
                      <div key={subIndex} className="flex gap-4 items-end mb-4 p-3 border rounded-md">
                        <div className="flex-1">
                          <FormLabel>Subsidiary Company</FormLabel>
                          <Select
                            value={sub.subsidiary_company_id ? sub.subsidiary_company_id.toString() : ''}
                            onValueChange={(val) => handleSubsidiaryChange(formIndex, subIndex, 'subsidiary_company_id', val)}
                            disabled={isDisabled}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Search for a company" />
                            </SelectTrigger>
                            <SelectContent>
                              {apiCompanies.map((company) => (
                                <SelectItem key={company.id} value={company.id.toString()}>
                                  {company.company_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <FormLabel>Prefix</FormLabel>
                          <Input
                            value={sub.prefix || ''}
                            onChange={(e) => handleSubsidiaryChange(formIndex, subIndex, 'prefix', e.target.value)}
                            placeholder="Prefix (optional)"
                            disabled={isDisabled}
                          />
                        </div>
                        {!isViewMode && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSubsidiary(formIndex, subIndex)}
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
            ))}

            {!initialValues && !isViewMode && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={handleAddCompanyForm}
                  className="bg-blue-500 hover:bg-blue-600"
                  disabled={companyForms.length >= 2}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Clone Company Form
                </Button>
              </div>
            )}

            <div className="border-t pt-4 mt-4"></div>

            <div className="flex justify-end space-x-2 pt-4">
              {isViewMode ? (
                <Button type="button" onClick={onCancel} disabled={isSubmitting}>
                  Close
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-800"
                    disabled={isSubmitting}
                  >
                    Discard
                  </Button>
                  <Button type="submit" className="bg-indigo-950" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {initialValues ? 'Updating...' : 'Creating...'}
                      </>
                    ) : initialValues ? (
                      'Update'
                    ) : (
                      'Save'
                    )}
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
}