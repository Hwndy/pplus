import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { DataCard } from '@/components/ui/DataCard';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, XCircle, AlertCircle, Save, FileEdit, Newspaper, FileText, Target, Share2, LineChart, ClipboardList, ChevronDown, Eye, Calendar, User, MessageCircle } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';

// Base URL for API
const BASE_URL = 'https://pplus-5kdv.onrender.com/api';

// Interface for normalized submission data
interface Submission {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: string;
  status: string;
  comments?: string;
  author?: string;
}

// Status badge component
function StatusBadge({ status }: { status?: string | null }) {
  const normalizedStatus = typeof status === 'string' && status.trim() !== '' ? status.toLowerCase() : 'pending';

  const getStatusStyles = () => {
    switch (normalizedStatus) {
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
    switch (normalizedStatus) {
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
        {normalizedStatus}
      </Badge>
    </div>
  );
}

// View Details Dialog Component
function ViewDetailsDialog({ open, onClose, entry, type }: { open: boolean; onClose: () => void; entry: Submission | null; type: string }) {
  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{type.charAt(0).toUpperCase() + type.slice(1)} Details</DialogTitle>
          <DialogDescription>Detailed information about this entry.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Date
              </div>
              <div className="text-sm mt-1">{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground flex items-center">
                <User className="h-4 w-4 mr-2" />
                Author
              </div>
              <div className="text-sm mt-1">{entry.author || 'Unknown'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Status
              </div>
              <div className="text-sm mt-1 flex items-center">
                <StatusBadge status={entry.status} />
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm font-medium text-muted-foreground">Title</div>
              <div className="text-sm mt-1">{entry.title || 'N/A'}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm font-medium text-muted-foreground">Content</div>
              <div className="text-sm mt-1 p-2 border rounded bg-muted/50 max-h-32 overflow-y-auto">{entry.content || 'No content provided'}</div>
            </div>
            {entry.comments && (
              <div className="md:col-span-2">
                <div className="text-sm font-medium text-muted-foreground">Supervisor Comments</div>
                <div className="text-sm mt-1 p-2 border rounded bg-muted/50">{entry.comments}</div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AnalystDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [viewDetailsDialog, setViewDetailsDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Submission | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');

  // State for fetched data
  const [editorials, setEditorials] = useState<Submission[]>([]);
  const [dailyMentions, setDailyMentions] = useState<Submission[]>([]);
  const [swotAnalysis, setSwotAnalysis] = useState<Submission[]>([]);
  const [socialMentions, setSocialMentions] = useState<Submission[]>([]);
  const [outcomeInsights, setOutcomeInsights] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Fetch all data
  useEffect(() => {
    if (!token || !user) {
      setError('Authentication required. Please log in.');
      setLoading(false);
      toast.error('Please log in to view submissions.');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const endpoints = [
          { url: `${BASE_URL}/editorials/my-editorials`, setter: setEditorials, name: 'Editorials', type: 'Editorial' },
          { url: `${BASE_URL}/daily-mentions/my-mentions`, setter: setDailyMentions, name: 'Daily Mentions', type: 'Daily Mention' },
          { url: `${BASE_URL}/swot-analysis/my-analysis`, setter: setSwotAnalysis, name: 'SWOT Analysis', type: 'SWOT Analysis' },
          { url: `${BASE_URL}/social-media-mentions/my-social-media-mentions`, setter: setSocialMentions, name: 'Social Media Mentions', type: 'Social Media Mention' },
          { url: `${BASE_URL}/outcome-insights/my-insights`, setter: setOutcomeInsights, name: 'Outcome Insights', type: 'Outcome Insight' },
        ];

        const responses = await Promise.all(
          endpoints.map(async ({ url, setter, name, type }) => {
            const res = await fetch(url, { headers });
            if (!res.ok) {
              throw new Error(`${name} fetch failed: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            // Normalize and validate data

            const normalizedData = (Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [])
              .filter(item => item && typeof item === 'object')
              .map((item: any) => {
                let title = 'Untitled';

                // Type-specific title extraction
                if (type === 'Editorial') {
                  title = item.title || 'Untitled Editorial';
                } else if (type === 'Daily Mention') {
                  title = item.industry?.[0]?.headline ||
                          item.competitors?.[0]?.headline ||
                          item.subsidiaries?.[0]?.headline ||
                          item.passive?.[0]?.headline ||
                          item.advert?.[0]?.headline ||
                          item.publication ||
                          'Untitled Daily Mention';
                } else if (type === 'SWOT Analysis') {
                  title = item.strengths?.[0]?.analysis ||
                          item.weaknesses?.[0]?.analysis ||
                          item.opportunities?.[0]?.analysis ||
                          item.threats?.[0]?.analysis ||
                          item.analyst_note?.slice(0, 60) ||
                          'Untitled SWOT Analysis';
                } else if (type === 'Social Media Mention') {
                  title = `${item.social_media_type || 'Social'} Mention - ${new Date(item.date || item.createdAt).toLocaleDateString()}`;
                } else if (type === 'Outcome Insight') {
                  title = item.insights?.[0]?.analysis ||
                          item.insights?.[0]?.category ||
                          item.analyst_note?.slice(0, 60) ||
                          'Untitled Outcome Insight';
                }

                return {
                  id: item.id?.toString() || `temp-${Math.random().toString(36).substring(2)}`,
                  type,
                  title,
                  content: item.analyst_note ||
                          item.content ||
                          item.description ||
                          item.supervisor_note ||
                          item.insights?.map((i: any) => i.analysis).join('; ') ||
                          item.strengths?.map((s: any) => s.analysis).join('; ') ||
                          'No content',
                  createdAt: item.createdAt || item.date || new Date().toISOString(),
                  status: typeof item.status === 'string' && item.status.trim() !== '' ? item.status : 'pending',
                  comments: item.supervisor_note || item.comments || undefined,
                  author: item.creator_data?.username || item.author || item.username || undefined,
                };
              });

            if (normalizedData.length === 0) {
              console.warn(`No valid data returned for ${name}`);
            }
            setter(normalizedData);
            return normalizedData;
          })
        );

        // Check if all responses are empty
        if (responses.every(arr => arr.length === 0)) {
          setError('No submissions found.');
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load submissions');
        toast.error(err.message || 'Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user]);

  // Combined data for 'all' tab
  const allSubmissions = [
    ...editorials,
    ...dailyMentions,
    ...swotAnalysis,
    ...socialMentions,
    ...outcomeInsights,
  ];

  // Filter by status for stats
  const getStatusCounts = (data: Submission[]) => ({
    draft: data.filter(e => e.status.toLowerCase() === 'draft').length,
    pending: data.filter(e => e.status.toLowerCase() === 'pending').length,
    approved: data.filter(e => e.status.toLowerCase() === 'approved').length,
    rejected: data.filter(e => e.status.toLowerCase() === 'rejected').length,
  });

  const allCounts = getStatusCounts(allSubmissions);

  // Generic columns for tables
  const getColumns = (type: string): ColumnDef<Submission>[] => [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <Badge variant="secondary">{row.original.type || type}</Badge>,
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => row.getValue('title') || 'N/A',
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => {
        const date = row.getValue('createdAt');
        return date ? new Date(date as string).toLocaleDateString() : 'N/A';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      accessorKey: 'comments',
      header: 'Comments',
      cell: ({ row }) => row.getValue('comments') || 'No comments',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const entryType = row.original.type.toLowerCase().replace(' ', '-');
        return (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSelectedEntry(row.original);
                setSelectedType(row.original.type);
                setViewDetailsDialog(true);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {(status.toLowerCase() === 'draft' || status.toLowerCase() === 'rejected') && (
              <Button 
                variant="outline" 
                size="sm"
                asChild
              >
                <Link to={`/dashboard/${entryType}/edit/${row.original.id}`}>
                  <FileEdit className="h-4 w-4 mr-1" />
                  {status.toLowerCase() === 'draft' ? 'Edit' : 'Revise'}
                </Link>
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg animate-pulse">Loading submissions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analyst Dashboard</h1>
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <ClipboardList className="mr-2 h-4 w-4" />
                Create New <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800">
              <DropdownMenuItem asChild>
                <Link to="/dashboard/editorial/create" className="w-full cursor-pointer flex items-center text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Newspaper className="mr-2 h-4 w-4" />
                  New Editorial
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/daily-mentions/create" className="w-full cursor-pointer flex items-center text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FileText className="mr-2 h-4 w-4" />
                  New Daily Mention
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/swot-mentions/create" className="w-full cursor-pointer flex items-center text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Target className="mr-2 h-4 w-4" />
                  New SWOT Mention
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/social-media-mentions/create" className="w-full cursor-pointer flex items-center text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Share2 className="mr-2 h-4 w-4" />
                  New Social Media Mention
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/outcome-insights/create" className="w-full cursor-pointer flex items-center text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <LineChart className="mr-2 h-4 w-4" />
                  New Outcome & Insight
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <DataCard title="Drafts" variant="glass" icon={<Save size={24} className="text-blue-500" />}>
          <div className="p-4">
            <div className="text-2xl font-bold">{allCounts.draft}</div>
            <div className="text-sm text-muted-foreground">Saved for later</div>
          </div>
        </DataCard>
        <DataCard title="Pending" variant="glass" icon={<AlertCircle size={24} className="text-yellow-500" />}>
          <div className="p-4">
            <div className="text-2xl font-bold">{allCounts.pending}</div>
            <div className="text-sm text-muted-foreground">Awaiting review</div>
          </div>
        </DataCard>
        <DataCard title="Approved" variant="glass" icon={<CheckCircle size={24} className="text-green-500" />}>
          <div className="p-4">
            <div className="text-2xl font-bold">{allCounts.approved}</div>
            <div className="text-sm text-muted-foreground">Successfully validated</div>
          </div>
        </DataCard>
        <DataCard title="Rejected" variant="glass" icon={<XCircle size={24} className="text-red-500" />}>
          <div className="p-4">
            <div className="text-2xl font-bold">{allCounts.rejected}</div>
            <div className="text-sm text-muted-foreground">Require attention</div>
          </div>
        </DataCard>
      </div>

      {/* Tabs for different submission types */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
          <TabsTrigger value="editorials" className="text-sm">Editorials</TabsTrigger>
          <TabsTrigger value="daily-mentions" className="text-sm">Daily Mentions</TabsTrigger>
          <TabsTrigger value="swot" className="text-sm">SWOT Analysis</TabsTrigger>
          <TabsTrigger value="social" className="text-sm">Social Media</TabsTrigger>
          <TabsTrigger value="insights" className="text-sm">Outcome Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <DataCard title="All Submissions" description="View and manage all your data submissions" variant="glass">
            {allSubmissions.length > 0 ? (
              <DataTable columns={getColumns('All')} data={allSubmissions} searchPlaceholder="Search all submissions..." />
            ) : (
              <div className="text-center p-4 text-gray-500">No submissions available.</div>
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="editorials" className="mt-6">
          <DataCard title="Editorials" description="Manage your editorial submissions" variant="glass">
            {editorials.length > 0 ? (
              <DataTable columns={getColumns('Editorial')} data={editorials} searchPlaceholder="Search editorials..." />
            ) : (
              <div className="text-center p-4 text-gray-500">No editorial submissions available.</div>
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="daily-mentions" className="mt-6">
          <DataCard title="Daily Mentions" description="Manage your daily mentions" variant="glass">
            {dailyMentions.length > 0 ? (
              <DataTable columns={getColumns('Daily Mention')} data={dailyMentions} searchPlaceholder="Search daily mentions..." />
            ) : (
              <div className="text-center p-4 text-gray-500">No daily mentions available.</div>
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="swot" className="mt-6">
          <DataCard title="SWOT Analysis" description="Manage your SWOT analysis entries" variant="glass">
            {swotAnalysis.length > 0 ? (
              <DataTable columns={getColumns('SWOT Analysis')} data={swotAnalysis} searchPlaceholder="Search SWOT analysis..." />
            ) : (
              <div className="text-center p-4 text-gray-500">No SWOT analysis submissions available.</div>
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <DataCard title="Social Media Mentions" description="Manage your social media mentions" variant="glass">
            {socialMentions.length > 0 ? (
              <DataTable columns={getColumns('Social Media Mention')} data={socialMentions} searchPlaceholder="Search social mentions..." />
            ) : (
              <div className="text-center p-4 text-gray-500">No social media mentions available.</div>
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <DataCard title="Outcome Insights" description="Manage your outcome insights" variant="glass">
            {outcomeInsights.length > 0 ? (
              <DataTable columns={getColumns('Outcome Insight')} data={outcomeInsights} searchPlaceholder="Search insights..." />
            ) : (
              <div className="text-center p-4 text-gray-500">No outcome insights available.</div>
            )}
          </DataCard>
        </TabsContent>
      </Tabs>

      {/* View Details Dialog */}
      <ViewDetailsDialog
        open={viewDetailsDialog}
        onClose={() => setViewDetailsDialog(false)}
        entry={selectedEntry}
        type={selectedType}
      />
    </div>
  );
}
