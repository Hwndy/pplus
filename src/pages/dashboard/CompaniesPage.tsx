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
  Eye, Pencil, Trash2, Search, Plus, RefreshCw, Building2, Mail, Phone, Loader2, MapPin, Users,
  Globe, Facebook, Instagram, Twitter, Linkedin, Youtube
} from 'lucide-react';
import CreateCompanyForm from "@/components/admin/CreateCompanyForm";
import { toast } from 'sonner';

// ViewCompanyDetails (kept enhanced version from previous fix)
const ViewCompanyDetails: React.FC<{ company: any; onCancel: () => void }> = ({ company, onCancel }) => {
  if (!company) return null;

  const socialLinks = [
    { key: 'facebook_link', icon: Facebook, label: 'Facebook' },
    { key: 'instagram_link', icon: Instagram, label: 'Instagram' },
    { key: 'twitter_link', icon: Twitter, label: 'Twitter' },
    { key: 'linkedin_link', icon: Linkedin, label: 'LinkedIn' },
    { key: 'youtube_link', icon: Youtube, label: 'YouTube' },
  ];

  return (
    <ScrollArea className="h-[70vh] pr-4">
      <div className="space-y-6 pb-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Company Name</p>
              <p className="font-medium">{company.company_name || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Industry / Sub-industry</p>
              <p className="font-medium">
                {company.industry || '—'}
                {company.sub_industry && ` → ${company.sub_industry}`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium break-all">{company.email || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{company.phone_no || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:col-span-2">
            <MapPin className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Office Address</p>
              <p className="font-medium">
                {company.office_address || '—'}
                {(company.office_state || company.office_country) && (
                  <span className="text-gray-600">
                    {company.office_address && ', '}
                    {company.office_state}
                    {company.office_state && company.office_country && ', '}
                    {company.office_country}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Contact Person</p>
              <p className="font-medium">{company.contact_person || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">CEO</p>
              <p className="font-medium">{company.ceo || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Website</p>
              <p className="font-medium break-all">
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    {company.website}
                  </a>
                ) : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Social Media</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {socialLinks.map(({ key, icon: Icon, label }) => {
              const url = company[key as keyof typeof company];
              return (
                <div key={key} className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    {url && url !== `https://${label.toLowerCase()}.com` ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline text-sm break-all"
                      >
                        {url}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400">Not provided</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {company.additional_info && (
          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Information</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{company.additional_info}</p>
          </div>
        )}

        <div className="flex justify-end pt-6">
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
        </div>
      </div>
    </ScrollArea>
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
      const res = await axios.get('https://p-fw0o.onrender.com/api/v1/companies/', {
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

  const openFormDialog = (company: any = null, viewMode = false) => {
    // Critical fix: always clear previous selection first
    setSelectedCompany(null);

    if (company) {
      // For edit or view → fetch fresh data
      axios.get(`https://p-fw0o.onrender.com/api/v1/companies/${company.id}`)
        .then(res => {
          // Support both possible response shapes you showed
          const companyData = res.data?.data?.company || res.data?.company || res.data;
          setSelectedCompany(companyData);
          setIsViewMode(viewMode);
          setIsFormDialogOpen(true);
        })
        .catch(err => {
          toast.error('Failed to load company details');
          console.error(err);
        });
    } else {
      // Create mode → explicitly empty
      setIsViewMode(false);
      setIsFormDialogOpen(true);
    }
  };

  const handleView = (company: any) => {
    openFormDialog(company, true);
  };

  const handleEdit = (company: any) => {
    openFormDialog(company, false);
  };

  const handleCreate = () => {
    openFormDialog(); // no company → create mode
  };

  const handleDelete = async (id: string | number, companyName: string) => {
    try {
      await axios.put(`https://p-fw0o.onrender.com/api/v1/companies/delete/${id}`);
      toast.success(`${companyName} deleted successfully`);
      fetchCompanies();
    } catch (err: any) {
      toast.error('Failed to delete company');
    }
  };

  const handleFormSave = () => {
    setIsFormDialogOpen(false);
    setSelectedCompany(null); // extra safety
    fetchCompanies();
  };

  // Extra cleanup when modal fully closes
  const handleDialogOpenChange = (open: boolean) => {
    setIsFormDialogOpen(open);
    if (!open) {
      // When closing (any way) → clear selection
      setTimeout(() => {
        setSelectedCompany(null);
      }, 100); // small delay helps React finish render cycle
    }
  };

  const dialogTitle = isViewMode
    ? selectedCompany ? `View ${selectedCompany.company_name}` : 'View Company'
    : selectedCompany
    ? 'Edit Company'
    : 'Create Company';

  return (
    <div className="p-6 h-full">
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

      <div className="flex justify-between mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search companies..." className="pl-8" value={searchTerm} onChange={handleSearch} />
        </div>

        <Dialog open={isFormDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-950" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" /> Create Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1500px]">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              {isViewMode && selectedCompany && (
                <DialogDescription>
                  Full details of {selectedCompany.company_name}.
                </DialogDescription>
              )}
            </DialogHeader>

            <ScrollArea className="max-h-[calc(100vh-180px)] pr-4">
              {isViewMode && selectedCompany ? (
                <ViewCompanyDetails company={selectedCompany} onCancel={() => setIsFormDialogOpen(false)} />
              ) : (
                <CreateCompanyForm
                  initialValues={selectedCompany} // will be null for create
                  isViewMode={isViewMode}
                  onSave={handleFormSave}
                  onCancel={() => setIsFormDialogOpen(false)}
                />
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table - unchanged */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Sn.</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>CEO</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
                  <p className="mt-3 text-gray-500">Loading companies...</p>
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  No companies found
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company, index) => (
                <TableRow key={company.id}>
                  <TableCell>{(currentPage - 1) * companiesPerPage + index + 1}</TableCell>
                  <TableCell className="font-medium">{company.company_name}</TableCell>
                  <TableCell>{company.industry}</TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <p className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> {company.email}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {company.contact_person}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{company.ceo || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
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

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              {totalPages > 7 && <span className="px-4 py-2">...</span>}
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

      <div className="mt-5 text-sm text-gray-500 text-center md:text-left">
        Showing {(currentPage - 1) * companiesPerPage + 1} to {Math.min(currentPage * companiesPerPage, totalItems)} of {totalItems} results
      </div>
    </div>
  );
};

export default CompaniesPage;