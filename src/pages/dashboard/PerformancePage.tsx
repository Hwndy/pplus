
import { DataCard } from '@/components/ui/DataCard';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Filter, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
// import { dashboardSummary } from '@/utils/mockData';

// Sample competitor data
const competitorData = [
  { month: 'Jan', client: 65, competitor1: 45, competitor2: 55 },
  { month: 'Feb', client: 59, competitor1: 49, competitor2: 57 },
  { month: 'Mar', client: 80, competitor1: 55, competitor2: 60 },
  { month: 'Apr', client: 81, competitor1: 60, competitor2: 58 },
  { month: 'May', client: 56, competitor1: 48, competitor2: 52 },
  { month: 'Jun', client: 55, competitor1: 47, competitor2: 49 },
];

// Sample radar chart data
const radarData = [
  { metric: 'Media Mentions', client: 85, average: 60 },
  { metric: 'Reach', client: 75, average: 68 },
  { metric: 'Engagement', client: 68, average: 72 },
  { metric: 'Sentiment', client: 90, average: 65 },
  { metric: 'Share of Voice', client: 72, average: 60 },
];

export default function PerformancePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Performance Dashboard</h1>
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
      
      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Performance Summary</TabsTrigger>
          <TabsTrigger value="competitive">Competitive Analysis</TabsTrigger>
          <TabsTrigger value="benchmark">Industry Benchmarks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <DataCard title="Media Performance Trend" variant="glass" icon={<TrendingUp size={24} />}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dashboardSummary.mentionTrend}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)' }} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Media Mentions"
                      stroke="#0088FE" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </DataCard>

            <DataCard title="Media Reach Trend" variant="glass" icon={<TrendingUp size={24} />}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dashboardSummary.reachTrend}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis 
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)' }} 
                      formatter={(value) => [`${(Number(value) / 1000000).toFixed(2)}M people`, 'Audience Reach']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Audience Reach"
                      stroke="#00C49F" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </DataCard>
          </div>
          
          <DataCard 
            title="Key Performance Metrics" 
            description="Your media performance at a glance"
            variant="glass"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">Share of Voice</div>
                <div className="text-3xl font-bold">42%</div>
                <div className="text-sm text-green-600">+7% vs. last quarter</div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">Message Penetration</div>
                <div className="text-3xl font-bold">68%</div>
                <div className="text-sm text-green-600">+12% vs. last quarter</div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">Media ROI</div>
                <div className="text-3xl font-bold">3.2x</div>
                <div className="text-sm text-green-600">+0.5x vs. last quarter</div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">Brand Perception</div>
                <div className="text-3xl font-bold">78%</div>
                <div className="text-sm text-green-600">+5% vs. last quarter</div>
              </div>
            </div>
            
            <div className="h-72 p-6">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Your Brand" dataKey="client" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
                  <Radar name="Industry Average" dataKey="average" stroke="#FF8042" fill="#FF8042" fillOpacity={0.6} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </DataCard>
        </TabsContent>
        
        <TabsContent value="competitive">
          <DataCard 
            title="Competitive Analysis" 
            description="Media performance comparison with major competitors"
            variant="glass"
          >
            <div className="h-96 p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={competitorData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="client" name="Your Brand" fill="#0088FE" />
                  <Bar dataKey="competitor1" name="Competitor A" fill="#FFBB28" />
                  <Bar dataKey="competitor2" name="Competitor B" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="p-6 border-t">
              <h3 className="text-lg font-medium mb-4">Competitive Insights</h3>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                  <div className="font-medium">Share of Voice Leadership</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your brand maintains a 42% share of voice in the industry, leading competitors A (32%) and B (26%).
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                  <div className="font-medium">Sentiment Advantage</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your brand enjoys a 12% higher positive sentiment compared to industry average, showing stronger brand perception.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="font-medium">Growth Opportunity</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Competitor A is gaining traction in digital media. Consider increasing presence on these channels.
                  </p>
                </div>
              </div>
            </div>
          </DataCard>
        </TabsContent>
        
        <TabsContent value="benchmark">
          <DataCard 
            title="Industry Benchmarks" 
            description="How your performance compares to industry standards"
            variant="glass"
          >
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Media Presence</h3>
                  <div className="space-y-4">
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Mentions</span>
                        </div>
                        <div className="text-sm font-medium text-primary">85%</div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
                        <div style={{ width: "85%" }} className="bg-primary"></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Industry avg: 62%</div>
                    </div>
                    
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Reach</span>
                        </div>
                        <div className="text-sm font-medium text-primary">75%</div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
                        <div style={{ width: "75%" }} className="bg-primary"></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Industry avg: 68%</div>
                    </div>
                    
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Engagement</span>
                        </div>
                        <div className="text-sm font-medium text-yellow-600">68%</div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
                        <div style={{ width: "68%" }} className="bg-yellow-500"></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Industry avg: 72%</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Perception Metrics</h3>
                  <div className="space-y-4">
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Sentiment</span>
                        </div>
                        <div className="text-sm font-medium text-primary">90%</div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
                        <div style={{ width: "90%" }} className="bg-primary"></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Industry avg: 65%</div>
                    </div>
                    
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Message Pull-through</span>
                        </div>
                        <div className="text-sm font-medium text-primary">82%</div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
                        <div style={{ width: "82%" }} className="bg-primary"></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Industry avg: 60%</div>
                    </div>
                    
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Share of Voice</span>
                        </div>
                        <div className="text-sm font-medium text-primary">72%</div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-muted">
                        <div style={{ width: "72%" }} className="bg-primary"></div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Industry avg: 60%</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-6 bg-muted/30">
                <h3 className="text-lg font-medium mb-4">Performance Summary</h3>
                <p className="text-muted-foreground">
                  Your brand is performing above industry benchmarks in most key metrics, particularly in sentiment and media mentions. There is room for improvement in engagement metrics, where you're currently 4% below industry standards. Focus on interactive content and improving social media response rates to enhance this area.
                </p>
              </div>
            </div>
          </DataCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
