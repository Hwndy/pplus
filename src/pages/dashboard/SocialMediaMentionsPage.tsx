import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Facebook, Twitter, Instagram, Linkedin, Eye, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SocialMediaMentionForm } from '../Dashboard/components/SocialMediaMentionForm'; // Aimport { toast } from 'sonner';
import { format } from 'date-fns';

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
  company_data?: { name: string };
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
  const [loading, setLoading] = useState(true);
  const [mentions, setMentions] = useState<SocialMediaMention[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchMentions = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://backend-tw99.onrender.com/social-media-mentions?page=${page}&limit=${limit}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setMentions(result.data.data || []);
        setPagination(result.data.pagination || { total: 0, page, limit, totalPages: 0 });
      } else {
        setError(result.message || 'Failed to fetch mentions');
      }
    } catch (err) {
      setError('Error fetching mentions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentions();
  }, []);

  const handleUpdate = async (mention: SocialMediaMention) => {
    try {
      const response = await fetch(`https://backend-tw99.onrender.com/social-media-mentions/update/${mention.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(mention),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Mention updated successfully');
        fetchMentions(pagination.page, pagination.limit);
      } else {
        toast.error(result.message || 'Failed to update mention');
      }
    } catch (error) {
      toast.error('Error updating mention');
      console.error(error);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Social Media Mentions</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Create Mention
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Social Media Mention</DialogTitle>
            </DialogHeader>
            <SocialMediaMentionForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mentions List</CardTitle>
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
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">Loading...</TableCell>
                  </TableRow>
                ) : mentions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">No mentions found</TableCell>
                  </TableRow>
                ) : (
                  mentions.map((mention) => (
                    <TableRow key={mention.id}>
                      <TableCell>{mention.id}</TableCell>
                      <TableCell>{mention.company_data?.name || 'N/A'}</TableCell>
                      <TableCell>{getPlatformIcon(mention.social_media_type)} {mention.social_media_type}</TableCell>
                      <TableCell>{format(new Date(mention.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        {mention.metrics.map((m, i) => (
                          <div key={i}>
                            {m.page_likes && `Likes: ${m.page_likes}`}
                            {m.average_likes && `Avg Likes: ${m.average_likes}`}
                            {m.average_comments && `Avg Comments: ${m.average_comments}`}
                            {m.posts && `Posts: ${m.posts}`}
                            {m.followers && `Followers: ${m.followers}`}
                            {m.following && `Following: ${m.following}`}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={mention.status === 'Approved' ? 'default' : 'secondary'}>
                          {mention.status || 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdate(mention)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Update
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
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}