
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Publication {
  id: number;
  name: string;
}

interface CreatePublicationFormProps {
  onSave: (publication: Publication) => void;
  onCancel: () => void;
}

export const CreatePublicationForm: React.FC<CreatePublicationFormProps> = ({
  onSave,
  onCancel
}) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }
    
    // Create new publication with generated ID
    const newPublication: Publication = {
      id: Date.now(), // Use timestamp as a simple ID generator
      name
    };
    
    onSave(newPublication);
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
          placeholder="Enter publication name"
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
