
import { useState, useEffect } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { DataTable } from '@/components/ui/DataTable';
import { allDataEntries, clients, dataParameters, mediaChannels, users } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { Filter, CheckCircle, XCircle, MessageSquare, Clock, AlertTriangle, CheckSquare, History, Eye } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Stat } from '@/components/ui/Stat';

// Status badge component
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'approved':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
          <CheckCircle className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center">
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    case 'draft':
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center">
          Draft
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="flex items-center">
          {status}
        </Badge>
      );
  }
}

// Define the data entry type
interface DataEntry {
  id: string;
  clientId: string;
  parameterId: string;
  channelId: string;
  value: number;
  date: string;
  analystId: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  comments: string;
  reviewedBy?: string;
  reviewedAt?: string;
  history?: {
    status: string;
    timestamp: string;
    comment: string;
    userId: string;
  }[];
}

export default function ReviewPage() {
  // State for different entry categories
  const [pendingEntries, setPendingEntries] = useState<DataEntry[]>(
    allDataEntries.filter(entry => entry.status === 'pending') as DataEntry[]
  );
  const [approvedEntries, setApprovedEntries] = useState<DataEntry[]>(
    allDataEntries.filter(entry => entry.status === 'approved') as DataEntry[]
  );
  const [rejectedEntries, setRejectedEntries] = useState<DataEntry[]>(
    allDataEntries.filter(entry => entry.status === 'rejected') as DataEntry[]
  );

  // State for review dialog
  const [selectedEntry, setSelectedEntry] = useState<DataEntry | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);

  // State for history dialog
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  // State for view details dialog
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);

  // Stats for dashboard
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalReviewed: 0
  });

  // Calculate stats on component mount and when entries change
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    setStats({
      pendingCount: pendingEntries.length,
      approvedToday: approvedEntries.filter(entry =>
        entry.reviewedAt?.includes(today)
      ).length,
      rejectedToday: rejectedEntries.filter(entry =>
        entry.reviewedAt?.includes(today)
      ).length,
      totalReviewed: approvedEntries.length + rejectedEntries.length
    });
  }, [pendingEntries, approvedEntries, rejectedEntries]);

  // Helper functions for getting names
  const getAnalystName = (id: string) => {
    return users.find(u => u.id === id)?.name || 'Unknown Analyst';
  };

  const getClientName = (id: string) => {
    return clients.find(c => c.id === id)?.name || 'Unknown';
  };

  const getParameterName = (id: string) => {
    return dataParameters.find(p => p.id === id)?.name || 'Unknown';
  };

  const getChannelName = (id: string) => {
    return mediaChannels.find(c => c.id === id)?.name || 'Unknown';
  };

  // Define columns for data entries table
  const entriesColumns: ColumnDef<DataEntry>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'analystId',
      header: 'Analyst',
      cell: ({ row }) => getAnalystName(row.getValue('analystId')),
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
              variant="outline"
              size="sm"
              onClick={() => viewEntryDetails(row.original)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>

            {/* For pending entries, show approve/reject buttons */}
            {status === 'pending' && (
              <>
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
              </>
            )}

            {/* For approved/rejected entries, show history and revert options */}
            {(status === 'approved' || status === 'rejected') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => viewEntryHistory(row.original)}
              >
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
            )}
            {status === 'approved' && (
              <Button
                variant="outline"
                size="sm"
                className="text-amber-600 border-amber-600 hover:bg-amber-100 hover:text-amber-700"
                onClick={() => handleReviewRequest(row.original, 'reject')}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Revoke
              </Button>
            )}
            {status === 'rejected' && (
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
                onClick={() => handleReviewRequest(row.original, 'approve')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const handleReviewRequest = (entry: DataEntry, action: 'approve' | 'reject' | null) => {
    setSelectedEntry(entry);
    setReviewAction(action);
    setReviewComment('');
    setReviewDialogOpen(true);
  };

  // View entry history
  const viewEntryHistory = (entry: DataEntry) => {
    setSelectedEntry(entry);
    setHistoryDialogOpen(true);
  };

  // View entry details
  const viewEntryDetails = (entry: DataEntry) => {
    setSelectedEntry(entry);
    setViewDetailsDialogOpen(true);
  };

  const submitReview = () => {
    // In a real app, we'd make an API call here
    if (!selectedEntry) return;

    const now = new Date();
    const timestamp = now.toISOString();
    const today = timestamp.split('T')[0];

    // Create a history entry
    const historyEntry = {
      status: reviewAction || 'comment',
      timestamp,
      comment: reviewComment,
      userId: '2' // Assuming supervisor ID is 2
    };

    // Create updated entry with new status and history
    const updatedEntry: DataEntry = {
      ...selectedEntry,
      status: reviewAction ? (reviewAction === 'approve' ? 'approved' : 'rejected') : selectedEntry.status,
      comments: reviewComment || selectedEntry.comments,
      reviewedBy: '2', // Supervisor ID
      reviewedAt: timestamp,
      history: [...(selectedEntry.history || []), historyEntry]
    };

    // Update the appropriate lists based on the action
    if (reviewAction === 'approve') {
      // Remove from pending if it was there
      if (selectedEntry.status === 'pending') {
        setPendingEntries(pendingEntries.filter(entry => entry.id !== selectedEntry.id));
      } else if (selectedEntry.status === 'rejected') {
        // Remove from rejected if it was there
        setRejectedEntries(rejectedEntries.filter(entry => entry.id !== selectedEntry.id));
      }
      // Add to approved
      setApprovedEntries([...approvedEntries.filter(entry => entry.id !== selectedEntry.id), updatedEntry]);
      toast.success(`Entry approved successfully`);
    } else if (reviewAction === 'reject') {
      // Remove from pending if it was there
      if (selectedEntry.status === 'pending') {
        setPendingEntries(pendingEntries.filter(entry => entry.id !== selectedEntry.id));
      } else if (selectedEntry.status === 'approved') {
        // Remove from approved if it was there
        setApprovedEntries(approvedEntries.filter(entry => entry.id !== selectedEntry.id));
      }
      // Add to rejected
      setRejectedEntries([...rejectedEntries.filter(entry => entry.id !== selectedEntry.id), updatedEntry]);
      toast.success(`Entry rejected successfully`);
    } else if (reviewComment) {
      // Just adding a comment, update the entry in its current list
      if (selectedEntry.status === 'pending') {
        setPendingEntries(pendingEntries.map(entry =>
          entry.id === selectedEntry.id ? updatedEntry : entry
        ));
      } else if (selectedEntry.status === 'approved') {
        setApprovedEntries(approvedEntries.map(entry =>
          entry.id === selectedEntry.id ? updatedEntry : entry
        ));
      } else if (selectedEntry.status === 'rejected') {
        setRejectedEntries(rejectedEntries.map(entry =>
          entry.id === selectedEntry.id ? updatedEntry : entry
        ));
      }
      toast.success('Comment added successfully');
    }

    setReviewDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Supervisor Dashboard</h1>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <DataCard title="Pending Review" variant="glass" icon={<Clock size={24} />}>
          <Stat
            label="Entries Pending Review"
            value={stats.pendingCount}
            subtitle="Awaiting your approval"
          />
        </DataCard>

        <DataCard title="Approved Today" variant="glass" icon={<CheckSquare size={24} />}>
          <Stat
            label="Entries Approved Today"
            value={stats.approvedToday}
            subtitle="Successfully processed"
          />
        </DataCard>

        <DataCard title="Rejected Today" variant="glass" icon={<AlertTriangle size={24} />}>
          <Stat
            label="Entries Rejected Today"
            value={stats.rejectedToday}
            subtitle="Sent back for revision"
          />
        </DataCard>

        <DataCard title="Total Reviewed" variant="glass" icon={<CheckCircle size={24} />}>
          <Stat
            label="Total Entries Reviewed"
            value={stats.totalReviewed}
            subtitle="All time"
          />
        </DataCard>
      </div>

      {/* Tabs for different entry statuses */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Review ({pendingEntries.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedEntries.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedEntries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
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
        </TabsContent>

        <TabsContent value="approved">
          <DataCard
            title="Approved Entries"
            description="Data entries you have approved"
            variant="glass"
          >
            <DataTable
              columns={entriesColumns}
              data={approvedEntries}
              searchPlaceholder="Search approved entries..."
            />
          </DataCard>
        </TabsContent>

        <TabsContent value="rejected">
          <DataCard
            title="Rejected Entries"
            description="Data entries you have rejected"
            variant="glass"
          >
            <DataTable
              columns={entriesColumns}
              data={rejectedEntries}
              searchPlaceholder="Search rejected entries..."
            />
          </DataCard>
        </TabsContent>
      </Tabs>

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
                reviewAction === 'approve' ?
                'Add any comments before approving this entry.' :
                'Add a comment or feedback for the analyst.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client</Label>
                <div className="text-sm mt-1">
                  {selectedEntry ? getClientName(selectedEntry.clientId) : 'Unknown'}
                </div>
              </div>
              <div>
                <Label>Parameter</Label>
                <div className="text-sm mt-1">
                  {selectedEntry ? getParameterName(selectedEntry.parameterId) : 'Unknown'}
                </div>
              </div>
              <div>
                <Label>Channel</Label>
                <div className="text-sm mt-1">
                  {selectedEntry ? getChannelName(selectedEntry.channelId) : 'Unknown'}
                </div>
              </div>
              <div>
                <Label>Analyst</Label>
                <div className="text-sm mt-1">
                  {selectedEntry ? getAnalystName(selectedEntry.analystId) : 'Unknown'}
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

            {selectedEntry?.comments && (
              <div className="p-3 bg-muted rounded-md">
                <Label className="text-xs">Previous Comments</Label>
                <p className="text-sm mt-1">{selectedEntry.comments}</p>
              </div>
            )}

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

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Entry History</DialogTitle>
            <DialogDescription>
              Review the complete history of this data entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client</Label>
                <div className="text-sm mt-1">
                  {selectedEntry ? getClientName(selectedEntry.clientId) : 'Unknown'}
                </div>
              </div>
              <div>
                <Label>Parameter</Label>
                <div className="text-sm mt-1">
                  {selectedEntry ? getParameterName(selectedEntry.parameterId) : 'Unknown'}
                </div>
              </div>
              <div>
                <Label>Current Status</Label>
                <div className="text-sm mt-1">
                  <StatusBadge status={selectedEntry?.status || 'unknown'} />
                </div>
              </div>
              <div>
                <Label>Last Updated</Label>
                <div className="text-sm mt-1">
                  {selectedEntry?.reviewedAt ? new Date(selectedEntry.reviewedAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>History Timeline</Label>
              <div className="space-y-3 mt-2">
                {selectedEntry?.history && selectedEntry.history.length > 0 ? (
                  selectedEntry.history.map((item, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {item.status === 'approve' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {item.status === 'reject' && <XCircle className="h-4 w-4 text-red-500" />}
                          {item.status === 'comment' && <MessageSquare className="h-4 w-4 text-blue-500" />}
                          <span className="font-medium capitalize">{item.status}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 text-sm">
                        {item.comment || <span className="text-muted-foreground italic">No comment provided</span>}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        By: {getAnalystName(item.userId)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No history available for this entry</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialogOpen} onOpenChange={setViewDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Entry Details</DialogTitle>
            <DialogDescription>
              Detailed information about this data entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {selectedEntry && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Client</Label>
                    <div className="text-sm mt-1 font-medium">
                      {getClientName(selectedEntry.clientId)}
                    </div>
                  </div>
                  <div>
                    <Label>Parameter</Label>
                    <div className="text-sm mt-1 font-medium">
                      {getParameterName(selectedEntry.parameterId)}
                    </div>
                  </div>
                  <div>
                    <Label>Channel</Label>
                    <div className="text-sm mt-1 font-medium">
                      {getChannelName(selectedEntry.channelId)}
                    </div>
                  </div>
                  <div>
                    <Label>Value</Label>
                    <div className="text-sm mt-1 font-medium">
                      {selectedEntry.value}
                    </div>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <div className="text-sm mt-1 font-medium">
                      {selectedEntry.date}
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="text-sm mt-1">
                      <StatusBadge status={selectedEntry.status} />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Submitted By</Label>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {getAnalystName(selectedEntry.analystId).charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{getAnalystName(selectedEntry.analystId)}</div>
                      <div className="text-xs text-muted-foreground">Analyst</div>
                    </div>
                  </div>
                </div>

                {selectedEntry.comments && (
                  <div className="space-y-2">
                    <Label>Comments</Label>
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {selectedEntry.comments}
                    </div>
                  </div>
                )}

                {selectedEntry.reviewedBy && (
                  <div className="space-y-2">
                    <Label>Last Reviewed</Label>
                    <div className="text-sm">
                      <div className="font-medium">By: Supervisor</div>
                      <div className="text-muted-foreground">
                        {new Date(selectedEntry.reviewedAt || '').toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <div>
              {selectedEntry?.status === 'pending' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReviewRequest(selectedEntry, null)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Comment
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setViewDetailsDialogOpen(false)}>
                Close
              </Button>

              {selectedEntry?.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
                    onClick={() => {
                      setViewDetailsDialogOpen(false);
                      handleReviewRequest(selectedEntry, 'approve');
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
                    onClick={() => {
                      setViewDetailsDialogOpen(false);
                      handleReviewRequest(selectedEntry, 'reject');
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
