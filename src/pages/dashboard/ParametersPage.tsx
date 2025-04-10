
import { DataCard } from '@/components/ui/DataCard';
import { DataTable } from '@/components/ui/DataTable';
import { dataParameters } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { PlusCircle, Settings, FileEdit, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

// Define columns for data parameters table
const parameterColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Parameter Name',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.getValue('category') as string;
      return <span className="capitalize">{category}</span>;
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => (
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon">
          <FileEdit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }
];

export default function ParametersPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Parameters</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Parameter
        </Button>
      </div>
      
      <DataCard
        title="Media Monitoring Parameters"
        description="Configure monitoring parameters for data collection"
        variant="glass"
        icon={<Settings size={24} />}
      >
        <DataTable columns={parameterColumns} data={dataParameters} />
      </DataCard>
    </div>
  );
}
