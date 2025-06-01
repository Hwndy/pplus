import React, { useState } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Stat } from '@/components/ui/Stat';
import { UniversalFilter, FilterOption, FilterValues } from '@/components/ui/UniversalFilter';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { brandMediaAnalysisData } from '@/utils/clientDashboardData';
import {
  BarChart2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Newspaper,
  Image,
  Video,
  TrendingUp,
  Users
} from 'lucide-react';

// Enhanced color palette for better visual appeal
const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export function BrandMediaAnalysisPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  // Get current date for display
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()}`;

  // Filter options for Brand Media Analysis
  const filterOptions: FilterOption[] = [
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange',
      placeholder: 'Select date range'
    },
    {
      key: 'subsidiary',
      label: 'Subsidiary',
      type: 'multiselect',
      options: [
        { value: 'Stanbic IBTC Bank', label: 'Stanbic IBTC Bank' },
        { value: 'Stanbic IBTC Pension Managers', label: 'Stanbic IBTC Pension Managers' },
        { value: 'Stanbic IBTC Stockbrokers', label: 'Stanbic IBTC Stockbrokers' },
        { value: 'Stanbic IBTC Asset Mgt', label: 'Stanbic IBTC Asset Mgt' },
        { value: 'Stanbic IBTC Holdings', label: 'Stanbic IBTC Holdings' },
        { value: 'Stanbic IBTC Capital', label: 'Stanbic IBTC Capital' }
      ]
    },
    {
      key: 'mentionType',
      label: 'Mention Type',
      type: 'multiselect',
      options: [
        { value: 'news', label: 'News Mentions' },
        { value: 'photo', label: 'Photo Mentions' },
        { value: 'video', label: 'Video Mentions' }
      ]
    },
    {
      key: 'placement',
      label: 'Message Placement',
      type: 'multiselect',
      options: [
        { value: 'headline', label: 'Headline Mentions' },
        { value: 'logo', label: 'Logo Mentions' },
        { value: 'photo', label: 'Photo Mentions' },
        { value: 'video', label: 'Video Mentions' }
      ]
    },
    {
      key: 'mediaType',
      label: 'Media Type',
      type: 'select',
      options: [
        { value: 'online', label: 'Online Media' },
        { value: 'print', label: 'Print Media' }
      ]
    }
  ];

  const resetFilters = () => {
    setFilterValues({});
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Beautiful Header Section */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Brand Media Analysis</h1>
            <p className="text-purple-100 text-lg">Comprehensive media exposure and performance insights</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <BarChart2 size={32} className="text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-100">Last Updated</div>
              <div className="text-white font-medium">{formattedDate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <UniversalFilter
        filters={filterOptions}
        values={filterValues}
        onChange={setFilterValues}
        onReset={resetFilters}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DataCard
          title="News Mentions"
          variant="glass"
          icon={<Newspaper size={24} className="text-indigo-600" />}
          className="border-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-indigo-600">{brandMediaAnalysisData.newsMentions}</div>
            <div className="text-sm text-gray-500">News mentions</div>
            <div className="mt-2 text-xs text-green-500 flex items-center">
              <TrendingUp size={14} className="mr-1" />
              <span>+12% from last month</span>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Photo Mentions"
          variant="glass"
          icon={<Image size={24} className="text-cyan-600" />}
          className="border-cyan-100 hover:border-cyan-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-cyan-600">{brandMediaAnalysisData.photoMentions}</div>
            <div className="text-sm text-gray-500">Photo mentions</div>
            <div className="mt-2 text-xs text-green-500 flex items-center">
              <TrendingUp size={14} className="mr-1" />
              <span>+8% from last month</span>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Video Mentions"
          variant="glass"
          icon={<Video size={24} className="text-emerald-600" />}
          className="border-emerald-100 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-emerald-600">{brandMediaAnalysisData.videoMentions}</div>
            <div className="text-sm text-gray-500">Video mentions</div>
            <div className="mt-2 text-xs text-green-500 flex items-center">
              <TrendingUp size={14} className="mr-1" />
              <span>+15% from last month</span>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Potential Reach"
          variant="glass"
          icon={<Users size={24} className="text-amber-600" />}
          className="border-amber-100 hover:border-amber-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-amber-600">{brandMediaAnalysisData.potentialReach.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Potential audience</div>
            <div className="mt-2 text-xs text-green-500 flex items-center">
              <TrendingUp size={14} className="mr-1" />
              <span>+23% from last month</span>
            </div>
          </div>
        </DataCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard
          title="Subsidiaries Exposure"
          variant="glass"
          icon={<PieChartIcon size={24} className="text-indigo-600" />}
          className="border-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="h-80 relative p-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={brandMediaAnalysisData.subsidiariesExposure}
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
                  {brandMediaAnalysisData.subsidiariesExposure.map((_, index) => (
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
              <div className="text-2xl font-bold text-indigo-600">
                {brandMediaAnalysisData.subsidiariesExposure[0].value}%
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {brandMediaAnalysisData.subsidiariesExposure[0].name}
              </div>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Message Placement"
          variant="glass"
          icon={<PieChartIcon size={24} className="text-cyan-600" />}
          className="border-cyan-100 hover:border-cyan-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="h-80 relative p-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={brandMediaAnalysisData.messagePlacement}
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
                  {brandMediaAnalysisData.messagePlacement.map((_, index) => (
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
                {brandMediaAnalysisData.messagePlacement[0].value}%
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {brandMediaAnalysisData.messagePlacement[0].name}
              </div>
            </div>
          </div>
        </DataCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard
          title="Weekly Trend"
          variant="glass"
          icon={<LineChartIcon size={24} className="text-emerald-600" />}
          className="border-emerald-100 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="h-80 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={brandMediaAnalysisData.weeklyTrend}
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorOnlineWeekly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPrintWeekly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[2]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[2]} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis
                  dataKey="week"
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
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="onlineMedia"
                  name="Online Media"
                  stroke={COLORS[0]}
                  fillOpacity={1}
                  fill="url(#colorOnlineWeekly)"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="printMedia"
                  name="Print Media"
                  stroke={COLORS[2]}
                  fillOpacity={1}
                  fill="url(#colorPrintWeekly)"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DataCard>

        <DataCard
          title="Monthly Trend"
          variant="glass"
          icon={<LineChartIcon size={24} className="text-amber-600" />}
          className="border-amber-100 hover:border-amber-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={brandMediaAnalysisData.monthlyTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorOnlineMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPrintMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[3]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[3]} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="onlineMedia"
                  name="Online Media"
                  stroke={COLORS[1]}
                  fillOpacity={1}
                  fill="url(#colorOnlineMonthly)"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="printMedia"
                  name="Print Media"
                  stroke={COLORS[3]}
                  fillOpacity={1}
                  fill="url(#colorPrintMonthly)"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DataCard>
      </div>
    </div>
  );
}
