import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { Newspaper, Users, FileText, Globe, User, Quote } from 'lucide-react';
import { UniversalFilter, FilterOption, FilterValues } from '@/components/ui/UniversalFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-blue-600">{`${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

export function PublicationsAnalysisPage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [analysisData, setAnalysisData] = useState<any>(null);
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
      key: 'publicationType',
      label: 'Publication Type',
      type: 'select',
      options: [
        { value: 'print', label: 'Print Publications' },
        { value: 'online', label: 'Online Publications' },
      ],
    },
    {
      key: 'publication',
      label: 'Publication',
      type: 'multiselect',
      options: [
        { value: 'BusinessDay', label: 'BusinessDay' },
        { value: 'The Guardian', label: 'The Guardian' },
        { value: 'Punch', label: 'Punch' },
        { value: 'Vanguard', label: 'Vanguard' },
        { value: 'ThisDay', label: 'ThisDay' },
        { value: 'Premium Times', label: 'Premium Times' },
      ],
    },
    {
      key: 'reporter',
      label: 'Reporter',
      type: 'search',
      placeholder: 'Search reporters...',
    },
    {
      key: 'spokesperson',
      label: 'Spokesperson',
      type: 'multiselect',
      options: [
        { value: 'ceo', label: 'CEO' },
        { value: 'cfo', label: 'CFO' },
        { value: 'head_marketing', label: 'Head of Marketing' },
        { value: 'spokesperson', label: 'Company Spokesperson' },
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
        const company = user.company || 'Glo Nigeria';
        let url = `https://pplus-2myh.onrender.com/api/report/publication-reporter-spokesperson-analysis?company=${company}`;
        const month = getMonthFromDateRange(filterValues.dateRange);
        if (month) url += `&month=${month}`;

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
        console.error('Error fetching analysis data:', err);
        toast.error('Error fetching analysis data');
        setAnalysisData(null);
      } finally {
        setDataLoading(false);
      }
    };

    fetchAnalysisData();
  }, [authLoading, isAuthenticated, user, token, filterValues]);

  const printPublications = analysisData?.analysis?.print_publications_volume?.sources.map((s: any) => ({
    name: s.source,
    value: s.count,
    percentage: parseFloat(s.percentage),
  })) || [];

  const onlinePublications = analysisData?.analysis?.online_publications_volume?.sources.map((s: any) => ({
    name: s.source,
    value: s.count,
    percentage: parseFloat(s.percentage),
  })) || [];

  const printReporters = analysisData?.analysis?.print_reporters?.reporters.map((r: any) => ({
    name: r.reporter,
    publication: '', // No publication data in API, can be added if provided
    value: r.count,
    percentage: parseFloat(r.percentage),
  })) || [];

  const onlineReporters = analysisData?.analysis?.online_reporters?.reporters.map((r: any) => ({
    name: r.reporter,
    publication: '', // No publication data in API, can be added if provided
    value: r.count,
    percentage: parseFloat(r.percentage),
  })) || [];

  const spokespersons = []; // API doesn't provide spokesperson data; adjust if endpoint changes

  if (authLoading || dataLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Beautiful Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Publications & Spokespersons Analysis</h1>
            <p className="text-blue-100 text-lg">Media coverage insights and spokesperson performance metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Newspaper size={32} className="text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Last Updated</div>
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

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left side - Charts (3 columns) */}
        <div className="xl:col-span-3 space-y-8">
          {/* Publications Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Print Publications */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-lg">
                    <FileText size={20} className="text-white" />
                  </div>
                  Print Publications
                  <span className="text-sm font-normal text-gray-500">(Volume)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={printPublications}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                    >
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#374151' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="percentage"
                        fill="url(#blueGradient)"
                        radius={[0, 4, 4, 0]}
                      />
                      <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="100%" stopColor="#1D4ED8" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Online Publications */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2 rounded-lg">
                    <Globe size={20} className="text-white" />
                  </div>
                  Online Publications
                  <span className="text-sm font-normal text-gray-500">(Volume)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={onlinePublications}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                    >
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#374151' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="percentage"
                        fill="url(#greenGradient)"
                        radius={[0, 4, 4, 0]}
                      />
                      <defs>
                        <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reporters Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Print Reporters */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 rounded-lg">
                    <User size={20} className="text-white" />
                  </div>
                  Print Reporters
                  <span className="text-sm font-normal text-gray-500">(Volume)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={printReporters}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                    >
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={120}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#374151' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="percentage"
                        fill="url(#orangeGradient)"
                        radius={[0, 4, 4, 0]}
                      />
                      <defs>
                        <linearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Online Reporters */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                    <Users size={20} className="text-white" />
                  </div>
                  Online Reporters
                  <span className="text-sm font-normal text-gray-500">(Volume)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={onlineReporters}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                    >
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={120}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#374151' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="percentage"
                        fill="url(#purpleGradient)"
                        radius={[0, 4, 4, 0]}
                      />
                      <defs>
                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#7C3AED" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right side - Spokespersons (1 column) */}
        <div className="xl:col-span-1">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50 hover:shadow-xl transition-all duration-300 h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-gradient-to-br from-slate-600 to-gray-600 p-2 rounded-lg">
                  <Quote size={20} className="text-white" />
                </div>
                Spokespersons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {spokespersons.length === 0 && <p className="text-gray-500 text-center">No spokesperson data available</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}