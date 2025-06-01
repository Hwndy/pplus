import React from 'react';
import { EmailListView } from '@/components/dashboard/EmailListView';
import { convertInsightDataToEmailFormat } from '@/utils/emailUtils';

export function OutcomeInsightsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Insights Inbox</h2>

      <EmailListView
        emails={convertInsightDataToEmailFormat()}
        title="Insights & Recommendations Inbox"
        description="Latest insights and recommendations for your business"
      />
    </div>
  );
}
