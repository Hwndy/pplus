import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Facebook, Twitter, Instagram, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';

interface Company {
  id: number;
  company_name: string;
}

interface Metrics {
  page_likes?: number;
  average_likes?: number;
  average_comments?: number;
  posts?: number;
  followers?: number;
  following?: number;
}

interface SocialMediaMentionFormData {
  company_id: number;
  date: string;
  social_media_type: 'Facebook' | 'Instagram' | 'X';
  metrics: Metrics[];
  analyst_note?: string;
  supervisor_note?: string;
  created_by?: number; // added for backend consistency
}

interface SocialMediaMention {
  id: number;
  company_id: number;
  date: string;
  social_media_type: 'Facebook' | 'Instagram' | 'X';
  metrics: Metrics[];
  analyst_note?: string;
  supervisor_note?: string;
  created_by?: number;
  approved_by?: number;
  status?: 'Pending' | 'Approved' | 'Rejected';
  createdAt?: string;
  updatedAt?: string;
  company_data?: { company_name: string };
  creator_data?: { username: string };
  approver_data?: { username: string };
}

interface SocialMediaMentionFormProps {
  mode: 'create' | 'edit';
  initialData?: SocialMediaMention;
  onSuccess?: () => void;
}

export function SocialMediaMentionForm({ mode, initialData, onSuccess }: SocialMediaMentionFormProps) {
  const [formData, setFormData] = useState<SocialMediaMentionFormData>({
    company_id: 0,
    date: new Date().toISOString().split('T')[0],
    social_media_type: 'Facebook',
    metrics: [{ page_likes: 0, average_likes: 0, average_comments: 0 }],
    analyst_note: '',
    supervisor_note: '',
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch user role
  useEffect(() => {
    // Assuming user role is stored in localStorage; adjust to your auth system
    const role = localStorage.getItem('userRole');
    setUserRole(role); // e.g., 'analyst' or 'supervisor'
  }, []);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const response = await fetch('https://pplus-g19c.onrender.com/api/v1/companies', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (result.success) {
          const companyList = result.data.data.map((company: any) => ({
            id: company.id,
            company_name: company.company_name,
          }));
          setCompanies(companyList);
        } else {
          toast.error(result.message || 'Failed to fetch companies');
        }
      } catch (error) {
        toast.error('Error fetching companies');
        console.error(error);
      }
    };
    fetchCompanies();
  }, []);

  // Set initial data for edit mode
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        company_id: initialData.company_id,
        date: new Date(initialData.date).toISOString().split('T')[0],
        social_media_type: initialData.social_media_type,
        metrics: initialData.metrics.map(m => ({ ...m })),
        analyst_note: initialData.analyst_note || '',
        supervisor_note: userRole === 'supervisor' ? initialData.supervisor_note || '' : '',
      });
    }
  }, [initialData, mode, userRole]);

  const filteredCompanies = React.useMemo(() => {
    if (!companySearchTerm) return companies;
    return companies.filter(company =>
      company.company_name.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
  }, [companySearchTerm, companies]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('metrics[')) {
      const match = name.match(/metrics\[(\d+)\]\[(.*?)\]/);
      if (match) {
        const index = parseInt(match[1], 10);
        const field = match[2];
        setFormData(prev => {
          const newMetrics = [...prev.metrics];
          newMetrics[index] = { ...newMetrics[index], [field]: value === '' ? undefined : Number(value) };
          return { ...prev, metrics: newMetrics };
        });
      }
    } else if (name === 'company_id') {
      setFormData(prev => ({ ...prev, [name]: Number(value) || 0 }));
    } else if (name === 'supervisor_note' && userRole !== 'supervisor') {
      // Prevent analysts from modifying supervisor_note
      toast.error('Only Supervisors can set supervisor notes.');
      return;
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCompanySelect = (companyId: number) => {
    setFormData(prev => ({ ...prev, company_id: companyId }));
    setShowCompanyDropdown(false);
    setCompanySearchTerm('');
  };

  const handleSocialMediaTypeChange = (value: 'Facebook' | 'Instagram' | 'X') => {
    setFormData(prev => ({
      ...prev,
      social_media_type: value,
      metrics: value === 'Facebook'
        ? [{ page_likes: 0, average_likes: 0, average_comments: 0 }]
        : [{ posts: 0, followers: 0, following: 0 }],
    }));
  };

  const addMetricEntry = () => {
    const newMetric = formData.social_media_type === 'Facebook'
      ? { page_likes: 0, average_likes: 0, average_comments: 0 }
      : { posts: 0, followers: 0, following: 0 };
    setFormData(prev => ({ ...prev, metrics: [...prev.metrics, newMetric] }));
  };

  const removeMetricEntry = (index: number) => {
    if (formData.metrics.length > 1) {
      setFormData(prev => ({
        ...prev,
        metrics: prev.metrics.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_id || formData.metrics.length === 0) {
      toast.error('Please select a company and add at least one metric entry');
      return;
    }

    // Validate supervisor_note for analysts
    if (userRole !== 'supervisor' && formData.supervisor_note && formData.supervisor_note.trim() !== '') {
      toast.error('Only Supervisors can set supervisor notes.');
      return;
    }

    setLoading(true);

    const url = mode === 'create'
      ? 'https://pplus-g19c.onrender.com/api/v1/social-media-mentions/create'
      : `https://pplus-g19c.onrender.com/api/v1/social-media-mentions/update/${initialData?.id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    try {
      const token = localStorage.getItem('token') || '';
      const storedUserId = Number(localStorage.getItem('userId') || 0);

      // Ensure supervisor_note is not sent for analysts
      const payload = {
        ...formData,
        ...(storedUserId ? { created_by: storedUserId } : {}),
        supervisor_note: userRole === 'supervisor' ? formData.supervisor_note : undefined,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.status === 403) {
        toast.error(result?.message || 'Access denied: insufficient permissions');
      } else if (result.success) {
        toast.success(`Social Media Mention ${mode === 'create' ? 'created' : 'updated'} successfully`);
        if (mode === 'create') {
          setFormData({
            company_id: 0,
            date: new Date().toISOString().split('T')[0],
            social_media_type: 'Facebook',
            metrics: [{ page_likes: 0, average_likes: 0, average_comments: 0 }],
            analyst_note: '',
            supervisor_note: '',
          });
          setCompanySearchTerm('');
        }
        onSuccess?.();
      } else {
        // Handle array of error objects
        if (Array.isArray(result.message)) {
          const errorMessages = result.message.map((err: { field: string; message: string }) => {
            // Map backend error to custom message for supervisor_note
            if (err.field === 'supervisor_note' && userRole !== 'supervisor') {
              return 'Only Supervisors can set supervisor notes.';
            }
            return `${err.field}: ${err.message}`;
          }).join('; ');
          toast.error(`Failed to ${mode} social media mention: ${errorMessages}`);
        } else {
          toast.error(result.message || `Failed to ${mode} social media mention`);
        }
      }
    } catch (error) {
      toast.error(`Error ${mode === 'create' ? 'creating' : 'updating'} social media mention`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Facebook': return <Facebook className="h-6 w-6 text-blue-600" />;
      case 'Instagram': return <Instagram className="h-6 w-6 text-pink-600" />;
      case 'X': return <Twitter className="h-6 w-6 text-blue-400" />;
      default: return null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.company-search-container')) {
        setShowCompanyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getPlatformIcon(formData.social_media_type)}
            {mode === 'create' ? 'Create' : 'Edit'} Social Media Mention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="company-search-container">
              <Label htmlFor="company">Company</Label>
              <div className="relative">
                <Input
                  id="company"
                  placeholder="Search for a company"
                  value={companies.find(c => c.id === formData.company_id)?.company_name || companySearchTerm}
                  onChange={(e) => {
                    setCompanySearchTerm(e.target.value);
                    setShowCompanyDropdown(true);
                    if (!formData.company_id) {
                      setFormData(prev => ({ ...prev, company_id: 0 }));
                    }
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                />
                {showCompanyDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredCompanies.length > 0 ? (
                      filteredCompanies.map((company) => (
                        <div
                          key={company.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleCompanySelect(company.id)}
                        >
                          {company.company_name}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500">No companies found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="social_media_type">Social Media Type</Label>
            <Select value={formData.social_media_type} onValueChange={handleSocialMediaTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Facebook">
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </div>
                </SelectItem>
                <SelectItem value="Instagram">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </div>
                </SelectItem>
                <SelectItem value="X">
                  <div className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    X (Twitter)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label>Metrics</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMetricEntry}
                className="h-8"
              >
                Add Entry
              </Button>
            </div>
            {formData.metrics.map((metric, index) => (
              <Card key={index} className="mb-4">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Metric Entry {index + 1}</CardTitle>
                    {formData.metrics.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMetricEntry(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {formData.social_media_type === 'Facebook' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`metrics[${index}][page_likes]`}>Page Likes</Label>
                        <Input
                          id={`metrics[${index}][page_likes]`}
                          type="number"
                          name={`metrics[${index}][page_likes]`}
                          value={metric.page_likes || ''}
                          onChange={handleInputChange}
                          required
                          min={0}
                          step={1}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`metrics[${index}][average_likes]`}>Average Likes</Label>
                        <Input
                          id={`metrics[${index}][average_likes]`}
                          type="number"
                          name={`metrics[${index}][average_likes]`}
                          value={metric.average_likes || ''}
                          onChange={handleInputChange}
                          required
                          min={0}
                          step={1}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`metrics[${index}][average_comments]`}>Average Comments</Label>
                        <Input
                          id={`metrics[${index}][average_comments]`}
                          type="number"
                          name={`metrics[${index}][average_comments]`}
                          value={metric.average_comments || ''}
                          onChange={handleInputChange}
                          required
                          min={0}
                          step={1}
                        />
                      </div>
                    </div>
                  )}
                  {(formData.social_media_type === 'Instagram' || formData.social_media_type === 'X') && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`metrics[${index}][posts]`}>Posts</Label>
                        <Input
                          id={`metrics[${index}][posts]`}
                          type="number"
                          name={`metrics[${index}][posts]`}
                          value={metric.posts || ''}
                          onChange={handleInputChange}
                          required
                          min={0}
                          step={1}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`metrics[${index}][followers]`}>Followers</Label>
                        <Input
                          id={`metrics[${index}][followers]`}
                          type="number"
                          name={`metrics[${index}][followers]`}
                          value={metric.followers || ''}
                          onChange={handleInputChange}
                          required
                          min={0}
                          step={1}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`metrics[${index}][following]`}>Following</Label>
                        <Input
                          id={`metrics[${index}][following]`}
                          type="number"
                          name={`metrics[${index}][following]`}
                          value={metric.following || ''}
                          onChange={handleInputChange}
                          required
                          min={0}
                          step={1}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="analyst_note">Analyst Note</Label>
              <Textarea
                id="analyst_note"
                name="analyst_note"
                value={formData.analyst_note}
                onChange={handleInputChange}
                placeholder="Add analyst notes..."
                className="min-h-[80px]"
              />
            </div>
            {userRole === 'supervisor' && (
              <div>
                <Label htmlFor="supervisor_note">Supervisor Note</Label>
                <Textarea
                  id="supervisor_note"
                  name="supervisor_note"
                  value={formData.supervisor_note}
                  onChange={handleInputChange}
                  placeholder="Add supervisor notes..."
                  className="min-h-[80px]"
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-950 hover:bg-indigo-900 text-white"
            disabled={loading}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create Mention' : 'Update Mention'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}