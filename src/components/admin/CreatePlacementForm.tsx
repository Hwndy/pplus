
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Placement {
  id: number;
  name: string;
}

interface CreatePlacementFormProps {
  onSave: (placement: Placement) => void;
  onCancel: () => void;
  initialData?: Placement | null;
}

export const CreatePlacementForm: React.FC<CreatePlacementFormProps> = ({
  onSave,
  onCancel,
  initialData
}) => {
  const [name, setName] = useState('');

  // Initialize form with data if in edit mode
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }
    
    // Update or create placement based on whether initialData exists
    const placement: Placement = {
      id: initialData?.id ?? Date.now(), // Use existing ID or generate a new one
      name
    };
    
    onSave(placement);
    // Reset form
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter placement name"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Discard
        </Button>
        <Button 
          type="submit"
          className="bg-indigo-950"
        >
          Save
        </Button>
      </div>
    </form>
  );
};
