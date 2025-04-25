import React from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Stat } from '@/components/ui/Stat';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { executiveSummaryData } from '@/utils/clientDashboardData';
import { BarChart2, Globe, Newspaper, ThumbsUp, Minus, ThumbsDown } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function ExecutiveSummaryPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Executive Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <DataCard title="Total media mentions" variant="glass" icon={<BarChart2 size={24} />} className="lg:col-span-1">
          <Stat
            label="Total Media"
            value={executiveSummaryData.totalMedia}
            subtitle="mentions"
          />
        </DataCard>
        
        <DataCard title="Brand media reputation score" variant="glass" icon={<BarChart2 size={24} />} className="lg:col-span-1">
          <Stat
            label="Reputation Score"
            value={executiveSummaryData.brandMediaReputationScore}
            subtitle="out of 1.0"
          />
        </DataCard>
        
        <DataCard title="Brand exposure in local media" variant="glass" icon={<Newspaper size={24} />} className="lg:col-span-1">
          <Stat
            label="Local Media"
            value={executiveSummaryData.brandExposureLocalMedia}
            subtitle="mentions"
          />
        </DataCard>
        
        <DataCard title="Brand exposure in International media" variant="glass" icon={<Globe size={24} />} className="lg:col-span-1">
          <Stat
            label="International Media"
            value={executiveSummaryData.brandExposureInternationalMedia}
            subtitle="mentions"
          />
        </DataCard>
        
        <DataCard title="Positive media exposure" variant="glass" icon={<ThumbsUp size={24} />} className="lg:col-span-1">
          <Stat
            label="Positive"
            value={executiveSummaryData.positiveMediaExposure}
            subtitle="mentions"
          />
        </DataCard>
        
        <DataCard title="Neutral media exposure" variant="glass" icon={<Minus size={24} />} className="lg:col-span-1">
          <Stat
            label="Neutral"
            value={executiveSummaryData.neutralMediaExposure}
            subtitle="mentions"
          />
        </DataCard>
        
        <DataCard title="Negative media exposure" variant="glass" icon={<ThumbsDown size={24} />} className="lg:col-span-1">
          <Stat
            label="Negative"
            value={executiveSummaryData.negativeMediaExposure}
            subtitle="mentions"
          />
        </DataCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard title="Language Distribution" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={executiveSummaryData.languageDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {executiveSummaryData.languageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DataCard>

        <DataCard title="Media Vehicle Distribution" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={executiveSummaryData.mediaVehicleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {executiveSummaryData.mediaVehicleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DataCard>
      </div>
    </div>
  );
}
