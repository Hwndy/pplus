import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface PublicationFormData {
  name: string;
  publication_type?: string;
  website?: string;
  description?: string;
}

interface CreatePublicationFormProps {
  onSave: (publication: PublicationFormData) => void;
  onCancel: () => void;
  initialData?: PublicationFormData | null;
}

export const CreatePublicationForm: React.FC<CreatePublicationFormProps> = ({
  onSave,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState<PublicationFormData>({
    name: '',
    publication_type: 'print',
    website: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        publication_type: initialData.publication_type || 'print',
        website: initialData.website || '',
        description: initialData.description || ''
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Publication name is required';
    if (!formData.publication_type) newErrors.publication_type = 'Publication type is required';
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Please enter a valid URL (starting with http:// or https://)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      if (!initialData) {
        setFormData({ name: '', publication_type: 'print', website: '', description: '' });
      }
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof PublicationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Publication Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter publication name"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <Label htmlFor="publication_type">Publication Type *</Label>
        <Select
          value={formData.publication_type}
          onValueChange={(value) => handleInputChange('publication_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select publication type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="print">Print</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="broadcast">Broadcast</SelectItem>
            <SelectItem value="magazine">Magazine</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
            <SelectItem value="newsletter">Newsletter</SelectItem>
          </SelectContent>
        </Select>
        {errors.publication_type && <p className="text-red-500 text-sm mt-1">{errors.publication_type}</p>}
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
          placeholder="https://example.com"
          className={errors.website ? 'border-red-500' : ''}
        />
        {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Brief description of the publication"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-indigo-950" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            initialData ? 'Update Publication' : 'Create Publication'
          )}
        </Button>
      </div>
    </form>
  );
};