import React, { useState, useMemo } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Stat } from '@/components/ui/Stat';
import { UniversalFilter, FilterOption, FilterValues } from '@/components/ui/UniversalFilter';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { executiveSummaryData, brandMediaAnalysisData } from '@/utils/clientDashboardData';
import {
  BarChart2,
  Globe,
  Newspaper,
  ThumbsUp,
  Minus,
  ThumbsDown,
  TrendingUp,
  Users,
  Award,
  PieChart as PieChartIcon
} from 'lucide-react';

// Enhanced color palette for better visual appeal
const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];
const SENTIMENT_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

export function ExecutiveSummaryPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  // Get current date for display
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()}`;

  // Filter options for Executive Summary
  const filterOptions: FilterOption[] = [
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange',
      placeholder: 'Select date range'
    },
    {
      key: 'mediaType',
      label: 'Media Type',
      type: 'multiselect',
      options: [
        { value: 'online', label: 'Online Media' },
        { value: 'print', label: 'Print Media' }
      ]
    },
    {
      key: 'language',
      label: 'Language',
      type: 'multiselect',
      options: [
        { value: 'English', label: 'English' },
        { value: 'Portuguese', label: 'Portuguese' },
        { value: 'Turkish', label: 'Turkish' }
      ]
    },
    {
      key: 'sentiment',
      label: 'Sentiment',
      type: 'multiselect',
      options: [
        { value: 'positive', label: 'Positive' },
        { value: 'neutral', label: 'Neutral' },
        { value: 'negative', label: 'Negative' }
      ]
    },
    {
      key: 'region',
      label: 'Region',
      type: 'select',
      options: [
        { value: 'local', label: 'Local Media' },
        { value: 'international', label: 'International Media' }
      ]
    }
  ];

  // Calculate sentiment percentages (filtered data would be applied here)
  const totalMentions = executiveSummaryData.positiveMediaExposure +
                        executiveSummaryData.neutralMediaExposure +
                        executiveSummaryData.negativeMediaExposure;

  const sentimentData = [
    { name: 'Positive', value: Math.round((executiveSummaryData.positiveMediaExposure / totalMentions) * 100) },
    { name: 'Neutral', value: Math.round((executiveSummaryData.neutralMediaExposure / totalMentions) * 100) },
    { name: 'Negative', value: Math.round((executiveSummaryData.negativeMediaExposure / totalMentions) * 100) }
  ];

  const resetFilters = () => {
    setFilterValues({});
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">Executive Summary</h2>
        <div className="text-sm text-gray-500">{formattedDate}</div>
      </div>

      {/* Filters */}
      <UniversalFilter
        filters={filterOptions}
        values={filterValues}
        onChange={setFilterValues}
        onReset={resetFilters}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <DataCard
          title="Total Media Mentions"
          variant="glass"
          icon={<BarChart2 size={24} className="text-indigo-600" />}
          className="lg:col-span-1 border-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-indigo-600">{executiveSummaryData.totalMedia}</div>
            <div className="text-sm text-gray-500">Total mentions</div>
            <div className="mt-2 text-xs text-green-500 flex items-center">
              <TrendingUp size={14} className="mr-1" />
              <span>+18% from last month</span>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Reputation Score"
          variant="glass"
          icon={<Award size={24} className="text-cyan-600" />}
          className="lg:col-span-1 border-cyan-100 hover:border-cyan-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-cyan-600">{executiveSummaryData.brandMediaReputationScore}</div>
            <div className="text-sm text-gray-500">out of 1.0</div>
            <div className="mt-2 text-xs text-green-500 flex items-center">
              <TrendingUp size={14} className="mr-1" />
              <span>+0.1 from last month</span>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Local Media Exposure"
          variant="glass"
          icon={<Newspaper size={24} className="text-emerald-600" />}
          className="lg:col-span-1 border-emerald-100 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-emerald-600">{executiveSummaryData.brandExposureLocalMedia}</div>
            <div className="text-sm text-gray-500">Local mentions</div>
            <div className="mt-2 text-xs text-green-500 flex items-center">
              <TrendingUp size={14} className="mr-1" />
              <span>+12% from last month</span>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="International Media"
          variant="glass"
          icon={<Globe size={24} className="text-amber-600" />}
          className="lg:col-span-1 border-amber-100 hover:border-amber-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-amber-600">{executiveSummaryData.brandExposureInternationalMedia}</div>
            <div className="text-sm text-gray-500">International mentions</div>
            <div className="mt-2 text-xs text-green-500 flex items-center">
              <TrendingUp size={14} className="mr-1" />
              <span>+8% from last month</span>
            </div>
          </div>
        </DataCard>

        {/* <DataCard
          title="Positive Mentions"
          variant="glass"
          icon={<ThumbsUp size={24} className="text-green-600" />}
          className="lg:col-span-1 border-green-100 hover:border-green-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-green-600">{executiveSummaryData.positiveMediaExposure}</div>
            <div className="text-sm text-gray-500">Positive mentions</div>
            <div className="mt-2 text-xs text-green-500 flex items-center">
              <TrendingUp size={14} className="mr-1" />
              <span>+15% from last month</span>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Negative Mentions"
          variant="glass"
          icon={<ThumbsDown size={24} className="text-red-600" />}
          className="lg:col-span-1 border-red-100 hover:border-red-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-red-600">{executiveSummaryData.negativeMediaExposure}</div>
            <div className="text-sm text-gray-500">Negative mentions</div>
            <div className="mt-2 text-xs text-red-500 flex items-center">
              <TrendingUp size={14} className="mr-1" />
              <span>-5% from last month</span>
            </div>
          </div>
        </DataCard> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DataCard
          title="Sentiment Analysis"
          variant="glass"
          icon={<PieChartIcon size={24} className="text-indigo-600" />}
          className="border-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="h-80 relative p-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
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
                  {sentimentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
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
              <div className="text-2xl font-bold text-green-600">{sentimentData[0].value}%</div>
              <div className="text-xs text-gray-500 font-medium">Positive</div>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Language Distribution"
          variant="glass"
          icon={<Globe size={24} className="text-cyan-600" />}
          className="border-cyan-100 hover:border-cyan-300 transition-all shadow-sm hover:shadow-md"
        >
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
                  {executiveSummaryData.languageDistribution.map((_, index) => (
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
                {executiveSummaryData.languageDistribution[0].value}%
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {executiveSummaryData.languageDistribution[0].name}
              </div>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Media Vehicle Distribution"
          variant="glass"
          icon={<Newspaper size={24} className="text-emerald-600" />}
          className="border-emerald-100 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
        >
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
                  {executiveSummaryData.mediaVehicleDistribution.map((_, index) => (
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
              <div className="text-2xl font-bold text-emerald-600">
                {executiveSummaryData.mediaVehicleDistribution[0].value}%
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {executiveSummaryData.mediaVehicleDistribution[0].name}
              </div>
            </div>
          </div>
        </DataCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard
          title="Weekly Trend on Brand Media Exposure"
          variant="glass"
          icon={<BarChart2 size={24} className="text-amber-600" />}
          className="border-amber-100 hover:border-amber-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={brandMediaAnalysisData.weeklyTrend}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPrint" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[2]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[2]} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" />
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
                  stroke={COLORS[0]}
                  fillOpacity={1}
                  fill="url(#colorOnline)"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="printMedia"
                  name="Print Media"
                  stroke={COLORS[2]}
                  fillOpacity={1}
                  fill="url(#colorPrint)"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DataCard>

        <DataCard
          title="Competitive Media Share"
          variant="glass"
          icon={<BarChart2 size={24} className="text-purple-600" />}
          className="border-purple-100 hover:border-purple-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="h-80 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Cawry Asset Mgt', value: 30 },
                  { name: 'Quantum Zenith', value: 25 },
                  { name: 'Stanbic IBTC Asset Mgt', value: 20 },
                  { name: 'ARM Holding Company', value: 15 },
                  { name: 'Anchoria Asset Mgt', value: 10 }
                ]}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis
                  type="number"
                  domain={[0, 35]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 14, fill: '#666' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={0}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 14, fill: '#666' }}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Media Share']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                  {[
                    { name: 'Cawry Asset Mgt', value: 30 },
                    { name: 'Quantum Zenith', value: 25 },
                    { name: 'Stanbic IBTC Asset Mgt', value: 20 },
                    { name: 'ARM Holding Company', value: 15 },
                    { name: 'Anchoria Asset Mgt', value: 10 }
                  ].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? COLORS[5] : '#e5e7eb'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DataCard>
      </div>
    </div>
  );
}
