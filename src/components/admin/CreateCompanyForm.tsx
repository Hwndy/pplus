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
import { X, Copy, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import axios from 'axios';

interface CompanyFormData {
  id?: string;
  name: string; // maps to company_name
  email: string;
  industry: string;
  subIndustry: string; // maps to sub_industry
  prefix: string;
  officeAddress: string; // maps to office_address
  officeState: string; // maps to office_state
  officeCountry: string; // maps to office_country
  contactPerson: string; // maps to contact_person
  ceo: string;
  phone: string; // maps to phone_no
  website: string;
  facebookLink: string;
  instagramLink: string;
  twitterLink: string;
  linkedinLink: string;
  youtubeLink: string;
}

interface CreateCompanyFormProps {
  onSave: (company: any) => void;
  onCancel: () => void;
  initialValues?: CompanyFormData | null; // ✅ for edit mode
}

export default function CreateCompanyForm({
  onSave,
  onCancel,
  initialValues = null,
}: CreateCompanyFormProps) {
  const [companyForms, setCompanyForms] = useState<CompanyFormData[]>([
    initialValues || {
      name: '',
      email: '',
      industry: '',
      subIndustry: '',
      prefix: '',
      officeAddress: '',
      officeState: '',
      officeCountry: '',
      contactPerson: '',
      ceo: '',
      phone: '',
      website: '',
      facebookLink: '',
      instagramLink: '',
      twitterLink: '',
      linkedinLink: 'https://linkedin.com',
      youtubeLink: 'https://youtube.com',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm();

  useEffect(() => {
    if (initialValues) {
      setCompanyForms([initialValues]);
    }
  }, [initialValues]);

  const onSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const companies = companyForms.map((formData) => ({
        company_name: formData.name,
        email: formData.email,
        industry: formData.industry,
        sub_industry: formData.subIndustry,
        ceo: formData.ceo,
        phone_no: formData.phone,
        website: formData.website,
        office_address: formData.officeAddress,
        office_state: formData.officeState,
        office_country: formData.officeCountry,
        contact_person: formData.contactPerson,
        facebook_link: formData.facebookLink || 'https://facebook.com',
        instagram_link: formData.instagramLink || 'https://instagram.com',
        twitter_link: formData.twitterLink || 'https://twitter.com',
        linkedin_link: formData.linkedinLink || 'https://linkedin.com',
        youtube_link: formData.youtubeLink || 'https://youtube.com',
      }));

      const createdOrUpdatedCompanies = [];

      for (const companyData of companies) {
        try {
          let res;
          if (initialValues && initialValues.id) {
            // ✅ EDIT mode
            res = await axios.put(
              `https://pplus-y9m6.onrender.com/api/companies/${initialValues.id}`,
              companyData
            );
          } else {
            // ✅ CREATE mode
            res = await axios.post(
              'https://pplus-y9m6.onrender.com/api/companies/create',
              companyData
            );
          }
          createdOrUpdatedCompanies.push(res.data);
        } catch (error: any) {
          console.error('Error saving company:', error.response?.data || error);
          toast.error(
            `Failed to ${
              initialValues ? 'update' : 'create'
            } company: ${companyData.company_name}`
          );
        }
      }

      if (createdOrUpdatedCompanies.length > 0) {
        onSave(
          createdOrUpdatedCompanies.length === 1
            ? createdOrUpdatedCompanies[0]
            : createdOrUpdatedCompanies
        );

        toast.success(
          initialValues
            ? 'Company updated successfully'
            : `${createdOrUpdatedCompanies.length} company(ies) created successfully`
        );
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error(
        initialValues ? 'Failed to update company' : 'Failed to create company'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const cloneCompanyForm = () => {
    if (companyForms.length < 2) {
      setCompanyForms([...companyForms, { ...companyForms[0] }]);
      toast.success('Company form cloned');
    } else {
      toast.error('Maximum of 2 company forms allowed');
    }
  };

  const removeCompanyForm = (index: number) => {
    setCompanyForms(companyForms.filter((_, i) => i !== index));
  };

  const updateCompanyForm = (
    index: number,
    field: keyof CompanyFormData,
    value: string
  ) => {
    const updatedForms = [...companyForms];
    updatedForms[index] = { ...updatedForms[index], [field]: value };
    setCompanyForms(updatedForms);
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

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="p-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {companyForms.map((companyForm, formIndex) => (
              <div
                key={formIndex}
                className="border p-4 rounded-md relative mb-6"
              >
                {formIndex > 0 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    onClick={() => removeCompanyForm(formIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}

                {/* ✅ Your full UI fields go here (unchanged) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Company Name</FormLabel>
                    <Input
                      value={companyForm.name}
                      onChange={(e) =>
                        updateCompanyForm(formIndex, 'name', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <FormLabel>Email</FormLabel>
                    <Input
                      value={companyForm.email}
                      onChange={(e) =>
                        updateCompanyForm(formIndex, 'email', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <FormLabel>Industry</FormLabel>
                    <Select
                      value={companyForm.industry}
                      onValueChange={(val) =>
                        updateCompanyForm(formIndex, 'industry', val)
                      }
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
                    <FormLabel>Sub-Industry</FormLabel>
                    <Input
                      value={companyForm.subIndustry}
                      onChange={(e) =>
                        updateCompanyForm(formIndex, 'subIndustry', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <FormLabel>Prefix</FormLabel>
                    <Input
                      value={companyForm.prefix}
                      onChange={(e) =>
                        updateCompanyForm(formIndex, 'prefix', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <FormLabel>Office Address</FormLabel>
                    <Textarea
                      value={companyForm.officeAddress}
                      onChange={(e) =>
                        updateCompanyForm(formIndex, 'officeAddress', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <FormLabel>Office State</FormLabel>
                    <Input
                      value={companyForm.officeState}
                      onChange={(e) =>
                        updateCompanyForm(formIndex, 'officeState', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <FormLabel>Office Country</FormLabel>
                    <Input
                      value={companyForm.officeCountry}
                      onChange={(e) =>
                        updateCompanyForm(formIndex, 'officeCountry', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <FormLabel>Contact Person</FormLabel>
                    <Input
                      value={companyForm.contactPerson}
                      onChange={(e) =>
                        updateCompanyForm(formIndex, 'contactPerson', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <FormLabel>CEO</FormLabel>
                    <Input
                      value={companyForm.ceo}
                      onChange={(e) =>
                        updateCompanyForm(formIndex, 'ceo', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <FormLabel>Phone</FormLabel>
                    <Input
                      value={companyForm.phone}
                      onChange={(e) =>
                        updateCompanyForm(formIndex, 'phone', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <FormLabel>Website</FormLabel>
                    <Input
                      value={companyForm.website}
                      onChange={(e) =>
                        updateCompanyForm(formIndex, 'website', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <FormLabel>Facebook</FormLabel>
                    <Input
                      value={companyForm.facebookLink}
                      onChange={(e) =>
                        updateCompanyForm(formIndex, 'facebookLink', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <FormLabel>Instagram</FormLabel>
                    <Input
                      value={companyForm.instagramLink}
                      onChange={(e) =>
                        updateCompanyForm(formIndex, 'instagramLink', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <FormLabel>Twitter</FormLabel>
                    <Input
                      value={companyForm.twitterLink}
                      onChange={(e) =>
                        updateCompanyForm(formIndex, 'twitterLink', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <FormLabel>LinkedIn</FormLabel>
                    <Input
                      value={companyForm.linkedinLink}
                      onChange={(e) =>
                        updateCompanyForm(formIndex, 'linkedinLink', e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <FormLabel>YouTube</FormLabel>
                    <Input
                      value={companyForm.youtubeLink}
                      onChange={(e) =>
                        updateCompanyForm(formIndex, 'youtubeLink', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

            {!initialValues && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={cloneCompanyForm}
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
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="bg-gray-50 hover:bg-gray-100 text-gray-800"
                disabled={isSubmitting}
              >
                Discard
              </Button>
              <Button
                type="submit"
                className="bg-indigo-950"
                disabled={isSubmitting}
              >
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
            </div>
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
}
