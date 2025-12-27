import React, { useState, useEffect, useMemo } from 'react';
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
  Users,
  Download,
  RefreshCw,
  X,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle,
  History,
  TrendingUp,
  Shield,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MoreHorizontal
} from 'lucide-react';
import { format, formatDistanceToNow, startOfDay, endOfDay, subDays, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuditLogs, useAuditLogStats } from '@/hooks/useApi';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

interface AuditLogFilters {
  search?: string;
  action?: string | string[];
  resource?: string | string[];
  resource_type?: string | string[];
  user_id?: string;
  userId?: string;
  severity?: string | string[];
  date_from?: Date;
  date_to?: Date
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  description: string;
  severity: string;
  metadata?: any;
  old_values?: any;
  new_values?: any;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  ip_address?: string;
  user_agent?: string;
  createdAt: string;
}

const SEVERITY_CONFIG = {
  INFO: {
    icon: Info,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    dotColor: 'bg-blue-500'
  },
  WARNING: {
    icon: AlertTriangle,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    dotColor: 'bg-amber-500'
  },
  ERROR: {
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
    dotColor: 'bg-red-500'
  },
  CRITICAL: {
    icon: Shield,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    dotColor: 'bg-purple-500'
  }
};

const ACTION_CONFIG = {
  CREATE: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  UPDATE: { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  DELETE: { icon: X, color: 'text-red-600', bgColor: 'bg-red-50' },
  READ: { icon: Eye, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  LOGIN: { icon: User, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  LOGOUT: { icon: User, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  EXPORT: { icon: Download, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  IMPORT: { icon: Database, color: 'text-teal-600', bgColor: 'bg-teal-50' },
};

const PRESET_RANGES = [
  { label: 'Today', getValue: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) }) },
  { label: 'Last 7 days', getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: 'Last 30 days', getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: 'Last 3 months', getValue: () => ({ start: subMonths(new Date(), 3), end: new Date() }) },
];

export function AuditLogViewer() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch audit logs
  const { data: logsData, loading, error, refetch } = useAuditLogs(filters);
  const auditLogs = logsData?.data || [];
  const pagination = logsData?.pagination || {};
  
  // Fetch audit log statistics
  const { data: stats, loading: statsLoading } = useAuditLogStats({
    startDate: filters.startDate?.toISOString(),
    endDate: filters.endDate?.toISOString(),
  });

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
  };

  const handleDatePreset = (preset: typeof PRESET_RANGES[0]) => {
    const { start, end } = preset.getValue();
    setFilters(prev => ({
      ...prev,
      startDate: start,
      endDate: end,
      page: 1
    }));
  };

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  };

  const viewLogDetails = async (log: AuditLog) => {
    try {
      const response = await apiService.getAuditLogById(log.id);
      setSelectedLog(response.data);
    } catch (error) {
      console.error('Failed to fetch log details:', error);
      setSelectedLog(log);
    }
  };

  const API_BASE_URL = 'https://pplus-alde.onrender.com';

  const handleExport = async (format: 'json' | 'csv') => {
    setIsExporting(true);
    try {
      const queryParams = new URLSearchParams();

      const validAuditFilters: (keyof typeof filters)[] = [
        'action',
        'resource_type',
        'user_id',
        'severity',
        'date_from',
        'date_to'
      ];

      Object.entries(filters).forEach(([key, value]) => {
        if (
          value &&
          !['page', 'limit', 'sortBy', 'sortOrder'].includes(key) &&
          validAuditFilters.includes(key as any)
        ) {
          if (value instanceof Date) {
            queryParams.append(key, value.toISOString().split('T')[0]); // YYYY-MM-DD
          } else if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, String(v)));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });

      queryParams.append('format', format);

      const url = `${API_BASE_URL}/api/audit-logs/export?${queryParams.toString()}`;

      const token = localStorage.getItem('token')

      const response = await fetch(url, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }), 
      },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Export failed (${response.status})`);
      }

      const contentType = response.headers.get('content-type') || '';
      const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;

      let blob: Blob;

      if (format === 'csv' || contentType.includes('text/csv')) {
        const text = await response.text();
        if (text.trim() === '' || text.includes('<!DOCTYPE html>')) {
          throw new Error('Received HTML instead of file — check backend route');
        }
        blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
      } else {
        const json = await response.json();
        const prettyJson = JSON.stringify(json, null, 2);
        blob = new Blob([prettyJson], { type: 'application/json' });
      }

      // Trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`Audit logs exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error('Audit logs export failed:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to export audit logs'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const getActionConfig = (action: string) => {
    return ACTION_CONFIG[action as keyof typeof ACTION_CONFIG] || {
      icon: Activity,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    };
  };

  const getSeverityConfig = (severity: string) => {
    return SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.INFO;
  };

  const getResourceIcon = (resource_type: string) => {
    const iconMap: Record<string, any> = {
      users: Users,
      companies: Building2,
      editorials: FileText,
      publications: FileText,
      auth: Shield,
      audit_logs: History
    };
    const Icon = iconMap[resource_type.toLowerCase()] || Database;
    return <Icon className="h-4 w-4" />;
  };

  const hasActiveFilters = useMemo(() => {
    return !!(filters.search || filters.action || filters.resource_type || 
              filters.userId || filters.severity || filters.startDate || filters.endDate);
  }, [filters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Audit Logs
            </h1>
            <p className="text-slate-600 mt-1">Monitor system activity and security events</p>
          </div>
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" disabled={isExporting} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => handleExport('json')}
                    disabled={isExporting}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as JSON
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => handleExport('csv')}
                    disabled={isExporting}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Export as CSV
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && !statsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Actions</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalActions?.toLocaleString() || 0}</p>
                    {stats.timeline && stats.timeline.length > 0 && (
                      <p className="text-xs text-slate-500 mt-1">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        Last 7 days
                      </p>
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Active Users</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeUsers?.toLocaleString() || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Unique contributors</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Resource Types</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.resourceTypes?.toLocaleString() || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Different resources</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Database className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Today's Activity</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stats.todayActions?.toLocaleString() || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {format(new Date(), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">Active</Badge>
                )}
              </CardTitle>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-slate-600"
                  >
                    Clear all
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {showFilters && (
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Quick Date Presets */}
                <div className="flex flex-wrap gap-2">
                  {PRESET_RANGES.map(preset => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDatePreset(preset)}
                      className={cn(
                        "text-xs",
                        filters.startDate && 
                        preset.getValue().start.getTime() === filters.startDate.getTime() &&
                        "bg-blue-50 border-blue-300"
                      )}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                    <label className="text-sm font-medium text-slate-700">Action</label>
                    <Select
                      value={filters.action as string || 'all'}
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
                        <SelectItem value="LOGIN">Login</SelectItem>
                        <SelectItem value="LOGOUT">Logout</SelectItem>
                        <SelectItem value="EXPORT">Export</SelectItem>
                        <SelectItem value="IMPORT">Import</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Resource Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Resource</label>
                    <Select
                      value={filters.resource_type as string || 'all'}
                      onValueChange={(value) => handleFilterChange('resource_type', value === 'all' ? undefined : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All resources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Resources</SelectItem>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="companies">Companies</SelectItem>
                        <SelectItem value="editorials">Editorials</SelectItem>
                        <SelectItem value="social_media_mentions">Social Media Mentions</SelectItem>
                        <SelectItem value="daily_mentions">Daily Mentions</SelectItem>
                        <SelectItem value="outcome_and_insights">Outcome and Insights</SelectItem>
                        <SelectItem value="industry_landscape_overviews">Industry Landscape Overview</SelectItem>
                        <SelectItem value="swot_analysis">SWOT Analysis</SelectItem>
                        <SelectItem value="publications">Publications</SelectItem>
                        <SelectItem value="auth">Authentication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Severity Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Severity</label>
                    <Select
                      value={filters.severity as string || 'all'}
                      onValueChange={(value) => handleFilterChange('severity', value === 'all' ? undefined : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All severities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="INFO">Info</SelectItem>
                        <SelectItem value="WARNING">Warning</SelectItem>
                        <SelectItem value="ERROR">Error</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.startDate && "text-slate-400"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.startDate ? format(filters.startDate, "MMM dd, yyyy") : "Pick a date"}
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
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.endDate && "text-slate-400"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.endDate ? format(filters.endDate, "MMM dd, yyyy") : "Pick a date"}
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
          )}
        </Card>

        {/* Audit Logs Table */}
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Audit Trail</CardTitle>
              {pagination.total > 0 && (
                <p className="text-sm text-slate-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </p>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}

            {error && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                <p className="text-red-600 font-medium">Failed to load audit logs</p>
                <p className="text-slate-600 text-sm mt-1">{error}</p>
                <Button onClick={() => refetch()} variant="outline" className="mt-4">
                  Try Again
                </Button>
              </div>
            )}

            {!loading && !error && auditLogs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <History className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-slate-600 font-medium">No audit logs found</p>
                <p className="text-slate-500 text-sm mt-1">
                  {hasActiveFilters 
                    ? 'Try adjusting your filters' 
                    : 'Audit logs will appear here as actions are performed'}
                </p>
              </div>
            )}

            {!loading && !error && auditLogs.length > 0 && (
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log: AuditLog) => {
                  const actionConfig = getActionConfig(log.action);
                  const severityConfig = getSeverityConfig(log.severity);
                  const isExpanded = expandedLogs.has(log.id);
                  const ActionIcon = actionConfig.icon;
                  const SeverityIcon = severityConfig.icon;

                  return (
                    <div
                      key={log.id}
                      className="p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Timeline dot */}
                        <div className="relative flex flex-col items-center">
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center",
                            actionConfig.bgColor
                          )}>
                            <ActionIcon className={cn("h-5 w-5", actionConfig.color)} />
                          </div>
                          {!isExpanded && (
                            <div className="w-0.5 h-4 bg-slate-200 mt-1" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <Badge className={cn("text-xs font-medium", severityConfig.color)}>
                                  <SeverityIcon className="h-3 w-3 mr-1" />
                                  {log.severity}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {log.action}
                                </Badge>
                                <span className="flex items-center gap-1 text-sm font-medium text-slate-700">
                                  {getResourceIcon(log.resource_type)}
                                  {log.resource_type}
                                </span>
                                {log.resource_id && (
                                  <span className="text-xs text-slate-500 font-mono">
                                    #{log.resource_id.slice(0, 8)}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 mb-2">
                                {log.description || 'No description available'}
                              </p>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLogExpansion(log.id)}
                              className="shrink-0"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            {log.user && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {log.user.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                            </span>
                            {log.ip_address && (
                              <span className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                {log.ip_address}
                              </span>
                            )}
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => viewLogDetails(log)}
                              className="h-auto p-0 text-xs"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View details
                            </Button>
                          </div>

                          {/* Expanded details */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                              {log.old_values && (
                                <div>
                                  <p className="text-xs font-medium text-slate-700 mb-2">Previous Values:</p>
                                  <pre className="text-xs bg-slate-50 p-3 rounded border border-slate-200 overflow-auto">
                                    {JSON.stringify(log.old_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.new_values && (
                                <div>
                                  <p className="text-xs font-medium text-slate-700 mb-2">New Values:</p>
                                  <pre className="text-xs bg-slate-50 p-3 rounded border border-slate-200 overflow-auto">
                                    {JSON.stringify(log.new_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.metadata && Object.keys(log.metadata).length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-slate-700 mb-2">Metadata:</p>
                                  <pre className="text-xs bg-slate-50 p-3 rounded border border-slate-200 overflow-auto">
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.user_agent && (
                                <div>
                                  <p className="text-xs font-medium text-slate-700 mb-1">User Agent:</p>
                                  <p className="text-xs text-slate-600 font-mono">{log.user_agent}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && auditLogs.length > 0 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('page', pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFilterChange('page', pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto">
              <CardHeader className="border-b sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Audit Log Details</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLog(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Header info */}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
                      getActionConfig(selectedLog.action).bgColor
                    )}>
                      {React.createElement(getActionConfig(selectedLog.action).icon, {
                        className: cn("h-6 w-6", getActionConfig(selectedLog.action).color)
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityConfig(selectedLog.severity).color}>
                          {React.createElement(getSeverityConfig(selectedLog.severity).icon, {
                            className: "h-3 w-3 mr-1"
                          })}
                          {selectedLog.severity}
                        </Badge>
                        <Badge variant="outline">{selectedLog.action}</Badge>
                      </div>
                      <p className="text-slate-700">{selectedLog.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Resource Type</label>
                      <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                        {getResourceIcon(selectedLog.resource_type)}
                        {selectedLog.resource_type}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Resource ID</label>
                      <p className="text-sm text-slate-600 mt-1 font-mono">
                        {selectedLog.resource_id || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">User</label>
                      <p className="text-sm text-slate-600 mt-1">
                        {selectedLog.user?.name || 'System'}
                        {selectedLog.user?.email && (
                          <span className="text-xs text-slate-500 block">{selectedLog.user.email}</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Timestamp</label>
                      <p className="text-sm text-slate-600 mt-1">
                        {format(new Date(selectedLog.createdAt), 'PPpp')}
                      </p>
                    </div>
                    {selectedLog.ip_address && (
                      <div>
                        <label className="text-sm font-medium text-slate-700">IP Address</label>
                        <p className="text-sm text-slate-600 mt-1 font-mono">{selectedLog.ip_address}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedLog.old_values && (
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Previous Values</label>
                      <pre className="text-xs bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-auto max-h-48">
                        {JSON.stringify(selectedLog.old_values, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.new_values && (
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">New Values</label>
                      <pre className="text-xs bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-auto max-h-48">
                        {JSON.stringify(selectedLog.new_values, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Additional Metadata</label>
                      <pre className="text-xs bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-auto max-h-48">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.user_agent && (
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">User Agent</label>
                      <p className="text-xs text-slate-600 font-mono bg-slate-50 p-3 rounded border border-slate-200">
                        {selectedLog.user_agent}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
