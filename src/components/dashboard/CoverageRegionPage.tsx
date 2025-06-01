import React, { useState } from 'react';
import { SocialStatsRegionalCoverage } from './SocialStatsRegionalCoverage';
import { socialStatsData } from '@/utils/thematicDistributionData';
import { UniversalFilter, FilterOption, FilterValues } from '@/components/ui/UniversalFilter';
import { Globe, MapPin } from 'lucide-react';

export function CoverageRegionPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  // Filter options for Coverage by Region
  const filterOptions: FilterOption[] = [
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange',
      placeholder: 'Select date range'
    },
    {
      key: 'region',
      label: 'Region',
      type: 'multiselect',
      options: [
        { value: 'lagos', label: 'Lagos' },
        { value: 'abuja', label: 'Abuja' },
        { value: 'kano', label: 'Kano' },
        { value: 'port_harcourt', label: 'Port Harcourt' },
        { value: 'ibadan', label: 'Ibadan' },
        { value: 'benin', label: 'Benin' },
        { value: 'kaduna', label: 'Kaduna' }
      ]
    },
    {
      key: 'platform',
      label: 'Social Platform',
      type: 'multiselect',
      options: [
        { value: 'facebook', label: 'Facebook' },
        { value: 'twitter', label: 'Twitter/X' },
        { value: 'instagram', label: 'Instagram' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'youtube', label: 'YouTube' },
        { value: 'tiktok', label: 'TikTok' }
      ]
    },
    {
      key: 'coverageType',
      label: 'Coverage Type',
      type: 'select',
      options: [
        { value: 'social', label: 'Social Media Coverage' },
        { value: 'traditional', label: 'Traditional Media Coverage' }
      ]
    },
    {
      key: 'engagement',
      label: 'Engagement Level',
      type: 'select',
      options: [
        { value: 'high', label: 'High Engagement' },
        { value: 'medium', label: 'Medium Engagement' },
        { value: 'low', label: 'Low Engagement' }
      ]
    }
  ];

  const resetFilters = () => {
    setFilterValues({});
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Beautiful Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Coverage by Region</h1>
            <p className="text-green-100 text-lg">Regional media coverage and social media analytics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Globe size={32} className="text-white" />
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

      <SocialStatsRegionalCoverage
        socialStats={socialStatsData.socialPlatforms}
        regionalCoverage={socialStatsData.regionalCoverage}
      />
    </div>
  );
}
