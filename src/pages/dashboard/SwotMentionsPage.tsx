import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, ArrowUpRight, AlertTriangle, Plus, Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SwotMentionForm } from '../../components/admin/SwotMentionForm';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from '@/components/auth/AuthContext';

interface SwotAnalysis {
  id: string;
  company_id: number;
  company: { company_name: string };
  date: string;
  strengths: { analysis: string }[];
  weaknesses: { analysis: string }[];
  opportunities: { analysis: string }[];
  threats: { analysis: string }[];
  status: string;
  createdAt: string;
  updatedAt: string | null;
  analyst_note: string | null;
  supervisor_note: string | null;
  analyst_id: number | null;
  supervisor_id: number | null;
}

export function SwotMentionsPage() {
  const { user, token } = useAuth(); // Use AuthContext to get user and token
  const [currentDate] = useState(new Date());
  const [swotData, setSwotData] = useState<SwotAnalysis[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSwot, setSelectedSwot] = useState<SwotAnalysis | null>(null);

  // Replace with your actual token retrieval logic
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || ''}`,
  });

  // Fetch SWOT analyses
  const fetchSwotData = async () => {
    try {
      if (!token || !user) {
        throw new Error('Authentication required');
      }

      // Determine endpoint based on user role
      const endpoint = user.role.name === 'Supervisor'
        ? 'https://pplus-6xcn.onrender.com/api/swot-analysis/supervisor-mentions'
        : user.role.name === 'Analyst'
        ? 'https://pplus-6xcn.onrender.com/api/swot-analysis/my-analysis'
        : 'https://pplus-6xcn.onrender.com/api/swot-analysis';

      const response = await fetch(endpoint, {
        headers: getAuthHeaders(),
      });
      const result = await response.json();
      console.log('SWOT API response:', result); // Debug log
      if (result.success) {
        setSwotData(result.data.data || []); // Handle nested data array
      } else {
        toast.error(result.message || 'Failed to fetch SWOT analyses');
      }
    } catch (error) {
      toast.error('Error fetching SWOT analyses');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSwotData();
  }, [user, token]); // Add user and token to dependencies

  // Handle edit button click
  const handleEdit = (swot: SwotAnalysis) => {
    setSelectedSwot(swot);
    setEditDialogOpen(true);
  };

  // Handle view button click
  const handleView = (swot: SwotAnalysis) => {
    setSelectedSwot(swot);
    setViewDialogOpen(true);
  };

  // Handle delete button click
  const handleDelete = async (swot: SwotAnalysis) => {
    if (window.confirm(`Are you sure you want to delete the SWOT analysis for ${swot.company.company_name}?`)) {
      try {
        const response = await fetch(`https://pplus-6xcn.onrender.com/api/swot-analysis/delete/${swot.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
        });
        const result = await response.json();
        if (result.success) {
          setSwotData(prev => prev.filter(item => item.id !== swot.id));
          toast.success('SWOT analysis deleted successfully');
        } else {
          toast.error(result.message || 'Failed to delete SWOT analysis');
        }
      } catch (error) {
        toast.error('Error deleting SWOT analysis');
        console.error(error);
      }
    }
  };

  // Callback to refresh data after form submission
  const handleFormClose = (refresh: boolean) => {
    if (refresh) fetchSwotData();
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">SWOT Mentions</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{currentDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create SWOT Mention
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create SWOT Mention</DialogTitle>
              </DialogHeader>
              <SwotMentionForm onClose={(refresh) => handleFormClose(refresh)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Sn.</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Analysis</TableHead>
                <TableHead>Creation Date</TableHead>
                <TableHead>Last Edited</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {swotData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No SWOT mentions found.
                  </TableCell>
                </TableRow>
              ) : (
                swotData.map((swot, index) => (
                  <TableRow key={swot.id}>
                    <TableCell className="font-medium text-center">{index + 1}</TableCell>
                    <TableCell className="font-medium">{swot.company.company_name}</TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="text-sm text-muted-foreground truncate">
                        {(
                          swot.strengths[0]?.analysis ||
                          swot.weaknesses[0]?.analysis ||
                          swot.opportunities[0]?.analysis ||
                          swot.threats[0]?.analysis
                        ) || 'No analysis provided'}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(swot.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{swot.updatedAt ? format(new Date(swot.updatedAt), 'MMM d, yyyy') : '-'}</TableCell>
                    <TableCell>{swot.analyst_id ? 'Analyst' : 'Unknown'}</TableCell>
                    <TableCell>{swot.supervisor_id ? 'Supervisor' : '-'}</TableCell>
                    <TableCell>
                      <Badge variant={swot.status === 'approved' ? 'success' : 'outline'} className="capitalize">
                        {swot.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(swot)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(swot)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(swot)} className="text-red-600 focus:text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit SWOT Mention</DialogTitle>
          </DialogHeader>
          {selectedSwot && (
            <SwotMentionForm
              onClose={(refresh) => handleFormClose(refresh)}
              initialData={{
                id: selectedSwot.id,
                company_id: selectedSwot.company_id,
                date: new Date(selectedSwot.date).toISOString().split('T')[0],
                strengths: selectedSwot.strengths,
                weaknesses: selectedSwot.weaknesses,
                opportunities: selectedSwot.opportunities,
                threats: selectedSwot.threats,
                analyst_note: selectedSwot.analyst_note,
                supervisor_note: selectedSwot.supervisor_note,
              }}
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>SWOT Analysis for {selectedSwot?.company.company_name}</DialogTitle>
          </DialogHeader>
          {selectedSwot && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Date: {format(new Date(selectedSwot.date), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created: {format(new Date(selectedSwot.createdAt), 'MMMM d, yyyy')}
                  </p>
                </div>
                <Badge variant={selectedSwot.status === 'approved' ? 'success' : 'outline'} className="capitalize">
                  {selectedSwot.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="bg-green-50 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-green-100 p-2">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                      </div>
                      <CardTitle className="text-lg text-green-700">Strengths</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-3">
                      {selectedSwot.strengths.map((strength, index) => (
                        <li key={index} className="text-sm">{strength.analysis}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-red-50 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-red-100 p-2">
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                      </div>
                      <CardTitle className="text-lg text-red-700">Weaknesses</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-3">
                      {selectedSwot.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm">{weakness.analysis}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-blue-50 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-blue-100 p-2">
                        <ArrowUpRight className="h-4 w-4 text-blue-500" />
                      </div>
                      <CardTitle className="text-lg text-blue-700">Opportunities</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-3">
                      {selectedSwot.opportunities.map((opportunity, index) => (
                        <li key={index} className="text-sm">{opportunity.analysis}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-yellow-50 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-yellow-100 p-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      </div>
                      <CardTitle className="text-lg text-yellow-700">Threats</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-3">
                      {selectedSwot.threats.map((threat, index) => (
                        <li key={index} className="text-sm">{threat.analysis}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedSwot.analyst_note && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Analyst Note</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedSwot.analyst_note}</p>
                    </CardContent>
                  </Card>
                )}
                {selectedSwot.supervisor_note && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Supervisor Note</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedSwot.supervisor_note}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleEdit(selectedSwot);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}