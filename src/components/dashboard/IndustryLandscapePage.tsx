import React from 'react';
import { EmailListView } from '@/components/dashboard/EmailListView';
import { convertIndustryDataToEmailFormat } from '@/utils/emailUtils';

export function IndustryLandscapePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Industry Updates Inbox</h2>

      <EmailListView
        emails={convertIndustryDataToEmailFormat()}
        title="Industry Updates Inbox"
        description="Latest financial sector updates and insights"
      />
    </div>
  );
}
