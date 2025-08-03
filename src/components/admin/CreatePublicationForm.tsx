
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface PublicationFormData {
  name: string;
  type?: string;
  website?: string;
  description?: string;
}

interface CreatePublicationFormProps {
  onSave: (publication: PublicationFormData) => void;
  onCancel: () => void;
}

export const CreatePublicationForm: React.FC<CreatePublicationFormProps> = ({
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<PublicationFormData>({
    name: '',
    type: 'print',
    website: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Publication name is required';
    }

    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Please enter a valid URL (starting with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      // Reset form on success
      setFormData({
        name: '',
        type: 'print',
        website: '',
        description: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof PublicationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Publication Name */}
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

      {/* Publication Type */}
      <div>
        <Label htmlFor="type">Publication Type</Label>
        <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
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
      </div>

      {/* Website */}
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

      {/* Description */}
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

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
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
            'Create Publication'
          )}
        </Button>
      </div>
    </form>
  );
};
