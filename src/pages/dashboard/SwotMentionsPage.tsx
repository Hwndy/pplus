
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, ArrowUpRight, AlertTriangle, Plus, Filter, Calendar, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SwotMentionForm } from '../../components/admin/SwotMentionForm';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Mock SWOT data
const mockSwotData = [
  {
    id: '1',
    company: 'company-a',
    companyName: 'Company A',
    date: new Date('2023-10-15'),
    strengths: [
      { content: 'VFD Group gained media attention when the brand restated its commitment to the NGX Group after the appointment of Kwairanga as new chairman.' },
      { content: 'Vbank got positive reviews on its V App.' },
      { content: 'Firm Projects Higher Interest Income, Increased Earnings For Banks' }
    ],
    weaknesses: [
      { content: 'There was no weakness observed in October.' }
    ],
    opportunities: [
      { content: 'We advise the brand to lend its voice on the importance of fintech in financial inclusion.' },
      { content: 'Create more awareness on the best investment areas for real estate in the country.' }
    ],
    threats: [
      { content: 'The rise in inflation in the country and its negative effect on all sectors of the economy.' },
      { content: 'The recent flood which will raise the value of housing in some part of the country.' }
    ],
    status: 'approved',
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2023-10-16'),
    analystNote: 'This is a comprehensive SWOT analysis for Company A.',
    supervisorNote: 'Approved with minor edits.'
  },
  {
    id: '2',
    company: 'company-b',
    companyName: 'Company B',
    date: new Date('2023-11-05'),
    strengths: [
      { content: 'Strong brand recognition in the market.' },
      { content: 'Innovative product launches in Q3.' }
    ],
    weaknesses: [
      { content: 'Customer service issues reported in social media.' },
      { content: 'Declining market share in the youth segment.' }
    ],
    opportunities: [
      { content: 'Expansion into emerging markets.' },
      { content: 'Strategic partnerships with tech companies.' }
    ],
    threats: [
      { content: 'Increasing competition from fintech startups.' },
      { content: 'Regulatory changes affecting the industry.' }
    ],
    status: 'pending',
    createdAt: new Date('2023-11-05'),
    updatedAt: null,
    analystNote: 'Company B is facing challenges but has strong opportunities for growth.',
    supervisorNote: ''
  }
];

// Mock companies data
const companies = [
  { label: "All Companies", value: "all" },
  { label: "Company A", value: "company-a" },
  { label: "Company B", value: "company-b" },
  { label: "Company C", value: "company-c" },
  { label: "Company D", value: "company-d" },
  { label: "Company E", value: "company-e" },
];

export function SwotMentionsPage() {
  const [currentDate] = useState(new Date());
  const [swotData, setSwotData] = useState(mockSwotData);
  const [activeTab, setActiveTab] = useState('all');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSwot, setSelectedSwot] = useState<any>(null);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [companyFilter, setCompanyFilter] = useState("all");

  // Get filtered SWOT data
  const getFilteredSwotData = () => {
    let filtered = [...swotData];

    // Filter by status if not 'all'
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.status === activeTab);
    }

    // Filter by date if set
    if (dateFilter) {
      filtered = filtered.filter(item =>
        format(item.date, 'yyyy-MM-dd') === format(dateFilter, 'yyyy-MM-dd')
      );
    }

    // Filter by company if not 'all'
    if (companyFilter !== 'all') {
      filtered = filtered.filter(item => item.company === companyFilter);
    }

    return filtered;
  };

  // Handle edit button click
  const handleEdit = (swot: any) => {
    setSelectedSwot(swot);
    setEditDialogOpen(true);
  };

  // Handle view button click
  const handleView = (swot: any) => {
    setSelectedSwot(swot);
    setViewDialogOpen(true);
  };

  // Handle delete button click
  const handleDelete = (swot: any) => {
    if (window.confirm(`Are you sure you want to delete the SWOT mention for ${swot.companyName}?`)) {
      setSwotData(prev => prev.filter(item => item.id !== swot.id));
      toast.success("SWOT mention deleted successfully");
    }
  };

  // Reset filters
  const resetFilters = () => {
    setDateFilter(undefined);
    setCompanyFilter("all");
  };

  // Get active filters count
  const activeFiltersCount = [
    dateFilter,
    companyFilter !== "all"
  ].filter(Boolean).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">SWOT Mentions</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{currentDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? "secondary" : "outline"}
            className="flex items-center gap-1 relative"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {!showFilters && activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 text-xs absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
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
              <SwotMentionForm onClose={() => setCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="bg-muted/40">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFilter && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Company</label>
                <Combobox
                  items={companies}
                  placeholder="Select a company"
                  value={companyFilter}
                  onChange={setCompanyFilter}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={resetFilters} className="ml-auto">
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All SWOT Mentions</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {getFilteredSwotData().length === 0 ? (
            <Card className="bg-muted/40">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No SWOT mentions found with the current filters.</p>
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredSwotData().map((swot) => (
                <Card key={swot.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{swot.companyName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {format(swot.date, 'MMMM d, yyyy')}
                        </p>
                      </div>
                      <Badge
                        variant={swot.status === 'approved' ? 'success' : 'outline'}
                        className="capitalize"
                      >
                        {swot.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-green-100 p-1.5">
                            <ThumbsUp className="h-3.5 w-3.5 text-green-500" />
                          </div>
                          <h3 className="text-sm font-medium">Strengths</h3>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {swot.strengths[0]?.content}
                          {swot.strengths.length > 1 && ` (+${swot.strengths.length - 1} more)`}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-red-100 p-1.5">
                            <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                          </div>
                          <h3 className="text-sm font-medium">Weaknesses</h3>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {swot.weaknesses[0]?.content}
                          {swot.weaknesses.length > 1 && ` (+${swot.weaknesses.length - 1} more)`}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-blue-100 p-1.5">
                            <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" />
                          </div>
                          <h3 className="text-sm font-medium">Opportunities</h3>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {swot.opportunities[0]?.content}
                          {swot.opportunities.length > 1 && ` (+${swot.opportunities.length - 1} more)`}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-yellow-100 p-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                          </div>
                          <h3 className="text-sm font-medium">Threats</h3>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {swot.threats[0]?.content}
                          {swot.threats.length > 1 && ` (+${swot.threats.length - 1} more)`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <Button variant="ghost" size="sm" onClick={() => handleView(swot)}>
                      View Details
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(swot)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(swot)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit SWOT Mention</DialogTitle>
          </DialogHeader>
          {selectedSwot && (
            <SwotMentionForm
              onClose={() => setEditDialogOpen(false)}
              initialData={{
                company: selectedSwot.company,
                date: selectedSwot.date,
                strengths: selectedSwot.strengths,
                weaknesses: selectedSwot.weaknesses,
                opportunities: selectedSwot.opportunities,
                threats: selectedSwot.threats,
                analystNote: selectedSwot.analystNote,
                supervisorNote: selectedSwot.supervisorNote
              }}
              isEdit={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              SWOT Analysis for {selectedSwot?.companyName}
            </DialogTitle>
          </DialogHeader>

          {selectedSwot && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Date: {format(selectedSwot.date, 'MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Created: {format(selectedSwot.createdAt, 'MMMM d, yyyy')}
                  </p>
                </div>
                <Badge
                  variant={selectedSwot.status === 'approved' ? 'success' : 'outline'}
                  className="capitalize"
                >
                  {selectedSwot.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
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
                      {selectedSwot.strengths.map((strength: any, index: number) => (
                        <li key={index} className="text-sm">
                          {strength.content}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Weaknesses */}
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
                      {selectedSwot.weaknesses.map((weakness: any, index: number) => (
                        <li key={index} className="text-sm">
                          {weakness.content}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Opportunities */}
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
                      {selectedSwot.opportunities.map((opportunity: any, index: number) => (
                        <li key={index} className="text-sm">
                          {opportunity.content}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Threats */}
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
                      {selectedSwot.threats.map((threat: any, index: number) => (
                        <li key={index} className="text-sm">
                          {threat.content}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Analyst Note */}
                {selectedSwot.analystNote && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Analyst Note</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedSwot.analystNote}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Supervisor Note */}
                {selectedSwot.supervisorNote && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Supervisor Note</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedSwot.supervisorNote}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                <Button variant="outline" onClick={() => {
                  setViewDialogOpen(false);
                  handleEdit(selectedSwot);
                }}>
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
