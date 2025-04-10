
import React, { useState } from 'react';
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Pencil, Trash2, Search, Plus } from 'lucide-react';
import { CreateCompanyForm } from '@/components/admin/CreateCompanyForm';
import { toast } from 'sonner';

// Define the Company interface
interface Company {
  id: number;
  name: string;
  email: string;
  industry: string;
  ceo: string;
  phone: string;
  address: string;
}

// Mock data for companies
const mockCompanies: Company[] = [
  {
    id: 1,
    name: 'Brynn Stout',
    email: 'vory@mailinator.com',
    industry: 'Ab id voluptatem i',
    ceo: 'Blanditiis',
    phone: '+1 (379) 319-6619',
    address: 'Quam quis sunt et il consequat'
  },
  {
    id: 2,
    name: 'testcompany',
    email: 'testcompany5@mailinator.com',
    industry: 'Test',
    ceo: 'Peter smith',
    phone: '7678765678',
    address: 'Ring road 67 wilson gate'
  },
  {
    id: 3,
    name: 'Toggle test comp',
    email: 'toggletest@mailinator.com',
    industry: 'IT',
    ceo: 'Incididunt reprehend',
    phone: '+1 (271) 808-8898',
    address: 'Ea esse temporibus'
  },
  {
    id: 4,
    name: 'Alden Farley',
    email: 'dinyje@mailinator.com',
    industry: 'Similique debitis se',
    ceo: 'A qui ut a sed eorum',
    phone: '+1 (159) 531-9222',
    address: 'Veniam maiores volu'
  },
  {
    id: 5,
    name: 'Jada Booth',
    email: 'tahwyp@mailinator.com',
    industry: 'Eaque esse voluptas',
    ceo: 'Nam ad molestiae inc',
    phone: '+1 (685) 628-4304',
    address: 'Sed blanditiis facer'
  },
  {
    id: 6,
    name: 'Bree Stark',
    email: 'pabumazos@mailinator.com',
    industry: 'Autem velit minim qu',
    ceo: 'Soluta enim dicta pa',
    phone: '+1 (528) 796-4895',
    address: 'Ullam quod deleniti'
  },
  {
    id: 7,
    name: 'AXA Mansard Insurance',
    email: 'CustomerCareNigeria@axamansard.com',
    industry: 'Financial Services',
    ceo: 'Kunle Ahmed',
    phone: '07090909909909',
    address: 'Lagos'
  },
  {
    id: 8,
    name: 'FCMB',
    email: 'CustomerCareNigeria@fcmb.com',
    industry: 'Financial Services',
    ceo: 'Yemisi Edun',
    phone: '07090909909909',
    address: 'Lagos'
  },
  {
    id: 9,
    name: 'Stanbic IBTC Bank',
    email: 'CustomerCareNigeria@stanbicibtc.com',
    industry: 'Financial Services',
    ceo: 'Demola Sogunle',
    phone: '0700 909 909 909',
    address: 'Lagos'
  },
  {
    id: 10,
    name: 'FIDELITY',
    email: 'pyxolyvas@mailinator.com',
    industry: 'Est vitae quaerat ac',
    ceo: 'Rem a quaerat a perf',
    phone: '+1 (927) 651-2333',
    address: 'Tenetur ea quia pari'
  }
];

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const companiesPerPage = 10;

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = filteredCompanies.slice(indexOfFirstCompany, indexOfLastCompany);
  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);

  // Handle edit
  const handleEdit = (id: number) => {
    console.log('Edit company with id:', id);
  };

  // Handle delete
  const handleDelete = (id: number) => {
    setCompanies(companies.filter(company => company.id !== id));
    toast.success("Company deleted successfully");
  };

  // Handle save for new company
  const handleSaveCompany = (company: Company) => {
    setCompanies([...companies, company]);
    setIsDialogOpen(false);
    toast.success("Company created successfully");
  };

  // Handle cancel for company form
  const handleCancelCompany = () => {
    setIsDialogOpen(false);
  };

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Companies</h1>
      </div>

      <div className="flex justify-between mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-950">
              <Plus className="mr-2 h-4 w-4" />
              Create Company
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[900px]">
            <DialogHeader>
              <DialogTitle>Create Company</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new company. You can create up to 2 companies at once.
              </DialogDescription>
            </DialogHeader>
            <CreateCompanyForm 
              onSave={handleSaveCompany} 
              onCancel={handleCancelCompany} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Sr.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>CEO</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Office Address</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCompanies.map((company, index) => (
              <TableRow key={company.id}>
                <TableCell>{indexOfFirstCompany + index + 1}</TableCell>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.email}</TableCell>
                <TableCell>{company.industry}</TableCell>
                <TableCell>{company.ceo}</TableCell>
                <TableCell>{company.phone}</TableCell>
                <TableCell>{company.address}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(company.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(company.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
              
              {pageNumbers.map(number => (
                <PaginationItem key={number}>
                  <PaginationLink
                    isActive={currentPage === number}
                    onClick={() => setCurrentPage(number)}
                  >
                    {number}
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

      <div className="mt-4 text-sm text-gray-500">
        Showing {indexOfFirstCompany + 1} to {Math.min(indexOfLastCompany, filteredCompanies.length)} of {filteredCompanies.length} results
      </div>
    </div>
  );
};

export default CompaniesPage;
