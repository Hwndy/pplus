// SocialMediaMentionsPage.tsx
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
  created_by?: number;
  approved_by?: number;
  status?: 'Pending' | 'Approved' | 'Rejected';
  createdAt?: string;
  updatedAt?: string;
  company_data?: {
    company_name: string;
  };
  creator_data?: { username: string };
  approver_data?: { username: string };
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

  const BASE_URL = 'https://pplus-ec37.onrender.com/api';

  const fetchMentions = async (page = 1, limit = 10) => {
    if (!user || !token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Role-based endpoint
      const endpoint = user.role.name === 'Supervisor'
        ? '/social-media-mentions/supervisor-mentions'
        : user.role.name === 'Analyst'
        ? '/social-media-mentions/my-social-media-mentions'
        : '/social-media-mentions';

      const url = `${BASE_URL}${endpoint}?page=${page}&limit=${limit}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText || response.statusText}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const data = result.data;
        const total = data.length;
        const totalPages = Math.ceil(total / limit);

        setMentions(data);
        setPagination({ total, page, limit, totalPages });
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch social media mentions');
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchMentions(pagination.page, pagination.limit);
    }
  }, [user, token]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this mention?')) return;

    try {
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${BASE_URL}/social-media-mentions/delete/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_deleted: true }),
      });

      if (!response.ok) throw new Error('Delete failed');

      const result = await response.json();
      if (result.success) {
        toast.success('Mention deleted successfully');
        fetchMentions(pagination.page, pagination.limit);
      } else {
        toast.error(result.message || 'Failed to delete');
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Error deleting mention');
    }
  };

  const handleUpdateStatus = async (id: number, status: 'Approved' | 'Rejected') => {
    try {
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${BASE_URL}/social-media-mentions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Status update failed');

      const result = await response.json();
      if (result.success) {
        toast.success(`Mention ${status.toLowerCase()} successfully`);
        fetchMentions(pagination.page, pagination.limit);
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (err: any) {
      console.error('Status update error:', err);
      toast.error(err.message || 'Error updating status');
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

  const renderMetrics = (metrics: Metrics[]) => {
    if (!metrics || metrics.length === 0) return <span className="text-muted-foreground">No metrics</span>;

    return (
      <div className="space-y-1 text-sm">
        {metrics.map((m, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            {m.page  && <span>Likes: {m.page_likes}</span>}
            {m.average_likes && <span>Avg Likes: {m.average_likes}</span>}
            {m.average_comments && <span>Avg Comments: {m.average_comments}</span>}
            {m.posts && <span>Posts: {m.posts}</span>}
            {m.followers && <span>Followers: {m.followers}</span>}
            {m.following && <span>Following: {m.following}</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Social Media Mentions</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
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
                fetchMentions(pagination.page, pagination.limit);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Social Media Mentions List</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
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
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        <span>Loading mentions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : mentions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No social media mentions found
                    </TableCell>
                  </TableRow>
                ) : (
                  mentions.map((mention) => (
                    <TableRow key={mention.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">{mention.id}</TableCell>
                      <TableCell className="font-medium">
                        {mention.company_data?.company_name || 'Unknown Company'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(mention.social_media_type)}
                          <span>{mention.social_media_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(mention.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {renderMetrics(mention.metrics)}
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
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingMention(mention);
                              }}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View / Edit
                            </DropdownMenuItem>

                            {mention.status === 'Pending' && user?.role.name === 'Supervisor' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(mention.id, 'Approved')}
                                  className="cursor-pointer text-green-600"
                                >
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(mention.id, 'Rejected')}
                                  className="cursor-pointer text-red-600"
                                >
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}

                            <DropdownMenuItem
                              onClick={() => handleDelete(mention.id)}
                              className="cursor-pointer text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
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
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchMentions(pagination.page - 1, pagination.limit)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchMentions(pagination.page + 1, pagination.limit)}
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
      <Dialog open={!!editingMention} onOpenChange={(open) => !open && setEditingMention(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Social Media Mention</DialogTitle>
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
