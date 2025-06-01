import React, { useState } from 'react';
import { PublicationsAnalysis } from './PublicationsAnalysis';
import { publicationsAnalysisData } from '@/utils/thematicDistributionData';
import { Newspaper, Users, BarChart3 } from 'lucide-react';
import { UniversalFilter, FilterOption, FilterValues } from '@/components/ui/UniversalFilter';

export function PublicationsAnalysisPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  // Filter options for Publications Analysis
  const filterOptions: FilterOption[] = [
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange',
      placeholder: 'Select date range'
    },
    {
      key: 'publicationType',
      label: 'Publication Type',
      type: 'select',
      options: [
        { value: 'print', label: 'Print Publications' },
        { value: 'online', label: 'Online Publications' }
      ]
    },
    {
      key: 'publication',
      label: 'Publication',
      type: 'multiselect',
      options: [
        { value: 'BusinessDay', label: 'BusinessDay' },
        { value: 'The Guardian', label: 'The Guardian' },
        { value: 'Punch', label: 'Punch' },
        { value: 'Vanguard', label: 'Vanguard' },
        { value: 'ThisDay', label: 'ThisDay' },
        { value: 'Premium Times', label: 'Premium Times' }
      ]
    },
    {
      key: 'reporter',
      label: 'Reporter',
      type: 'search',
      placeholder: 'Search reporters...'
    },
    {
      key: 'spokesperson',
      label: 'Spokesperson',
      type: 'multiselect',
      options: [
        { value: 'ceo', label: 'CEO' },
        { value: 'cfo', label: 'CFO' },
        { value: 'head_marketing', label: 'Head of Marketing' },
        { value: 'spokesperson', label: 'Company Spokesperson' }
      ]
    }
  ];

  const resetFilters = () => {
    setFilterValues({});
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Beautiful Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Publications & Spokespersons Analysis</h1>
            <p className="text-blue-100 text-lg">Media coverage insights and spokesperson performance metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Newspaper size={32} className="text-white" />
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

      <PublicationsAnalysis
        printPublications={publicationsAnalysisData.printPublications}
        onlinePublications={publicationsAnalysisData.onlinePublications}
        printReporters={publicationsAnalysisData.printReporters}
        onlineReporters={publicationsAnalysisData.onlineReporters}
        spokespersons={publicationsAnalysisData.spokespersons}
      />
    </div>
  );
}
