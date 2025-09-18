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
import {
  Eye, Pencil, Trash2, RefreshCw, Plus, MoreHorizontal,
  Building2, Mail, Phone, Loader2
} from 'lucide-react';
import CreateCompanyForm from "@/components/admin/CreateCompanyForm";
import { toast } from 'sonner';

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

  const companiesPerPage = 10;

  const apiParams = useMemo(() => {
    const params: Record<string, any> = { page: currentPage, limit: companiesPerPage };
    if (searchTerm) params.search = searchTerm;
    return params;
  }, [currentPage, searchTerm]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://backend-tw99.onrender.com/api/companies/', {
        params: apiParams
      });
      const apiData = res.data?.data;
      setCompanies(apiData?.data || []);
      setTotalPages(apiData?.pagination?.totalPages || 1);
      setTotalItems(apiData?.pagination?.total || 0);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [apiParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const openFormDialog = async (company: any = null, viewMode = false) => {
    if (company && !viewMode) {
      try {
        const res = await axios.get(`https://pplus-y9m6.onrender.com/api/companies/${company.id}`);
        setSelectedCompany(res.data.company); // Ensure full data is fetched
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
      await axios.put(`https://pplus-y9m6.onrender.com/api/companies/delete/${id}`);
      fetchCompanies();
      toast.success(`${companyName} deleted successfully`);
    } catch (err: any) {
      toast.error('Failed to delete company');
    }
  };

  const handleFormSave = () => {
    setIsFormDialogOpen(false);
    setSelectedCompany(null);
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Companies</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={fetchCompanies} 
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <p className="text-gray-600">Manage company information</p>

      <div className="flex gap-4 items-end">
        <Input 
          placeholder="Search companies..." 
          className="max-w-sm flex-1"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700" 
          onClick={() => openFormDialog(null, false)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

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

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogTrigger asChild />
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto">
            <CreateCompanyForm
              initialValues={selectedCompany}
              isViewMode={isViewMode}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompaniesPage;