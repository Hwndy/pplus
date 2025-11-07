// SocialMediaMentionsPage.tsx - FINAL WORKING VERSION
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Facebook, Twitter, Instagram, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SocialMediaMentionForm } from '../dashboard/components/SocialMediaMentionForm';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/components/auth/AuthContext';

const API_BASE = 'https://pplus-ec37.onrender.com/api';

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
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 });
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
      // EXACT SAME LOGIC AS EDITORIAL PAGE
      const endpoint = user.role.name === 'Supervisor'
        ? `${API_BASE}/social-media-mentions/supervisor-mentions`
        : user.role.name === 'Analyst'
        ? `${API_BASE}/social-media-mentions/my-social-media-mentions`
        : `${API_BASE}/social-media-mentions`; // Admin fallback

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

      if (result.success && Array.isArray(result.data)) {
        const data = result.data;

        // Client-side pagination fallback
        const total = data.length;
        const totalPages = Math.ceil(total / limit);

        setMentions(data);
        setPagination({ total, page, limit, totalPages });
      } else {
        throw new Error(result.message || 'Invalid response');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to load mentions');
      setMentions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount + when user changes
  useEffect(() => {
    if (user && token) {
      fetchMentions(1, 10);
    }
  }, [user, token]);

  // Refetch on page change
  useEffect(() => {
    if (user && token) {
      fetchMentions(pagination.page, pagination.limit);
    }
  }, [pagination.page]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this mention?')) return;

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
        toast.success('Deleted successfully');
        fetchMentions(pagination.page, pagination.limit);
      } else {
        toast.error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
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

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Facebook': return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'Instagram': return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'X': return <Twitter className="h-4 w-4 text-blue-400" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Social Media Mentions</h1>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>Create Mention</Button>
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
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mentions List</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}

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
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span>Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : mentions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No mentions found
                    </TableCell>
                  </TableRow>
                ) : (
                  mentions.map((mention) => (
                    <TableRow key={mention.id}>
                      <TableCell className="font-mono">{mention.id}</TableCell>
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
                              {mention.metrics[0].page_likes && <div>Likes: {mention.metrics[0].page_likes}</div>}
                              {mention.metrics[0].followers && <div>Followers: {mention.metrics[0].followers}</div>}
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
                              <Eye className="mr-2 h-4 w-4" /> View/Edit
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
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingMention} onOpenChange={() => setEditingMention(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Mention</DialogTitle>
          </DialogHeader>
          {editingMention && (
            <SocialMediaMentionForm
              mode="edit"
              initialData={editingMention}
              onSuccess={() => {
                setEditingMention(null);
                fetchMentions(pagination.page, pagination.limit);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}