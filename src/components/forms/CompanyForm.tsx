import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/FileUpload';
import { useCreateCompany, useUpdateCompany } from '@/hooks/useApi';
import { toast } from 'sonner';
import { Loader2, Building2, Save, X } from 'lucide-react';

const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().min(1, 'Industry is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  ceo: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  description: z.string().optional(),
  logo: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyFormProps {
  company?: any;
  onSuccess?: (company: any) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

const industries = [
  'Technology',
  'Banking',
  'Telecommunications',
  'Manufacturing',
  'Healthcare',
  'Education',
  'Retail',
  'Energy',
  'Transportation',
  'Real Estate',
  'Agriculture',
  'Entertainment',
  'Food & Beverages',
  'Automotive',
  'Construction',
  'Insurance',
  'Consulting',
  'Media',
  'Government',
  'Non-Profit',
  'Other'
];

export function CompanyForm({ company, onSuccess, onCancel, mode = 'create' }: CompanyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoUrl, setLogoUrl] = useState(company?.logo || '');
  
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || '',
      industry: company?.industry || '',
      email: company?.email || '',
      phone: company?.phone || '',
      address: company?.address || '',
      ceo: company?.ceo || '',
      website: company?.website || '',
      description: company?.description || '',
      logo: company?.logo || '',
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setIsSubmitting(true);
      
      const formData = {
        ...data,
        logo: logoUrl,
      };

      let result;
      if (mode === 'edit' && company?.id) {
        result = await updateCompany.mutate({ id: company.id, data: formData });
        toast.success('Company updated successfully');
      } else {
        result = await createCompany.mutate(formData);
        toast.success('Company created successfully');
      }

      onSuccess?.(result);
      
      if (mode === 'create') {
        form.reset();
        setLogoUrl('');
      }
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error(mode === 'edit' ? 'Failed to update company' : 'Failed to create company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = (files: any[]) => {
    if (files.length > 0) {
      const uploadedFile = files[0];
      setLogoUrl(uploadedFile.url);
      form.setValue('logo', uploadedFile.url);
      toast.success('Logo uploaded successfully');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {mode === 'edit' ? 'Edit Company' : 'Create New Company'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="company@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+234-xxx-xxx-xxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* CEO and Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ceo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEO</FormLabel>
                    <FormControl>
                      <Input placeholder="CEO name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Company address"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Company description"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Logo</label>
              <FileUpload
                uploadType="logo"
                accept="image/*"
                maxSize={5}
                onUploadComplete={handleLogoUpload}
                className="border-dashed"
              />
              {logoUrl && (
                <div className="mt-2">
                  <img 
                    src={logoUrl} 
                    alt="Company logo preview" 
                    className="h-16 w-16 object-contain border rounded"
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting || createCompany.loading || updateCompany.loading}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {mode === 'edit' ? 'Update Company' : 'Create Company'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
