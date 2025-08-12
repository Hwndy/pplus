
import { useState, useEffect } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Stat } from '@/components/ui/Stat';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { BarChart, CheckSquare, AlertTriangle, Eye, FileText, Target, LineChart, Newspaper, Clock, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { apiService } from '@/services/apiService';
import type { Editorial, DailyMention, SwotAnalysis, OutcomeInsight } from '@/services/apiService';
import { useNavigate } from 'react-router-dom';

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

// Define unified review entry type
interface ReviewEntry {
  id: string;
  title: string;
  type: 'editorial' | 'daily-mention' | 'swot-analysis' | 'outcome-insight';
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  date: string;
  authorName?: string;
  companyName?: string;
  content?: string;
  createdAt: string;
}

export function SupervisorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingEntries, setPendingEntries] = useState<ReviewEntry[]>([]);
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalReviewed: 0,
    editorialsPending: 0,
    dailyMentionsPending: 0,
    swotAnalysesPending: 0,
    outcomeInsightsPending: 0
  });
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentEntry, setCurrentEntry] = useState<ReviewEntry | null>(null);

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
          apiService.getEditorials(),
          apiService.getDailyMentions(),
          apiService.getSwotAnalyses(),
          apiService.getOutcomeInsights(),
          apiService.getCompanies(),
          apiService.getUsers()
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
            authorName: author?.name || 'Unknown Author',
            companyName: company?.name || 'Unknown Company',
            content: data.content || data.insights || data.strengths?.join(', ') || '',
            createdAt: data.createdAt
          };
        };

        // Transform data into unified review entries
        const allEntries: ReviewEntry[] = [];

        // Process editorials - handle both array and object responses
        const editorialsData = Array.isArray(editorialsRes.data) ? editorialsRes.data : (editorialsRes.data?.editorials || []);
        const editorialsPending = editorialsData.filter((e: Editorial) => e.status?.toLowerCase() === 'pending');
        editorialsPending.forEach((editorial: Editorial) => {
          allEntries.push(transformToReviewEntry(editorial, 'editorial'));
        });

        // Process daily mentions - handle both array and object responses
        const dailyMentionsData = Array.isArray(dailyMentionsRes.data) ? dailyMentionsRes.data : (dailyMentionsRes.data?.mentions || []);
        const dailyMentionsPending = dailyMentionsData.filter((m: DailyMention) => m.status?.toLowerCase() === 'pending');
        dailyMentionsPending.forEach((mention: DailyMention) => {
          allEntries.push(transformToReviewEntry(mention, 'daily-mention'));
        });

        // Process SWOT analyses - handle both array and object responses
        const swotAnalysesData = Array.isArray(swotAnalysesRes.data) ? swotAnalysesRes.data : (swotAnalysesRes.data?.analyses || []);
        const swotAnalysesPending = swotAnalysesData.filter((s: SwotAnalysis) => s.status?.toLowerCase() === 'pending');
        swotAnalysesPending.forEach((swot: SwotAnalysis) => {
          allEntries.push(transformToReviewEntry(swot, 'swot-analysis'));
        });

        // Process outcome insights - handle both array and object responses
        const outcomeInsightsData = Array.isArray(outcomeInsightsRes.data) ? outcomeInsightsRes.data : (outcomeInsightsRes.data?.insights || []);
        const outcomeInsightsPending = outcomeInsightsData.filter((o: OutcomeInsight) => o.status?.toLowerCase() === 'pending');
        outcomeInsightsPending.forEach((insight: OutcomeInsight) => {
          allEntries.push(transformToReviewEntry(insight, 'outcome-insight'));
        });

        setPendingEntries(allEntries);

        // Calculate stats
        const today = new Date().toISOString().split('T')[0];
        setStats({
          pendingCount: allEntries.length,
          approvedToday: 0, // Would need to fetch approved entries from today
          rejectedToday: 0, // Would need to fetch rejected entries from today
          totalReviewed: 0, // Would need to fetch all reviewed entries
          editorialsPending: editorialsPending.length,
          dailyMentionsPending: dailyMentionsPending.length,
          swotAnalysesPending: swotAnalysesPending.length,
          outcomeInsightsPending: outcomeInsightsPending.length
        });

      } catch (error) {
        console.error('Error fetching review data:', error);
        toast.error('Failed to load review data');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, []);



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

  // Navigate to review page
  const navigateToReview = () => {
    navigate('/dashboard/review');
  };

  // Navigate to content review
  const navigateToContentReview = () => {
    navigate('/dashboard/content-review');
  };

  // Navigate to create editorial
  const navigateToCreateEditorial = () => {
    navigate('/dashboard/editorial/create');
  };

  // Navigate to editorial list
  const navigateToEditorial = () => {
    navigate('/dashboard/editorial');
  };

  // Handle quick approval
  const handleQuickApprove = async (entry: ReviewEntry) => {
    try {
      // Call appropriate API endpoint based on entry type
      const updateData = { status: 'approved', reviewedBy: '2', reviewedAt: new Date().toISOString() };

      switch (entry.type) {
        case 'editorial':
          await apiService.updateEditorial(entry.id, updateData);
          break;
        case 'daily-mention':
          await apiService.updateDailyMention(entry.id, updateData);
          break;
        case 'swot-analysis':
          await apiService.updateSwotAnalysis(entry.id, updateData);
          break;
        case 'outcome-insight':
          await apiService.updateOutcomeInsight(entry.id, updateData);
          break;
      }

      toast.success(`${entry.type.replace('-', ' ')} approved successfully`);
      setPendingEntries(pendingEntries.filter(e => e.id !== entry.id));
      setStats(prev => ({ ...prev, pendingCount: prev.pendingCount - 1, approvedToday: prev.approvedToday + 1 }));
    } catch (error) {
      console.error('Error approving entry:', error);
      toast.error('Failed to approve entry');
    }
  };

  // Handle reject dialog
  const openRejectDialog = (entry: ReviewEntry) => {
    setCurrentEntry(entry);
    setRejectReason('');
    setShowRejectDialog(true);
  };

  // Handle details dialog
  const openDetailsDialog = (entry: ReviewEntry) => {
    setCurrentEntry(entry);
    setShowDetailsDialog(true);
  };

  // Submit rejection
  const submitRejection = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    if (!currentEntry) return;

    try {
      const updateData = {
        status: 'rejected',
        comments: rejectReason,
        reviewedBy: '2',
        reviewedAt: new Date().toISOString()
      };

      switch (currentEntry.type) {
        case 'editorial':
          await apiService.updateEditorial(currentEntry.id, updateData);
          break;
        case 'daily-mention':
          await apiService.updateDailyMention(currentEntry.id, updateData);
          break;
        case 'swot-analysis':
          await apiService.updateSwotAnalysis(currentEntry.id, updateData);
          break;
        case 'outcome-insight':
          await apiService.updateOutcomeInsight(currentEntry.id, updateData);
          break;
      }

      toast.success(`${currentEntry.type.replace('-', ' ')} rejected`);
      setPendingEntries(pendingEntries.filter(e => e.id !== currentEntry.id));
      setStats(prev => ({ ...prev, pendingCount: prev.pendingCount - 1, rejectedToday: prev.rejectedToday + 1 }));
      setShowRejectDialog(false);
    } catch (error) {
      console.error('Error rejecting entry:', error);
      toast.error('Failed to reject entry');
    }
  };

  // Define columns for review entries table
  const reviewEntryColumns: ColumnDef<ReviewEntry>[] = [
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
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openDetailsDialog(row.original)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
            onClick={() => handleQuickApprove(row.original)}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
            onClick={() => openRejectDialog(row.original)}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading supervisor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Supervisor Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={navigateToEditorial}>
            <Newspaper className="mr-2 h-4 w-4" />
            Editorial List
          </Button>
          <Button variant="outline" onClick={navigateToCreateEditorial}>
            <Plus className="mr-2 h-4 w-4" />
            Create Editorial
          </Button>
          <Button variant="outline" onClick={navigateToReview}>
            <Eye className="mr-2 h-4 w-4" />
            View All Reviews
          </Button>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <DataCard title="Total Pending" variant="glass" icon={<Clock size={24} />}>
          <Stat
            label="All Entries Pending Review"
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
        <DataCard title="Total Reviewed" variant="glass" icon={<BarChart size={24} />}>
          <Stat
            label="Total Entries Reviewed"
            value={stats.totalReviewed}
            subtitle="All time"
          />
        </DataCard>
      </div>

      {/* Content Type Breakdown */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <DataCard title="Editorials" variant="glass" icon={<Newspaper size={20} />}>
          <Stat
            label="Pending Review"
            value={stats.editorialsPending}
            subtitle="Editorial entries"
          />
        </DataCard>
        <DataCard title="Daily Mentions" variant="glass" icon={<FileText size={20} />}>
          <Stat
            label="Pending Review"
            value={stats.dailyMentionsPending}
            subtitle="Daily mention reports"
          />
        </DataCard>
        <DataCard title="SWOT Analyses" variant="glass" icon={<Target size={20} />}>
          <Stat
            label="Pending Review"
            value={stats.swotAnalysesPending}
            subtitle="SWOT analysis reports"
          />
        </DataCard>
        <DataCard title="Outcome Insights" variant="glass" icon={<LineChart size={20} />}>
          <Stat
            label="Pending Review"
            value={stats.outcomeInsightsPending}
            subtitle="Outcome insight reports"
          />
        </DataCard>
      </div>

      <DataCard
        title="Recent Entries Awaiting Review"
        description="Quick overview of the most recent entries submitted by analysts"
        variant="glass"
      >
        <DataTable
          columns={reviewEntryColumns}
          data={pendingEntries.slice(0, 10)} // Show only the 10 most recent entries
          searchPlaceholder="Search entries..."
        />
      </DataCard>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {currentEntry?.type.replace('-', ' ')}</DialogTitle>
            <DialogDescription>
              Please provide detailed feedback for the analyst on why this entry is being rejected and what needs to be corrected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm capitalize">{currentEntry?.type.replace('-', ' ')}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Title</p>
                <p className="text-sm">{currentEntry?.title}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Company</p>
                <p className="text-sm">{currentEntry?.companyName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Author</p>
                <p className="text-sm">{currentEntry?.authorName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm">{currentEntry?.date ? new Date(currentEntry.date).toLocaleDateString() : ''}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm capitalize">{currentEntry?.status}</p>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium">Rejection Reason</p>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this entry is being rejected and what corrections are needed..."
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

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentEntry?.type.replace('-', ' ')} Details</DialogTitle>
            <DialogDescription>
              Detailed information about this {currentEntry?.type.replace('-', ' ')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentEntry && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Type</p>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(currentEntry.type)}
                      <span className="text-sm font-semibold capitalize">{currentEntry.type.replace('-', ' ')}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Title</p>
                    <p className="text-sm font-semibold">{currentEntry.title}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Company</p>
                    <p className="text-sm font-semibold">{currentEntry.companyName}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Author</p>
                    <p className="text-sm font-semibold">{currentEntry.authorName}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm font-semibold">{new Date(currentEntry.date).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Status</p>
                    <StatusBadge status={currentEntry.status} />
                  </div>
                </div>

                {currentEntry.content && (
                  <div className="space-y-2 pt-2">
                    <p className="text-sm font-medium">Content Preview</p>
                    <div className="p-3 bg-muted rounded-md max-h-32 overflow-y-auto">
                      <p className="text-sm">{currentEntry.content.substring(0, 300)}...</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm">{new Date(currentEntry.createdAt).toLocaleString()}</p>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                Close
              </Button>
              <Button
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
                onClick={() => {
                  setShowDetailsDialog(false);
                  if (currentEntry) handleQuickApprove(currentEntry);
                }}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
                onClick={() => {
                  setShowDetailsDialog(false);
                  if (currentEntry) openRejectDialog(currentEntry);
                }}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
