
import { useState } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { DataTable } from '@/components/ui/DataTable';
import { allDataEntries, clients, dataParameters, mediaChannels } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { Filter, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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
    <Badge variant="outline" className={`${getStatusStyles()} capitalize`}>
      {status}
    </Badge>
  );
}

export default function ReviewPage() {
  const [pendingEntries, setPendingEntries] = useState(
    allDataEntries.filter(entry => entry.status === 'pending')
  );
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  
  // Define columns for data entries table
  const entriesColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'analystId',
      header: 'Analyst',
      cell: () => 'John Doe', // In a real app, we'd use a user lookup
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
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
            onClick={() => handleReviewRequest(row.original, 'approve')}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
            onClick={() => handleReviewRequest(row.original, 'reject')}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleReviewRequest(row.original, null)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Comment
          </Button>
        </div>
      ),
    },
  ];

  const handleReviewRequest = (entry: any, action: 'approve' | 'reject' | null) => {
    setSelectedEntry(entry);
    setReviewAction(action);
    setReviewComment('');
    setReviewDialogOpen(true);
  };

  const submitReview = () => {
    // In a real app, we'd make an API call here
    if (!selectedEntry) return;
    
    const updatedEntries = pendingEntries.filter(entry => entry.id !== selectedEntry.id);
    
    if (reviewAction) {
      toast.success(`Entry ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully`);
    } else if (reviewComment) {
      toast.success('Comment added successfully');
    }
    
    setPendingEntries(updatedEntries);
    setReviewDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Review Data Entries</h1>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>
      
      <DataCard
        title="Pending Review"
        description="Data entries awaiting your review and approval"
        variant="glass"
      >
        <DataTable 
          columns={entriesColumns} 
          data={pendingEntries}
          searchPlaceholder="Search entries..."
        />
      </DataCard>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Entry' : 
               reviewAction === 'reject' ? 'Reject Entry' : 'Add Comment'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'reject' ? 
                'Please provide a reason for rejecting this entry.' : 
                'Add a comment or feedback for the analyst.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client</Label>
                <div className="text-sm mt-1">
                  {clients.find(c => c.id === selectedEntry?.clientId)?.name || 'Unknown'}
                </div>
              </div>
              <div>
                <Label>Parameter</Label>
                <div className="text-sm mt-1">
                  {dataParameters.find(p => p.id === selectedEntry?.parameterId)?.name || 'Unknown'}
                </div>
              </div>
              <div>
                <Label>Value</Label>
                <div className="text-sm mt-1">{selectedEntry?.value}</div>
              </div>
              <div>
                <Label>Date</Label>
                <div className="text-sm mt-1">{selectedEntry?.date}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comment">
                {reviewAction === 'reject' ? 'Reason for rejection' : 'Comment'}
              </Label>
              <Textarea
                id="comment"
                placeholder={reviewAction === 'reject' ? 'Explain why this entry is being rejected...' : 'Add your feedback here...'}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="flex space-x-2 sm:justify-end">
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitReview}
              disabled={reviewAction === 'reject' && !reviewComment}
              variant={reviewAction === 'approve' ? 'default' : 
                      reviewAction === 'reject' ? 'destructive' : 'default'}
            >
              {reviewAction === 'approve' ? 'Approve' : 
               reviewAction === 'reject' ? 'Reject' : 'Submit Comment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
