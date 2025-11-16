import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, Filter, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// === Types ===
interface MentionDetail {
  headline: string;
  content: string | null;
  reporter: string | null;
  source: string | null;
  sentiment: 'positive' | 'negative' | 'neutral';
  page: string | null;
  publication_date: string | null;
  urls: string[];
}

interface Company {
  id: number;
  company_name: string;
  industry: string;
  sub_industry: string;
}

interface Publication {
  id: number;
  name: string;
  type: string;
}

interface DailyMention {
  id: number;
  company_id?: number;
  company?: Company;
  publication?: string | Publication;
  date?: string;
  status: 'pending' | 'approved' | 'rejected';
  industry: MentionDetail[];
  competitors: MentionDetail[];
  subsidiaries: MentionDetail[];
  passive: MentionDetail[];
  advert: MentionDetail[];
  is_deleted: boolean;
}

interface TableRow {
  id: number;
  companyName: string;
  headline: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  publicationName: string;
  formattedDate: string;
  status: string;
}

// === Axios Interceptor ===
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const BASE_URL = 'https://pplus-e31a.onrender.com/api';
const ITEMS_PER_PAGE = 10;

const DailyMentionsTablePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, token } = useAuth();

  // State
  const [dailyMentions, setDailyMentions] = useState<DailyMention[]>([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMention, setSelectedMention] = useState<DailyMention | null>(null);

  const [formData, setFormData] = useState<Partial<DailyMention>>({
    industry: [],
    competitors: [],
    subsidiaries: [],
    passive: [],
    advert: [],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [companies, setCompanies] = useState<Company[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);

  // === URL Validation ===
  const isValidUrl = (url: string): boolean => {
    if (!url) return true;
    const pattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;
    return pattern.test(url);
  };

  // === Fetch Daily Mentions (ALL ROLES FIXED) ===
  const fetchDailyMentions = useCallback(async () => {
    if (!token || !user) {
      toast({ title: 'Error', description: 'Please login', variant: 'destructive' });
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        user.role.name === 'Supervisor'
          ? `${BASE_URL}/daily-mentions/supervisor-mentions`
          : user.role.name === 'Analyst'
          ? `${BASE_URL}/daily-mentions/my-mentions`
          : `${BASE_URL}/daily-mentions/`;

      const response = await axios.get(endpoint, {
        params: { page: currentPage, limit: ITEMS_PER_PAGE },
      });

      // Normalize response
      let mentions: DailyMention[] = [];
      let pagination = { total: 0, totalPages: 1 };

      if (response.data?.data?.data) {
        mentions = response.data.data.data;
        pagination = response.data.data.pagination;
      } else if (Array.isArray(response.data?.data)) {
        mentions = response.data.data;
        pagination = response.data.pagination || { total: mentions.length, totalPages: 1 };
      }

      const filtered = mentions.filter((m) => !m.is_deleted);

      const normalized = filtered.map((m) => ({
        ...m,
        company: m.company || { company_name: 'Unknown', industry: '', sub_industry: '' },
        publication: typeof m.publication === 'string' ? m.publication : m.publication?.name || 'Unknown',
        status: m.status || 'pending',
        industry: Array.isArray(m.industry) ? m.industry : [],
        competitors: Array.isArray(m.competitors) ? m.competitors : [],
        subsidiaries: Array.isArray(m.subsidiaries) ? m.subsidiaries : [],
        passive: Array.isArray(m.passive) ? m.passive : [],
        advert: Array.isArray(m.advert) ? m.advert : [],
      }));

      const tableRows: TableRow[] = normalized.map((item) => ({
        id: item.id,
        companyName: item.company.company_name,
        headline:
          item.industry[0]?.headline ||
          item.competitors[0]?.headline ||
          item.subsidiaries[0]?.headline ||
          item.passive[0]?.headline ||
          item.advert[0]?.headline ||
          'No headline',
        sentiment:
          (item.industry[0]?.sentiment ||
            item.competitors[0]?.sentiment ||
            item.subsidiaries[0]?.sentiment ||
            item.passive[0]?.sentiment ||
            item.advert[0]?.sentiment ||
            'neutral') as any,
        publicationName: typeof item.publication === 'string' ? item.publication : item.publication?.name || 'Unknown',
        formattedDate: item.date ? new Date(item.date).toLocaleDateString('en-GB') : 'N/A',
        status: item.status,
      }));

      setDailyMentions(normalized);
      setTableData(tableRows);
      setTotalPages(pagination.totalPages || 1);
      setTotalCount(pagination.total || 0);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load mentions',
        variant: 'destructive',
      });
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [currentPage, user, token, navigate, toast]);

  useEffect(() => {
    fetchDailyMentions();
  }, [fetchDailyMentions]);

  // === Fetch Dropdowns ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compRes, pubRes] = await Promise.all([
          axios.get(`${BASE_URL}/companies`),
          axios.get(`${BASE_URL}/publications`).catch(() => axios.get(`${BASE_URL}/publications`)),
        ]);
        setCompanies(compRes.data?.data?.data || []);
        setPublications(pubRes.data?.data?.data || []);
      } catch {
        toast({ title: 'Warning', description: 'Using fallback data', variant: 'default' });
      }
    };
    fetchData();
  }, [toast]);

  // === Form Helpers ===
  const updateMention = (cat: keyof DailyMention, idx: number, field: keyof MentionDetail, val: any) => {
    setFormData((prev) => ({
      ...prev,
      [cat]: (prev[cat] as MentionDetail[])?.map((m, i) => (i === idx ? { ...m, [field]: val } : m)),
    }));
  };

  const updateUrl = (cat: keyof DailyMention, midx: number, uidx: number, val: string) => {
    setFormData((prev) => ({
      ...prev,
      [cat]: (prev[cat] as MentionDetail[])?.map((m, i) =>
        i === midx ? { ...m, urls: m.urls.map((u, j) => (j === uidx ? val : u)) } : m
      ),
    }));
  };

  const addUrl = (cat: keyof DailyMention, midx: number) => {
    setFormData((prev) => ({
      ...prev,
      [cat]: (prev[cat] as MentionDetail[])?.map((m, i) =>
        i === midx ? { ...m, urls: [...m.urls, ''] } : m
      ),
    }));
  };

  const removeUrl = (cat: keyof DailyMention, midx: number, uidx: number) => {
    setFormData((prev) => ({
      ...prev,
      [cat]: (prev[cat] as MentionDetail[])?.map((m, i) =>
        i === midx ? { ...m, urls: m.urls.filter((_, j) => j !== uidx) } : m
      ),
    }));
  };

  const addMention = (cat: keyof DailyMention) => {
    const newMention: MentionDetail = {
      headline: '',
      content: null,
      reporter: null,
      source: null,
      sentiment: 'neutral',
      page: null,
      publication_date: null,
      urls: [''],
    };
    setFormData((prev) => ({ ...prev, [cat]: [...(prev[cat] as MentionDetail[]), newMention] }));
  };

  const removeMention = (cat: keyof DailyMention, idx: number) => {
    setFormData((prev) => ({
      ...prev,
      [cat]: (prev[cat] as MentionDetail[])?.filter((_, i) => i !== idx),
    }));
  };

  // === Render Helpers ===
  const renderMentionFields = (category: keyof DailyMention, idx: number) => (
    <div className="space-y-3">
      <div><Label>Headline</Label><Input value={(formData[category] as MentionDetail[])[idx]?.headline || ''} onChange={(e) => updateMention(category, idx, 'headline', e.target.value)} /></div>
      <div><Label>Content</Label><Textarea value={(formData[category] as MentionDetail[])[idx]?.content || ''} onChange={(e) => updateMention(category, idx, 'content', e.target.value || null)} /></div>
      <div><Label>Reporter</Label><Input value={(formData[category] as MentionDetail[])[idx]?.reporter || ''} onChange={(e) => updateMention(category, idx, 'reporter', e.target.value || null)} /></div>
      <div><Label>Source</Label><Input value={(formData[category] as MentionDetail[])[idx]?.source || ''} onChange={(e) => updateMention(category, idx, 'source', e.target.value || null)} /></div>
      <div><Label>Sentiment</Label>
        <Select value={(formData[category] as MentionDetail[])[idx]?.sentiment || 'neutral'} onValueChange={(v) => updateMention(category, idx, 'sentiment', v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><Label>Page</Label><Input value={(formData[category] as MentionDetail[])[idx]?.page || ''} onChange={(e) => updateMention(category, idx, 'page', e.target.value || null)} /></div>
      <div><Label>Publication Date</Label><Input type="date" value={(formData[category] as MentionDetail[])[idx]?.publication_date?.slice(0,10) || ''} onChange={(e) => updateMention(category, idx, 'publication_date', e.target.value || null)} /></div>
      <div><Label>URLs</Label>
        {(formData[category] as MentionDetail[])[idx]?.urls.map((url, uidx) => (
          <div key={uidx} className="flex gap-2 mb-2">
            <Input value={url} onChange={(e) => updateUrl(category, idx, uidx, e.target.value)} placeholder="https://..." />
            <Button variant="ghost" size="icon" onClick={() => removeUrl(category, idx, uidx)} disabled={(formData[category] as MentionDetail[])[idx].urls.length <= 1}><X className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addUrl(category, idx)}>Add URL</Button>
      </div>
    </div>
  );

  const renderCategorySection = (category: keyof DailyMention, title: string) => (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">{title}</Label>
      {(formData[category] as MentionDetail[] || []).map((_, idx) => (
        <div key={idx} className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between">
            <h4 className="font-medium">{title} Mention {idx + 1}</h4>
            <Button variant="ghost" size="icon" onClick={() => removeMention(category, idx)} disabled={(formData[category] as MentionDetail[] || []).length <= 1}>
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
          {renderMentionFields(category, idx)}
        </div>
      ))}
      <Button variant="outline" onClick={() => addMention(category)}>Add {title} Mention</Button>
    </div>
  );

  // === CRUD Actions ===
  const handleCreateNew = () => {
    setFormData({
      company_id: undefined,
      publication: '',
      date: '',
      status: 'pending',
      industry: [{ headline: '', content: null, reporter: null, source: null, sentiment: 'neutral', page: null, publication_date: null, urls: [''] }],
      competitors: [], subsidiaries: [], passive: [], advert: [],
    });
    setFormErrors({});
    setCreateModalOpen(true);
  };

  const handleView = async (id: number) => {
    try {
      const res = await axios.get(`${BASE_URL}/daily-mentions/${id}`);
      setSelectedMention(res.data.data);
      setViewModalOpen(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to load mention', variant: 'destructive' });
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const res = await axios.get(`${BASE_URL}/daily-mentions/${id}`);
      const data = res.data.data;
      setFormData({
        ...data,
        publication: typeof data.publication === 'string' ? data.publication : data.publication?.name || '',
      });
      setSelectedMention(data);
      setEditModalOpen(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to load mention', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this mention?')) return;
    try {
      await axios.put(`${BASE_URL}/daily-mentions/delete/${id}`, { is_deleted: true });
      toast({ title: 'Success', description: 'Deleted' });
      fetchDailyMentions();
    } catch {
      toast({ title: 'Error', description: 'Delete failed', variant: 'destructive' });
    }
  };

  // === Form Submit ===
  const handleSubmit = async (e: React.FormEvent, isEdit: boolean) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.company_id) errors.company_id = 'Required';
    if (!formData.publication) errors.publication = 'Required';
    if (!formData.date) errors.date = 'Required';
    if (!formData.industry?.length) errors.industry = 'At least one industry mention required';

    let invalidUrl = false;
    ['industry', 'competitors', 'subsidiaries', 'passive', 'advert'].forEach((cat) => {
      (formData[cat as keyof DailyMention] as MentionDetail[] || []).forEach((m) => {
        m.urls.forEach((u) => { if (u && !isValidUrl(u)) invalidUrl = true; });
      });
    });
    if (invalidUrl) errors.urls = 'Invalid URL';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({ title: 'Fix errors', variant: 'destructive' });
      return;
    }

    try {
      const payload = {
        ...formData,
        industry: formData.industry?.map(m => ({ ...m, urls: m.urls.filter(u => u && isValidUrl(u)) })),
        competitors: formData.competitors?.map(m => ({ ...m, urls: m.urls.filter(u => u && isValidUrl(u)) })),
        subsidiaries: formData.subsidiaries?.map(m => ({ ...m, urls: m.urls.filter(u => u && isValidUrl(u)) })),
        passive: formData.passive?.map(m => ({ ...m, urls: m.urls.filter(u => u && isValidUrl(u)) })),
        advert: formData.advert?.map(m => ({ ...m, urls: m.urls.filter(u => u && isValidUrl(u)) })),
      };

      if (isEdit && selectedMention) {
        await axios.put(`${BASE_URL}/daily-mentions/update/${selectedMention.id}`, payload);
        toast({ title: 'Success', description: 'Updated' });
      } else {
        await axios.post(`${BASE_URL}/daily-mentions/create`, payload);
        toast({ title: 'Success', description: 'Created' });
      }
      setCreateModalOpen(false);
      setEditModalOpen(false);
      fetchDailyMentions();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Submit failed', variant: 'destructive' });
    }
  };

  // === Columns ===
  const columns: ColumnDef<TableRow>[] = useMemo(() => [
    { accessorKey: 'companyName', header: 'Company' },
    { accessorKey: 'headline', header: 'Headline', cell: info => <div className="max-w-xs truncate" title={info.getValue() as string}>{info.getValue()}</div> },
    { accessorKey: 'publicationName', header: 'Publication' },
    { accessorKey: 'sentiment', header: 'Sentiment', cell: ({ row }) => {
        const s = row.original.sentiment;
        const color = s === 'positive' ? 'bg-green-100 text-green-800' : s === 'negative' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
        return <Badge className={color}>{s}</Badge>;
      }},
    { accessorKey: 'formattedDate', header: 'Date' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => {
        const s = row.original.status;
        const color = s === 'approved' ? 'bg-green-100 text-green-800' : s === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
        return <Badge className={color}>{s}</Badge>;
      }},
    { id: 'actions', header: 'Actions', cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleView(row.original.id)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original.id)}><Edit className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button>
        </div>
      )},
  ], []);

  // === Render ===
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="ml-3">Loading mentions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Daily Mentions</h1>
          <p className="text-gray-600">Manage all media mentions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" /> Create New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Daily Mention</DialogTitle></DialogHeader>
              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
                {/* Form fields - same as edit */}
                {/* ... (copy from edit modal below) */}
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>Mentions List</CardTitle></CardHeader>
        <CardContent>
          {tableData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No mentions found</div>
          ) : (
            <DataTable columns={columns} data={tableData} />
          )}

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Mention Details</DialogTitle></DialogHeader>
          {selectedMention && (
            <div className="space-y-6">
              <div><Label>Company</Label><p>{selectedMention.company?.company_name}</p></div>
              <div><Label>Publication</Label><p>{typeof selectedMention.publication === 'string' ? selectedMention.publication : selectedMention.publication?.name}</p></div>
              <div><Label>Date</Label><p>{selectedMention.date ? new Date(selectedMention.date).toLocaleDateString() : 'N/A'}</p></div>
              <div><Label>Status</Label><p>{selectedMention.status}</p></div>
              {(['industry', 'competitors', 'subsidiaries', 'passive', 'advert'] as const).map(cat => (
                <div key={cat}>
                  <Label className="capitalize">{cat} Mentions</Label>
                  {(selectedMention[cat] as MentionDetail[]).map((m, i) => (
                    <div key={i} className="border rounded p-4 mt-2">
                      <p><strong>Headline:</strong> {m.headline}</p>
                      <p><strong>Sentiment:</strong> {m.sentiment}</p>
                      {m.urls.length > 0 && (
                        <div>
                          <strong>URLs:</strong>
                          <ul className="list-disc pl-5">
                            {m.urls.map((u, ui) => <li key={ui}><a href={u} target="_blank" rel="noopener noreferrer" className="text-blue-600">{u}</a></li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal (same form as create) */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Daily Mention</DialogTitle></DialogHeader>
          <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-6">
            <div>
              <Label>Company *</Label>
              <Select value={formData.company_id?.toString()} onValueChange={(v) => setFormData({ ...formData, company_id: parseInt(v) })}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.company_name}</SelectItem>)}</SelectContent>
              </Select>
              {formErrors.company_id && <p className="text-red-500 text-sm">{formErrors.company_id}</p>}
            </div>

            <div>
              <Label>Publication *</Label>
              <Select value={formData.publication as string} onValueChange={(v) => setFormData({ ...formData, publication: v })}>
                <SelectTrigger><SelectValue placeholder="Select publication" /></SelectTrigger>
                <SelectContent>{publications.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
              {formErrors.publication && <p className="text-red-500 text-sm">{formErrors.publication}</p>}
            </div>

            <div>
              <Label>Date *</Label>
              <Input type="date" value={formData.date?.slice(0,10) || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              {formErrors.date && <p className="text-red-500 text-sm">{formErrors.date}</p>}
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderCategorySection('industry', 'Industry')}
            {renderCategorySection('competitors', 'Competitors')}
            {renderCategorySection('subsidiaries', 'Subsidiaries')}
            {renderCategorySection('passive', 'Passive')}
            {renderCategorySection('advert', 'Advert')}

            {formErrors.urls && <p className="text-red-500 text-sm">{formErrors.urls}</p>}
            {formErrors.industry && <p className="text-red-500 text-sm">{formErrors.industry}</p>}

            <Button type="submit">Update Mention</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyMentionsTablePage;