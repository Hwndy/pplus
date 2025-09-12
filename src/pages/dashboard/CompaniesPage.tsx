import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious
} from '@/components/ui/pagination';
import { UniversalFilter, FilterOption, FilterValues } from '@/components/ui/UniversalFilter';
import {
  Pencil, Trash2, Plus, RefreshCw, Download, Upload, MoreHorizontal,
  Building2, Globe, Mail, Phone, Eye, Filter, Loader2, AlertTriangle
} from 'lucide-react';
// import { CreateCompanyForm } from '@/components/admin/CreateCompanyForm';
import CreateCompanyForm from "@/components/admin/CreateCompanyForm";

import { FileUpload } from '@/components/FileUpload';
import { toast } from 'sonner';

const filterOptions: FilterOption[] = [
  {
    key: 'industry',
    label: 'Industry',
    type: 'search',
    placeholder: 'Filter by industry...'
  },
  {
    key: 'search',
    label: 'Search',
    type: 'search',
    placeholder: 'Search companies...'
  }
];

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [showFilters, setShowFilters] = useState(false);

  const companiesPerPage = 10;

  // Build params for API
  const apiParams = useMemo(() => {
    const params: Record<string, any> = { page: currentPage, limit: companiesPerPage };
    if (filterValues.industry) params.industry = filterValues.industry;
    if (filterValues.search) params.search = filterValues.search;
    return params;
  }, [currentPage, filterValues]);

  // Fetch Companies
  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('https://pplus-tk49.onrender.com/api/companies/', {
        params: apiParams
      });
      const apiData = res.data?.data;
      setCompanies(apiData?.data || []);
      setTotalPages(apiData?.pagination?.totalPages || 1);
      setTotalItems(apiData?.pagination?.total || 0);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [apiParams]);

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterValues) => {
    setFilterValues(newFilters);
    setCurrentPage(1);
  };

  // Dummy handlers
  const handleEdit = (company: any) => {
    toast.info(`Edit company: ${company.company_name}`);
  };
  const handleView = (company: any) => {
    toast.info(`Viewing company: ${company.company_name}`);
  };
  const handleDelete = async (id: string) => {
    toast.error('Delete API not implemented in demo');
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
          <Button variant="outline" onClick={fetchCompanies} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => toast.info('Export not implemented')}>
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
                onUploadComplete={() => {
                  toast.success('File uploaded');
                  setIsUploadDialogOpen(false);
                }}
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
                onSave={() => {
                  setIsCreateDialogOpen(false);
                  fetchCompanies();
                  toast.success('Company created');
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p>Total Companies</p><p className="text-2xl">{totalItems}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p>This Page</p><p className="text-2xl">{companies.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p>Industries</p><p className="text-2xl">{new Set(companies.map(c => c.industry)).size}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p>CEOs</p><p className="text-2xl">{companies.map(c => c.ceo).length}</p></CardContent></Card>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> {error}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3 flex justify-between items-center">
          <CardTitle className="text-lg">Filter & Search</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
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

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Companies List</span>
            <Badge variant="secondary">{totalItems} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status (CEO)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto" />
                  </TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No companies found
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company, i) => (
                  <TableRow key={company.id}>
                    <TableCell>{(currentPage - 1) * companiesPerPage + i + 1}</TableCell>
                    <TableCell className="font-medium">{company.company_name}</TableCell>
                    <TableCell>{company.industry}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-1"><Mail className="h-3 w-3" /> {company.email}</p>
                        <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {company.contact_person}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{company.ceo}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(company)}>
                            <Eye className="h-4 w-4 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(company)}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Company</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{company.company_name}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(company.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
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
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <PaginationItem key={n}>
                  <PaginationLink
                    isActive={n === currentPage}
                    onClick={() => setCurrentPage(n)}
                    className="cursor-pointer"
                  >
                    {n}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      <div className="text-center text-sm text-gray-500">
        Showing {(currentPage - 1) * companiesPerPage + 1}–
        {Math.min(currentPage * companiesPerPage, totalItems)} of {totalItems}
      </div>
    </div>
  );
};

export default CompaniesPage;
