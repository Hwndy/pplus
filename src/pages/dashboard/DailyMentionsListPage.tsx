import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  FileText, 
  Filter, 
  X, 
  CalendarIcon, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DailyMediaReport, createMockReport } from '@/types/dailyMentions';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data for daily mentions reports
const mockReports: Array<DailyMediaReport & { status: 'draft' | 'pending' | 'approved' | 'rejected', createdBy: string, createdAt: string }> = [
  {
    ...createMockReport(),
    id: 'report-1',
    date: '2023-06-10',
    status: 'approved',
    createdBy: 'John Doe',
    createdAt: '2023-06-10T09:30:00Z'
  },
  {
    ...createMockReport(),
    id: 'report-2',
    date: '2023-06-11',
    status: 'pending',
    createdBy: 'Jane Smith',
    createdAt: '2023-06-11T10:15:00Z'
  },
  {
    ...createMockReport(),
    id: 'report-3',
    date: '2023-06-12',
    status: 'draft',
    createdBy: 'Alex Johnson',
    createdAt: '2023-06-12T14:45:00Z'
  },
  {
    ...createMockReport(),
    id: 'report-4',
    date: '2023-06-13',
    status: 'rejected',
    createdBy: 'Sarah Williams',
    createdAt: '2023-06-13T11:20:00Z'
  }
];

const DailyMentionsListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<Array<DailyMediaReport & { status: string, createdBy: string, createdAt: string }>>(mockReports);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [creatorFilter, setCreatorFilter] = useState<string>("all");

  // Get unique creators for filter
  const uniqueCreators = Array.from(new Set(reports.map(report => report.createdBy)));

  // Apply filters
  const filteredReports = reports.filter(report => {
    // Filter by status
    if (statusFilter !== "all" && report.status !== statusFilter) {
      return false;
    }

    // Filter by creator
    if (creatorFilter !== "all" && report.createdBy !== creatorFilter) {
      return false;
    }

    // Filter by date
    if (dateFilter) {
      const reportDate = new Date(report.date);
      const filterDate = new Date(dateFilter);
      
      if (
        reportDate.getFullYear() !== filterDate.getFullYear() ||
        reportDate.getMonth() !== filterDate.getMonth() ||
        reportDate.getDate() !== filterDate.getDate()
      ) {
        return false;
      }
    }

    return true;
  });

  const handleCreateNew = () => {
    navigate('/dashboard/daily-mentions/create');
  };

  const handleViewReport = (reportId: string) => {
    navigate(`/dashboard/daily-mentions/view/${reportId}`);
  };

  const handleEditReport = (reportId: string) => {
    navigate(`/dashboard/daily-mentions/edit/${reportId}`);
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      setReports(prev => prev.filter(report => report.id !== reportId));
      toast({
        title: "Report Deleted",
        description: "The daily mentions report has been deleted.",
      });
    }
  };

  const handleApproveReport = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status: 'approved' } : report
    ));
    toast({
      title: "Report Approved",
      description: "The daily mentions report has been approved.",
    });
  };

  const handleRejectReport = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status: 'rejected' } : report
    ));
    toast({
      title: "Report Rejected",
      description: "The daily mentions report has been rejected.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daily Media Mentions</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? "secondary" : "outline"}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button
            onClick={handleCreateNew}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Create New Report
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <Card className="p-4 mb-6 w-full">
          <h2 className="text-lg font-medium mb-4">Filter Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {/* Date Filter */}
            <div>
              <Label htmlFor="date-filter">Filter by Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-filter"
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, 'PPP') : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {dateFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDateFilter(undefined)}
                  className="mt-1"
                >
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger id="status-filter" className="mt-1 w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Creator Filter */}
            <div>
              <Label htmlFor="creator-filter">Filter by Creator</Label>
              <Select
                value={creatorFilter}
                onValueChange={setCreatorFilter}
              >
                <SelectTrigger id="creator-filter" className="mt-1 w-full">
                  <SelectValue placeholder="Select creator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Creators</SelectItem>
                  {uniqueCreators.map(creator => (
                    <SelectItem key={creator} value={creator}>
                      {creator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(dateFilter || statusFilter !== "all" || creatorFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4 w-full">
              <span className="text-sm font-medium">Active Filters:</span>
              {dateFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Date: {format(dateFilter, 'MMM d, yyyy')}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setDateFilter(undefined)} />
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {statusFilter}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setStatusFilter("all")} />
                </Badge>
              )}
              {creatorFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Creator: {creatorFilter}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setCreatorFilter("all")} />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateFilter(undefined);
                  setStatusFilter("all");
                  setCreatorFilter("all");
                }}
                className="ml-auto"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Mentions Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Report ID</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No reports found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      {format(new Date(report.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{report.id}</TableCell>
                    <TableCell>{report.createdBy}</TableCell>
                    <TableCell>
                      {format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>{report.sections.length}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewReport(report.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditReport(report.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteReport(report.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {report.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleApproveReport(report.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRejectReport(report.id)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyMentionsListPage;
