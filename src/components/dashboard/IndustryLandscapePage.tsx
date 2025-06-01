import React from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Target, Mail } from 'lucide-react';
import { industryLandscapeData } from '@/utils/clientDashboardData';
import { EmailListView } from '@/components/dashboard/EmailListView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { convertIndustryDataToEmailFormat } from '@/utils/emailUtils';

interface IndustryInsightProps {
  source: string;
  content: React.ReactNode;
}

const IndustryInsight: React.FC<IndustryInsightProps> = ({ source, content }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 border rounded-lg overflow-hidden mb-6">
      <div className="p-6 md:w-32 bg-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Target className="h-12 w-12 text-blue-600" />
        </div>
      </div>
      <div className="p-6 flex-1">
        <div className="text-gray-700 mb-2">
          <span className="font-medium">According to </span>
          <a href="#" className="text-blue-600 hover:underline">{source}</a>
          <span>:</span>
        </div>
        <div className="text-gray-700">{content}</div>
      </div>
    </div>
  );
};

export function IndustryLandscapePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Industry Landscape Overview – Nigerian Financial Sector Highlights</h2>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>Industry Insights</span>
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Industry Updates Inbox</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <IndustryInsight
            source="Thisdaylive.com"
            content={
              <p>
                the Central Bank of Nigeria (CBN) is strengthening regulatory oversight in Nigeria's
                financial sector by enforcing stricter compliance measures, particularly in anti-money laundering (AML) and
                counter-financing of terrorism (CFT). At a recent workshop, experts emphasized the need for stronger KYC, KYB, and
                KYT protocols to curb financial crimes, highlighting the risks of illicit financial flows. CBN Governor Olayemi Cardoso
                reaffirmed the commitment to aligning with global banking standards, enhancing transparency, and reinforcing trust in
                the financial system. These measures reflect a broader effort to fortify regulatory compliance, enhance transparency,
                and maintain Nigeria's position in the global financial landscape.
              </p>
            }
          />

          <IndustryInsight
            source="Thenationonlineng.net"
            content={
              <p>
                the Central Bank of Nigeria (CBN) has named 16 new directors across
                key departments to improve regulatory oversight and operational efficiency. These appointments span critical areas
                such as Banking Supervision, Payment Systems, and Consumer Protection, underscoring the CBN's dedication to
                reinforcing compliance, combating financial fraud, and enhancing consumer grievance resolution. This strategic
                leadership restructuring is designed to strengthen the financial sector's stability in response to evolving economic
                challenges.
              </p>
            }
          />

          <IndustryInsight
            source="Dailytrust.com"
            content={
              <p>
                the Central Bank of Nigeria (CBN) reported a decrease in currency circulation to
                N5.03 trillion. The last notable decline occurred in January 2024, when circulation marginally dropped from N3.653
                trillion to N3.650 trillion. This reduction reflects the CBN's ongoing efforts to manage liquidity and stabilize the nation's
                financial system.
              </p>
            }
          />
        </TabsContent>

        <TabsContent value="emails">
          <EmailListView
            emails={convertIndustryDataToEmailFormat()}
            title="Industry Updates Inbox"
            description="Latest financial sector updates and insights"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
