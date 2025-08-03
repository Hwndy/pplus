
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
import { Pencil, Trash2, Search, Loader2, RefreshCw } from 'lucide-react';
import { CreatePublicationForm } from '@/components/admin/CreatePublicationForm';
import { toast } from 'sonner';
import { usePublications, useDeletePublication } from '@/hooks/useApi';
import { apiService } from '@/services/apiService';

// Define the Publication interface to match API response
interface Publication {
  id: string;
  name: string;
  type: string;
  website?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const PublicationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const publicationsPerPage = 10;

  // API hooks
  const { data: publications = [], loading, error, refetch } = usePublications({
    page: currentPage,
    limit: publicationsPerPage,
    search: searchTerm
  });
  const { mutate: deletePublication, loading: deleting } = useDeletePublication();

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil((publications?.length || 0) / publicationsPerPage);
  const indexOfLastPublication = currentPage * publicationsPerPage;
  const indexOfFirstPublication = indexOfLastPublication - publicationsPerPage;
  const currentPublications = publications?.slice(indexOfFirstPublication, indexOfLastPublication) || [];

  // Handle edit
  const handleEdit = (publication: Publication) => {
    try {
      console.log('Edit publication with id:', publication.id);
      setEditingPublication(publication);
      setIsEditDialogOpen(true);
      // TODO: Implement edit functionality when form is updated
      toast.info(`Edit functionality for ${publication.name} - Opening edit form...`);
    } catch (error) {
      console.error('Error opening edit form:', error);
      toast.error('Failed to open edit form');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting publication with id:', id);
      await deletePublication(id);
      toast.success("Publication deleted successfully");
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Error deleting publication:', error);
      toast.error("Failed to delete publication");
    }
  };

  // Handle save for new publication
  const handleSavePublication = async (publicationData: { name: string; type?: string; website?: string; description?: string }) => {
    try {
      console.log('Creating publication:', publicationData);

      // Call API to create publication
      const response = await apiService.createPublication({
        name: publicationData.name,
        type: publicationData.type || 'print',
        website: publicationData.website,
        description: publicationData.description
      });

      console.log('Publication created successfully:', response);
      setIsDialogOpen(false);
      toast.success("Publication created successfully");
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Error creating publication:', error);
      toast.error("Failed to create publication");
    }
  };

  // Handle cancel for publication form
  const handleCancelPublication = () => {
    setIsDialogOpen(false);
    setEditingPublication(null);
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setEditingPublication(null);
  };

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Publications</h1>
          <p className="text-gray-600 mt-1">Manage publication sources and media outlets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">Failed to load publications. Please try again.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </div>
      )}

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
              <TableHead className="w-14">Sn.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading publications...
                  </div>
                </TableCell>
              </TableRow>
            ) : currentPublications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-gray-500">
                    {searchTerm ? 'No publications found matching your search.' : 'No publications found.'}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentPublications.map((publication, index) => (
                <TableRow key={publication.id}>
                  <TableCell>{indexOfFirstPublication + index + 1}</TableCell>
                  <TableCell className="font-medium">{publication.name}</TableCell>
                  <TableCell>
                    <span className="capitalize">{publication.type || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    {publication.website ? (
                      <a
                        href={publication.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {publication.website}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {publication.createdAt ? new Date(publication.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(publication)}
                        title="Edit publication"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(publication.id)}
                        disabled={deleting}
                        title="Delete publication"
                      >
                        {deleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
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
        Showing {indexOfFirstPublication + 1} to {Math.min(indexOfLastPublication, publications.length)} of {publications.length} results
      </div>
    </div>
  );
};

export default PublicationsPage;
