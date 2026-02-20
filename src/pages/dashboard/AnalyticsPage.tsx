
import { DataCard } from '@/components/ui/DataCard';
import { Button } from '@/components/ui/button';
import { Download, Filter, Calendar, BarChart2, TrendingUp, Users, Eye, ThumbsUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
// import { dashboardSummary } from '@/utils/mockData';

// Sample sentiment data
const sentimentData = [
  { month: 'Jan', positive: 65, neutral: 25, negative: 10 },
  { month: 'Feb', positive: 59, neutral: 30, negative: 11 },
  { month: 'Mar', positive: 80, neutral: 15, negative: 5 },
  { month: 'Apr', positive: 81, neutral: 12, negative: 7 },
  { month: 'May', positive: 56, neutral: 32, negative: 12 },
  { month: 'Jun', positive: 55, neutral: 35, negative: 10 },
  { month: 'Jul', positive: 60, neutral: 30, negative: 10 },
];

// Sample channel performance data
const channelData = [
  { name: 'Twitter', value: 1200 },
  { name: 'News Sites', value: 900 },
  { name: 'Television', value: 800 },
  { name: 'Facebook', value: 700 },
  { name: 'Instagram', value: 600 },
  { name: 'LinkedIn', value: 400 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">Analytics Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-indigo-200 hover:bg-indigo-50 transition-all">
            <Calendar className="mr-2 h-4 w-4 text-indigo-600" />
            Date Range
          </Button>
          <Button variant="outline" className="border-indigo-200 hover:bg-indigo-50 transition-all">
            <Filter className="mr-2 h-4 w-4 text-indigo-600" />
            Filter
          </Button>
          <Button className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4 bg-indigo-50 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="sentiment" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="channels" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Channel Performance</TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Trends & Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DataCard title="Media Mentions Trend" variant="glass" className="border-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Mentions</TableHead>
                      <TableHead className="text-right">Growth</TableHead>
                      <TableHead className="text-right">Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardSummary.mentionTrend.map((item, index) => {
                      const prevValue = index > 0 ? dashboardSummary.mentionTrend[index - 1].value : item.value;
                      const growth = index > 0 ? ((item.value - prevValue) / prevValue * 100).toFixed(1) : '0.0';
                      const isPositive = parseFloat(growth) >= 0;
                      const isHighPerforming = item.value > 150;

                      return (
                        <TableRow key={item.date}>
                          <TableCell className="font-medium">{item.date}</TableCell>
                          <TableCell className="text-right">{item.value.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                              {isPositive ? '+' : ''}{growth}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={isHighPerforming ? 'default' : 'secondary'}>
                              {isHighPerforming ? 'High' : 'Normal'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </DataCard>

            <DataCard title="Media Channel Distribution" variant="glass" icon={<Users size={24} className="text-indigo-600" />} className="border-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Channel</TableHead>
                      <TableHead className="text-right">Mentions</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                      <TableHead className="text-right">Reach</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardSummary.mediaBreakdown.map((item, index) => {
                      const total = dashboardSummary.mediaBreakdown.reduce((sum, channel) => sum + channel.value, 0);
                      const percentage = ((item.value / total) * 100).toFixed(1);
                      const isHighPerforming = parseFloat(percentage) > 20;
                      const estimatedReach = item.value * (Math.random() * 1000 + 500); // Mock reach calculation

                      return (
                        <TableRow key={item.name}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">{item.value.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{percentage}%</TableCell>
                          <TableCell className="text-right">{estimatedReach.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={isHighPerforming ? 'default' : 'secondary'}>
                              {isHighPerforming ? 'High' : 'Normal'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </DataCard>
          </div>
        </TabsContent>

        <TabsContent value="sentiment">
          <DataCard
            title="Sentiment Analysis Over Time"
            variant="glass"
            className="border-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
            description="Tracking sentiment trends across months"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Positive</TableHead>
                    <TableHead className="text-right">Neutral</TableHead>
                    <TableHead className="text-right">Negative</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Sentiment Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sentimentData.map((item) => {
                    const total = item.positive + item.neutral + item.negative;
                    const sentimentScore = ((item.positive - item.negative) / total * 100).toFixed(1);
                    const isPositiveOverall = parseFloat(sentimentScore) > 0;

                    return (
                      <TableRow key={item.month}>
                        <TableCell className="font-medium">{item.month}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-green-600">{item.positive}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-gray-600">{item.neutral}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-red-600">{item.negative}</span>
                        </TableCell>
                        <TableCell className="text-right font-medium">{total}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={isPositiveOverall ? 'default' : 'destructive'}>
                            {sentimentScore}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </DataCard>
        </TabsContent>

        <TabsContent value="channels">
          <DataCard
            title="Channel Performance Analysis"
            variant="glass"
            className="border-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
            description="Comparing performance across different media channels"
          >
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead className="text-right">Mentions</TableHead>
                    <TableHead className="text-right">Engagement Rate</TableHead>
                    <TableHead className="text-right">Reach</TableHead>
                    <TableHead className="text-right">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channelData.map((item, index) => {
                    const engagementRate = (Math.random() * 10 + 2).toFixed(1); // Mock engagement rate
                    const reach = item.value * (Math.random() * 2000 + 1000); // Mock reach calculation
                    const isHighPerforming = item.value > 80;

                    return (
                      <TableRow key={item.name}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">{item.value.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{engagementRate}%</TableCell>
                        <TableCell className="text-right">{reach.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={isHighPerforming ? 'default' : 'secondary'}>
                            {isHighPerforming ? 'High' : 'Normal'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </DataCard>
        </TabsContent>

        <TabsContent value="trends">
          <DataCard
            title="Trend Analysis & Forecasting"
            variant="glass"
            className="border-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
            description="Advanced analytics features coming soon"
          >
            <div className="p-8 text-center bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg">
              <div className="mb-6">
                <TrendingUp size={48} className="mx-auto text-indigo-400 opacity-50" />
              </div>
              <p className="text-gray-600 mb-6">Our trend analysis and forecasting features are currently in development. Be among the first to access these powerful tools.</p>
              <Button className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all">
                Request Early Access
              </Button>
            </div>
          </DataCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
