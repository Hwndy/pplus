
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Plus, X, Copy } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

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

export function CreateCompanyForm({ onSave, onCancel }: CreateCompanyFormProps) {
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
  
  const [subsidiaries, setSubsidiaries] = useState<Array<{ id: number, name: string }>>([]);
  
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      industry: '',
      subIndustry: '',
      prefix: '',
      subsidiaries: '',
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
    },
  });

  const onSubmit = () => {
    const companies = companyForms.map(formData => ({
      id: Math.floor(Math.random() * 10000),
      ...formData,
      subsidiaries: subsidiaries,
    }));
    
    if (companies.length === 1) {
      onSave(companies[0]);
      toast.success("Company created successfully");
    } else {
      // If multiple companies were created
      companies.forEach(company => {
        onSave(company);
      });
      toast.success(`${companies.length} companies created successfully`);
    }
  };

  const addSubsidiary = () => {
    setSubsidiaries([...subsidiaries, { id: subsidiaries.length + 1, name: '' }]);
  };

  const removeSubsidiary = (id: number) => {
    setSubsidiaries(subsidiaries.filter(s => s.id !== id));
  };

  const updateSubsidiary = (id: number, name: string) => {
    setSubsidiaries(subsidiaries.map(s => s.id === id ? { ...s, name } : s));
  };

  const cloneCompanyForm = () => {
    if (companyForms.length < 2) { // Limit to 2 forms
      setCompanyForms([...companyForms, { ...companyForms[0] }]);
      toast.success("Company form cloned");
    } else {
      toast.error("Maximum of 2 company forms allowed");
    }
  };

  const removeCompanyForm = (index: number) => {
    const updatedForms = companyForms.filter((_, i) => i !== index);
    setCompanyForms(updatedForms);
  };

  const updateCompanyForm = (index: number, field: keyof CompanyFormData, value: string) => {
    const updatedForms = [...companyForms];
    updatedForms[index] = { ...updatedForms[index], [field]: value };
    setCompanyForms(updatedForms);
  };

  const prefixOptions = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'];
  const industryOptions = ['Financial Services', 'Technology', 'Healthcare', 'Manufacturing', 'Retail', 'Education', 'Media', 'Other'];

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
                
                {/* First Row - Core Info */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <FormLabel>Company Name <span className="text-red-500">*</span></FormLabel>
                    <Input 
                      className="bg-gray-50 border-gray-200" 
                      placeholder="Enter company name"
                      value={companyForm.name}
                      onChange={(e) => updateCompanyForm(formIndex, 'name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Industry <span className="text-red-500">*</span></FormLabel>
                    <Select 
                      value={companyForm.industry}
                      onValueChange={(value) => updateCompanyForm(formIndex, 'industry', value)}
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industryOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <FormLabel>Sub-industry <span className="text-red-500">*</span></FormLabel>
                    <Input 
                      className="bg-gray-50 border-gray-200" 
                      placeholder="Enter sub-industry"
                      value={companyForm.subIndustry}
                      onChange={(e) => updateCompanyForm(formIndex, 'subIndustry', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                {/* Second Row - Contact Details */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                    <Input 
                      className="bg-gray-50 border-gray-200" 
                      placeholder="Enter email"
                      type="email"
                      value={companyForm.email}
                      onChange={(e) => updateCompanyForm(formIndex, 'email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Phone no <span className="text-red-500">*</span></FormLabel>
                    <Input 
                      className="bg-gray-50 border-gray-200" 
                      placeholder="Enter phone number"
                      value={companyForm.phone}
                      onChange={(e) => updateCompanyForm(formIndex, 'phone', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Website <span className="text-red-500">*</span></FormLabel>
                    <Input 
                      className="bg-gray-50 border-gray-200" 
                      placeholder="Enter website URL"
                      type="url"
                      value={companyForm.website}
                      onChange={(e) => updateCompanyForm(formIndex, 'website', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                {/* Third Row - Address */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <FormLabel>Office Address <span className="text-red-500">*</span></FormLabel>
                    <Textarea 
                      className="bg-gray-50 border-gray-200 min-h-[80px]" 
                      placeholder="Enter office address"
                      value={companyForm.officeAddress}
                      onChange={(e) => updateCompanyForm(formIndex, 'officeAddress', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Office State <span className="text-red-500">*</span></FormLabel>
                    <Input 
                      className="bg-gray-50 border-gray-200" 
                      placeholder="Enter office state"
                      value={companyForm.officeState}
                      onChange={(e) => updateCompanyForm(formIndex, 'officeState', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Office Country <span className="text-red-500">*</span></FormLabel>
                    <Input 
                      className="bg-gray-50 border-gray-200" 
                      placeholder="Enter office country"
                      value={companyForm.officeCountry}
                      onChange={(e) => updateCompanyForm(formIndex, 'officeCountry', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                {/* Fourth Row - Personnel */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <FormLabel>CEO <span className="text-red-500">*</span></FormLabel>
                    <Input 
                      className="bg-gray-50 border-gray-200" 
                      placeholder="Enter CEO name"
                      value={companyForm.ceo}
                      onChange={(e) => updateCompanyForm(formIndex, 'ceo', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Contact Person <span className="text-red-500">*</span></FormLabel>
                    <Input 
                      className="bg-gray-50 border-gray-200" 
                      placeholder="Enter contact person name"
                      value={companyForm.contactPerson}
                      onChange={(e) => updateCompanyForm(formIndex, 'contactPerson', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Prefix</FormLabel>
                    <Select 
                      value={companyForm.prefix}
                      onValueChange={(value) => updateCompanyForm(formIndex, 'prefix', value)}
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200">
                        <SelectValue placeholder="select prefix" />
                      </SelectTrigger>
                      <SelectContent>
                        {prefixOptions.map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Fifth Row - Social Media */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <FormLabel>Facebook Link</FormLabel>
                    <Input 
                      className="bg-gray-50 border-gray-200" 
                      placeholder="Enter Facebook URL"
                      type="url"
                      value={companyForm.facebookLink}
                      onChange={(e) => updateCompanyForm(formIndex, 'facebookLink', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Instagram Link</FormLabel>
                    <Input 
                      className="bg-gray-50 border-gray-200" 
                      placeholder="Enter Instagram URL"
                      type="url"
                      value={companyForm.instagramLink}
                      onChange={(e) => updateCompanyForm(formIndex, 'instagramLink', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Twitter Link</FormLabel>
                    <Input 
                      className="bg-gray-50 border-gray-200" 
                      placeholder="Enter Twitter URL"
                      type="url"
                      value={companyForm.twitterLink}
                      onChange={(e) => updateCompanyForm(formIndex, 'twitterLink', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="bg-gray-50 hover:bg-gray-100 text-gray-800"
              >
                Discard
              </Button>
              <Button type="submit" className="bg-indigo-950">Save</Button>
            </div>
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
}
