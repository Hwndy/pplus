import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { Heart, Loader2, BarChart2, Newspaper, Image, Video, Users, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { DataCard } from '@/components/ui/DataCard';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

interface AnalysisData {
  company: string;
  period: { start: string; end: string };
  analysis: {
    news_mention: { total: number; breakdown: { headline: number; advertorial: number } };
    photo_mention: { total: number };
    video_mention: { total: number };
    potential_reach: {
      print: { total_reach: number };
      online: { total_reach: number };
      combined_reach: number;
    };
    brand_subsidiary_exposure: {
      top_10: { brand: string; percentage: string }[];
      total_brand_mentions: number;
      note?: string;
    };
    brand_message_placement: {
      total_placements: number;
      placements: { placement: string; count: number; percentage: string }[];
    };
    weekly_volume_trend: {
      print: { weekly_breakdown: { week: string; count: number }[] };
      online: { weekly_breakdown: { week: string; count: number }[] };
    };
    monthly_volume_trend: {
      monthly_breakdown: { month: string; print: { count: number }; online: { count: number } }[];
    };
  };
}

const DEFAULT_DATA: AnalysisData = {
  company: 'Your Company',
  period: { start: '', end: '' },
  analysis: {
    news_mention: { total: 0, breakdown: { headline: 0, advertorial: 0 } },
    photo_mention: { total: 0 },
    video_mention: { total: 0 },
    potential_reach: { print: { total_reach: 0 }, online: { total_reach: 0 }, combined_reach: 0 },
    brand_subsidiary_exposure: {
      top_10: [],
      total_brand_mentions: 0,
      note: 'No subsidiary exposure data available',
    },
    brand_message_placement: { total_placements: 0, placements: [] },
    weekly_volume_trend: {
      print: { weekly_breakdown: [] },
      online: { weekly_breakdown: [] },
    },
    monthly_volume_trend: { monthly_breakdown: [] },
  },
};

export function BrandMediaAnalysisPage() {
  const { token, activePair } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [data, setData] = useState<AnalysisData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  const API_URL = 'https://pplus-7q0p.onrender.com/api/v1/report/brand-media-analysis';

  const getCurrentMonthRange = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const firstDay = `${year}-${month}-01`;
    const lastDay = new Date(year, today.getMonth() + 1, 0).toISOString().slice(0, 10);
    return { start: firstDay, end: lastDay };
  };

  const fetchData = async () => {
    if (!token || !activePair) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('pair_id', String(activePair.pair_id));

      let startDate: string;
      let endDate: string;

      if (filterValues.dateRange && Array.isArray(filterValues.dateRange)) {
        const [selectedStart, selectedEnd] = filterValues.dateRange as [string | null, string | null];
        if (selectedStart && selectedEnd) {
          if (new Date(selectedStart) > new Date(selectedEnd)) {
            toast.error('Start date must be before or equal to end date');
            setLoading(false);
            return;
          }
          startDate = selectedStart;
          endDate = selectedEnd;
        } else {
          setLoading(false);
          return;
        }
      } else {
        const { start, end } = getCurrentMonthRange();
        startDate = start;
        endDate = end;
      }

      params.append('startDate', startDate);
      params.append('endDate', endDate);

      const url = `${API_URL}?${params.toString()}`;
      console.log('Fetching Brand Media Analysis →', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        setData(result.data);
        setHasData(true);
      } else {
        const fallbackPeriod = { start: startDate, end: endDate };
        setData({
          ...DEFAULT_DATA,
          company: activePair.base_company.company_name || 'Your Company',
          period: fallbackPeriod,
        });
        setHasData(false);

        if (result.message && (result.message.includes('No editorials') || result.message.includes('No data') || result.message.includes('No media'))) {
          toast.info(`No media mentions found for ${activePair.base_company.company_name} in the selected period`);
        }
      }
    } catch (err) {
      console.error('Fetch failed:', err);
      toast.error('Failed to load brand media analysis');
      setData({
        ...DEFAULT_DATA,
        company: activePair?.base_company.company_name || 'Your Company',
      });
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, activePair, filterValues.dateRange]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
  };

  const weeklyData = useMemo(() => {
    const { print, online } = data.analysis.weekly_volume_trend;

    const allWeeks = new Set<string>();
    print.weekly_breakdown.forEach((w) => allWeeks.add(w.week));
    online.weekly_breakdown.forEach((w) => allWeeks.add(w.week));

    return Array.from(allWeeks)
      .sort((a, b) => {
        const numA = parseInt(a.replace('Week ', ''));
        const numB = parseInt(b.replace('Week ', ''));
        return numA - numB;
      })
      .map((week) => ({
        week,
        printMedia: print.weekly_breakdown.find((item) => item.week === week)?.count || 0,
        onlineMedia: online.weekly_breakdown.find((item) => item.week === week)?.count || 0,
      }));
  }, [data.analysis.weekly_volume_trend]);

  const monthlyData = useMemo(() => {
    return data.analysis.monthly_volume_trend.monthly_breakdown.map((item) => {
      const monthNum = parseInt(item.month.split('-')[1]);
      const monthName = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ][monthNum - 1];

      return {
        month: monthName,
        fullLabel: item.month,
        printMedia: item.print.count || 0,
        onlineMedia: item.online.count || 0,
      };
    });
  }, [data.analysis.monthly_volume_trend]);

  const subsidiaryPieData = useMemo(() => {
    return data.analysis.brand_subsidiary_exposure.top_10.map((item) => ({
      name: item.brand,
      value: parseFloat(item.percentage) || 0,
    }));
  }, [data.analysis.brand_subsidiary_exposure.top_10]);

  const placementPieData = useMemo(() => {
    return data.analysis.brand_message_placement.placements.map((item) => ({
      name: item.placement,
      value: parseFloat(item.percentage) || 0,
    }));
  }, [data.analysis.brand_message_placement.placements]);

  const filterOptions = [
    {
      key: 'dateRange',
      label: 'Select Date Range',
      type: 'daterange',
      placeholder: 'Pick start and end date',
      closeOnSelect: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-purple-600" />
        <span className="ml-3 md:ml-4 text-base md:text-lg">
          Loading media analysis for <strong>{activePair?.base_company.company_name || 'your company'}</strong>...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-6 animate-fade-in">
      {/* Header - Responsive */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-xl md:rounded-2xl p-5 md:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 rounded-full bg-white/10 transform translate-x-20 -translate-y-20 md:translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 md:w-48 md:h-48 rounded-full bg-white/5 transform -translate-x-16 translate-y-16 md:-translate-x-24 translate-y-24"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 tracking-tight">
              Brand Media Analysis
            </h1>
            <p className="text-purple-100 text-base md:text-lg">
              {activePair?.base_company.company_name || 'Your Company'} •{' '}
              {data.period.start
                ? `${formatDate(data.period.start)} – ${formatDate(data.period.end)}`
                : 'Current Month'}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 md:p-4 self-center md:self-auto">
            <BarChart2 size={24} className="md:size-32 text-white" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <UniversalFilter
        filters={filterOptions}
        values={filterValues}
        onChange={setFilterValues}
        onReset={() => setFilterValues({})}
      />

      {!hasData && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
          No media mentions found for {activePair?.base_company.company_name || 'your company'} in the selected period. Charts below show zero values.
        </div>
      )}

      {/* KPI Cards - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <DataCard title="News Mentions" variant="glass" icon={<Newspaper className="text-indigo-600" />}>
          <div className="text-2xl md:text-4xl font-bold text-indigo-600">
            {data.analysis.news_mention.total.toLocaleString()}
          </div>
          <div className="text-xs md:text-sm text-gray-500 mt-1">
            {data.analysis.news_mention.breakdown.headline} headlines • {data.analysis.news_mention.breakdown.advertorial} advertorials
          </div>
        </DataCard>

        <DataCard title="Photo Mentions" variant="glass" icon={<Image className="text-cyan-600" />}>
          <div className="text-2xl md:text-4xl font-bold text-cyan-600">
            {data.analysis.photo_mention.total.toLocaleString()}
          </div>
          <div className="text-xs md:text-sm text-gray-500 mt-1">Visual brand appearances</div>
        </DataCard>

        <DataCard title="Video Mentions" variant="glass" icon={<Video className="text-emerald-600" />}>
          <div className="text-2xl md:text-4xl font-bold text-emerald-600">
            {data.analysis.video_mention.total.toLocaleString()}
          </div>
          <div className="text-xs md:text-sm text-gray-500 mt-1">Video brand mentions</div>
        </DataCard>

        <DataCard title="Potential Reach" variant="glass" icon={<Users className="text-amber-600" />}>
          <div className="text-2xl md:text-4xl font-bold text-amber-600">
            {data.analysis.potential_reach.combined_reach.toLocaleString()}
          </div>
          <div className="text-xs md:text-sm text-gray-500 mt-1">
            {data.analysis.potential_reach.print.total_reach.toLocaleString()} print •{' '}
            {data.analysis.potential_reach.online.total_reach.toLocaleString()} online
          </div>
        </DataCard>
      </div>

      {/* Charts - Stack on mobile, 1×2 or 2×2 on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
        {/* Subsidiary Exposure */}
        <DataCard title="Subsidiary/Brand Exposure" variant="glass" icon={<PieChartIcon className="text-indigo-600" />}>
          <div className={cn("h-64 sm:h-72 md:h-80 lg:h-96")}>
            {subsidiaryPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subsidiaryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius="45%"
                    outerRadius="80%"
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {subsidiaryPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                  <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <PieChartIcon size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm md:text-base">
                    {data.analysis.brand_subsidiary_exposure.note || 'No subsidiary exposure recorded'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DataCard>

        {/* Message Placement */}
        <DataCard title="Message Placement" variant="glass" icon={<PieChartIcon className="text-cyan-600" />}>
          <div className={cn("h-64 sm:h-72 md:h-80 lg:h-96")}>
            {placementPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={placementPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius="45%"
                    outerRadius="80%"
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {placementPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                  <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <PieChartIcon size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm md:text-base">No placement data available</p>
                </div>
              </div>
            )}
          </div>
        </DataCard>

        {/* Weekly Trend */}
        <DataCard title="Weekly Media Volume Trend" variant="glass" icon={<LineChartIcon className="text-emerald-600" />}>
          <div className={cn("h-64 sm:h-72 md:h-80 lg:h-96")}>
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="onlineWeekly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="printWeekly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
                  <Area type="monotone" dataKey="onlineMedia" name="Online" stroke="#06B6D4" fill="url(#onlineWeekly)" strokeWidth={2} />
                  <Area type="monotone" dataKey="printMedia" name="Print" stroke="#10B981" fill="url(#printWeekly)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <LineChartIcon size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm md:text-base">No weekly trend data available</p>
                </div>
              </div>
            )}
          </div>
        </DataCard>

        {/* Monthly Trend */}
        <DataCard title="Monthly Media Volume Trend" variant="glass" icon={<LineChartIcon className="text-amber-600" />}>
          <div className={cn("h-64 sm:h-72 md:h-80 lg:h-96")}>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="onlineMonthly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="printMonthly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip labelFormatter={(label) => `2025 ${label}`} />
                  <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
                  <Area type="monotone" dataKey="onlineMedia" name="Online" stroke="#F59E0B" fill="url(#onlineMonthly)" strokeWidth={2} />
                  <Area type="monotone" dataKey="printMedia" name="Print" stroke="#EF4444" fill="url(#printMonthly)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <LineChartIcon size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm md:text-base">No monthly trend data available</p>
                </div>
              </div>
            )}
          </div>
        </DataCard>
      </div>
    </div>
  );
}