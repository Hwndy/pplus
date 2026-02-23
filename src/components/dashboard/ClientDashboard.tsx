import { useState } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Stat } from '@/components/ui/Stat';
import { DataTable } from '@/components/ui/DataTable';

import {
  ArrowUpDown,
  BarChart,
  FileBarChart,
  Filter,
  Users,
  TrendingUp,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
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
import { ColumnDef } from '@tanstack/react-table';
import { ThematicDistributionBreakdown } from './ThematicDistributionBreakdown';
import { PublicationsAnalysis } from './PublicationsAnalysis';
import { SocialStatsRegionalCoverage } from './SocialStatsRegionalCoverage';
// import { thematicDistributionData, publicationsAnalysisData, socialStatsData } from '@/utils/thematicDistributionData';

// Enhanced color palette for better visual appeal
const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

// Define columns for media reports table
const mediaReportsColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
  },
  {
    accessorKey: 'channelId',
    header: 'Channel',
    cell: ({ row }) => {
      const channelId = row.getValue('channelId') as string;
      const channel = mediaChannels.find(c => c.id === channelId);
      return <span>{channel?.name || 'Unknown'}</span>;
    },
  },
  {
    accessorKey: 'value',
    header: 'Value',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            status === 'approved'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : status === 'pending'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
];

export function ClientDashboard() {
  const [selectedSection, setSelectedSection] = useState<'overview' | 'reports' | 'performance' | 'thematic' | 'publications' | 'social'>('overview');

  // Get current date for display
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">Client Dashboard</h1>
        <div className="text-sm text-gray-500">{formattedDate}</div>
      </div>

      <div className="flex flex-wrap gap-2 bg-indigo-50 p-2 rounded-lg">
        <button
          className={`px-4 py-2 rounded-md transition-all ${
            selectedSection === 'overview'
              ? 'bg-white text-indigo-600 shadow-sm font-medium'
              : 'bg-transparent text-gray-600 hover:bg-white/50 hover:text-indigo-600'
          }`}
          onClick={() => setSelectedSection('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 rounded-md transition-all ${
            selectedSection === 'reports'
              ? 'bg-white text-indigo-600 shadow-sm font-medium'
              : 'bg-transparent text-gray-600 hover:bg-white/50 hover:text-indigo-600'
          }`}
          onClick={() => setSelectedSection('reports')}
        >
          Reports
        </button>
        <button
          className={`px-4 py-2 rounded-md transition-all ${
            selectedSection === 'performance'
              ? 'bg-white text-indigo-600 shadow-sm font-medium'
              : 'bg-transparent text-gray-600 hover:bg-white/50 hover:text-indigo-600'
          }`}
          onClick={() => setSelectedSection('performance')}
        >
          Performance
        </button>
        <button
          className={`px-4 py-2 rounded-md transition-all ${
            selectedSection === 'thematic'
              ? 'bg-white text-indigo-600 shadow-sm font-medium'
              : 'bg-transparent text-gray-600 hover:bg-white/50 hover:text-indigo-600'
          }`}
          onClick={() => setSelectedSection('thematic')}
        >
          Thematic Distribution
        </button>
        <button
          className={`px-4 py-2 rounded-md transition-all ${
            selectedSection === 'publications'
              ? 'bg-white text-indigo-600 shadow-sm font-medium'
              : 'bg-transparent text-gray-600 hover:bg-white/50 hover:text-indigo-600'
          }`}
          onClick={() => setSelectedSection('publications')}
        >
          Publications
        </button>
        <button
          className={`px-4 py-2 rounded-md transition-all ${
            selectedSection === 'social'
              ? 'bg-white text-indigo-600 shadow-sm font-medium'
              : 'bg-transparent text-gray-600 hover:bg-white/50 hover:text-indigo-600'
          }`}
          onClick={() => setSelectedSection('social')}
        >
          Social Stats
        </button>
      </div>

      {selectedSection === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <DataCard
              title="Total Mentions"
              variant="glass"
              icon={<BarChart size={24} className="text-indigo-600" />}
              className="border-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex flex-col items-center justify-center p-4">
                <div className="text-3xl font-bold text-indigo-600">{dashboardSummary.totalMentions}</div>
                <div className="text-sm text-gray-500">Media mentions</div>
                <div className="mt-2 text-xs text-green-500 flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  <span>+8% from last month</span>
                </div>
              </div>
            </DataCard>

            <DataCard
              title="Audience Reach"
              variant="glass"
              icon={<Users size={24} className="text-cyan-600" />}
              className="border-cyan-100 hover:border-cyan-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex flex-col items-center justify-center p-4">
                <div className="text-3xl font-bold text-cyan-600">{dashboardSummary.totalReach}</div>
                <div className="text-sm text-gray-500">Potential audience</div>
                <div className="mt-2 text-xs text-green-500 flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  <span>+12% from last month</span>
                </div>
              </div>
            </DataCard>

            <DataCard
              title="Sentiment"
              variant="glass"
              icon={<ArrowUpDown size={24} className="text-emerald-600" />}
              className="border-emerald-100 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex flex-col items-center justify-center p-4">
                <div className="text-3xl font-bold text-emerald-600">{`${(dashboardSummary.averageSentiment * 100).toFixed(0)}%`}</div>
                <div className="text-sm text-gray-500">Positive mentions</div>
                <div className="mt-2 text-xs text-green-500 flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  <span>+5% from last month</span>
                </div>
              </div>
            </DataCard>

            <DataCard
              title="Share of Voice"
              variant="glass"
              icon={<FileBarChart size={24} className="text-amber-600" />}
              className="border-amber-100 hover:border-amber-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex flex-col items-center justify-center p-4">
                <div className="text-3xl font-bold text-amber-600">42%</div>
                <div className="text-sm text-gray-500">Market share</div>
                <div className="mt-2 text-xs text-red-500 flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  <span>-3% from last month</span>
                </div>
              </div>
            </DataCard>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <DataCard
              title="Mentions Trend"
              variant="glass"
              icon={<LineChartIcon size={24} className="text-indigo-600" />}
              className="border-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
            >
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
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        border: 'none'
                      }}
                    />
                    <Legend iconType="circle" />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Mentions"
                      stroke={COLORS[0]}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMentions)"
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </DataCard>

            <DataCard
              title="Media Breakdown"
              variant="glass"
              icon={<PieChartIcon size={24} className="text-cyan-600" />}
              className="border-cyan-100 hover:border-cyan-300 transition-all shadow-sm hover:shadow-md"
            >
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
                  <div className="text-2xl font-bold text-cyan-600">
                    {dashboardSummary.mediaBreakdown[0].value}%
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {dashboardSummary.mediaBreakdown[0].name}
                  </div>
                </div>
              </div>
            </DataCard>
          </div>
        </div>
      )}

      {selectedSection === 'reports' && (
        <div className="space-y-6">
          <DataCard
            title="Media Reports"
            description="Recent media mention entries"
            variant="glass"
          >
            <DataTable columns={mediaReportsColumns} data={dataEntries} />
          </DataCard>
        </div>
      )}

      {selectedSection === 'performance' && (
        <div className="space-y-6">
          <DataCard
            title="Performance Metrics"
            description="Key performance indicators over time"
            variant="glass"
          >
            <div className="h-96 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={dashboardSummary.mentionTrend}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}`, 'Mentions']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      border: 'none',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" fill="#4F46E5" name="Mentions" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </DataCard>
        </div>
      )}

      {/* Thematic Distribution Breakdown Section */}
      {selectedSection === 'thematic' && (
        <div className="space-y-6">
          <ThematicDistributionBreakdown items={thematicDistributionData} />
        </div>
      )}

      {/* Publications Analysis Section */}
      {selectedSection === 'publications' && (
        <div className="space-y-6">
          <PublicationsAnalysis
            printPublications={publicationsAnalysisData.printPublications}
            onlinePublications={publicationsAnalysisData.onlinePublications}
            printReporters={publicationsAnalysisData.printReporters}
            onlineReporters={publicationsAnalysisData.onlineReporters}
            spokespersons={publicationsAnalysisData.spokespersons}
          />
        </div>
      )}

      {/* Social Stats and Regional Coverage Section */}
      {selectedSection === 'social' && (
        <div className="space-y-6">
          <SocialStatsRegionalCoverage
            socialStats={socialStatsData.socialPlatforms}
            regionalCoverage={socialStatsData.regionalCoverage}
          />
        </div>
      )}
    </div>
  );
}