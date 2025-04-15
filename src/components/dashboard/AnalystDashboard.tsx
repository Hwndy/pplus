
import { useState } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Stat } from '@/components/ui/Stat';
import { DataTable } from '@/components/ui/DataTable';
import { allDataEntries, clients, dataParameters, mediaChannels } from '@/utils/mockData';
import { ColumnDef } from '@tanstack/react-table';
import { FileInput, Save, SendHorizontal, CheckCircle, XCircle, AlertCircle, FileText, Newspaper, Zap, Target, Share2, LineChart, ChevronDown, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth/AuthContext';
import { Link } from 'react-router-dom';

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'draft':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {status === 'approved' && <CheckCircle className="h-4 w-4 text-green-600" />}
      {status === 'rejected' && <XCircle className="h-4 w-4 text-red-600" />}
      {status === 'pending' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
      {status === 'draft' && <Save className="h-4 w-4 text-blue-600" />}
      <Badge variant="outline" className={`${getStatusStyles()} capitalize`}>
        {status}
      </Badge>
    </div>
  );
}

export function AnalystDashboard() {
  const { user } = useAuth();
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [mySubmissions, setMySubmissions] = useState(
    allDataEntries.filter(entry => entry.analystId === '3')
  );

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    clientId: '',
    parameterId: '',
    channelId: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setNewEntry({
      ...newEntry,
      [field]: value
    });
  };

  // Submit new entry
  const submitEntry = (asDraft: boolean = false) => {
    // Validate form
    if (!newEntry.clientId || !newEntry.parameterId || !newEntry.channelId || !newEntry.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Create new entry object
    const entry = {
      id: (mySubmissions.length + 100).toString(), // Generate a unique ID
      ...newEntry,
      value: parseFloat(newEntry.value),
      analystId: '3', // Current user ID
      status: asDraft ? 'draft' : 'pending',
      comments: ''
    };

    // In a real app, we'd make an API call here
    // For demo, we'll just update the local state
    setMySubmissions([entry, ...mySubmissions]);

    toast.success(asDraft
      ? 'Entry saved as draft'
      : 'Entry submitted successfully for review'
    );

    setShowEntryDialog(false);

    // Reset form
    setNewEntry({
      clientId: '',
      parameterId: '',
      channelId: '',
      value: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  // Define columns for my submissions table
  const submissionsColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'clientId',
      header: 'Client',
      cell: ({ row }) => {
        const clientId = row.getValue('clientId');
        return clients.find(c => c.id === clientId)?.name || 'Unknown';
      },
    },
    {
      accessorKey: 'parameterId',
      header: 'Parameter',
      cell: ({ row }) => {
        const parameterId = row.getValue('parameterId');
        return dataParameters.find(p => p.id === parameterId)?.name || 'Unknown';
      },
    },
    {
      accessorKey: 'channelId',
      header: 'Channel',
      cell: ({ row }) => {
        const channelId = row.getValue('channelId');
        return mediaChannels.find(c => c.id === channelId)?.name || 'Unknown';
      },
    },
    {
      accessorKey: 'value',
      header: 'Value',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      accessorKey: 'comments',
      header: 'Comments',
      cell: ({ row }) => {
        const comments = row.getValue('comments');
        return comments ? comments : '-';
      },
    },
  ];

  // Count by status
  const pendingCount = mySubmissions.filter(e => e.status === 'pending').length;
  const approvedCount = mySubmissions.filter(e => e.status === 'approved').length;
  const rejectedCount = mySubmissions.filter(e => e.status === 'rejected').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analyst Dashboard</h1>
        <div className="flex gap-2">
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
          <Button asChild variant="outline">
            <Link to="/dashboard/submissions">
              <ClipboardList className="mr-2 h-4 w-4" />
              My Submissions
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <DataCard title="Pending Review" variant="glass" icon={<AlertCircle size={24} />}>
          <Stat
            label="Entries Pending Review"
            value={pendingCount}
            subtitle="Awaiting supervisor approval"
          />
        </DataCard>
        <DataCard title="Approved Entries" variant="glass" icon={<CheckCircle size={24} />}>
          <Stat
            label="Entries Approved"
            value={approvedCount}
            subtitle="Successfully validated"
          />
        </DataCard>
        <DataCard title="Rejected Entries" variant="glass" icon={<XCircle size={24} />}>
          <Stat
            label="Entries Rejected"
            value={rejectedCount}
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

      <DataCard
        title="My Submissions"
        description="View and manage your submitted data entries"
        variant="glass"
      >
        <DataTable
          columns={submissionsColumns}
          data={mySubmissions}
          searchPlaceholder="Search entries..."
        />
      </DataCard>

      {/* New Entry Dialog */}
      <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Data Entry</DialogTitle>
            <DialogDescription>
              Enter media monitoring data for a client.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select onValueChange={(value) => handleInputChange('clientId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parameter">Parameter</Label>
              <Select onValueChange={(value) => handleInputChange('parameterId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parameter" />
                </SelectTrigger>
                <SelectContent>
                  {dataParameters.map(param => (
                    <SelectItem key={param.id} value={param.id}>
                      {param.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Media Channel</Label>
              <Select onValueChange={(value) => handleInputChange('channelId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {mediaChannels.map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="Enter value"
                  value={newEntry.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button variant="outline" onClick={() => submitEntry(true)}>
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
            <Button onClick={() => submitEntry(false)}>
              <SendHorizontal className="mr-2 h-4 w-4" />
              Submit for Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
