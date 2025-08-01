import React, { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { UniversalFilter, FilterOption, FilterValues } from '@/components/ui/UniversalFilter';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  RefreshCw, 
  Download, 
  Upload, 
  MoreHorizontal,
  User,
  Users,
  Mail,
  Phone,
  Shield,
  Eye,
  Filter,
  Loader2,
  AlertTriangle,
  Calendar,
  UserCheck,
  Clock
} from 'lucide-react';
import { UserForm } from '@/components/forms/UserForm';
import { useUsers, useDeleteUser } from '@/hooks/useApi';
import { FileUpload } from '@/components/FileUpload';
import { apiService, User } from '@/services/apiService';
import { toast } from 'sonner';

// Helper function to safely render role
const renderRole = (role: string | { id: string; name: string } | unknown): string => {
  if (typeof role === 'string') {
    return role;
  }
  if (typeof role === 'object' && role !== null && 'name' in role) {
    return (role as { name: string }).name;
  }
  return 'Unknown';
};

// Filter options for users
const filterOptions: FilterOption[] = [
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'ADMIN', label: 'Administrator' },
      { value: 'SUPERVISOR', label: 'Supervisor' },
      { value: 'ANALYST', label: 'Analyst' },
      { value: 'CLIENT', label: 'Client' }
    ]
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INACTIVE', label: 'Inactive' },
      { value: 'SUSPENDED', label: 'Suspended' }
    ]
  },
  {
    key: 'search',
    label: 'Search',
    type: 'search',
    placeholder: 'Search users...'
  }
];

const UsersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [showFilters, setShowFilters] = useState(false);
  const usersPerPage = 10;

  // Build API parameters from filters
  const apiParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: currentPage,
      limit: usersPerPage,
    };

    // Add filter values to params
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });

    return params;
  }, [currentPage, filterValues]);

  // API hooks with conservative approach (NO auto-refresh)
  const { data: usersResponse, loading, error, refetch, lastFetch } = useUsers(apiParams, {
    enableAutoRefresh: false, // DISABLED - manual refresh only
    refreshInterval: 900000 // 15 minutes if enabled
  });
  const { mutate: deleteUser, loading: deleting } = useDeleteUser();

  // Extract data from API response
  const users = usersResponse?.data || [];
  const pagination = usersResponse?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.total || 0;

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle edit
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  // Handle view
  const handleView = (user: User) => {
    toast.info(`Viewing details for ${user.name}`);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // Handle form success
  const handleFormSuccess = (user: User) => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    refetch(); // Refresh the list
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    toast.success(`Uploaded ${files.length} files successfully`);
    setIsUploadDialogOpen(false);
    refetch(); // Refresh data after upload
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await apiService.exportUsers({ 
        format: 'csv',
        ...filterValues // Include current filters in export
      });
      toast.success('Users exported successfully');
    } catch (error) {
      toast.error('Failed to export users');
    }
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'SUPERVISOR':
        return 'bg-blue-100 text-blue-800';
      case 'ANALYST':
        return 'bg-green-100 text-green-800';
      case 'CLIENT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-indigo-600" />
            Users
          </h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <UserForm 
                mode="create"
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter((u: User) => u.isActive).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Roles</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(users.map((u: User) => renderRole(u.role))).size}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Page</p>
                <p className="text-2xl font-bold text-purple-600">{users.length}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsersPage;
