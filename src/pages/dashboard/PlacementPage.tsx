
import React, { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/DataTable';
import { CreatePlacementForm } from '@/components/admin/CreatePlacementForm';
import { toast } from 'sonner';

interface Placement {
  id: number;
  name: string;
}

const mockPlacements: Placement[] = [
  { id: 1, name: 'Online News Site1' },
  { id: 2, name: 'Advertorial' },
  { id: 3, name: 'Feature' },
  { id: 4, name: 'Interview' },
  { id: 5, name: 'Opinion' },
  { id: 6, name: 'Video' },
  { id: 7, name: 'News' },
  { id: 8, name: 'Photo' },
];

const PlacementPage = () => {
  const [placements, setPlacements] = useState<Placement[]>(mockPlacements);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPlacement, setCurrentPlacement] = useState<Placement | null>(null);

  const columns = [
    {
      accessorKey: 'id',
      header: 'Sr.',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }: any) => {
        const placement = row.original;
        
        return (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleEdit(placement)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleDelete(placement.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleDelete = (id: number) => {
    setPlacements(placements.filter(p => p.id !== id));
    toast.success('Placement deleted successfully');
  };

  const handleEdit = (placement: Placement) => {
    setCurrentPlacement(placement);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setCurrentPlacement(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleSave = (placement: Placement) => {
    if (isEditMode) {
      setPlacements(placements.map(p => p.id === placement.id ? placement : p));
      toast.success('Placement updated successfully');
    } else {
      setPlacements([...placements, placement]);
      toast.success('Placement created successfully');
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Placements</h1>
        <Button 
          onClick={handleCreate}
          className="bg-indigo-950"
        >
          Create Placement
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <DataTable 
          columns={columns} 
          data={placements} 
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Placement' : 'Create Placement'}</DialogTitle>
          </DialogHeader>
          <CreatePlacementForm 
            onSave={handleSave} 
            onCancel={() => setIsDialogOpen(false)} 
            initialData={currentPlacement}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlacementPage;
