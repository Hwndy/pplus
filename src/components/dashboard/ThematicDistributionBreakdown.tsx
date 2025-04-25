import React from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { BarChart2 } from 'lucide-react';

// Define the types for our thematic items
interface ThematicItem {
  id: string;
  number: string;
  title: string;
  color: string;
  bulletPoints: string[];
}

interface ThematicDistributionBreakdownProps {
  items: ThematicItem[];
}

export function ThematicDistributionBreakdown({ items }: ThematicDistributionBreakdownProps) {
  return (
    <DataCard title="Thematic Distribution Breakdown" variant="glass" icon={<BarChart2 size={24} />}>
      <div className="p-4">
        {items.map((item) => (
          <div key={item.id} className="mb-4 border rounded-md overflow-hidden">
            <div className="flex">
              <div 
                className="w-16 flex items-center justify-center p-4 text-2xl font-bold" 
                style={{ backgroundColor: item.color }}
              >
                {item.number}
              </div>
              <div className="p-4 bg-muted/20 flex-1">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {item.bulletPoints.map((point, index) => (
                    <li key={index} className="text-sm">{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DataCard>
  );
}
