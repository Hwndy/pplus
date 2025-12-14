
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataCard } from '@/components/ui/DataCard';
import { Stat } from '@/components/ui/Stat';
import { DataTable } from '@/components/ui/DataTable';
import { useDashboardSummary, useUsers, useDataParameters, useCompanies, useEditorials, useDataEntries, useAuditLogStats } from '@/hooks/useApi';
import { GlobalSearch } from '@/components/GlobalSearch';
import { DataExport } from '@/components/DataExport';
import { UserManagement } from '@/components/UserManagement';
import { AuditLogViewer } from '@/components/AuditLogViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Users, Settings, BarChart, AlertTriangle, CheckCircle, XCircle,
  FileText, Newspaper, Target, Share2, LineChart, Zap, CheckSquare,
  FileInput, ChevronDown, ClipboardList, Eye, AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Define columns for users table
const userColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return <span className="capitalize">{role}</span>;
    },
  },
  {
    accessorKey: 'active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('active') as boolean;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      );
    },
  },
];

interface AuditLogStats {
  total_users?: number;
  total_supervisors?: number;
  total_analysts?: number;
  total_clients?: number;
  content_pending?: number;
  content_approved?: number;
  content_rejected?: number;
}

export function AdminDashboard() {
  const [selectedSection, setSelectedSection] = useState<'overview' | 'users' | 'parameters' | 'content-review' | 'data-entry' | 'export' | 'audit'>('overview');

  // API hooks for real data
  const { data: dashboardData, loading: dashboardLoading, refetch: refetchDashboard } = useDashboardSummary();
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useUsers();
  const { data: parametersData, loading: parametersLoading } = useDataParameters();
  const { data: companiesData, loading: companiesLoading } = useCompanies();
  const { data: editorialsData, loading: editorialsLoading } = useEditorials();
  const { data: dataEntriesData, loading: dataEntriesLoading } = useDataEntries();
  const { data: response, loading: auditStatsLoading } = useAuditLogStats();
  const auditStats = (response as any)?.data as AuditLogStats | undefined;

  const handleSearchResult = (result: any) => {
    toast.success(`Selected: ${result.title}`);
    // Handle navigation based on result type
    switch (result.type) {
      case 'user':
        setSelectedSection('users');
        break;
      case 'company':
        // Navigate to companies page
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <GlobalSearch onResultSelect={handleSearchResult} className="mt-2" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedSection === 'overview'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => setSelectedSection('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedSection === 'users'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => setSelectedSection('users')}
          >
            Users
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedSection === 'parameters'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => setSelectedSection('parameters')}
          >
            Parameters
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedSection === 'content-review'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => setSelectedSection('content-review')}
          >
            Content Review
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedSection === 'data-entry'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => setSelectedSection('data-entry')}
          >
            Data Entry
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedSection === 'export'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => setSelectedSection('export')}
          >
            Export
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedSection === 'audit'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => setSelectedSection('audit')}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {selectedSection === 'overview' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mt-8">User Breakdown</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <DataCard title="Total Users" variant="glass" icon={<Users size={24} />}>
              <Stat
                label="All Registered Users"
                value={auditStatsLoading ? 'Loading...' : auditStats?.total_users ?? 0}
                subtitle="Across all roles"
              />
            </DataCard>

            <DataCard title="Supervisors" variant="glass" icon={<CheckCircle size={24} />}>
              <Stat
                label="Supervisors"
                value={auditStatsLoading ? 'Loading...' : auditStats?.total_supervisors ?? 0}
                subtitle="Content reviewers & managers"
              />
            </DataCard>

            <DataCard title="Analysts" variant="glass" icon={<FileText size={24} />}>
              <Stat
                label="Analysts"
                value={auditStatsLoading ? 'Loading...' : auditStats?.total_analysts ?? 0}
                subtitle="Data entry & monitoring staff"
              />
            </DataCard>

            <DataCard title="Clients" variant="glass" icon={<Target size={24} />}>
              <Stat
                label="Client Organizations"
                value={auditStatsLoading ? 'Loading...' : auditStats?.total_clients ?? 0}
                subtitle="Monitored entities"
              />
            </DataCard>
          </div>

          <h2 className="text-xl font-semibold mt-8">Content Management</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <DataCard title="Pending Review" variant="glass" icon={<AlertCircle size={24} />}>
              <Stat
                label="Content Pending Review"
                value={auditStatsLoading ? 'Loading...' : auditStats?.content_pending ?? 0}
                subtitle="Awaiting approval"
              />
            </DataCard>

            <DataCard title="Approved Content" variant="glass" icon={<CheckCircle size={24} />}>
              <Stat
                label="Content Approved"
                value={auditStatsLoading ? 'Loading...' : auditStats?.content_approved ?? 0}
                subtitle="Successfully processed"
              />
            </DataCard>

            <DataCard title="Rejected Content" variant="glass" icon={<XCircle size={24} />}>
              <Stat
                label="Content Rejected"
                value={auditStatsLoading ? 'Loading...' : auditStats?.content_rejected ?? 0}
                subtitle="Require attention"
              />
            </DataCard>

            <DataCard title="Quick Actions" variant="glass" icon={<Zap size={24} />}>
              <div className="p-4 flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard/content-review">
                    <Eye className="mr-2 h-4 w-4" />
                    Review Content
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard/editorial/create">
                    <Newspaper className="mr-2 h-4 w-4" />
                    Create Content
                  </Link>
                </Button>
              </div>
            </DataCard>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <DataCard title="Media Mentions Trend" variant="glass" icon={<BarChart size={24} />}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dashboardData?.mentionTrend || []}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorMentions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#0088FE"
                      fillOpacity={1}
                      fill="url(#colorMentions)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </DataCard>

            <DataCard title="Media Breakdown" variant="glass" icon={<BarChart size={24} />}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData?.mediaBreakdown || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(dashboardData?.mediaBreakdown || []).map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </DataCard>
          </div>
        </div>
      )}

      {selectedSection === 'users' && (
        <div className="space-y-6">
          <UserManagement />
        </div>
      )}

      {selectedSection === 'parameters' && (
        <div className="space-y-6">
          <DataCard
            title="Data Parameters"
            description="Configure media monitoring parameters"
            variant="glass"
          >
            <DataTable
              columns={[
                {
                  accessorKey: 'name',
                  header: 'Parameter Name',
                },
                {
                  accessorKey: 'category',
                  header: 'Category',
                },
                {
                  accessorKey: 'description',
                  header: 'Description',
                },
              ]}
              data={parametersData || []}
            />
          </DataCard>
        </div>
      )}

      {/* Content Review Section - Supervisor Functionality */}
      {selectedSection === 'content-review' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <DataCard title="Pending Review" variant="glass" icon={<AlertTriangle size={24} />}>
              <Stat
                label="Content Pending Review"
                value={dataEntriesLoading ? 'Loading...' : (Array.isArray(dataEntriesData) ? dataEntriesData.filter((e: any) => e.status === 'pending').length : 0)}
                subtitle="Awaiting approval"
              />
            </DataCard>
            <DataCard title="Approved Content" variant="glass" icon={<CheckSquare size={24} />}>
              <Stat
                label="Content Approved"
                value={dataEntriesLoading ? 'Loading...' : (Array.isArray(dataEntriesData) ? dataEntriesData.filter((e: any) => e.status === 'approved').length : 0)}
                subtitle="Successfully processed"
              />
            </DataCard>
            <DataCard title="Rejected Content" variant="glass" icon={<AlertTriangle size={24} />}>
              <Stat
                label="Content Rejected"
                value={dataEntriesLoading ? 'Loading...' : (Array.isArray(dataEntriesData) ? dataEntriesData.filter((e: any) => e.status === 'rejected').length : 0)}
                subtitle="Sent back for revision"
              />
            </DataCard>
          </div>

          <DataCard
            title="Content Awaiting Review"
            description="Review and approve content submitted by analysts"
            variant="glass"
          >
            <div className="p-4">
              <div className="flex flex-col gap-4">
                <Button asChild className="w-full md:w-auto">
                  <Link to="/dashboard/supervisordashboard">
                    <Eye className="mr-2 h-4 w-4" />
                    View All Content for Review
                  </Link>
                </Button>
              </div>
            </div>
          </DataCard>
        </div>
      )}

      {/* Data Entry Section - Analyst Functionality */}
      {selectedSection === 'data-entry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <DataCard title="Pending Review" variant="glass" icon={<AlertCircle size={24} />}>
              <Stat
                label="Entries Pending Review"
                value={dataEntriesLoading ? 'Loading...' : (Array.isArray(dataEntriesData) ? dataEntriesData.filter((e: any) => e.status === 'pending').length : 0)}
                subtitle="Awaiting approval"
              />
            </DataCard>
            <DataCard title="Approved Entries" variant="glass" icon={<CheckCircle size={24} />}>
              <Stat
                label="Entries Approved"
                value={dataEntriesLoading ? 'Loading...' : (Array.isArray(dataEntriesData) ? dataEntriesData.filter((e: any) => e.status === 'approved').length : 0)}
                subtitle="Successfully validated"
              />
            </DataCard>
            <DataCard title="Rejected Entries" variant="glass" icon={<XCircle size={24} />}>
              <Stat
                label="Entries Rejected"
                value={dataEntriesLoading ? 'Loading...' : (Array.isArray(dataEntriesData) ? dataEntriesData.filter((e: any) => e.status === 'rejected').length : 0)}
                subtitle="Require attention"
              />
            </DataCard>

            <DataCard title="Quick Actions" variant="glass" icon={<Zap size={24} />}>
              <div className="p-4 flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard/daily-mentions">
                    <FileText className="mr-2 h-4 w-4" />
                    Daily Mentions
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard/editorial">
                    <Newspaper className="mr-2 h-4 w-4" />
                    Editorial
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard/swot-mentions">
                    <Target className="mr-2 h-4 w-4" />
                    SWOT Mentions
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard/social-media-mentions">
                    <Share2 className="mr-2 h-4 w-4" />
                    Social Media
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard/outcome-insights">
                    <LineChart className="mr-2 h-4 w-4" />
                    Outcome & Insights
                  </Link>
                </Button>
              </div>
            </DataCard>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Create New Content</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <FileInput className="mr-2 h-4 w-4" />
                  Create New <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/editorial/create" className="w-full cursor-pointer">
                    <Newspaper className="mr-2 h-4 w-4" />
                    New Editorial
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/daily-mentions/create" className="w-full cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    New Daily Mention
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/swot-mentions" className="w-full cursor-pointer">
                    <Target className="mr-2 h-4 w-4" />
                    New SWOT Mention
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/outcome-insights" className="w-full cursor-pointer">
                    <LineChart className="mr-2 h-4 w-4" />
                    New Outcome & Insight
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <DataCard
            title="Recent Submissions"
            description="View and manage recently submitted data entries"
            variant="glass"
          >
            <div className="p-4">
              <Button asChild className="w-full md:w-auto">
                <Link to="/dashboard/submissions">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  View All Submissions
                </Link>
              </Button>
            </div>
          </DataCard>
        </div>
      )}

      {/* Export Section */}
      {selectedSection === 'export' && (
        <div className="space-y-6">
          <DataExport />
        </div>
      )}

      {/* Audit Logs Section */}
      {selectedSection === 'audit' && (
        <div className="space-y-6">
          <AuditLogViewer />
        </div>
      )}
    </div>
  );
}
