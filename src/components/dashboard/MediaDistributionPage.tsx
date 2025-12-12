import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { BarChart2, Activity } from 'lucide-react';
import { UniversalFilter, FilterOption, FilterValues } from '@/components/ui/UniversalFilter';
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
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [thematicData, setThematicData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Use company directly from logged-in user
  const companyName = user?.company_name || user?.company || 'Your Company';

  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()} ${currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short', hour12: true })}`;

  const filterOptions: FilterOption[] = [
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange',
      placeholder: 'Select date range',
    },
    // {
    //   key: 'thematicArea',
    //   label: 'Thematic Area',
    //   type: 'multiselect',
    //   options: [
    //     { value: 'financial_services', label: 'Financial Services' },
    //     { value: 'banking', label: 'Banking' },
    //     { value: 'investment', label: 'Investment' },
    //     { value: 'insurance', label: 'Insurance' },
    //     { value: 'fintech', label: 'Fintech' },
    //     { value: 'regulation', label: 'Regulation' },
    //   ],
    // },
    // {
    //   key: 'mediaType',
    //   label: 'Media Type',
    //   type: 'select',
    //   options: [
    //     { value: 'online', label: 'Online Media' },
    //     { value: 'print', label: 'Print Media' },
    //   ],
    // },
    // {
    //   key: 'activityType',
    //   label: 'Activity Type',
    //   type: 'multiselect',
    //   options: [
    //     { value: 'news', label: 'News Coverage' },
    //     { value: 'interview', label: 'Interviews' },
    //     { value: 'press_release', label: 'Press Releases' },
    //     { value: 'opinion', label: 'Opinion Pieces' },
    //     { value: 'analysis', label: 'Analysis' },
    //   ],
    // },
  ];

  const resetFilters = () => setFilterValues({});

  const getMonthFromDateRange = (dateRange: any): string | null => {
    if (!dateRange?.start) return null;
    const start = new Date(dateRange.start);
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated || !token || !companyName) return;

    const fetchThematicData = async () => {
      setDataLoading(true);
      try {
        const month = getMonthFromDateRange(filterValues.dateRange);
        const params = new URLSearchParams();
        params.append('company', companyName);
        if (month) params.append('month', month);

        // Optional: apply other filters if needed (backend must support them)
        if (filterValues.mediaType) params.append('media_type', filterValues.mediaType as string);
        if (filterValues.thematicArea) {
          (filterValues.thematicArea as string[]).forEach(t => params.append('thematic_area', t));
        }
        if (filterValues.activityType) {
          (filterValues.activityType as string[]).forEach(t => params.append('activity_type', t));
        }

        const url = `https://backend-55pc.onrender.com/api/report/top-thematic-distribution-breakdown?${params.toString()}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();

        if (result.success && result.data?.items) {
          const limitedItems = result.data.items.slice(0, 10);
          setThematicData({ ...result.data, items: limitedItems });
        } else {
          setThematicData({ items: [] });
          toast.info(result.message || 'No thematic data available');
        }
      } catch (err) {
        console.error('Error fetching thematic distribution:', err);
        toast.error('Failed to load media distribution');
        setThematicData({ items: [] });
      } finally {
        setDataLoading(false);
      }
    };

    fetchThematicData();
  }, [authLoading, isAuthenticated, token, companyName, filterValues]);

  const colors = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8',
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  ];

  const chartData = thematicData?.items.map((item: any, index: number) => ({
    activity: item.activity,
    title: item.title,
    value: 1,
    fill: colors[index % colors.length],
  })) || [];

  const chartHeight = Math.max(400, chartData.length * 50 + 60);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{data.activity}</p>
          <p className="text-sm text-gray-600 mt-1">{data.title}</p>
          <p className="text-xs text-gray-500 mt-2">Occurrences: {data.value}</p>
        </div>
      );
    }
    return null;
  };

  if (authLoading || dataLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Distribution of Media Activities</h1>
            <p className="text-orange-100 text-lg">Thematic analysis and media activity breakdown</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Activity size={32} className="text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-orange-100">Last Updated</div>
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

      {/* Charts & Breakdown */}
      <div className="grid grid-cols-1 gap-6">
        {/* Bar Chart */}
        <DataCard title="Thematic Distribution of Media Activities" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="w-full overflow-x-auto">
            <div style={{ minWidth: '600px' }}>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <RechartsBarChart layout="vertical" data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis type="number" domain={[0, 1]} hide />
                  <YAxis
                    dataKey="activity"
                    type="category"
                    width={170}
                    tick={{ fontSize: 13, fill: '#374151' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                  <Bar dataKey="value" barSize={28} radius={[0, 4, 4, 0]}>
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </DataCard>

        {/* Thematic Breakdown List */}
        <DataCard title="Thematic Distribution Breakdown" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="p-4 space-y-4">
            {thematicData?.items.length > 0 ? (
              thematicData.items.map((item: any, index: number) => (
                <div key={item.title} className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="flex">
                    <div
                      className="w-16 flex items-center justify-center p-4 text-2xl font-bold text-white"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="p-4 bg-muted/20 flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{item.activity}</h3>
                      <p className="text-sm text-muted-foreground">{item.title}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No media activities found for the selected period
              </div>
            )}
          </div>
        </DataCard>
      </div>
    </div>
  );
}