import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Define interfaces
interface Company {
  id: number;
  company_name: string;
  industry: string;
  sub_industry: string;
}

interface SwotCategory {
  description: string;
  bullets: string[];
}

interface SwotAnalysis {
  id: number;
  company_id?: number;
  company?: Company;
  date?: string;
  title?: string;
  status: 'draft' | 'published' | 'archived';
  strengths: SwotCategory;
  weaknesses: SwotCategory;
  opportunities: SwotCategory;
  threats: SwotCategory;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: SwotAnalysis[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message: string;
}

interface BackendError {
  field: string;
  message: string;
}

interface TableRow {
  id: number;
  companyName: string;
  title: string;
  formattedDate: string;
  status: string;
}

// Axios interceptor for Bearer token
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

const SwotAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSessionValidated } = useAuth();
  const [swotAnalyses, setSwotAnalyses] = useState<SwotAnalysis[]>([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSwot, setSelectedSwot] = useState<SwotAnalysis | null>(null);
  const [formData, setFormData] = useState<Partial<SwotAnalysis>>({
    status: 'draft',
    strengths: { description: '', bullets: [] },
    weaknesses: { description: '', bullets: [] },
    opportunities: { description: '', bullets: [] },
    threats: { description: '', bullets: [] },
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [companies, setCompanies] = useState<Company[]>([]);
  const analysesPerPage = 10;

  const BASE_URL = 'https://pplus-y9m6.onrender.com/api';

  // Helper functions for form updates
  const updateCategory = (
    category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats',
    field: 'description' | 'bullets',
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] as SwotCategory),
        [field]: value,
      },
    }));
  };

  const addBullet = (category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats') => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] as SwotCategory),
        bullets: [...(prev[category] as SwotCategory).bullets, ''],
      },
    }));
  };

  const updateBullet = (
    category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats',
    bidx: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] as SwotCategory),
        bullets: (prev[category] as SwotCategory).bullets.map((bullet, i) => (i === bidx ? value : bullet)),
      },
    }));
  };

  const removeBullet = (
    category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats',
    bidx: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] as SwotCategory),
        bullets: (prev[category] as SwotCategory).bullets.filter((_, i) => i !== bidx),
      },
    }));
  };

  // Render category form section
  const renderCategorySection = (
    category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats',
    title: string
  ) => (
    <div className="space-y-4">
      <Label>{title}</Label>
      <Textarea
        value={(formData[category] as SwotCategory)?.description || ''}
        onChange={(e) => updateCategory(category, 'description', e.target.value)}
        placeholder={`Enter description for ${title.toLowerCase()}...`}
      />
      <div>
        <Label>Bullets</Label>
        {(formData[category] as SwotCategory)?.bullets.map((bullet, bidx) => (
          <div key={bidx} className="flex items-center space-x-2 mb-2">
            <Input
              value={bullet}
              onChange={(e) => updateBullet(category, bidx, e.target.value)}
              placeholder={`Bullet point ${bidx + 1}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeBullet(category, bidx)}
              disabled={((formData[category] as SwotCategory)?.bullets.length || 0) <= 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addBullet(category)}>
          Add Bullet
        </Button>
      </div>
    </div>
  );

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/companies/`);
        setCompanies(response.data.data?.data || []);
      } catch (error: any) {
        console.error('Error fetching companies:', error);
        toast({
          title: 'Error',
          description: 'Failed to load companies.',
          variant: 'destructive',
        });
      }
    };
    fetchCompanies();
  }, [toast]);

  // Fetch SWOT analyses
  useEffect(() => {
    if (!isSessionValidated) {
      navigate('/login');
      return;
    }

    const fetchSwotAnalyses = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ApiResponse>(`${BASE_URL}/swot-analysis/`, {
          params: { page: currentPage, limit: analysesPerPage },
        });

        const analysesData = response.data?.data?.data || [];
        const pagination = response.data?.data?.pagination || { total: 0, totalPages: 1 };

        const normalizedAnalyses = analysesData
          .filter((item) => !item.is_deleted)
          .map((analysis: SwotAnalysis) => ({
            ...analysis,
            company: analysis.company || { company_name: 'Unknown' },
            status: analysis.status || 'draft',
          }));

        const mappedData = normalizedAnalyses.map((item) => ({
          id: item.id,
          companyName: item.company.company_name,
          title: item.title || 'No title',
          formattedDate: item.date ? new Date(item.date).toLocaleDateString('en-US') : 'Invalid Date',
          status: item.status,
        }));

        setSwotAnalyses(normalizedAnalyses);
        setTableData(mappedData);
        setTotalPages(pagination.totalPages || 1);
        setTotalCount(pagination.total || 0);
      } catch (error: any) {
        console.error('Error fetching SWOT analyses:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load SWOT analyses.',
          variant: 'destructive',
        });
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSwotAnalyses();
  }, [currentPage, isSessionValidated, navigate, toast]);

  // Handle create new
  const handleCreateNew = () => {
    setFormData({
      date: '',
      title: '',
      status: 'draft',
      strengths: { description: '', bullets: [] },
      weaknesses: { description: '', bullets: [] },
      opportunities: { description: '', bullets: [] },
      threats: { description: '', bullets: [] },
    });
    setFormErrors({});
    setCreateModalOpen(true);
  };

  // Handle view
  const handleView = (id: number) => {
    const analysis = swotAnalyses.find((a) => a.id === id);
    if (analysis) {
      setSelectedSwot(analysis);
      setViewModalOpen(true);
    } else {
      toast({ title: 'Error', description: 'Analysis not found', variant: 'destructive' });
    }
  };

  // Handle edit
  const handleEdit = (id: number) => {
    const analysis = swotAnalyses.find((a) => a.id === id);
    if (analysis) {
      setSelectedSwot(analysis);
      setFormData({
        id: analysis.id,
        company_id: analysis.company_id,
        date: analysis.date || '',
        title: analysis.title || '',
        status: analysis.status || 'draft',
        strengths: analysis.strengths || { description: '', bullets: [] },
        weaknesses: analysis.weaknesses || { description: '', bullets: [] },
        opportunities: analysis.opportunities || { description: '', bullets: [] },
        threats: analysis.threats || { description: '', bullets: [] },
      });
      setFormErrors({});
      setEditModalOpen(true);
    } else {
      toast({ title: 'Error', description: 'Analysis not found', variant: 'destructive' });
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this SWOT analysis?')) {
      try {
        await axios.put(`${BASE_URL}/swot-analysis/delete/${id}`, { is_deleted: true });
        setSwotAnalyses((prev) => prev.filter((a) => a.id !== id));
        setTableData((prev) => prev.filter((a) => a.id !== id));
        toast({ title: 'Success', description: 'SWOT analysis deleted successfully' });
      } catch (error: any) {
        console.error('Error deleting SWOT analysis:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to delete SWOT analysis',
          variant: 'destructive',
        });
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.company_id) errors.company_id = 'Company is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.title) errors.title = 'Title is required';
    if (!formData.status) errors.status = 'Status is required';
    return errors;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent, isEdit: boolean) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({ title: 'Error', description: 'Please fix the form errors', variant: 'destructive' });
      return;
    }

    try {
      const payload = {
        company_id: formData.company_id,
        date: formData.date,
        title: formData.title,
        status: formData.status,
        strengths: formData.strengths,
        weaknesses: formData.weaknesses,
        opportunities: formData.opportunities,
        threats: formData.threats,
      };

      if (isEdit && selectedSwot) {
        await axios.put(`${BASE_URL}/swot-analysis/update/${selectedSwot.id}`, payload);
        toast({ title: 'Success', description: 'SWOT analysis updated successfully' });
      } else {
        await axios.post(`${BASE_URL}/swot-analysis/create`, payload);
        toast({ title: 'Success', description: 'SWOT analysis created successfully' });
      }
      setCreateModalOpen(false);
      setEditModalOpen(false);
      setFormErrors({});
      setCurrentPage(1);
    } catch (error: any) {
      console.error('Error submitting SWOT analysis:', error);
      const backendErrors = Array.isArray(error.response?.data?.message) ? error.response.data.message : [];
      if (backendErrors.length > 0) {
        const newErrors: Record<string, string> = {};
        backendErrors.forEach((err: BackendError) => {
          newErrors[err.field] = err.message;
        });
        setFormErrors(newErrors);
      }
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit SWOT analysis',
        variant: 'destructive',
      });
    }
  };

  // Table columns
  const columns: ColumnDef<TableRow>[] = useMemo(
    () => [
      {
        accessorKey: 'companyName',
        header: 'Company',
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => <div className="max-w-xs truncate" title={row.original.title}>{row.original.title}</div>,
      },
      {
        accessorKey: 'formattedDate',
        header: 'Date',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          let statusColor = '';
          switch (status) {
            case 'published':
              statusColor = 'bg-green-100 text-green-800';
              break;
            case 'archived':
              statusColor = 'bg-red-100 text-red-800';
              break;
            case 'draft':
            default:
              statusColor = 'bg-yellow-100 text-yellow-800';
          }
          return <Badge className={statusColor}>{status}</Badge>;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => handleView(row.original.id)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original.id)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original.id)} className="text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading SWOT analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SWOT Analyses</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create SWOT Analysis</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                <div>
                  <Label>Company <span className="text-red-500">*</span></Label>
                  <Select value={formData.company_id?.toString() || ''} onValueChange={(value) => setFormData({ ...formData, company_id: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
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
                <div>
                  <Label>Date <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                  {formErrors.date && <p className="text-red-500 text-sm">{formErrors.date}</p>}
                </div>
                <div>
                  <Label>Title <span className="text-red-500">*</span></Label>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  {formErrors.title && <p className="text-red-500 text-sm">{formErrors.title}</p>}
                </div>
                <div>
                  <Label>Status <span className="text-red-500">*</span></Label>
                  <Select value={formData.status || 'draft'} onValueChange={(value) => setFormData({ ...formData, status: value as 'draft' | 'published' | 'archived' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.status && <p className="text-red-500 text-sm">{formErrors.status}</p>}
                </div>
                {renderCategorySection('strengths', 'Strengths')}
                {renderCategorySection('weaknesses', 'Weaknesses')}
                {renderCategorySection('opportunities', 'Opportunities')}
                {renderCategorySection('threats', 'Threats')}
                <Button type="submit">Create</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SWOT Analyses List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={tableData} searchPlaceholder="Search SWOT analyses..." />

          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * analysesPerPage + 1, totalCount)} to {Math.min(currentPage * analysesPerPage, totalCount)} of {totalCount} entries
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View SWOT Analysis</DialogTitle>
          </DialogHeader>
          {selectedSwot && (
            <div className="space-y-6">
              <div>
                <Label>Company</Label>
                <p>{selectedSwot.company?.company_name || 'Unknown'}</p>
              </div>
              <div>
                <Label>Date</Label>
                <p>{selectedSwot.date ? new Date(selectedSwot.date).toLocaleDateString() : 'Invalid Date'}</p>
              </div>
              <div>
                <Label>Title</Label>
                <p>{selectedSwot.title}</p>
              </div>
              <div>
                <Label>Status</Label>
                <p>{selectedSwot.status}</p>
              </div>
              {['strengths', 'weaknesses', 'opportunities', 'threats'].map((cat) => (
                <div key={cat}>
                  <Label>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Label>
                  <div className="ml-4 space-y-2">
                    <p><strong>Description:</strong> {(selectedSwot[cat as keyof SwotAnalysis] as SwotCategory)?.description || 'N/A'}</p>
                    <p><strong>Bullets:</strong></p>
                    <ul className="list-disc pl-5">
                      {(selectedSwot[cat as keyof SwotAnalysis] as SwotCategory)?.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit SWOT Analysis</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
            <div>
              <Label>Company <span className="text-red-500">*</span></Label>
              <Select value={formData.company_id?.toString() || ''} onValueChange={(value) => setFormData({ ...formData, company_id: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
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
            <div>
              <Label>Date <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              {formErrors.date && <p className="text-red-500 text-sm">{formErrors.date}</p>}
            </div>
            <div>
              <Label>Title <span className="text-red-500">*</span></Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {formErrors.title && <p className="text-red-500 text-sm">{formErrors.title}</p>}
            </div>
            <div>
              <Label>Status <span className="text-red-500">*</span></Label>
              <Select value={formData.status || 'draft'} onValueChange={(value) => setFormData({ ...formData, status: value as 'draft' | 'published' | 'archived' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.status && <p className="text-red-500 text-sm">{formErrors.status}</p>}
            </div>
            {renderCategorySection('strengths', 'Strengths')}
            {renderCategorySection('weaknesses', 'Weaknesses')}
            {renderCategorySection('opportunities', 'Opportunities')}
            {renderCategorySection('threats', 'Threats')}
            <Button type="submit">Update</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SwotAnalysisPage;