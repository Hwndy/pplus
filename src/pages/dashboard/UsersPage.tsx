import React, { useState, useRef, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from '@/components/ui/dialog';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious
} from '@/components/ui/pagination';
import { Pencil, Trash2, Search, Plus, RefreshCw, Download, Upload, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileUpload } from '@/components/FileUpload';
import { apiService, User } from '@/services/apiService';
import { useUsers, useDeleteUser, useCreateUser, useUpdateUser } from '@/hooks/useApi';
import { toast } from 'sonner';
import CreateUserForm from "@/components/admin/CreateUserForm";
import EditUserForm from '@/components/admin/EditUserForm';

// --- Helpers ---
const renderValue = (value: string | { id: string; name: string } | unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'name' in value) {
    return (value as { name: string }).name;
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
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const usersPerPage = 10;

  // Hook into working API
  const { data: users, loading, error, refetch } = useUsers({
    page: currentPage, limit: usersPerPage, search: searchTerm
  });
  const { mutate: deleteUser, loading: deleting } = useDeleteUser();

  // Debounced search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setCurrentPage(1), 500);
  };
  useEffect(() => () => searchTimeout.current && clearTimeout(searchTimeout.current), []);

  // Handlers
  const handleSaveUser = () => {
    setIsCreateDialogOpen(false);
    refetch();
    toast.success("User created successfully");
  };

  const handleUpdateUser = () => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    refetch();
    toast.success("User updated successfully");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      refetch();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleFileUpload = (files: File[]) => {
    toast.success(`Uploaded ${files.length} files successfully`);
    setIsUploadDialogOpen(false);
    refetch();
  };

  const handleExport = async () => {
    try {
      await apiService.exportUsers({ format: 'csv' });
      toast.success('Users exported successfully');
    } catch {
      toast.error('Failed to export users');
    }
  };

  // Pagination
  const totalItems = Array.isArray(users) ? users.length : 0;
  const totalPages = Math.ceil(totalItems / usersPerPage);
  const displayedUsers = Array.isArray(users)
    ? users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)
    : [];

  return (
    <div className="p-6 h-full">
      {/* Header Actions */}
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
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Upload User Data</DialogTitle></DialogHeader>
              <FileUpload uploadType="data" accept=".csv,.xlsx,.xls" onUploadComplete={handleFileUpload} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
        Error loading users
      </div>}

      {/* Search + Create */}
      <div className="flex justify-between mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-8" value={searchTerm} onChange={handleSearch} />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-950">
              <Plus className="mr-2 h-4 w-4" /> Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1000px]">
            <DialogHeader><DialogTitle>Create User</DialogTitle></DialogHeader>
            <ScrollArea className="max-h-[calc(100vh-200px)] pr-4">
              <CreateUserForm onSave={handleSaveUser} onCancel={() => setIsCreateDialogOpen(false)} />
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
                  <p className="text-gray-500">Loading users...</p>
                </TableCell>
              </TableRow>
            ) : displayedUsers.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No users found</TableCell></TableRow>
            ) : (
              displayedUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{(currentPage - 1) * usersPerPage + index + 1}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{renderValue(user.role)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : user.status === 'INACTIVE'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {renderValue(user.status)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(user.lastLogin)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedUser(user); setIsEditDialogOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} disabled={deleting}>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink isActive={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, totalItems)} of {totalItems} results
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[1000px]">
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-[calc(100vh-200px)] pr-4">
            {selectedUser && (
              <EditUserForm user={selectedUser} onSave={handleUpdateUser} onCancel={() => { setIsEditDialogOpen(false); setSelectedUser(null); }} />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
