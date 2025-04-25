
import { useState } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Stat } from '@/components/ui/Stat';
import { DataTable } from '@/components/ui/DataTable';
import { dashboardSummary, dataEntries, mediaChannels } from '@/utils/mockData';
import { ArrowUpDown, BarChart, FileBarChart, Filter, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { ColumnDef } from '@tanstack/react-table';
import { ThematicDistributionBreakdown } from './ThematicDistributionBreakdown';
import { PublicationsAnalysis } from './PublicationsAnalysis';
import { SocialStatsRegionalCoverage } from './SocialStatsRegionalCoverage';
import { thematicDistributionData, publicationsAnalysisData, socialStatsData } from '@/utils/thematicDistributionData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Client Dashboard</h1>
        <div className="flex flex-wrap space-x-2">
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedSection === 'overview'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => setSelectedSection('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedSection === 'reports'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => setSelectedSection('reports')}
          >
            Reports
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedSection === 'performance'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => setSelectedSection('performance')}
          >
            Performance
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedSection === 'thematic'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => setSelectedSection('thematic')}
          >
            Thematic Distribution
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedSection === 'publications'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => setSelectedSection('publications')}
          >
            Publications
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedSection === 'social'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => setSelectedSection('social')}
          >
            Social Stats
          </button>
        </div>
      </div>

      {selectedSection === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <DataCard title="Total Mentions" variant="glass" icon={<BarChart size={24} />}>
              <Stat
                label="Media Mentions"
                value={dashboardSummary.totalMentions}
                subtitle="Across all channels"
                trend={8}
              />
            </DataCard>
            <DataCard title="Audience Reach" variant="glass" icon={<Users size={24} />}>
              <Stat
                label="Total Reach"
                value={dashboardSummary.totalReach}
                subtitle="Potential audience"
                trend={12}
              />
            </DataCard>
            <DataCard title="Sentiment" variant="glass" icon={<ArrowUpDown size={24} />}>
              <Stat
                label="Average Sentiment"
                value={`${(dashboardSummary.averageSentiment * 100).toFixed(0)}%`}
                subtitle="Positive mentions"
                trend={5}
              />
            </DataCard>
            <DataCard title="Share of Voice" variant="glass" icon={<FileBarChart size={24} />}>
              <Stat
                label="Market Share"
                value="42%"
                subtitle="Compared to competitors"
                trend={-3}
              />
            </DataCard>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <DataCard title="Mentions Trend" variant="glass" icon={<BarChart size={24} />}>
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

            <DataCard title="Media Breakdown" variant="glass" icon={<Filter size={24} />}>
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
                  </PieChart>
                </ResponsiveContainer>
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
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={dashboardSummary.mentionTrend}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" name="Mentions" />
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
