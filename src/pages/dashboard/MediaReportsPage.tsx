
import { DataCard } from '@/components/ui/DataCard';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Filter, BarChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardSummary } from '@/utils/mockData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
            <DataCard title="Media Mentions by Month" variant="glass" icon={<BarChart size={24} />}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dashboardSummary.mentionTrend}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorMentions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)' }} 
                      formatter={(value) => [`${value} mentions`, 'Media Mentions']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#0088FE"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMentions)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </DataCard>

            <DataCard title="Media Channel Distribution" variant="glass" icon={<BarChart size={24} />}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardSummary.mediaBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dashboardSummary.mediaBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
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
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { date: 'Jan', positive: 350, neutral: 150, negative: 50 },
                      { date: 'Feb', positive: 320, neutral: 120, negative: 60 },
                      { date: 'Mar', positive: 380, neutral: 130, negative: 40 },
                      { date: 'Apr', positive: 420, neutral: 140, negative: 45 },
                      { date: 'May', positive: 400, neutral: 130, negative: 50 },
                      { date: 'Jun', positive: 450, neutral: 140, negative: 30 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="positive"
                      stroke="#4ade80"
                      fillOpacity={1}
                      fill="url(#colorPositive)"
                      stackId="1"
                      name="Positive"
                    />
                    <Area
                      type="monotone"
                      dataKey="neutral"
                      stroke="#94a3b8"
                      fillOpacity={1}
                      fill="url(#colorNeutral)"
                      stackId="1"
                      name="Neutral"
                    />
                    <Area
                      type="monotone"
                      dataKey="negative"
                      stroke="#f87171"
                      fillOpacity={1}
                      fill="url(#colorNegative)"
                      stackId="1"
                      name="Negative"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </DataCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
