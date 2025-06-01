import React from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { insightRecommendationData } from '@/utils/clientDashboardData';
import {
  LineChart,
  BarChart2,
  Target,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Lightbulb,
  Mail
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailListView } from '@/components/dashboard/EmailListView';
import { convertInsightDataToEmailFormat } from '@/utils/emailUtils';

interface InsightItemProps {
  number: string;
  title: string;
  content: React.ReactNode;
  color: string;
}

const InsightItem: React.FC<InsightItemProps> = ({ number, title, content, color }) => {
  const getIcon = (title: string) => {
    switch (title) {
      case 'Sentiment Analysis':
        return <LineChart className="h-8 w-8 text-white" />;
      case 'Competitive Trend':
        return <TrendingUp className="h-8 w-8 text-white" />;
      case 'Government Policy Watch':
        return <AlertTriangle className="h-8 w-8 text-white" />;
      case 'CEO Performance Analysis':
        return <UserCheck className="h-8 w-8 text-white" />;
      case 'Analyst Advisory':
        return <Lightbulb className="h-8 w-8 text-white" />;
      default:
        return <BarChart2 className="h-8 w-8 text-white" />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 border rounded-lg overflow-hidden mb-6">
      <div
        className="flex items-center justify-center p-6 md:w-24"
        style={{ backgroundColor: color }}
      >
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold text-white">{number}</div>
          <div className="mt-2">{getIcon(title)}</div>
        </div>
      </div>
      <div className="p-6 flex-1">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div className="text-gray-700">{content}</div>
      </div>
    </div>
  );
};

export function OutcomeInsightsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Insight / Recommendation / Suggestion</h2>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span>Insights & Recommendations</span>
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Insights Inbox</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <InsightItem
            number="01"
            title="Sentiment Analysis"
            color="#0066cc"
            content={
              <div className="space-y-4">
                <p>
                  The brand's media coverage for the month showed 98% positive sentiment, 1% negative sentiment, and
                  1% neutral sentiment, indicating strong public approval and a widely favorable media presence. This
                  success was driven by strategic media engagements, compelling storytelling, and active participation in
                  key industry events. The consistently positive reception reinforced the brand's credibility, industry
                  leadership, and reputation. To sustain this momentum, ongoing media visibility, thought leadership
                  initiatives, and impactful brand activities will be essential.
                </p>
                <p>
                  First Bank led media coverage in the banking sector with major developments, including the inauguration of
                  an automated branch in Lekki, a harassment claim of N450 million naira from his security guard,
                  and the bank's response refuting the fraud allegations as unfounded and false. UBA followed closely with
                  significant highlights, such as discussions on gender parity at the UBA Business Series and plans to host
                  special business series in celebration of International Women's Day 2023.Wema Bank ranked third in media
                  coverage, featuring key initiatives like 80 customers emerging as winners in the 5 for 5 Promo and its plan to
                  raise N149.3 billion through a rights issue.
                </p>
              </div>
            }
          />

          <InsightItem
            number="02"
            title="Competitive Trend"
            color="#0066cc"
            content={
              <div>
                <p>
                  As reported by <a href="#" className="text-blue-600 hover:underline">Thenationonlineng.net</a>, the Central Bank of Nigeria (CBN) has introduced detailed
                  guidelines for the interbank foreign exchange (FX) trading system via FEFMS, establishing a minimum
                  tradable amount of $100,000 with incremental clip sizes of $50,000. This framework is designed to
                  enhance transparency and efficiency in FX transactions. Additionally, the CBN has implemented strategic
                  policy measures, such as increasing forex supply and tightening monetary regulations, to stabilize the FX
                  market, strengthen the naira, and bolster foreign reserves.
                </p>
              </div>
            }
          />

          <InsightItem
            number="03"
            title="Government Policy Watch"
            color="#0066cc"
            content={
              <div>
                <p>
                  In March, the CEOs of First Bank, Wema Bank, and UBA led in media prominence, gaining notable
                  visibility across major media outlets. Their strong presence reinforced both personal and brand
                  credibility, highlighting their leadership and influence within the industry. This exposure further elevated
                  their respective banks' profiles, emphasizing their commitment to innovation, strategic growth, and
                  excellence. A strong media presence continues to be instrumental in enhancing brand reputation and
                  demonstrating industry leadership. We recommend regular participation in high-profile industry events,
                  media interviews, and thought leadership pieces to maintain and strengthen the brand CEO's presence.
                </p>
              </div>
            }
          />

          <InsightItem
            number="04"
            title="CEO Performance Analysis"
            color="#0066cc"
            content={
              <div>
                <p>
                  In response to the Central Bank of Nigeria's (CBN) recent reforms aimed at stabilizing the naira and
                  boosting investor confidence, we recommend that the brand strengthen its capital base to stay
                  competitive and resilient in the evolving financial landscape. This can be achieved by exploring strategic
                  partnerships, mergers, or acquisitions to enhance financial capacity and expand market presence, as
                  well as developing innovative financial products and services tailored to evolving consumer needs to
                  foster customer loyalty.
                </p>
              </div>
            }
          />

          <InsightItem
            number="05"
            title="Analyst Advisory"
            color="#0066cc"
            content={
              <div>
                <p>
                  In response to the Central Bank of Nigeria's (CBN) recent reforms aimed at stabilizing the naira and
                  boosting investor confidence, we recommend that the brand strengthen its capital base to stay
                  competitive and resilient in the evolving financial landscape. This can be achieved by exploring strategic
                  partnerships, mergers, or acquisitions to enhance financial capacity and expand market presence, as
                  well as developing innovative financial products and services tailored to evolving consumer needs to
                  foster customer loyalty.
                </p>
              </div>
            }
          />
        </TabsContent>

        <TabsContent value="emails">
          <EmailListView
            emails={convertInsightDataToEmailFormat()}
            title="Insights & Recommendations Inbox"
            description="Latest insights and recommendations for your business"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
