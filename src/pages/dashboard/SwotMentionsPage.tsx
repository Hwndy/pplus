// SwotMentionsPage.tsx - UPDATED: Role-based Create & Delete Controls
import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  ThumbsUp,
  ThumbsDown,
  ArrowUpRight,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SwotMentionForm } from '../../components/admin/SwotMentionForm';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from '@/components/auth/AuthContext';
import { useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SwotItem {
  analysis: string;
}

interface SwotAnalysis {
  id: number;
  company_id: number;
  company: { company_name: string };
  date: string;
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  status: string;
  createdAt: string;
  updatedAt: string | null;
  analyst_note: string | null;
  supervisor_note: string | null;
  created_by: number;
  approved_by: number | null;
  creator_data?: { username: string; email: string };
  approver_data?: { username: string; email: string } | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function SwotMentionsPage() {
  const { user, token } = useAuth();
  const location = useLocation();
  const [currentDate] = useState(new Date());

  // Role detection
  const userRole = user?.role?.name || (typeof user?.role === 'string' ? user.role : 'Analyst');
  const isAdmin = userRole === 'Admin';
  const isSupervisor = userRole === 'Supervisor';
  const isAnalyst = userRole === 'Analyst';

  // Permissions
  const showCreateButton = isAnalyst; // Only Analysts can create
  const showDeleteOption = isAdmin;   // Only Admins can delete

  const [swotData, setSwotData] = useState<SwotAnalysis[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSwot, setSelectedSwot] = useState<SwotAnalysis | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Auto-open edit dialog when navigated from dashboard
  useEffect(() => {
    if (location.state?.editData) {
      setSelectedSwot(location.state.editData);
      setEditDialogOpen(true);
    }
  }, [location.state]);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || ''}`,
  });

  const fetchSwotData = useCallback(async (page: number = 1, limit: number = 10) => {
    if (!token || !user) {
      setError('Please log in to continue');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let endpoint = 'https://pplus-g19c.onrender.com/api/v1/swot-analysis';

      if (isSupervisor) {
        endpoint = 'https://pplus-g19c.onrender.com/api/v1/swot-analysis/supervisor-mentions';
      } else if (isAnalyst) {
        endpoint = 'https://pplus-g19c.onrender.com/api/v1/swot-analysis/my-analysis';
      }

      const safePage = isNaN(page) || page < 1 ? 1 : page;

      const params = new URLSearchParams();
      params.append('page', safePage.toString());
      params.append('limit', limit.toString());

      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const url = `${endpoint}?${params.toString()}`;

      const response = await fetch(url, { headers: getAuthHeaders() });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();

      let items: SwotAnalysis[] = [];
      let meta: Pagination = { total: 0, page: safePage, limit, totalPages: 0 };

      if (result.success && result.data) {
        if (Array.isArray(result.data.data)) {
          items = result.data.data;
          meta = {
            total: result.data.pagination.total,
            page: result.data.pagination.currentPage,
            limit: result.data.pagination.pageSize,
            totalPages: result.data.pagination.totalPages,
          };
        } else if (Array.isArray(result.data)) {
          items = result.data;
          meta = result.pagination || {
            total: items.length,
            page: safePage,
            limit,
            totalPages: Math.ceil(items.length / limit),
          };
        }
      } else {
        throw new Error(result.message || 'Invalid response format');
      }

      setSwotData(items);
      setPagination(meta);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load SWOT mentions');
      toast.error(err.message || 'Failed to load SWOT mentions');
      setSwotData([]);
    } finally {
      setLoading(false);
    }
  }, [user, token, statusFilter, dateFrom, dateTo, isSupervisor, isAnalyst]);

  // Initial fetch + refetch on filter/page change
  useEffect(() => {
    fetchSwotData(pagination.page, pagination.limit);
  }, [fetchSwotData, pagination.page, pagination.limit]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (pagination.totalPages || 1)) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleEdit = (swot: SwotAnalysis) => {
    setSelectedSwot(swot);
    setEditDialogOpen(true);
  };

  const handleView = (swot: SwotAnalysis) => {
    setSelectedSwot(swot);
    setViewDialogOpen(true);
  };

  const handleDelete = async (swot: SwotAnalysis) => {
    if (!window.confirm(`Delete SWOT analysis for ${swot.company.company_name}?`)) return;

    try {
      const response = await fetch(`https://pplus-g19c.onrender.com/api/v1/swot-analysis/delete/${swot.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Deleted successfully');
        fetchSwotData(pagination.page, pagination.limit);
      } else {
        toast.error(result.message || 'Delete failed');
      }
    } catch (error) {
      toast.error('Error deleting analysis');
    }
  };

  const handleFormClose = (refresh: boolean = false) => {
    if (refresh) fetchSwotData(pagination.page, pagination.limit);
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedSwot(null);
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (!user || !token) {
    return <div className="p-6 text-center text-red-600">Please log in to continue.</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SWOT Mentions</h1>
          <p className="text-gray-600 mt-1">Strategic analysis of Strengths, Weaknesses, Opportunities & Threats</p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {currentDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => fetchSwotData(pagination.page, pagination.limit)}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            {showCreateButton && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-950 hover:bg-indigo-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Create SWOT Mention
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create SWOT Mention</DialogTitle>
                  </DialogHeader>
                  <SwotMentionForm onClose={handleFormClose} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="swot-status">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                <SelectTrigger id="swot-status">
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
              <Label htmlFor="swot-dateFrom">Date From</Label>
              <Input
                id="swot-dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>

            <div>
              <Label htmlFor="swot-dateTo">Date To</Label>
              <Input
                id="swot-dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
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

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Main Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All SWOT Mentions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              Loading SWOT mentions...
            </div>
          ) : swotData.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No SWOT mentions found. Create one or adjust filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Analysis Preview</TableHead>
                  <TableHead>Creation Date</TableHead>
                  <TableHead>Last Edited</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {swotData.map((swot) => (
                  <TableRow key={swot.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {swot.company?.company_name || 'Unknown'}
                    </TableCell>
                    <TableCell className="max-w-[320px]">
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {swot.strengths[0]?.analysis ||
                         swot.weaknesses[0]?.analysis ||
                         swot.opportunities[0]?.analysis ||
                         swot.threats[0]?.analysis ||
                         'No analysis available'}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(swot.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {swot.updatedAt ? format(new Date(swot.updatedAt), 'MMM d, yyyy') : '—'}
                    </TableCell>
                    <TableCell>{swot.creator_data?.username || 'Analyst'}</TableCell>
                    <TableCell>
                      {swot.approver_data?.username || (swot.approved_by ? 'Supervisor' : '—')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          swot.status === 'approved' ? 'default' :
                          swot.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }
                        className="capitalize"
                      >
                        {swot.status || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleView(swot)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(swot)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            {showDeleteOption && (
                              <DropdownMenuItem
                                onClick={() => handleDelete(swot)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
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
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || loading}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit SWOT Mention</DialogTitle>
          </DialogHeader>
          {selectedSwot && (
            <SwotMentionForm
              onClose={handleFormClose}
              initialData={{
                id: String(selectedSwot.id),
                company_id: selectedSwot.company_id,
                date: new Date(selectedSwot.date).toISOString().split('T')[0],
                strengths: selectedSwot.strengths,
                weaknesses: selectedSwot.weaknesses,
                opportunities: selectedSwot.opportunities,
                threats: selectedSwot.threats,
                analyst_note: selectedSwot.analyst_note,
                supervisor_note: selectedSwot.supervisor_note,
              }}
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>SWOT Analysis for {selectedSwot?.company?.company_name}</DialogTitle>
          </DialogHeader>
          {selectedSwot && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Date: {format(new Date(selectedSwot.date), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created: {format(new Date(selectedSwot.createdAt), 'MMMM d, yyyy')}
                  </p>
                </div>
                <Badge
                  variant={selectedSwot.status === 'approved' ? 'default' : 'secondary'}
                >
                  {selectedSwot.status || 'Pending'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(['strengths', 'weaknesses', 'opportunities', 'threats'] as const).map((section) => {
                  const items = selectedSwot[section] as SwotItem[];
                  const colors = {
                    strengths: 'green',
                    weaknesses: 'red',
                    opportunities: 'blue',
                    threats: 'yellow',
                  };
                  const icons = {
                    strengths: ThumbsUp,
                    weaknesses: ThumbsDown,
                    opportunities: ArrowUpRight,
                    threats: AlertTriangle,
                  };
                  const Icon = icons[section];
                  const color = colors[section];

                  return (
                    <Card key={section} className="border-2 hover:border-gray-300 transition-all">
                      <CardHeader className={`bg-${color}-50 pb-3`}>
                        <div className="flex items-center gap-2">
                          <div className={`rounded-full bg-${color}-100 p-2`}>
                            <Icon className={`h-4 w-4 text-${color}-600`} />
                          </div>
                          <CardTitle className={`text-lg text-${color}-700 capitalize`}>
                            {section}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-3">
                          {items.length > 0 ? (
                            items.map((item, i) => (
                              <li key={i} className="text-sm leading-relaxed">{item.analysis}</li>
                            ))
                          ) : (
                            <li className="text-sm text-muted-foreground italic">No {section} added</li>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {(selectedSwot.analyst_note || selectedSwot.supervisor_note) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedSwot.analyst_note && (
                    <Card>
                      <CardHeader><CardTitle className="text-base">Analyst Note</CardTitle></CardHeader>
                      <CardContent><p className="text-sm">{selectedSwot.analyst_note}</p></CardContent>
                    </Card>
                  )}
                  {selectedSwot.supervisor_note && (
                    <Card>
                      <CardHeader><CardTitle className="text-base">Supervisor Note</CardTitle></CardHeader>
                      <CardContent><p className="text-sm">{selectedSwot.supervisor_note}</p></CardContent>
                    </Card>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
                <Button onClick={() => { setViewDialogOpen(false); handleEdit(selectedSwot); }}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}