import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
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
  Bar,
} from 'recharts';
import {
  BarChart2,
  Globe,
  Newspaper,
  Award,
  PieChart as PieChartIcon,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const SENTIMENT_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

interface WeeklyBreakdown {
  week: string;
  count: number;
  percentage: string;
}

interface WeeklyTrend {
  print: {
    total: number;
    weekly_breakdown: WeeklyBreakdown[];
  };
  online: {
    total: number;
    weekly_breakdown: WeeklyBreakdown[];
  };
}

interface CompetitiveShare {
  company: string;
  frequency: number;
  percentage: string;
}

interface CompetitiveMediaShare {
  total_mentions: number;
  shares: CompetitiveShare[];
}

interface SummaryData {
  company: string;
  period: { start: string; end: string; month?: string };
  summary: {
    totalMediaExposure: number;
    brandExposureInLocalMedia: number;
    brandExposureInInternationalMedia: number;
    positiveMediaExposure: number;
    negativeMediaExposure: number;
    neutralMediaExposure: number;
    brandMediaReputationScore: number;
    language: {
      english: number;
      otherLanguages: number;
      breakdown: Record<string, number>;
    };
    mediaVehicle: {
      online: number;
      print: number;
    };
    weeklyTrendOnBrandMediaExposure?: WeeklyTrend;
    competitiveMediaShare?: CompetitiveMediaShare;
  };
}

const DEFAULT_ZERO_DATA: SummaryData = {
  company: 'Your Company',
  period: { start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
  summary: {
    totalMediaExposure: 0,
    brandExposureInLocalMedia: 0,
    brandExposureInInternationalMedia: 0,
    positiveMediaExposure: 0,
    negativeMediaExposure: 0,
    neutralMediaExposure: 0,
    brandMediaReputationScore: 0,
    language: { english: 0, otherLanguages: 0, breakdown: {} },
    mediaVehicle: { online: 0, print: 0 },
    weeklyTrendOnBrandMediaExposure: {
      online: { total: 0, weekly_breakdown: [] },
      print: { total: 0, weekly_breakdown: [] },
    },
    competitiveMediaShare: {
      total_mentions: 0,
      shares: [],
    },
  },
};

export function ExecutiveSummaryPage() {
  const { token, activePair } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [data, setData] = useState<SummaryData>(DEFAULT_ZERO_DATA);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  const API_URL = 'https://pplus-5kdv.onrender.com/api/report/executive-summary';

  const fetchData = useCallback(async () => {
    if (!token || !activePair) {
      setLoading(false);
      return;
    }

    let shouldFetch = true;

    // Only proceed if we have a complete date range
    if (filterValues.dateRange) {
      const [startDate, endDate] = filterValues.dateRange as [string | null, string | null];

      // If either date is missing → do NOT fetch yet
      if (!startDate || !endDate) {
        shouldFetch = false;
      } else if (new Date(startDate) > new Date(endDate)) {
        toast.error('Start date must be before or equal to end date');
        shouldFetch = false;
      }
    }

    // If no complete valid date range, don't trigger fetch
    if (!shouldFetch) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('pair_id', String(activePair.pair_id));

      if (filterValues.dateRange) {
        const [startDate, endDate] = filterValues.dateRange as [string, string];
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const url = `${API_URL}?${params.toString()}`;
      console.log('Fetching Executive Summary →', url);

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
        const companyName = activePair.base_company.company_name || 'Your Company';
        setData({
          ...DEFAULT_ZERO_DATA,
          company: companyName,
          period: result.data?.period || DEFAULT_ZERO_DATA.period,
        });
        setHasData(false);

        if (result.message?.includes('No editorials') || result.message?.includes('No data')) {
          toast.info(`No media mentions found for ${companyName} in the selected period`);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load executive summary');
      setData({
        ...DEFAULT_ZERO_DATA,
        company: activePair?.base_company.company_name || 'Your Company',
      });
      setHasData(false);
    } finally {
      setLoading(false);
    }
  }, [token, activePair, filterValues.dateRange]); // ← Fixed: only depend on dateRange, not full filterValues

  // Re-fetch when activePair changes or dateRange completes/changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived values
  const totalMentions =
    data.summary.totalMediaExposure ||
    data.summary.positiveMediaExposure + data.summary.negativeMediaExposure + data.summary.neutralMediaExposure;

  const sentimentData = [
    { name: 'Positive', value: Math.round((data.summary.positiveMediaExposure / (totalMentions || 1)) * 100) || 0 },
    { name: 'Neutral', value: Math.round((data.summary.neutralMediaExposure / (totalMentions || 1)) * 100) || 0 },
    { name: 'Negative', value: Math.round((data.summary.negativeMediaExposure / (totalMentions || 1)) * 100) || 0 },
  ];

  const languageData = Object.entries(data.summary.language.breakdown || {})
    .map(([lang, count]) => ({
      name: lang.charAt(0).toUpperCase() + lang.slice(1),
      value: count,
    }))
    .sort((a, b) => b.value - a.value);

  const mediaVehicleData = [
    { name: 'Online', value: data.summary.mediaVehicle.online },
    { name: 'Print', value: data.summary.mediaVehicle.print },
  ];

  // Weekly Trend Data — uses real data with fallback
  const weeklyTrendData = useMemo(() => {
    const trend = data.summary.weeklyTrendOnBrandMediaExposure;
    if (!trend || (!trend.online.weekly_breakdown.length && !trend.print.weekly_breakdown.length)) {
      return [
        { week: 'Week 1', onlineMedia: 0, printMedia: 0 },
        { week: 'Week 2', onlineMedia: 0, printMedia: 0 },
        { week: 'Week 3', onlineMedia: 0, printMedia: 0 },
        { week: 'Week 4', onlineMedia: 0, printMedia: 0 },
      ];
    }

    const weeksMap = new Map<string, { onlineMedia: number; printMedia: number }>();

    trend.online.weekly_breakdown.forEach((item) => {
      weeksMap.set(item.week, { ...(weeksMap.get(item.week) || {}), onlineMedia: item.count });
    });

    trend.print.weekly_breakdown.forEach((item) => {
      weeksMap.set(item.week, { ...(weeksMap.get(item.week) || {}), printMedia: item.count });
    });

    return Array.from(weeksMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, values]) => ({
        week,
        onlineMedia: values.onlineMedia ?? 0,
        printMedia: values.printMedia ?? 0,
      }));
  }, [data.summary.weeklyTrendOnBrandMediaExposure]);

  // Competitive Share — safe parsing
  const competitiveShareData = useMemo(() => {
    const share = data.summary.competitiveMediaShare;

    if (!share || !share.shares || share.shares.length === 0) {
      return [{ name: data.company?.trim() || 'Your Company', value: 100 }];
    }

    const parsed = share.shares
      .map((item) => {
        const percentage = parseFloat(item.percentage);
        if (isNaN(percentage) || percentage < 0) return null;
        return { name: item.company.trim(), value: percentage };
      })
      .filter((item): item is { name: string; value: number } => item !== null)
      .sort((a, b) => b.value - a.value);

    return parsed.length > 0
      ? parsed
      : [{ name: data.company?.trim() || 'Your Company', value: 100 }];
  }, [data.summary.competitiveMediaShare, data.company]);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
  };

  const filterOptions = [
    {
      key: 'dateRange',
      label: 'Select Period',
      type: 'daterange',
      placeholder: 'Select a date range',
      closeOnSelect: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <span className="ml-4 text-lg">
          Loading executive summary for {activePair?.base_company.company_name || 'your company'}...
        </span>
      </div>
    );
  }

  const getDisplayDates = () => {
    if (filterValues.dateRange) {
      const [start, end] = filterValues.dateRange as [string | null, string | null];
      if (start && end) return { start, end };
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return {
      start: `${year}-${month}-01`,
      end: `${year}-${month}-${day}`,
    };
  };

  const displayDates = getDisplayDates();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
          Executive Summary - {data.company}
        </h2>
        <div className="text-sm text-gray-500">
          {formatDate(displayDates.start)} – {formatDate(displayDates.end)}
        </div>
      </div>

      <UniversalFilter
        filters={filterOptions}
        values={filterValues}
        onChange={setFilterValues}
        onReset={() => setFilterValues({})}
      />

      {!hasData && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
          No media mentions found for {data.company} in the selected period. Showing zero values.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <DataCard title="Total Media Mentions" variant="glass" icon={<BarChart2 className="text-indigo-600" />}>
          <div className="text-3xl font-bold text-indigo-600">{totalMentions.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Total mentions</div>
        </DataCard>

        <DataCard title="Reputation Score" variant="glass" icon={<Award className="text-cyan-600" />}>
          <div className="text-3xl font-bold text-cyan-600">
            {data.summary.brandMediaReputationScore.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">out of 1.0</div>
        </DataCard>

        <DataCard title="Local Media Exposure" variant="glass" icon={<Newspaper className="text-emerald-600" />}>
          <div className="text-3xl font-bold text-emerald-600">
            {data.summary.brandExposureInLocalMedia.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Local mentions</div>
        </DataCard>

        <DataCard title="International Media" variant="glass" icon={<Globe className="text-amber-600" />}>
          <div className="text-3xl font-bold text-amber-600">
            {data.summary.brandExposureInInternationalMedia.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">International mentions</div>
        </DataCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DataCard title="Sentiment Analysis" variant="glass" icon={<PieChartIcon className="text-indigo-600" />}>
          <div className="h-80 relative p-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sentimentData} cx="50%" cy="50%" innerRadius="50%" outerRadius="90%" dataKey="value" paddingAngle={3}>
                  {sentimentData.map((_, i) => (
                    <Cell key={i} fill={SENTIMENT_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-2xl font-bold text-green-600">{sentimentData[0].value}%</div>
              <div className="text-xs text-gray-500">Positive</div>
            </div>
          </div>
        </DataCard>

        <DataCard title="Language Distribution" variant="glass" icon={<Globe className="text-cyan-600" />}>
          <div className="h-80 relative p-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languageData.length > 0 ? languageData : [{ name: 'No Data', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="90%"
                  dataKey="value"
                  paddingAngle={3}
                >
                  {(languageData.length > 0 ? languageData : [{ value: 1 }]).map((_, i) => (
                    <Cell key={i} fill={languageData.length > 0 ? COLORS[i % COLORS.length] : '#e5e7eb'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v} mentions`} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-2xl font-bold text-cyan-600">{data.summary.language.english}</div>
              <div className="text-xs text-gray-500">English</div>
            </div>
          </div>
        </DataCard>

        <DataCard title="Media Vehicle Distribution" variant="glass" icon={<Newspaper className="text-emerald-600" />}>
          <div className="h-80 relative p-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={totalMentions > 0 ? mediaVehicleData : [{ name: 'No Data', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="90%"
                  dataKey="value"
                  paddingAngle={3}
                >
                  {(totalMentions > 0 ? mediaVehicleData : [{ value: 1 }]).map((_, i) => (
                    <Cell key={i} fill={totalMentions > 0 ? COLORS[i] : '#e5e7eb'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v} mentions`} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-2xl font-bold text-emerald-600">{data.summary.mediaVehicle.online}</div>
              <div className="text-xs text-gray-500">Online</div>
            </div>
          </div>
        </DataCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard title="Weekly Trend on Brand Media Exposure" variant="glass" icon={<BarChart2 className="text-amber-600" />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData}>
                <defs>
                  <linearGradient id="onlineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="printGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="onlineMedia" stroke="#4F46E5" fill="url(#onlineGrad)" name="Online" />
                <Area type="monotone" dataKey="printMedia" stroke="#10B981" fill="url(#printGrad)" name="Print" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DataCard>

        <DataCard title="Competitive Media Share" variant="glass" icon={<BarChart2 className="text-purple-600" />}>
          <div className="h-80 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={competitiveShareData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} unit="%" />
                <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                  {competitiveShareData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name.includes(data.company.trim()) ? '#8B5CF6' : COLORS[index % COLORS.length]}
                    />
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