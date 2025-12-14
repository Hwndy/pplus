import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Pencil, Trash2, Search, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { CreatePublicationForm } from '@/components/admin/CreatePublicationForm';
import { useAuth } from '@/components/auth/AuthContext';

interface Publication {
  id: number;
  name: string;
  value: string;
  type?: string;
  website?: string;
  description?: string;
  createdAt?: string;
}

const PublicationsPage: React.FC = () => {
  const { token } = useAuth();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const pageSize = 10;

  const fetchPublications = async (page = 1, search = '') => {
    if (!token) {
      setError('No token provided');
      toast.error('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch(
        `https://pplus-5kdv.onrender.com/api/data-parameters/category/Publications?page=${page}&limit=${pageSize}&search=${encodeURIComponent(search)}`,
        { headers }
      );

      const result = await response.json();

      if (result.success) {
        const mediaMetrics = result.data.find((item: any) => item.name === 'Media Metrics');
        const publicationsCategory = mediaMetrics?.categories?.find((cat: any) => cat.name === 'Publications');
        const pubsArray = publicationsCategory?.values || [];

        const formattedPublications: Publication[] = pubsArray.map((pub: any) => ({
          id: pub.id,
          name: pub.value,
          value: pub.value,
          createdAt: pub.createdAt,
        }));

        setPublications(formattedPublications);

        const totalItems = pubsArray.length;
        setTotalPages(Math.ceil(totalItems / pageSize) || 1);
      } else {
        throw new Error(result.message || 'Failed to load publications');
      }
    } catch (err: any) {
      console.error('Error fetching publications:', err);
      setError(err.message || 'Something went wrong');
      setPublications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications(currentPage, searchTerm);
  }, [currentPage, searchTerm, token]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`https://pplus-5kdv.onrender.com/api/data-parameters/value/delete/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Publication deleted successfully');
        fetchPublications(currentPage, searchTerm);
      } else {
        throw new Error(result.message || 'Failed to delete publication');
      }
    } catch (err: any) {
      console.error('Error deleting publication:', err);
      toast.error(err.message || 'Failed to delete publication');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSavePublication = async (publicationData: Partial<Publication>) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('https://pplus-5kdv.onrender.com/api/data-parameters', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        throw new Error('Failed to load data parameters');
      }

      const mediaMetrics = result.data.find((item: any) => item.name === 'Media Metrics');
      if (!mediaMetrics) throw new Error('Media Metrics parameter not found');

      const publicationsCategory = mediaMetrics.categories?.find((cat: any) => cat.name === 'Publications');
      if (!publicationsCategory) throw new Error('Publications category not found');

      const url = editingPublication
        ? `https://pplus-5kdv.onrender.com/api/data-parameters/value/update/${editingPublication.id}`
        : `https://pplus-5kdv.onrender.com/api/data-parameters/value/create`;

      const payload = editingPublication
        ? { value: publicationData.name }
        : {
            dataParametersCategoryId: publicationsCategory.id,
            value: publicationData.name,
          };

      const saveResponse = await fetch(url, {
        method: editingPublication ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const saveResult = await saveResponse.json();

      if (saveResult.success) {
        toast.success(editingPublication ? 'Publication updated successfully' : 'Publication created successfully');
        setIsDialogOpen(false);
        setEditingPublication(null);
        fetchPublications(1, searchTerm);
      } else {
        throw new Error(saveResult.message || 'Failed to save publication');
      }
    } catch (err: any) {
      console.error('Error saving publication:', err);
      toast.error(err.message || 'Failed to save publication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Publications</h1>
          <p className="text-gray-600 mt-1">Manage publication sources and media outlets</p>
        </div>
        <Button variant="outline" onClick={() => fetchPublications(currentPage, searchTerm)} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchPublications(currentPage, searchTerm)} className="mt-2">
            Retry
          </Button>
        </div>
      )}

      <div className="flex justify-between mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search publications..." className="pl-8" value={searchTerm} onChange={handleSearch} />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingPublication(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-950">
              {editingPublication ? 'Edit Publication' : 'Create Publication'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingPublication ? 'Edit Publication' : 'Create Publication'}</DialogTitle>
            </DialogHeader>
            <CreatePublicationForm
              onSave={handleSavePublication}
              onCancel={() => { setIsDialogOpen(false); setEditingPublication(null); }}
              initialData={editingPublication || undefined}
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
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading publications...
                  </div>
                </TableCell>
              </TableRow>
            ) : publications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No publications found matching your search.' : 'No publications found.'}
                </TableCell>
              </TableRow>
            ) : (
              publications.map((publication, index) => (
                <TableRow key={publication.id}>
                  <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                  <TableCell className="font-medium">{publication.name}</TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>{publication.createdAt ? new Date(publication.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit"
                        onClick={() => {
                          setEditingPublication(publication);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(publication.id)}
                        disabled={deletingId === publication.id}
                        title="Delete"
                      >
                        {deletingId === publication.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
                <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink isActive={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default PublicationsPage;