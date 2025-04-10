
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Editorial {
  id: number;
  date: string;
  company: string;
  industry: string;
  brand: string;
  subSector: string;
  publication: string;
  placement: string;
  title: string;
  page: number;
  link: string;
  reporter: string;
  country: string;
  language: string;
  spokesperson: string;
  activity: string;
  mediaType: string;
  onlineChannel?: string;
  sentiment: string;
  mediaSentimentIndex: number;
  advertSpend?: number;
  circulation?: number;
  audienceReach?: number;
  pageSize?: string;
}

const mediaTypes = ['Print', 'Online', 'Broadcast'];
const sentiments = ['Positive', 'Neutral', 'Negative'];

const CreateEditorialPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!location.state?.editorialData;
  
  const initialFormData: Editorial = location.state?.editorialData || {
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    company: '',
    industry: '',
    brand: '',
    subSector: '',
    publication: '',
    placement: '',
    title: '',
    page: 0,
    link: '',
    reporter: '',
    country: 'Nigeria',
    language: 'English',
    spokesperson: '',
    activity: '',
    mediaType: 'Print',
    sentiment: 'Positive',
    mediaSentimentIndex: 1,
    advertSpend: 0,
    circulation: 0,
    audienceReach: 0,
    pageSize: '',
  };
  
  const [formData, setFormData] = useState<Editorial>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle changes to form inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { name: string; value: string }) => {
    const { name, value } = e instanceof Event ? (e.target as HTMLInputElement) : e;
    
    // Handle numeric field conversions 
    if (['page', 'mediaSentimentIndex', 'advertSpend', 'circulation', 'audienceReach'].includes(name)) {
      const numValue = value === '' ? 0 : Number(value);
      setFormData({
        ...formData,
        [name]: numValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    const requiredFields = ['date', 'company', 'brand', 'publication', 'title'];
    requiredFields.forEach(field => {
      if (!formData[field as keyof Editorial]) {
        newErrors[field] = 'This field is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, we would save to a database
    // For this demo, we'll just navigate back with the new data
    
    navigate('/dashboard/editorial', { 
      state: { 
        savedEditorials: [formData],
        isEditMode 
      } 
    });
    
    toast({
      title: isEditMode ? "Editorial Updated" : "Editorial Created",
      description: isEditMode 
        ? "The editorial has been updated successfully." 
        : "The editorial has been created successfully."
    });
  };
  
  // Cancel and go back
  const handleCancel = () => {
    navigate('/dashboard/editorial');
  };

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Editorial' : 'Create Editorial'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  error={errors.date}
                />
                {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
              </div>
              
              {/* Media Type */}
              <div className="space-y-2">
                <Label htmlFor="mediaType">Media Type</Label>
                <Select
                  name="mediaType"
                  value={formData.mediaType}
                  onValueChange={(value) => handleSelectChange('mediaType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Media Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mediaTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company">Company <span className="text-red-500">*</span></Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  error={errors.company}
                />
                {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
              </div>
              
              {/* Brand */}
              <div className="space-y-2">
                <Label htmlFor="brand">Brand <span className="text-red-500">*</span></Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  error={errors.brand}
                />
                {errors.brand && <p className="text-red-500 text-sm">{errors.brand}</p>}
              </div>
              
              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                />
              </div>
              
              {/* Sub-Sector */}
              <div className="space-y-2">
                <Label htmlFor="subSector">Sub-Sector</Label>
                <Input
                  id="subSector"
                  name="subSector"
                  value={formData.subSector}
                  onChange={handleChange}
                />
              </div>
              
              {/* Publication */}
              <div className="space-y-2">
                <Label htmlFor="publication">Publication <span className="text-red-500">*</span></Label>
                <Input
                  id="publication"
                  name="publication"
                  value={formData.publication}
                  onChange={handleChange}
                  error={errors.publication}
                />
                {errors.publication && <p className="text-red-500 text-sm">{errors.publication}</p>}
              </div>
              
              {/* Placement */}
              <div className="space-y-2">
                <Label htmlFor="placement">Placement</Label>
                <Input
                  id="placement"
                  name="placement"
                  value={formData.placement}
                  onChange={handleChange}
                />
              </div>
              
              {/* Title */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={errors.title}
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
              </div>
              
              {/* Page Number */}
              <div className="space-y-2">
                <Label htmlFor="page">Page Number</Label>
                <Input
                  id="page"
                  name="page"
                  type="number"
                  value={formData.page.toString()}
                  onChange={handleChange}
                />
              </div>
              
              {/* Link */}
              <div className="space-y-2">
                <Label htmlFor="link">Link</Label>
                <Input
                  id="link"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                />
              </div>
              
              {/* Reporter */}
              <div className="space-y-2">
                <Label htmlFor="reporter">Reporter</Label>
                <Input
                  id="reporter"
                  name="reporter"
                  value={formData.reporter}
                  onChange={handleChange}
                />
              </div>
              
              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
              
              {/* Spokesperson */}
              <div className="space-y-2">
                <Label htmlFor="spokesperson">Spokesperson</Label>
                <Input
                  id="spokesperson"
                  name="spokesperson"
                  value={formData.spokesperson}
                  onChange={handleChange}
                />
              </div>
              
              {/* Activity */}
              <div className="space-y-2">
                <Label htmlFor="activity">Activity</Label>
                <Input
                  id="activity"
                  name="activity"
                  value={formData.activity}
                  onChange={handleChange}
                />
              </div>
              
              {/* Sentiment */}
              <div className="space-y-2">
                <Label htmlFor="sentiment">Sentiment</Label>
                <Select
                  name="sentiment"
                  value={formData.sentiment}
                  onValueChange={(value) => handleSelectChange('sentiment', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    {sentiments.map((sentiment) => (
                      <SelectItem key={sentiment} value={sentiment}>
                        {sentiment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Media Sentiment Index */}
              <div className="space-y-2">
                <Label htmlFor="mediaSentimentIndex">Media Sentiment Index</Label>
                <Input
                  id="mediaSentimentIndex"
                  name="mediaSentimentIndex"
                  type="number"
                  value={formData.mediaSentimentIndex.toString()}
                  onChange={handleChange}
                />
              </div>
              
              {/* Additional fields based on media type */}
              {formData.mediaType === 'Print' && (
                <>
                  {/* Advert Spend */}
                  <div className="space-y-2">
                    <Label htmlFor="advertSpend">Advert Spend</Label>
                    <Input
                      id="advertSpend"
                      name="advertSpend"
                      type="number"
                      value={formData.advertSpend?.toString() || '0'}
                      onChange={handleChange}
                    />
                  </div>
                  
                  {/* Circulation */}
                  <div className="space-y-2">
                    <Label htmlFor="circulation">Circulation</Label>
                    <Input
                      id="circulation"
                      name="circulation"
                      type="number"
                      value={formData.circulation?.toString() || '0'}
                      onChange={handleChange}
                    />
                  </div>
                  
                  {/* Page Size */}
                  <div className="space-y-2">
                    <Label htmlFor="pageSize">Page Size</Label>
                    <Input
                      id="pageSize"
                      name="pageSize"
                      value={formData.pageSize || ''}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
              
              {/* Online Channel */}
              {formData.mediaType === 'Online' && (
                <div className="space-y-2">
                  <Label htmlFor="onlineChannel">Online Channel</Label>
                  <Input
                    id="onlineChannel"
                    name="onlineChannel"
                    value={formData.onlineChannel || ''}
                    onChange={handleChange}
                  />
                </div>
              )}
              
              {/* Audience Reach */}
              {(formData.mediaType === 'Online' || formData.mediaType === 'Broadcast') && (
                <div className="space-y-2">
                  <Label htmlFor="audienceReach">Audience Reach</Label>
                  <Input
                    id="audienceReach"
                    name="audienceReach"
                    type="number"
                    value={formData.audienceReach?.toString() || '0'}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-indigo-950"
              >
                {isEditMode ? 'Update Editorial' : 'Create Editorial'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreateEditorialPage;
