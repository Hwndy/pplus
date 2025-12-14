import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/components/auth/AuthContext';
// Adjust path if needed

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

export default function CreateCompanyForm({
  onSave,
  onCancel,
  initialValues = null,
  isViewMode = false,
}: CreateCompanyFormProps) {
  const { token } = useAuth();

  const [companyForms, setCompanyForms] = useState<CompanyFormData[]>([
    initialValues || {
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
  ]);

  const [apiCompanies, setApiCompanies] = useState<Company[]>([]);
  const [subIndustries, setSubIndustries] = useState<string[]>([]);
  const [ceos, setCeos] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch parameters (Sub-Industry, CEO) and companies for subsidiaries
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }

      setLoadingOptions(true);
      try {
        // Fetch data-parameters
        const paramsRes = await axios.get('https://pplus-5kdv.onrender.com/api/data-parameters', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const categories = paramsRes.data?.data?.data?.[0]?.categories || [];

        // Extract Sub-Industry values
        const subIndustryCategory = categories.find((cat: any) =>
          cat.name.toLowerCase().includes('sub') && cat.name.toLowerCase().includes('industry')
        );
        if (subIndustryCategory?.values) {
          setSubIndustries(subIndustryCategory.values.map((v: any) => v.value));
        }

        // Extract CEO values
        const ceoCategory = categories.find((cat: any) =>
          cat.name.toLowerCase() === 'ceo' || cat.name.toLowerCase().includes('ceo')
        );
        if (ceoCategory?.values) {
          setCeos(ceoCategory.values.map((v: any) => v.value));
        }

        // Fetch companies for subsidiary dropdown
        const compRes = await axios.get('https://pplus-5kdv.onrender.com/api/companies/?limit=1000', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const companies = compRes.data?.data?.data || [];
        setApiCompanies(companies.filter((c: any) => c.id && c.company_name));

      } catch (error: any) {
        console.error('Failed to load form options:', error);
        toast.error(error.response?.data?.message || 'Failed to load dropdown options');
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchData();
  }, [token]);

  // Populate form when editing
  useEffect(() => {
    if (initialValues) {
      setCompanyForms([{
        id: initialValues.id,
        company_name: initialValues.company_name || '',
        email: initialValues.email || '',
        industry: initialValues.industry || '',
        sub_industry: initialValues.sub_industry || '',
        subsidiaries: initialValues.subsidiaries?.map(sub => ({
          id: sub.id,
          subsidiary_id: sub.subsidiary_id || 0,
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
    setCompanyForms(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubsidiaryChange = (formIndex: number, subIndex: number, value: string) => {
    setCompanyForms(prev => prev.map((form, i) =>
      i === formIndex ? {
        ...form,
        subsidiaries: form.subsidiaries.map((sub, j) =>
          j === subIndex ? { ...sub, subsidiary_id: parseInt(value) } : sub
        )
      } : form
    ));
  };

  const handleAddSubsidiary = (formIndex: number) => {
    setCompanyForms(prev => prev.map((form, i) =>
      i === formIndex ? {
        ...form,
        subsidiaries: [...form.subsidiaries, { subsidiary_id: 0 }]
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
    if (isViewMode || isSubmitting || !token) return;

    setIsSubmitting(true);
    try {
      const results = [];
      for (const [index, form] of companyForms.entries()) {
        const payload: any = {
          company_name: form.company_name.trim(),
          email: form.email.trim(),
          industry: form.industry,
          sub_industry: form.sub_industry,
          office_address: form.office_address.trim(),
          office_state: form.office_state.trim(),
          office_country: form.office_country.trim(),
          contact_person: form.contact_person.trim(),
          ceo: form.ceo,
          phone_no: form.phone_no.trim(),
          website: form.website.trim(),
          facebook_link: form.facebook_link?.trim() || null,
          instagram_link: form.instagram_link?.trim() || null,
          twitter_link: form.twitter_link?.trim() || null,
          linkedin_link: form.linkedin_link?.trim() || null,
          youtube_link: form.youtube_link?.trim() || null,
        };

        const subsidiaries = form.subsidiaries
          .filter(s => s.subsidiary_id > 0)
          .map(s => ({ subsidiary_id: s.subsidiary_id }));

        if (subsidiaries.length > 0) {
          payload.subsidiaries = subsidiaries;
        }

        let res;
        if (initialValues?.id && index === 0) {
          res = await axios.put(
            `https://pplus-5kdv.onrender.com/api/companies/update/${initialValues.id}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          res = await axios.post(
            'https://pplus-5kdv.onrender.com/api/companies/create',
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        results.push(res.data);
      }

      onSave(results.length === 1 ? results[0] : results);
      toast.success(initialValues ? 'Company updated successfully' : `${results.length} company(ies) created successfully`);
    } catch (error: any) {
      console.error('Error saving company:', error);
      toast.error(error.response?.data?.message || 'Failed to save company');
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

  if (loadingOptions) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mr-3" />
        <p>Loading form options...</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)] pr-4">
      <div className="p-4">
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8">
          {companyForms.map((companyForm, formIndex) => (
            <div key={formIndex} className="border rounded-lg p-6 relative bg-white">
              {formIndex > 0 && !isViewMode && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-red-600 hover:bg-red-50"
                  onClick={() => handleRemoveCompanyForm(formIndex)}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormLabel>Company Name *</FormLabel>
                  <Input
                    value={companyForm.company_name}
                    onChange={(e) => updateCompanyForm(formIndex, 'company_name', e.target.value)}
                    placeholder="Company Name"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <FormLabel>Industry</FormLabel>
                  <Select
                    value={companyForm.industry}
                    onValueChange={(val) => updateCompanyForm(formIndex, 'industry', val)}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FormLabel>Sub-Industry *</FormLabel>
                  <Select
                    value={companyForm.sub_industry}
                    onValueChange={(val) => updateCompanyForm(formIndex, 'sub_industry', val)}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={subIndustries.length === 0 ? "No options" : "Select sub-industry"} />
                    </SelectTrigger>
                    <SelectContent>
                      {subIndustries.map((item) => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FormLabel>CEO *</FormLabel>
                  <Select
                    value={companyForm.ceo}
                    onValueChange={(val) => updateCompanyForm(formIndex, 'ceo', val)}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={ceos.length === 0 ? "No CEOs available" : "Select CEO"} />
                    </SelectTrigger>
                    <SelectContent>
                      {ceos.map((ceo) => (
                        <SelectItem key={ceo} value={ceo}>{ceo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <FormLabel>Office Address *</FormLabel>
                  <Textarea
                    value={companyForm.office_address}
                    onChange={(e) => updateCompanyForm(formIndex, 'office_address', e.target.value)}
                    placeholder="Office Address"
                    disabled={isViewMode}
                    rows={3}
                  />
                </div>

                <div>
                  <FormLabel>Office State *</FormLabel>
                  <Input
                    value={companyForm.office_state}
                    onChange={(e) => updateCompanyForm(formIndex, 'office_state', e.target.value)}
                    placeholder="Office State"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <FormLabel>Office Country *</FormLabel>
                  <Input
                    value={companyForm.office_country}
                    onChange={(e) => updateCompanyForm(formIndex, 'office_country', e.target.value)}
                    placeholder="Office Country"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <FormLabel>Email *</FormLabel>
                  <Input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => updateCompanyForm(formIndex, 'email', e.target.value)}
                    placeholder="Email"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <FormLabel>Contact Person *</FormLabel>
                  <Input
                    value={companyForm.contact_person}
                    onChange={(e) => updateCompanyForm(formIndex, 'contact_person', e.target.value)}
                    placeholder="Contact Person"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <FormLabel>Phone *</FormLabel>
                  <Input
                    value={companyForm.phone_no}
                    onChange={(e) => updateCompanyForm(formIndex, 'phone_no', e.target.value)}
                    placeholder="Phone"
                    type="tel"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <FormLabel>Website *</FormLabel>
                  <Input
                    value={companyForm.website}
                    onChange={(e) => updateCompanyForm(formIndex, 'website', e.target.value)}
                    placeholder="https://"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <FormLabel>Facebook Link</FormLabel>
                  <Input
                    value={companyForm.facebook_link}
                    onChange={(e) => updateCompanyForm(formIndex, 'facebook_link', e.target.value)}
                    placeholder="https://facebook.com"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <FormLabel>Instagram Link</FormLabel>
                  <Input
                    value={companyForm.instagram_link}
                    onChange={(e) => updateCompanyForm(formIndex, 'instagram_link', e.target.value)}
                    placeholder="https://instagram.com"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <FormLabel>Twitter Link</FormLabel>
                  <Input
                    value={companyForm.twitter_link}
                    onChange={(e) => updateCompanyForm(formIndex, 'twitter_link', e.target.value)}
                    placeholder="https://twitter.com"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <FormLabel>LinkedIn Link</FormLabel>
                  <Input
                    value={companyForm.linkedin_link}
                    onChange={(e) => updateCompanyForm(formIndex, 'linkedin_link', e.target.value)}
                    placeholder="https://linkedin.com"
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <FormLabel>YouTube Link</FormLabel>
                  <Input
                    value={companyForm.youtube_link}
                    onChange={(e) => updateCompanyForm(formIndex, 'youtube_link', e.target.value)}
                    placeholder="https://youtube.com"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Subsidiaries Section */}
              <div className="border-t pt-6 mt-8">
                <div className="flex justify-between items-center mb-4">
                  <FormLabel className="text-lg font-semibold">Subsidiaries</FormLabel>
                  {!isViewMode && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSubsidiary(formIndex)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subsidiary
                    </Button>
                  )}
                </div>

                {companyForm.subsidiaries.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No subsidiaries added.</p>
                ) : (
                  companyForm.subsidiaries.map((sub, subIndex) => (
                    <div key={subIndex} className="flex gap-4 items-end mb-4 p-4 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <FormLabel>Subsidiary Company</FormLabel>
                        <Select
                          value={sub.subsidiary_id?.toString() || ''}
                          onValueChange={(val) => handleSubsidiaryChange(formIndex, subIndex, val)}
                          disabled={isViewMode}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a company" />
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

                      {!isViewMode && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSubsidiary(formIndex, subIndex)}
                          className="text-red-600"
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

          {/* Clone Form Button */}
          {!initialValues && !isViewMode && (
            <div className="flex justify-center py-6">
              <Button
                type="button"
                onClick={handleAddCompanyForm}
                disabled={companyForms.length >= 2}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Copy className="h-4 w-4 mr-2" />
                Add Another Company Form
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {isViewMode ? 'Close' : 'Discard'}
            </Button>

            {!isViewMode && (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-950 hover:bg-indigo-800"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {initialValues ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  initialValues ? 'Update Company' : 'Create Company'
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </ScrollArea>
  );
}