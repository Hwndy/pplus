import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OutcomeInsightForm } from '../../components/admin/OutcomeInsightForm';
import { Plus, Eye, Edit, Trash2, MoreHorizontal, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthContext';

interface OutcomeInsight {
  id: number;
  company_id: number;
  company: { company_name: string };
  date: string;
  social_media_engagement: { analysis: string }[] | null;
  brand_awareness: { analysis: string }[] | null;
  media_coverage: { analysis: string }[] | null;
  competitor_analysis: { analysis: string }[] | null;
  analyst_id: number | null;
  analyst: { username: string } | null;
  analyst_note: string | null;
  supervisor_note: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  is_deleted: boolean;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function OutcomeInsightsPage() {
  const { user, token } = useAuth(); // Use AuthContext to get user and token
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeInsight | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [outcomeInsights, setOutcomeInsights] = useState<OutcomeInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 });

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || ''}`,
  });

  // Utility function to ensure a value is an array
  const ensureArray = (value: any): { analysis: string }[] => {
    if (Array.isArray(value)) {
      return value;
    }
    return [];
  };

  const fetchOutcomeInsights = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      if (!token || !user) {
        throw new Error('Authentication required');
      }

      // Determine endpoint based on user role
      const endpoint = user.role.name === 'Supervisor'
        ? `https://pplus-nl5o.onrender.com/api/outcome-insights/supervisor-mentions?page=${page}&limit=${limit}`
        : user.role.name === 'Analyst'
        ? `https://pplus-nl5o.onrender.com/api/outcome-insights/my-insights?page=${page}&limit=${limit}`
        : `https://pplus-nl5o.onrender.com/api/outcome-insights?page=${page}&limit=${limit}`;

      const response = await fetch(endpoint, {
        headers: getAuthHeaders(),
      });
      const result = await response.json();
      if (result.success) {
        setOutcomeInsights(result.data.data || []);
        setPagination(result.data.pagination || { total: 0, page, limit, totalPages: 0 });
      } else {
        setError(result.message || 'Failed to fetch outcome insights');
        toast.error(result.message || 'Failed to fetch outcome insights');
      }
    } catch (err) {
      setError('Error fetching outcome insights');
      toast.error('Error fetching outcome insights');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutcomeInsights();
  }, [user, token]);

  const handleView = (outcome: OutcomeInsight) => {
    setSelectedOutcome(outcome);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (outcome: OutcomeInsight) => {
    setSelectedOutcome(outcome);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (outcome: OutcomeInsight) => {
    if (window.confirm(`Are you sure you want to delete the outcome insight for ${outcome.company.company_name}?`)) {
      try {
        const response = await fetch(`https://pplus-nl5o.onrender.com/api/outcome-insights/delete/${outcome.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
        });
        const result = await response.json();
        if (result.success) {
          toast.success('Outcome insight deleted successfully');
          fetchOutcomeInsights(pagination.page, pagination.limit);
        } else {
          toast.error(result.message || 'Failed to delete outcome insight');
        }
      } catch (error) {
        toast.error('Error deleting outcome insight');
        console.error(error);
      }
    }
  };

  const handleCreateOrUpdate = async (formData: any) => {
    const url = isEditMode && selectedOutcome?.id
      ? `/api/outcome-insights/update/${selectedOutcome.id}`
      : '/api/outcome-insights/create';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(`https://pplus-nl5o.onrender.com${url}`, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(isEditMode ? 'Outcome insight updated successfully' : 'Outcome insight created successfully');
        setIsDialogOpen(false);
        fetchOutcomeInsights(pagination.page, pagination.limit);
      } else {
        toast.error(result.message || `Failed to ${isEditMode ? 'update' : 'create'} outcome insight`);
      }
    } catch (error) {
      toast.error(`Error ${isEditMode ? 'updating' : 'creating'} outcome insight`);
      console.error(error);
    }
  };

  const handleCloseDialog = (refresh: boolean) => {
    if (refresh) fetchOutcomeInsights(pagination.page, pagination.limit);
    setIsDialogOpen(false);
    setSelectedOutcome(null);
    setIsEditMode(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Outcome & Insights</h1>
          <p className="text-gray-600 mt-1">Manage outcome analysis and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchOutcomeInsights(pagination.page, pagination.limit)} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Create Outcome
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Edit' : 'Create'} Outcome & Insight</DialogTitle>
              </DialogHeader>
              <OutcomeInsightForm
                onClose={handleCloseDialog}
                initialData={selectedOutcome ? {
                  id: selectedOutcome.id,
                  company_id: selectedOutcome.company_id,
                  date: selectedOutcome.date,
                  analystNote: selectedOutcome.analyst_note,
                  supervisorNote: selectedOutcome.supervisor_note,
                  social_media_engagement: selectedOutcome.social_media_engagement,
                  brand_awareness: selectedOutcome.brand_awareness,
                  media_coverage: selectedOutcome.media_coverage,
                  competitor_analysis: selectedOutcome.competitor_analysis,
                } : undefined}
                isEdit={isEditMode}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchOutcomeInsights(pagination.page, pagination.limit)} className="mt-2">
            Retry
          </Button>
        </div>
      )}

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Outcome & Insight Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Sn.</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Analysis</TableHead>
                  <TableHead>Creation Date</TableHead>
                  <TableHead>Last Edited</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading outcome insights...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : outcomeInsights.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="text-gray-500">
                        No outcome insights found. Create your first one!
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  outcomeInsights.filter(outcome => !outcome.is_deleted).map((outcome, index) => (
                    <TableRow key={outcome.id}>
                      <TableCell className="font-medium text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">{outcome.company.company_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {/* Replaced outcome.category with a fallback since it's not in the interface */}
                          General
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="text-sm text-muted-foreground truncate">
                          {[
                            ...ensureArray(outcome.social_media_engagement),
                            ...ensureArray(outcome.brand_awareness),
                            ...ensureArray(outcome.media_coverage),
                            ...ensureArray(outcome.competitor_analysis),
                          ].find(a => a?.analysis)?.analysis || 'No analysis provided'}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(outcome.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{outcome.updatedAt ? format(new Date(outcome.updatedAt), 'MMM d, yyyy') : 'N/A'}</TableCell>
                      <TableCell>{outcome.analyst?.username || 'Unknown'}</TableCell>
                      <TableCell>{outcome.supervisor_note ? 'Supervisor' : '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={outcome.status === 'approved' ? 'default' : outcome.status === 'pending' ? 'secondary' : 'outline'}
                          className="capitalize"
                        >
                          {outcome.status || 'draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(outcome)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(outcome)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(outcome)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchOutcomeInsights(pagination.page - 1, pagination.limit)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchOutcomeInsights(pagination.page + 1, pagination.limit)}
                  disabled={pagination.page === pagination.totalPages}
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
}