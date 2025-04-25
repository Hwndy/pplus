import React from 'react';
import { SocialStatsRegionalCoverage } from './SocialStatsRegionalCoverage';
import { socialStatsData } from '@/utils/thematicDistributionData';

export function CoverageRegionPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Coverage by Region</h2>
      
      <SocialStatsRegionalCoverage 
        socialStats={socialStatsData.socialPlatforms}
        regionalCoverage={socialStatsData.regionalCoverage}
      />
    </div>
  );
}
