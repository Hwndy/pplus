// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Badge } from '@/components/ui/badge';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Textarea } from '@/components/ui/textarea';
// import { toast } from 'sonner';
// import { DataTable } from '@/components/ui/DataTable';
// import { ColumnDef } from '@tanstack/react-table';
// import { CheckCircle, XCircle, Eye, Filter, Newspaper, FileText, Target, LineChart } from 'lucide-react';
// import { apiService } from '@/services/apiService';
// import type { Editorial, DailyMention, SwotAnalysis, OutcomeInsight } from '@/services/apiService';

// // Define unified content entry type
// interface ContentEntry {
//   id: string;
//   title: string;
//   type: 'editorial' | 'daily-mention' | 'swot-analysis' | 'outcome-insight';
//   status: 'pending' | 'approved' | 'rejected' | 'draft';
//   date: string;
//   authorName?: string;
//   companyName?: string;
//   content?: string;
//   comments?: string;
//   reviewedBy?: string;
//   reviewedAt?: string;
//   createdAt: string;
//   updatedAt: string;
//   originalData: Editorial | DailyMention | SwotAnalysis | OutcomeInsight;
//   history?: {
//     status: string;
//     timestamp: string;
//     comment: string;
//     userId: string;
//   }[];
// }

// export default function ContentReviewListPage() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('all');
//   const [content, setContent] = useState<ContentEntry[]>([]);
//   const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
//   const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = useState(false);
//   const [selectedContent, setSelectedContent] = useState<ContentEntry | null>(null);
//   const [rejectReason, setRejectReason] = useState('');

//   // Companies and users data for lookups
//   const [companies, setCompanies] = useState<any[]>([]);
//   const [users, setUsers] = useState<any[]>([]);

//   // Fetch all content data on component mount
//   useEffect(() => {
//     const fetchContentData = async () => {
//       try {
//         setLoading(true);

//         // Fetch all data types in parallel
//         const [editorialsRes, dailyMentionsRes, swotAnalysesRes, outcomeInsightsRes, companiesRes, usersRes] = await Promise.all([
//           apiService.getEditorials(),
//           apiService.getDailyMentions(),
//           apiService.getSwotAnalyses(),
//           apiService.getOutcomeInsights(),
//           apiService.getCompanies(),
//           apiService.getUsers()
//         ]);

//         // Store lookup data
//         const companiesData = companiesRes.data || [];
//         const usersData = usersRes.data || [];
//         setCompanies(companiesData);
//         setUsers(usersData);

//         // Transform function with available lookup data
//         const transformToContentEntry = (data: any, type: ContentEntry['type']): ContentEntry => {
//           const company = companiesData.find((c: any) => c.id === data.companyId);
//           const author = usersData.find((u: any) => u.id === data.authorId);

//           return {
//             id: data.id,
//             title: data.title || data.headline || `${type} - ${data.id}`,
//             type,
//             status: data.status?.toLowerCase() || 'pending',
//             date: data.date || data.createdAt,
//             authorName: author?.name || 'Unknown Author',
//             companyName: company?.name || 'Unknown Company',
//             content: data.content || data.insights || data.strengths?.join(', ') || '',
//             comments: data.comments || '',
//             reviewedBy: data.reviewedBy,
//             reviewedAt: data.reviewedAt,
//             createdAt: data.createdAt,
//             updatedAt: data.updatedAt,
//             originalData: data,
//             history: data.history || []
//           };
//         };

//         // Transform data into unified content entries
//         const allEntries: ContentEntry[] = [];

//         // Process editorials - handle both array and object responses
//         const editorialsData = Array.isArray(editorialsRes.data) ? editorialsRes.data : (editorialsRes.data?.editorials || []);
//         if (editorialsData.length > 0) {
//           editorialsData.forEach((editorial: Editorial) => {
//             allEntries.push(transformToContentEntry(editorial, 'editorial'));
//           });
//         }

//         // Process daily mentions - handle both array and object responses
//         const dailyMentionsData = Array.isArray(dailyMentionsRes.data) ? dailyMentionsRes.data : (dailyMentionsRes.data?.mentions || []);
//         if (dailyMentionsData.length > 0) {
//           dailyMentionsData.forEach((mention: DailyMention) => {
//             allEntries.push(transformToContentEntry(mention, 'daily-mention'));
//           });
//         }

//         // Process SWOT analyses - handle both array and object responses
//         const swotAnalysesData = Array.isArray(swotAnalysesRes.data) ? swotAnalysesRes.data : (swotAnalysesRes.data?.analyses || []);
//         if (swotAnalysesData.length > 0) {
//           swotAnalysesData.forEach((swot: SwotAnalysis) => {
//             allEntries.push(transformToContentEntry(swot, 'swot-analysis'));
//           });
//         }

//         // Process outcome insights - handle both array and object responses
//         const outcomeInsightsData = Array.isArray(outcomeInsightsRes.data) ? outcomeInsightsRes.data : (outcomeInsightsRes.data?.insights || []);
//         if (outcomeInsightsData.length > 0) {
//           outcomeInsightsData.forEach((insight: OutcomeInsight) => {
//             allEntries.push(transformToContentEntry(insight, 'outcome-insight'));
//           });
//         }

//         setContent(allEntries);

//       } catch (error) {
//         console.error('Error fetching content data:', error);
//         toast.error('Failed to load content data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchContentData();
//   }, []);



// // Status badge component
// function StatusBadge({ status }: { status: string }) {
//   switch (status) {
//     case 'approved':
//       return (
//         <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
//           <CheckCircle className="mr-1 h-3 w-3" />
//           Approved
//         </Badge>
//       );
//     case 'rejected':
//       return (
//         <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center">
//           <XCircle className="mr-1 h-3 w-3" />
//           Rejected
//         </Badge>
//       );
//     case 'pending':
//       return (
//         <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center">
//           Pending
//         </Badge>
//       );
//     default:
//       return (
//         <Badge variant="outline" className="flex items-center">
//           {status}
//         </Badge>
//       );
//   }
// }

// // Type icon component
// function TypeIcon({ type }: { type: string }) {
//   switch (type) {
//     case 'editorial':
//       return <Newspaper className="h-4 w-4 text-blue-500" />;
//     case 'daily-mention':
//       return <FileText className="h-4 w-4 text-green-500" />;
//     case 'swot-mention':
//       return <Target className="h-4 w-4 text-red-500" />;
//     case 'outcome-insight':
//       return <LineChart className="h-4 w-4 text-purple-500" />;
//     default:
//       return null;
//   }
// }

//   // Handle direct approval
//   const handleApprove = async (item: ContentEntry) => {
//     try {
//       const now = new Date();
//       const timestamp = now.toISOString();

//       // Create a history entry
//       const historyEntry = {
//         status: 'approve',
//         timestamp,
//         comment: 'Approved directly from review list',
//         userId: 'supervisor-1' // In a real app, this would be the actual user ID
//       };

//       // Prepare update data
//       const updateData = {
//         status: 'approved',
//         reviewedBy: 'supervisor-1',
//         reviewedAt: timestamp,
//         history: [...(item.history || []), historyEntry]
//       };

//       // Call appropriate API endpoint based on content type
//       switch (item.type) {
//         case 'editorial':
//           await apiService.updateEditorial(item.id, updateData);
//           break;
//         case 'daily-mention':
//           await apiService.updateDailyMention(item.id, updateData);
//           break;
//         case 'swot-analysis':
//           await apiService.updateSwotAnalysis(item.id, updateData);
//           break;
//         case 'outcome-insight':
//           await apiService.updateOutcomeInsight(item.id, updateData);
//           break;
//       }

//       // Update the content in our state
//       const updatedContent = { ...item, ...updateData };
//       setContent(content.map(c => c.id === item.id ? updatedContent : c));

//       toast.success(`${item.type.replace('-', ' ')} approved successfully`);
//     } catch (error) {
//       console.error('Error approving content:', error);
//       toast.error('Failed to approve content');
//     }
//   };

//   // Open reject dialog
//   const handleReject = (item: ContentEntry) => {
//     setSelectedContent(item);
//     setRejectReason('');
//     setRejectDialogOpen(true);
//   };

//   // Open view details dialog
//   const handleViewDetails = (item: ContentEntry) => {
//     setSelectedContent(item);
//     setViewDetailsDialogOpen(true);
//   };

//   // Navigate to detailed review page
//   const navigateToDetailedReview = (item: ContentEntry) => {
//     navigate(`/dashboard/content-review/${item.type}/${item.id}`);
//   };

//   // Submit rejection
//   const submitRejection = async () => {
//     if (!selectedContent) return;

//     if (!rejectReason.trim()) {
//       toast.error('Please provide a reason for rejection');
//       return;
//     }

//     try {
//       const now = new Date();
//       const timestamp = now.toISOString();

//       // Create a history entry
//       const historyEntry = {
//         status: 'reject',
//         timestamp,
//         comment: rejectReason,
//         userId: 'supervisor-1' // In a real app, this would be the actual user ID
//       };

//       // Prepare update data
//       const updateData = {
//         status: 'rejected',
//         comments: rejectReason,
//         reviewedBy: 'supervisor-1',
//         reviewedAt: timestamp,
//         history: [...(selectedContent.history || []), historyEntry]
//       };

//       // Call appropriate API endpoint based on content type
//       switch (selectedContent.type) {
//         case 'editorial':
//           await apiService.updateEditorial(selectedContent.id, updateData);
//           break;
//         case 'daily-mention':
//           await apiService.updateDailyMention(selectedContent.id, updateData);
//           break;
//         case 'swot-analysis':
//           await apiService.updateSwotAnalysis(selectedContent.id, updateData);
//           break;
//         case 'outcome-insight':
//           await apiService.updateOutcomeInsight(selectedContent.id, updateData);
//           break;
//       }

//       // Update the content in our state
//       const updatedContent = { ...selectedContent, ...updateData };
//       setContent(content.map(c => c.id === selectedContent.id ? updatedContent : c));

//       toast.success(`${selectedContent.type.replace('-', ' ')} rejected successfully`);
//       setRejectDialogOpen(false);
//     } catch (error) {
//       console.error('Error rejecting content:', error);
//       toast.error('Failed to reject content');
//     }
//   };

//   // Filter content based on active tab
//   const getFilteredContent = () => {
//     if (activeTab === 'all') {
//       return content;
//     }
//     return content.filter(item => item.type === activeTab);
//   };

//   // Define columns for content table
//   const contentColumns: ColumnDef<ContentEntry>[] = [
//     {
//       accessorKey: 'type',
//       header: 'Type',
//       cell: ({ row }) => {
//         const type = row.getValue('type') as string;
//         return (
//           <div className="flex items-center gap-2">
//             <TypeIcon type={type} />
//             <span className="capitalize">{type.replace('-', ' ')}</span>
//           </div>
//         );
//       },
//     },
//     {
//       accessorKey: 'title',
//       header: 'Title',
//       cell: ({ row }) => (
//         <div className="max-w-xs truncate" title={row.getValue('title')}>
//           {row.getValue('title')}
//         </div>
//       ),
//     },
//     {
//       accessorKey: 'authorName',
//       header: 'Author',
//       cell: ({ row }) => row.getValue('authorName') || 'Unknown',
//     },
//     {
//       accessorKey: 'companyName',
//       header: 'Company',
//       cell: ({ row }) => row.getValue('companyName') || 'Unknown',
//     },
//     {
//       accessorKey: 'date',
//       header: 'Date',
//       cell: ({ row }) => {
//         const date = row.getValue('date') as string;
//         return new Date(date).toLocaleDateString();
//       },
//     },
//     {
//       accessorKey: 'status',
//       header: 'Status',
//       cell: ({ row }) => <StatusBadge status={row.getValue('status') as string} />,
//     },
//     {
//       id: 'actions',
//       header: 'Actions',
//       cell: ({ row }) => {
//         const type = row.getValue('type') as string;
//         const id = row.original.id;
//         const status = row.getValue('status') as string;

//         return (
//           <div className="flex space-x-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => handleViewDetails(row.original)}
//             >
//               <Eye className="mr-2 h-4 w-4" />
//               View Details
//             </Button>

//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => navigateToDetailedReview(row.original)}
//             >
//               Full Review
//             </Button>

//             {status === 'pending' && (
//               <>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
//                   onClick={() => handleApprove(row.original)}
//                 >
//                   <CheckCircle className="mr-2 h-4 w-4" />
//                   Approve
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
//                   onClick={() => handleReject(row.original)}
//                 >
//                   <XCircle className="mr-2 h-4 w-4" />
//                   Reject
//                 </Button>
//               </>
//             )}
//           </div>
//         );
//       },
//     },
//   ];

//   // Stats for each content type
//   const stats = {
//     all: content.filter(item => item.status === 'pending').length,
//     editorial: content.filter(item => item.type === 'editorial' && item.status === 'pending').length,
//     'daily-mention': content.filter(item => item.type === 'daily-mention' && item.status === 'pending').length,
//     'swot-analysis': content.filter(item => item.type === 'swot-analysis' && item.status === 'pending').length,
//     'outcome-insight': content.filter(item => item.type === 'outcome-insight' && item.status === 'pending').length,
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
//           <p>Loading content for review...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">Content Review</h1>
//         <Button variant="outline">
//           <Filter className="mr-2 h-4 w-4" />
//           Filter
//         </Button>
//       </div>

//       <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
//         <Card className="bg-white shadow-sm hover:shadow transition-shadow">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-lg flex items-center gap-2">
//               <Newspaper className="h-5 w-5 text-blue-500" />
//               Editorials
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats.editorial}</div>
//             <p className="text-sm text-muted-foreground">Pending review</p>
//           </CardContent>
//         </Card>

//         <Card className="bg-white shadow-sm hover:shadow transition-shadow">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-lg flex items-center gap-2">
//               <FileText className="h-5 w-5 text-green-500" />
//               Daily Mentions
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats['daily-mention']}</div>
//             <p className="text-sm text-muted-foreground">Pending review</p>
//           </CardContent>
//         </Card>

//         <Card className="bg-white shadow-sm hover:shadow transition-shadow">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-lg flex items-center gap-2">
//               <Target className="h-5 w-5 text-red-500" />
//               SWOT Mentions
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats['swot-analysis']}</div>
//             <p className="text-sm text-muted-foreground">Pending review</p>
//           </CardContent>
//         </Card>

//         <Card className="bg-white shadow-sm hover:shadow transition-shadow">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-lg flex items-center gap-2">
//               <LineChart className="h-5 w-5 text-purple-500" />
//               Outcome & Insights
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{stats['outcome-insight']}</div>
//             <p className="text-sm text-muted-foreground">Pending review</p>
//           </CardContent>
//         </Card>
//       </div>

//       <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
//         <TabsList className="grid w-full grid-cols-5">
//           <TabsTrigger value="all">All Content ({stats.all})</TabsTrigger>
//           <TabsTrigger value="editorial">Editorials ({stats.editorial})</TabsTrigger>
//           <TabsTrigger value="daily-mention">Daily Mentions ({stats['daily-mention']})</TabsTrigger>
//           <TabsTrigger value="swot-analysis">SWOT Analysis ({stats['swot-analysis']})</TabsTrigger>
//           <TabsTrigger value="outcome-insight">Outcome & Insights ({stats['outcome-insight']})</TabsTrigger>
//         </TabsList>

//         <TabsContent value={activeTab} className="mt-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Content Awaiting Review</CardTitle>
//               <CardDescription>
//                 Review and approve content submitted by analysts and admins
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <DataTable
//                 columns={contentColumns}
//                 data={getFilteredContent()}
//                 searchPlaceholder="Search content..."
//               />
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>

//       {/* Reject Dialog */}
//       <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Reject Content</DialogTitle>
//             <DialogDescription>
//               Please provide detailed feedback on why this content is being rejected and what needs to be corrected.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             {selectedContent && (
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium">Title</p>
//                   <p className="text-sm">{selectedContent.title}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium">Type</p>
//                   <p className="text-sm capitalize">{selectedContent.type.replace('-', ' ')}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium">Author</p>
//                   <p className="text-sm">{selectedContent.authorName}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium">Date</p>
//                   <p className="text-sm">{new Date(selectedContent.date).toLocaleDateString()}</p>
//                 </div>
//               </div>
//             )}

//             <div className="space-y-2">
//               <p className="text-sm font-medium">Reason for Rejection</p>
//               <Textarea
//                 value={rejectReason}
//                 onChange={(e) => setRejectReason(e.target.value)}
//                 placeholder="Explain why this content is being rejected and what corrections are needed..."
//                 className="min-h-32"
//               />
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
//               Cancel
//             </Button>
//             <Button variant="destructive" onClick={submitRejection}>
//               Reject Content
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* View Details Dialog */}
//       <Dialog open={viewDetailsDialogOpen} onOpenChange={setViewDetailsDialogOpen}>
//         <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
//           <DialogHeader>
//             <DialogTitle>
//               {selectedContent?.title}
//             </DialogTitle>
//             <DialogDescription>
//               {selectedContent?.type === 'editorial' ? 'Editorial' :
//                selectedContent?.type === 'daily-mention' ? 'Daily Mention' :
//                selectedContent?.type === 'swot-mention' ? 'SWOT Mention' :
//                selectedContent?.type === 'outcome-insight' ? 'Outcome & Insight' :
//                'Content'} by {selectedContent?.author} on {selectedContent ? new Date(selectedContent.date).toLocaleDateString() : ''}
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-6 py-4">
//             {selectedContent && (
//               <>
//                 {/* Editorial Content */}
//                 {selectedContent.type === 'editorial' && (
//                   <div className="space-y-4">
//                     <div className="prose max-w-none">
//                       <p>{selectedContent.content}</p>
//                     </div>
//                   </div>
//                 )}

//                 {/* Daily Mention Content */}
//                 {selectedContent.type === 'daily-mention' && (
//                   <div className="space-y-6">
//                     {selectedContent.sections.map((section: any, index: number) => (
//                       <Card key={index} className="overflow-hidden">
//                         <CardHeader className="bg-muted/50 pb-3">
//                           <CardTitle className="text-lg">{section.title}</CardTitle>
//                         </CardHeader>
//                         <CardContent className="pt-4">
//                           {section.mentions.map((mention: any) => (
//                             <div key={mention.id} className="mb-4 pb-4 border-b last:border-0">
//                               <div className="flex justify-between items-start mb-2">
//                                 <div>
//                                   <h3 className="font-medium">{mention.headline}</h3>
//                                   <div className="text-sm text-muted-foreground flex items-center gap-2">
//                                     <span>{mention.publication}</span>
//                                     <span>•</span>
//                                     <span>{mention.publicationDate}</span>
//                                   </div>
//                                 </div>
//                                 <Button variant="ghost" size="sm" asChild>
//                                   <a href={mention.url} target="_blank" rel="noopener noreferrer">
//                                     View Article
//                                   </a>
//                                 </Button>
//                               </div>
//                               <p className="text-sm">{mention.summary}</p>
//                             </div>
//                           ))}
//                         </CardContent>
//                       </Card>
//                     ))}
//                   </div>
//                 )}

//                 {/* SWOT Mention Content */}
//                 {selectedContent.type === 'swot-mention' && (
//                   <div className="space-y-4">
//                     <p className="text-sm text-muted-foreground">
//                       Company: {selectedContent.company}
//                     </p>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <Card>
//                         <CardHeader className="bg-green-50 pb-3">
//                           <CardTitle className="text-lg text-green-700">Strengths</CardTitle>
//                         </CardHeader>
//                         <CardContent className="pt-4">
//                           <p>{selectedContent.strengths}</p>
//                         </CardContent>
//                       </Card>

//                       <Card>
//                         <CardHeader className="bg-red-50 pb-3">
//                           <CardTitle className="text-lg text-red-700">Weaknesses</CardTitle>
//                         </CardHeader>
//                         <CardContent className="pt-4">
//                           <p>{selectedContent.weaknesses}</p>
//                         </CardContent>
//                       </Card>

//                       <Card>
//                         <CardHeader className="bg-blue-50 pb-3">
//                           <CardTitle className="text-lg text-blue-700">Opportunities</CardTitle>
//                         </CardHeader>
//                         <CardContent className="pt-4">
//                           <p>{selectedContent.opportunities}</p>
//                         </CardContent>
//                       </Card>

//                       <Card>
//                         <CardHeader className="bg-amber-50 pb-3">
//                           <CardTitle className="text-lg text-amber-700">Threats</CardTitle>
//                         </CardHeader>
//                         <CardContent className="pt-4">
//                           <p>{selectedContent.threats}</p>
//                         </CardContent>
//                       </Card>
//                     </div>
//                   </div>
//                 )}

//                 {/* Outcome & Insight Content */}
//                 {selectedContent.type === 'outcome-insight' && (
//                   <div className="space-y-4">
//                     <Card>
//                       <CardHeader>
//                         <CardTitle>Key Insights</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         <p>{selectedContent.insights}</p>
//                       </CardContent>
//                     </Card>

//                     <Card>
//                       <CardHeader>
//                         <CardTitle>Recommendations</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         <p>{selectedContent.recommendations}</p>
//                       </CardContent>
//                     </Card>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>

//           <DialogFooter className="flex justify-between">
//             <div className="flex items-center gap-2">
//               <Badge variant={selectedContent?.status === 'approved' ? 'success' :
//                           selectedContent?.status === 'rejected' ? 'destructive' :
//                           'outline'}>
//                 {selectedContent?.status.charAt(0).toUpperCase() + selectedContent?.status.slice(1)}
//               </Badge>
//               {selectedContent?.reviewedAt && (
//                 <span className="text-xs text-muted-foreground">
//                   Last reviewed: {new Date(selectedContent.reviewedAt).toLocaleString()}
//                 </span>
//               )}
//             </div>

//             <div className="flex gap-2">
//               <Button variant="outline" onClick={() => setViewDetailsDialogOpen(false)}>
//                 Close
//               </Button>

//               {selectedContent?.status === 'pending' && (
//                 <>
//                   <Button
//                     variant="outline"
//                     className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700"
//                     onClick={() => {
//                       setViewDetailsDialogOpen(false);
//                       handleApprove(selectedContent);
//                     }}
//                   >
//                     <CheckCircle className="mr-2 h-4 w-4" />
//                     Approve
//                   </Button>
//                   <Button
//                     variant="outline"
//                     className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700"
//                     onClick={() => {
//                       setViewDetailsDialogOpen(false);
//                       handleReject(selectedContent);
//                     }}
//                   >
//                     <XCircle className="mr-2 h-4 w-4" />
//                     Reject
//                   </Button>
//                 </>
//               )}
//             </div>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
