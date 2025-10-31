'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { OutcomeInsightForm } from '../../components/admin/OutcomeInsightForm';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface InsightItem {
  category: string;
  analysis: string;   // <-- UI uses “analysis”, backend expects “insight”
}

interface OutcomeInsight {
  id: number;
  company_id: number;
  company: { company_name: string };
  date: string;
  insights: InsightItem[];
  created_by: number;
  approved_by: number | null;
  analyst_note: string | null;
  supervisor_note: string | null;
  status: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string | null;
  creator_data: { username: string } | null;
  approver_data: { username: string } | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ------------------------------------------------------------------ */
/*                         READ-ONLY VIEW MODAL                        */
/* ------------------------------------------------------------------ */
function ViewOutcomeModal({
  outcome,
  onClose,
}: {
  outcome: OutcomeInsight;
  onClose: () => void;
}) {
  const grouped = outcome.insights.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item.analysis);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{outcome.company.company_name} – Outcome Insight</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><strong>Date:</strong> {format(new Date(outcome.date), 'MMM d, yyyy')}</div>
              <div><strong>Status:</strong>{' '}
                <Badge
                  variant={
                    outcome.status === 'approved'
                      ? 'default'
                      : outcome.status === 'pending'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {outcome.status}
                </Badge>
              </div>
              <div><strong>Created by:</strong> {outcome.creator_data?.username ?? '—'}</div>
              <div><strong>Approved by:</strong> {outcome.approver_data?.username ?? '—'}</div>
              <div><strong>Last edited:</strong>{' '}
                {outcome.updatedAt ? format(new Date(outcome.updatedAt), 'MMM d, yyyy') : '—'}
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              {Object.entries(grouped).map(([cat, analyses]) => (
                <div key={cat}>
                  <h4 className="font-semibold text-lg">{cat}</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                    {analyses.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {(outcome.analyst_note || outcome.supervisor_note) && (
              <>
                <Separator className="my-6" />
                <div className="space-y-3">
                  {outcome.analyst_note && (
                    <div>
                      <p className="font-medium">Analyst Note</p>
                      <p className="text-sm mt-1">{outcome.analyst_note}</p>
                    </div>
                  )}
                  {outcome.supervisor_note && (
                    <div>
                      <p className="font-medium">Supervisor Note</p>
                      <p className="text-sm mt-1">{outcome.supervisor_note}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*                           MAIN PAGE COMPONENT                      */
/* ------------------------------------------------------------------ */
export default function OutcomeInsightsPage() {
  const { user, token } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeInsight | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [outcomeInsights, setOutcomeInsights] = useState<OutcomeInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const BASE_URL = 'https://pplus-t71x.onrender.com/api';
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token ?? ''}`,
  });

  /* --------------------------- FETCH --------------------------- */
  const fetchOutcomeInsights = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      if (!token || !user) throw new Error('Authentication required');

      const role = typeof user.role === 'string' ? user.role : user.role?.name;
      let endpoint = `${BASE_URL}/outcome-insights?page=${page}&limit=${limit}`;

      if (role === 'Supervisor')
        endpoint = `${BASE_URL}/outcome-insights/supervisor-mentions?page=${page}&limit=${limit}`;
      else if (role === 'Analyst')
        endpoint = `${BASE_URL}/outcome-insights/my-insights?page=${page}&limit=${limit}`;

      const res = await fetch(endpoint, { headers: getAuthHeaders() });
      const json = await res.json();

      if (json.success) {
        setOutcomeInsights(json.data.data ?? []);
        setPagination(json.data.pagination ?? { total: 0, page, limit, totalPages: 0 });
      } else {
        throw new Error(json.message ?? 'Failed');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutcomeInsights();
  }, [user, token]);

  /* --------------------------- EDIT LOGIC --------------------------- */
  const handleEdit = (outcome: OutcomeInsight) => {
    setSelectedOutcome(outcome);
    setIsEditMode(true);
    setIsCreateOpen(true);
  };

  const handleCloseForm = (refresh: boolean = false) => {
    setIsCreateOpen(false);
    setIsEditMode(false);
    setSelectedOutcome(null);
    if (refresh) fetchOutcomeInsights(pagination.page, pagination.limit);
  };

  // --------------------------------------------------------------
  //  Convert backend shape → form shape
  // --------------------------------------------------------------
  const getFormInitialData = (outcome: OutcomeInsight) => ({
    id: outcome.id,
    company_id: outcome.company_id,
    date: outcome.date.split('T')[0],
    insights: outcome.insights.map(i => ({
      category: i.category,
      analysis: i.analysis,   // <-- UI uses `analysis`
    })),
    analyst_note: outcome.analyst_note || '',
    supervisor_note: outcome.supervisor_note || '',
  });

  /* --------------------------- CREATE / UPDATE --------------------------- */
  const handleCreateOrUpdate = async (formData: any) => {
    const isEdit = isEditMode && selectedOutcome?.id;
    const url = isEdit
      ? `${BASE_URL}/outcome-insights/update/${selectedOutcome!.id}`
      : `${BASE_URL}/outcome-insights/create`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(isEdit ? 'Updated successfully' : 'Created successfully');
        handleCloseForm(true);
      } else {
        toast.error(json.message ?? 'Operation failed');
      }
    } catch {
      toast.error(`Error ${isEdit ? 'updating' : 'creating'}`);
    }
  };

  /* --------------------------- RENDER --------------------------- */
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Outcome & Insights</h1>
          <p className="text-gray-600 mt-1">Manage outcome analysis and insights</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchOutcomeInsights(pagination.page, pagination.limit)}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* CREATE / EDIT DIALOG */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Create Outcome
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
              <DialogHeader className="px-6 pt-6 pb-4 border-b">
                <DialogTitle>{isEditMode ? 'Edit' : 'Create'} Outcome & Insight</DialogTitle>
              </DialogHeader>

              <ScrollArea className="flex-1 px-6 py-4">
                <OutcomeInsightForm
                  key={selectedOutcome?.id ?? 'new'}   // remount on edit
                  onClose={handleCloseForm}
                  initialData={selectedOutcome ? getFormInitialData(selectedOutcome) : undefined}
                  isEdit={isEditMode}
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchOutcomeInsights()} className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {/* Table */}
      <Card className="border shadow-sm">
        <CardHeader><CardTitle>Outcome & Insight Entries</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Sn.</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Analyses</TableHead>
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
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : outcomeInsights.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No insights found.
                    </TableCell>
                  </TableRow>
                ) : (
                  outcomeInsights
                    .filter(o => !o.is_deleted)
                    .map((o, i) => {
                      const categories = o.insights.map(x => x.category).join(', ');
                      const analyses = o.insights.map(x => x.analysis).join(' • ');
                      return (
                        <TableRow key={o.id}>
                          <TableCell className="text-center font-medium">
                            {i + 1 + (pagination.page - 1) * pagination.limit}
                          </TableCell>
                          <TableCell className="font-medium">{o.company.company_name}</TableCell>
                          <TableCell>
                            <span className="text-xs">{categories || '—'}</span>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            <span className="text-sm text-muted-foreground">
                              {analyses || 'No analysis'}
                            </span>
                          </TableCell>
                          <TableCell>{format(new Date(o.createdAt), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{o.updatedAt ? format(new Date(o.updatedAt), 'MMM d, yyyy') : '—'}</TableCell>
                          <TableCell>{o.creator_data?.username ?? '—'}</TableCell>
                          <TableCell>{o.approver_data?.username ?? '—'}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                o.status === 'approved'
                                  ? 'default'
                                  : o.status === 'pending'
                                  ? 'secondary'
                                  : 'outline'
                              }
                              className="capitalize"
                            >
                              {o.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOutcome(o);
                                  setIsViewOpen(true);
                                }}
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
                                  <DropdownMenuItem onClick={() => handleEdit(o)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      if (window.confirm(`Delete insight for ${o.company.company_name}?`)) {
                                        fetch(`${BASE_URL}/outcome-insights/update/${o.id}`, {
                                          method: 'PUT',
                                          headers: getAuthHeaders(),
                                          body: JSON.stringify({ is_deleted: true }),
                                        })
                                          .then(r => r.json())
                                          .then(j => {
                                            if (j.success) {
                                              toast.success('Insight deleted');
                                              fetchOutcomeInsights(pagination.page, pagination.limit);
                                            } else {
                                              toast.error(j.message ?? 'Delete failed');
                                            }
                                          })
                                          .catch(() => toast.error('Network error'));
                                      }
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchOutcomeInsights(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchOutcomeInsights(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* VIEW MODAL */}
      {isViewOpen && selectedOutcome && (
        <ViewOutcomeModal outcome={selectedOutcome} onClose={() => setIsViewOpen(false)} />
      )}
    </div>
  );
}