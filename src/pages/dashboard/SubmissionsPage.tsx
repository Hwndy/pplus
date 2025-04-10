
import { useState } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { DataTable } from '@/components/ui/DataTable';
import { allDataEntries, clients, dataParameters, mediaChannels } from '@/utils/mockData';
import { CheckCircle, XCircle, AlertCircle, Save, FileEdit } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useAuth } from '@/components/auth/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const getIcon = () => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600 mr-1" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600 mr-1" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600 mr-1" />;
      case 'draft':
        return <Save className="h-4 w-4 text-blue-600 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center">
      {getIcon()}
      <Badge variant="outline" className={`${getStatusStyles()} capitalize`}>
        {status}
      </Badge>
    </div>
  );
}

export default function SubmissionsPage() {
  const { user } = useAuth();
  const [viewDetailsDialog, setViewDetailsDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  
  // Filter entries by the current user (in a real app, this would use the actual user ID)
  const mySubmissions = allDataEntries.filter(entry => entry.analystId === '3');
  
  // Create separate arrays for each status type
  const drafts = mySubmissions.filter(entry => entry.status === 'draft');
  const pending = mySubmissions.filter(entry => entry.status === 'pending');
  const approved = mySubmissions.filter(entry => entry.status === 'approved');
  const rejected = mySubmissions.filter(entry => entry.status === 'rejected');
  
  // Define columns for submissions table
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
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        
        return (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => viewEntryDetails(row.original)}
            >
              View
            </Button>
            
            {status === 'draft' && (
              <Button 
                variant="outline" 
                size="sm"
              >
                <FileEdit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            
            {status === 'rejected' && (
              <Button 
                variant="outline" 
                size="sm"
              >
                <FileEdit className="mr-2 h-4 w-4" />
                Revise
              </Button>
            )}
          </div>
        );
      },
    },
  ];
  
  const viewEntryDetails = (entry: any) => {
    setSelectedEntry(entry);
    setViewDetailsDialog(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Submissions</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <DataCard title="Drafts" variant="glass" icon={<Save size={24} />}>
          <div className="p-4">
            <div className="text-2xl font-bold">{drafts.length}</div>
            <div className="text-sm text-muted-foreground">Saved for later</div>
          </div>
        </DataCard>
        <DataCard title="Pending" variant="glass" icon={<AlertCircle size={24} />}>
          <div className="p-4">
            <div className="text-2xl font-bold">{pending.length}</div>
            <div className="text-sm text-muted-foreground">Awaiting review</div>
          </div>
        </DataCard>
        <DataCard title="Approved" variant="glass" icon={<CheckCircle size={24} />}>
          <div className="p-4">
            <div className="text-2xl font-bold">{approved.length}</div>
            <div className="text-sm text-muted-foreground">Successfully validated</div>
          </div>
        </DataCard>
        <DataCard title="Rejected" variant="glass" icon={<XCircle size={24} />}>
          <div className="p-4">
            <div className="text-2xl font-bold">{rejected.length}</div>
            <div className="text-sm text-muted-foreground">Require attention</div>
          </div>
        </DataCard>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Submissions</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <DataCard
            title="All Submissions"
            description="View and manage all your data submissions"
            variant="glass"
          >
            <DataTable 
              columns={submissionsColumns} 
              data={mySubmissions}
              searchPlaceholder="Search submissions..."
            />
          </DataCard>
        </TabsContent>
        
        <TabsContent value="drafts">
          <DataCard
            title="Draft Submissions"
            description="Entries saved as drafts"
            variant="glass"
          >
            <DataTable 
              columns={submissionsColumns} 
              data={drafts}
              searchPlaceholder="Search drafts..."
            />
          </DataCard>
        </TabsContent>
        
        <TabsContent value="pending">
          <DataCard
            title="Pending Submissions"
            description="Entries awaiting supervisor review"
            variant="glass"
          >
            <DataTable 
              columns={submissionsColumns} 
              data={pending}
              searchPlaceholder="Search pending submissions..."
            />
          </DataCard>
        </TabsContent>
        
        <TabsContent value="approved">
          <DataCard
            title="Approved Submissions"
            description="Entries that have been approved"
            variant="glass"
          >
            <DataTable 
              columns={submissionsColumns} 
              data={approved}
              searchPlaceholder="Search approved submissions..."
            />
          </DataCard>
        </TabsContent>
        
        <TabsContent value="rejected">
          <DataCard
            title="Rejected Submissions"
            description="Entries that require attention"
            variant="glass"
          >
            <DataTable 
              columns={submissionsColumns} 
              data={rejected}
              searchPlaceholder="Search rejected submissions..."
            />
          </DataCard>
        </TabsContent>
      </Tabs>
      
      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialog} onOpenChange={setViewDetailsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Detailed information about this data entry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Client</div>
                <div className="text-sm mt-1">
                  {clients.find(c => c.id === selectedEntry?.clientId)?.name || 'Unknown'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Parameter</div>
                <div className="text-sm mt-1">
                  {dataParameters.find(p => p.id === selectedEntry?.parameterId)?.name || 'Unknown'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Channel</div>
                <div className="text-sm mt-1">
                  {mediaChannels.find(c => c.id === selectedEntry?.channelId)?.name || 'Unknown'}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Value</div>
                <div className="text-sm mt-1">{selectedEntry?.value}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Date</div>
                <div className="text-sm mt-1">{selectedEntry?.date}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <div className="text-sm mt-1 flex items-center">
                  {selectedEntry && <StatusBadge status={selectedEntry.status} />}
                </div>
              </div>
            </div>
            
            {selectedEntry?.comments && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Supervisor Comments</div>
                <div className="text-sm mt-1 p-2 border rounded bg-muted/50">
                  {selectedEntry.comments}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
