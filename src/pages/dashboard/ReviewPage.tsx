import { useState, useEffect } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Filter, CheckCircle, XCircle, MessageSquare, Clock, AlertTriangle, CheckSquare, History, Eye, FileText, Target, LineChart, Newspaper } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';

const API_BASE = "https://pplus-y9m6.onrender.com/api";

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

// Define unified review entry type
interface ReviewEntry {
  id: string;
  title: string;
  type: 'editorial' | 'daily-mention' | 'swot-analysis' | 'outcome-insight';
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  date: string;
  authorId?: string;
  authorName?: string;
  companyId?: string;
  companyName?: string;
  content?: string;
  comments?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  originalData: any; // Keep this as any to handle various data structures
  history?: {
    status: string;
    timestamp: string;
    comment: string;
    userId: string;
  }[];
}

export default function ReviewPage() {
  const navigate = useNavigate();

  // State for different entry categories
  const [pendingEntries, setPendingEntries] = useState<ReviewEntry[]>([]);
  const [approvedEntries, setApprovedEntries] = useState<ReviewEntry[]>([]);
  const [rejectedEntries, setRejectedEntries] = useState<ReviewEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // State for review dialog
  const [selectedEntry, setSelectedEntry] = useState<ReviewEntry | null>(null);
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

  // Companies and users data for lookups
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Fetch all review data on component mount
  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        setLoading(true);

        // Fetch all data types in parallel
        const [editorialsRes, dailyMentionsRes, swotAnalysesRes, outcomeInsightsRes, companiesRes, usersRes] = await Promise.all([
          fetch(`${API_BASE}/editorials`).then(res => res.json()),
          fetch(`${API_BASE}/daily-mentions`).then(res => res.json()),
          fetch(`${API_BASE}/swot-analysis`).then(res => res.json()),
          fetch(`${API_BASE}/outcome-insights`).then(res => res.json()),
          fetch(`${API_BASE}/companies`).then(res => res.json()),
          fetch(`${API_BASE}/users`).then(res => res.json())
        ]);

        // Store lookup data
        const companiesData = companiesRes.data || [];
        const usersData = usersRes.data || [];
        setCompanies(companiesData);
        setUsers(usersData);

        // Transform function with available lookup data
        const transformToReviewEntry = (data: any, type: ReviewEntry['type']): ReviewEntry => {
          const company = companiesData.find((c: any) => c.id === data.companyId);
          const author = usersData.find((u: any) => u.id === data.authorId);

          return {
            id: data.id,
            title: data.title || data.headline || `${type} - ${data.id}`,
            type,
            status: data.status?.toLowerCase() || 'pending',
            date: data.date || data.createdAt,
            authorId: data.authorId,
            authorName: author?.username || 'Unknown Author',
            companyId: data.companyId,
            companyName: company?.company_name || 'Unknown Company',
            content: data.content || data.insights || data.strengths?.join(', ') || '',
            comments: data.comments || '',
            reviewedBy: data.reviewedBy,
            reviewedAt: data.reviewedAt,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            originalData: data,
            history: data.history || []
          };
        };

        // Transform data into unified review entries
        const allEntries: ReviewEntry[] = [];

        // Process editorials - handle both array and object responses
        const editorialsData = Array.isArray(editorialsRes.data) ? editorialsRes.data : (editorialsRes.data?.editorials || []);
        if (editorialsData.length > 0) {
          editorialsData.forEach((editorial: any) => {
            allEntries.push(transformToReviewEntry(editorial, 'editorial'));
          });
        }

        // Process daily mentions - handle both array and object responses
        const dailyMentionsData = Array.isArray(dailyMentionsRes.data) ? dailyMentionsRes.data : (dailyMentionsRes.data?.mentions || []);
        if (dailyMentionsData.length > 0) {
          dailyMentionsData.forEach((mention: any) => {
            allEntries.push(transformToReviewEntry(mention, 'daily-mention'));
          });
        }

        // Process SWOT analyses - handle both array and object responses
        const swotAnalysesData = Array.isArray(swotAnalysesRes.data) ? swotAnalysesRes.data : (swotAnalysesRes.data?.analyses || []);
        if (swotAnalysesData.length > 0) {
          swotAnalysesData.forEach((swot: any) => {
            allEntries.push(transformToReviewEntry(swot, 'swot-analysis'));
          });
        }

        // Process outcome insights - handle both array and object responses
        const outcomeInsightsData = Array.isArray(outcomeInsightsRes.data) ? outcomeInsightsRes.data : (outcomeInsightsRes.data?.insights || []);
        if (outcomeInsightsData.length > 0) {
          outcomeInsightsData.forEach((insight: any) => {
            allEntries.push(transformToReviewEntry(insight, 'outcome-insight'));
          });
        }

        // Categorize entries by status
        setPendingEntries(allEntries.filter(entry => entry.status === 'pending'));
        setApprovedEntries(allEntries.filter(entry => entry.status === 'approved'));
        setRejectedEntries(allEntries.filter(entry => entry.status === 'rejected'));

      } catch (error) {
        console.error('Error fetching review data:', error);
        toast.error('Failed to load review data');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, []);

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
  const getCompanyName = (id: string) => {
    return companies.find(c => c.id === id)?.company_name || 'Unknown Company';
  };

  const getUserName = (id: string) => {
    return users.find(u => u.id === id)?.username || 'Unknown User';
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'editorial': return <Newspaper className="h-4 w-4" />;
      case 'daily-mention': return <FileText className="h-4 w-4" />;
      case 'swot-analysis': return <Target className="h-4 w-4" />;
      case 'outcome-insight': return <LineChart className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Define columns for review entries table
  const entriesColumns: ColumnDef<ReviewEntry>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {getTypeIcon(row.getValue('type'))}
          <span className="capitalize">{(row.getValue('type') as string).replace('-', ' ')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.getValue('title')}>
          {row.getValue('title')}
        </div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => new Date(row.getValue('date')).toLocaleDateString(),
    },
    {
      accessorKey: 'authorName',
      header: 'Author',
      cell: ({ row }) => row.getValue('authorName') || 'Unknown',
    },
    {
      accessorKey: 'companyName',
      header: 'Company',
      cell: ({ row }) => row.getValue('companyName') || 'Unknown',
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
              onClick={() => navigateToForm(row.original)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Review Form
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => viewEntryDetails(row.original)}
            >
              Quick View
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

  const handleReviewRequest = (entry: ReviewEntry, action: 'approve' | 'reject' | null) => {
    setSelectedEntry(entry);
    setReviewAction(action);
    setReviewComment('');
    setReviewDialogOpen(true);
  };

  // View entry history
  const viewEntryHistory = (entry: ReviewEntry) => {
    setSelectedEntry(entry);
    setHistoryDialogOpen(true);
  };

  // View entry details
  const viewEntryDetails = (entry: ReviewEntry) => {
    setSelectedEntry(entry);
    setViewDetailsDialogOpen(true);
  };

  const submitReview = async () => {
    if (!selectedEntry) return;

    if (reviewAction === 'reject' && !reviewComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const now = new Date();
      const timestamp = now.toISOString();

      // Create a history entry
      const historyEntry = {
        status: reviewAction || 'comment',
        timestamp,
        comment: reviewComment,
        userId: '2' // Assuming supervisor ID is 2
      };

      // Prepare update data based on entry type
      const updateData = {
        status: reviewAction ? (reviewAction === 'approve' ? 'approved' : 'rejected') : selectedEntry.status,
        comments: reviewComment || selectedEntry.comments,
        reviewedBy: '2', // Supervisor ID
        reviewedAt: timestamp,
        history: [...(selectedEntry.history || []), historyEntry]
      };

      // Call appropriate API endpoint based on entry type
      let apiResponse;
      const endpoint = `${API_BASE}/${selectedEntry.type === 'daily-mention' ? 'daily-mentions' : selectedEntry.type + 's'}`;
      switch (selectedEntry.type) {
        case 'editorial':
          apiResponse = await fetch(`${API_BASE}/editorials/${selectedEntry.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
          }).then(res => res.json());
          break;
        case 'daily-mention':
          apiResponse = await fetch(`${API_BASE}/daily-mentions/${selectedEntry.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
          }).then(res => res.json());
          break;
        case 'swot-analysis':
          apiResponse = await fetch(`${API_BASE}/swot-analyses/${selectedEntry.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
          }).then(res => res.json());
          break;
        case 'outcome-insight':
          apiResponse = await fetch(`${API_BASE}/outcome-insights/${selectedEntry.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
          }).then(res => res.json());
          break;
        default:
          throw new Error('Unknown entry type');
      }

      // Create updated entry for local state
      const updatedEntry: ReviewEntry = {
        ...selectedEntry,
        status: updateData.status as any,
        comments: updateData.comments,
        reviewedBy: updateData.reviewedBy,
        reviewedAt: updateData.reviewedAt,
        history: updateData.history
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
      toast.success(`${selectedEntry.type.replace('-', ' ')} approved successfully`);
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
      toast.success(`${selectedEntry.type.replace('-', ' ')} rejected successfully`);
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
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading review data...</p>
        </div>
      </div>
    );
  }

  // Navigate to form for detailed review
  const navigateToForm = (entry: ReviewEntry) => {
    switch (entry.type) {
      case 'editorial':
        navigate(`/dashboard/editorial?review=${entry.id}`);
        break;
      case 'daily-mention':
        navigate(`/dashboard/daily-mentions/view/${entry.id}?review=true`);
        break;
      case 'swot-analysis':
        navigate(`/dashboard/swot-mentions?review=${entry.id}`);
        break;
      case 'outcome-insight':
        navigate(`/dashboard/outcome-insights?review=${entry.id}`);
        break;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content Review</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
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
                <Label>Company</Label>
                <div className="text-sm mt-1">
                  {selectedEntry ? selectedEntry.companyName : 'Unknown'}
                </div>
              </div>
              <div>
                <Label>Type</Label>
                <div className="text-sm mt-1">
                  {selectedEntry ? selectedEntry.type.replace('-', ' ') : 'Unknown'}
                </div>
              </div>
              <div>
                <Label>Author</Label>
                <div className="text-sm mt-1">
                  {selectedEntry ? selectedEntry.authorName : 'Unknown'}
                </div>
              </div>
              <div>
                <Label>Title</Label>
                <div className="text-sm mt-1">
                  {selectedEntry ? selectedEntry.title : 'Unknown'}
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="text-sm mt-1">{selectedEntry?.status}</div>
              </div>
              <div>
                <Label>Date</Label>
                <div className="text-sm mt-1">{selectedEntry ? new Date(selectedEntry.date).toLocaleDateString() : 'Unknown'}</div>
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
                <Label>Company</Label>
                <div className="text-sm mt-1">
                  {selectedEntry ? selectedEntry.companyName : 'Unknown'}
                </div>
              </div>
              <div>
                <Label>Type</Label>
                <div className="text-sm mt-1">
                  {selectedEntry ? selectedEntry.type.replace('-', ' ') : 'Unknown'}
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
                        By: {getUserName(item.userId)}
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
                    <Label>Company</Label>
                    <div className="text-sm mt-1 font-medium">
                      {selectedEntry.companyName}
                    </div>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <div className="text-sm mt-1 font-medium">
                      {selectedEntry.type.replace('-', ' ')}
                    </div>
                  </div>
                  <div>
                    <Label>Author</Label>
                    <div className="text-sm mt-1 font-medium">
                      {selectedEntry.authorName}
                    </div>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <div className="text-sm mt-1 font-medium">
                      {selectedEntry.title}
                    </div>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <div className="text-sm mt-1 font-medium">
                      {new Date(selectedEntry.date).toLocaleDateString()}
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
                  <Label>Content</Label>
                  <Card className="p-4">
                    <p className="text-sm">
                      {selectedEntry.content}
                    </p>
                  </Card>
                </div>
                {selectedEntry.comments && (
                  <div className="space-y-2">
                    <Label>Review Comments</Label>
                    <Card className="p-4">
                      <p className="text-sm italic">
                        {selectedEntry.comments}
                      </p>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setViewDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}