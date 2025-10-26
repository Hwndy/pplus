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
} from 'recharts';

export function MediaDistributionPage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [thematicData, setThematicData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
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

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;

    const fetchThematicData = async () => {
      setDataLoading(true);
      try {
        let url = 'https://pplus-6xcn.onrender.com/api/report/top-thematic-distribution-breakdown';
        const month = getMonthFromDateRange(filterValues.dateRange);
        if (month) url += `?month=${month}&company=${user.company || 'Glo Nigeria'}`;
        else url += '?company=Glo Nigeria';

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (result.success) {
          setThematicData(result.data);
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
  }, [authLoading, isAuthenticated, user, token, filterValues]);

  const chartData = thematicData?.items.map((item, index) => ({
    name: item.title,
    value: 1, // Fixed value for bar height, as items are unique occurrences
    color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5],
  })) || [];

  if (authLoading || dataLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
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

      <UniversalFilter
        filters={filterOptions}
        values={filterValues}
        onChange={setFilterValues}
        onReset={resetFilters}
      />

      <div className="grid grid-cols-1 gap-6">
        <DataCard title="Thematic Distribution of Media Activities" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 1]} hide />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip
                  formatter={(value) => `${value}`}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', border: 'none' }}
                />
                <Bar dataKey="value" fill={(entry) => entry.color} name="Occurrences" barSize={20} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </DataCard>

        <DataCard title="Thematic Distribution Breakdown" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="p-4">
            {thematicData?.items.map((item, index) => (
              <div key={item.title} className="mb-4 border rounded-md overflow-hidden">
                <div className="flex">
                  <div
                    className="w-16 flex items-center justify-center p-4 text-2xl font-bold"
                    style={{ backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5] }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="p-4 bg-muted/20 flex-1">
                    <h3 className="text-lg font-semibold mb-2">{item.activity}</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li className="text-sm">{item.title}</li>
                    </ul>
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