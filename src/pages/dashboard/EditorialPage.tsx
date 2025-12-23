// EditorialPage.tsx - FIXED PAGINATION + SCROLLABLE TABLE
import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, FileSpreadsheet, RefreshCw, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Editorial {
  id: number;
  date: string;
  online_channel: string;
  source: string;
  company: {
    id: number;
    company_name: string;
    industry: string;
    sub_industry: string;
  };
  audience_reach: number;
  placement: string;
  language: string;
  ceo_thought_leadership: string | null;
  title: string;
  print_web_clips: string | null;
  reporter: string;
  country: string;
  spokesperson: string;
  activity: string;
  sentiment: string;
  sentiment_keyword_indicator: {
    id: number;
    keyword_indicator: string;
    sentiment_score: number;
    classification: string;
  };
  advert_spend: number;
  circulation: number;
  page_size: string;
  analyst_note: string | null;
  supervisor_note: string | null;
  admin_note: string | null;
  filename: string | null;
  original_name: string | null;
  file_path: string | null;
  file_size: string | null;
  mime_type: string | null;
  file_type: string | null;
  status?: string;
  company_data: {
    company_name: string;
  };
  creator_data?: { username: string; email: string };
  approver_data?: { username: string; email: string } | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const API_BASE = "https://pplus-alde.onrender.com/api";

const EditorialPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [editorials, setEditorials] = useState<Editorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const fetchEditorials = useCallback(async () => {
    if (!token || !user) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const role = user.role?.name || (typeof user.role === 'string' ? user.role : 'Analyst');

      let endpoint = `${API_BASE}/editorials`;
      if (role === 'Supervisor') {
        endpoint = `${API_BASE}/editorials/supervisor-mentions`;
      } else if (role === 'Analyst') {
        endpoint = `${API_BASE}/editorials/my-editorials`;
      }

      const safePage = Math.max(1, isNaN(pagination.page) ? 1 : pagination.page);
      const safeLimit = isNaN(pagination.limit) ? 10 : pagination.limit;

      const params = new URLSearchParams();
      params.append('page', safePage.toString());
      params.append('limit', safeLimit.toString());

      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const url = `${endpoint}?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch editorials`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch editorials");
      }

      let items: Editorial[] = [];
      let meta: Pagination = {
        total: 0,
        page: safePage,
        limit: safeLimit,
        totalPages: 1,
      };

      // Handle different response shapes
      if (Array.isArray(result.data)) {
        items = result.data;
        meta = result.pagination || {
          total: items.length,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(items.length / safeLimit),
        };
      } else if (result.data?.data && Array.isArray(result.data.data)) {
        items = result.data.data;
        const pag = result.data.pagination;
        meta = {
          total: pag.total,
          page: pag.page || pag.currentPage || safePage,
          limit: pag.limit || pag.pageSize || safeLimit,
          totalPages: pag.totalPages,
        };
      }

      setEditorials(items.filter(e => !e.is_deleted));
      setPagination(meta);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load editorials");
      toast.error(err.message || "Failed to load editorials");
      setEditorials([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, user, token, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchEditorials();
  }, [fetchEditorials]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this editorial?")) return;

    try {
      const response = await fetch(`${API_BASE}/editorials/delete/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error("Failed to delete editorial");

      toast.success("Editorial deleted successfully");
      fetchEditorials();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete editorial");
    }
  };

  const handleEdit = async (id: number) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/editorials/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch editorial");

      const result = await response.json();
      if (!result.success || !result.data) throw new Error("Invalid response");

      const data = result.data;

      navigate('/dashboard/editorial/create', {
        state: {
          editorialData: {
            id: data.id,
            date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
            company_id: data.company?.id || data.company_data?.id,
            online_channel: data.online_channel || '',
            source: data.source || '',
            title: data.title || '',
            audience_reach: data.audience_reach || 0,
            placement: data.placement || '',
            language: data.language || '',
            ceo_thought_leadership: data.ceo_thought_leadership || '',
            print_web_clips: data.print_web_clips || '',
            reporter: data.reporter || '',
            country: data.country || '',
            spokesperson: data.spokesperson || '',
            activity: data.activity || '',
            sentiment: data.sentiment || '',
            advert_spend: data.advert_spend || 0,
            circulation: data.circulation || 0,
            page_size: data.page_size || '',
            analyst_note: data.analyst_note || '',
            supervisor_note: data.supervisor_note || '',
            admin_note: data.admin_note || '',
          },
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Could not load editorial for editing");
    }
  };

  const handleCreate = () => {
    navigate('/dashboard/editorial/create');
  };

  const handleBatchUpload = () => {
    navigate('/dashboard/editorial/batch-upload');
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const columns = [
    {
      accessorKey: 'company_data.company_name',
      header: 'Company Name',
      cell: ({ row }: any) => row.original.company_data?.company_name || 'N/A',
    },
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'online_channel', header: 'Media Type' },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }: any) => {
        const date = new Date(row.original.date);
        return date.toLocaleDateString('en-GB');
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = (row.original.status || 'pending').toLowerCase();
        const colors: Record<string, string> = {
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800',
        };
        const color = colors[status] || 'bg-gray-100 text-gray-800';
        return (
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const editorial = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(editorial.id)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(editorial.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editorial</h1>
          <p className="text-gray-600 mt-1">Manage editorial content and media coverage</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchEditorials}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleBatchUpload}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Batch Upload
          </Button>
          <Button onClick={handleCreate} className="bg-indigo-950 hover:bg-indigo-800">
            <Plus className="mr-2 h-4 w-4" />
            Create Editorial
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border mb-6 shadow-sm">
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
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Main Table - Scrollable */}
      <div className="flex-1 border rounded-lg bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="mt-3 text-gray-500">Loading editorials...</p>
          </div>
        ) : editorials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <p className="text-lg">No editorials found</p>
            <p className="text-sm mt-2">Try creating one or adjusting filters</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[calc(100vh-320px)] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <DataTable columns={columns} data={editorials} />
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Showing{' '}
            {Math.max(1, (pagination.page - 1) * pagination.limit + 1)}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </div>
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
    </div>
  );
};

export default EditorialPage;