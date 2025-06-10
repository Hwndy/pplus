
import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { UniversalFilter, FilterOption, FilterValues } from '@/components/ui/UniversalFilter';
import {
  Pencil,
  Trash2,
  Search,
  Plus,
  RefreshCw,
  Download,
  Upload,
  MoreHorizontal,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  User,
  Eye,
  Filter,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { CreateCompanyForm } from '@/components/admin/CreateCompanyForm';
import { useCompanies, useDeleteCompany } from '@/hooks/useApi';
import { GlobalSearch } from '@/components/GlobalSearch';
import { FileUpload } from '@/components/FileUpload';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

// Filter options for companies
const filterOptions: FilterOption[] = [
  {
    key: 'industry',
    label: 'Industry',
    type: 'select',
    options: [
      { value: 'Technology', label: 'Technology' },
      { value: 'Banking', label: 'Banking' },
      { value: 'Telecommunications', label: 'Telecommunications' },
      { value: 'Manufacturing', label: 'Manufacturing' },
      { value: 'Healthcare', label: 'Healthcare' },
      { value: 'Education', label: 'Education' },
      { value: 'Retail', label: 'Retail' },
      { value: 'Energy', label: 'Energy' },
      { value: 'Transportation', label: 'Transportation' },
      { value: 'Real Estate', label: 'Real Estate' },
      { value: 'Agriculture', label: 'Agriculture' },
      { value: 'Entertainment', label: 'Entertainment' },
      { value: 'Food & Beverages', label: 'Food & Beverages' },
      { value: 'Automotive', label: 'Automotive' },
      { value: 'Construction', label: 'Construction' },
      { value: 'Insurance', label: 'Insurance' },
      { value: 'Consulting', label: 'Consulting' },
      { value: 'Media', label: 'Media' },
      { value: 'Government', label: 'Government' },
      { value: 'Non-Profit', label: 'Non-Profit' },
      { value: 'Other', label: 'Other' }
    ]
  },
  {
    key: 'isActive',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' }
    ]
  },
  {
    key: 'search',
    label: 'Search',
    type: 'search',
    placeholder: 'Search companies...'
  }
];

const CompaniesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [showFilters, setShowFilters] = useState(false);
  const companiesPerPage = 10;

  // Build API parameters from filters
  const apiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: companiesPerPage,
    };

    // Add filter values to params
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });

    return params;
  }, [currentPage, filterValues]);

  // API hooks
  const { data: companiesResponse, loading, error, refetch } = useCompanies(apiParams);
  const { mutate: deleteCompany, loading: deleting } = useDeleteCompany();

  // Extract data from API response
  const companies = companiesResponse?.data || [];
  const pagination = companiesResponse?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.total || 0;

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle edit
  const handleEdit = (company: any) => {
    toast.info(`Edit functionality for ${company.name} - Opening edit form...`);
    // TODO: Implement edit form or navigate to edit page
  };

  // Handle view
  const handleView = (company: any) => {
    // Navigate to company details page or show details modal
    toast.info(`Viewing details for ${company.name}`);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteCompany(id);
      toast.success("Company deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete company");
    }
  };

  // Handle form success
  const handleFormSuccess = (company: any) => {
    setIsCreateDialogOpen(false);
    refetch(); // Refresh the list
    toast.success('Company saved successfully');
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setIsCreateDialogOpen(false);
  };

  // Handle search result selection
  const handleSearchResult = (result: any) => {
    if (result.type === 'company') {
      toast.success(`Selected company: ${result.title}`);
    }
  };

  // Handle file upload
  const handleFileUpload = (files: any[]) => {
    toast.success(`Uploaded ${files.length} files successfully`);
    setIsUploadDialogOpen(false);
    refetch(); // Refresh data after upload
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await apiService.exportCompanies({
        format: 'csv',
        ...filterValues // Include current filters in export
      });
      toast.success('Companies exported successfully');
    } catch (error) {
      toast.error('Failed to export companies');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-indigo-600" />
            Companies
          </h1>
          <p className="text-gray-600 mt-1">Manage and monitor company information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Company Data</DialogTitle>
              </DialogHeader>
              <FileUpload
                uploadType="data"
                accept=".csv,.xlsx,.xls"
                onUploadComplete={handleFileUpload}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Company</DialogTitle>
              </DialogHeader>
              <CreateCompanyForm
                onSave={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <Building2 className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Companies</p>
                <p className="text-2xl font-bold text-green-600">
                  {companies.filter((c: any) => c.isActive).length}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Industries</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(companies.map((c: any) => c.industry)).size}
                </p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Page</p>
                <p className="text-2xl font-bold text-purple-600">{companies.length}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Error loading companies: {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Filter & Search</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="pt-0">
            <UniversalFilter
              options={filterOptions}
              values={filterValues}
              onChange={handleFilterChange}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            />
          </CardContent>
        )}
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Companies List</span>
            <Badge variant="secondary">{totalItems} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        <p className="text-gray-500">Loading companies...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500">No companies found</p>
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateDialogOpen(true)}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Company
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((company: any, index: number) => (
                    <TableRow key={company.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {((currentPage - 1) * companiesPerPage) + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={company.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded bg-indigo-100 flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-indigo-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{company.name}</p>
                            {company.website && (
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {company.website}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{company.industry}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {company.email && (
                            <p className="text-sm flex items-center gap-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              {company.email}
                            </p>
                          )}
                          {company.phone && (
                            <p className="text-sm flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {company.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={company.isActive ? "default" : "secondary"}
                          className={company.isActive ? "bg-green-100 text-green-800" : ""}
                        >
                          {company.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(company)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(company)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Company</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{company.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(company.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={deleting}
                                  >
                                    {deleting ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4 mr-2" />
                                    )}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <PaginationItem key={number}>
                  <PaginationLink
                    isActive={currentPage === number}
                    onClick={() => setCurrentPage(number)}
                    className="cursor-pointer"
                  >
                    {number}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-center text-sm text-gray-500">
        Showing {((currentPage - 1) * companiesPerPage) + 1} to {Math.min(currentPage * companiesPerPage, totalItems)} of {totalItems} results
      </div>


    </div>
  );
};

export default CompaniesPage;
