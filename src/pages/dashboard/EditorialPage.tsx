import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FileSpreadsheet, RefreshCw, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';

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
}

const API_BASE = "https://pplus-5kdv.onrender.com/api";

const EditorialPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [editorials, setEditorials] = useState<Editorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const editorialsPerPage = 10;

  const fetchEditorials = async () => {
    if (!token || !user) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Select correct endpoint based on role
      const endpoint = user.role.name === 'Supervisor'
        ? `${API_BASE}/editorials/supervisor-mentions`
        : user.role.name === 'Analyst'
        ? `${API_BASE}/editorials/my-editorials`
        : `${API_BASE}/editorials`;

      const url = `${endpoint}?page=${currentPage}&limit=${editorialsPerPage}`;

      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch editorials`);
      }

      const result = await response.json();

      // Normalize response regardless of structure
      let items: Editorial[] = [];
      let meta = { total: 0, currentPage: 1, totalPage: 1, pageSize: 10 };

      if (result.success && result.data) {
        // Case 1: Admin endpoint → { editorial: [...], meta: {} }
        if (Array.isArray(result.data.editorial)) {
          items = result.data.editorial;
          meta = result.data.meta || meta;
        }
        // Case 2: Analyst/Supervisor → direct array in result.data
        else if (Array.isArray(result.data)) {
          items = result.data;
          meta = result.meta || meta;
        }
        // Case 3: Some endpoints return { data: [...], meta: {} }
        else if (Array.isArray(result.data.data)) {
          items = result.data.data;
          meta = result.data.meta || meta;
        }
      }

      setEditorials(items);
      setTotalPages(meta.totalPage || 1);
      setTotalItems(meta.total || 0);

      if (items.length === 0 && currentPage > 1) {
        setCurrentPage(1); // Reset to page 1 if current page is empty
      }

    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load editorials");
      toast.error(err.message || "Failed to load editorials");
      setEditorials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditorials();
  }, [currentPage, user, token]);

  const handleDelete = async (id: number) => {
    if (!token) return toast.error("Authentication required");

    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (editorial: Editorial) => {
    navigate('/dashboard/editorial/create', { state: { editorialData: editorial } });
  };

  const handleCreate = () => {
    navigate('/dashboard/editorial/create');
  };

  const handleBatchUpload = () => {
    navigate('/dashboard/editorial/batch-upload');
  };

  const columns = [
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'online_channel', header: 'Media Type' },
    { accessorKey: 'sentiment', header: 'Sentiment' },
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
        const status = (row.getValue('status') || 'pending').toLowerCase();
        const colors: Record<string, string> = {
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800',
        };
        const color = colors[status] || colors.pending;
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
            <Button variant="ghost" size="icon" onClick={() => handleEdit(editorial)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(editorial.id)}>
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
          <h1 className="text-2xl font-bold text-gray-900">Editorial</h1>
          <p className="text-gray-600 mt-1">Manage editorial content and media coverage</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchEditorials} disabled={loading}>
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

      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-hidden border rounded-lg bg-white">
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
          <DataTable columns={columns} data={editorials} />
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="text-gray-600">
          Showing {editorials.length} of {totalItems} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-3 text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditorialPage;