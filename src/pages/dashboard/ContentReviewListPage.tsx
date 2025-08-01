import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, XCircle, Eye, Filter, Newspaper, FileText, Target, LineChart } from 'lucide-react';

// Mock data - in a real app, this would come from an API
const mockEditorials = [
  {
    id: '1',
    title: 'Q1 Market Analysis',
    content: 'This quarter showed significant growth in the tech sector...',
    author: 'John Doe',
    date: '2023-04-15',
    status: 'pending',
    type: 'editorial',
    comments: '',
    history: []
  },
  {
    id: '2',
    title: 'Brand Perception Study',
    content: 'Our recent study indicates a positive shift in brand perception...',
    author: 'Jane Smith',
    date: '2023-04-10',
    status: 'pending',
    type: 'editorial',
    comments: '',
    history: []
  }
];

const mockDailyMentions = [
  {
    id: '1',
    title: 'Tech Company Daily Mentions',
    date: '2023-04-15',
    sections: [
      {
        title: 'Company A',
        mentions: [
          {
            id: 'm1',
            publication: 'Tech Today',
            publicationDate: '15th April',
            headline: 'Company A Launches New Product',
            summary: 'Company A has launched a revolutionary new product...',
            url: 'https://example.com/article1'
          }
        ]
      }
    ],
    author: 'John Doe',
    status: 'pending',
    type: 'daily-mention',
    comments: '',
    history: []
  }
];

const mockSwotMentions = [
  {
    id: '1',
    title: 'Q1 SWOT Analysis',
    company: 'Company A',
    date: '2023-04-15',
    strengths: 'Strong market position, innovative products...',
    weaknesses: 'Limited international presence...',
    opportunities: 'Expanding into new markets...',
    threats: 'Increasing competition, regulatory changes...',
    author: 'Jane Smith',
    status: 'pending',
    type: 'swot-mention',
    comments: '',
    history: []
  }
];

const mockOutcomeInsights = [
  {
    id: '1',
    title: 'Q1 Performance Insights',
    date: '2023-04-15',
    insights: 'Our analysis shows a 15% increase in market share...',
    recommendations: 'We recommend focusing on digital marketing...',
    author: 'John Doe',
    status: 'pending',
    type: 'outcome-insight',
    comments: '',
    history: []
  }
];

// Combine all content types
const allContent = [
  ...mockEditorials,
  ...mockDailyMentions,
  ...mockSwotMentions,
  ...mockOutcomeInsights
];

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
          Pending
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

// Type icon component
function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'editorial':
      return <Newspaper className="h-4 w-4 text-blue-500" />;
    case 'daily-mention':
      return <FileText className="h-4 w-4 text-green-500" />;
    case 'swot-mention':
      return <Target className="h-4 w-4 text-red-500" />;
    case 'outcome-insight':
      return <LineChart className="h-4 w-4 text-purple-500" />;
    default:
      return null;
  }
}

export default function ContentReviewListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [content, setContent] = useState(allContent);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<{ id: string; title: string; type: string; status: string; content: string; author: string; date: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Handle direct approval
  const handleApprove = (item: any) => {
    const now = new Date();
    const timestamp = now.toISOString();

    // Create a history entry
    const historyEntry = {
      status: 'approve',
      timestamp,
      comment: 'Approved directly from review list',
      userId: 'supervisor-1' // In a real app, this would be the actual user ID
    };

    // Update the content with new status and history
    const updatedContent = {
      ...item,
      status: 'approved',
      reviewedBy: 'supervisor-1',
      reviewedAt: timestamp,
      history: [...(item.history || []), historyEntry]
    };

    // Update the content in our state
    setContent(content.map(c => c.id === item.id ? updatedContent : c));

    toast.success('Content approved successfully');
  };

  // Open reject dialog
  const handleReject = (item: any) => {
    setSelectedContent(item);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  // Open view details dialog
  const handleViewDetails = (item: any) => {
    setSelectedContent(item);
    setViewDetailsDialogOpen(true);
  };

  // Submit rejection
  const submitRejection = () => {
    if (!selectedContent) return;

    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    const now = new Date();
    const timestamp = now.toISOString();

    // Create a history entry
    const historyEntry = {
      status: 'reject',
      timestamp,
      comment: rejectReason,
      userId: 'supervisor-1' // In a real app, this would be the actual user ID
    };

    // Update the content with new status and history
    const updatedContent = {
      ...selectedContent,
      status: 'rejected',
      comments: rejectReason,
      reviewedBy: 'supervisor-1',
      reviewedAt: timestamp,
      history: [...(selectedContent.history || []), historyEntry]
    };

    // Update the content in our state
    setContent(content.map(c => c.id === selectedContent.id ? updatedContent : c));

    toast.success('Content rejected successfully');
    setRejectDialogOpen(false);
  };

  // Filter content based on active tab
  const getFilteredContent = () => {
    if (activeTab === 'all') {
      return content;
    }
    return content.filter(item => item.type === activeTab);
  };

  // Define columns for content table
  const contentColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return (
          <div className="flex items-center gap-2">
            <TypeIcon type={type} />
            <span className="capitalize">{type.replace('-', ' ')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'author',
      header: 'Author',
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = row.getValue('date') as string;
        return new Date(date).toLocaleDateString();
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status') as string} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        const id = row.original.id;
        const status = row.getValue('status') as string;

        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails(row.original)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/dashboard/content-review/${type}/${id}`)}
            >
              Full Page
            </Button>

            {status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
                  onClick={() => handleApprove(row.original)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
                  onClick={() => handleReject(row.original)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  // Stats for each content type
  const stats = {
    all: content.filter(item => item.status === 'pending').length,
    editorial: content.filter(item => item.type === 'editorial' && item.status === 'pending').length,
    'daily-mention': content.filter(item => item.type === 'daily-mention' && item.status === 'pending').length,
    'swot-mention': content.filter(item => item.type === 'swot-mention' && item.status === 'pending').length,
    'outcome-insight': content.filter(item => item.type === 'outcome-insight' && item.status === 'pending').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content Review</h1>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-blue-500" />
              Editorials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.editorial}</div>
            <p className="text-sm text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Daily Mentions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats['daily-mention']}</div>
            <p className="text-sm text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-red-500" />
              SWOT Mentions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats['swot-mention']}</div>
            <p className="text-sm text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <LineChart className="h-5 w-5 text-purple-500" />
              Outcome & Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats['outcome-insight']}</div>
            <p className="text-sm text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Content ({stats.all})</TabsTrigger>
          <TabsTrigger value="editorial">Editorials ({stats.editorial})</TabsTrigger>
          <TabsTrigger value="daily-mention">Daily Mentions ({stats['daily-mention']})</TabsTrigger>
          <TabsTrigger value="swot-mention">SWOT Mentions ({stats['swot-mention']})</TabsTrigger>
          <TabsTrigger value="outcome-insight">Outcome & Insights ({stats['outcome-insight']})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Awaiting Review</CardTitle>
              <CardDescription>
                Review and approve content submitted by analysts and admins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={contentColumns}
                data={getFilteredContent()}
                searchPlaceholder="Search content..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Content</DialogTitle>
            <DialogDescription>
              Please provide detailed feedback on why this content is being rejected and what needs to be corrected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedContent && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Title</p>
                  <p className="text-sm">{selectedContent.title}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm capitalize">{selectedContent.type.replace('-', ' ')}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Author</p>
                  <p className="text-sm">{selectedContent.author}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm">{new Date(selectedContent.date).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Reason for Rejection</p>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this content is being rejected and what corrections are needed..."
                className="min-h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={submitRejection}>
              Reject Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialogOpen} onOpenChange={setViewDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedContent?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedContent?.type === 'editorial' ? 'Editorial' :
               selectedContent?.type === 'daily-mention' ? 'Daily Mention' :
               selectedContent?.type === 'swot-mention' ? 'SWOT Mention' :
               selectedContent?.type === 'outcome-insight' ? 'Outcome & Insight' :
               'Content'} by {selectedContent?.author} on {selectedContent ? new Date(selectedContent.date).toLocaleDateString() : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {selectedContent && (
              <>
                {/* Editorial Content */}
                {selectedContent.type === 'editorial' && (
                  <div className="space-y-4">
                    <div className="prose max-w-none">
                      <p>{selectedContent.content}</p>
                    </div>
                  </div>
                )}

                {/* Daily Mention Content */}
                {selectedContent.type === 'daily-mention' && (
                  <div className="space-y-6">
                    {selectedContent.sections.map((section: any, index: number) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="bg-muted/50 pb-3">
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          {section.mentions.map((mention: any) => (
                            <div key={mention.id} className="mb-4 pb-4 border-b last:border-0">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-medium">{mention.headline}</h3>
                                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span>{mention.publication}</span>
                                    <span>•</span>
                                    <span>{mention.publicationDate}</span>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={mention.url} target="_blank" rel="noopener noreferrer">
                                    View Article
                                  </a>
                                </Button>
                              </div>
                              <p className="text-sm">{mention.summary}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* SWOT Mention Content */}
                {selectedContent.type === 'swot-mention' && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Company: {selectedContent.company}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="bg-green-50 pb-3">
                          <CardTitle className="text-lg text-green-700">Strengths</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <p>{selectedContent.strengths}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="bg-red-50 pb-3">
                          <CardTitle className="text-lg text-red-700">Weaknesses</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <p>{selectedContent.weaknesses}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="bg-blue-50 pb-3">
                          <CardTitle className="text-lg text-blue-700">Opportunities</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <p>{selectedContent.opportunities}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="bg-amber-50 pb-3">
                          <CardTitle className="text-lg text-amber-700">Threats</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <p>{selectedContent.threats}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Outcome & Insight Content */}
                {selectedContent.type === 'outcome-insight' && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Key Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{selectedContent.insights}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{selectedContent.recommendations}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={selectedContent?.status === 'approved' ? 'success' :
                          selectedContent?.status === 'rejected' ? 'destructive' :
                          'outline'}>
                {selectedContent?.status.charAt(0).toUpperCase() + selectedContent?.status.slice(1)}
              </Badge>
              {selectedContent?.reviewedAt && (
                <span className="text-xs text-muted-foreground">
                  Last reviewed: {new Date(selectedContent.reviewedAt).toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setViewDetailsDialogOpen(false)}>
                Close
              </Button>

              {selectedContent?.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
                    onClick={() => {
                      setViewDetailsDialogOpen(false);
                      handleApprove(selectedContent);
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
                      handleReject(selectedContent);
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
