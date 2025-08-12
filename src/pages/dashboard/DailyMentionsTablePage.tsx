import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import type { DailyMention } from '@/services/apiService';

const DailyMentionsTablePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dailyMentions, setDailyMentions] = useState<DailyMention[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const mentionsPerPage = 10;

  // Fetch daily mentions data
  useEffect(() => {
    const fetchDailyMentions = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDailyMentions();
        
        // Handle both array and object responses
        const mentionsData = Array.isArray(response.data) ? response.data : (response.data?.mentions || []);
        setDailyMentions(mentionsData);
      } catch (error) {
        console.error('Error fetching daily mentions:', error);
        toast({
          title: "Error",
          description: "Failed to load daily mentions",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDailyMentions();
  }, [toast]);

  // Handle create new
  const handleCreateNew = () => {
    navigate('/dashboard/daily-mentions/create');
  };

  // Handle view
  const handleView = (mention: DailyMention) => {
    navigate(`/dashboard/daily-mentions/view/${mention.id}`);
  };

  // Handle edit
  const handleEdit = (mention: DailyMention) => {
    navigate('/dashboard/daily-mentions/create', { state: { mentionData: mention } });
  };

  // Handle delete
  const handleDelete = async (mention: DailyMention) => {
    if (window.confirm('Are you sure you want to delete this daily mention?')) {
      try {
        await apiService.deleteDailyMention(mention.id);
        setDailyMentions(prev => prev.filter(m => m.id !== mention.id));
        toast({
          title: "Success",
          description: "Daily mention deleted successfully"
        });
      } catch (error) {
        console.error('Error deleting daily mention:', error);
        toast({
          title: "Error",
          description: "Failed to delete daily mention",
          variant: "destructive"
        });
      }
    }
  };

  // Table columns similar to editorial page
  const columns: ColumnDef<DailyMention>[] = [
    {
      accessorKey: 'company',
      header: 'Company',
      cell: ({ row }) => row.getValue('company') || 'Unknown',
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => row.getValue('title') || 'Untitled',
    },
    {
      accessorKey: 'publication',
      header: 'Publication',
      cell: ({ row }) => row.getValue('publication') || 'Unknown',
    },
    {
      accessorKey: 'sentiment',
      header: 'Sentiment',
      cell: ({ row }) => {
        const sentiment = row.getValue('sentiment') as string;
        let sentimentColor = '';
        
        switch(sentiment?.toLowerCase()) {
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

        return (
          <Badge className={sentimentColor}>
            {sentiment || 'Neutral'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = row.getValue('date') as string;
        return date ? new Date(date).toLocaleDateString() : 'Unknown';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') || 'Pending';
        let statusColor = '';

        switch(status) {
          case 'Approved':
            statusColor = 'bg-green-100 text-green-800';
            break;
          case 'Rejected':
            statusColor = 'bg-red-100 text-red-800';
            break;
          case 'Pending':
          default:
            statusColor = 'bg-yellow-100 text-yellow-800';
        }

        return (
          <Badge className={statusColor}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.original)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Pagination
  const totalPages = Math.ceil(dailyMentions.length / mentionsPerPage);
  const startIndex = (currentPage - 1) * mentionsPerPage;
  const endIndex = startIndex + mentionsPerPage;
  const currentMentions = dailyMentions.slice(startIndex, endIndex);

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
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Mentions List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={currentMentions}
            searchPlaceholder="Search daily mentions..."
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, dailyMentions.length)} of {dailyMentions.length} entries
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyMentionsTablePage;
