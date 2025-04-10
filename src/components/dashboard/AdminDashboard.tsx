
import { useState } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Stat } from '@/components/ui/Stat';
import { DataTable } from '@/components/ui/DataTable';
import { dashboardSummary, users, dataParameters, clients } from '@/utils/mockData';
import { Users, Settings, BarChart, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ColumnDef } from '@tanstack/react-table';

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
  const [selectedSection, setSelectedSection] = useState<'overview' | 'users' | 'parameters'>('overview');
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-2">
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
    </div>
  );
}
