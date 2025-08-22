import React, { useState } from 'react';
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
  id?: number;
  name: string;
  email: string;
  industry: string;
  subIndustry: string;
  prefix: string;
  officeAddress: string;
  officeState: string;
  officeCountry: string;
  contactPerson: string;
  ceo: string;
  phone: string;
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
}

export default function CreateCompanyForm({ onSave, onCancel }: CreateCompanyFormProps) {
  const [companyForms, setCompanyForms] = useState<CompanyFormData[]>([{
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
    linkedinLink: '',
    youtubeLink: '',
  }]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm();

  const onSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const companies = companyForms.map(formData => ({
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
        facebook_link: formData.facebookLink || '',
        instagram_link: formData.instagramLink || '',
        twitter_link: formData.twitterLink || '',
        linkedin_link: formData.linkedinLink || '',
        youtube_link: formData.youtubeLink || '',
      }));

      const createdCompanies = [];
      for (const companyData of companies) {
        try {
          const res = await axios.post(
            'https://p-backend-nhe0.onrender.com/api/companies/create',
            companyData
          );
          createdCompanies.push(res.data);
        } catch (error: any) {
          console.error('Error creating company:', error.response?.data || error);
          toast.error(`Failed to create company: ${companyData.company_name}`);
        }
      }

      if (createdCompanies.length > 0) {
        if (createdCompanies.length === 1) {
          onSave(createdCompanies[0]);
          toast.success("Company created successfully");
        } else {
          createdCompanies.forEach(company => onSave(company));
          toast.success(`${createdCompanies.length} companies created successfully`);
        }
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error("Failed to create company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cloneCompanyForm = () => {
    if (companyForms.length < 2) {
      setCompanyForms([...companyForms, { ...companyForms[0] }]);
      toast.success("Company form cloned");
    } else {
      toast.error("Maximum of 2 company forms allowed");
    }
  };

  const removeCompanyForm = (index: number) => {
    setCompanyForms(companyForms.filter((_, i) => i !== index));
  };

  const updateCompanyForm = (index: number, field: keyof CompanyFormData, value: string) => {
    const updatedForms = [...companyForms];
    updatedForms[index] = { ...updatedForms[index], [field]: value };
    setCompanyForms(updatedForms);
  };

  const industryOptions = [
    'Financial Services', 'Technology', 'Healthcare', 'Manufacturing',
    'Retail', 'Education', 'Media', 'Other'
  ];

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="p-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {companyForms.map((companyForm, formIndex) => (
              <div key={formIndex} className="border p-4 rounded-md relative mb-6">
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

                {/* Company Name */}
                <div className="mb-4">
                  <FormLabel>Company Name</FormLabel>
                  <Input
                    value={companyForm.name}
                    onChange={(e) => updateCompanyForm(formIndex, 'name', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>

                {/* Industry */}
                <div className="mb-4">
                  <FormLabel>Industry</FormLabel>
                  <Select
                    value={companyForm.industry}
                    onValueChange={(value) => updateCompanyForm(formIndex, 'industry', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryOptions.map((ind) => (
                        <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub-Industry */}
                <div className="mb-4">
                  <FormLabel>Sub-Industry</FormLabel>
                  <Input
                    value={companyForm.subIndustry}
                    onChange={(e) => updateCompanyForm(formIndex, 'subIndustry', e.target.value)}
                    placeholder="Enter sub-industry"
                  />
                </div>

                {/* Email */}
                <div className="mb-4">
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => updateCompanyForm(formIndex, 'email', e.target.value)}
                    placeholder="Enter email"
                  />
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    value={companyForm.phone}
                    onChange={(e) => updateCompanyForm(formIndex, 'phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Website */}
                <div className="mb-4">
                  <FormLabel>Website</FormLabel>
                  <Input
                    value={companyForm.website}
                    onChange={(e) => updateCompanyForm(formIndex, 'website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                {/* CEO */}
                <div className="mb-4">
                  <FormLabel>CEO</FormLabel>
                  <Input
                    value={companyForm.ceo}
                    onChange={(e) => updateCompanyForm(formIndex, 'ceo', e.target.value)}
                    placeholder="Enter CEO name"
                  />
                </div>

                {/* Contact Person */}
                <div className="mb-4">
                  <FormLabel>Contact Person</FormLabel>
                  <Input
                    value={companyForm.contactPerson}
                    onChange={(e) => updateCompanyForm(formIndex, 'contactPerson', e.target.value)}
                    placeholder="Enter contact person"
                  />
                </div>

                {/* Office Address */}
                <div className="mb-4">
                  <FormLabel>Office Address</FormLabel>
                  <Textarea
                    value={companyForm.officeAddress}
                    onChange={(e) => updateCompanyForm(formIndex, 'officeAddress', e.target.value)}
                    placeholder="Enter office address"
                  />
                </div>

                {/* Office State */}
                <div className="mb-4">
                  <FormLabel>Office State</FormLabel>
                  <Input
                    value={companyForm.officeState}
                    onChange={(e) => updateCompanyForm(formIndex, 'officeState', e.target.value)}
                    placeholder="Enter office state"
                  />
                </div>

                {/* Office Country */}
                <div className="mb-4">
                  <FormLabel>Office Country</FormLabel>
                  <Input
                    value={companyForm.officeCountry}
                    onChange={(e) => updateCompanyForm(formIndex, 'officeCountry', e.target.value)}
                    placeholder="Enter office country"
                  />
                </div>

                {/* Social Links */}
                <div className="mb-4">
                  <FormLabel>Facebook</FormLabel>
                  <Input
                    value={companyForm.facebookLink}
                    onChange={(e) => updateCompanyForm(formIndex, 'facebookLink', e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="mb-4">
                  <FormLabel>Instagram</FormLabel>
                  <Input
                    value={companyForm.instagramLink}
                    onChange={(e) => updateCompanyForm(formIndex, 'instagramLink', e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="mb-4">
                  <FormLabel>Twitter</FormLabel>
                  <Input
                    value={companyForm.twitterLink}
                    onChange={(e) => updateCompanyForm(formIndex, 'twitterLink', e.target.value)}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div className="mb-4">
                  <FormLabel>LinkedIn</FormLabel>
                  <Input
                    value={companyForm.linkedinLink}
                    onChange={(e) => updateCompanyForm(formIndex, 'linkedinLink', e.target.value)}
                    placeholder="https://linkedin.com/..."
                  />
                </div>
                <div className="mb-4">
                  <FormLabel>YouTube</FormLabel>
                  <Input
                    value={companyForm.youtubeLink}
                    onChange={(e) => updateCompanyForm(formIndex, 'youtubeLink', e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
            ))}

            {/* Clone Form Button */}
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

            <div className="border-t pt-4 mt-4"></div>

            {/* Footer Buttons */}
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
    </ScrollArea>
  );
}
