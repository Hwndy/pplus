// SwotMentionsPage.tsx
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, ArrowUpRight, AlertTriangle, Plus, Edit, Trash2, Eye, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SwotMentionForm } from '../../components/admin/SwotMentionForm';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from '@/components/auth/AuthContext';
import { useLocation } from 'react-router-dom'; // Added for dashboard navigation fix

interface SwotAnalysis {
  id: number;
  company_id: number;
  company: { company_name: string };
  date: string;
  strengths: { analysis: string }[];
  weaknesses: { analysis: string }[];
  opportunities: { analysis: string }[];
  threats: { analysis: string }[];
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
  const location = useLocation(); // Added to detect navigation from dashboard
  const [currentDate] = useState(new Date());
  const [swotData, setSwotData] = useState<SwotAnalysis[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSwot, setSelectedSwot] = useState<SwotAnalysis | null>(null);

  // === FIX: Auto-open edit dialog when navigated from Analyst Dashboard ===
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

  const fetchSwotData = async (page: number = 1) => {
    if (!token || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const role = user?.role?.name;

      const endpoint = role === 'Supervisor'
        ? 'https://pplus-alde.onrender.com/api/swot-analysis/supervisor-mentions'
        : role === 'Analyst'
        ? 'https://pplus-alde.onrender.com/api/swot-analysis/my-analysis'
        : 'https://pplus-alde.onrender.com/api/swot-analysis';

      const url = `${endpoint}?page=${page}&limit=10`;

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      console.log('API Response:', result);

      // Handle both response shapes:
      // - Analyst: { success: true, data: [...] }
      // - Supervisor/Admin: { success: true, data: { data: [...], pagination: {} } }
      const swotArray = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.data?.data)
        ? result.data.data
        : [];

      if (result.success && swotArray.length >= 0) {
        setSwotData(swotArray);

        const paginationInfo = result.data?.pagination || result.pagination || {
          total: swotArray.length,
          page: page,
          limit: 10,
          totalPages: Math.ceil(swotArray.length / 10) || 1,
        };

        setPagination(paginationInfo);
        setCurrentPage(paginationInfo.page || page);
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load SWOT mentions');
      setSwotData([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwotData(currentPage);
  }, [currentPage, user, token]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (pagination?.totalPages || 1) && page !== currentPage) {
      setCurrentPage(page);
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
      const response = await fetch(`https://pplus-alde.onrender.com/api/swot-analysis/delete/${swot.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Deleted successfully');
        fetchSwotData(currentPage);
      } else {
        toast.error(result.message || 'Delete failed');
      }
    } catch (error) {
      toast.error('Error deleting analysis');
    }
  };

  const handleFormClose = (refresh: boolean) => {
    if (refresh) fetchSwotData(currentPage);
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedSwot(null);
  };

  if (!user || !token) {
    return <div className="p-6 text-center">Please log in to continue.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">SWOT Mentions</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">
            {currentDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>

          {(user.role?.name === 'Admin' || user.role?.name === 'Analyst') && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create SWOT Mention
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Create SWOT Mention</DialogTitle>
                </DialogHeader>
                <SwotMentionForm onClose={handleFormClose} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading SWOT mentions...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Sn.</TableHead>
                  <TableHead>Company</TableHead>
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
                {swotData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground h-32">
                      No SWOT mentions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  swotData.map((swot, index) => (
                    <TableRow key={swot.id}>
                      <TableCell className="text-center">
                        {(currentPage - 1) * 10 + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {swot.company?.company_name || 'Unknown'}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="text-sm text-muted-foreground truncate">
                          {swot.strengths[0]?.analysis ||
                           swot.weaknesses[0]?.analysis ||
                           swot.opportunities[0]?.analysis ||
                           swot.threats[0]?.analysis ||
                           'No analysis'}
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(swot.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        {swot.updatedAt ? format(new Date(swot.updatedAt), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        {swot.creator_data?.username || 'Analyst'}
                      </TableCell>
                      <TableCell>
                        {swot.approver_data?.username || (swot.approved_by ? 'Supervisor' : '-')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={swot.status === 'approved' ? 'success' : 'secondary'} className="capitalize">
                          {swot.status}
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
                              <DropdownMenuItem onClick={() => handleDelete(swot)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
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
          )}
        </CardContent>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, pagination.total)} of {pagination.total} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-9"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl">
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
                <Badge variant={selectedSwot.status === 'approved' ? 'success' : 'secondary'}>
                  {selectedSwot.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['strengths', 'weaknesses', 'opportunities', 'threats'].map((section) => {
                  const items = selectedSwot[section as keyof SwotAnalysis] as { analysis: string }[];
                  const colors = {
                    strengths: 'green',
                    weaknesses: 'red',
                    opportunities: 'blue',
                    threats: 'yellow'
                  };
                  const icons = {
                    strengths: ThumbsUp,
                    weaknesses: ThumbsDown,
                    opportunities: ArrowUpRight,
                    threats: AlertTriangle
                  };
                  const Icon = icons[section as keyof typeof icons];
                  const color = colors[section as keyof typeof colors];

                  return (
                    <Card key={section}>
                      <CardHeader className={`bg-${color}-50 pb-3`}>
                        <div className="flex items-center gap-2">
                          <div className={`rounded-full bg-${color}-100 p-2`}>
                            <Icon className={`h-4 w-4 text-${color}-500`} />
                          </div>
                          <CardTitle className={`text-lg text-${color}-700 capitalize`}>
                            {section}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-3">
                          {items.length > 0 ? items.map((item, i) => (
                            <li key={i} className="text-sm">{item.analysis}</li>
                          )) : (
                            <li className="text-sm text-muted-foreground">No {section} added</li>
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

              <div className="flex justify-end gap-2">
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