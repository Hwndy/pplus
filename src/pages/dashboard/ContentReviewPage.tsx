import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CheckCircle, XCircle, MessageSquare, ArrowLeft, Eye, History, AlertTriangle } from 'lucide-react';

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

export default function ContentReviewPage() {
  const { contentType, id } = useParams();
  const navigate = useNavigate();
  
  // State for the selected content
  const [content, setContent] = useState<{ id: string; title: string; type: string; status: string; content: string; author: string; date: string } | null>(null);
  
  // State for review dialog
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  
  // State for history dialog
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  
  // State for view mode
  const [activeTab, setActiveTab] = useState('content');
  
  // Load content based on type and ID
  useEffect(() => {
    let foundContent;
    
    if (contentType === 'editorial') {
      foundContent = mockEditorials.find(item => item.id === id);
    } else if (contentType === 'daily-mention') {
      foundContent = mockDailyMentions.find(item => item.id === id);
    } else if (contentType === 'swot-mention') {
      foundContent = mockSwotMentions.find(item => item.id === id);
    } else if (contentType === 'outcome-insight') {
      foundContent = mockOutcomeInsights.find(item => item.id === id);
    } else {
      // If no specific type, try to find in all content
      foundContent = allContent.find(item => item.id === id);
    }
    
    if (foundContent) {
      setContent(foundContent);
    } else {
      toast.error('Content not found');
      navigate('/dashboard/review');
    }
  }, [contentType, id, navigate]);
  
  // Handle review request
  const handleReviewRequest = (action: 'approve' | 'reject' | null) => {
    setReviewAction(action);
    setReviewComment('');
    setReviewDialogOpen(true);
  };
  
  // Submit review
  const submitReview = () => {
    if (!content) return;
    
    if (reviewAction === 'reject' && !reviewComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    const now = new Date();
    const timestamp = now.toISOString();
    
    // Create a history entry
    const historyEntry = {
      status: reviewAction || 'comment',
      timestamp,
      comment: reviewComment,
      userId: 'supervisor-1' // In a real app, this would be the actual user ID
    };
    
    // Update the content with new status and history
    const updatedContent = {
      ...content,
      status: reviewAction ? (reviewAction === 'approve' ? 'approved' : 'rejected') : content.status,
      comments: reviewComment || content.comments,
      reviewedBy: 'supervisor-1',
      reviewedAt: timestamp,
      history: [...(content.history || []), historyEntry]
    };
    
    // In a real app, we'd make an API call here
    setContent(updatedContent);
    
    toast.success(
      reviewAction === 'approve' ? 'Content approved successfully' :
      reviewAction === 'reject' ? 'Content rejected successfully' :
      'Comment added successfully'
    );
    
    setReviewDialogOpen(false);
  };
  
  // View content history
  const viewHistory = () => {
    setHistoryDialogOpen(true);
  };
  
  // Go back to review list
  const goBack = () => {
    navigate('/dashboard/review');
  };
  
  if (!content) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading content...</p>
      </div>
    );
  }
  
  // Render content based on type
  const renderContent = () => {
    switch (content.type) {
      case 'editorial':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{content.title}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>By {content.author}</span>
              <span>•</span>
              <span>{new Date(content.date).toLocaleDateString()}</span>
            </div>
            <Separator />
            <div className="prose max-w-none">
              <p>{content.content}</p>
            </div>
          </div>
        );
        
      case 'daily-mention':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">{content.title}</h2>
              <p className="text-sm text-muted-foreground">
                Date: {new Date(content.date).toLocaleDateString()}
              </p>
            </div>
            
            {content.sections.map((section: any, index: number) => (
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
        );
        
      case 'swot-mention':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{content.title}</h2>
            <p className="text-sm text-muted-foreground">
              Company: {content.company} • Date: {new Date(content.date).toLocaleDateString()}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="bg-green-50 pb-3">
                  <CardTitle className="text-lg text-green-700">Strengths</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p>{content.strengths}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="bg-red-50 pb-3">
                  <CardTitle className="text-lg text-red-700">Weaknesses</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p>{content.weaknesses}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="bg-blue-50 pb-3">
                  <CardTitle className="text-lg text-blue-700">Opportunities</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p>{content.opportunities}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="bg-amber-50 pb-3">
                  <CardTitle className="text-lg text-amber-700">Threats</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p>{content.threats}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      case 'outcome-insight':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{content.title}</h2>
            <p className="text-sm text-muted-foreground">
              Date: {new Date(content.date).toLocaleDateString()} • By {content.author}
            </p>
            
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{content.insights}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{content.recommendations}</p>
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return <p>Unknown content type</p>;
    }
  };
  
  // Render metadata
  const renderMetadata = () => {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Content Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Title</dt>
                <dd className="mt-1">{content.title}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                <dd className="mt-1 capitalize">{content.type.replace('-', ' ')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Author</dt>
                <dd className="mt-1">{content.author}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Date</dt>
                <dd className="mt-1">{new Date(content.date).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <Badge variant={
                    content.status === 'approved' ? 'success' :
                    content.status === 'rejected' ? 'destructive' :
                    'outline'
                  }>
                    {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                  </Badge>
                </dd>
              </div>
              {content.reviewedAt && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Reviewed</dt>
                  <dd className="mt-1">{new Date(content.reviewedAt).toLocaleString()}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
        
        {content.comments && (
          <Card>
            <CardHeader>
              <CardTitle>Latest Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{content.comments}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Review Content</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={viewHistory}>
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
          
          {content.status === 'pending' && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
                onClick={() => handleReviewRequest('approve')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
                onClick={() => handleReviewRequest('reject')}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
          
          {content.status === 'approved' && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-amber-600 border-amber-600 hover:bg-amber-100 hover:text-amber-700"
              onClick={() => handleReviewRequest('reject')}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Revoke
            </Button>
          )}
          
          {content.status === 'rejected' && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
              onClick={() => handleReviewRequest('approve')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleReviewRequest(null)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Comment
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="content">
            <Eye className="mr-2 h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="metadata">
            <MessageSquare className="mr-2 h-4 w-4" />
            Metadata
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="mt-6">
          {renderContent()}
        </TabsContent>
        
        <TabsContent value="metadata" className="mt-6">
          {renderMetadata()}
        </TabsContent>
      </Tabs>
      
      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Content' : 
               reviewAction === 'reject' ? 'Reject Content' : 'Add Comment'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'reject' ? 
                'Please provide a reason for rejecting this content.' : 
                reviewAction === 'approve' ? 
                'Add any comments before approving this content.' :
                'Add a comment or feedback for the author.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Title</Label>
              <div className="text-sm mt-1">{content.title}</div>
            </div>
            
            <div>
              <Label>Type</Label>
              <div className="text-sm mt-1 capitalize">{content.type.replace('-', ' ')}</div>
            </div>
            
            <div>
              <Label>Author</Label>
              <div className="text-sm mt-1">{content.author}</div>
            </div>
            
            {content.comments && (
              <div className="p-3 bg-muted rounded-md">
                <Label className="text-xs">Previous Comments</Label>
                <p className="text-sm mt-1">{content.comments}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="comment">
                {reviewAction === 'reject' ? 'Reason for rejection' : 'Comment'}
              </Label>
              <Textarea
                id="comment"
                placeholder={reviewAction === 'reject' ? 'Explain why this content is being rejected...' : 'Add your feedback here...'}
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
            <DialogTitle>Content History</DialogTitle>
            <DialogDescription>
              Review the complete history of this content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Title</Label>
              <div className="text-sm mt-1">{content.title}</div>
            </div>
            
            <div>
              <Label>Current Status</Label>
              <div className="text-sm mt-1">
                <Badge variant={
                  content.status === 'approved' ? 'success' :
                  content.status === 'rejected' ? 'destructive' :
                  'outline'
                }>
                  {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>History Timeline</Label>
              <div className="space-y-3 mt-2">
                {content.history && content.history.length > 0 ? (
                  content.history.map((item: any, index: number) => (
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
                        By: Supervisor
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No history available for this content</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
