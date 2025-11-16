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
  analysis: string;
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
/*                         BEAUTIFUL VIEW MODAL                        */
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
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b pb-6">
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            <span>{outcome.company.company_name}</span>
            <Badge variant="outline" className="text-lg px-4">
              Outcome & Insight
            </Badge>
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-2">
            ID: <span className="font-mono">{outcome.id}</span> • 
            Created by <strong>{outcome.creator_data?.username || '—'}</strong> • 
            {format(new Date(outcome.date), 'MMMM d, yyyy')}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-6">
          <div className="space-y-10">

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm bg-gray-50 p-6 rounded-lg">
              <div>
                <strong className="text-gray-600">Status</strong>
                <div className="mt-2">
                  <Badge
                    variant={
                      outcome.status === 'approved' ? 'default' :
                      outcome.status === 'pending' ? 'secondary' :
                      'destructive'
                    }
                    className="text-lg"
                  >
                    {outcome.status.charAt(0).toUpperCase() + outcome.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div>
                <strong className="text-gray-600">Created</strong>
                <p className="mt-2">{format(new Date(outcome.createdAt), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <strong className="text-gray-600">Last Edited</strong>
                <p className="mt-2">
                  {outcome.updatedAt ? format(new Date(outcome.updatedAt), 'MMM d, yyyy') : '—'}
                </p>
              </div>
              <div>
                <strong className="text-gray-600">Approved By</strong>
                <p className="mt-2 font-medium">
                  {outcome.approver_data?.username || '—'}
                </p>
              </div>
            </div>

            {/* Insights */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-indigo-700">Insights by Category</h3>
              <div className="space-y-8">
                {Object.entries(grouped).map(([category, analyses]) => (
                  <Card key={category} className="border-2 hover:border-indigo-300 transition-all">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-indigo-900">
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analyses.map((analysis, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="text-indigo-600 mt-1">•</span>
                            <span className="text-gray-700 leading-relaxed">{analysis}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Notes */}
            {(outcome.analyst_note || outcome.supervisor_note) && (
              <div className="space-y-6 border-t pt-8">
                <h3 className="text-xl font-semibold text-indigo-700">Notes</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {outcome.analyst_note && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Analyst Note</label>
                      <div className="mt-3 p-5 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-gray-800 leading-relaxed">{outcome.analyst_note}</p>
                      </div>
                    </div>
                  )}
                  {outcome.supervisor_note && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Supervisor Note</label>
                      <div className="mt-3 p-5 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-gray-800 leading-relaxed">{outcome.supervisor_note}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={onClose} size="lg">
            Close
          </Button>
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

  const BASE_URL = 'https://pplus-e31a.onrender.com/api';

  const fetchOutcomeInsights = async (page = 1, limit = 10) => {
    if (!user || !token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const role = user.role?.name || user.role;
      let endpoint = `${BASE_URL}/outcome-insights`;

      if (role === 'Supervisor')
        endpoint = `${BASE_URL}/outcome-insights/supervisor-mentions`;
      else if (role === 'Analyst')
        endpoint = `${BASE_URL}/outcome-insights/my-insights`;

      const url = `${endpoint}?page=${page}&limit=${limit}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      let items: OutcomeInsight[] = [];
      let meta: Pagination = { total: 0, page, limit, totalPages: 0 };

      if (json.success && json.data) {
        // Admin: { data: { data: [...], pagination: {} } }
        if (json.data.data && Array.isArray(json.data.data)) {
          items = json.data.data;
          meta = json.data.pagination || meta;
        }
        // Analyst/Supervisor: { data: [...] }
        else if (Array.isArray(json.data)) {
          items = json.data;
          meta = json.pagination || { total: items.length, page, limit, totalPages: Math.ceil(items.length / limit) };
        }
      }

      setOutcomeInsights(items.filter(o => !o.is_deleted));
      setPagination(meta);

    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load insights');
      toast.error(err.message || 'Failed to load insights');
      setOutcomeInsights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutcomeInsights(1, 10);
  }, [user, token]);

  useEffect(() => {
    fetchOutcomeInsights(pagination.page, pagination.limit);
  }, [pagination.page]);

  const handleEdit = (outcome: OutcomeInsight) => {
    setSelectedOutcome(outcome);
    setIsEditMode(true);
    setIsCreateOpen(true);
  };

  const handleCloseForm = (refresh = false) => {
    setIsCreateOpen(false);
    setIsEditMode(false);
    setSelectedOutcome(null);
    if (refresh) fetchOutcomeInsights(pagination.page, pagination.limit);
  };

  const getFormInitialData = (outcome: OutcomeInsight) => ({
    id: outcome.id,
    company_id: outcome.company_id,
    date: outcome.date.split('T')[0],
    insights: outcome.insights.map(i => ({
      category: i.category,
      analysis: i.analysis,
    })),
    analyst_note: outcome.analyst_note || '',
    supervisor_note: outcome.supervisor_note || '',
  });

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Outcome & Insights</h1>
          <p className="text-gray-600 mt-1">Strategic analysis and actionable recommendations</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => fetchOutcomeInsights(pagination.page, pagination.limit)}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-950 hover:bg-indigo-800">
                <Plus className="mr-2 h-4 w-4" />
                Create Insight
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Edit' : 'Create'} Outcome & Insight</DialogTitle>
              </DialogHeader>
              <ScrollArea className="mt-4">
                <OutcomeInsightForm
                  key={selectedOutcome?.id ?? 'new'}
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <Button variant="outline" size="sm" onClick={() => fetchOutcomeInsights()} className="ml-4">
            Retry
          </Button>
        </div>
      )}

      {/* Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S/N</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Key Insights</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16">
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        <span>Loading insights...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : outcomeInsights.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16 text-gray-500">
                      <p className="text-lg font-medium">No insights found</p>
                      <p className="text-sm mt-2">Create your first outcome insight</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  outcomeInsights.map((o, i) => {
                    const categories = o.insights.map(x => x.category).slice(0, 2).join(', ');
                    const more = o.insights.length > 2 ? ` +${o.insights.length - 2} more` : '';
                    return (
                      <TableRow key={o.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {(pagination.page - 1) * pagination.limit + i + 1}
                        </TableCell>
                        <TableCell className="font-medium">{o.company.company_name}</TableCell>
                        <TableCell className="text-sm">
                          {categories}{more && <span className="text-gray-500">{more}</span>}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {o.insights[0]?.analysis || 'No analysis'}
                          </p>
                        </TableCell>
                        <TableCell>{format(new Date(o.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              o.status === 'approved' ? 'default' :
                              o.status === 'pending' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{o.creator_data?.username || '—'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedOutcome(o);
                                setIsViewOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(o)}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (confirm(`Delete insight for ${o.company.company_name}?`)) {
                                      fetch(`${BASE_URL}/outcome-insights/update/${o.id}`, {
                                        method: 'PUT',
                                        headers: {
                                          'Authorization': `Bearer ${token}`,
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({ is_deleted: true }),
                                      })
                                        .then(r => r.json())
                                        .then(j => {
                                          if (j.success) {
                                            toast.success('Deleted');
                                            fetchOutcomeInsights(pagination.page, pagination.limit);
                                          }
                                        });
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 text-sm">
              <p className="text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="px-4 py-2 bg-gray-100 rounded-md">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
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