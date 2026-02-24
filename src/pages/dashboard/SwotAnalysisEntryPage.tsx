import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, FileText } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';

// Interfaces
interface Company {
  id: number;
  company_name: string;
  industry: string;
  sub_industry: string;
}

interface SwotAnalysis {
  id?: number;
  company_id?: number;
  company?: Company;
  title?: string;
  date?: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  analyst_note?: string | null;
  supervisor_note?: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// Axios interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const SwotAnalysisEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryParams = new URLSearchParams(location.search);
  const swotIdFromQuery = queryParams.get('id');

  const [formData, setFormData] = useState<SwotAnalysis>({
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
    status: '',
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [companiesLoading, setCompaniesLoading] = useState(true);

  const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setCompaniesLoading(true);
        const response = await axios.get<ApiResponse<{ data: Company[] }>>(`${BASE_URL}/companies/?limit=1000`);
        setCompanies(response.data.data?.data || []);
      } catch (error: any) {
        console.error('Error fetching companies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load companies',
          variant: 'destructive',
        });
      } finally {
        setCompaniesLoading(false);
      }
    };

    fetchCompanies();
  }, [toast]);

  // Fetch SWOT if editing
  useEffect(() => {
    if (swotIdFromQuery) {
      const fetchSwot = async () => {
        try {
          setLoading(true);
          const response = await axios.get<ApiResponse<SwotAnalysis>>(`${BASE_URL}/swot-analysis/${swotIdFromQuery}`);
          setFormData({
            ...response.data.data,
            strengths: response.data.data.strengths || [],
            weaknesses: response.data.data.weaknesses || [],
            opportunities: response.data.data.opportunities || [],
            threats: response.data.data.threats || [],
            status: response.data.data.status || '',
          });
        } catch (error: any) {
          console.error('Error fetching SWOT analysis:', error);
          toast({
            title: 'Error',
            description: 'Failed to load SWOT analysis',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      };

      fetchSwot();
    } else {
      setLoading(false);
    }
  }, [swotIdFromQuery, toast]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.company_id) errors.company_id = 'Company is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.title?.trim()) errors.title = 'Title is required';
    if (!formData.status) errors.status = 'Status is required';
    if (formData.strengths.length === 0 && formData.weaknesses.length === 0 && 
        formData.opportunities.length === 0 && formData.threats.length === 0) {
      errors.analysis = 'At least one SWOT category must have content';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        company_id: formData.company_id,
        title: formData.title?.trim(),
        date: formData.date,
        strengths: formData.strengths,
        weaknesses: formData.weaknesses,
        opportunities: formData.opportunities,
        threats: formData.threats,
        analyst_note: formData.analyst_note || null,
        supervisor_note: formData.supervisor_note || null,
        status: formData.status,
      };

      if (swotIdFromQuery && formData.id) {
        await axios.put(`${BASE_URL}/swot-analysis/${formData.id}`, payload);
        toast({
          title: 'Success',
          description: 'SWOT analysis updated successfully',
        });
      } else {
        await axios.post(`${BASE_URL}/swot-analysis/`, payload);
        toast({
          title: 'Success',
          description: 'SWOT analysis created successfully',
        });
      }

      navigate('/dashboard/swot-analysis');
    } catch (error: any) {
      console.error('Error submitting SWOT analysis:', error);
      const message = error.response?.data?.message || 'Failed to submit SWOT analysis';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });

      if (Array.isArray(error.response?.data?.message)) {
        const newErrors: Record<string, string> = {};
        error.response.data.message.forEach((err: { field: string; message: string }) => {
          newErrors[err.field] = err.message;
        });
        setFormErrors(newErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    setFormData(prev => ({ ...prev, status: 'DRAFT' }));
    await handleSubmit();
  };

  const handleFieldChange = (field: keyof SwotAnalysis, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (formErrors[field as string]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  const handleCategoryChange = (category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats', value: string[]) => {
    setFormData(prev => ({ ...prev, [category]: value }));
  };

  if (loading || companiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/swot-analysis">SWOT Analysis</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{swotIdFromQuery ? 'Edit' : 'Create'} Analysis</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/swot-analysis')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{swotIdFromQuery ? 'Edit' : 'Create'} SWOT Analysis</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveAsDraft} disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Save as Draft
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {swotIdFromQuery ? 'Update' : 'Save'} Analysis
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SWOT Analysis Details</CardTitle>
          <CardDescription>Fill in the details for the SWOT analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company_id">Company <span className="text-red-500">*</span></Label>
              <Select value={formData.company_id?.toString() || ''} onValueChange={(value) => handleFieldChange('company_id', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.company_id && <p className="text-red-500 text-sm">{formErrors.company_id}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
              <Input
                id="date"
                type="date"
                value={formData.date || ''}
                onChange={(e) => handleFieldChange('date', e.target.value)}
              />
              {formErrors.date && <p className="text-red-500 text-sm">{formErrors.date}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
            />
            {formErrors.title && <p className="text-red-500 text-sm">{formErrors.title}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
              <Select value={formData.status} onValueChange={(value) => handleFieldChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['DRAFT', 'PENDING', 'APPROVED'].map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.status && <p className="text-red-500 text-sm">{formErrors.status}</p>}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label>Strengths</Label>
              <Textarea
                value={formData.strengths.join('\n')}
                onChange={(e) => handleCategoryChange('strengths', e.target.value.split('\n').filter(s => s.trim()))}
                rows={4}
              />
            </div>
            <div>
              <Label>Weaknesses</Label>
              <Textarea
                value={formData.weaknesses.join('\n')}
                onChange={(e) => handleCategoryChange('weaknesses', e.target.value.split('\n').filter(s => s.trim()))}
                rows={4}
              />
            </div>
            <div>
              <Label>Opportunities</Label>
              <Textarea
                value={formData.opportunities.join('\n')}
                onChange={(e) => handleCategoryChange('opportunities', e.target.value.split('\n').filter(s => s.trim()))}
                rows={4}
              />
            </div>
            <div>
              <Label>Threats</Label>
              <Textarea
                value={formData.threats.join('\n')}
                onChange={(e) => handleCategoryChange('threats', e.target.value.split('\n').filter(s => s.trim()))}
                rows={4}
              />
              {formErrors.analysis && <p className="text-red-500 text-sm">{formErrors.analysis}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="analyst_note">Analyst Note</Label>
              <Textarea
                id="analyst_note"
                value={formData.analyst_note || ''}
                onChange={(e) => handleFieldChange('analyst_note', e.target.value || null)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supervisor_note">Supervisor Note</Label>
              <Textarea
                id="supervisor_note"
                value={formData.supervisor_note || ''}
                onChange={(e) => handleFieldChange('supervisor_note', e.target.value || null)}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SwotAnalysisEntryPage;