import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { BarChart2, Activity, Loader2 } from 'lucide-react';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { DataCard } from '@/components/ui/DataCard';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export function MediaDistributionPage() {
  const { token, activePair } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [thematicData, setThematicData] = useState<any>({
    total_editorials: 0,
    unique_activities: 0,
    activities: [],
  });
  const [loading, setLoading] = useState(false);

  const companyName = activePair?.base_company.company_name || 'Your Company';

  const hasValidDateRange =
    filterValues.dateRange &&
    Array.isArray(filterValues.dateRange) &&
    filterValues.dateRange[0] &&
    filterValues.dateRange[1];

  const filterOptions: any[] = [
    {
      key: 'dateRange',
      label: 'Select Date Range',
      type: 'daterange',
      placeholder: 'Pick date range',
      closeOnSelect: true,
    },
  ];

  const resetFilters = () => setFilterValues({});

  const formatDate = (date: string) => {
    const [year, month, day] = date.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${parseInt(day)} ${monthNames[parseInt(month) - 1]} ${year}`;
  };

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

  const fetchThematicData = useCallback(async () => {
    if (!token || !activePair) {
      setThematicData({ total_editorials: 0, unique_activities: 0, activities: [] });
      setLoading(false);
      return;
    }

    let shouldFetch = true;

    if (filterValues.dateRange) {
      const [start, end] = filterValues.dateRange as [string | null, string | null];
      if (!start || !end) {
        shouldFetch = false;
      } else if (new Date(start!) > new Date(end!)) {
        toast.error('Start date must be before or equal to end date');
        shouldFetch = false;
      }
    } else {
      shouldFetch = false;
    }

    if (!shouldFetch) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('pair_id', String(activePair.pair_id));

      const [startDate, endDate] = filterValues.dateRange as [string, string];
      params.append('startDate', startDate);
      params.append('endDate', endDate);

      const url = `https://p-fw0o.onrender.com/api/v1/report/top-thematic-distribution-breakdown?${params.toString()}`;
      console.log('Fetching Media Distribution →', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        setThematicData(result.data);
      } else {
        setThematicData({
          total_editorials: 0,
          unique_activities: 0,
          activities: [],
        });
        if (result.message && !result.message.includes('No')) {
          toast.info(result.message);
        }
      }
    } catch (err: any) {
      console.error('Error fetching thematic distribution:', err);
      toast.error('Failed to load media distribution');
      setThematicData({
        total_editorials: 0,
        unique_activities: 0,
        activities: [],
      });
    } finally {
      setLoading(false);
    }
  }, [token, activePair, filterValues.dateRange]);

  useEffect(() => {
    fetchThematicData();
  }, [fetchThematicData]);

  const colors = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8',
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  ];

  const chartData = thematicData?.activities?.map((item: any, index: number) => ({
    activity: item.activity,
    frequency: item.frequency,
    percentage: parseFloat(item.percentage),
    fill: colors[index % colors.length],
    sample_editorials: item.sample_editorials || [],
  })) || [];

  const chartHeight = Math.max(400, chartData.length * 50 + 60);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{data.activity}</p>
          <p className="text-sm text-gray-600 mt-1">Frequency: {data.frequency}</p>
          <p className="text-xs text-gray-500 mt-1">Percentage: {data.percentage.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-4 border border-gray-100">
            <Loader2 className="w-12 h-12 animate-spin text-orange-600" />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">
                Loading media distribution for {companyName}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(displayDates.start)} – {formatDate(displayDates.end)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Distribution of Media Activities</h1>
            <p className="text-white text-lg">Thematic analysis and media activity breakdown</p>
            {activePair && (
              <p className="text-white text-sm mt-1">Currently viewing: <strong>{activePair.base_company.company_name}</strong></p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Activity size={32} className="text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-white">Total Editorials</div>
              <div className="text-2xl font-bold text-white">
                {thematicData?.total_editorials || 0}
              </div>
              <div className="text-sm text-white">
                {thematicData?.unique_activities || 0} unique activities
              </div>
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

      {/* Charts & Breakdown */}
      <div className="grid grid-cols-1 gap-6">
        {/* Bar Chart */}
        <DataCard title="Thematic Distribution of Media Activities" variant="glass" icon={<BarChart2 size={24} />}>
          {chartData.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <div style={{ minWidth: '600px' }}>
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <RechartsBarChart layout="vertical" data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="activity"
                      type="category"
                      width={170}
                      tick={{ fontSize: 13, fill: '#374151' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                    <Bar dataKey="frequency" barSize={28} radius={[0, 4, 4, 0]}>
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {hasValidDateRange
                ? `No media activities found for ${companyName} in the selected period`
                : 'Select a date range to view media distribution'}
            </div>
          )}
        </DataCard>

        {/* Thematic Breakdown List with Sample Editorials */}
        <DataCard title="Thematic Distribution Breakdown" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="p-4 space-y-6">
            {chartData.length > 0 ? (
              chartData.map((item: any, index: number) => (
                <div key={item.activity} className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="flex">
                    <div
                      className="w-16 flex items-center justify-center p-4 text-2xl font-bold text-white"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="p-4 bg-gray-50 flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.activity}</h3>
                        <span className="text-sm font-medium text-gray-600">{item.percentage.toFixed(2)}%</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Frequency: {item.frequency} occurrences</p>

                      {/* Sample Editorials */}
                      {item.sample_editorials && item.sample_editorials.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-medium text-gray-700 mb-2">Sample Headlines:</p>
                          <ul className="space-y-2 text-xs text-gray-600">
                            {item.sample_editorials.map((editorial: any, i: number) => (
                              <li key={i} className="pl-4 relative">
                                <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                {editorial.title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                {hasValidDateRange
                  ? `No media activities found for ${companyName} in the selected period`
                  : 'Select a date range to view the breakdown'}
              </div>
            )}
          </div>
        </DataCard>
      </div>
    </div>
  );
}