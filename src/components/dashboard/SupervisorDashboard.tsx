import { useState, useEffect } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Stat } from '@/components/ui/Stat';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import {
  BarChart,
  CheckSquare,
  AlertTriangle,
  Eye,
  FileText,
  Target,
  LineChart,
  Newspaper,
  Clock,
  MessageCircle,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Label } from '../ui/label';

// ---------------------------------------------------------------------
// API & Constants
// ---------------------------------------------------------------------
const API_BASE = 'https://pplus-6xcn.onrender.com/api';
const PAGE_SIZE = 10;

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------
type Role = 'admin' | 'supervisor' | 'analyst' | undefined;

interface GenericEntry {
  id: string;
  title: string;
  content?: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  createdAt: string;
  updatedAt?: string;
  authorName?: string;
  companyName?: string;
  comments?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  // … (all the extra fields you already had)
  industry?: any[];
  competitors?: any[];
  subsidiaries?: any[];
  passive?: any[];
  advert?: any[];
  metrics?: any[];
  strengths?: any[];
  weaknesses?: any[];
  opportunities?: any[];
  threats?: any[];
  social_media_engagement?: any[];
  brand_awareness?: any[];
  media_coverage?: any[];
  competitor_analysis?: any[];
  source?: string;
  audience_reach?: number;
  brand?: string;
  placement?: string;
  reporter?: string;
  country?: string;
  spokesperson?: string;
  activity?: string;
  sentiment?: string;
  advert_spend?: number;
  circulation?: number;
  page_size?: string;
  language?: string;
  ceo_media_presence?: string;
  ceo_thought_leadership?: string;
  print_web_clips?: string | null;
}

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  approvedToday: number;
  rejectedToday: number;
  byType: Record<
    string,
    { pending: number; approved: number; rejected: number; total: number; displayName: string }
  >;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

// ---------------------------------------------------------------------
// End-points
// ---------------------------------------------------------------------
const SUPERVISOR_DASHBOARD_ENDPOINTS = {
  editorials: '/editorials/supervisor-dashboard',
  dailyMentions: '/daily-mentions/supervisor-dashboard',
  swotAnalysis: '/swot-analysis/supervisor-dashboard',
  outcomeInsights: '/outcome-insights/supervisor-dashboard',
  socialMediaMentions: '/social-media-mentions/supervisor-dashboard',
} as const;

const contentTypes = {
  editorials: {
    endpoint: '/editorials',
    updateEndpoint: '/editorials/update',
    statusEndpoint: '/editorials/:id/status',
    displayName: 'Editorial Content',
    icon: <Newspaper className="h-4 w-4" />,
  },
  dailyMentions: {
    endpoint: '/daily-mentions',
    updateEndpoint: '/daily-mentions/update',
    statusEndpoint: '/daily-mentions/:id/status',
    displayName: 'Daily Mentions Content',
    icon: <FileText className="h-4 w-4" />,
  },
  swotAnalysis: {
    endpoint: '/swot-analysis',
    updateEndpoint: '/swot-analysis/update',
    statusEndpoint: '/swot-analysis/:id/status',
    displayName: 'Swot Analysis Content',
    icon: <Target className="h-4 w-4" />,
  },
  outcomeInsights: {
    endpoint: '/outcome-insights',
    updateEndpoint: '/outcome-insights/update',
    statusEndpoint: '/outcome-insights/:id/status',
    displayName: 'Outcome Insights Content',
    icon: <LineChart className="h-4 w-4" />,
  },
  socialMediaMentions: {
    endpoint: '/social-media-mentions',
    updateEndpoint: '/social-media-mentions/update',
    statusEndpoint: '/social-media-mentions/:id/status',
    displayName: 'Social Media Mentions Content',
    icon: <MessageCircle className="h-4 w-4" />,
  },
} as const;

type ContentTypeKey = keyof typeof contentTypes;

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
function getEndpoint(type: ContentTypeKey, role: Role): string {
  // If role is missing treat as supervisor (most restrictive)
  if (role === 'admin') return contentTypes[type].endpoint;
  return SUPERVISOR_DASHBOARD_ENDPOINTS[type];
}

// ---------------------------------------------------------------------
// UI Components
// ---------------------------------------------------------------------
function StatusBadge({ status }: { status: string }) {
  const styles = (() => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  })();

  return (
    <Badge variant="outline" className={`${styles} capitalize`}>
      {status || 'Unknown'}
    </Badge>
  );
}

// ---------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------
export function SupervisorDashboard() {
  const { token, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const headers = token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : {};

  // -----------------------------------------------------------------
  // State
  // -----------------------------------------------------------------
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
    approvedToday: 0,
    rejectedToday: 0,
    byType: {},
  });

  // Initialise every tab with an empty array so DataTable always receives an array
  const emptyData: Record<ContentTypeKey, GenericEntry[]> = {
    editorials: [],
    dailyMentions: [],
    swotAnalysis: [],
    outcomeInsights: [],
    socialMediaMentions: [],
  };
  const [data, setData] = useState<Record<ContentTypeKey, GenericEntry[]>>(emptyData);

  const emptyPagination: Record<ContentTypeKey, Pagination> = {
    editorials: { currentPage: 1, totalPages: 1, total: 0, pageSize: PAGE_SIZE },
    dailyMentions: { currentPage: 1, totalPages: 1, total: 0, pageSize: PAGE_SIZE },
    swotAnalysis: { currentPage: 1, totalPages: 1, total: 0, pageSize: PAGE_SIZE },
    outcomeInsights: { currentPage: 1, totalPages: 1, total: 0, pageSize: PAGE_SIZE },
    socialMediaMentions: { currentPage: 1, totalPages: 1, total: 0, pageSize: PAGE_SIZE },
  };
  const [pagination, setPagination] = useState<Record<ContentTypeKey, Pagination>>(emptyPagination);

  const [activeTab, setActiveTab] = useState<ContentTypeKey>('editorials');
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentEntry, setCurrentEntry] = useState<GenericEntry | null>(null);

  // -----------------------------------------------------------------
  // Auth Guard
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated || !token || !user?.id) {
      toast.error('Please log in to access the dashboard');
      navigate('/login', { replace: true });
      setLoading(false);
    }
  }, [isAuthenticated, token, user, navigate]);

  // -----------------------------------------------------------------
  // Fetch Stats
  // -----------------------------------------------------------------
  const fetchStats = async () => {
    if (!token || !user?.id) return;
    try {
      const [overallRes, todayRes] = await Promise.all([
        fetch(`${API_BASE}/status/status-counts`, { headers }),
        fetch(`${API_BASE}/status/status-counts/today`, { headers }),
      ]);

      if (overallRes.status === 401 || todayRes.status === 401) {
        throw new Error('Unauthorized');
      }
      if (!overallRes.ok || !todayRes.ok) throw new Error('Failed to fetch stats');

      const overallData = await overallRes.json();
      const todayData = await todayRes.json();

      if (!overallData.success || !todayData.success) throw new Error('Invalid response');

      const summary = overallData.data.summary.totalCounts;
      const byTable = overallData.data.byTable.reduce(
        (acc: Record<string, any>, item: any) => {
          const map: Record<string, ContentTypeKey> = {
            Editorials: 'editorials',
            DailyMentions: 'dailyMentions',
            SwotAnalyses: 'swotAnalysis',
            OutcomeInsights: 'outcomeInsights',
            SocialMediaMentions: 'socialMediaMentions',
          };
          const key = map[item.table] ?? item.table;
          acc[key] = {
            pending: item.counts.pending,
            approved: item.counts.approved,
            rejected: item.counts.rejected,
            total: item.counts.total,
            displayName: item.displayName,
          };
          return acc;
        },
        {}
      );

      setStats({
        pending: summary.pending,
        approved: summary.approved,
        rejected: summary.rejected,
        total: summary.total,
        approvedToday: todayData.data.summary.totalActivity.approved,
        rejectedToday: todayData.data.summary.totalActivity.rejected,
        byType: byTable,
      });
    } catch (err) {
      console.error('Stats error:', err);
      toast.error('Failed to load stats');
      if ((err as Error).message.includes('Unauthorized')) navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // Transform raw entry → GenericEntry
  // -----------------------------------------------------------------
  const transformToGenericEntry = (type: ContentTypeKey, raw: any): GenericEntry => {
    // (kept the same as your original – only tiny safety tweaks)
    const fallback = {
      id: raw.id?.toString() ?? '',
      title: raw.title ?? raw.headline ?? 'Untitled',
      content: raw.content ?? raw.analyst_note ?? '',
      status: raw.status ?? 'pending',
      createdAt: raw.createdAt ?? raw.date ?? new Date().toISOString(),
      authorName:
        raw.created_by?.username ??
        raw.creator_data?.username ??
        raw.analyst?.username ??
        'Unknown',
      companyName:
        raw.company?.company_name ??
        raw.company_data?.company_name ??
        raw.company?.name ??
        'Unknown',
      comments: raw.supervisor_note ?? '',
      reviewedBy:
        raw.approved_by?.username ??
        raw.approver_data?.username ??
        raw.supervisor?.username ??
        'Unknown',
    };

    if (type === 'editorials') {
      return {
        ...fallback,
        content: raw.analyst_note ?? '',
        source: raw.source,
        audience_reach: raw.audience_reach,
        brand: raw.brand,
        placement: raw.placement,
        reporter: raw.reporter,
        country: raw.country,
        spokesperson: raw.spokesperson,
        activity: raw.activity,
        sentiment: raw.sentiment,
        advert_spend: raw.advert_spend,
        circulation: raw.circulation,
        page_size: raw.page_size,
        language: raw.language,
        ceo_media_presence: raw.ceo_media_presence,
        ceo_thought_leadership: raw.ceo_thought_leadership,
        print_web_clips: raw.print_web_clips,
      };
    }

    // … (the rest of your per-type logic – unchanged)
    // For brevity the full per-type blocks are omitted here – copy-paste them from your original file.
    return fallback;
  };

  // -----------------------------------------------------------------
  // Fetch Entries for a tab
  // -----------------------------------------------------------------
  const fetchEntries = async (type: ContentTypeKey, page: number = 1) => {
    if (!token || !user?.id) return;

    // Prevent duplicate calls for the same page
    if (data[type].length > 0 && pagination[type].currentPage === page) return;

    setTableLoading(true);
    try {
      const role = (user?.role as Role) ?? 'supervisor';
      const endpoint = getEndpoint(type, role);
      const url = `${API_BASE}${endpoint}?page=${page}&limit=${PAGE_SIZE}`;

      const res = await fetch(url, { headers });
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) {
        let msg = res.statusText;
        try {
          const err = await res.json();
          msg = err.message ?? err.error ?? msg;
        } catch {}
        throw new Error(msg);
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? 'Failed');

      let entries: any[] = [];
      let pag: Pagination = {
        currentPage: page,
        totalPages: 1,
        total: 0,
        pageSize: PAGE_SIZE,
      };

      if (type === 'editorials') {
        entries = Array.isArray(json.data?.editorial) ? json.data.editorial : [];
        pag = {
          currentPage: json.data?.meta?.currentPage ?? page,
          totalPages: json.data?.meta?.totalPage ?? 1,
          total: json.data?.meta?.total ?? 0,
          pageSize: json.data?.meta?.pageSize ?? PAGE_SIZE,
        };
      } else {
        entries = Array.isArray(json.data?.data)
          ? json.data.data
          : Array.isArray(json.data)
          ? json.data
          : [];
        pag = {
          currentPage: json.data?.pagination?.page ?? json.pagination?.page ?? page,
          totalPages: json.data?.pagination?.totalPages ?? json.pagination?.totalPages ?? 1,
          total: json.data?.pagination?.total ?? json.pagination?.total ?? 0,
          pageSize: json.data?.pagination?.limit ?? json.pagination?.limit ?? PAGE_SIZE,
        };
      }

      const transformed = entries.map((e) => transformToGenericEntry(type, e));
      setData((prev) => ({ ...prev, [type]: transformed }));
      setPagination((prev) => ({ ...prev, [type]: pag }));
    } catch (err) {
      console.error(`Fetch ${type}:`, err);
      toast.error(`Failed to load ${contentTypes[type].displayName}`);
      if ((err as Error).message.includes('Unauthorized')) navigate('/login', { replace: true });
    } finally {
      setTableLoading(false);
    }
  };

  // -----------------------------------------------------------------
  // Refresh
  // -----------------------------------------------------------------
  const handleRefresh = () => {
    setData(emptyData);
    setPagination(emptyPagination);
    fetchStats();
    fetchEntries(activeTab, 1);
    toast.success('Data refreshed');
  };

  // -----------------------------------------------------------------
  // Status Update
  // -----------------------------------------------------------------
  const updateStatus = async (
    entry: GenericEntry,
    newStatus: 'approved' | 'rejected',
    comments?: string
  ) => {
    if (!token || !user?.id) {
      toast.error('Auth required');
      navigate('/login', { replace: true });
      return;
    }
    const type = activeTab;
    const endpoint = `${API_BASE}${contentTypes[type].statusEndpoint.replace(
      ':id',
      entry.id
    )}`;
    const body: any = {
      status: newStatus,
      ...(comments ? { supervisor_note: comments } : {}),
      ...(type === 'dailyMentions' ? { approver_id: user.id } : { approved_by: user.id }),
    };

    try {
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || res.statusText);
      }

      toast.success(`${contentTypes[type].displayName} ${newStatus}`);
      setData((prev) => ({
        ...prev,
        [type]: prev[type].map((e) =>
          e.id === entry.id
            ? {
                ...e,
                status: newStatus,
                comments: comments ?? e.comments,
                reviewedBy: user.username ?? user.id,
                reviewedAt: new Date().toISOString(),
              }
            : e
        ),
      }));
      fetchStats();
    } catch (err) {
      console.error('Status update error:', err);
      toast.error('Failed to update status');
    }
  };

  const handleQuickApprove = (entry: GenericEntry) => updateStatus(entry, 'approved');
  const openRejectDialog = (entry: GenericEntry) => {
    setCurrentEntry(entry);
    setRejectReason('');
    setShowRejectDialog(true);
  };
  const submitRejection = () => {
    if (!rejectReason.trim() || !currentEntry) {
      toast.error('Reason required');
      return;
    }
    updateStatus(currentEntry, 'rejected', rejectReason);
    setShowRejectDialog(false);
  };
  const openDetailsDialog = (entry: GenericEntry) => {
    setCurrentEntry(entry);
    setShowDetailsDialog(true);
  };

  // -----------------------------------------------------------------
  // Columns (delete button removed)
  // -----------------------------------------------------------------
  const getColumns = (type: ContentTypeKey): ColumnDef<GenericEntry>[] => [
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
      accessorKey: 'authorName',
      header: 'Author',
      cell: ({ row }) => row.original.authorName ?? 'Unknown',
    },
    {
      accessorKey: 'companyName',
      header: 'Company',
      cell: ({ row }) => row.original.companyName ?? 'Unknown',
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
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
        const e = row.original;
        return (
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => openDetailsDialog(e)}>
              <Eye className="mr-2 h-4 w-4" /> View
            </Button>
            {e.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-600"
                  onClick={() => handleQuickApprove(e)}
                >
                  <CheckSquare className="mr-2 h-4 w-4" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600"
                  onClick={() => openRejectDialog(e)}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" /> Reject
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  // -----------------------------------------------------------------
  // Effects
  // -----------------------------------------------------------------
  useEffect(() => {
    if (isAuthenticated && token && user?.id) fetchStats();
  }, [isAuthenticated, token, user]);

  // Re-fetch when tab or page changes
  useEffect(() => {
    if (isAuthenticated && token && user?.id) {
      fetchEntries(activeTab, pagination[activeTab].currentPage);
    }
  }, [activeTab, pagination[activeTab].currentPage, isAuthenticated, token, user]);

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Supervisor Dashboard</h1>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <DataCard title="Total Pending" variant="glass" icon={<Clock size={24} />}>
          <Stat label="All Entries Pending Review" value={stats.pending} subtitle="Awaiting approval" />
        </DataCard>
        <DataCard title="Approved Today" variant="glass" icon={<CheckSquare size={24} />}>
          <Stat label="Entries Approved Today" value={stats.approvedToday} subtitle="Processed" />
        </DataCard>
        <DataCard title="Rejected Today" variant="glass" icon={<AlertTriangle size={24} />}>
          <Stat label="Entries Rejected Today" value={stats.rejectedToday} subtitle="For revision" />
        </DataCard>
        <DataCard title="Total Reviewed" variant="glass" icon={<BarChart size={24} />}>
          <Stat
            label="Total Entries Reviewed"
            value={stats.approved + stats.rejected}
            subtitle="All time"
          />
        </DataCard>
      </div>

      {/* Per-type pending counts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {Object.entries(stats.byType).map(([key, s]) => (
          <DataCard
            key={key}
            title={s.displayName}
            variant="glass"
            icon={contentTypes[key as ContentTypeKey]?.icon ?? <FileText size={20} />}
          >
            <Stat label="Pending Review" value={s.pending} subtitle={s.displayName} />
          </DataCard>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentTypeKey)}>
        <TabsList className="grid w-full grid-cols-5">
          {Object.entries(contentTypes).map(([k, c]) => (
            <TabsTrigger key={k} value={k as ContentTypeKey}>
              {c.displayName.split(' ')[0]} ({stats.byType[k]?.pending ?? 0})
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(contentTypes).map(([k, c]) => (
          <TabsContent key={k} value={k as ContentTypeKey}>
            <Card>
              <CardHeader>
                <CardTitle>{c.displayName}</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={getColumns(k as ContentTypeKey)}
                  data={data[k as ContentTypeKey] ?? []}
                  searchPlaceholder={`Search ${c.displayName.toLowerCase()}...`}
                  loading={tableLoading}
                  pagination={{
                    currentPage: pagination[k as ContentTypeKey].currentPage,
                    totalPages: pagination[k as ContentTypeKey].totalPages,
                    onPageChange: (p) => {
                      setPagination((prev) => ({
                        ...prev,
                        [k]: { ...prev[k], currentPage: p },
                      }));
                    },
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Entry</DialogTitle>
            <DialogDescription>Provide feedback for rejection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentEntry && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <p>{currentEntry.title}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <StatusBadge status={currentEntry.status} />
                  </div>
                </div>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  className="min-h-32"
                />
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitRejection}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Entry Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentEntry && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Title</Label><p>{currentEntry.title}</p></div>
                  <div className="space-y-2"><Label>Author</Label><p>{currentEntry.authorName}</p></div>
                  <div className="space-y-2"><Label>Company</Label><p>{currentEntry.companyName}</p></div>
                  <div className="space-y-2"><Label>Date</Label><p>{new Date(currentEntry.createdAt).toLocaleDateString()}</p></div>
                  <div className="space-y-2"><Label>Status</Label><StatusBadge status={currentEntry.status} /></div>
                </div>
                {currentEntry.content && (
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.content}</p></CardContent></Card>
                  </div>
                )}
                {currentEntry.source && (
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.source}</p></CardContent></Card>
                  </div>
                )}
                {currentEntry.audience_reach && (
                  <div className="space-y-2">
                    <Label>Audience Reach</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.audience_reach.toLocaleString()}</p></CardContent></Card>
                  </div>
                )}
                {currentEntry.brand && (
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.brand}</p></CardContent></Card>
                  </div>
                )}
                {currentEntry.placement && (
                  <div className="space-y-2">
                    <Label>Placement</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.placement}</p></CardContent></Card>
                  </div>
                )}
                {currentEntry.reporter && (
                  <div className="space-y-2">
                    <Label>Reporter</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.reporter}</p></CardContent></Card>
                  </div>
                )}
                {currentEntry.country && (
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.country}</p></CardContent></Card>
                  </div>
                )}
                {currentEntry.spokesperson && (
                  <div className="space-y-2">
                    <Label>Spokesperson</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.spokesperson}</p></CardContent></Card>
                  </div>
                )}
                {currentEntry.activity && (
                  <div className="space-y-2">
                    <Label>Activity</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.activity}</p></CardContent></Card>
                  </div>
                )}
                {currentEntry.sentiment && (
                  <div className="space-y-2">
                    <Label>Sentiment</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.sentiment}</p></CardContent></Card>
                  </div>
                )}
                {currentEntry.advert_spend && (
                  <div className="space-y-2">
                    <Label>Advert Spend</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.advert_spend.toLocaleString()}</p></CardContent></Card>
                  </div>
                )}
                {currentEntry.circulation && (
                  <div className="space-y-2">
                    <Label>Circulation</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.circulation.toLocaleString()}</p></CardContent></Card>
                  </div>
                )}
                {currentEntry.page_size && (
                  <div className="space-y-2">
                    <Label>Page Size</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.page_size}</p></CardContent></Card>
                  </div>
                )}
                {currentEntry.language && (
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.language}</p></CardContent></Card>
                  </div>
                )}
                {currentEntry.ceo_media_presence && (
                  <div className="space-y-2">
                    <Label>CEO Media Presence</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.ceo_media_presence}</p></CardContent></Card>
                  </div>
                )}
                {currentEntry.ceo_thought_leadership && (
                  <div className="space-y-2">
                    <Label>CEO Thought Leadership</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.ceo_thought_leadership}</p></CardContent></Card>
                  </div>
                )}
                {currentEntry.print_web_clips && (
                  <div className="space-y-2">
                    <Label>Print/Web Clips</Label>
                    <Card><CardContent className="p-4"><a href={currentEntry.print_web_clips} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{currentEntry.print_web_clips}</a></CardContent></Card>
                  </div>
                )}
                {currentEntry.industry && currentEntry.industry.length > 0 && (
                  <div className="space-y-2">
                    <Label>Industry Mentions</Label>
                    {currentEntry.industry.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Headline:</strong> {item.headline}</p>
                          <p><strong>Content:</strong> {item.content}</p>
                          <p><strong>Reporter:</strong> {item.reporter ?? 'N/A'}</p>
                          <p><strong>Source:</strong> {item.source}</p>
                          <p><strong>Sentiment:</strong> {item.sentiment}</p>
                          {item.page && <p><strong>Page:</strong> {item.page}</p>}
                          {item.publication_date && <p><strong>Publication Date:</strong> {new Date(item.publication_date).toLocaleDateString()}</p>}
                          {item.urls?.length > 0 && (
                            <div><strong>URLs:</strong> {item.urls.map((url, urlIndex) => (
                              <a key={urlIndex} href={url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">{url}</a>
                            ))}</div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.competitors && currentEntry.competitors.length > 0 && (
                  <div className="space-y-2">
                    <Label>Competitors</Label>
                    {currentEntry.competitors.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Headline:</strong> {item.headline}</p>
                          <p><strong>Content:</strong> {item.content}</p>
                          <p><strong>Reporter:</strong> {item.reporter ?? 'N/A'}</p>
                          <p><strong>Source:</strong> {item.source}</p>
                          <p><strong>Sentiment:</strong> {item.sentiment}</p>
                          {item.page && <p><strong>Page:</strong> {item.page}</p>}
                          {item.publication_date && <p><strong>Publication Date:</strong> {new Date(item.publication_date).toLocaleDateString()}</p>}
                          {item.urls?.length > 0 && (
                            <div><strong>URLs:</strong> {item.urls.map((url, urlIndex) => (
                              <a key={urlIndex} href={url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">{url}</a>
                            ))}</div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.subsidiaries && currentEntry.subsidiaries.length > 0 && (
                  <div className="space-y-2">
                    <Label>Subsidiaries</Label>
                    {currentEntry.subsidiaries.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Headline:</strong> {item.headline}</p>
                          <p><strong>Content:</strong> {item.content}</p>
                          <p><strong>Reporter:</strong> {item.reporter ?? 'N/A'}</p>
                          <p><strong>Source:</strong> {item.source}</p>
                          <p><strong>Sentiment:</strong> {item.sentiment}</p>
                          {item.page && <p><strong>Page:</strong> {item.page}</p>}
                          {item.publication_date && <p><strong>Publication Date:</strong> {new Date(item.publication_date).toLocaleDateString()}</p>}
                          {item.urls?.length > 0 && (
                            <div><strong>URLs:</strong> {item.urls.map((url, urlIndex) => (
                              <a key={urlIndex} href={url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">{url}</a>
                            ))}</div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.passive && currentEntry.passive.length > 0 && (
                  <div className="space-y-2">
                    <Label>Passive Mentions</Label>
                    {currentEntry.passive.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Headline:</strong> {item.headline}</p>
                          <p><strong>Content:</strong> {item.content}</p>
                          <p><strong>Reporter:</strong> {item.reporter ?? 'N/A'}</p>
                          <p><strong>Source:</strong> {item.source}</p>
                          <p><strong>Sentiment:</strong> {item.sentiment}</p>
                          {item.page && <p><strong>Page:</strong> {item.page}</p>}
                          {item.publication_date && <p><strong>Publication Date:</strong> {new Date(item.publication_date).toLocaleDateString()}</p>}
                          {item.urls?.length > 0 && (
                            <div><strong>URLs:</strong> {item.urls.map((url, urlIndex) => (
                              <a key={urlIndex} href={url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">{url}</a>
                            ))}</div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.advert && currentEntry.advert.length > 0 && (
                  <div className="space-y-2">
                    <Label>Advert Mentions</Label>
                    {currentEntry.advert.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Headline:</strong> {item.headline}</p>
                          <p><strong>Content:</strong> {item.content}</p>
                          <p><strong>Reporter:</strong> {item.reporter ?? 'N/A'}</p>
                          <p><strong>Source:</strong> {item.source}</p>
                          <p><strong>Sentiment:</strong> {item.sentiment}</p>
                          {item.page && <p><strong>Page:</strong> {item.page}</p>}
                          {item.publication_date && <p><strong>Publication Date:</strong> {new Date(item.publication_date).toLocaleDateString()}</p>}
                          {item.urls?.length > 0 && (
                            <div><strong>URLs:</strong> {item.urls.map((url, urlIndex) => (
                              <a key={urlIndex} href={url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">{url}</a>
                            ))}</div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.strengths && currentEntry.strengths.length > 0 && (
                  <div className="space-y-2">
                    <Label>Strengths</Label>
                    {currentEntry.strengths.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Title:</strong> {typeof item === 'string' ? item : item.title || item}</p>
                          <p><strong>Description:</strong> {typeof item === 'string' ? '' : item.description || ''}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.weaknesses && currentEntry.weaknesses.length > 0 && (
                  <div className="space-y-2">
                    <Label>Weaknesses</Label>
                    {currentEntry.weaknesses.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Title:</strong> {typeof item === 'string' ? item : item.title || item}</p>
                          <p><strong>Description:</strong> {typeof item === 'string' ? '' : item.description || ''}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.opportunities && currentEntry.opportunities.length > 0 && (
                  <div className="space-y-2">
                    <Label>Opportunities</Label>
                    {currentEntry.opportunities.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Title:</strong> {typeof item === 'string' ? item : item.title || item}</p>
                          <p><strong>Description:</strong> {typeof item === 'string' ? '' : item.description || ''}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.threats && currentEntry.threats.length > 0 && (
                  <div className="space-y-2">
                    <Label>Threats</Label>
                    {currentEntry.threats.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Title:</strong> {typeof item === 'string' ? item : item.title || item}</p>
                          <p><strong>Description:</strong> {typeof item === 'string' ? '' : item.description || ''}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.social_media_engagement && currentEntry.social_media_engagement.length > 0 && (
                  <div className="space-y-2">
                    <Label>Social Media Engagement</Label>
                    {currentEntry.social_media_engagement.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Percentage:</strong> {item.percentage}</p>
                          <p><strong>Description:</strong> {item.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.brand_awareness && currentEntry.brand_awareness.length > 0 && (
                  <div className="space-y-2">
                    <Label>Brand Awareness</Label>
                    {currentEntry.brand_awareness.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Percentage:</strong> {item.percentage}</p>
                          <p><strong>Description:</strong> {item.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.media_coverage && currentEntry.media_coverage.length > 0 && (
                  <div className="space-y-2">
                    <Label>Media Coverage</Label>
                    {currentEntry.media_coverage.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Percentage:</strong> {item.percentage}</p>
                          <p><strong>Description:</strong> {item.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.competitor_analysis && currentEntry.competitor_analysis.length > 0 && (
                  <div className="space-y-2">
                    <Label>Competitor Analysis</Label>
                    {currentEntry.competitor_analysis.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Percentage:</strong> {item.percentage}</p>
                          <p><strong>Description:</strong> {item.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.metrics && currentEntry.metrics.length > 0 && (
                  <div className="space-y-2">
                    <Label>Metrics</Label>
                    {currentEntry.metrics.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Page Likes:</strong> {item.page_likes}</p>
                          <p><strong>Average Likes:</strong> {item.average_likes}</p>
                          <p><strong>Average Comments:</strong> {item.average_comments}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.comments && (
                  <div className="space-y-2">
                    <Label>Comments</Label>
                    <Card><CardContent className="p-4"><p>{currentEntry.comments}</p></CardContent></Card>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}