import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FileSpreadsheet, RefreshCw, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
// Update the import path to the correct location of AuthContext
// import { useAuth } from '@/contexts/AuthContext'; // Import useAuth from AuthContext
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
  ceo_media_presence: string | null;
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
  is_deleted: boolean;
  status?: string;
}

const API_BASE = "https://backend-e79r.onrender.com/api";

const EditorialPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth(); // Use AuthContext to get user and token
  const [editorials, setEditorials] = useState<Editorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const editorialsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchEditorials = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token || !user) {
        throw new Error('Authentication required');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Determine endpoint based on user role
      const endpoint = user.role.name === 'Supervisor'
        ? `${API_BASE}/editorials/supervisor-mentions?page=${currentPage}&limit=${editorialsPerPage}`
        : user.role.name === 'Analyst'
        ? `${API_BASE}/editorials/my-editorials?page=${currentPage}&limit=${editorialsPerPage}`
        : `${API_BASE}/editorials?page=${currentPage}&limit=${editorialsPerPage}`;

      const response = await fetch(endpoint, { headers });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setEditorials(result.data.editorial || []);
      setTotalPages(result.data.meta?.totalPage || 1);
      setTotalItems(result.data.meta?.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch editorials');
      setEditorials([]);
      toast.error(err.message || 'Failed to fetch editorials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditorials();
  }, [currentPage, user, token]); // Add user and token to dependencies

  const handleDelete = async (id: number) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }
    try {
      setLoading(true);
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const response = await fetch(`${API_BASE}/editorials/delete/${id}`, {
        method: 'PUT',
        headers,
      });
      if (!response.ok) {
        throw new Error('Failed to delete editorial');
      }
      toast.success('Editorial deleted successfully');
      fetchEditorials();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete editorial');
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
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status') || 'Pending';
        let statusColor = '';
        switch(status.toLowerCase()) {
          case 'approved': statusColor = 'bg-green-100 text-green-800'; break;
          case 'rejected': statusColor = 'bg-red-100 text-red-800'; break;
          case 'pending': default: statusColor = 'bg-yellow-100 text-yellow-800'; break;
        }
        return (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
            {status}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const editorial = row.original;
        return (
          <div className="flex space-x-2">
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

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Editorial</h1>
          <p className="text-gray-600 mt-1">Manage editorial content and media coverage</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchEditorials} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleBatchUpload}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Batch Upload
          </Button>
          <Button onClick={handleCreate} className="bg-indigo-950">
            <Plus className="mr-2 h-4 w-4" />
            Create Editorial
          </Button>
        </div>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">Error loading editorials: {error}</p>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-gray-500">Loading editorials...</p>
            </div>
          </div>
        ) : (
          <DataTable columns={columns} data={editorials} />
        )}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {editorials.length} of {totalItems} entries
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditorialPage;