import React from 'react';
import { PublicationsAnalysis } from './PublicationsAnalysis';
import { publicationsAnalysisData } from '@/utils/thematicDistributionData';

export function PublicationsAnalysisPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Publications & Spokespersons Analysis</h2>
      
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
