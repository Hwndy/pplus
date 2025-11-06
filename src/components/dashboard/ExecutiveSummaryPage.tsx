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

interface SummaryData {
  company: string;
  period: { start: string; end: string; month: string };
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
  };
}

const DEFAULT_ZERO_DATA: SummaryData = {
  company: 'Your Company',
  period: { start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0], month: '' },
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
  },
};

export function ExecutiveSummaryPage() {
  const { token } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [data, setData] = useState<SummaryData>(DEFAULT_ZERO_DATA);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  const API_URL = 'https://pplus-ec37.onrender.com/api/report/executive-summary';

  const fetchData = useCallback(async () => {
    if (!token) {
      toast.error('Please log in to view your report');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();

      // ONLY SEND 'month' in YYYY-MM format — this is what backend expects
      if (filterValues.dateRange) {
        const [start] = filterValues.dateRange as [string, string];
        const date = new Date(start);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        params.append('month', `${year}-${month}`);
      }

      // All other filters are IGNORED — backend doesn't support them for this endpoint
      // But we keep them in UI for future use

      const url = `${API_URL}?${params.toString()}`;
      console.log('Fetching Executive Summary →', url); // Debug in console

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
        // No data → show clean zeros
        const companyName = result.data?.company || 'Your Company';
        const period = result.data?.period || DEFAULT_ZERO_DATA.period;

        setData({
          ...DEFAULT_ZERO_DATA,
          company: companyName,
          period: {
            start: period.start || DEFAULT_ZERO_DATA.period.start,
            end: period.end || DEFAULT_ZERO_DATA.period.end,
            month: period.month || '',
          },
        });
        setHasData(false);

        if (result.message?.includes('No editorials')) {
          toast.info('No media mentions found for this month');
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to connect to server');
      setData(DEFAULT_ZERO_DATA);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  }, [token, filterValues.dateRange]); // Only re-fetch when date changes

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived values — safe even with zero data
  const totalMentions = data.summary.totalMediaExposure ||
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

  const weeklyTrendData = [
    { week: 'Week 1', onlineMedia: 0, printMedia: 0 },
    { week: 'Week 2', onlineMedia: 0, printMedia: 0 },
    { week: 'Week 3', onlineMedia: 0, printMedia: 0 },
    { week: 'Week 4', onlineMedia: 0, printMedia: 0 },
  ];

  const competitiveShareData = [
    { name: data.company || 'Your Company', value: 100 },
    { name: 'Others', value: 0 },
  ];

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
  };

  // Keep all filters in UI (for future), but only dateRange works now
  const filterOptions = [
    { 
      key: 'dateRange', 
      label: 'Select Month', 
      type: 'daterange', 
      placeholder: 'Pick a month',
      // Optional: restrict to month picker only
      // You can enhance UniversalFilter to support mode="month" if needed
    },
    {
      key: 'mediaType',
      label: 'Media Type',
      type: 'multiselect',
      options: [
        { value: 'online', label: 'Online Media' },
        { value: 'print', label: 'Print Media' },
      ],
    },
    {
      key: 'language',
      label: 'Language',
      type: 'multiselect',
      options: [
        { value: 'english', label: 'English' },
        { value: 'other', label: 'Other Languages' },
      ],
    },
    {
      key: 'sentiment',
      label: 'Sentiment',
      type: 'multiselect',
      options: [
        { value: 'positive', label: 'Positive' },
        { value: 'neutral', label: 'Neutral' },
        { value: 'negative', label: 'Negative' },
      ],
    },
    {
      key: 'region',
      label: 'Region',
      type: 'select',
      options: [
        { value: 'local', label: 'Local Media' },
        { value: 'international', label: 'International Media' },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <span className="ml-4 text-lg">Loading your executive summary...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
          Executive Summary - {data.company}
        </h2>
        <div className="text-sm text-gray-500">
          {formatDate(data.period.start)} – {formatDate(data.period.end)}
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
          No media mentions found for the selected month. Showing zero values.
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
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="90%"
                  dataKey="value"
                  paddingAngle={3}
                >
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
              <div className="text-2xl font-bold text-cyan-600">
                {data.summary.language.english}
              </div>
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
              <div className="text-2xl font-bold text-emerald-600">
                {data.summary.mediaVehicle.online}
              </div>
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
                <Area type="monotone" dataKey="onlineMedia" stroke="#4F46E5" fill="url(#onlineGrad)" />
                <Area type="monotone" dataKey="printMedia" stroke="#10B981" fill="url(#printGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DataCard>

        <DataCard title="Competitive Media Share" variant="glass" icon={<BarChart2 className="text-purple-600" />}>
          <div className="h-80 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={competitiveShareData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                  {competitiveShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#8B5CF6' : '#e5e7eb'} />
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