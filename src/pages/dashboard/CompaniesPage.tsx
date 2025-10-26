import React, { useState, useMemo, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious
} from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Eye, Pencil, Trash2, Search, Plus, RefreshCw, Building2, Mail, Phone, Loader2, MapPin, Users
} from 'lucide-react';
import CreateCompanyForm from "@/components/admin/CreateCompanyForm";
import { toast } from 'sonner';

// ViewCompanyDetails Component for read-only view
const ViewCompanyDetails: React.FC<{ company: any; onCancel: () => void }> = ({ company, onCancel }) => {
  if (!company) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Company Name</p>
            <p className="text-base font-medium">{company.company_name || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Industry</p>
            <p className="text-base font-medium">{company.industry || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-base font-medium">{company.email || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Contact Person</p>
            <p className="text-base font-medium">{company.contact_person || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">CEO</p>
            <p className="text-base font-medium">{company.ceo || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                company.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : company.status === 'INACTIVE'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {company.status || 'N/A'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    </div>
  );
};

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const companiesPerPage = 10;

  const apiParams = useMemo(() => {
    const params: Record<string, any> = { page: currentPage, limit: companiesPerPage };
    if (searchTerm) params.search = searchTerm;
    return params;
  }, [currentPage, searchTerm]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://pplus-nl5o.onrender.com/api/companies/', {
        params: apiParams
      });
      const apiData = res.data?.data;
      setCompanies(apiData?.data || []);
      setTotalPages(apiData?.pagination?.totalPages || 1);
      setTotalItems(apiData?.pagination?.total || 0);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    return () => searchTimeout.current && clearTimeout(searchTimeout.current);
  }, [apiParams]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setCurrentPage(1), 500);
  };

  const openFormDialog = async (company: any = null, viewMode = false) => {
    if (company && !viewMode) {
      try {
        const res = await axios.get(`https://pplus-nl5o.onrender.com/api/companies/${company.id}`);
        setSelectedCompany(res.data.company);
      } catch (err) {
        toast.error('Failed to load company details');
        return;
      }
    } else if (company && viewMode) {
      setSelectedCompany(company);
    } else {
      setSelectedCompany(null);
    }
    setIsViewMode(viewMode);
    setIsFormDialogOpen(true);
  };

  const handleView = (company: any) => {
    openFormDialog(company, true);
  };

  const handleEdit = (company: any) => {
    openFormDialog(company, false);
  };

  const handleDelete = async (id: string, companyName: string) => {
    try {
      await axios.put(`https://pplus-nl5o.onrender.com/api/companies/delete/${id}`);
      toast.success(`${companyName} deleted successfully`);
      fetchCompanies();
    } catch (err: any) {
      toast.error('Failed to delete company');
    }
  };

  const handleFormSave = () => {
    setIsFormDialogOpen(false);
    setSelectedCompany(null);
    toast.success(isViewMode ? 'Company viewed' : selectedCompany ? 'Company updated successfully' : 'Company created successfully');
    fetchCompanies();
  };

  const handleFormCancel = () => {
    setIsFormDialogOpen(false);
    setSelectedCompany(null);
  };

  const dialogTitle = isViewMode 
    ? selectedCompany ? `View ${selectedCompany.company_name}` : 'View Company'
    : selectedCompany 
    ? 'Edit Company' 
    : 'Create Company';

  return (
    <div className="p-6 h-full">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Companies</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCompanies} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-600">
          Loading companies...
        </div>
      )}

      {/* Search + Create */}
      <div className="flex justify-between mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search companies..." className="pl-8" value={searchTerm} onChange={handleSearch} />
        </div>
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-950">
              <Plus className="mr-2 h-4 w-4" /> Create Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              {isViewMode && (
                <DialogDescription>View details of {selectedCompany?.company_name || 'the company'}.</DialogDescription>
              )}
            </DialogHeader>
            <ScrollArea className="max-h-[calc(100vh-200px)] pr-4">
              {isViewMode && selectedCompany ? (
                <ViewCompanyDetails company={selectedCompany} onCancel={handleFormCancel} />
              ) : (
                <CreateCompanyForm
                  initialValues={selectedCompany}
                  isViewMode={isViewMode}
                  onSave={handleFormSave}
                  onCancel={handleFormCancel}
                />
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Sn.</TableHead>
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
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
                  <p className="text-gray-500">Loading companies...</p>
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No companies found
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company, index) => (
                <TableRow key={company.id}>
                  <TableCell>{(currentPage - 1) * companiesPerPage + index + 1}</TableCell>
                  <TableCell>{company.company_name}</TableCell>
                  <TableCell>{company.industry}</TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-1">
                        <Mail className="h-4 w-4" /> {company.email}
                      </p>
                      <p className="flex items-center gap-1">
                        <Phone className="h-4 w-4" /> {company.contact_person}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        company.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : company.status === 'INACTIVE'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {company.ceo}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleView(company)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(company)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Company</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{company.company_name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(company.id, company.company_name)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
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

      {/* Footer */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {(currentPage - 1) * companiesPerPage + 1} to {Math.min(currentPage * companiesPerPage, totalItems)} of {totalItems} results
      </div>
    </div>
  );
};

export default CompaniesPage;