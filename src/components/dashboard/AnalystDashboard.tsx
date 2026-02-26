import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { DataCard } from '@/components/ui/DataCard';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, XCircle, AlertCircle, Save, FileEdit, Newspaper, FileText, Target, Share2, LineChart, ClipboardList, ChevronDown, Eye, Calendar, User, MessageCircle, Globe } from 'lucide-react';
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
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

// Base URL for API
const BASE_URL = 'https://pplus-7q0p.onrender.com/api/v1';

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
  rawData: any; // Keep raw data for mapping
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

// View Details Dialog Component (updated for UI consistency with Supervisor)
function ViewDetailsDialog({ open, onClose, entry, type }: { open: boolean; onClose: () => void; entry: Submission | null; type: string }) {
  if (!entry) return null;

  const rawEntry = entry.rawData;

  // Helper to get company name
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

  let specificContent = null;

  switch (entry.type) {
    case 'Editorial':
      specificContent = (
        <>
          {rawEntry.source && (
            <div className="space-y-2">
              <Label>Source</Label>
              <Card><CardContent className="p-4"><p>{rawEntry.source}</p></CardContent></Card>
            </div>
          )}
          {rawEntry.audience_reach && (
            <div className="space-y-2">
              <Label>Audience Reach</Label>
              <Card><CardContent className="p-4"><p>{rawEntry.audience_reach.toLocaleString()}</p></CardContent></Card>
            </div>
          )}
          {rawEntry.brand && (
            <div className="space-y-2">
              <Label>Brand</Label>
              <Card><CardContent className="p-4"><p>{rawEntry.brand}</p></CardContent></Card>
            </div>
          )}
          {rawEntry.placement && (
            <div className="space-y-2">
              <Label>Placement</Label>
              <Card><CardContent className="p-4"><p>{rawEntry.placement}</p></CardContent></Card>
            </div>
          )}
          {rawEntry.reporter && (
            <div className="space-y-2">
              <Label>Reporter</Label>
              <Card><CardContent className="p-4"><p>{rawEntry.reporter}</p></CardContent></Card>
            </div>
          )}
          {rawEntry.country && (
            <div className="space-y-2">
              <Label>Country</Label>
              <Card><CardContent className="p-4"><p>{rawEntry.country}</p></CardContent></Card>
            </div>
          )}
          {rawEntry.spokesperson && (
            <div className="space-y-2">
              <Label>Spokesperson</Label>
              <Card><CardContent className="p-4"><p>{rawEntry.spokesperson}</p></CardContent></Card>
            </div>
          )}
          {rawEntry.activity && (
            <div className="space-y-2">
              <Label>Activity</Label>
              <Card><CardContent className="p-4"><p>{rawEntry.activity}</p></CardContent></Card>
            </div>
          )}
          {rawEntry.sentiment && (
            <div className="space-y-2">
              <Label>Sentiment</Label>
              <Card><CardContent className="p-4"><p>{rawEntry.sentiment}</p></CardContent></Card>
            </div>
          )}
          {rawEntry.advert_spend && (
            <div className="space-y-2">
              <Label>Advert Spend</Label>
              <Card><CardContent className="p-4"><p>{rawEntry.advert_spend.toLocaleString()}</p></CardContent></Card>
            </div>
          )}
          {rawEntry.circulation && (
            <div className="space-y-2">
              <Label>Circulation</Label>
              <Card><CardContent className="p-4"><p>{rawEntry.circulation.toLocaleString()}</p></CardContent></Card>
            </div>
          )}
          {rawEntry.page_size && (
            <div className="space-y-2">
              <Label>Page Size</Label>
              <Card><CardContent className="p-4"><p>{rawEntry.page_size}</p></CardContent></Card>
            </div>
          )}
          {rawEntry.language && (
            <div className="space-y-2">
              <Label>Language</Label>
              <Card><CardContent className="p-4"><p>{rawEntry.language}</p></CardContent></Card>
            </div>
          )}
          {rawEntry.ceo_thought_leadership && (
            <div className="space-y-2">
              <Label>CEO Thought Leadership</Label>
              <Card><CardContent className="p-4"><p>{rawEntry.ceo_thought_leadership}</p></CardContent></Card>
            </div>
          )}
          {rawEntry.print_web_clips && (
            <div className="space-y-2">
              <Label>Print/Web Clips</Label>
              <Card><CardContent className="p-4"><a href={rawEntry.print_web_clips} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{rawEntry.print_web_clips}</a></CardContent></Card>
            </div>
          )}
        </>
      );
      break;

    case 'Daily Mention':
      specificContent = (
        <>
          {rawEntry.industry && rawEntry.industry.length > 0 && (
            <div className="space-y-2">
              <Label>Industry Mentions</Label>
              {rawEntry.industry.map((item: any, index: number) => (
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
          {rawEntry.competitors && rawEntry.competitors.length > 0 && (
            <div className="space-y-2">
              <Label>Competitors</Label>
              {rawEntry.competitors.map((item: any, index: number) => (
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
          {rawEntry.subsidiaries && rawEntry.subsidiaries.length > 0 && (
            <div className="space-y-2">
              <Label>Subsidiaries</Label>
              {rawEntry.subsidiaries.map((item: any, index: number) => (
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
          {rawEntry.passive && rawEntry.passive.length > 0 && (
            <div className="space-y-2">
              <Label>Passive Mentions</Label>
              {rawEntry.passive.map((item: any, index: number) => (
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
          {rawEntry.advert && rawEntry.advert.length > 0 && (
            <div className="space-y-2">
              <Label>Advert Mentions</Label>
              {rawEntry.advert.map((item: any, index: number) => (
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
        </>
      );
      break;

    case 'SWOT Analysis':
      specificContent = (
        <>
          {rawEntry.strengths && rawEntry.strengths.length > 0 && (
            <div className="space-y-2">
              <Label>Strengths</Label>
              {rawEntry.strengths.map((item: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <p><strong>Analysis:</strong> {item.analysis || item.title || item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {rawEntry.weaknesses && rawEntry.weaknesses.length > 0 && (
            <div className="space-y-2">
              <Label>Weaknesses</Label>
              {rawEntry.weaknesses.map((item: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <p><strong>Analysis:</strong> {item.analysis || item.title || item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {rawEntry.opportunities && rawEntry.opportunities.length > 0 && (
            <div className="space-y-2">
              <Label>Opportunities</Label>
              {rawEntry.opportunities.map((item: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <p><strong>Analysis:</strong> {item.analysis || item.title || item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {rawEntry.threats && rawEntry.threats.length > 0 && (
            <div className="space-y-2">
              <Label>Threats</Label>
              {rawEntry.threats.map((item: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <p><strong>Analysis:</strong> {item.analysis || item.title || item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      );
      break;

    case 'Social Media Mention':
      specificContent = (
        <>
          {rawEntry.metrics && rawEntry.metrics.length > 0 && (
            <div className="space-y-2">
              <Label>Metrics</Label>
              {rawEntry.metrics.map((item: any, index: number) => (
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
        </>
      );
      break;

    case 'Outcome Insight':
      specificContent = (
        <>
          {rawEntry.insights && rawEntry.insights.length > 0 && (
            <div className="space-y-2">
              <Label>Insights</Label>
              {rawEntry.insights.map((item: any, index: number) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <p><strong>Category:</strong> {item.category}</p>
                    <p><strong>Analysis:</strong> {item.analysis}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      );
      break;

    case 'Industry Landscape':
      specificContent = (
        <>
          {rawEntry.highlights && rawEntry.highlights.length > 0 && (
            <div className="space-y-2">
              <Label>Highlights</Label>
              <Card>
                <CardContent className="p-4">
                  <ul className="list-disc pl-4 space-y-1">
                    {rawEntry.highlights.map((h: string, index: number) => (
                      <li key={index}>{h}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      );
      break;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry.type} Details</DialogTitle>
          <DialogDescription>Detailed information about this entry.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Title</Label><p>{entry.title}</p></div>
            <div className="space-y-2"><Label>Author</Label><p>{entry.author}</p></div>
            <div className="space-y-2"><Label>Company</Label><p>{companyName}</p></div>
            <div className="space-y-2"><Label>Date</Label><p>{new Date(entry.createdAt).toLocaleDateString()}</p></div>
            <div className="space-y-2"><Label>Status</Label><StatusBadge status={entry.status} /></div>
          </div>
          {entry.content && (
            <div className="space-y-2">
              <Label>Content</Label>
              <Card><CardContent className="p-4"><p>{entry.content}</p></CardContent></Card>
            </div>
          )}
          {specificContent}
          {entry.comments && (
            <div className="space-y-2">
              <Label>Comments</Label>
              <Card><CardContent className="p-4"><p>{entry.comments}</p></CardContent></Card>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AnalystDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const [industryLandscape, setIndustryLandscape] = useState<Submission[]>([]); // NEW
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Route map for non-editorial types
  const routeMap: Record<string, string> = {
    'Daily Mention': '/dashboard/daily-mentions',
    'SWOT Analysis': '/dashboard/swot-mentions',
    'Social Media Mention': '/dashboard/social-media-mentions',
    'Outcome Insight': '/dashboard/outcome-insights',
    'Industry Landscape': '/dashboard/industry-landscape-overview',
  };

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
          { url: `${BASE_URL}/industry-landscape-overview/my-overview`, setter: setIndustryLandscape, name: 'Industry Landscape', type: 'Industry Landscape' }, // NEW
        ];

        await Promise.all(
          endpoints.map(async ({ url, setter, name, type }) => {
            const res = await fetch(url, { headers });
            if (!res.ok) {
              console.warn(`${name} fetch failed: ${res.status} ${res.statusText}`);
              setter([]);
              return;
            }
            const data = await res.json();

            const arrayData = Array.isArray(data.data?.data) ? data.data.data :
                              Array.isArray(data.data) ? data.data :
                              Array.isArray(data) ? data : [];

            const normalizedData = arrayData
              .filter(item => item && typeof item === 'object')
              .map((item: any) => {
                let title = 'Untitled';

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
                  title = item.insights?.[0]?.category || item.insights?.[0]?.analysis || 'Untitled Outcome Insight';
                } else if (type === 'Industry Landscape') {
                  title = item.sector || 'Untitled Industry Landscape';
                }

                let content = '';
                if (type === 'Outcome Insight') {
                  content = item.analyst_note || item.insights?.map(i => i.analysis).join(', ') || 'No content';
                } else if (type === 'Industry Landscape') {
                  content = item.analyst_note || item.highlights?.join(', ') || 'No content';
                } else {
                  content = item.analyst_note ||
                            item.content ||
                            item.description ||
                            item.supervisor_note ||
                            item.overview_content ||
                            'No content';
                }

                return {
                  id: item.id?.toString() || `temp-${Math.random().toString(36).substring(2)}`,
                  rawData: item,
                  type,
                  title,
                  content,
                  createdAt: item.createdAt || item.date || new Date().toISOString(),
                  status: typeof item.status === 'string' && item.status.trim() !== '' ? item.status : 'pending',
                  comments: item.supervisor_note || item.comments || undefined,
                  author: item.creator_data?.username || item.author || item.username || undefined,
                };
              });

            setter(normalizedData);
          })
        );

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
    ...industryLandscape, // INCLUDED
  ];

  // Filter by status for stats
  const getStatusCounts = (data: Submission[]) => ({
    draft: data.filter(e => e.status.toLowerCase() === 'draft').length,
    pending: data.filter(e => e.status.toLowerCase() === 'pending').length,
    approved: data.filter(e => e.status.toLowerCase() === 'approved').length,
    rejected: data.filter(e => e.status.toLowerCase() === 'rejected').length,
  });

  const allCounts = getStatusCounts(allSubmissions);

  // Combined Handle Edit for Editorial
  const handleEditEditorial = async (entry: any) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/editorials/${entry.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch editorial details");

      const result = await response.json();
      if (!result.success || !result.data) throw new Error("Invalid response");

      const data = result.data;

      const mappedEditorial = {
        id: data.id,
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        company_id: data.company?.id,
        media_type: data.media_type || '',
        online_channel: data.online_channel || '',
        source: data.source || '',
        audience_reach: data.audience_reach || 0,
        placement: data.placement || '',
        title: data.title || '',
        print_web_clips: data.print_web_clips || '',
        reporter: data.reporter || '',
        country: data.country || '',
        spokesperson: data.spokesperson || '',
        activity: data.activity || '',
        sentiment: data.sentiment || '',
        sentiment_keyword_indicator_id: data.sentiment_keyword_indicator?.id,
        advert_spend: data.advert_spend || 0,
        circulation: data.circulation || 0,
        page_size: data.page_size || '',
        page_number: data.page_number || '',
        language: data.language || '',
        ceo_thought_leadership: data.ceo_thought_leadership || '',
        analyst_note: data.analyst_note || '',
        supervisor_note: data.supervisor_note || '',
        admin_note: data.admin_note || '',
        filename: data.filename,
        original_name: data.original_name,
        file_path: data.file_path,
        file_size: data.file_size,
        mime_type: data.mime_type,
        file_type: data.file_type,
      };

      navigate('/dashboard/editorial/create', {
        state: {
          editorialData: {
            date: mappedEditorial.date,
            company_id: mappedEditorial.company_id,
            media_type: mappedEditorial.media_type,
            analyst_note: mappedEditorial.analyst_note,
            supervisor_note: mappedEditorial.supervisor_note,
            admin_note: mappedEditorial.admin_note,
            editorials: [mappedEditorial],
          }
        }
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to load editorial for editing");
    }
  };

  // Unified Edit Handler - Works with ALL current page implementations
  const handleEdit = (entry: Submission) => {
    const data = entry.rawData;

    let targetPath = '';
    let stateData: any = {};

    switch (entry.type) {
      case 'Daily Mention':
        targetPath = '/dashboard/daily-mentions';
        stateData = { editId: entry.id }; // Page will use useEffect to call handleEdit(id)
        break;
      case 'SWOT Analysis':
        targetPath = '/dashboard/swot-mentions';
        stateData = { editData: data }; // Page will use useEffect to set selectedSwot and open dialog
        break;
      case 'Social Media Mention':
        targetPath = '/dashboard/social-media-mentions';
        stateData = { editingMention: data }; // Page will use useEffect to setEditingMention
        break;
      case 'Outcome Insight':
        targetPath = '/dashboard/outcome-insights';
        stateData = { editData: data }; // Page will use useEffect to set selectedOutcome and isEditMode
        break;
      case 'Industry Landscape':
        targetPath = '/dashboard/industry-landscape-overview';
        stateData = { editingItem: data }; // Page will use useEffect to setEditingItem and open dialog
        break;
      default:
        toast.error('Unsupported type');
        return;
    }

    navigate(targetPath, { state: stateData });
  };

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
        const entry = row.original;
        const isEditable = status.toLowerCase() === 'draft' || status.toLowerCase() === 'rejected';
        const buttonText = status.toLowerCase() === 'draft' ? 'Edit' : 'Revise';

        return (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSelectedEntry(entry);
                setSelectedType(entry.type);
                setViewDetailsDialog(true);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            {isEditable && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (entry.type === 'Editorial') {
                    handleEditEditorial(entry);
                  } else {
                    handleEdit(entry);
                  }
                }}
              >
                <FileEdit className="h-4 w-4 mr-1" />
                {buttonText}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // Reusable Empty State Component
  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mb-6" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
      <p className="text-sm text-gray-500 max-w-sm">{message}</p>
    </div>
  );

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
              <DropdownMenuItem asChild>
                <Link to="/dashboard/industry-landscape-overview/create" className="w-full cursor-pointer flex items-center text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Globe className="mr-2 h-4 w-4" />
                  New Industry Landscape
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
          <TabsTrigger value="editorials" className="text-sm">Editorials</TabsTrigger>
          <TabsTrigger value="daily-mentions" className="text-sm">Daily Mentions</TabsTrigger>
          <TabsTrigger value="swot" className="text-sm">SWOT Analysis</TabsTrigger>
          <TabsTrigger value="social" className="text-sm">Social Media</TabsTrigger>
          <TabsTrigger value="insights" className="text-sm">Outcome Insights</TabsTrigger>
          <TabsTrigger value="industry" className="text-sm">Industry Landscape</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <DataCard title="All Submissions" description="View and manage all your data submissions" variant="glass">
            {allSubmissions.length > 0 ? (
              <DataTable columns={getColumns('All')} data={allSubmissions} searchPlaceholder="Search all submissions..." />
            ) : (
              <EmptyState message="You haven't created any submissions yet. Click 'Create New' to get started!" />
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="editorials" className="mt-6">
          <DataCard title="Editorials" description="Manage your editorial submissions" variant="glass">
            {editorials.length > 0 ? (
              <DataTable columns={getColumns('Editorial')} data={editorials} searchPlaceholder="Search editorials..." />
            ) : (
              <EmptyState message="No editorial submissions available. Create one using the button above." />
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="daily-mentions" className="mt-6">
          <DataCard title="Daily Mentions" description="Manage your daily mentions" variant="glass">
            {dailyMentions.length > 0 ? (
              <DataTable columns={getColumns('Daily Mention')} data={dailyMentions} searchPlaceholder="Search daily mentions..." />
            ) : (
              <EmptyState message="No daily mentions recorded yet." />
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="swot" className="mt-6">
          <DataCard title="SWOT Analysis" description="Manage your SWOT analysis entries" variant="glass">
            {swotAnalysis.length > 0 ? (
              <DataTable columns={getColumns('SWOT Analysis')} data={swotAnalysis} searchPlaceholder="Search SWOT analysis..." />
            ) : (
              <EmptyState message="No SWOT analysis submissions available." />
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <DataCard title="Social Media Mentions" description="Manage your social media mentions" variant="glass">
            {socialMentions.length > 0 ? (
              <DataTable columns={getColumns('Social Media Mention')} data={socialMentions} searchPlaceholder="Search social mentions..." />
            ) : (
              <EmptyState message="No social media mentions recorded yet." />
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <DataCard title="Outcome Insights" description="Manage your outcome insights" variant="glass">
            {outcomeInsights.length > 0 ? (
              <DataTable columns={getColumns('Outcome Insight')} data={outcomeInsights} searchPlaceholder="Search insights..." />
            ) : (
              <EmptyState message="No outcome insights submitted yet." />
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="industry" className="mt-6">
          <DataCard title="Industry Landscape" description="Manage your industry landscape overviews" variant="glass">
            {industryLandscape.length > 0 ? (
              <DataTable columns={getColumns('Industry Landscape')} data={industryLandscape} searchPlaceholder="Search industry landscape..." />
            ) : (
              <EmptyState message="No industry landscape overviews available yet." />
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