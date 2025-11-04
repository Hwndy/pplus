import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

// Define interfaces based on API response
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

interface Analyst {
  id: number;
  username: string;
}

interface DailyMention {
  id: number;
  company_id?: number;
  company?: Company;
  publication?: string | Publication;
  date?: string;
  analyst_id?: number;
  analyst?: Analyst;
  status: 'pending' | 'approved' | 'rejected';
  industry: MentionDetail[];
  competitors: MentionDetail[];
  subsidiaries: MentionDetail[];
  passive: MentionDetail[];
  advert: MentionDetail[];
  filename?: string | null;
  original_name?: string | null;
  file_path?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  file_type?: 'excel' | 'csv' | null;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    data: DailyMention[];
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
  headline: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  publicationName: string;
  formattedDate: string;
  status: string;
}

// Simple URI validation regex
const isValidUrl = (url: string): boolean => {
  const urlPattern = /^(https?:\/\/)([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/i;
  return urlPattern.test(url);
};

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

const DailyMentionsTablePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isSessionValidated, token } = useAuth(); // Updated to include user and token
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
  const [publications, setPublications] = useState<Publication[]>([
    { id: 1, name: 'ThisDay', type: 'Print' },
    { id: 2, name: 'BusinessDay', type: 'Print' },
    { id: 5, name: 'The Punch', type: 'Print' },
    { id: 4, name: 'The Guardian', type: 'Print' },
    { id: 6, name: 'The Nation', type: 'Print' },
  ]);
  const mentionsPerPage = 10;

  const BASE_URL = 'https://pplus-ec37.onrender.com/api';

  // Refetch function
  const refetch = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Helper functions for form updates
  const updateMention = (category: 'industry' | 'competitors' | 'subsidiaries' | 'passive' | 'advert', idx: number, field: keyof MentionDetail, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [category]: (prev[category as keyof Partial<DailyMention>] as MentionDetail[] || []).map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      ),
    }));
  };

  const updateUrl = (
    category: 'industry' | 'competitors' | 'subsidiaries' | 'passive' | 'advert',
    midx: number,
    uidx: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: (prev[category as keyof Partial<DailyMention>] as MentionDetail[] || []).map((item, i) =>
        i === midx
          ? {
              ...item,
              urls: item.urls.map((url, j) => (j === uidx ? value : url)),
            }
          : item
      ),
    }));
  };

  const addUrl = (category: 'industry' | 'competitors' | 'subsidiaries' | 'passive' | 'advert', midx: number) => {
    setFormData((prev) => ({
      ...prev,
      [category]: (prev[category as keyof Partial<DailyMention>] as MentionDetail[] || []).map((item, i) =>
        i === midx ? { ...item, urls: [...item.urls, ''] } : item
      ),
    }));
  };

  const removeUrl = (
    category: 'industry' | 'competitors' | 'subsidiaries' | 'passive' | 'advert',
    midx: number,
    uidx: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [category]: (prev[category as keyof Partial<DailyMention>] as MentionDetail[] || []).map((item, i) =>
        i === midx
          ? {
              ...item,
              urls: item.urls.filter((_, j) => j !== uidx),
            }
          : item
      ),
    }));
  };

  const addMention = (category: 'industry' | 'competitors' | 'subsidiaries' | 'passive' | 'advert') => {
    const newMention: MentionDetail = {
      headline: '',
      content: null,
      reporter: null,
      source: null,
      sentiment: 'neutral',
      page: null,
      publication_date: null,
      urls: [],
    };
    setFormData((prev) => ({
      ...prev,
      [category]: [...(prev[category as keyof Partial<DailyMention>] as MentionDetail[] || []), newMention],
    }));
  };

  const removeMention = (category: 'industry' | 'competitors' | 'subsidiaries' | 'passive' | 'advert', idx: number) => {
    setFormData((prev) => ({
      ...prev,
      [category]: (prev[category as keyof Partial<DailyMention>] as MentionDetail[] || []).filter((_, i) => i !== idx),
    }));
  };

  // Render mention fields and category sections
  const renderMentionFields = (
    category: 'industry' | 'competitors' | 'subsidiaries' | 'passive' | 'advert',
    idx: number
  ) => (
    <div className="space-y-2">
      <Label>Headline</Label>
      <Input
        value={(formData[category] as MentionDetail[] || [])[idx]?.headline || ''}
        onChange={(e) => updateMention(category, idx, 'headline', e.target.value)}
        placeholder="Enter headline"
      />
      <Label>Content</Label>
      <Textarea
        value={(formData[category] as MentionDetail[] || [])[idx]?.content || ''}
        onChange={(e) => updateMention(category, idx, 'content', e.target.value || null)}
        placeholder="Enter content"
      />
      <Label>Reporter</Label>
      <Input
        value={(formData[category] as MentionDetail[] || [])[idx]?.reporter || ''}
        onChange={(e) => updateMention(category, idx, 'reporter', e.target.value || null)}
        placeholder="Enter reporter"
      />
      <Label>Source</Label>
      <Input
        value={(formData[category] as MentionDetail[] || [])[idx]?.source || ''}
        onChange={(e) => updateMention(category, idx, 'source', e.target.value || null)}
        placeholder="Enter source"
      />
      <Label>Sentiment</Label>
      <Select
        value={(formData[category] as MentionDetail[] || [])[idx]?.sentiment || 'neutral'}
        onValueChange={(value) => updateMention(category, idx, 'sentiment', value as 'positive' | 'negative' | 'neutral')}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="positive">Positive</SelectItem>
          <SelectItem value="neutral">Neutral</SelectItem>
          <SelectItem value="negative">Negative</SelectItem>
        </SelectContent>
      </Select>
      <Label>Page</Label>
      <Input
        value={(formData[category] as MentionDetail[] || [])[idx]?.page || ''}
        onChange={(e) => updateMention(category, idx, 'page', e.target.value || null)}
        placeholder="Enter page"
      />
      <Label>Publication Date</Label>
      <Input
        type="date"
        value={
          (formData[category] as MentionDetail[] || [])[idx]?.publication_date
            ? new Date((formData[category] as MentionDetail[] || [])[idx]?.publication_date).toISOString().split('T')[0]
            : ''
        }
        onChange={(e) => updateMention(category, idx, 'publication_date', e.target.value || null)}
      />
      <Label>URLs</Label>
      <div className="space-y-2">
        {(formData[category] as MentionDetail[] || [])[idx]?.urls?.map((url, uidx) => (
          <div key={uidx} className="flex items-center space-x-2">
            <Input
              value={url}
              onChange={(e) => updateUrl(category, idx, uidx, e.target.value)}
              placeholder="Enter valid URL (e.g., https://example.com)"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeUrl(category, idx, uidx)}
              disabled={((formData[category] as MentionDetail[] || [])[idx]?.urls?.length || 0) <= 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )) || null}
        <Button type="button" variant="outline" size="sm" onClick={() => addUrl(category, idx)}>
          Add URL
        </Button>
      </div>
    </div>
  );

  const renderCategorySection = (
    category: 'industry' | 'competitors' | 'subsidiaries' | 'passive' | 'advert',
    title: string
  ) => (
    <div className="space-y-4">
      <Label>{title}</Label>
      {(formData[category] as MentionDetail[] || []).map((_, idx) => (
        <div key={idx} className="border p-4 rounded-md space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">{title} Mention {idx + 1}</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeMention(category, idx)}
              className="text-red-600"
              disabled={(formData[category] as MentionDetail[] || []).length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {renderMentionFields(category, idx)}
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => addMention(category)}>
        Add {title} Mention
      </Button>
    </div>
  );

  // Fetch single mention by ID
  const fetchMentionById = useCallback(async (id: number): Promise<DailyMention | null> => {
    try {
      const response = await axios.get(`${BASE_URL}/daily-mentions/${id}`);
      const mention = response.data?.data;
      if (!mention) throw new Error('No data in response');
      return {
        ...mention,
        publication: typeof mention.publication === 'string' ? mention.publication : mention.publication?.name || 'Unknown',
      };
    } catch (error: any) {
      console.error('Error fetching mention by ID:', error.message, error.response?.data);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch mention details',
        variant: 'destructive',
      });
      if (error.response?.status === 401) navigate('/login');
      return null;
    }
  }, [toast, navigate]);

  // Fetch companies and publications
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [companiesRes, publicationsRes] = await Promise.all([
          axios.get(`${BASE_URL}/companies/`).catch((error) => {
            console.error('Error fetching companies:', error.message, error.response?.data);
            return { data: { data: [] } };
          }),
          axios.get(`${BASE_URL}/publications/`).catch((error) => {
            console.error('Error fetching publications:', error.message, error.response?.data, error.response?.status);
            return { data: { data: [] } };
          }),
        ]);

        const fetchedCompanies = companiesRes.data.data?.data || [];
        let fetchedPublications = publicationsRes.data.data?.data || [];

        console.log('Fetched companies:', fetchedCompanies);
        console.log('Fetched publications:', fetchedPublications, 'Status:', publicationsRes.status);

        // Try alternative endpoint if /publications/ fails
        if (fetchedPublications.length === 0) {
          console.warn('No publications from /publications/, trying /api/publications');
          const altPublicationsRes = await axios.get(`${BASE_URL}/publications`).catch((error) => {
            console.error('Error fetching alternative publications:', error.message, error.response?.data, error.response?.status);
            return { data: { data: [] } };
          });
          fetchedPublications = altPublicationsRes.data.data?.data || [];
          console.log('Fetched alternative publications:', fetchedPublications, 'Status:', altPublicationsRes.status);
        }

        setCompanies(fetchedCompanies);
        if (fetchedPublications.length > 0) {
          setPublications(fetchedPublications);
        } else {
          console.warn('No publications fetched, using fallback data');
          toast({
            title: 'Warning',
            description: 'No publications loaded from API. Using fallback data.',
            variant: 'default',
          });
        }
      } catch (error: any) {
        console.error('Error fetching dropdown data:', error.message);
        toast({
          title: 'Error',
          description: 'Failed to load companies or publications. Using fallback data.',
          variant: 'destructive',
        });
      }
    };
    fetchDropdownData();
  }, [toast]);

  // Fetch daily mentions
  useEffect(() => {
    if (!isSessionValidated || !user || !token) {
      toast({
        title: 'Session not validated',
        description: 'Please log in to view daily mentions.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    const fetchDailyMentions = async () => {
      try {
        setLoading(true);
        // Determine endpoint based on user role
        const endpoint = user.role.name === 'Supervisor'
          ? `${BASE_URL}/daily-mentions/supervisor-mentions`
          : user.role.name === 'Analyst'
          ? `${BASE_URL}/daily-mentions/my-mentions`
          : `${BASE_URL}/daily-mentions/`;

        const response = await axios.get<ApiResponse>(endpoint, {
          params: {
            page: currentPage,
            limit: mentionsPerPage,
          },
        });

        const mentionsData = response.data?.data?.data || [];
        const pagination = response.data?.data?.pagination || { total: 0, totalPages: 1 };

        if (!Array.isArray(mentionsData)) {
          console.error('mentionsData is not an array:', mentionsData);
          throw new Error('Expected mentionsData to be an array');
        }

        // Normalize data
        const normalizedMentions = mentionsData
          .filter((item) => !item.is_deleted)
          .map((mention: DailyMention) => ({
            ...mention,
            company: mention.company || { company_name: 'Unknown', industry: '', sub_industry: '' },
            publication: typeof mention.publication === 'string' 
              ? mention.publication 
              : (mention.publication as Publication)?.name || 'Unknown',
            analyst: mention.analyst || { username: 'Unknown' },
            status: mention.status || 'pending',
            industry: Array.isArray(mention.industry) ? mention.industry : [],
            competitors: Array.isArray(mention.competitors) ? mention.competitors : [],
            subsidiaries: Array.isArray(mention.subsidiaries) ? mention.subsidiaries : [],
            passive: Array.isArray(mention.passive) ? mention.passive : [],
            advert: Array.isArray(mention.advert) ? mention.advert : [],
          }));

        // Map to table data
        const mappedData = normalizedMentions.map((item) => ({
          id: item.id,
          companyName: item.company.company_name,
          headline:
            item.industry[0]?.headline ||
            item.competitors[0]?.headline ||
            item.subsidiaries[0]?.headline ||
            item.passive[0]?.headline ||
            item.advert[0]?.headline ||
            'No headline available',
          sentiment:
            (item.industry[0]?.sentiment ||
              item.competitors[0]?.sentiment ||
              item.subsidiaries[0]?.sentiment ||
              item.passive[0]?.sentiment ||
              item.advert[0]?.sentiment ||
              'neutral') as 'positive' | 'negative' | 'neutral',
          publicationName: typeof item.publication === 'string' ? item.publication : item.publication?.name || 'Unknown',
          formattedDate: item.date && !isNaN(new Date(item.date).getTime())
            ? new Date(item.date).toLocaleDateString('en-US')
            : 'Invalid Date',
          status: item.status,
        }));

        setDailyMentions(normalizedMentions);
        setTableData(mappedData);
        setTotalPages(pagination.totalPages || 1);
        setTotalCount(pagination.total || 0);
      } catch (error: any) {
        console.error('Error fetching daily mentions:', error.message, error.response?.data);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load daily mentions',
          variant: 'destructive',
        });
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDailyMentions();
  }, [currentPage, isSessionValidated, user, token, navigate, toast]); // Added user and token to dependencies

  // Handle create new
  const handleCreateNew = () => {
    setFormData({
      company_id: undefined,
      publication: '',
      date: '',
      status: 'pending',
      industry: [],
      competitors: [],
      subsidiaries: [],
      passive: [],
      advert: [],
    });
    setFormErrors({});
    setCreateModalOpen(true);
  };

  // Handle view
  const handleView = async (id: number) => {
    const mention = await fetchMentionById(id);
    if (mention) {
      setSelectedMention(mention);
      setViewModalOpen(true);
    }
  };

  // Handle edit
  const handleEdit = async (id: number) => {
    const mention = await fetchMentionById(id);
    if (mention) {
      setSelectedMention(mention);
      setFormData({
        id: mention.id,
        company_id: mention.company_id,
        publication: typeof mention.publication === 'string' ? mention.publication : mention.publication?.name || '',
        date: mention.date || '',
        status: mention.status || 'pending',
        industry: mention.industry || [],
        competitors: mention.competitors || [],
        subsidiaries: mention.subsidiaries || [],
        passive: mention.passive || [],
        advert: mention.advert || [],
      });
      setFormErrors({});
      setEditModalOpen(true);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this daily mention?')) {
      try {
        await axios.put(`${BASE_URL}/daily-mentions/delete/${id}`, { is_deleted: true });
        toast({
          title: 'Success',
          description: 'Daily mention deleted successfully',
        });
        refetch();
      } catch (error: any) {
        console.error('Error deleting daily mention:', error.response?.data || error.message);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to delete daily mention',
          variant: 'destructive',
        });
      }
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.company_id) errors.company_id = 'Company is required';
    if (!formData.publication) errors.publication = 'Publication is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.status) errors.status = 'Status is required';
    if (!formData.industry || (formData.industry as MentionDetail[]).length === 0) {
      errors.industry = 'At least one industry mention is required';
    }

    // Check URLs validity
    const categories: ('industry' | 'competitors' | 'subsidiaries' | 'passive' | 'advert')[] = [
      'industry',
      'competitors',
      'subsidiaries',
      'passive',
      'advert',
    ];
    let hasInvalidUrl = false;
    categories.forEach((cat) => {
      (formData[cat] as MentionDetail[] || []).forEach((mention) => {
        mention.urls.forEach((url) => {
          if (url && !isValidUrl(url)) hasInvalidUrl = true;
        });
      });
    });
    if (hasInvalidUrl) {
      errors.urls = 'All URLs must be valid (e.g., https://example.com)';
    }

    return errors;
  };

  // Handle create/edit submission
  const handleSubmit = async (e: React.FormEvent, isEdit: boolean) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({
        title: 'Error',
        description: 'Please fix the form errors before submitting',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload: Partial<DailyMention> = {
        company_id: formData.company_id,
        publication: formData.publication,
        date: formData.date,
        status: formData.status || 'pending',
        industry: (formData.industry || []).map((item) => ({
          ...item,
          urls: item.urls.filter((url) => url && isValidUrl(url)),
        })),
        competitors: (formData.competitors || []).map((item) => ({
          ...item,
          urls: item.urls.filter((url) => url && isValidUrl(url)),
        })),
        subsidiaries: (formData.subsidiaries || []).map((item) => ({
          ...item,
          urls: item.urls.filter((url) => url && isValidUrl(url)),
        })),
        passive: (formData.passive || []).map((item) => ({
          ...item,
          urls: item.urls.filter((url) => url && isValidUrl(url)),
        })),
        advert: (formData.advert || []).map((item) => ({
          ...item,
          urls: item.urls.filter((url) => url && isValidUrl(url)),
        })),
      };

      console.log('Submitting payload:', payload);

      if (isEdit && selectedMention) {
        await axios.put(`${BASE_URL}/daily-mentions/update/${selectedMention.id}`, payload);
        toast({
          title: 'Success',
          description: 'Daily mention updated successfully',
        });
      } else {
        await axios.post(`${BASE_URL}/daily-mentions/create`, payload);
        toast({
          title: 'Success',
          description: 'Daily mention created successfully',
        });
      }
      setCreateModalOpen(false);
      setEditModalOpen(false);
      setFormErrors({});
      refetch();
    } catch (error: any) {
      console.error('Error submitting daily mention:', error.response?.data || error.message);
      const backendErrors = Array.isArray(error.response?.data?.message)
        ? error.response.data.message
        : [];
      if (backendErrors.length > 0) {
        const newErrors: Record<string, string> = {};
        backendErrors.forEach((err: BackendError) => {
          newErrors[err.field] = err.message;
        });
        setFormErrors(newErrors);
      }
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit daily mention',
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
        cell: ({ row }) => row.original.companyName || 'Unknown',
      },
      {
        accessorKey: 'headline',
        header: 'Headline',
        cell: ({ row }) => (
          <div className="max-w-xs truncate" title={row.original.headline}>
            {row.original.headline}
          </div>
        ),
      },
      {
        accessorKey: 'publicationName',
        header: 'Publication',
        cell: ({ row }) => row.original.publicationName || 'Unknown',
      },
      {
        accessorKey: 'sentiment',
        header: 'Sentiment',
        cell: ({ row }) => {
          const sentiment = row.original.sentiment || 'neutral';
          let sentimentColor = '';
          switch (sentiment.toLowerCase()) {
            case 'positive':
              sentimentColor = 'bg-green-100 text-green-800';
              break;
            case 'negative':
              sentimentColor = 'bg-red-100 text-red-800';
              break;
            case 'neutral':
            default:
              sentimentColor = 'bg-gray-100 text-gray-800';
          }
          return <Badge className={sentimentColor}>{sentiment}</Badge>;
        },
      },
      {
        accessorKey: 'formattedDate',
        header: 'Date',
        cell: ({ row }) => row.original.formattedDate,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status || 'pending';
          let statusColor = '';
          switch (status.toLowerCase()) {
            case 'approved':
              statusColor = 'bg-green-100 text-green-800';
              break;
            case 'rejected':
              statusColor = 'bg-red-100 text-red-800';
              break;
            case 'pending':
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(row.original.id)}
              className="text-red-600 hover:text-red-800"
            >
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
          <p>Loading daily mentions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Daily Mentions</h1>
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
                <DialogTitle>Create Daily Mention</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                <div>
                  <Label>Company <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.company_id?.toString() || ''}
                    onValueChange={(value) => setFormData({ ...formData, company_id: parseInt(value) })}
                  >
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
                  <Label>Publication <span className="text-red-500">*</span></Label>
                  <Select value={formData.publication || ''} onValueChange={(value) => setFormData({ ...formData, publication: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select publication" />
                    </SelectTrigger>
                    <SelectContent>
                      {publications.map((publication) => (
                        <SelectItem key={publication.id} value={publication.name}>
                          {publication.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.publication && <p className="text-red-500 text-sm">{formErrors.publication}</p>}
                </div>
                <div>
                  <Label>Date <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                  {formErrors.date && <p className="text-red-500 text-sm">{formErrors.date}</p>}
                </div>
                <div>
                  <Label>Status <span className="text-red-500">*</span></Label>
                  <Select value={formData.status || 'pending'} onValueChange={(value) => setFormData({ ...formData, status: value as 'pending' | 'approved' | 'rejected' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.status && <p className="text-red-500 text-sm">{formErrors.status}</p>}
                </div>
                {renderCategorySection('industry', 'Industry')}
                {renderCategorySection('competitors', 'Competitors')}
                {renderCategorySection('subsidiaries', 'Subsidiaries')}
                {renderCategorySection('passive', 'Passive')}
                {renderCategorySection('advert', 'Advert')}
                {formErrors.urls && <p className="text-red-500 text-sm">{formErrors.urls}</p>}
                {formErrors.industry && <p className="text-red-500 text-sm">{formErrors.industry}</p>}
                <Button type="submit">Create</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Mentions List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={tableData}
            searchPlaceholder="Search daily mentions..."
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((currentPage - 1) * mentionsPerPage + 1, totalCount)} to{' '}
                {Math.min(currentPage * mentionsPerPage, totalCount)} of {totalCount} entries
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
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
            <DialogTitle>View Daily Mention</DialogTitle>
          </DialogHeader>
          {selectedMention && (
            <div className="space-y-4">
              <div>
                <Label>Company</Label>
                <p>{selectedMention.company?.company_name || 'Unknown'}</p>
              </div>
              <div>
                <Label>Publication</Label>
                <p>{typeof selectedMention.publication === 'string' ? selectedMention.publication : selectedMention.publication?.name || 'Unknown'}</p>
              </div>
              <div>
                <Label>Date</Label>
                <p>
                  {selectedMention.date && !isNaN(new Date(selectedMention.date).getTime())
                    ? new Date(selectedMention.date).toLocaleDateString()
                    : 'Invalid Date'}
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <p>{selectedMention.status}</p>
              </div>
              {['industry', 'competitors', 'subsidiaries', 'passive', 'advert'].map((cat) => (
                <div key={cat}>
                  <Label>{cat.charAt(0).toUpperCase() + cat.slice(1)} Mentions</Label>
                  <div className="space-y-2 ml-4">
                    {(selectedMention[cat as keyof DailyMention] as MentionDetail[] || []).map((mention, idx) => (
                      <div key={idx} className="border p-2 rounded">
                        <p><strong>Headline:</strong> {mention.headline}</p>
                        <p><strong>Content:</strong> {mention.content || 'N/A'}</p>
                        <p><strong>Reporter:</strong> {mention.reporter || 'N/A'}</p>
                        <p><strong>Source:</strong> {mention.source || 'N/A'}</p>
                        <p><strong>Sentiment:</strong> {mention.sentiment}</p>
                        <p><strong>Page:</strong> {mention.page || 'N/A'}</p>
                        <p><strong>Publication Date:</strong> {mention.publication_date ? new Date(mention.publication_date).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>URLs:</strong></p>
                        <ul className="list-disc pl-5">
                          {mention.urls.map((url, uidx) => (
                            <li key={uidx}>
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
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
            <DialogTitle>Edit Daily Mention</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
            <div>
              <Label>Company <span className="text-red-500">*</span></Label>
              <Select
                value={formData.company_id?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, company_id: parseInt(value) })}
              >
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
              <Label>Publication <span className="text-red-500">*</span></Label>
              <Select value={formData.publication || ''} onValueChange={(value) => setFormData({ ...formData, publication: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select publication" />
                </SelectTrigger>
                <SelectContent>
                  {publications.map((publication) => (
                    <SelectItem key={publication.id} value={publication.name}>
                      {publication.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.publication && <p className="text-red-500 text-sm">{formErrors.publication}</p>}
            </div>
            <div>
              <Label>Date <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
              {formErrors.date && <p className="text-red-500 text-sm">{formErrors.date}</p>}
            </div>
            <div>
              <Label>Status <span className="text-red-500">*</span></Label>
              <Select value={formData.status || 'pending'} onValueChange={(value) => setFormData({ ...formData, status: value as 'pending' | 'approved' | 'rejected' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.status && <p className="text-red-500 text-sm">{formErrors.status}</p>}
            </div>
            {renderCategorySection('industry', 'Industry')}
            {renderCategorySection('competitors', 'Competitors')}
            {renderCategorySection('subsidiaries', 'Subsidiaries')}
            {renderCategorySection('passive', 'Passive')}
            {renderCategorySection('advert', 'Advert')}
            {formErrors.urls && <p className="text-red-500 text-sm">{formErrors.urls}</p>}
            {formErrors.industry && <p className="text-red-500 text-sm">{formErrors.industry}</p>}
            <Button type="submit">Update</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyMentionsTablePage;