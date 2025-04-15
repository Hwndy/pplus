
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataCard } from '@/components/ui/DataCard';
import { Stat } from '@/components/ui/Stat';
import { DataTable } from '@/components/ui/DataTable';
import { dashboardSummary, users, dataParameters, clients, allDataEntries } from '@/utils/mockData';
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

export function AdminDashboard() {
  const [selectedSection, setSelectedSection] = useState<'overview' | 'users' | 'parameters' | 'content-review' | 'data-entry'>('overview');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
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
        </div>
      </div>

      {selectedSection === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <DataCard title="Total Users" variant="glass" icon={<Users size={24} />}>
              <Stat
                label="System Users"
                value={users.length}
                subtitle="Active users in the system"
              />
            </DataCard>
            <DataCard title="Data Parameters" variant="glass" icon={<Settings size={24} />}>
              <Stat
                label="Active Parameters"
                value={dataParameters.length}
                subtitle="Media monitoring parameters"
              />
            </DataCard>
            <DataCard title="Total Clients" variant="glass" icon={<Users size={24} />}>
              <Stat
                label="Active Clients"
                value={clients.length}
                subtitle="Organizations being monitored"
              />
            </DataCard>
            <DataCard title="System Status" variant="glass" icon={<AlertTriangle size={24} />}>
              <Stat
                label="System Load"
                value="Normal"
                subtitle="All systems operational"
                trend={0}
              />
            </DataCard>
          </div>

          <h2 className="text-xl font-semibold mt-8">Content Management</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <DataCard title="Pending Review" variant="glass" icon={<AlertCircle size={24} />}>
              <Stat
                label="Content Pending Review"
                value={allDataEntries.filter(e => e.status === 'pending').length}
                subtitle="Awaiting approval"
              />
            </DataCard>
            <DataCard title="Approved Content" variant="glass" icon={<CheckCircle size={24} />}>
              <Stat
                label="Content Approved"
                value={allDataEntries.filter(e => e.status === 'approved').length}
                subtitle="Successfully processed"
              />
            </DataCard>
            <DataCard title="Rejected Content" variant="glass" icon={<XCircle size={24} />}>
              <Stat
                label="Content Rejected"
                value={allDataEntries.filter(e => e.status === 'rejected').length}
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
                    data={dashboardSummary.mentionTrend}
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
                      data={dashboardSummary.mediaBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dashboardSummary.mediaBreakdown.map((entry, index) => (
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
          <DataCard
            title="User Management"
            description="View and manage all system users"
            variant="glass"
          >
            <DataTable columns={userColumns} data={users} />
          </DataCard>
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
              data={dataParameters}
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
                value={allDataEntries.filter(e => e.status === 'pending').length}
                subtitle="Awaiting approval"
              />
            </DataCard>
            <DataCard title="Approved Content" variant="glass" icon={<CheckSquare size={24} />}>
              <Stat
                label="Content Approved"
                value={allDataEntries.filter(e => e.status === 'approved').length}
                subtitle="Successfully processed"
              />
            </DataCard>
            <DataCard title="Rejected Content" variant="glass" icon={<AlertTriangle size={24} />}>
              <Stat
                label="Content Rejected"
                value={allDataEntries.filter(e => e.status === 'rejected').length}
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
                  <Link to="/dashboard/content-review">
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
                value={allDataEntries.filter(e => e.status === 'pending').length}
                subtitle="Awaiting approval"
              />
            </DataCard>
            <DataCard title="Approved Entries" variant="glass" icon={<CheckCircle size={24} />}>
              <Stat
                label="Entries Approved"
                value={allDataEntries.filter(e => e.status === 'approved').length}
                subtitle="Successfully validated"
              />
            </DataCard>
            <DataCard title="Rejected Entries" variant="glass" icon={<XCircle size={24} />}>
              <Stat
                label="Entries Rejected"
                value={allDataEntries.filter(e => e.status === 'rejected').length}
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
                  <Link to="/dashboard/daily-mentions" className="w-full cursor-pointer">
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
    </div>
  );
}
