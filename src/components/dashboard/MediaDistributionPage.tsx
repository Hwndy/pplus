import React, { useState } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { UniversalFilter, FilterOption, FilterValues } from '@/components/ui/UniversalFilter';
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
import { BarChart2, Activity } from 'lucide-react';
import { ThematicDistributionBreakdown } from './ThematicDistributionBreakdown';
import { thematicDistributionData } from '@/utils/thematicDistributionData';

export function MediaDistributionPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  // Filter options for Media Distribution
  const filterOptions: FilterOption[] = [
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange',
      placeholder: 'Select date range'
    },
    {
      key: 'thematicArea',
      label: 'Thematic Area',
      type: 'multiselect',
      options: [
        { value: 'financial_services', label: 'Financial Services' },
        { value: 'banking', label: 'Banking' },
        { value: 'investment', label: 'Investment' },
        { value: 'insurance', label: 'Insurance' },
        { value: 'fintech', label: 'Fintech' },
        { value: 'regulation', label: 'Regulation' }
      ]
    },
    {
      key: 'mediaType',
      label: 'Media Type',
      type: 'select',
      options: [
        { value: 'online', label: 'Online Media' },
        { value: 'print', label: 'Print Media' }
      ]
    },
    {
      key: 'activityType',
      label: 'Activity Type',
      type: 'multiselect',
      options: [
        { value: 'news', label: 'News Coverage' },
        { value: 'interview', label: 'Interviews' },
        { value: 'press_release', label: 'Press Releases' },
        { value: 'opinion', label: 'Opinion Pieces' },
        { value: 'analysis', label: 'Analysis' }
      ]
    }
  ];

  const resetFilters = () => {
    setFilterValues({});
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Beautiful Header Section */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Distribution of Media Activities</h1>
            <p className="text-orange-100 text-lg">Thematic analysis and media activity breakdown</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Activity size={32} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <UniversalFilter
        filters={filterOptions}
        values={filterValues}
        onChange={setFilterValues}
        onReset={resetFilters}
      />

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
                <YAxis dataKey="name" type="category" width={0} />
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
