import React from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Info } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">{title}</h2>
      
      <DataCard title="Coming Soon" variant="glass" icon={<Info size={24} />}>
        <div className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-4">This section is under development</h3>
          <p className="text-gray-600">
            The {title} page is currently being developed and will be available soon.
          </p>
        </div>
      </DataCard>
    </div>
  );
}
