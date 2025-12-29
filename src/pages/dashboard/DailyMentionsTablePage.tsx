import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Edit,
  Trash2,
  Filter,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';

// === Types ===
interface MentionDetail {
  headline: string;
  content: string | null;
  reporter: string | null;
  publication: string | null;
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

interface Reporter {
  id: number;
  name: string;
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

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

const BASE_URL = 'https://pplus-oez4.onrender.com/api';
const ITEMS_PER_PAGE = 10;

const Combobox: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ options, value, onChange, placeholder = 'Select...' }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? options.find((o) => o.value === value)?.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={(current) => {
                  onChange(current === value ? '' : current);
                  setOpen(false);
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${value === option.value ? 'opacity-100' : 'opacity-0'}`}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const DailyMentionsTablePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, token } = useAuth();

  // Determine user role safely
  const userRole = user?.role?.name || (typeof user?.role === 'string' ? user.role : 'Analyst');
  const isAdmin = userRole === 'Admin';
  const isSupervisor = userRole === 'Supervisor';
  const isAnalyst = userRole === 'Analyst';

  // Show "Create New" button only for Analysts
  const showCreateButton = isAnalyst;

  // Show Delete button only for Admins
  const showDeleteButton = isAdmin;

  // State
  const [dailyMentions, setDailyMentions] = useState<DailyMention[]>([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalPages: 1,
  });

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
  const [reporters, setReporters] = useState<Reporter[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Auto-open edit modal from dashboard navigation
  useEffect(() => {
    if (location.state?.editId) {
      handleEdit(location.state.editId);
    }
  }, [location.state]);

  // === URL Validation ===
  const isValidUrl = (url: string): boolean => {
    if (!url) return true;
    const pattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/i;
    return pattern.test(url);
  };

  // === Fetch Daily Mentions WITH PAGINATION & FILTERS ===
  const fetchDailyMentions = useCallback(async () => {
    if (!token || !user) {
      toast({ title: 'Error', description: 'Please login', variant: 'destructive' });
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      let endpoint = `${BASE_URL}/daily-mentions/`;

      if (isSupervisor) {
        endpoint = `${BASE_URL}/daily-mentions/supervisor-mentions`;
      } else if (isAnalyst) {
        endpoint = `${BASE_URL}/daily-mentions/my-mentions`;
      }

      const safePage = Math.max(1, isNaN(pagination.page) ? 1 : pagination.page);

      const params = new URLSearchParams();
      params.append('page', safePage.toString());
      params.append('limit', pagination.limit.toString());

      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await axios.get(`${endpoint}?${params.toString()}`);

      let mentions: DailyMention[] = [];
      let meta: Pagination = {
        total: 0,
        page: safePage,
        limit: pagination.limit,
        totalPages: 1,
      };

      if (response.data?.success && response.data.data) {
        if (Array.isArray(response.data.data.data)) {
          mentions = response.data.data.data;
          meta = {
            total: response.data.data.pagination.total,
            page: response.data.data.pagination.currentPage,
            limit: response.data.data.pagination.pageSize,
            totalPages: response.data.data.pagination.totalPages,
          };
        } else if (Array.isArray(response.data.data)) {
          mentions = response.data.data;
          meta = response.data.pagination || {
            total: mentions.length,
            page: safePage,
            limit: pagination.limit,
            totalPages: Math.ceil(mentions.length / pagination.limit),
          };
        }
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
      setPagination(meta);
    } catch (err: any) {
      console.error('Fetch error:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load mentions',
        variant: 'destructive',
      });
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, user, token, navigate, toast, statusFilter, dateFrom, dateTo, isSupervisor, isAnalyst]);

  // Fetch on mount + when filters/page change
  useEffect(() => {
    fetchDailyMentions();
  }, [fetchDailyMentions]);

  // Fetch companies, publications, reporters (once)
  useEffect(() => {
    const fetchSupportingData = async () => {
      try {
        const [compRes, pubRes, repRes] = await Promise.all([
          axios.get(`${BASE_URL}/companies`),
          axios.get(`${BASE_URL}/data-parameters/category/Publications`),
          axios.get(`${BASE_URL}/data-parameters/category/Reporter`),
        ]);
        
        setCompanies(compRes.data?.data?.data || compRes.data?.data || []);
        
        if (pubRes.data?.success && pubRes.data?.data?.length > 0) {
          const categories = pubRes.data.data[0].categories;
          if (categories && categories.length > 0 && categories[0].values) {
            const publicationValues = categories[0].values
              .filter(v => !v.is_deleted)
              .map(v => ({ id: v.id, name: v.value }));
            setPublications(publicationValues);
          }
        }
        
        if (repRes.data?.success && repRes.data?.data?.length > 0) {
          const categories = repRes.data.data[0].categories;
          if (categories && categories.length > 0 && categories[0].values) {
            const reporterValues = categories[0].values
              .filter(v => !v.is_deleted)
              .map(v => ({ id: v.id, name: v.value }));
            setReporters(reporterValues);
          }
        }
        
      } catch (err) {
        console.error('Error fetching supporting data:', err);
        toast({ 
          title: 'Warning', 
          description: 'Failed to load supporting data', 
          variant: 'default' 
        });
      }
    };
    
    fetchSupportingData();
  }, [toast]);

  // === Form Helpers (unchanged) ===
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
      publication: null,
      sentiment: 'neutral',
      page: null,
      publication_date: null,
      urls: [''],
    };
    setFormData((prev) => ({ ...prev, [cat]: [...(prev[cat] as MentionDetail[] || []), newMention] }));
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
      <div>
        <Label>Headline</Label>
        <Input
          value={(formData[category] as MentionDetail[])[idx]?.headline || ''}
          onChange={(e) => updateMention(category, idx, 'headline', e.target.value)}
        />
      </div>
      <div>
        <Label>Content</Label>
        <Textarea
          value={(formData[category] as MentionDetail[])[idx]?.content || ''}
          onChange={(e) => updateMention(category, idx, 'content', e.target.value || null)}
        />
      </div>
      <div>
        <Label>Reporter</Label>
        <Combobox
          options={reporters.map((r) => ({ value: r.name, label: r.name }))}
          value={(formData[category] as MentionDetail[])[idx]?.reporter || ''}
          onChange={(v) => updateMention(category, idx, 'reporter', v || null)}
        />
      </div>
      <div>
        <Label>Source</Label>
        <Combobox
          options={publications.map((p) => ({ value: p.name, label: p.name }))}
          value={(formData[category] as MentionDetail[])[idx]?.publication || ''}
          onChange={(v) => updateMention(category, idx, 'publication', v || null)}
        />
      </div>
      <div>
        <Label>Sentiment</Label>
        <Select
          value={(formData[category] as MentionDetail[])[idx]?.sentiment || 'neutral'}
          onValueChange={(v) => updateMention(category, idx, 'sentiment', v as any)}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Page</Label>
        <Input
          value={(formData[category] as MentionDetail[])[idx]?.page || ''}
          onChange={(e) => updateMention(category, idx, 'page', e.target.value || null)}
        />
      </div>
      <div>
        <Label>Publication Date</Label>
        <Input
          type="date"
          value={(formData[category] as MentionDetail[])[idx]?.publication_date?.slice(0, 10) || ''}
          onChange={(e) => updateMention(category, idx, 'publication_date', e.target.value || null)}
        />
      </div>
      <div>
        <Label>URLs</Label>
        {(formData[category] as MentionDetail[])[idx]?.urls.map((url, uidx) => (
          <div key={uidx} className="flex gap-2 mb-2">
            <Input
              value={url}
              onChange={(e) => updateUrl(category, idx, uidx, e.target.value)}
              placeholder="https://..."
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeUrl(category, idx, uidx)}
              disabled={(formData[category] as MentionDetail[])[idx].urls.length <= 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addUrl(category, idx)}>
          Add URL
        </Button>
      </div>
    </div>
  );

  const renderCategorySection = (category: keyof DailyMention, title: string) => (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">{title}</Label>
      {(formData[category] as MentionDetail[] || []).map((_, idx) => (
        <div key={idx} className="border rounded-lg p-4 space-y-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{title} Mention {idx + 1}</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeMention(category, idx)}
              disabled={(formData[category] as MentionDetail[] || []).length <= 1}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
          {renderMentionFields(category, idx)}
        </div>
      ))}
      <Button variant="outline" onClick={() => addMention(category)}>
        Add {title} Mention
      </Button>
    </div>
  );

  // === CRUD Actions ===
  const handleCreateNew = () => {
    setFormData({
      company_id: undefined,
      publication: '',
      date: '',
      industry: [
        {
          headline: '',
          content: null,
          reporter: null,
          source: null,
          sentiment: 'neutral',
          page: null,
          publication_date: null,
          urls: [''],
        },
      ],
      competitors: [],
      subsidiaries: [],
      passive: [],
      advert: [],
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
        m.urls.forEach((u) => {
          if (u && !isValidUrl(u)) invalidUrl = true;
        });
      });
    });
    if (invalidUrl) errors.urls = 'One or more URLs are invalid';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({ title: 'Fix errors', variant: 'destructive' });
      return;
    }

    try {
      const payload = {
        ...formData,
        industry: formData.industry?.map((m) => ({
          ...m,
          urls: m.urls.filter((u) => u && isValidUrl(u)),
        })),
        competitors: formData.competitors?.map((m) => ({
          ...m,
          urls: m.urls.filter((u) => u && isValidUrl(u)),
        })),
        subsidiaries: formData.subsidiaries?.map((m) => ({
          ...m,
          urls: m.urls.filter((u) => u && isValidUrl(u)),
        })),
        passive: formData.passive?.map((m) => ({
          ...m,
          urls: m.urls.filter((u) => u && isValidUrl(u)),
        })),
        advert: formData.advert?.map((m) => ({
          ...m,
          urls: m.urls.filter((u) => u && isValidUrl(u)),
        })),
      };

      if (isEdit && selectedMention) {
        await axios.put(`${BASE_URL}/daily-mentions/update/${selectedMention.id}`, payload);
        toast({ title: 'Success', description: 'Updated successfully' });
      } else {
        await axios.post(`${BASE_URL}/daily-mentions/create`, payload);
        toast({ title: 'Success', description: 'Created successfully' });
      }

      setCreateModalOpen(false);
      setEditModalOpen(false);
      fetchDailyMentions();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Submit failed',
        variant: 'destructive',
      });
    }
  };

  // === Clear Filters ===
  const handleResetFilters = () => {
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // === Table Columns ===
  const columns: ColumnDef<TableRow>[] = useMemo(
    () => [
      { accessorKey: 'companyName', header: 'Company' },
      {
        accessorKey: 'headline',
        header: 'Headline',
        cell: ({ row }) => (
          <div className="max-w-xs truncate" title={row.original.headline}>
            {row.original.headline}
          </div>
        ),
      },
      { accessorKey: 'publicationName', header: 'Publication' },
      {
        accessorKey: 'sentiment',
        header: 'Sentiment',
        cell: ({ row }) => {
          const s = row.original.sentiment;
          const color =
            s === 'positive'
              ? 'bg-green-100 text-green-800'
              : s === 'negative'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800';
          return <Badge className={color}>{s}</Badge>;
        },
      },
      { accessorKey: 'formattedDate', header: 'Date' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const s = row.original.status;
          const color =
            s === 'approved'
              ? 'bg-green-100 text-green-800'
              : s === 'rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800';
          return <Badge className={color}>{s}</Badge>;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleView(row.original.id)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original.id)}>
              <Edit className="h-4 w-4" />
            </Button>
            {showDeleteButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(row.original.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [showDeleteButton]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="ml-3 text-gray-600">Loading mentions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Mentions</h1>
          <p className="text-gray-600 mt-1">Track and manage daily media coverage</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchDailyMentions} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {showCreateButton && (
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreateNew} className="bg-indigo-950 hover:bg-indigo-800">
                  Create New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Daily Mention</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
                  <div>
                    <Label>Company *</Label>
                    <Combobox
                      options={companies.map((c) => ({ value: c.id.toString(), label: c.company_name }))}
                      value={formData.company_id?.toString() || ''}
                      onChange={(v) => setFormData({ ...formData, company_id: v ? parseInt(v) : undefined })}
                    />
                    {formErrors.company_id && <p className="text-red-500 text-sm mt-1">{formErrors.company_id}</p>}
                  </div>

                  <div>
                    <Label>Publication *</Label>
                    <Combobox
                      options={publications.map((p) => ({ value: p.name, label: p.name }))}
                      value={formData.publication as string || ''}
                      onChange={(v) => setFormData({ ...formData, publication: v })}
                    />
                    {formErrors.publication && <p className="text-red-500 text-sm mt-1">{formErrors.publication}</p>}
                  </div>

                  <div>
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={formData.date?.slice(0, 10) || ''}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                    {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
                  </div>

                  {renderCategorySection('industry', 'Industry')}
                  {renderCategorySection('competitors', 'Competitors')}
                  {renderCategorySection('subsidiaries', 'Subsidiaries')}
                  {renderCategorySection('passive', 'Passive')}
                  {renderCategorySection('advert', 'Advert')}

                  {formErrors.urls && <p className="text-red-500 text-sm">{formErrors.urls}</p>}
                  {formErrors.industry && <p className="text-red-500 text-sm">{formErrors.industry}</p>}

                  <div className="flex justify-end">
                    <Button type="submit">Create Mention</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={handleResetFilters} className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mentions List</CardTitle>
        </CardHeader>
        <CardContent>
          {tableData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {loading ? 'Loading mentions...' : 'No mentions found'}
            </div>
          ) : (
            <DataTable columns={columns} data={tableData} />
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 text-sm">
              <p className="text-gray-600">
                Showing{' '}
                {Math.max(1, (pagination.page - 1) * pagination.limit + 1)}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  disabled={pagination.page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>

                <span className="px-4 py-2 bg-gray-100 rounded-md font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages || loading}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
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
            <DialogTitle>Mention Details</DialogTitle>
          </DialogHeader>
          {selectedMention && (
            <div className="space-y-6">
              <div>
                <Label>Company</Label>
                <p className="font-medium">{selectedMention.company?.company_name || 'N/A'}</p>
              </div>
              <div>
                <Label>Publication</Label>
                <p>
                  {typeof selectedMention.publication === 'string'
                    ? selectedMention.publication
                    : selectedMention.publication?.name || 'N/A'}
                </p>
              </div>
              <div>
                <Label>Date</Label>
                <p>
                  {selectedMention.date
                    ? new Date(selectedMention.date).toLocaleDateString('en-GB')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge
                  variant={
                    selectedMention.status === 'approved'
                      ? 'default'
                      : selectedMention.status === 'rejected'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {selectedMention.status}
                </Badge>
              </div>

              {(['industry', 'competitors', 'subsidiaries', 'passive', 'advert'] as const).map((cat) => (
                <div key={cat}>
                  <Label className="capitalize text-lg font-semibold mb-2 block">{cat} Mentions</Label>
                  {(selectedMention[cat] as MentionDetail[]).length === 0 ? (
                    <p className="text-gray-500 italic">No {cat} mentions</p>
                  ) : (
                    (selectedMention[cat] as MentionDetail[]).map((m, i) => (
                      <div key={i} className="border rounded p-4 mt-2 bg-gray-50">
                        <p><strong>Headline:</strong> {m.headline}</p>
                        <p><strong>Sentiment:</strong> <Badge variant={m.sentiment === 'positive' ? 'default' : m.sentiment === 'negative' ? 'destructive' : 'secondary'}>{m.sentiment}</Badge></p>
                        {m.content && <p><strong>Content:</strong> {m.content}</p>}
                        {m.reporter && <p><strong>Reporter:</strong> {m.reporter}</p>}
                        {m.urls.length > 0 && (
                          <div>
                            <strong>URLs:</strong>
                            <ul className="list-disc pl-5 mt-1">
                              {m.urls.map((u, ui) => (
                                <li key={ui}>
                                  <a href={u} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {u}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Daily Mention</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-6">
            <div>
              <Label>Company *</Label>
              <Combobox
                options={companies.map((c) => ({ value: c.id.toString(), label: c.company_name }))}
                value={formData.company_id?.toString() || ''}
                onChange={(v) => setFormData({ ...formData, company_id: v ? parseInt(v) : undefined })}
              />
              {formErrors.company_id && <p className="text-red-500 text-sm mt-1">{formErrors.company_id}</p>}
            </div>

            <div>
              <Label>Publication *</Label>
              <Combobox
                options={publications.map((p) => ({ value: p.name, label: p.name }))}
                value={formData.publication as string || ''}
                onChange={(v) => setFormData({ ...formData, publication: v })}
              />
              {formErrors.publication && <p className="text-red-500 text-sm mt-1">{formErrors.publication}</p>}
            </div>

            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.date?.slice(0, 10) || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              {formErrors.date && <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>}
            </div>

            {renderCategorySection('industry', 'Industry')}
            {renderCategorySection('competitors', 'Competitors')}
            {renderCategorySection('subsidiaries', 'Subsidiaries')}
            {renderCategorySection('passive', 'Passive')}
            {renderCategorySection('advert', 'Advert')}

            {formErrors.urls && <p className="text-red-500 text-sm">{formErrors.urls}</p>}
            {formErrors.industry && <p className="text-red-500 text-sm">{formErrors.industry}</p>}

            <div className="flex justify-end">
              <Button type="submit">Update Mention</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyMentionsTablePage;