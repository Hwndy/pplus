
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OutcomeInsightForm } from '../../components/admin/OutcomeInsightForm';
import { Plus, Eye, Edit, Trash2, MoreHorizontal, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useOutcomeInsights, useDeleteOutcomeInsight, useCompanies } from '@/hooks/useApi';
import { apiService, OutcomeInsight } from '@/services/apiService';
import { toast } from 'sonner';




export default function OutcomeInsightsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeInsight | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // API hooks
  const { data: outcomeInsights = [], loading, error, refetch } = useOutcomeInsights();
  const { data: companies = [] } = useCompanies();
  const { mutate: deleteOutcomeInsight, loading: deleting } = useDeleteOutcomeInsight();

  const handleView = (outcome: OutcomeInsight) => {
    setSelectedOutcome(outcome);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (outcome: OutcomeInsight) => {
    setSelectedOutcome(outcome);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (outcome: OutcomeInsight) => {
    try {
      console.log('Deleting outcome insight:', outcome.id);
      await deleteOutcomeInsight(outcome.id);
      toast.success('Outcome insight deleted successfully');
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Error deleting outcome insight:', error);
      toast.error('Failed to delete outcome insight');
    }
  };

  const handleCreate = async (outcomeData: any) => {
    try {
      console.log('Creating outcome insight:', outcomeData);

      // Find the company by name to get the ID
      const selectedCompany = companies.find(c => c.name === outcomeData.company);
      if (!selectedCompany) {
        toast.error('Please select a valid company');
        return;
      }

      const payload = {
        companyId: selectedCompany.id,
        title: outcomeData.title || `Outcome Analysis - ${outcomeData.company}`,
        date: outcomeData.date || new Date().toISOString().split('T')[0],
        socialMediaEngagement: {
          shareOfVoice: outcomeData.shareOfVoice || 0,
          impressions: outcomeData.impressions || 0,
          mentions: outcomeData.mentions || 0
        },
        analysis: outcomeData.analysis,
        category: outcomeData.category,
        status: outcomeData.status || 'PENDING',
        analystNote: outcomeData.analystNote,
        supervisorNote: outcomeData.supervisorNote
      };

      await apiService.createOutcomeInsight(payload);
      toast.success('Outcome insight created successfully');
      setIsDialogOpen(false);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Error creating outcome insight:', error);
      toast.error('Failed to create outcome insight');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedOutcome(null);
    setIsEditMode(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Outcome & Insights</h1>
          <p className="text-gray-600 mt-1">Manage outcome analysis and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Create Outcome
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Edit' : 'Create'} Outcome & Insight</DialogTitle>
              </DialogHeader>
              <OutcomeInsightForm
                onClose={handleCloseDialog}
                onSave={handleCreate}
                initialData={selectedOutcome}
                isEdit={isEditMode}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Failed to load outcome insights. Please try again.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {/* Outcome Entries Table */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Outcome & Insight Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Sn.</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Outcome</TableHead>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading outcome insights...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : outcomeInsights.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="text-gray-500">
                        No outcome insights found. Create your first one!
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  outcomeInsights.map((outcome, index) => {
                    const company = companies.find(c => c.id === outcome.companyId);
                    return (
                      <TableRow key={outcome.id}>
                        <TableCell className="font-medium text-center">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {company?.name || 'Unknown Company'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {outcome.category || 'General'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="text-sm text-muted-foreground truncate">
                            {outcome.analysis || 'No analysis provided'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {outcome.date ? format(new Date(outcome.date), 'MMM d, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {outcome.updatedAt ? format(new Date(outcome.updatedAt), 'MMM d, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {outcome.createdBy || 'System'}
                        </TableCell>
                        <TableCell>
                          {outcome.approvedBy || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={outcome.status === 'APPROVED' ? 'default' : outcome.status === 'PENDING' ? 'secondary' : 'outline'}
                            className="capitalize"
                          >
                            {outcome.status?.toLowerCase() || 'draft'}
                          </Badge>
                        </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(outcome)}
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
                            <DropdownMenuItem onClick={() => handleEdit(outcome)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(outcome)}
                              className="text-red-600 focus:text-red-600"
                              disabled={deleting}
                            >
                              {deleting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-2 h-4 w-4" />
                              )}
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>




    </div>
  );
}
