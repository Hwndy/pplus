'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Company {
  id: number;
  company_name: string;
}

interface IndustryLandscape {
  id: number;
  company_id: number;
  date: string;
  sector: string;
  highlights: string[];
  analyst_note?: string;
  supervisor_note?: string;
  status: 'pending' | 'approved' | 'rejected';
  is_deleted: boolean;
  createdAt: string;
  updatedAt?: string;
  company_data: { company_name: string };
  creator_data: { username: string };
  approver_data?: { username: string } | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const API_BASE = 'https://pplus-oez4.onrender.com/api/industry-landscape-overview';
const COMPANIES_API = 'https://pplus-oez4.onrender.com/api/companies';
const SECTOR_TITLE_API = 'https://pplus-oez4.onrender.com/api/data-parameters/category/Industry_Landscape_Sector';

/* ====================== FORM COMPONENT ====================== */
function IndustryLandscapeForm({
  initialData,
  onSuccess,
}: {
  initialData?: IndustryLandscape;
  onSuccess: () => void;
}) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [sectorTitles, setSectorTitles] = useState([]);
  const [loadingSectors, setLoadingSectors] = useState(false);

  const [form, setForm] = useState({
    company_id: initialData?.company_id?.toString() || '',
    date: initialData?.date.split('T')?.[0] || '',
    sector: initialData?.sector || '',
    highlights: initialData?.highlights?.join('\n') || '',
    analyst_note: initialData?.analyst_note || '',
    supervisor_note: initialData?.supervisor_note || '',
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!token) return;
      try {
        setCompaniesLoading(true);
        const res = await fetch(COMPANIES_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();

        if (json.success && json.data?.data) {
          setCompanies(json.data.data);
        } else {
          throw new Error('No companies found');
        }
      } catch (err) {
        toast.error('Failed to load companies');
        setCompanies([]);
      } finally {
        setCompaniesLoading(false);
      }
    };

    fetchCompanies();
  }, [token]);

  useEffect(() => {
    const fetchSectorTitles = async () => {
      setLoadingSectors(true);
      try {
        const response = await fetch(SECTOR_TITLE_API,{
            headers: { Authorization: `Bearer ${token}` },
          });
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          // Extract values from the nested structure
          const categories = data.data[0].categories;
          if (categories && categories.length > 0) {
            const values = categories[0].values.map(v => v.value);
            setSectorTitles(values);
          }
        }
      } catch (error) {
        console.error('Error fetching sector titles:', error);
        // Optionally show error toast/notification
      } finally {
        setLoadingSectors(false);
      }
    };

    fetchSectorTitles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_id || !form.date || !form.sector || !form.highlights.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    const payload = {
      company_id: Number(form.company_id),
      date: form.date,
      sector: form.sector,
      highlights: form.highlights.split('\n').filter(h => h.trim()),
      analyst_note: form.analyst_note,
      supervisor_note: form.supervisor_note,
    };

    try {
      const url = initialData
        ? `${API_BASE}/update/${initialData.id}`
        : `${API_BASE}/create`;

      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(initialData ? 'Updated!' : 'Created!');
        onSuccess();
      } else {
        toast.error(json.message || 'Operation failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Company *</label>
          {companiesLoading ? (
            <Skeleton className="mt-1 h-10 w-full rounded-md" />
          ) : companies.length === 0 ? (
            <div className="mt-1 p-3 bg-orange-50 border border-orange-200 rounded-md text-orange-700 text-sm">
              No companies available
            </div>
          ) : (
            <select
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              value={form.company_id}
              onChange={e => setForm({ ...form, company_id: e.target.value })}
              required
            >
              <option value="">Select company</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.company_name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Date *</label>
          <input
            type="date"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Sector Title *</label>
        <select
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
            value={form.sector}
            onChange={e => setForm({ ...form, sector: e.target.value })}
            required
            disabled={loadingSectors}
          >
            <option value="">
              {loadingSectors ? 'Loading sectors...' : 'Select a sector'}
            </option>
            {sectorTitles.map((title, index) => (
              <option key={index} value={title}>
                {title}
              </option>
            ))}
          </select>
      </div>

      <div>
        <label className="text-sm font-medium">Highlights (one per line) *</label>
        <textarea
          rows={10}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
          value={form.highlights}
          onChange={e => setForm({ ...form, highlights: e.target.value })}
          placeholder="5G deployment reached 45%..."
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Analyst Note</label>
        <textarea
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          value={form.analyst_note}
          onChange={e => setForm({ ...form, analyst_note: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Supervisor Note</label>
        <textarea
          rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          value={form.supervisor_note}
          onChange={e => setForm({ ...form, supervisor_note: e.target.value })}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={loading || companiesLoading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update' : 'Create'} Overview
        </Button>
      </DialogFooter>
    </form>
  );
}

/* ====================== VIEW MODAL ====================== */
function ViewModal({ item, onClose }: { item: IndustryLandscape; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b pb-6">
          <DialogTitle className="text-2xl font-bold">{item.sector}</DialogTitle>
          <p className="text-sm text-gray-500 mt-2">
            {item.company_data.company_name} • {format(new Date(item.date), 'MMMM d, yyyy')}
          </p>
        </DialogHeader>

        <ScrollArea className="py-6">
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-indigo-700 mb-4">Key Highlights</h3>
              <ul className="space-y-3">
                {item.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {(item.analyst_note || item.supervisor_note) && (
              <>
                <Separator />
                <div className="space-y-6">
                  {item.analyst_note && (
                    <div>
                      <p className="font-medium text-gray-700">Analyst Note</p>
                      <p className="mt-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        {item.analyst_note}
                      </p>
                    </div>
                  )}
                  {item.supervisor_note && (
                    <div>
                      <p className="font-medium text-gray-700">Supervisor Note</p>
                      <p className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        {item.supervisor_note}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Status:</span>
                <Badge
                  variant={
                    item.status === 'approved'
                      ? 'default'
                      : item.status === 'rejected'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {item.status}
                </Badge>
                {item.approver_data && (
                  <span className="text-sm text-gray-600">
                    by {item.approver_data.username}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Created by <strong>{item.creator_data.username}</strong>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ====================== MAIN PAGE ====================== */
export default function IndustryLandscapeOverviewPage() {
  const { token } = useAuth();
  const location = useLocation();

  const [items, setItems] = useState<IndustryLandscape[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IndustryLandscape | null>(null);
  const [viewingItem, setViewingItem] = useState<IndustryLandscape | null>(null);

  // === FILTER STATES ===
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // === FIX: Auto-open edit dialog when navigated from Analyst Dashboard ===
  useEffect(() => {
    if (location.state?.editingItem) {
      setEditingItem(location.state.editingItem);
      setIsCreateOpen(true);
    }
  }, [location.state]);

  const fetchData = useCallback(async (page = 1) => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      // Build query parameters with filters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');

      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (dateFrom) {
        params.append('date_from', dateFrom);
      }
      if (dateTo) {
        params.append('date_to', dateTo);
      }

      const url = `${API_BASE}?${params.toString()}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json.success) {
        const data = json.data.overviews || json.data.data || json.data;
        const meta = json.data.pagination || json.data;

        setItems(data.filter((i: any) => !i.is_deleted));
        setPagination({
          total: meta.total,
          page: meta.page,
          limit: meta.limit,
          totalPages: meta.totalPages,
        });
      } else {
        throw new Error(json.message || 'Failed to fetch');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, pagination.page, statusFilter, dateFrom, dateTo]);

  // Fetch on mount and when filters/page change
  useEffect(() => {
    fetchData(1);
  }, [token]);

  useEffect(() => {
    fetchData(pagination.page);
  }, [pagination.page, statusFilter, dateFrom, dateTo]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this overview?')) return;
    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Deleted');
        fetchData(pagination.page);
      }
    } catch {
      toast.error('Delete failed');
    }
  };

  const goToPage = (newPage: number) => {
    setPagination(p => ({ ...p, page: newPage }));
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Industry Landscape Overview
          </h1>
          <p className="text-gray-600 mt-1">Monthly sector highlights and trends</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => fetchData(pagination.page)}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-950 hover:bg-indigo-800">
                <Plus className="mr-2 h-4 w-4" />
                Create Overview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit' : 'Create'} Industry Overview
                </DialogTitle>
              </DialogHeader>
              <IndustryLandscapeForm
                initialData={editingItem || undefined}
                onSuccess={() => {
                  setIsCreateOpen(false);
                  setEditingItem(null);
                  fetchData(pagination.page);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* FILTER SECTION */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="il-status">Status</Label>
              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPagination(p => ({ ...p, page: 1 })); }}>
                <SelectTrigger id="il-status">
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
              <Label htmlFor="il-dateFrom">Date From</Label>
              <Input
                id="il-dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
              />
            </div>

            <div>
              <Label htmlFor="il-dateTo">Date To</Label>
              <Input
                id="il-dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
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
        </div>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Overviews</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Highlights</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-gray-500">
                    No industry overviews yet.
                  </TableCell>
                </TableRow>
              ) : (
                items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{format(new Date(item.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="font-medium">
                      {item.company_data.company_name}
                    </TableCell>
                    <TableCell>{item.sector}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {item.highlights.length} highlight{item.highlights.length !== 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === 'approved'
                            ? 'default'
                            : item.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.creator_data.username}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingItem(item)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingItem(item);
                              setIsCreateOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* ==== PERFECT PAGINATION ==== */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <p className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1}–{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total}
              </p>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>

                <span className="text-sm font-medium px-3">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || loading}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {viewingItem && (
        <ViewModal item={viewingItem} onClose={() => setViewingItem(null)} />
      )}
    </div>
  );
}