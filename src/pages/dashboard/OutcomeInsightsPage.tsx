'use client';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Filter,
  Check,
  ChevronsUpDown,
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
import { useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';

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
  created_by: string;
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

interface CategoryValue {
  value: string;
}

// Multi-select category combobox
const CategoryCombobox: React.FC<{
  categories: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}> = ({ categories, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between">
          {selected.length > 0 ? `${selected.length} selected` : 'Select categories...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {categories.map((category) => (
              <CommandItem
                key={category}
                value={category}
                onSelect={() => {
                  onChange(
                    selected.includes(category)
                      ? selected.filter((c) => c !== category)
                      : [...selected, category]
                  );
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${selected.includes(category) ? 'opacity-100' : 'opacity-0'}`}
                />
                {category}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

/* ------------------------------------------------------------------ */
/* BEAUTIFUL VIEW MODAL */
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
            <Badge variant="outline" className="text-lg px-4">Outcome & Insight</Badge>
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-2">
            ID: <span className="font-mono">{outcome.id}</span> •
            Created by <strong>{outcome.creator_data?.username || '—'}</strong> •
            {format(new Date(outcome.date), 'MMMM d, yyyy')}
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-6">
          <div className="space-y-10">
            {/* Metadata Grid */}
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

            {/* Insights by Category */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-indigo-700">Insights by Category</h3>
              <div className="space-y-8">
                {Object.entries(grouped).map(([category, analyses]) => (
                  <Card key={category} className="border-2 hover:border-indigo-300 transition-all">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-indigo-900">{category}</CardTitle>
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

        <Button variant="outline" onClick={onClose} size="lg" className="mt-4">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN PAGE COMPONENT */
/* ------------------------------------------------------------------ */
export default function OutcomeInsightsPage() {
  const { user, token } = useAuth();
  const location = useLocation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeInsight | null>(null);
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

  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [insights, setInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const BASE_URL = 'https://pplus-oez4.onrender.com/api';
  const INSIGHTS_API = 'https://pplus-oez4.onrender.com/api/data-parameters/category/Insights';

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;
      setLoadingCategories(true);
      try {
        const res = await fetch(`${BASE_URL}/data-parameters/categories?page=1&limit=2000`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch categories');
        const json = await res.json();
        if (json.success && json.data?.data) {
          const allValues = json.data.data
            .flatMap((cat: any) => cat.values || [])
            .map((v: CategoryValue) => v.value)
            .filter(Boolean);
          setCategories(allValues);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        toast.error('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [token]);

  useEffect(() => {
  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const response = await fetch(INSIGHTS_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        // Extract values from the nested structure
        const categories = data.data[0].categories;
        if (categories && categories.length > 0) {
          const values = categories[0].values.map(v => v.value);
          setInsights(values);
        }
      }
    } catch (error) {
      console.error('Error fetching sector titles:', error);
      // Optionally show error toast/notification
    } finally {
      setLoadingInsights(false);
    }
  };

  fetchInsights();
}, []);


  // Auto-open edit modal if navigated with state
  useEffect(() => {
    if (location.state?.editData) {
      setSelectedOutcome(location.state.editData);
      setIsEditModalOpen(true);
    }
  }, [location.state]);

  const handleCreateNew = useCallback(() => {
    setSelectedOutcome(null);
    setIsCreateModalOpen(true);
  }, []);

  const handleEdit = useCallback((outcome: OutcomeInsight) => {
    setSelectedOutcome(outcome);
    setIsEditModalOpen(true);
  }, []);

  const handleCloseCreate = useCallback((refresh = false) => {
    setIsCreateModalOpen(false);
    if (refresh) fetchOutcomeInsights(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  const handleCloseEdit = useCallback((refresh = false) => {
    setIsEditModalOpen(false);
    setSelectedOutcome(null);
    if (refresh) fetchOutcomeInsights(pagination.page, pagination.limit);
  }, [pagination.page, pagination.limit]);

  const fetchOutcomeInsights = useCallback(async (page = 1, limit = 10) => {
    if (!user || !token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const role = user.role?.name || (typeof user.role === 'string' ? user.role : 'Analyst');
      let endpoint = `${BASE_URL}/outcome-insights`;
      if (role === 'Supervisor') endpoint = `${BASE_URL}/outcome-insights/supervisor-mentions`;
      else if (role === 'Analyst') endpoint = `${BASE_URL}/outcome-insights/my-insights`;

      const safePage = isNaN(page) || page < 1 ? 1 : page;

      const params = new URLSearchParams();
      params.append('page', safePage.toString());
      params.append('limit', limit.toString());
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const url = `${endpoint}?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      let items: OutcomeInsight[] = [];
      let meta: Pagination = { total: 0, page: safePage, limit, totalPages: 0 };

      if (json.success && json.data) {
        if (json.data.data && Array.isArray(json.data.data)) {
          items = json.data.data;
          // Normalize API pagination keys to our internal structure
          meta = {
            total: json.data.pagination.total,
            page: json.data.pagination.currentPage,
            limit: json.data.pagination.pageSize,
            totalPages: json.data.pagination.totalPages,
          };
        } else if (Array.isArray(json.data)) {
          items = json.data;
          meta = json.pagination || {
            total: items.length,
            page: safePage,
            limit,
            totalPages: Math.ceil(items.length / limit),
          };
        }
      }

      // Normalize insights (handle both 'analysis' and 'insight' fields)
      const normalizedItems = items.map(item => ({
        ...item,
        insights: item.insights.map((insight: any) => ({
          category: insight.category,
          analysis: insight.insight || insight.analysis || '',
        })),
      }));

      setOutcomeInsights(normalizedItems.filter(o => !o.is_deleted));
      setPagination(meta);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to load insights');
      toast.error(err.message || 'Failed to load insights');
      setOutcomeInsights([]);
    } finally {
      setLoading(false);
    }
  }, [user, token, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchOutcomeInsights(1, 10);
  }, [fetchOutcomeInsights]);

  useEffect(() => {
    if (pagination.page > 0) {
      fetchOutcomeInsights(pagination.page, pagination.limit);
    }
  }, [pagination.page, pagination.limit, fetchOutcomeInsights]);

  const getFormInitialData = useCallback((outcome: OutcomeInsight) => ({
    id: outcome.id,
    company_id: outcome.company_id,
    date: outcome.date.split('T')[0],
    insights: outcome.insights.map(i => ({
      category: i.category,
      analysis: i.analysis,
    })),
    analyst_note: outcome.analyst_note || '',
    supervisor_note: outcome.supervisor_note || '',
  }), []);

  const handleResetFilters = useCallback(() => {
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const getUserRole = () => {
    return user?.role?.name || (typeof user?.role === 'string' ? user.role : 'Analyst');
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
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
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-950 hover:bg-indigo-800" onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Create Insight
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Outcome & Insight</DialogTitle>
              </DialogHeader>
              <ScrollArea className="mt-4">
                <OutcomeInsightForm
                  key="create-new"
                  onClose={handleCloseCreate}
                  initialData={undefined}
                  isEdit={false}
                  userRole={getUserRole()}
                  categories={categories}
                  loadingCategories={loadingCategories}
                />
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="oi-status">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPagination(p => ({ ...p, page: 1 }));
                }}
              >
                <SelectTrigger id="oi-status">
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
              <Label htmlFor="oi-dateFrom">Date From</Label>
              <Input
                id="oi-dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPagination(p => ({ ...p, page: 1 }));
                }}
              />
            </div>
            <div>
              <Label htmlFor="oi-dateTo">Date To</Label>
              <Input
                id="oi-dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPagination(p => ({ ...p, page: 1 }));
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

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <Button variant="outline" size="sm" onClick={() => fetchOutcomeInsights()} className="ml-4">
            Retry
          </Button>
        </div>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        <span>Loading insights...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : outcomeInsights.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16 text-gray-500">
                      <p className="text-lg font-medium">No insights found</p>
                      <p className="text-sm mt-2">Create your first outcome insight or adjust filters</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  outcomeInsights.map((o, i) => {
                    const categoriesDisplay = o.insights.map(x => x.category).slice(0, 2).join(', ');
                    const more = o.insights.length > 2 ? ` +${o.insights.length - 2} more` : '';
                    return (
                      <TableRow key={o.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{o.company.company_name}</TableCell>
                        <TableCell className="text-sm">
                          {categoriesDisplay}
                          {more && <span className="text-gray-500">{more}</span>}
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
                                  onClick={async () => {
                                    if (confirm(`Delete insight for ${o.company.company_name}?`)) {
                                      try {
                                        const res = await fetch(`${BASE_URL}/outcome-insights/update/${o.id}`, {
                                          method: 'PUT',
                                          headers: {
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'application/json',
                                          },
                                          body: JSON.stringify({ is_deleted: true }),
                                        });
                                        const result = await res.json();
                                        if (result.success) {
                                          toast.success('Insight deleted');
                                          fetchOutcomeInsights(pagination.page, pagination.limit);
                                        }
                                      } catch (err) {
                                        toast.error('Failed to delete insight');
                                      }
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

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 text-sm">
              <p className="text-gray-600">
                Showing{' '}
                {Math.max(1, (pagination.page - 1) * pagination.limit + 1)}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
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
                  onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages || loading}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Outcome & Insight</DialogTitle>
          </DialogHeader>
          <ScrollArea className="mt-4">
            {selectedOutcome && (
              <OutcomeInsightForm
                key={`edit-${selectedOutcome.id}`}
                onClose={handleCloseEdit}
                initialData={getFormInitialData(selectedOutcome)}
                isEdit={true}
                userRole={getUserRole()}
                categories={categories}
                loadingCategories={loadingCategories}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      {isViewOpen && selectedOutcome && (
        <ViewOutcomeModal outcome={selectedOutcome} onClose={() => setIsViewOpen(false)} />
      )}
    </div>
  );
}