
import { DataCard } from '@/components/ui/DataCard';
import { Button } from '@/components/ui/button';
import { Download, Filter, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardSummary } from '@/utils/mockData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4560', '#775DD0'];

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
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
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
            Export Data
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="channels">Channel Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends & Forecasting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DataCard title="Media Mentions Trend" variant="glass">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dashboardSummary.mentionTrend}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorMentions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#0088FE"
                      fillOpacity={1}
                      fill="url(#colorMentions)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </DataCard>

            <DataCard title="Media Channel Distribution" variant="glass">
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
        </TabsContent>
        
        <TabsContent value="sentiment">
          <DataCard title="Sentiment Analysis Over Time" variant="glass">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sentimentData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="positive" stackId="a" fill="#4ade80" name="Positive" />
                  <Bar dataKey="neutral" stackId="a" fill="#94a3b8" name="Neutral" />
                  <Bar dataKey="negative" stackId="a" fill="#f87171" name="Negative" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DataCard>
        </TabsContent>
        
        <TabsContent value="channels">
          <DataCard title="Channel Performance Analysis" variant="glass">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={channelData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#0088FE" name="Mentions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DataCard>
        </TabsContent>
        
        <TabsContent value="trends">
          <DataCard title="Trend Analysis & Forecasting" variant="glass">
            <div className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Trend analysis and forecasting features coming soon.</p>
              <Button>Request Early Access</Button>
            </div>
          </DataCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
