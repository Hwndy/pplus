import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon, Newspaper, Image, Video, Users } from 'lucide-react';
import { UniversalFilter, FilterOption, FilterValues } from '@/components/ui/UniversalFilter';
import { DataCard } from '@/components/ui/DataCard';
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
  AreaChart,
} from 'recharts';
import { COLORS } from '@/utils/constants';

// Enhanced color palette for better visual appeal
const COLORS_LOCAL = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export function BrandMediaAnalysisPage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()}`;

  const filterOptions: FilterOption[] = [
    { key: 'dateRange', label: 'Date Range', type: 'daterange', placeholder: 'Select date range' },
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
        { value: 'Stanbic IBTC Capital', label: 'Stanbic IBTC Capital' },
      ],
    },
    {
      key: 'mentionType',
      label: 'Mention Type',
      type: 'multiselect',
      options: [
        { value: 'news', label: 'News Mentions' },
        { value: 'photo', label: 'Photo Mentions' },
        { value: 'video', label: 'Video Mentions' },
      ],
    },
    {
      key: 'placement',
      label: 'Message Placement',
      type: 'multiselect',
      options: [
        { value: 'headline', label: 'Headline Mentions' },
        { value: 'logo', label: 'Logo Mentions' },
        { value: 'photo', label: 'Photo Mentions' },
        { value: 'video', label: 'Video Mentions' },
      ],
    },
    {
      key: 'mediaType',
      label: 'Media Type',
      type: 'select',
      options: [
        { value: 'online', label: 'Online Media' },
        { value: 'print', label: 'Print Media' },
      ],
    },
  ];

  const resetFilters = () => setFilterValues({});

  const getMonthFromDateRange = (dateRange: any): string | null => {
    if (!dateRange?.start) return null;
    const start = new Date(dateRange.start);
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;

    const fetchAnalysisData = async () => {
      setDataLoading(true);
      try {
        let url = 'https://pplus-ec37.onrender.com/api/report/brand-media-analysis';
        const month = getMonthFromDateRange(filterValues.dateRange);
        if (month) url += `?month=${month}`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (result.success) {
          setAnalysisData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch analysis data');
        }
      } catch (err) {
        console.error('Error fetching brand media analysis:', err);
        toast.error('Error fetching brand media analysis');
        setAnalysisData(null);
      } finally {
        setDataLoading(false);
      }
    };

    fetchAnalysisData();
  }, [authLoading, isAuthenticated, user, token, filterValues]);

  const chartDataWeekly = [
    { week: 'Week 1', printMedia: analysisData?.analysis.weekly_volume_trend.print.weekly_breakdown[0].count || 0, onlineMedia: analysisData?.analysis.weekly_volume_trend.online.weekly_breakdown[0].count || 0 },
    { week: 'Week 2', printMedia: analysisData?.analysis.weekly_volume_trend.print.weekly_breakdown[1].count || 0, onlineMedia: analysisData?.analysis.weekly_volume_trend.online.weekly_breakdown[1].count || 0 },
    { week: 'Week 3', printMedia: analysisData?.analysis.weekly_volume_trend.print.weekly_breakdown[2].count || 0, onlineMedia: analysisData?.analysis.weekly_volume_trend.online.weekly_breakdown[2].count || 0 },
    { week: 'Week 4', printMedia: analysisData?.analysis.weekly_volume_trend.print.weekly_breakdown[3].count || 0, onlineMedia: analysisData?.analysis.weekly_volume_trend.online.weekly_breakdown[3].count || 0 },
  ];

  const chartDataMonthly = [
    { month: analysisData?.period.month || '2025-10', printMedia: analysisData?.analysis.monthly_volume_trend.monthly_breakdown[0].print.count || 0, onlineMedia: analysisData?.analysis.monthly_volume_trend.monthly_breakdown[0].online.count || 0 },
  ];

  const subsidiariesExposureData = analysisData?.analysis.brand_subsidiary_exposure.top_10.map(item => ({
    name: item.brand,
    value: parseFloat(item.percentage),
  })) || [];

  const messagePlacementData = analysisData?.analysis.brand_message_placement.placements.map(item => ({
    name: item.placement,
    value: parseFloat(item.percentage),
  })) || [];

  if (authLoading || dataLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
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
            <div className="text-3xl font-bold text-indigo-600">{analysisData?.analysis.news_mention.total || 0}</div>
            <div className="text-sm text-gray-500">News mentions</div>
          </div>
        </DataCard>

        <DataCard
          title="Photo Mentions"
          variant="glass"
          icon={<Image size={24} className="text-cyan-600" />}
          className="border-cyan-100 hover:border-cyan-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-cyan-600">{analysisData?.analysis.photo_mention.total || 0}</div>
            <div className="text-sm text-gray-500">Photo mentions</div>
          </div>
        </DataCard>

        <DataCard
          title="Video Mentions"
          variant="glass"
          icon={<Video size={24} className="text-emerald-600" />}
          className="border-emerald-100 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-emerald-600">{analysisData?.analysis.video_mention.total || 0}</div>
            <div className="text-sm text-gray-500">Video mentions</div>
          </div>
        </DataCard>

        <DataCard
          title="Potential Reach"
          variant="glass"
          icon={<Users size={24} className="text-amber-600" />}
          className="border-amber-100 hover:border-amber-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-amber-600">{analysisData?.analysis.potential_reach.combined_reach?.toLocaleString() || 0}</div>
            <div className="text-sm text-gray-500">Potential audience</div>
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
                  data={subsidiariesExposureData}
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
                  {subsidiariesExposureData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_LOCAL[index % COLORS_LOCAL.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Percentage']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none',
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
                {subsidiariesExposureData[0]?.value || 0}%
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {subsidiariesExposureData[0]?.name || 'N/A'}
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
                  data={messagePlacementData}
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
                  {messagePlacementData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_LOCAL[index % COLORS_LOCAL.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Percentage']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none',
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
                {messagePlacementData[0]?.value || 0}%
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {messagePlacementData[0]?.name || 'N/A'}
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
                data={chartDataWeekly}
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorOnlineWeekly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS_LOCAL[0]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS_LOCAL[0]} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorPrintWeekly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS_LOCAL[2]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS_LOCAL[2]} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="onlineMedia"
                  name="Online Media"
                  stroke={COLORS_LOCAL[0]}
                  fillOpacity={1}
                  fill="url(#colorOnlineWeekly)"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="printMedia"
                  name="Print Media"
                  stroke={COLORS_LOCAL[2]}
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
                data={chartDataMonthly}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorOnlineMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS_LOCAL[1]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS_LOCAL[1]} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorPrintMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS_LOCAL[3]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS_LOCAL[3]} stopOpacity={0.1} />
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
                    border: 'none',
                  }}
                />
                <Legend iconType="circle" />
                <Area
                  type="monotone"
                  dataKey="onlineMedia"
                  name="Online Media"
                  stroke={COLORS_LOCAL[1]}
                  fillOpacity={1}
                  fill="url(#colorOnlineMonthly)"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="printMedia"
                  name="Print Media"
                  stroke={COLORS_LOCAL[3]}
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