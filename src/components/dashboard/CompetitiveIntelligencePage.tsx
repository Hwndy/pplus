import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DataCard } from '@/components/ui/DataCard';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { BarChart2, Loader2 } from 'lucide-react';

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const getColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
};

const CompanyIcon = ({ company }: { company: string }) => {
  const initial = company.charAt(0).toUpperCase();
  const bgColor = getColor(company);

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
      style={{ backgroundColor: bgColor }}
    >
      {initial}
    </div>
  );
};

export function CompetitiveIntelligencePage() {
  const { token, activePair } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  const API_URL = 'https://p-fw0o.onrender.com/api/v1/report/competitive-intelligence';

  const fetchData = useCallback(async () => {
    if (!token || !activePair) {
      setLoading(false);
      return;
    }

    // Wait for complete date range
    if (filterValues.dateRange) {
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
    } else {
      setLoading(false);
      return; // No date range selected yet
    }

    setLoading(true);
    setHasData(false);

    try {
      const params = new URLSearchParams();
      params.append('pair_id', String(activePair.pair_id));

      const [startDate, endDate] = filterValues.dateRange as [string, string];
      params.append('startDate', startDate);
      params.append('endDate', endDate);

      const url = `${API_URL}?${params.toString()}`;
      console.log('Fetching Competitive Intelligence →', url);

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
        if (result.message?.includes('No data') || result.message?.includes('not found')) {
          toast.info(`No competitive intelligence data found for the selected period`);
        }
      }
    } catch (err) {
      console.error('Error fetching competitive intelligence:', err);
      toast.error('Failed to load competitive intelligence data');
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <span className="ml-4 text-lg">
          Loading competitive intelligence for {activePair?.base_company.company_name || 'your company'} ({industryName} Industry)...
        </span>
      </div>
    );
  }

  // No date selected yet
  if (!displayDates) {
    return (
      <div className="space-y-6 animate-fade-in ">
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <h2 className="text-2xl font-bold text-white text-transparent bg-clip-text">
          Competitive Intelligence - {activePair?.base_company.company_name || 'Your Company'} ({industryName} Industry)
        </h2>
        </div>

        <UniversalFilter
          filters={filterOptions}
          values={filterValues}
          onChange={setFilterValues}
          onReset={() => setFilterValues({})}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center text-blue-800">
          <BarChart2 className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <p className="text-lg font-medium">Select a date range to view competitive intelligence</p>
          <p className="text-sm mt-2 text-blue-600">Compare media presence across competitors in your industry</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  let mediaShareData: { name: string; value: number }[] = [];
  if (hasData) {
    const companyFreq = new Map<string, number>();
    let totalMentions = 0;
    Object.values(data.competitive_intelligence || {}).forEach((sector: any) => {
      sector.analysis?.competitive_media_share?.shares?.forEach((share: any) => {
        const name = share.company.trim();
        const freq = parseFloat(share.frequency) || 0;
        companyFreq.set(name, (companyFreq.get(name) || 0) + freq);
        totalMentions += freq;
      });
    });
    mediaShareData = Array.from(companyFreq.entries())
      .map(([name, freq]) => ({
        name,
        value: (freq / totalMentions) * 100 || 0,
      }))
      .sort((a, b) => b.value - a.value);
  }

  const prominences = hasData ? data.monitoring_summary?.media_prominences || [] : [];

  const mediaProminenceData: Record<string, { name: string; value: number }[]> = {};
  if (hasData) {
    prominences.forEach((prominence: string) => {
      const companyFreq = new Map<string, number>();
      let totalMentions = 0;
      Object.values(data.competitive_intelligence || {}).forEach((sector: any) => {
        const analysis = sector.analysis?.media_prominence_analysis?.[prominence];
        if (analysis?.companies) {
          analysis.companies.forEach((c: any) => {
            const name = c.company.trim();
            const freq = parseFloat(c.frequency) || 0;
            companyFreq.set(name, (companyFreq.get(name) || 0) + freq);
          });
          totalMentions += parseFloat(analysis.total_mentions) || 0;
        }
      });
      if (totalMentions > 0) {
        const entries = Array.from(companyFreq.entries())
          .map(([name, freq]) => ({
            name,
            value: (freq / totalMentions) * 100 || 0,
          }))
          .sort((a, b) => b.value - a.value);
        mediaProminenceData[prominence] = entries;
      }
    });
  }

  const totalEditorials = hasData
    ? Object.values(data.competitive_intelligence || {}).reduce(
        (sum: number, sector: any) => sum + (sector.total_editorials || 0),
        0
      )
    : 0;

  const uniqueActivities = hasData
    ? new Set(
        Object.values(data.competitive_intelligence || {}).flatMap((sector: any) =>
          sector.summary?.activities || []
        )
      ).size
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Competitive Intelligence - {activePair?.base_company.company_name || 'Your Company'} - ({industryName} Industry)
              </h1>
              <p className="text-indigo-100">Media presence comparison across industry competitors</p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm text-indigo-100">Reporting Period</div>
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
          No competitive intelligence data found for the selected period. Try adjusting the date range.
        </div>
      )}

      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Competitive Media Share */}
          {mediaShareData.length > 0 && (
            <DataCard title="Competitive Media Share" variant="glass" icon={<BarChart2 size={24} className="text-indigo-600" />}>
              <div className="h-[680px]">
                <ResponsiveContainer width="100%" height="50%">
                  <BarChart
                    data={mediaShareData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12, fill: '#374151' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                      {mediaShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2 px-4">
                  {mediaShareData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CompanyIcon company={entry.name} />
                      <span className="text-sm text-gray-700 truncate">{entry.name}</span>
                      <span className="ml-auto font-medium text-gray-900">{entry.value.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </DataCard>
          )}

          {/* Media Prominence Charts */}
          {Object.entries(mediaProminenceData).map(([prominence, chartData]) => (
            <DataCard
              key={prominence}
              title={`Media Prominence: ${prominence}`}
              variant="glass"
              icon={<BarChart2 size={24} className="text-purple-600" />}
            >
              <div className="h-[680px]">
                <ResponsiveContainer width="100%" height="50%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12, fill: '#374151' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2 px-4">
                  {chartData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CompanyIcon company={entry.name} />
                      <span className="text-sm text-gray-700 truncate">{entry.name}</span>
                      <span className="ml-auto font-medium text-gray-900">{entry.value.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </DataCard>
          ))}
        </div>
      )}

      {hasData && Object.keys(mediaProminenceData).length === 0 && mediaShareData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <BarChart2 className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <p>No competitive metrics available for this period</p>
        </div>
      )}
    </div>
  );
}