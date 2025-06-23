
import React, { useState, useRef, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Pencil, Trash2, Search, Plus, RefreshCw, Download, Upload, Loader2 } from 'lucide-react';
import { CreateUserForm } from '@/components/admin/CreateUserForm';
import { EditUserForm } from '@/components/admin/EditUserForm';
import { useUsers, useDeleteUser } from '@/hooks/useApi';
import { FileUpload } from '@/components/FileUpload';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define the User interface
interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  mobileContact?: string;
  supervisorId?: string;
  expirationDate?: Date | string;
}

// Mock data for users
const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'active',
    lastLogin: '2023-05-15T10:30:00'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Analyst',
    status: 'active',
    lastLogin: '2023-05-14T14:45:00'
  },
  {
    id: 3,
    name: 'Robert Johnson',
    email: 'robert@example.com',
    role: 'Supervisor',
    status: 'inactive',
    lastLogin: '2023-05-10T09:15:00'
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'Client',
    status: 'active',
    lastLogin: '2023-05-13T16:20:00'
  },
  {
    id: 5,
    name: 'Michael Wilson',
    email: 'michael@example.com',
    role: 'Analyst',
    status: 'active',
    lastLogin: '2023-05-12T11:05:00'
  },
  {
    id: 6,
    name: 'Sarah Brown',
    email: 'sarah@example.com',
    role: 'Client',
    status: 'inactive',
    lastLogin: '2023-05-08T13:40:00'
  },
  {
    id: 7,
    name: 'David Miller',
    email: 'david@example.com',
    role: 'Supervisor',
    status: 'active',
    lastLogin: '2023-05-11T15:30:00'
  },
  {
    id: 8,
    name: 'Jennifer Taylor',
    email: 'jennifer@example.com',
    role: 'Analyst',
    status: 'active',
    lastLogin: '2023-05-09T10:15:00'
  },
  {
    id: 9,
    name: 'James Anderson',
    email: 'james@example.com',
    role: 'Client',
    status: 'active',
    lastLogin: '2023-05-07T14:20:00'
  },
  {
    id: 10,
    name: 'Lisa Thomas',
    email: 'lisa@example.com',
    role: 'Admin',
    status: 'active',
    lastLogin: '2023-05-06T09:45:00'
  }
];

const UsersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimeout = useRef<NodeJS.Timeout>();
  const usersPerPage = 10;

  // API hooks
  const { data: usersResponse, loading, error, refetch } = useUsers({
    page: currentPage,
    limit: usersPerPage,
    search: searchTerm
  });

  // Handle search with debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);
  const { mutate: deleteUser, loading: deleting } = useDeleteUser();

  // Extract data from API response
  const users = usersResponse?.data || [];
  const pagination = usersResponse?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.total || 0;

  // Handle save new user
  const handleSaveUser = (newUser: any) => {
    setIsCreateDialogOpen(false);
    refetch(); // Refresh the list
    toast.success("User created successfully");
  };

  // Handle edit
  const handleEdit = (id: number | string) => {
    const userToEdit = users.find(user => user.id === id);
    if (userToEdit) {
      setSelectedUser(userToEdit);
      setIsEditDialogOpen(true);
    }
  };

  // Handle update user
  const handleUpdateUser = (updatedUser: User) => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    refetch(); // Refresh the list
    toast.success("User updated successfully");
  };

  // Handle delete
  const handleDelete = async (id: number | string) => {
    try {
      await deleteUser(id.toString());
      toast.success("User deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // Handle file upload
  const handleFileUpload = (files: any[]) => {
    toast.success(`Uploaded ${files.length} files successfully`);
    setIsUploadDialogOpen(false);
    refetch(); // Refresh data after upload
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await apiService.exportUsers({ format: 'csv' });
      toast.success('Users exported successfully');
    } catch (error) {
      toast.error('Failed to export users');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={loading}>
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
              <DialogHeader>
                <DialogTitle>Upload User Data</DialogTitle>
              </DialogHeader>
              <FileUpload
                uploadType="data"
                accept=".csv,.xlsx,.xls"
                onUploadComplete={handleFileUpload}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">Error loading users: {error}</p>
        </div>
      )}

      <div className="flex justify-between mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-950">
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
              <DialogDescription>
                Add a new user to the system
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(100vh-200px)] pr-4">
              <CreateUserForm 
                onSave={handleSaveUser} 
                onCancel={() => setIsCreateDialogOpen(false)} 
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Make changes to user information
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(100vh-200px)] pr-4">
              {selectedUser && (
                <EditUserForm 
                  user={selectedUser} 
                  onSave={handleUpdateUser} 
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
<div className="border rounded-md">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-14">Sr.</TableHead>
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
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-gray-500">Loading users...</p>
            </div>
          </TableCell>
        </TableRow>
      ) : !Array.isArray(users) || users.length === 0 ? (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-8">
            <p className="text-gray-500">No users found</p>
          </TableCell>
        </TableRow>
      ) : (
        users.map((user: any, index: number) => (
          <TableRow key={user.id}>
            <TableCell>{(currentPage - 1) * usersPerPage + index + 1}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  user.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : user.status === 'INACTIVE'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {user.status}
              </span>
            </TableCell>
            <TableCell>{formatDate(user.lastLogin)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(user.id)}>
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


      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {pageNumbers.map(number => (
                <PaginationItem key={number}>
                  <PaginationLink
                    isActive={currentPage === number}
                    onClick={() => setCurrentPage(number)}
                  >
                    {number}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalItems)} of {totalItems} results
      </div>
    </div>
  );
};

export default UsersPage;
