
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
  Edit,
  Trash2,
  RefreshCw,
  Globe,
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

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
        >
          First
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Prev
        </Button>

        {start > 1 && (
          <Button size="sm" variant="ghost" disabled>
            ...
          </Button>
        )}

        {pages.map((page) => (
          <Button
            key={page}
            size="sm"
            variant={currentPage === page ? 'default' : 'outline'}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}

        {end < totalPages && (
          <Button size="sm" variant="ghost" disabled>
            ...
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          Last
        </Button>
      </div>
    </div>
  );
}

// API Base
const API_BASE = 'https://p-fw0o.onrender.com/api/v1';
const PAGE_SIZE = 10;

// Generic Entry Interface
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
  industry?: any[];
  competitors?: any[];
  subsidiaries?: any[];
  passive?: any[];
  advert?: any[];
  strengths?: any[];
  weaknesses?: any[];
  opportunities?: any[];
  threats?: any[];
  insights?: any[];
  metrics?: any[];
  highlights?: string[];
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
  ceo_thought_leadership?: string;
  print_web_clips?: string | null;
  social_media_engagement?: any[];
  brand_awareness?: any[];
  media_coverage?: any[];
  competitor_analysis?: any[];
}

// Stats Interface
interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  approvedToday: number;
  rejectedToday: number;
  byType: Record<string, { pending: number; approved: number; rejected: number; total: number; displayName: string }>;
}

// Pagination Interface
interface Pagination {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

// Content Types Config
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
  industryLandscapeOverview: {
    endpoint: '/industry-landscape-overview',
    updateEndpoint: '/industry-landscape-overview/update',
    statusEndpoint: '/industry-landscape-overview/:id/status',
    displayName: 'Industry Landscape Overview',
    icon: <Globe className="h-4 w-4" />,
  },
} as const;

type ContentTypeKey = keyof typeof contentTypes;

// Type-specific keys
const typeKeys = {
  editorials: { recentKey: 'recent_editorials', statsPrefix: 'editorials' },
  dailyMentions: { recentKey: 'recent_mentions', statsPrefix: 'mentions' },
  swotAnalysis: { recentKey: 'recent_analysis', statsPrefix: 'analysis' },
  outcomeInsights: { recentKey: 'recent_insights', statsPrefix: 'insights' },
  socialMediaMentions: { recentKey: 'recent_mentions', statsPrefix: 'mentions' },
  industryLandscapeOverview: { recentKey: 'recent_overviews', statsPrefix: 'overviews' },
};

// Supervisor Endpoints
const SUPERVISOR_ENDPOINTS = {
  editorials: '/editorials/supervisor-dashboard',
  dailyMentions: '/daily-mentions/supervisor-dashboard',
  swotAnalysis: '/swot-analysis/supervisor-dashboard',
  outcomeInsights: '/outcome-insights/supervisor-dashboard',
  socialMediaMentions: '/social-media-mentions/supervisor-dashboard',
  industryLandscapeOverview: '/industry-landscape-overview/supervisor-dashboard',
} as const;

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending':
      case 'draft':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusStyles()} capitalize`}>
      {status || 'Unknown'}
    </Badge>
  );
}

// Supervisor Dashboard Component
export function SupervisorDashboard() {
  const { token, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {};

  const isSupervisor = user?.role.name === 'Supervisor';
  const isAdmin = user?.role.name === 'Admin';

  const [stats, setStats] = useState<Stats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
    approvedToday: 0,
    rejectedToday: 0,
    byType: {},
  });
  const [data, setData] = useState<Record<ContentTypeKey, GenericEntry[]>>({});
  const [pagination, setPagination] = useState<Record<ContentTypeKey, Pagination>>({
    editorials: { currentPage: 1, totalPages: 1, total: 0, pageSize: PAGE_SIZE },
    dailyMentions: { currentPage: 1, totalPages: 1, total: 0, pageSize: PAGE_SIZE },
    swotAnalysis: { currentPage: 1, totalPages: 1, total: 0, pageSize: PAGE_SIZE },
    outcomeInsights: { currentPage: 1, totalPages: 1, total: 0, pageSize: PAGE_SIZE },
    socialMediaMentions: { currentPage: 1, totalPages: 1, total: 0, pageSize: PAGE_SIZE },
    industryLandscapeOverview: { currentPage: 1, totalPages: 1, total: 0, pageSize: PAGE_SIZE },
  });
  const [activeTab, setActiveTab] = useState<ContentTypeKey>('editorials');
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentEntry, setCurrentEntry] = useState<GenericEntry | null>(null);

  // Handle Unauthorized Access
  useEffect(() => {
    if (!isAuthenticated || !token || !user?.id) {
      toast.error('Please log in to access the dashboard');
      navigate('/login', { replace: true });
      setLoading(false);
    }
  }, [isAuthenticated, token, user, navigate]);

  // Transform API data to GenericEntry
  const transformToGenericEntry = (type: ContentTypeKey, rawEntry: any): GenericEntry => {
    const getCompanyName = () => {
      return (
        rawEntry.company?.company_name ||
        rawEntry.company?.name ||
        rawEntry.company_data?.company_name ||
        rawEntry.company_data?.name ||
        rawEntry.companyName ||
        'Unknown'
      );
    };

    const companyName = getCompanyName();

    if (type === 'editorials') {
      return {
        id: rawEntry.id.toString(),
        title: rawEntry.title || 'Untitled',
        content: rawEntry.analyst_note || '',
        status: rawEntry.status || 'pending',
        createdAt: rawEntry.date || rawEntry.createdAt || new Date().toISOString(),
        updatedAt: rawEntry.updatedAt,
        authorName: rawEntry.created_by?.username || rawEntry.creator_data?.username || 'Unknown',
        companyName,
        comments: rawEntry.supervisor_note || rawEntry.admin_note || '',
        reviewedBy: rawEntry.approved_by?.username || rawEntry.approver_data?.username || 'Unknown',
        reviewedAt: rawEntry.updatedAt,
        source: rawEntry.source,
        audience_reach: rawEntry.audience_reach,
        brand: rawEntry.brand,
        placement: rawEntry.placement,
        reporter: rawEntry.reporter,
        country: rawEntry.country,
        spokesperson: rawEntry.spokesperson,
        activity: rawEntry.activity,
        sentiment: rawEntry.sentiment,
        advert_spend: rawEntry.advert_spend,
        circulation: rawEntry.circulation,
        page_size: rawEntry.page_size,
        language: rawEntry.language,
        ceo_thought_leadership: rawEntry.ceo_thought_leadership,
        print_web_clips: rawEntry.print_web_clips,
      };
    } else if (type === 'dailyMentions') {
      const industry = rawEntry.industry?.[0] || {};
      return {
        id: rawEntry.id.toString(),
        title: industry.headline || rawEntry.publication || 'Untitled',
        content: industry.content || '',
        status: rawEntry.status || 'pending',
        createdAt: rawEntry.date || rawEntry.createdAt || new Date().toISOString(),
        updatedAt: rawEntry.updatedAt,
        authorName: rawEntry.created_by?.username || rawEntry.creator_data?.username || 'Unknown',
        companyName,
        comments: rawEntry.supervisor_note || '',
        reviewedBy: rawEntry.approved_by?.username || rawEntry.approver_data?.username || 'Unknown',
        reviewedAt: rawEntry.updatedAt,
        industry: rawEntry.industry || [],
        competitors: rawEntry.competitors || [],
        subsidiaries: rawEntry.subsidiaries || [],
        passive: rawEntry.passive || [],
        advert: rawEntry.advert || [],
      };
    } else if (type === 'swotAnalysis') {
      return {
        id: rawEntry.id.toString(),
        title: rawEntry.title || rawEntry.strengths?.[0]?.analysis || rawEntry.analyst_note?.slice(0, 50) || 'Untitled',
        content: rawEntry.analyst_note || '',
        status: rawEntry.status || 'pending',
        createdAt: rawEntry.date || rawEntry.createdAt || new Date().toISOString(),
        updatedAt: rawEntry.updatedAt,
        authorName: rawEntry.created_by?.username || rawEntry.creator_data?.username || 'Unknown',
        companyName,
        comments: rawEntry.supervisor_note || '',
        reviewedBy: rawEntry.approved_by?.username || rawEntry.approver_data?.username || 'Unknown',
        reviewedAt: rawEntry.updatedAt,
        strengths: rawEntry.strengths || [],
        weaknesses: rawEntry.weaknesses || [],
        opportunities: rawEntry.opportunities || [],
        threats: rawEntry.threats || [],
      };
    } else if (type === 'outcomeInsights') {
      return {
        id: rawEntry.id.toString(),
        title: rawEntry.title || rawEntry.insights?.[0]?.category || rawEntry.analyst_note?.slice(0, 50) || 'Untitled',
        content: rawEntry.analyst_note || '',
        status: rawEntry.status || 'pending',
        createdAt: rawEntry.date || rawEntry.createdAt || new Date().toISOString(),
        updatedAt: rawEntry.updatedAt,
        authorName: rawEntry.created_by?.username || rawEntry.creator_data?.username || 'Unknown',
        companyName,
        comments: rawEntry.supervisor_note || '',
        reviewedBy: rawEntry.approved_by?.username || rawEntry.approver_data?.username || 'Unknown',
        reviewedAt: rawEntry.updatedAt,
        insights: rawEntry.insights || [],
      };
    } else if (type === 'socialMediaMentions') {
      return {
        id: rawEntry.id.toString(),
        title: rawEntry.social_media_type || rawEntry.analyst_note?.slice(0, 50) || 'Untitled',
        content: rawEntry.analyst_note || '',
        status: rawEntry.status || 'pending',
        createdAt: rawEntry.date || rawEntry.createdAt || new Date().toISOString(),
        updatedAt: rawEntry.updatedAt,
        authorName: rawEntry.created_by?.username || rawEntry.creator_data?.username || 'Unknown',
        companyName,
        comments: rawEntry.supervisor_note || '',
        reviewedBy: rawEntry.approved_by?.username || rawEntry.approver_data?.username || 'Unknown',
        reviewedAt: rawEntry.updatedAt,
        metrics: rawEntry.metrics || [],
      };
    } else if (type === 'industryLandscapeOverview') {
      return {
        id: rawEntry.id.toString(),
        title: rawEntry.sector || rawEntry.title || 'Untitled Industry Overview',
        content: rawEntry.highlights?.join('\n') || rawEntry.analyst_note || 'No highlights available',
        status: rawEntry.status || 'pending',
        createdAt: rawEntry.date || rawEntry.createdAt || new Date().toISOString(),
        updatedAt: rawEntry.updatedAt,
        authorName: rawEntry.created_by?.username || rawEntry.creator_data?.username || 'Unknown',
        companyName,
        comments: rawEntry.supervisor_note || '',
        reviewedBy: rawEntry.approved_by?.username || rawEntry.approver_data?.username || 'Unknown',
        reviewedAt: rawEntry.updatedAt,
        highlights: rawEntry.highlights || [],
      };
    }

    // Fallback
    return {
      id: rawEntry.id.toString(),
      title: rawEntry.title || rawEntry.headline || rawEntry.sector || 'Untitled',
      content: rawEntry.analyst_note || rawEntry.content || rawEntry.highlights?.join('\n') || '',
      status: rawEntry.status || 'pending',
      createdAt: rawEntry.date || rawEntry.createdAt || new Date().toISOString(),
      updatedAt: rawEntry.updatedAt,
      authorName: rawEntry.created_by?.username || rawEntry.creator_data?.username || 'Unknown',
      companyName,
      comments: rawEntry.supervisor_note || '',
      reviewedBy: rawEntry.approved_by?.username || rawEntry.approver_data?.username || 'Unknown',
      reviewedAt: rawEntry.updatedAt,
    };
  };

  // Fetch all stats on mount for supervisor
  useEffect(() => {
    if (isAuthenticated && token && user?.id && isSupervisor) {
      setLoading(true);
      const types = Object.keys(contentTypes) as ContentTypeKey[];
      Promise.all(
        types.map((type) => {
          const url = `${API_BASE}${SUPERVISOR_ENDPOINTS[type]}?page=1&limit=1`;
          return fetch(url, { headers }).then((res) => res.json());
        })
      )
        .then((responses) => {
          let newStats: Stats = {
            pending: 0,
            approved: 0,
            rejected: 0,
            total: 0,
            approvedToday: 0,
            rejectedToday: 0,
            byType: {},
          };
          let maxApprovedToday = 0;
          let maxRejectedToday = 0;
          responses.forEach((json, index) => {
            const type = types[index];
            const s = json?.data?.stats || {};
            const prefix = typeKeys[type].statsPrefix;
            const pending = s[`pending_${prefix}`] || 0;
            const approved = s[`approved_${prefix}`] || 0;
            const rejected = s[`rejected_${prefix}`] || 0;
            const total = s[`total_${prefix}`] || 0;

            newStats.byType[type] = {
              pending,
              approved,
              rejected,
              total,
              displayName: contentTypes[type].displayName,
            };

            newStats.pending += pending;
            newStats.approved += approved;
            newStats.rejected += rejected;
            newStats.total += total;

            maxApprovedToday = Math.max(maxApprovedToday, s.approved_today || 0);
            maxRejectedToday = Math.max(maxRejectedToday, s.rejected_today || 0);
          });
          newStats.approvedToday = maxApprovedToday;
          newStats.rejectedToday = maxRejectedToday;
          setStats(newStats);
          fetchEntries(activeTab, 1);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching stats:', error);
          toast.error('Failed to load dashboard stats');
          setLoading(false);
        });
    } else if (isAdmin) {
      // Admin stats logic
      setLoading(true);
      const types = Object.keys(contentTypes) as ContentTypeKey[];
      Promise.all(
        types.flatMap((type) => [
          fetch(`${API_BASE}${contentTypes[type].endpoint}?status=pending&page=1&limit=1`, { headers }).then((res) => res.json()),
          fetch(`${API_BASE}${contentTypes[type].endpoint}?status=approved&page=1&limit=1`, { headers }).then((res) => res.json()),
          fetch(`${API_BASE}${contentTypes[type].endpoint}?status=rejected&page=1&limit=1`, { headers }).then((res) => res.json()),
        ])
      )
        .then((responses) => {
          let newStats: Stats = {
            pending: 0,
            approved: 0,
            rejected: 0,
            total: 0,
            approvedToday: 0,
            rejectedToday: 0,
            byType: {},
          };
          let i = 0;
          types.forEach((type) => {
            const pendJson = responses[i++];
            const apprJson = responses[i++];
            const rejJson = responses[i++];

            const pending = pendJson?.data?.meta?.total || pendJson?.data?.pagination?.total || 0;
            const approved = apprJson?.data?.meta?.total || apprJson?.data?.pagination?.total || 0;
            const rejected = rejJson?.data?.meta?.total || rejJson?.data?.pagination?.total || 0;
            const total = pending + approved + rejected;

            newStats.byType[type] = {
              pending,
              approved,
              rejected,
              total,
              displayName: contentTypes[type].displayName,
            };

            newStats.pending += pending;
            newStats.approved += approved;
            newStats.rejected += rejected;
            newStats.total += total;
          });
          setStats(newStats);
          fetchEntries(activeTab, 1);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching admin stats:', error);
          toast.error('Failed to load dashboard stats');
          setLoading(false);
        });
    }
  }, [isAuthenticated, token, user, isSupervisor, isAdmin, activeTab]);

  // Fetch Entries for Type
  const fetchEntries = async (type: ContentTypeKey, page: number = 1) => {
    if (!token || !user?.id) return;

    setTableLoading(true);
    try {
      const url = isSupervisor
        ? `${API_BASE}${SUPERVISOR_ENDPOINTS[type]}?page=${page}&limit=${PAGE_SIZE}`
        : `${API_BASE}${contentTypes[type].endpoint}?page=${page}&limit=${PAGE_SIZE}`;

      const res = await fetch(url, { headers });
      if (res.status === 401) throw new Error('Unauthorized');
      if (!res.ok) throw new Error(`Failed to fetch ${type}`);

      const json = await res.json();
      let entries: any[] = [];
      let paginationData: Pagination = { currentPage: page, totalPages: 1, total: 0, pageSize: PAGE_SIZE };

      if (json.success && json.data) {
        if (isSupervisor) {
          const keys = typeKeys[type];
          const recent = json.data[keys.recentKey] || {};
          entries = Array.isArray(recent.data) ? recent.data : [];
          const pag = recent.pagination || {};
          paginationData = {
            currentPage: pag.currentPage || pag.page || page,
            totalPages: pag.totalPages || pag.totalPage || 1,
            total: pag.total || 0,
            pageSize: pag.pageSize || pag.limit || PAGE_SIZE,
          };

          // Update per-type stats if needed (but already done in initial load)
        } else {
          let pag = {};
          if (type === 'editorials') {
            entries = Array.isArray(json.data.editorial) ? json.data.editorial : [];
            pag = json.data.meta || {};
          } else if (type === 'industryLandscapeOverview') {
            entries = Array.isArray(json.data.overviews) ? json.data.overviews : [];
            pag = json.data.pagination || {};
          } else {
            entries = Array.isArray(json.data?.data) ? json.data.data : Array.isArray(json.data) ? json.data : [];
            pag = json.data?.meta || json.meta || json.data?.pagination || json.pagination || {};
          }
          paginationData = {
            currentPage: (pag as any).currentPage || (pag as any).page || page,
            totalPages: (pag as any).totalPage || (pag as any).totalPages || 1,
            total: (pag as any).total || 0,
            pageSize: (pag as any).pageSize || (pag as any).limit || PAGE_SIZE,
          };
        }
      }

      const transformedEntries = entries.map((entry) => transformToGenericEntry(type, entry));
      setData((prev) => ({ ...prev, [type]: transformedEntries }));
      setPagination((prev) => ({ ...prev, [type]: paginationData }));
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      toast.error(`Failed to load ${contentTypes[type].displayName}`);
    } finally {
      setTableLoading(false);
    }
  };

  // Refresh Data
  const handleRefresh = () => {
    // Re-fetch stats and current tab data
    setData((prev) => ({ ...prev, [activeTab]: [] }));
    // To re-fetch all stats, trigger the useEffect by some state, but for simplicity, re-run the promise.all
    const types = Object.keys(contentTypes) as ContentTypeKey[];
    Promise.all(
      types.map((type) => {
        const url = `${API_BASE}${SUPERVISOR_ENDPOINTS[type]}?page=1&limit=1`;
        return fetch(url, { headers }).then((res) => res.json());
      })
    )
      .then((responses) => {
        let newStats: Stats = {
          pending: 0,
          approved: 0,
          rejected: 0,
          total: 0,
          approvedToday: 0,
          rejectedToday: 0,
          byType: {},
        };
        let maxApprovedToday = 0;
        let maxRejectedToday = 0;
        responses.forEach((json, index) => {
          const type = types[index];
          const s = json?.data?.stats || {};
          const prefix = typeKeys[type].statsPrefix;
          const pending = s[`pending_${prefix}`] || 0;
          const approved = s[`approved_${prefix}`] || 0;
          const rejected = s[`rejected_${prefix}`] || 0;
          const total = s[`total_${prefix}`] || 0;

          newStats.byType[type] = {
            pending,
            approved,
            rejected,
            total,
            displayName: contentTypes[type].displayName,
          };

          newStats.pending += pending;
          newStats.approved += approved;
          newStats.rejected += rejected;
          newStats.total += total;

          maxApprovedToday = Math.max(maxApprovedToday, s.approved_today || 0);
          maxRejectedToday = Math.max(maxRejectedToday, s.rejected_today || 0);
        });
        newStats.approvedToday = maxApprovedToday;
        newStats.rejectedToday = maxRejectedToday;
        setStats(newStats);
        fetchEntries(activeTab, 1);
        toast.success('Data refreshed');
      })
      .catch((error) => {
        toast.error('Failed to refresh stats');
      });
  };

  // Update Entry Status
  const updateStatus = async (entry: GenericEntry, newStatus: 'approved' | 'rejected', comments?: string) => {
    if (!token || !user?.id || !currentEntry) return;

    const type = activeTab;
    const endpoint = `${API_BASE}${contentTypes[type].statusEndpoint.replace(':id', entry.id)}`;
    const updateBody = {
      status: newStatus,
      ...(comments ? { supervisor_note: comments } : {}),
      ...(type === 'dailyMentions' ? { approver_id: user.id } : { approved_by: user.id }),
    };

    try {
      const res = await fetch(endpoint, { method: 'PATCH', headers, body: JSON.stringify(updateBody) });
      if (!res.ok) throw new Error();
      toast.success(`${contentTypes[type].displayName} ${newStatus}`);
      setData((prev) => ({
        ...prev,
        [type]: prev[type].map((e) =>
          e.id === entry.id
            ? { ...e, status: newStatus, comments: comments || e.comments, reviewedBy: user.name || user.username, reviewedAt: new Date().toISOString() }
            : e
        ),
      }));
      fetchEntries(activeTab, pagination[activeTab].currentPage);
    } catch (error) {
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
    if (rejectReason.trim() && currentEntry) updateStatus(currentEntry, 'rejected', rejectReason);
    setShowRejectDialog(false);
  };
  const openDetailsDialog = (entry: GenericEntry) => {
    setCurrentEntry(entry);
    setShowDetailsDialog(true);
  };

  const getColumns = (type: ContentTypeKey): ColumnDef<GenericEntry>[] => [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => <div className="max-w-xs truncate" title={row.getValue('title')}>{row.getValue('title')}</div>,
    },
    {
      accessorKey: 'authorName',
      header: 'Author',
      cell: ({ row }) => row.original.authorName || 'Unknown',
    },
    {
      accessorKey: 'companyName',
      header: 'Company',
      cell: ({ row }) => row.original.companyName || 'Unknown',
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
        const entry = row.original;
        return (
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => openDetailsDialog(entry)}>
              <Eye className="mr-2 h-4 w-4" /> View
            </Button>
            {entry.status === 'pending' && (
              <>
                <Button size="sm" variant="outline" className="text-green-600 border-green-600" onClick={() => handleQuickApprove(entry)}>
                  <CheckSquare className="mr-2 h-4 w-4" /> Approve
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 border-red-600" onClick={() => openRejectDialog(entry)}>
                  <AlertTriangle className="mr-2 h-4 w-4" /> Reject
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (isAuthenticated && token && user?.id) {
      fetchEntries(activeTab, pagination[activeTab].currentPage);
    }
  }, [activeTab, isAuthenticated, token, user]);

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Supervisor Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

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
          <Stat label="Total Entries Reviewed" value={stats.approved + stats.rejected} subtitle="All time" />
        </DataCard>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        {Object.entries(stats.byType).map(([key, typeStats]) => (
          <DataCard key={key} title={typeStats.displayName} variant="glass" icon={contentTypes[key as ContentTypeKey]?.icon || <FileText size={20} />}>
            <Stat label="Pending Review" value={typeStats.pending} subtitle={typeStats.displayName} />
          </DataCard>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentTypeKey)}>
        <TabsList className="grid w-full grid-cols-6">
          {Object.entries(contentTypes).map(([key, config]) => (
            <TabsTrigger key={key} value={key as ContentTypeKey}>
              {config.displayName.split(' ')[0]} ({stats.byType[key]?.pending || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(contentTypes).map(([key, config]) => {
          const typeKey = key as ContentTypeKey;
          const pag = pagination[typeKey];

          return (
            <TabsContent key={key} value={typeKey}>
              <Card>
                <CardHeader>
                  <CardTitle>{config.displayName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={getColumns(typeKey)}
                    data={data[typeKey] || []}
                    searchPlaceholder={`Search ${config.displayName.toLowerCase()}...`}
                    loading={tableLoading}
                    pagination={{
                      currentPage: pag.currentPage,
                      totalPages: pag.totalPages,
                      onPageChange: (page: number) => fetchEntries(typeKey, page),
                    }}
                  />

                  {pag.totalPages > 1 && (
                    <PaginationControls
                      currentPage={pag.currentPage}
                      totalPages={pag.totalPages}
                      onPageChange={(page: number) => fetchEntries(typeKey, page)}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

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
                  <div className="space-y-2"><Label>Title</Label><p>{currentEntry.title}</p></div>
                  <div className="space-y-2"><Label>Status</Label><StatusBadge status={currentEntry.status} /></div>
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
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={submitRejection}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                    {currentEntry.industry.map((item: any, index: number) => (
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
                            <div><strong>URLs:</strong> {item.urls.map((url: string, urlIndex: number) => (
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
                    {currentEntry.competitors.map((item: any, index: number) => (
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
                            <div><strong>URLs:</strong> {item.urls.map((url: string, urlIndex: number) => (
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
                    {currentEntry.subsidiaries.map((item: any, index: number) => (
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
                            <div><strong>URLs:</strong> {item.urls.map((url: string, urlIndex: number) => (
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
                    {currentEntry.passive.map((item: any, index: number) => (
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
                            <div><strong>URLs:</strong> {item.urls.map((url: string, urlIndex: number) => (
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
                    {currentEntry.advert.map((item: any, index: number) => (
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
                            <div><strong>URLs:</strong> {item.urls.map((url: string, urlIndex: number) => (
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
                    {currentEntry.strengths.map((item: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Analysis:</strong> {item.analysis || item.title || item}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.weaknesses && currentEntry.weaknesses.length > 0 && (
                  <div className="space-y-2">
                    <Label>Weaknesses</Label>
                    {currentEntry.weaknesses.map((item: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Analysis:</strong> {item.analysis || item.title || item}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.opportunities && currentEntry.opportunities.length > 0 && (
                  <div className="space-y-2">
                    <Label>Opportunities</Label>
                    {currentEntry.opportunities.map((item: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Analysis:</strong> {item.analysis || item.title || item}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.threats && currentEntry.threats.length > 0 && (
                  <div className="space-y-2">
                    <Label>Threats</Label>
                    {currentEntry.threats.map((item: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Analysis:</strong> {item.analysis || item.title || item}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.insights && currentEntry.insights.length > 0 && (
                  <div className="space-y-2">
                    <Label>Insights</Label>
                    {currentEntry.insights.map((item: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <p><strong>Category:</strong> {item.category}</p>
                          <p><strong>Analysis:</strong> {item.analysis}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.metrics && currentEntry.metrics.length > 0 && (
                  <div className="space-y-2">
                    <Label>Metrics</Label>
                    {currentEntry.metrics.map((item: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          {item.page_likes && <p><strong>Page Likes:</strong> {item.page_likes}</p>}
                          {item.average_likes && <p><strong>Average Likes:</strong> {item.average_likes}</p>}
                          {item.average_comments && <p><strong>Average Comments:</strong> {item.average_comments}</p>}
                          {item.posts && <p><strong>Posts:</strong> {item.posts}</p>}
                          {item.followers && <p><strong>Followers:</strong> {item.followers}</p>}
                          {item.following && <p><strong>Following:</strong> {item.following}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {currentEntry.highlights && currentEntry.highlights.length > 0 && (
                  <div className="space-y-2">
                    <Label>Highlights</Label>
                    <Card>
                      <CardContent className="p-4">
                        <ul className="list-disc pl-4 space-y-1">
                          {currentEntry.highlights.map((h: string, index: number) => (
                            <li key={index}>{h}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
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
