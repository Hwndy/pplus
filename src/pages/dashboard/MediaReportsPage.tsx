
import { DataCard } from '@/components/ui/DataCard';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Filter, BarChart, TrendingUp, Users, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { dashboardSummary } from '@/utils/mockData';

export default function MediaReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Media Reports</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channel Breakdown</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <DataCard title="Media Mentions by Month" variant="glass" icon={<TrendingUp size={24} />}>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Mentions</TableHead>
                      <TableHead className="text-right">Growth</TableHead>
                      <TableHead className="text-right">Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardSummary.mentionTrend.map((item, index) => {
                      const prevValue = index > 0 ? dashboardSummary.mentionTrend[index - 1].value : item.value;
                      const growth = index > 0 ? ((item.value - prevValue) / prevValue * 100).toFixed(1) : '0.0';
                      const isPositive = parseFloat(growth) >= 0;

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
                            <Badge variant={isPositive ? 'default' : 'destructive'}>
                              {isPositive ? '↗' : '↘'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </DataCard>

            <DataCard title="Media Channel Distribution" variant="glass" icon={<Users size={24} />}>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Channel</TableHead>
                      <TableHead className="text-right">Mentions</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardSummary.mediaBreakdown.map((item, index) => {
                      const total = dashboardSummary.mediaBreakdown.reduce((sum, channel) => sum + channel.value, 0);
                      const percentage = ((item.value / total) * 100).toFixed(1);
                      const isHighPerforming = parseFloat(percentage) > 20;

                      return (
                        <TableRow key={item.name}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">{item.value.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{percentage}%</TableCell>
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
          
          <DataCard 
            title="Key Performance Indicators" 
            description="Summary of your media performance metrics"
            variant="glass"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Total Media Mentions</div>
                <div className="text-3xl font-bold">{dashboardSummary.totalMentions.toLocaleString()}</div>
                <div className="text-sm text-green-600">+12% vs. previous period</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Audience Reach</div>
                <div className="text-3xl font-bold">{(dashboardSummary.totalReach / 1000000).toFixed(1)}M</div>
                <div className="text-sm text-green-600">+8% vs. previous period</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Sentiment Score</div>
                <div className="text-3xl font-bold">{(dashboardSummary.averageSentiment * 100).toFixed(0)}%</div>
                <div className="text-sm text-green-600">+5% vs. previous period</div>
              </div>
            </div>
          </DataCard>
        </TabsContent>
        
        <TabsContent value="channels">
          <DataCard 
            title="Media Channel Performance" 
            description="Detailed breakdown of coverage by media type"
            variant="glass"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Channel</th>
                    <th className="text-right py-3 px-4">Mentions</th>
                    <th className="text-right py-3 px-4">Reach</th>
                    <th className="text-right py-3 px-4">Engagement</th>
                    <th className="text-right py-3 px-4">Sentiment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">Twitter</td>
                    <td className="text-right py-3 px-4">420</td>
                    <td className="text-right py-3 px-4">1.2M</td>
                    <td className="text-right py-3 px-4">32K</td>
                    <td className="text-right py-3 px-4">68%</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">News Websites</td>
                    <td className="text-right py-3 px-4">380</td>
                    <td className="text-right py-3 px-4">2.4M</td>
                    <td className="text-right py-3 px-4">18K</td>
                    <td className="text-right py-3 px-4">72%</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">Television</td>
                    <td className="text-right py-3 px-4">320</td>
                    <td className="text-right py-3 px-4">5.8M</td>
                    <td className="text-right py-3 px-4">N/A</td>
                    <td className="text-right py-3 px-4">65%</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">Facebook</td>
                    <td className="text-right py-3 px-4">280</td>
                    <td className="text-right py-3 px-4">920K</td>
                    <td className="text-right py-3 px-4">24K</td>
                    <td className="text-right py-3 px-4">62%</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">Blogs</td>
                    <td className="text-right py-3 px-4">220</td>
                    <td className="text-right py-3 px-4">480K</td>
                    <td className="text-right py-3 px-4">8K</td>
                    <td className="text-right py-3 px-4">58%</td>
                  </tr>
                  <tr className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">Instagram</td>
                    <td className="text-right py-3 px-4">180</td>
                    <td className="text-right py-3 px-4">760K</td>
                    <td className="text-right py-3 px-4">42K</td>
                    <td className="text-right py-3 px-4">78%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DataCard>
        </TabsContent>
        
        <TabsContent value="sentiment">
          <DataCard 
            title="Sentiment Analysis" 
            description="Analysis of media sentiment towards your brand"
            variant="glass"
          >
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                  <div className="text-sm font-medium mb-2">Positive Mentions</div>
                  <div className="text-3xl font-bold">{(dashboardSummary.averageSentiment * dashboardSummary.totalMentions).toFixed(0)}</div>
                  <div className="text-sm text-green-600">67% of total</div>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900/20">
                  <div className="text-sm font-medium mb-2">Neutral Mentions</div>
                  <div className="text-3xl font-bold">418</div>
                  <div className="text-sm text-muted-foreground">25% of total</div>
                </div>
                
                <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                  <div className="text-sm font-medium mb-2">Negative Mentions</div>
                  <div className="text-3xl font-bold">134</div>
                  <div className="text-sm text-red-600">8% of total</div>
                </div>
              </div>
              
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
                    {[
                      { date: 'Jan', positive: 350, neutral: 150, negative: 50 },
                      { date: 'Feb', positive: 320, neutral: 120, negative: 60 },
                      { date: 'Mar', positive: 380, neutral: 130, negative: 40 },
                      { date: 'Apr', positive: 420, neutral: 140, negative: 45 },
                      { date: 'May', positive: 400, neutral: 130, negative: 50 },
                      { date: 'Jun', positive: 450, neutral: 140, negative: 30 },
                    ].map((item) => {
                      const total = item.positive + item.neutral + item.negative;
                      const sentimentScore = ((item.positive - item.negative) / total * 100).toFixed(1);
                      const isPositiveOverall = parseFloat(sentimentScore) > 0;

                      return (
                        <TableRow key={item.date}>
                          <TableCell className="font-medium">{item.date}</TableCell>
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
            </div>
          </DataCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
