import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Upload
} from 'lucide-react';
import { format } from 'date-fns';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useApiMutation } from '@/hooks/useApi';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  mobileContact: string;
  countryCode: string;
  supervisorId: string;
  expirationDate: string;
}

// Helper function to safely render role/status
const renderValue = (value: string | { id: string; name: string } | unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object' && value !== null && 'name' in value) {
    return (value as { name: string }).name;
  }
  return 'Unknown';
};

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Supervisor' | 'Analyst' | 'Client';
  mobileContact?: string;
  countryCode?: string;
  supervisorId?: string;
  expirationDate?: string;
}

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserFormData & { id?: string } | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'Analyst',
    mobileContact: '',
    countryCode: '',
    supervisorId: '',
    expirationDate: '',
  });

  // API hooks
  const { data: users, loading, refetch } = useUsers({ search: searchQuery });
  const { mutate: createUser, loading: creating } = useCreateUser();
  const { mutate: updateUser, loading: updating } = useUpdateUser();
  const { mutate: deleteUser, loading: deleting } = useDeleteUser();
  const { mutate: bulkUpdateUsers } = useApiMutation((updates: any) => 
    apiService.bulkUpdateUsers(updates)
  );

  const handleCreateUser = async () => {
    try {
      await createUser(formData);
      toast.success('User created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password; // Don't update password if empty
      }
      
      await updateUser({ id: editingUser.id, data: updateData });
      toast.success('User updated successfully');
      closeEditDialog();
      refetch();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteUser(userId);
      toast.success('User deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleBulkStatusUpdate = async (status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users to update');
      return;
    }

    try {
      const updates = selectedUsers.map(id => ({
        id,
        data: { status }
      }));
      
      await bulkUpdateUsers(updates);
      toast.success(`Updated ${selectedUsers.length} users`);
      setSelectedUsers([]);
      refetch();
    } catch (error) {
      toast.error('Failed to update users');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Analyst',
      mobileContact: '',
      countryCode: '',
      supervisorId: '',
      expirationDate: '',
    });
  };

  const openEditDialog = (user: UserFormData & { id?: string }) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Always start with empty password for editing
      role: user.role || 'Analyst',
      mobileContact: user.mobileContact || '',
      countryCode: user.countryCode || '',
      supervisorId: user.supervisorId || '',
      expirationDate: user.expirationDate ? format(new Date(user.expirationDate), 'yyyy-MM-dd') : '',
    });
  };

  const closeEditDialog = () => {
    setEditingUser(null);
    resetForm();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Supervisor':
        return 'bg-blue-100 text-blue-800';
      case 'Analyst':
        return 'bg-green-100 text-green-800';
      case 'Client':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
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

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    const usersArray = Array.isArray(users) ? users : [];
    if (selectedUsers.length === usersArray.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(usersArray.map((user: any) => user.id) || []);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusUpdate('ACTIVE')}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Activate ({selectedUsers.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkStatusUpdate('SUSPENDED')}
              >
                <UserX className="mr-2 h-4 w-4" />
                Suspend ({selectedUsers.length})
              </Button>
            </>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Supervisor">Supervisor</SelectItem>
                      <SelectItem value="Analyst">Analyst</SelectItem>
                      <SelectItem value="Client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Contact</Label>
                  <Input
                    id="mobile"
                    value={formData.mobileContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobileContact: e.target.value }))}
                    placeholder="Enter mobile number"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateUser}
                    disabled={creating}
                    className="flex-1"
                  >
                    {creating ? 'Creating...' : 'Create User'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({Array.isArray(users) ? users.length : 0})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={Array.isArray(users) && selectedUsers.length === users.length && users.length > 0}
                onCheckedChange={selectAllUsers}
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          )}

          {Array.isArray(users) && users.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}

          {Array.isArray(users) && users.length > 0 && (
            <div className="space-y-2">
              {users.map((user: UserFormData & { id: string; status: string }) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => toggleUserSelection(user.id)}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{user.name}</h3>
                      <Badge className={getRoleColor(user.role)}>
                        {renderValue(user.role)}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {renderValue(user.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                      {user.mobileContact && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.mobileContact}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </span>
                      {user.lastLogin && (
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Last login: {format(new Date(user.lastLogin), 'MMM dd')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (leave empty to keep current)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter new password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="Analyst">Analyst</SelectItem>
                  <SelectItem value="Client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateUser}
                disabled={updating}
                className="flex-1"
              >
                {updating ? 'Updating...' : 'Update User'}
              </Button>
              <Button
                variant="outline"
                onClick={closeEditDialog}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
