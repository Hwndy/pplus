
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
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Pencil, Trash2, Search } from 'lucide-react';
import { CreatePublicationForm } from '@/components/admin/CreatePublicationForm';
import { toast } from 'sonner';

// Define the Publication interface
interface Publication {
  id: number;
  name: string;
}

// Mock data for publications
const mockPublications: Publication[] = [
  { id: 1, name: 'ThisDay' },
  { id: 2, name: 'BusinessDay' },
  { id: 3, name: 'Vanguard' },
  { id: 4, name: 'The Guardian' },
  { id: 5, name: 'The Punch' },
  { id: 6, name: 'The Nation' },
  { id: 7, name: 'Independent' },
  { id: 8, name: 'BusinessNews' },
  { id: 9, name: 'Leadership' },
  { id: 10, name: 'Blueprint' },
  { id: 11, name: 'Daily Trust' },
  { id: 12, name: 'Tribune' },
  { id: 13, name: 'The Sun' },
  { id: 14, name: 'Daily Times' },
  { id: 15, name: 'New Telegraph' },
  { id: 16, name: 'National Mirror' },
  { id: 17, name: 'The Authority' }
];

const PublicationsPage = () => {
  const [publications, setPublications] = useState<Publication[]>(mockPublications);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const publicationsPerPage = 10;

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Filter publications based on search term
  const filteredPublications = publications.filter(publication => 
    publication.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastPublication = currentPage * publicationsPerPage;
  const indexOfFirstPublication = indexOfLastPublication - publicationsPerPage;
  const currentPublications = filteredPublications.slice(indexOfFirstPublication, indexOfLastPublication);
  const totalPages = Math.ceil(filteredPublications.length / publicationsPerPage);

  // Handle edit
  const handleEdit = (id: number) => {
    console.log('Edit publication with id:', id);
    // Implement edit functionality here
  };

  // Handle delete
  const handleDelete = (id: number) => {
    setPublications(publications.filter(publication => publication.id !== id));
    toast.success("Publication deleted successfully");
  };

  // Handle save for new publication
  const handleSavePublication = (publication: Publication) => {
    setPublications([...publications, publication]);
    setIsDialogOpen(false);
    toast.success("Publication created successfully");
  };

  // Handle cancel for publication form
  const handleCancelPublication = () => {
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
        <h1 className="text-2xl font-bold">Publications</h1>
      </div>

      <div className="flex justify-between mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search publications..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-950">
              Create Publication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Publication</DialogTitle>
            </DialogHeader>
            <CreatePublicationForm 
              onSave={handleSavePublication} 
              onCancel={handleCancelPublication} 
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
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPublications.map((publication, index) => (
              <TableRow key={publication.id}>
                <TableCell>{indexOfFirstPublication + index + 1}</TableCell>
                <TableCell>{publication.name}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(publication.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(publication.id)}
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
        Showing {indexOfFirstPublication + 1} to {Math.min(indexOfLastPublication, filteredPublications.length)} of {filteredPublications.length} results
      </div>
    </div>
  );
};

export default PublicationsPage;
