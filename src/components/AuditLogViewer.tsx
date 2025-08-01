import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarIcon, 
  Search, 
  Filter, 
  Eye, 
  User, 
  Clock, 
  Activity,
  Database,
  FileText,
  Building2,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuditLogs, useAuditLogStats } from '@/hooks/useApi';
import { apiService } from '@/services/apiService';

interface AuditLogFilters {
  search?: string;
  action?: string;
  resource?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
}

export function AuditLogViewer() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 20,
  });

  const [selectedLog, setSelectedLog] = useState<{ id: string; action: string; userId: string; timestamp: string; details: string } | null>(null);

  // Fetch audit logs
  const { data: auditLogs, loading, error, refetch } = useAuditLogs(filters);
  
  // Fetch audit log statistics
  const { data: stats } = useAuditLogStats({
    startDate: filters.startDate?.toISOString(),
    endDate: filters.endDate?.toISOString(),
  });

  const handleFilterChange = (key: keyof AuditLogFilters, value: string | number | Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Reset page when other filters change
    }));
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <Database className="h-4 w-4 text-green-600" />;
      case 'update':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <Activity className="h-4 w-4 text-red-600" />;
      default:
        return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource.toLowerCase()) {
      case 'users':
        return <Users className="h-4 w-4" />;
      case 'companies':
        return <Building2 className="h-4 w-4" />;
      case 'editorials':
        return <FileText className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const viewLogDetails = async (logId: string) => {
    try {
      const response = await apiService.getAuditLogById(logId);
      setSelectedLog(response.data);
    } catch (error) {
      console.error('Failed to fetch log details:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <Button onClick={() => refetch()} variant="outline">
          <Activity className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Actions</p>
                  <p className="text-2xl font-bold">{stats.totalActions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{stats.activeUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Resources</p>
                  <p className="text-2xl font-bold">{stats.resourceTypes || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">{stats.todayActions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Action Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select
                value={filters.action || 'all'}
                onValueChange={(value) => handleFilterChange('action', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="READ">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resource Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Resource</label>
              <Select
                value={filters.resource || 'all'}
                onValueChange={(value) => handleFilterChange('resource', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="companies">Companies</SelectItem>
                  <SelectItem value="editorials">Editorials</SelectItem>
                  <SelectItem value="publications">Publications</SelectItem>
                  <SelectItem value="data-entries">Data Entries</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !filters.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.startDate ? format(filters.startDate, "MMM dd") : "Start"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => handleFilterChange('startDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !filters.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.endDate ? format(filters.endDate, "MMM dd") : "End"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.endDate}
                      onSelect={(date) => handleFilterChange('endDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading audit logs...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">Failed to load audit logs: {error}</p>
            </div>
          )}

          {auditLogs && auditLogs.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No audit logs found</p>
            </div>
          )}

          {auditLogs && auditLogs.length > 0 && (
            <div className="space-y-2">
              {auditLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    {getResourceIcon(log.resource)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <span className="text-sm font-medium">{log.resource}</span>
                      {log.resourceId && (
                        <span className="text-xs text-muted-foreground">
                          ID: {log.resourceId.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.user?.name || 'Unknown User'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                      {log.ipAddress && (
                        <span>IP: {log.ipAddress}</span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => viewLogDetails(log.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {auditLogs && auditLogs.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, auditLogs.length)} of {auditLogs.length} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange('page', filters.page - 1)}
                  disabled={filters.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                  disabled={auditLogs.length < filters.limit}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      {selectedLog && (
        <Card className="fixed inset-4 z-50 overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Audit Log Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Action</label>
                  <p className="text-sm">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Resource</label>
                  <p className="text-sm">{selectedLog.resource}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">User</label>
                  <p className="text-sm">{selectedLog.user?.name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Timestamp</label>
                  <p className="text-sm">{format(new Date(selectedLog.createdAt), 'PPpp')}</p>
                </div>
              </div>
              
              {selectedLog.details && (
                <div>
                  <label className="text-sm font-medium">Details</label>
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
