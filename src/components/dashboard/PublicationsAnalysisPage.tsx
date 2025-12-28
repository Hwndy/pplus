import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { Newspaper, Users, FileText, Globe, User, Quote, Loader2, Trophy } from 'lucide-react';
import { UniversalFilter, FilterOption, FilterValues } from '@/components/ui/UniversalFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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
  const { token, activePair } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const companyName = activePair?.base_company.company_name || 'Your Company';

  const hasValidDateRange = filterValues.dateRange && Array.isArray(filterValues.dateRange) && filterValues.dateRange[0] && filterValues.dateRange[1];
  const startDate = (hasValidDateRange ? filterValues.dateRange[0] : '') as string;
  const endDate = (hasValidDateRange ? filterValues.dateRange[1] : '') as string;

  const filterOptions = [
    {
      key: 'dateRange',
      label: 'Select Date Range',
      type: 'daterange',
      placeholder: 'Pick date range',
      closeOnSelect: true,        // ← This makes the calendar close after ANY date selection
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
      end: `${year}-${month}-${day}`
    };
  };

  const displayDates = getDisplayDates();

  const fetchAnalysisData = useCallback(async () => {
    if (!token || !activePair) {
      setAnalysisData(null);
      setLoading(false);
      return;
    }

    if (filterValues.dateRange) {
      const [start, end] = filterValues.dateRange as [string | null, string | null];
      if (new Date(start) > new Date(end)) {
      toast.error('Start date must be before or equal to end date');
      setLoading(false);
      return;
      }
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('pair_id', String(activePair.pair_id));

      if (hasValidDateRange) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const url = `https://pplus-oez4.onrender.com/api/report/publication-reporter-spokesperson-analysis?${params.toString()}`;
      console.log('Fetching Publications Analysis →', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        setAnalysisData(result.data);
      } else {
        setAnalysisData(null);
        if (result.message && !result.message.includes('No publication')) {
          toast.info(result.message);
        }
      }
    } catch (err: any) {
      console.error('Error fetching publication analysis:', err);
      if (err.response?.status === 404 || err.message?.includes('No publication')) {
        setAnalysisData(null);
      } else {
        toast.error('Failed to load publication analysis');
        setAnalysisData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [token, activePair, filterValues.dateRange, hasValidDateRange, startDate, endDate]);

  useEffect(() => {
    fetchAnalysisData();
  }, [fetchAnalysisData]);

  const printPublications = analysisData?.analysis?.print_publications_volume?.sources?.map((s: any) => ({
    name: s.source,
    value: s.count,
    percentage: parseFloat(s.percentage) || 0,
  })) || [];

  const onlinePublications = analysisData?.analysis?.online_publications_volume?.sources?.map((s: any) => ({
    name: s.source,
    value: s.count,
    percentage: parseFloat(s.percentage) || 0,
  })) || [];

  const printReporters = analysisData?.analysis?.print_reporters?.reporters?.map((r: any) => ({
    name: r.reporter,
    value: r.count,
    percentage: parseFloat(r.percentage) || 0,
  })) || [];

  const onlineReporters = analysisData?.analysis?.online_reporters?.reporters?.map((r: any) => ({
    name: r.reporter,
    value: r.count,
    percentage: parseFloat(r.percentage) || 0,
  })) || [];

  // NEW: Top 3 Reporters Overall for summary
  const top3Reporters = analysisData?.analysis?.top_3_reporters_overall?.reporters?.map((r: any, index: number) => ({
    rank: index + 1,
    name: r.reporter,
    count: r.count,
    percentage: parseFloat(r.percentage),
    mediaType: r.media_types?.includes('print') ? (r.media_types.includes('online') ? 'Print & Online' : 'Print') : 'Online',
  })) || [];

  return (
    <div className="space-y-8 animate-fade-in relative">
      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-4 border border-gray-100">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">
                Loading publications analysis for {companyName}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(displayDates.start)} – {formatDate(displayDates.end)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Publications & Reporters Analysis</h1>
            <p className="text-blue-100 text-lg">Media coverage insights and reporter engagement</p>
            {activePair && (
              <p className="text-blue-200 text-sm mt-1">Currently viewing: <strong>{activePair.base_company.company_name}</strong></p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Newspaper size={32} className="text-white" />
            </div>
            {analysisData && (
              <div className="text-right">
                <div className="text-sm text-blue-100">Publications</div>
                <div className="text-2xl font-bold text-white">
                  {(analysisData.analysis?.print_publications_volume?.total_count || 0) + 
                   (analysisData.analysis?.online_publications_volume?.total_count || 0)}
                </div>
                <div className="text-sm text-blue-200">Total coverage</div>
              </div>
            )}
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
                  <span className="text-sm font-normal text-gray-500">
                    ({analysisData?.analysis?.print_publications_volume?.total_count || 0})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {printPublications.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={printPublications} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                        <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#374151' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="percentage" fill="url(#blueGradient)" radius={[0, 4, 4, 0]} />
                        <defs>
                          <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#1D4ED8" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <p>{hasValidDateRange ? 'No print publications found' : 'Select date range to view data'}</p>
                    </div>
                  )}
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
                  <span className="text-sm font-normal text-gray-500">
                    ({analysisData?.analysis?.online_publications_volume?.total_count || 0})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {onlinePublications.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={onlinePublications} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                        <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#374151' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="percentage" fill="url(#greenGradient)" radius={[0, 4, 4, 0]} />
                        <defs>
                          <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <p>{hasValidDateRange ? 'No online publications found' : 'Select date range to view data'}</p>
                    </div>
                  )}
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
                  <span className="text-sm font-normal text-gray-500">
                    ({analysisData?.analysis?.print_reporters?.unique_reporters || 0})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {printReporters.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={printReporters} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                        <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#374151' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="percentage" fill="url(#orangeGradient)" radius={[0, 4, 4, 0]} />
                        <defs>
                          <linearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#D97706" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <p>{hasValidDateRange ? 'No print reporters found' : 'Select date range to view data'}</p>
                    </div>
                  )}
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
                  <span className="text-sm font-normal text-gray-500">
                    ({analysisData?.analysis?.online_reporters?.unique_reporters || 0})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {onlineReporters.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={onlineReporters} layout="vertical" margin={{ top: 5, right: 30, left: 5, bottom: 5 }}>
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                        <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#374151' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="percentage" fill="url(#purpleGradient)" radius={[0, 4, 4, 0]} />
                        <defs>
                          <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#7C3AED" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <p>{hasValidDateRange ? 'No online reporters found' : 'Select date range to view data'}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right side - Summary Stats */}
        <div className="xl:col-span-1">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50 hover:shadow-xl transition-all duration-300 h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-gradient-to-br from-slate-600 to-gray-600 p-2 rounded-lg">
                  <Quote size={20} className="text-white" />
                </div>
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {analysisData ? (
                <>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Print Publications</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysisData.analysis?.print_publications_volume?.total_count || 0}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {analysisData.analysis?.print_publications_volume?.unique_sources || 0} unique sources
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Online Publications</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysisData.analysis?.online_publications_volume?.total_count || 0}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {analysisData.analysis?.online_publications_volume?.unique_sources || 0} unique sources
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Print Reporters</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysisData.analysis?.print_reporters?.unique_reporters || 0}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Online Reporters</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analysisData.analysis?.online_reporters?.unique_reporters || 0}
                    </p>
                  </div>

                  {/* Top 3 Reporters Overall - NEW */}
                  {top3Reporters.length > 0 && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg p-5 shadow-sm border border-amber-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Trophy className="w-5 h-5 text-amber-700" />
                        <p className="font-semibold text-gray-800">Top 3 Reporters Overall</p>
                      </div>
                      <div className="space-y-3">
                        {top3Reporters.map((reporter) => (
                          <div key={reporter.rank} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="text-lg font-bold text-amber-700 w-6">#{reporter.rank}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-800 truncate max-w-[180px]">{reporter.name}</p>
                                <p className="text-xs text-gray-500">{reporter.mediaType}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-800">{reporter.count}</p>
                              <p className="text-xs text-gray-600">{reporter.percentage.toFixed(2)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center">
                  {hasValidDateRange ? 'No data available' : 'Select date range to view summary'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}