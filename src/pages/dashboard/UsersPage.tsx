import React, { useState, useRef, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious
} from '@/components/ui/pagination';
import { Pencil, Trash2, Search, Plus, RefreshCw, Download, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import CreateUserForm from "@/components/admin/CreateUserForm";
import EditUserForm from '@/components/admin/EditUserForm';
import { useUsers, useDeleteUser } from '@/hooks/useApi';
import { toast } from 'sonner';
import { apiService } from '@/services/apiService';

const renderValue = (value: any): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'name' in value) {
    return value.name;
  }
  return 'Unknown';
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
};

const UsersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const [isExporting, setIsExporting] = useState(false);

  const usersPerPage = 10;

  const { data: response, loading, error, refetch } = useUsers({
    page: currentPage,
    limit: usersPerPage,
    search: searchTerm || undefined,
  });

  const { mutate: deleteUser, loading: deleting } = useDeleteUser();

  const users = response?.data || [];
  const pagination = response?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
  const { total = 0, totalPages = 1 } = pagination;

  // Debounced search → reset to page 1
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setCurrentPage(1);
    }, 500);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      refetch();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const API_BASE_URL = `https://pplus-5kdv.onrender.com`;
      const token = localStorage.getItem('token');

      const queryParams = new URLSearchParams();
      queryParams.append('format', 'csv'); 

      const url = `${API_BASE_URL}/api/export/users?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Export failed (${response.status})`);
      }

      const contentType = response.headers.get('content-type') || '';
      const filename = `users-export-${new Date().toISOString().split('T')[0]}.csv`;

      let blob: Blob;

      if (contentType.includes('text/csv') || contentType.includes('application/csv')) {
        const text = await response.text();
        if (text.trim() === '' || text.includes('<!DOCTYPE html>')) {
          throw new Error('Received invalid response — check backend route');
        }
        blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
      } else {
        // Fallback: treat as JSON (in case backend sends JSON for CSV format)
        const json = await response.json();
        const csvText = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
        blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      }

      // Trigger immediate download
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Users exported successfully as CSV');
    } catch (error) {
      console.error('Users export failed:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to export users'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          Error loading users: {error}
        </div>
      )}

      {/* Search + Create */}
      <div className="flex justify-between mb-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-950">
              <Plus className="mr-2 h-4 w-4" /> Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1000px]">
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(100vh-200px)] pr-4">
              <CreateUserForm
                onSave={() => {
                  setIsCreateDialogOpen(false);
                  refetch();
                  toast.success("User created successfully");
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Sn.</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-2" />
                  <p className="text-gray-500">Loading users...</p>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any, index: number) => (
                <TableRow key={user.id}>
                  <TableCell>{(currentPage - 1) * usersPerPage + index + 1}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{renderValue(user.role)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>{user.country_code} {user.mobile_number}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        disabled={deleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Fixed & Improved Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {/* Dynamic page numbers with ellipsis */}
              {(() => {
                const pages = [];
                const maxVisible = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                let endPage = startPage + maxVisible - 1;

                if (endPage > totalPages) {
                  endPage = totalPages;
                  startPage = Math.max(1, endPage - maxVisible + 1);
                }

                // First page + ellipsis if needed
                if (startPage > 1) {
                  pages.push(
                    <PaginationItem key={1}>
                      <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer">
                        1
                      </PaginationLink>
                    </PaginationItem>
                  );
                  if (startPage > 2) {
                    pages.push(
                      <PaginationItem key="start-ellipsis">
                        <span className="px-2">...</span>
                      </PaginationItem>
                    );
                  }
                }

                // Visible page numbers
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === i}
                        onClick={() => setCurrentPage(i)}
                        className="cursor-pointer"
                      >
                        {i}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }

                // Last page + ellipsis if needed
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <PaginationItem key="end-ellipsis">
                        <span className="px-2">...</span>
                      </PaginationItem>
                    );
                  }
                  pages.push(
                    <PaginationItem key={totalPages}>
                      <PaginationLink onClick={() => setCurrentPage(totalPages)} className="cursor-pointer">
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }

                return pages;
              })()}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * usersPerPage + 1} to{' '}
            {Math.min(currentPage * usersPerPage, total)} of {total} users
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(100vh-200px)] pr-4">
            {selectedUser && (
              <EditUserForm
                user={selectedUser}
                onSave={() => {
                  setIsEditDialogOpen(false);
                  setSelectedUser(null);
                  refetch();
                  toast.success("User updated successfully");
                }}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setSelectedUser(null);
                }}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;