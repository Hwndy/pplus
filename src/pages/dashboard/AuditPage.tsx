
import { useState } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowRightLeft, 
  Download, 
  Filter, 
  AlertCircle, 
  Search,
  Calendar,
  Shield,
  Activity
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  userAgent: string;
  status: 'success' | 'warning' | 'error';
  module: string;
}

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: '2024-01-10 14:32:25',
    user: 'admin@example.com',
    action: 'User Created',
    resource: 'Users',
    details: 'Created user account for analyst@example.com',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
    module: 'User Management'
  },
  {
    id: '2',
    timestamp: '2024-01-10 13:15:42',
    user: 'admin@example.com',
    action: 'Social Media Analysis',
    resource: 'Analytics',
    details: 'Ran social media analysis for Company A',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
    module: 'Analytics'
  },
  // Add more mock data as needed
];

const auditColumns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
  },
  {
    accessorKey: 'user',
    header: 'User',
  },
  {
    accessorKey: 'module',
    header: 'Module',
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      const action = row.getValue('action') as string;
      const status = row.original.status;
      
      const getStatusStyle = (status: string) => {
        switch (status) {
          case 'success': return 'bg-green-100 text-green-800';
          case 'warning': return 'bg-yellow-100 text-yellow-800';
          case 'error': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      };
      
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(status)}`}>
          {action}
        </span>
      );
    },
  },
  {
    accessorKey: 'resource',
    header: 'Resource',
  },
  {
    accessorKey: 'details',
    header: 'Details',
  },
  {
    accessorKey: 'ip',
    header: 'IP Address',
  },
  {
    accessorKey: 'userAgent',
    header: 'User Agent',
  }
];

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const stats = {
    totalLogins: 158,
    dataOperations: 47,
    securityAlerts: 3,
    systemChanges: 12
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Audit Logs</h1>
        <div className="flex space-x-2">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <DataCard title="System Access" variant="glass" icon={<Shield size={24} />}>
          <div className="p-4">
            <div className="text-2xl font-bold">{stats.totalLogins}</div>
            <div className="text-sm text-muted-foreground">Login attempts today</div>
          </div>
        </DataCard>
        <DataCard title="Data Operations" variant="glass" icon={<Activity size={24} />}>
          <div className="p-4">
            <div className="text-2xl font-bold">{stats.dataOperations}</div>
            <div className="text-sm text-muted-foreground">Operations today</div>
          </div>
        </DataCard>
        <DataCard title="Security Alerts" variant="glass" icon={<AlertCircle size={24} />}>
          <div className="p-4">
            <div className="text-2xl font-bold">{stats.securityAlerts}</div>
            <div className="text-sm text-muted-foreground">Active alerts</div>
          </div>
        </DataCard>
        <DataCard title="System Changes" variant="glass" icon={<ArrowRightLeft size={24} />}>
          <div className="p-4">
            <div className="text-2xl font-bold">{stats.systemChanges}</div>
            <div className="text-sm text-muted-foreground">Changes this week</div>
          </div>
        </DataCard>
      </div>
      
      <DataCard
        title="System Audit Trail"
        description="Comprehensive log of all system activities and user actions"
        variant="glass"
      >
        <DataTable 
          columns={auditColumns} 
          data={mockAuditLogs} 
          searchable
          filterable
        />
      </DataCard>
    </div>
  );
}
