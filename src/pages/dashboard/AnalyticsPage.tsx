
import { DataCard } from '@/components/ui/DataCard';
import { Button } from '@/components/ui/button';
import { Download, Filter, Calendar, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardSummary } from '@/utils/mockData';

// Enhanced color palette for better visual appeal
const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dashboardSummary.mentionTrend}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorMentions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', border: 'none' }} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={COLORS[0]}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMentions)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </DataCard>

            <DataCard title="Media Channel Distribution" variant="glass" icon={<PieChartIcon size={24} className="text-indigo-600" />} className="border-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md">
              <div className="h-80 relative p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardSummary.mediaBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius="90%"
                      innerRadius="50%"
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={3}
                      startAngle={90}
                      endAngle={450}
                    >
                      {dashboardSummary.mediaBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Percentage']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        border: 'none'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-2xl font-bold text-gray-800">100%</div>
                  <div className="text-xs text-gray-500 font-medium">Coverage</div>
                </div>
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
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sentimentData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      border: 'none'
                    }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="positive" stackId="a" fill={COLORS[2]} name="Positive" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="neutral" stackId="a" fill={COLORS[3]} name="Neutral" />
                  <Bar dataKey="negative" stackId="a" fill={COLORS[4]} name="Negative" />
                </BarChart>
              </ResponsiveContainer>
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
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={channelData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      border: 'none'
                    }}
                  />
                  <Legend iconType="circle" />
                  <Bar
                    dataKey="value"
                    name="Mentions"
                    radius={[0, 4, 4, 0]}
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
                <PieChartIcon size={48} className="mx-auto text-indigo-400 opacity-50" />
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
