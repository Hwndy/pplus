
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OutcomeInsightForm } from '../../components/admin/OutcomeInsightForm';
import { Plus, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

// Mock data for outcome entries table
const mockOutcomeData = [
  {
    id: '1',
    companyName: 'Access Bank',
    outcomeCategory: 'Article/Photo for leverage',
    analysis: 'Successful media coverage campaign resulted in 40% increase in brand visibility',
    creationDate: new Date('2024-01-15'),
    lastEdited: new Date('2024-01-16'),
    createdBy: 'John Analyst',
    approvedBy: 'Sarah Manager',
    status: 'approved',
    analystNote: 'Strong performance metrics achieved',
    supervisorNote: 'Approved for publication'
  },
  {
    id: '2',
    companyName: 'GTBank',
    outcomeCategory: 'Social Media Engagement',
    analysis: 'Twitter campaign generated 25% more engagement than previous quarter',
    creationDate: new Date('2024-01-10'),
    lastEdited: new Date('2024-01-12'),
    createdBy: 'Jane Smith',
    approvedBy: '',
    status: 'pending',
    analystNote: 'Engagement metrics exceeded expectations',
    supervisorNote: 'Under review for approval'
  },
  {
    id: '3',
    companyName: 'First Bank',
    outcomeCategory: 'Media Coverage',
    analysis: 'Positive media sentiment increased by 35% following CSR initiative launch',
    creationDate: new Date('2024-01-08'),
    lastEdited: new Date('2024-01-08'),
    createdBy: 'Mike Johnson',
    approvedBy: '',
    status: 'draft',
    analystNote: 'Initial analysis shows promising results',
    supervisorNote: ''
  },
  {
    id: '4',
    companyName: 'UBA',
    outcomeCategory: 'Brand Awareness',
    analysis: 'Brand recall improved by 20% after digital marketing campaign',
    creationDate: new Date('2024-01-12'),
    lastEdited: new Date('2024-01-14'),
    createdBy: 'Lisa Brown',
    approvedBy: 'David Wilson',
    status: 'approved',
    analystNote: 'Significant improvement in brand metrics',
    supervisorNote: 'Excellent campaign results'
  },
  {
    id: '5',
    companyName: 'Zenith Bank',
    outcomeCategory: 'Competitor Analysis',
    analysis: 'Market share analysis shows 15% improvement over main competitors',
    creationDate: new Date('2024-01-14'),
    lastEdited: new Date('2024-01-15'),
    createdBy: 'Tom Davis',
    approvedBy: '',
    status: 'pending',
    analystNote: 'Competitive advantage clearly demonstrated',
    supervisorNote: 'Pending final review'
  }
];


export default function OutcomeInsightsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleView = (outcome: any) => {
    setSelectedOutcome(outcome);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (outcome: any) => {
    setSelectedOutcome(outcome);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (outcome: any) => {
    console.log('Delete outcome:', outcome);
    // Implement delete functionality
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedOutcome(null);
    setIsEditMode(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Outcome & Insights</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Create Outcome
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Outcome & Insight</DialogTitle>
            </DialogHeader>
            <OutcomeInsightForm
              onClose={handleCloseDialog}
              initialData={selectedOutcome}
              isEdit={isEditMode}
            />
          </DialogContent>
        </Dialog>
      </div>

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
                {mockOutcomeData.map((outcome, index) => (
                  <TableRow key={outcome.id}>
                    <TableCell className="font-medium text-center">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {outcome.companyName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {outcome.outcomeCategory}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="text-sm text-muted-foreground truncate">
                        {outcome.analysis}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(outcome.creationDate, 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(outcome.lastEdited, 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {outcome.createdBy}
                    </TableCell>
                    <TableCell>
                      {outcome.approvedBy || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={outcome.status === 'approved' ? 'success' : 'outline'}
                        className="capitalize"
                      >
                        {outcome.status}
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
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>




    </div>
  );
}
