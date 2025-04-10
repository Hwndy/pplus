
import { useState } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Stat } from '@/components/ui/Stat';
import { DataTable } from '@/components/ui/DataTable';
import { allDataEntries, clients, dataParameters, mediaChannels, users } from '@/utils/mockData';
import { ColumnDef } from '@tanstack/react-table';
import { BarChart, CheckSquare, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusStyles()} capitalize`}>
      {status}
    </Badge>
  );
}

export function SupervisorDashboard() {
  const [pendingEntries, setPendingEntries] = useState(
    allDataEntries.filter(e => e.status === 'pending')
  );
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentEntry, setCurrentEntry] = useState<any>(null);

  // Get client name by ID
  const getClientName = (id: string) => {
    return clients.find(c => c.id === id)?.name || 'Unknown Client';
  };

  // Get parameter name by ID
  const getParameterName = (id: string) => {
    return dataParameters.find(p => p.id === id)?.name || 'Unknown Parameter';
  };

  // Get channel name by ID
  const getChannelName = (id: string) => {
    return mediaChannels.find(c => c.id === id)?.name || 'Unknown Channel';
  };

  // Get analyst name by ID
  const getAnalystName = (id: string) => {
    return users.find(u => u.id === id)?.name || 'Unknown Analyst';
  };

  // Handle approval
  const handleApprove = (entry: any) => {
    toast.success(`Entry for ${getClientName(entry.clientId)} approved successfully`);
    // In a real app, we'd make an API call here
    // For demo, we'll just update the local state
    setPendingEntries(pendingEntries.filter(e => e.id !== entry.id));
  };

  // Handle reject dialog
  const openRejectDialog = (entry: any) => {
    setCurrentEntry(entry);
    setRejectReason('');
    setShowRejectDialog(true);
  };

  // Submit rejection
  const submitRejection = () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    toast.success(`Entry for ${getClientName(currentEntry.clientId)} rejected`);
    // In a real app, we'd make an API call here
    // For demo, we'll just update the local state
    setPendingEntries(pendingEntries.filter(e => e.id !== currentEntry.id));
    setShowRejectDialog(false);
  };

  // Define columns for data entries table
  const dataEntryColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'clientId',
      header: 'Client',
      cell: ({ row }) => getClientName(row.getValue('clientId')),
    },
    {
      accessorKey: 'parameterId',
      header: 'Parameter',
      cell: ({ row }) => getParameterName(row.getValue('parameterId')),
    },
    {
      accessorKey: 'channelId',
      header: 'Channel',
      cell: ({ row }) => getChannelName(row.getValue('channelId')),
    },
    {
      accessorKey: 'value',
      header: 'Value',
    },
    {
      accessorKey: 'analystId',
      header: 'Submitted By',
      cell: ({ row }) => getAnalystName(row.getValue('analystId')),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button size="sm" onClick={() => handleApprove(row.original)}>
            Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={() => openRejectDialog(row.original)}>
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Supervisor Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DataCard title="Pending Entries" variant="glass" icon={<AlertTriangle size={24} />}>
          <Stat
            label="Entries Pending Review"
            value={pendingEntries.length}
            subtitle="Submitted by analysts"
          />
        </DataCard>
        <DataCard title="Approved Today" variant="glass" icon={<CheckSquare size={24} />}>
          <Stat
            label="Entries Approved Today"
            value={5}
            subtitle="Processed entries"
            trend={20}
            trendLabel="vs. yesterday"
          />
        </DataCard>
        <DataCard title="Data Volume" variant="glass" icon={<BarChart size={24} />}>
          <Stat
            label="Total Data Points"
            value={allDataEntries.length}
            subtitle="Across all clients"
            trend={8}
            trendLabel="vs. last week"
          />
        </DataCard>
      </div>

      <DataCard 
        title="Pending Data Review" 
        description="Review and approve/reject data entries submitted by analysts"
        variant="glass"
      >
        <DataTable
          columns={dataEntryColumns}
          data={pendingEntries}
          searchPlaceholder="Search entries..."
        />
      </DataCard>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Data Entry</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this entry. This feedback will be sent to the analyst.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Client</p>
              <p className="text-sm">{currentEntry ? getClientName(currentEntry.clientId) : ''}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Parameter</p>
              <p className="text-sm">{currentEntry ? getParameterName(currentEntry.parameterId) : ''}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Rejection Reason</p>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this entry is being rejected..."
                className="min-h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitRejection}>
              Reject Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
