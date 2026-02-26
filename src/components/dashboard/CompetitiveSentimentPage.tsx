import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { DataCard } from '@/components/ui/DataCard';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { TrendingUp, BarChart2, Loader2 } from 'lucide-react';

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const getColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

const EntityIcon = ({ name }: { name: string }) => {
  const initial = name.charAt(0).toUpperCase();
  const bgColor = getColor(name);

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
      style={{ backgroundColor: bgColor }}
    >
      {initial}
    </div>
  );
};

export function CompetitiveSentimentPage() {
  const { token, activePair } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  const API_URL = 'https://pplus-7q0p.onrender.com/api/v1/report/competitive-intelligence';

  const fetchData = useCallback(async () => {
    if (!token || !activePair) {
      setLoading(false);
      return;
    }

    if (!filterValues.dateRange) {
      setLoading(false);
      return;
    }

    const [startDate, endDate] = filterValues.dateRange as [string | null, string | null];
    if (!startDate || !endDate) {
      setLoading(false);
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before or equal to end date');
      setLoading(false);
      return;
    }

    setLoading(true);
    setHasData(false);

    try {
      const params = new URLSearchParams();
      params.append('pair_id', String(activePair.pair_id));
      params.append('startDate', startDate);
      params.append('endDate', endDate);

      const url = `${API_URL}?${params.toString()}`;
      console.log('Fetching Competitive Sentiment →', url);

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
        setData(null);
        setHasData(false);
        toast.info('No sentiment data found for the selected period');
      }
    } catch (err) {
      console.error('Error fetching sentiment data:', err);
      toast.error('Failed to load competitive sentiment intelligence');
      setData(null);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  }, [token, activePair, filterValues.dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
  };

  const getDisplayDates = () => {
    if (filterValues.dateRange) {
      const [start, end] = filterValues.dateRange as [string | null, string | null];
      if (start && end) return { start, end };
    }
    return null;
  };

  const industryName = activePair?.base_company?.industry || 'Industry';
  const displayDates = getDisplayDates();

  const filterOptions = [
    {
      key: 'dateRange',
      label: 'Select Period',
      type: 'daterange',
      placeholder: 'Select start and end date',
      closeOnSelect: true,
    },
  ];

  // Aggregate sentiment data across all sectors
  const aggregatedSentiment = hasData
    ? (() => {
        const companyMap = new Map<string, { positive: number; negative: number; neutral: number }>();

        Object.values(data.competitive_intelligence || {}).forEach((sector: any) => {
          const sentimentIndex = sector.analysis?.media_sentiment_index;
          if (sentimentIndex) {
            Object.entries(sentimentIndex).forEach(([company, sent]: [string, any]) => {
              const current = companyMap.get(company) || { positive: 0, negative: 0, neutral: 0 };
              current.positive += sent.positive.frequency || 0;
              current.negative += sent.negative.frequency || 0;
              current.neutral += sent.neutral.frequency || 0;
              companyMap.set(company.trim(), current);
            });
          }
        });

        return Array.from(companyMap.entries()).map(([name, vals]) => {
          const total = vals.positive + vals.negative + vals.neutral;
          const score = total > 0
            ? parseFloat(((vals.positive - vals.negative) / total).toFixed(3))
            : 0;

          return {
            name: name.trim(),
            score,
            positive: vals.positive,
            negative: vals.negative,
            neutral: vals.neutral,
            total,
          };
        });
      })()
    : [];

  // Sort by sentiment score descending
  const sortedSentimentData = [...aggregatedSentiment].sort((a, b) => b.score - a.score);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        <span className="ml-4 text-lg">
          Loading sentiment intelligence for {activePair?.base_company.company_name || 'your company'} ({industryName} Industry)...
        </span>
      </div>
    );
  }

  // No date selected
  if (!displayDates) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <h2 className="text-3xl font-bold bg-gradient-to-r text-white text-transparent bg-clip-text">
              Competitive Sentiment Intelligence
            </h2>
        </div>


        <UniversalFilter
          filters={filterOptions}
          values={filterValues}
          onChange={setFilterValues}
          onReset={() => setFilterValues({})}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center text-blue-800">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <p className="text-lg font-medium">Select a date range to view sentiment analysis</p>
          <p className="text-sm mt-2 text-blue-600">
            Compare media tone and public perception across competitors
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Competitive Sentiment Intelligence</h1>
              <p className="text-cyan-100">Media tone and public perception across competitors</p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm text-cyan-100">Reporting Period</div>
              <div className="font-medium">
                {formatDate(displayDates.start)} – {formatDate(displayDates.end)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <UniversalFilter
        filters={filterOptions}
        values={filterValues}
        onChange={setFilterValues}
        onReset={() => setFilterValues({})}
      />

      {!hasData && displayDates && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
          No sentiment data available for the selected period. Try a broader date range.
        </div>
      )}

      {hasData && sortedSentimentData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sentiment Score Chart */}
          <DataCard
            title="Competitive Media Sentiment Score"
            subtitle="Score: -1 (Very Negative) → +1 (Very Positive)"
            variant="glass"
            icon={<TrendingUp size={24} className="text-emerald-600" />}
          >
            <div className="h-[1080px]">
              <ResponsiveContainer width="100%" height="50%">
                <BarChart
                  data={sortedSentimentData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" domain={[-1, 1]} ticks={[-1, -0.5, 0, 0.5, 1]} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 16, fill: '#374151' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(value: number) => value.toFixed(3)} />
                  <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={28}>
                    {sortedSentimentData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score >= 0 ? '#10b981' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-3 px-4">
                {sortedSentimentData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <EntityIcon name={entry.name} />
                      <span className="text-gray-700 font-medium truncate max-w-[180px]">
                        {entry.name}
                      </span>
                    </div>
                    <span className={`font-bold ${entry.score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.score >= 0 ? '+' : ''}{entry.score.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </DataCard>

          {/* Sentiment Frequency Chart */}
          <DataCard
            title="Competitive Media Sentiment Frequency"
            variant="glass"
            icon={<BarChart2 size={24} className="text-indigo-600" />}
          >
            <div className="h-[480px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedSentimentData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 16, fill: '#374151' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      value,
                      name.charAt(0).toUpperCase() + name.slice(1),
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                  <Bar dataKey="positive" stackId="a" fill="#10b981" name="Positive" />
                  <Bar dataKey="neutral" stackId="a" fill="#9ca3af" name="Neutral" />
                  <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Negative" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-3 px-4">
                {sortedSentimentData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <EntityIcon name={entry.name} />
                      <span className="text-gray-700 font-medium truncate max-w-[180px]">
                        {entry.name}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span className="text-green-600">+{entry.positive}</span>
                      <span className="text-gray-500">±{entry.neutral}</span>
                      <span className="text-red-600">−{entry.negative}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DataCard>
        </div>
      )}

      {hasData && sortedSentimentData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <TrendingUp className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <p>No sentiment data available for this period</p>
        </div>
      )}
    </div>
  );
}