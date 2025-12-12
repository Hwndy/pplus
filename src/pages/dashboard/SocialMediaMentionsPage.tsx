// SocialMediaMentionsPage.tsx - FINAL PRODUCTION VERSION
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Facebook, Twitter, Instagram, Eye, MoreHorizontal, Trash2, RefreshCw, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SocialMediaMentionForm } from '../dashboard/components/SocialMediaMentionForm';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/components/auth/AuthContext';

const API_BASE = 'https://pplus-ipn6.onrender.com/api';

interface Metrics {
  page_likes?: number;
  average_likes?: number;
  average_comments?: number;
  posts?: number;
  followers?: number;
  following?: number;
}

interface SocialMediaMention {
  id: number;
  company_id: number;
  date: string;
  social_media_type: 'Facebook' | 'Instagram' | 'X';
  metrics: Metrics[];
  analyst_note?: string;
  supervisor_note?: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  company_data?: { company_name: string };
  creator_data?: { username: string };
  approver_data?: { username: string } | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function SocialMediaMentionsPage() {
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [mentions, setMentions] = useState<SocialMediaMention[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMention, setEditingMention] = useState<SocialMediaMention | null>(null);

  const fetchMentions = async (page = 1, limit = 10) => {
    if (!user || !token) {
      setError('Please log in to continue.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint = user.role.name === 'Supervisor'
        ? `${API_BASE}/social-media-mentions/supervisor-mentions`
        : user.role.name === 'Analyst'
        ? `${API_BASE}/social-media-mentions/my-social-media-mentions`
        : `${API_BASE}/social-media-mentions`;

      const url = `${endpoint}?page=${page}&limit=${limit}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`HTTP ${response.status}: ${err}`);
      }

      const result = await response.json();

      let items: SocialMediaMention[] = [];
      let meta: Pagination = { total: 0, page, limit, totalPages: 0 };

      if (result.success && result.data) {
        // Admin: { data: { data: [...], pagination: {} } }
        if (result.data.data && Array.isArray(result.data.data)) {
          items = result.data.data;
          meta = result.data.pagination || meta;
        }
        // Analyst/Supervisor: { data: [...] }
        else if (Array.isArray(result.data)) {
          items = result.data;
          meta = result.pagination || {
            total: items.length,
            page,
            limit,
            totalPages: Math.ceil(items.length / limit),
          };
        }
      } else {
        throw new Error(result.message || 'Invalid response format');
      }

      setMentions(items);
      setPagination(meta);

    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to load mentions');
      setMentions([]);
      setPagination({ total: 0, page, limit, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) fetchMentions(1, 10);
  }, [user, token]);

  useEffect(() => {
    if (user && token) fetchMentions(pagination.page, pagination.limit);
  }, [pagination.page]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this mention permanently?')) return;

    try {
      const res = await fetch(`${API_BASE}/social-media-mentions/delete/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Delete failed');
      const data = await res.json();

      if (data.success) {
        toast.success('Mention deleted');
        fetchMentions(pagination.page, pagination.limit);
      } else {
        toast.error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleUpdateStatus = async (id: number, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`${API_BASE}/social-media-mentions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Update failed');
      const data = await res.json();

      if (data.success) {
        toast.success(`Marked as ${status}`);
        fetchMentions(pagination.page, pagination.limit);
      } else {
        toast.error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    }
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case 'Facebook': return <Facebook className="h-5 w-5 text-blue-600" />;
      case 'Instagram': return <Instagram className="h-5 w-5 text-pink-600" />;
      case 'X': return <Twitter className="h-5 w-5 text-blue-400" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Media Mentions</h1>
          <p className="text-gray-600 mt-1">Track and manage brand mentions across platforms</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => fetchMentions(pagination.page, pagination.limit)} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-950 hover:bg-indigo-800">
                <Plus className="mr-2 h-4 w-4" />
                Create Mention
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Social Media Mention</DialogTitle>
              </DialogHeader>
              <SocialMediaMentionForm
                mode="create"
                onSuccess={() => {
                  setIsCreateOpen(false);
                  fetchMentions(1, 10);
                  toast.success("Mention created!");
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Mentions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Metrics</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                        <span className="text-gray-600">Loading mentions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : mentions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16 text-gray-500">
                      <p className="text-lg font-medium">No mentions found</p>
                      <p className="text-sm mt-2">Create your first mention to get started</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  mentions.map((mention) => (
                    <TableRow key={mention.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">{mention.id}</TableCell>
                      <TableCell className="font-medium">
                        {mention.company_data?.company_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(mention.social_media_type)}
                          <span>{mention.social_media_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(mention.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {mention.metrics[0] && (
                            <>
                              {mention.metrics[0].followers && <div>Followers: {mention.metrics[0].followers.toLocaleString()}</div>}
                              {mention.metrics[0].page_likes && <div>Likes: {mention.metrics[0].page_likes.toLocaleString()}</div>}
                              {mention.metrics[0].posts && <div>Posts: {mention.metrics[0].posts}</div>}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            mention.status === 'Approved' ? 'default' :
                            mention.status === 'Rejected' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {mention.status || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingMention(mention)}>
                              <Eye className="mr-2 h-4 w-4" /> View & Edit
                            </DropdownMenuItem>
                            {mention.status === 'Pending' && user?.role.name === 'Supervisor' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(mention.id, 'Approved')}
                                  className="text-green-600"
                                >
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(mention.id, 'Rejected')}
                                  className="text-red-600"
                                >
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDelete(mention.id)}
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
                  disabled={pagination.page === 1 || loading}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 bg-gray-100 rounded-md">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* === BEAUTIFUL VIEW/EDIT MODAL === */}
      <Dialog open={!!editingMention} onOpenChange={() => setEditingMention(null)}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto bg-white">
          {editingMention && (
            <>
              <DialogHeader className="border-b pb-6">
                <DialogTitle className="text-2xl font-bold flex items-center gap-4">
                  {getPlatformIcon(editingMention.social_media_type)}
                  {editingMention.company_data?.company_name}
                  <Badge variant="outline" className="text-lg px-3">
                    {editingMention.social_media_type}
                  </Badge>
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-2">
                  ID: <span className="font-mono">{editingMention.id}</span> • 
                  Created by <strong>{editingMention.creator_data?.username}</strong> • 
                  {format(new Date(editingMention.date), 'MMMM d, yyyy')}
                </p>
              </DialogHeader>

              <div className="mt-8 space-y-10">
                {/* Metrics */}
                <div>
                  <h3 className="text-xl font-semibold mb-5 text-indigo-700">Performance Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {editingMention.metrics.map((m, i) => (
                      <Card key={i} className="border-2 hover:border-indigo-400 transition-all">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-gray-600">Account {i + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {m.page_likes && <div className="flex justify-between"><span className="text-gray-600">Page Likes</span><span className="font-bold">{m.page_likes.toLocaleString()}</span></div>}
                          {m.followers && <div className="flex justify-between"><span className="text-gray-600">Followers</span><span className="font-bold">{m.followers.toLocaleString()}</span></div>}
                          {m.posts && <div className="flex justify-between"><span className="text-gray-600">Posts</span><span className="font-bold">{m.posts}</span></div>}
                          {m.average_likes && <div className="flex justify-between"><span className="text-gray-600">Avg Likes</span><span className="font-bold">{m.average_likes.toLocaleString()}</span></div>}
                          {m.average_comments && <div className="flex justify-between"><span className="text-gray-600">Avg Comments</span><span className="font-bold">{m.average_comments.toLocaleString()}</span></div>}
                          {m.following && <div className="flex justify-between"><span className="text-gray-600">Following</span><span className="font-bold">{m.following}</span></div>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Notes & Status */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-indigo-700">Notes & Approval</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Analyst Note</label>
                      <div className="mt-2 p-5 bg-amber-50 rounded-lg min-h-32 border border-amber-200">
                        <p className="text-gray-800">{editingMention.analyst_note || <em className="text-gray-500">No note provided</em>}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Supervisor Note</label>
                      <div className="mt-2 p-5 bg-blue-50 rounded-lg min-h-32 border border-blue-200">
                        <p className="text-gray-800">{editingMention.supervisor_note || <em className="text-gray-500">No note provided</em>}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t">
                    <span className="font-medium">Status:</span>
                    <Badge variant={editingMention.status === 'Approved' ? 'default' : editingMention.status === 'Rejected' ? 'destructive' : 'secondary'} className="text-lg px-4 py-1">
                      {editingMention.status || 'Pending'}
                    </Badge>
                    {editingMention.approver_data && (
                      <span className="text-sm text-gray-600">
                        by {editingMention.approver_data.username}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit Form */}
                <div className="border-t pt-8">
                  <h3 className="text-xl font-semibold mb-6 text-indigo-700">Edit Mention</h3>
                  <SocialMediaMentionForm
                    mode="edit"
                    initialData={editingMention}
                    onSuccess={() => {
                      setEditingMention(null);
                      fetchMentions(pagination.page, pagination.limit);
                      toast.success("Mention updated successfully!");
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}