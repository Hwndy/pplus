import { useState } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Stat } from '@/components/ui/Stat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  FileBarChart,
  Filter,
  Users,
  ArrowUpDown,
  Globe,
  Newspaper,
  ThumbsUp,
  Minus,
  ThumbsDown,
  PieChart as PieChartIcon,
  BarChart2,
  LineChart,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Lightbulb,
  Building,
  Target
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import {
  executiveSummaryData,
  insightRecommendationData,
  industryLandscapeData,
  brandMediaSentimentData,
  brandMediaAnalysisData
} from '@/utils/clientDashboardData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const SENTIMENT_COLORS = {
  stronglyPositive: '#00C49F',
  positive: '#82ca9d',
  neutral: '#FFBB28',
  slightlyNegative: '#FF8042',
  stronglyNegative: '#FF0000',
  negative: '#d32f2f'
};

export function ClientMediaDashboard() {
  const [selectedSection, setSelectedSection] = useState('executive-summary');

  // Convert sentiment distribution to array for chart
  const sentimentDistributionData = Object.entries(brandMediaSentimentData.sentimentDistribution).map(([key, value]) => ({
    name: key,
    value: value
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Media Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive media analytics and insights for your brand
          </p>
        </div>
      </div>

      <Tabs defaultValue="executive-summary" className="space-y-4" onValueChange={setSelectedSection}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 h-auto">
          <TabsTrigger value="executive-summary">Executive Summary</TabsTrigger>
          <TabsTrigger value="insights">Outcome & Insights</TabsTrigger>
          <TabsTrigger value="industry">Industry Landscape</TabsTrigger>
          <TabsTrigger value="sentiment">Brand Drivers & Sentiment</TabsTrigger>
          <TabsTrigger value="media-analysis">Brand Media Analysis</TabsTrigger>
        </TabsList>

        {/* Executive Summary Section */}
        <TabsContent value="executive-summary" className="space-y-4">
          <h2 className="text-2xl font-bold">Executive Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <DataCard title="Total media mentions" variant="glass" icon={<Newspaper size={24} />} className="lg:col-span-1">
              <Stat
                label="Total Media"
                value={executiveSummaryData.totalMedia}
                subtitle="(All media)"
              />
            </DataCard>

            <DataCard title="Brand media reputation score" variant="glass" icon={<BarChart size={24} />} className="lg:col-span-1">
              <Stat
                label="Reputation Score"
                value={executiveSummaryData.brandMediaReputationScore}
                subtitle="(0-1 scale)"
              />
            </DataCard>

            <DataCard title="Brand exposure in local media" variant="glass" icon={<Newspaper size={24} />} className="lg:col-span-1">
              <Stat
                label="Local Media"
                value={executiveSummaryData.brandExposureLocalMedia}
                subtitle="mentions"
              />
            </DataCard>

            <DataCard title="Brand exposure in International media" variant="glass" icon={<Globe size={24} />} className="lg:col-span-1">
              <Stat
                label="International Media"
                value={executiveSummaryData.brandExposureInternationalMedia}
                subtitle="mentions"
              />
            </DataCard>

            <DataCard title="Positive media exposure" variant="glass" icon={<ThumbsUp size={24} />} className="lg:col-span-1">
              <Stat
                label="Positive"
                value={executiveSummaryData.positiveMediaExposure}
                subtitle="mentions"
              />
            </DataCard>

            <DataCard title="Neutral media exposure" variant="glass" icon={<Minus size={24} />} className="lg:col-span-1">
              <Stat
                label="Neutral"
                value={executiveSummaryData.neutralMediaExposure}
                subtitle="mentions"
              />
            </DataCard>

            <DataCard title="Negative media exposure" variant="glass" icon={<ThumbsDown size={24} />} className="lg:col-span-1">
              <Stat
                label="Negative"
                value={executiveSummaryData.negativeMediaExposure}
                subtitle="mentions"
              />
            </DataCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DataCard title="Language" variant="glass" icon={<Globe size={24} />}>
              <div className="h-80 relative p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={executiveSummaryData.languageDistribution}
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
                      {executiveSummaryData.languageDistribution.map((entry, index) => (
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
              </div>
            </DataCard>

            <DataCard title="Media Vehicle" variant="glass" icon={<Newspaper size={24} />}>
              <div className="h-80 relative p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={executiveSummaryData.mediaVehicleDistribution}
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
                      {executiveSummaryData.mediaVehicleDistribution.map((entry, index) => (
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
              </div>
            </DataCard>
          </div>
        </TabsContent>

        {/* Insights & Recommendations Section */}
        <TabsContent value="insights" className="space-y-4">
          <h2 className="text-2xl font-bold">Insight / Recommendation / Suggestion</h2>

          <div className="space-y-6">
            {insightRecommendationData.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-4 border rounded-lg overflow-hidden">
                <div className="bg-yellow-500 text-white p-6 flex items-center justify-center md:w-24">
                  <span className="text-2xl font-bold">{item.id}</span>
                </div>
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-bold text-blue-600 mb-4">{item.title}</h3>
                  <p className="text-gray-700">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Industry Landscape Section */}
        <TabsContent value="industry" className="space-y-4">
          <h2 className="text-2xl font-bold">Industry Landscape Overview – Nigerian Financial Sector Highlights</h2>

          <div className="space-y-6">
            {industryLandscapeData.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-4 border rounded-lg overflow-hidden">
                <div className="bg-blue-500 text-white p-6 flex items-center justify-center md:w-24">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white">
                    <Target className="h-10 w-10 text-blue-500" />
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <h3 className="text-lg font-bold mb-4">According to <span className="text-blue-600">{item.source}</span>,</h3>
                  <p className="text-gray-700">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Brand Drivers & Sentiment Section */}
        <TabsContent value="sentiment" className="space-y-4">
          <h2 className="text-2xl font-bold">Brand Media Sentiment Distribution Matrix</h2>

          <div className="space-y-6">
            <div className="w-full h-20 bg-gray-100 rounded-lg overflow-hidden">
              <div className="flex h-full">
                <div className="bg-red-500" style={{ width: '10%' }}></div>
                <div className="bg-teal-500" style={{ width: '70%' }}></div>
                <div className="bg-gray-400" style={{ width: '4%' }}></div>
                <div className="bg-gray-600" style={{ width: '8%' }}></div>
                <div className="bg-black" style={{ width: '8%' }}></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-teal-500"></div>
                <span className="text-sm">Strongly Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400"></div>
                <span className="text-sm">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-600"></div>
                <span className="text-sm">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500"></div>
                <span className="text-sm">Strongly Negative</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-black"></div>
                <span className="text-sm">Negative</span>
              </div>
            </div>

            <h3 className="text-xl font-bold mt-8">Key Brand Reputational Drivers</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-green-500 text-white p-3 font-bold text-center">
                  Positive
                </div>
                <div className="p-4 space-y-2">
                  {brandMediaSentimentData.keyDrivers.positive.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="min-w-4 mt-1">•</div>
                      <p className="text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-red-500 text-white p-3 font-bold text-center">
                  Negative
                </div>
                <div className="p-4 space-y-2">
                  {brandMediaSentimentData.keyDrivers.negative.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="min-w-4 mt-1">•</div>
                      <p className="text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-500 text-white p-3 font-bold text-center">
                  Neutral
                </div>
                <div className="p-4 space-y-2">
                  {brandMediaSentimentData.keyDrivers.neutral.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="min-w-4 mt-1">•</div>
                      <p className="text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Brand Media Analysis Section */}
        <TabsContent value="media-analysis" className="space-y-4">
          <h2 className="text-2xl font-bold">Brand Media Analysis</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DataCard title="@News Mentions" variant="glass" icon={<Newspaper size={24} />}>
              <div className="flex items-center justify-center h-24">
                <span className="text-4xl font-bold">{brandMediaAnalysisData.newsMentions}</span>
              </div>
            </DataCard>

            <DataCard title="Photo Mentions" variant="glass" icon={<FileBarChart size={24} />}>
              <div className="flex items-center justify-center h-24">
                <span className="text-4xl font-bold">{brandMediaAnalysisData.photoMentions}</span>
              </div>
            </DataCard>

            <DataCard title="Video Mentions" variant="glass" icon={<FileBarChart size={24} />}>
              <div className="flex items-center justify-center h-24">
                <span className="text-4xl font-bold">{brandMediaAnalysisData.videoMentions}</span>
              </div>
            </DataCard>

            <DataCard title="Potential Reach" variant="glass" icon={<Users size={24} />}>
              <div className="flex items-center justify-center h-24">
                <span className="text-4xl font-bold">{brandMediaAnalysisData.potentialReach.toLocaleString()}</span>
              </div>
            </DataCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DataCard title="Thematic Distribution of Media Activities" variant="glass" icon={<BarChart2 size={24} />}>
              <div className="h-80 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={brandMediaAnalysisData.thematicDistribution}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                    <XAxis
                      type="number"
                      domain={[0, 35]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#666' }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Percentage']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        border: 'none',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="value" fill="#0088FE" name="Percentage" radius={[0, 6, 6, 0]} barSize={20} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </DataCard>

            <DataCard title="Brand & Subsidiaries Media Exposure" variant="glass" icon={<BarChart2 size={24} />}>
              <div className="h-80 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={brandMediaAnalysisData.subsidiariesExposure}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                    <XAxis
                      type="number"
                      domain={[0, 55]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#666' }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#666' }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Percentage']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        border: 'none',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="value" fill="#00C49F" name="Percentage" radius={[0, 6, 6, 0]} barSize={20} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </DataCard>

            <DataCard title="Brand Message Placement In The Media" variant="glass" icon={<BarChart2 size={24} />}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={brandMediaAnalysisData.messagePlacement}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 90]} />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" fill="#FFBB28" name="Percentage" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </DataCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DataCard title="Overall Weekly Volume Trend" variant="glass" icon={<LineChart size={24} />}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={brandMediaAnalysisData.weeklyTrend}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis label={{ value: '%', position: 'insideTopLeft', offset: 0 }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="onlineMedia" name="Online Media" fill="#8884d8" />
                    <Bar dataKey="printMedia" name="Print Media" fill="#FF8042" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </DataCard>

            <DataCard title="Overall Monthly Volume Trend" variant="glass" icon={<LineChart size={24} />}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={brandMediaAnalysisData.monthlyTrend.slice(0, 5)} // Showing Jan-May as in the image
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: '%', position: 'insideTopLeft', offset: 0 }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="onlineMedia" name="Online Media" fill="#8884d8" />
                    <Bar dataKey="printMedia" name="Print Media" fill="#FF8042" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </DataCard>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-gray-500 mt-8 border-t pt-4">
        <p>Copyright © 2023, P+ Measurement Services. All rights reserved. This audit report, including all its methodologies, contents, and analysis, is the intellectual property of P+ Measurement Services. It is intended solely for the use of the specifically named clients. Any unauthorized use is strictly prohibited.</p>
      </div>
    </div>
  );
}
