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
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()} ${currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short', hour12: true })}`;

  const filterOptions: FilterOption[] = [
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange',
      placeholder: 'Select date range',
    },
    {
      key: 'thematicArea',
      label: 'Thematic Area',
      type: 'multiselect',
      options: [
        { value: 'financial_services', label: 'Financial Services' },
        { value: 'banking', label: 'Banking' },
        { value: 'investment', label: 'Investment' },
        { value: 'insurance', label: 'Insurance' },
        { value: 'fintech', label: 'Fintech' },
        { value: 'regulation', label: 'Regulation' },
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
    {
      key: 'activityType',
      label: 'Activity Type',
      type: 'multiselect',
      options: [
        { value: 'news', label: 'News Coverage' },
        { value: 'interview', label: 'Interviews' },
        { value: 'press_release', label: 'Press Releases' },
        { value: 'opinion', label: 'Opinion Pieces' },
        { value: 'analysis', label: 'Analysis' },
      ],
    },
  ];

  const resetFilters = () => setFilterValues({});

  const getMonthFromDateRange = (dateRange: any): string | null => {
    if (!dateRange?.start) return null;
    const start = new Date(dateRange.start);
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
  };

  // Determine company from competitive-intelligence endpoint (same pattern as other pages)
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;

    const determineCompany = async () => {
      setDataLoading(true);
      try {
        const month = getMonthFromDateRange(filterValues.dateRange);
        let url = 'https://pplus-uw2m.onrender.com/api/report/competitive-intelligence';
        if (month) url += `?month=${month}`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (result.success) {
          const compInt = result.data.competitive_intelligence;
          const subSectors = Object.keys(compInt);
          if (subSectors.length > 0) {
            const firstSub = subSectors[0];
            const companies = compInt[firstSub].companies_in_category;
            if (companies.length > 0) {
              setSelectedCompany(companies[0]);
              return;
            }
          }
        }
      } catch (err) {
        console.error('Error determining company:', err);
        toast.error('Error determining company');
      } finally {
        setDataLoading(false);
      }
    };

    determineCompany();
  }, [authLoading, isAuthenticated, user, token, filterValues]);

  // Fetch thematic data using determined company
  useEffect(() => {
    if (!selectedCompany || authLoading || !isAuthenticated) return;

    const fetchThematicData = async () => {
      setDataLoading(true);
      try {
        let url = 'https://pplus-uw2m.onrender.com/api/report/top-thematic-distribution-breakdown';
        const month = getMonthFromDateRange(filterValues.dateRange);
        const params = new URLSearchParams();
        if (month) params.append('month', month);
        params.append('company', selectedCompany);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (result.success) {
          // Limit to top 10
          const limitedItems = result.data.items.slice(0, 10);
          setThematicData({ ...result.data, items: limitedItems });
        } else {
          throw new Error(result.message || 'Failed to fetch thematic data');
        }
      } catch (err) {
        console.error('Error fetching thematic distribution:', err);
        toast.error('Error fetching thematic distribution');
        setThematicData(null);
      } finally {
        setDataLoading(false);
      }
    };

    fetchThematicData();
  }, [selectedCompany, filterValues, token, authLoading, isAuthenticated]);

  // Consistent color palette (same as breakdown)
  const colors = [
    '#0088FE', // Blue
    '#00C49F', // Teal
    '#FFBB28', // Yellow
    '#FF8042', // Orange
    '#8884d8', // Purple
    '#FF6384', // Pink
    '#36A2EB', // Light Blue
    '#FFCE56', // Light Yellow
    '#4BC0C0', // Cyan
    '#9966FF', // Violet
  ];

  const chartData = thematicData?.items.map((item: any, index: number) => ({
    activity: item.activity,
    title: item.title,
    value: 1,
    fill: colors[index % colors.length],
  })) || [];

  // Dynamic height: 50px per item + padding
  const chartHeight = Math.max(400, chartData.length * 50 + 60);

  // Custom Tooltip Component
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
                <RechartsBarChart
                  layout="vertical"
                  data={chartData}
                >
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
            {thematicData?.items.map((item: any, index: number) => (
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
            ))}
          </div>
        </DataCard>
      </div>
    </div>
  );
}