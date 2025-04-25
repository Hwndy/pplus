import React from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { brandMediaAnalysisData } from '@/utils/clientDashboardData';
import { BarChart2 } from 'lucide-react';
import { ThematicDistributionBreakdown } from './ThematicDistributionBreakdown';
import { thematicDistributionData } from '@/utils/thematicDistributionData';

export function MediaDistributionPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Distribution of Media Activities</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <DataCard title="Thematic Distribution of Media Activities" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={brandMediaAnalysisData.thematicDistribution}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 35]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="value" fill="#0088FE" name="Percentage" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </DataCard>

        <ThematicDistributionBreakdown items={thematicDistributionData} />
      </div>
    </div>
  );
}
