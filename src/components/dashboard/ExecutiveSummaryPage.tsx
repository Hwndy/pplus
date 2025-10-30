import React, { useState, useMemo, useEffect } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { UniversalFilter, FilterOption, FilterValues } from '@/components/ui/UniversalFilter';
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
  LabelList
} from 'recharts';
import {
  BarChart2,
  Globe,
  Newspaper,
  Award,
  PieChart as PieChartIcon
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';

// Enhanced color palette for better visual appeal
const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];
const SENTIMENT_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

const API_BASE_URL = 'https://pplus-t71x.onrender.com/api';

export function ExecutiveSummaryPage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [summaryData, setSummaryData] = useState<any>({});
  const [brandAnalysisData, setBrandAnalysisData] = useState<any>({});
  const [compShares, setCompShares] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Get current date for display
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()}`;

  // Simplified filter options - only date range for month selection
  const filterOptions: FilterOption[] = [
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'daterange',
      placeholder: 'Select date range'
    }
  ];

  const resetFilters = () => {
    setFilterValues({});
  };

  // Function to get month from date range
  const getMonthFromDateRange = (dateRange: any): string | null => {
    if (!dateRange?.start) return null;
    const start = new Date(dateRange.start);
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
  };

  // Fetch competitive intelligence if user is Client to determine company
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;

    const fetchCompetitive = async () => {
      setDataLoading(true);
      try {
        const month = getMonthFromDateRange(filterValues.dateRange);
        let url = `${API_BASE_URL}/report/competitive-intelligence`;
        if (month) url += `?month=${month}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        if (result.success) {
          const compInt = result.data.competitive_intelligence;
          const subSectors = Object.keys(compInt);
          if (subSectors.length > 0) {
            const firstSub = subSectors[0];
            const companies = compInt[firstSub].companies_in_category;
            if (companies.length > 0) {
              setSelectedCompany(companies[0]);
            }
            const shares = compInt[firstSub].analysis.competitive_media_share.shares.map((s: any) => ({
              ...s,
              percentage: parseFloat(s.percentage),
            }));
            setCompShares(shares);
          }
        } else {
          toast.error(result.message || 'Failed to fetch competitive data');
        }
      } catch (err) {
        toast.error('Error fetching competitive intelligence');
      } finally {
        setDataLoading(false);
      }
    };

    if (user.role.name === 'Client') {
      fetchCompetitive();
    } else {
      setSelectedCompany('Glo Nigeria');
      setDataLoading(false);
    }
  }, [authLoading, isAuthenticated, user, token, filterValues]);

  // Fetch summary and brand analysis once company is determined
  useEffect(() => {
    if (!selectedCompany || authLoading || !isAuthenticated) return;

    const fetchData = async () => {
      setDataLoading(true);
      const month = getMonthFromDateRange(filterValues.dateRange);
      const companyParam = encodeURIComponent(selectedCompany);

      try {
        // Fetch executive summary
        let summaryUrl = `${API_BASE_URL}/report/executive-summary`;
        if (month) summaryUrl += `&month=${month}`;

        const summaryResponse = await fetch(summaryUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const summaryResult = await summaryResponse.json();
        if (summaryResult.success) {
          setSummaryData(summaryResult.data.summary);
        } else {
          toast.error(summaryResult.message || 'Failed to fetch executive summary');
        }

        // Fetch brand media analysis
        let brandUrl = `${API_BASE_URL}/report/brand-media-analysis`;
        if (month) brandUrl += `&month=${month}`;

        const brandResponse = await fetch(brandUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const brandResult = await brandResponse.json();
        if (brandResult.success) {
          setBrandAnalysisData(brandResult.data.analysis);
        } else {
          toast.error(brandResult.message || 'Failed to fetch brand media analysis');
        }
      } catch (err) {
        toast.error('Error fetching data');
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [selectedCompany, filterValues, token, authLoading, isAuthenticated]);

  // Calculate sentiment data
  const totalMentions = (summaryData.positiveMediaExposure || 0) +
                       (summaryData.neutralMediaExposure || 0) +
                       (summaryData.negativeMediaExposure || 0);

  const sentimentData = [
    { name: 'Positive', value: totalMentions > 0 ? Math.round((summaryData.positiveMediaExposure / totalMentions) * 100) : 0 },
    { name: 'Neutral', value: totalMentions > 0 ? Math.round((summaryData.neutralMediaExposure / totalMentions) * 100) : 0 },
    { name: 'Negative', value: totalMentions > 0 ? Math.round((summaryData.negativeMediaExposure / totalMentions) * 100) : 0 }
  ];

  // Calculate language distribution
  const languageBreakdown = summaryData.language?.breakdown || {};
  const languageTotal = Object.values(languageBreakdown).reduce((sum: number, val: any) => sum + val, 0);
  const languageDistribution = Object.entries(languageBreakdown).map(([name, value]: any) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: languageTotal > 0 ? Math.round((value / languageTotal) * 100) : 0
  }));

  // Calculate media vehicle distribution
  const mediaVehicle = summaryData.mediaVehicle || { online: 0, print: 0 };
  const mediaTotal = mediaVehicle.online + mediaVehicle.print;
  const mediaVehicleDistribution = [
    { name: 'Online', value: mediaTotal > 0 ? Math.round((mediaVehicle.online / mediaTotal) * 100) : 0 },
    { name: 'Print', value: mediaTotal > 0 ? Math.round((mediaVehicle.print / mediaTotal) * 100) : 0 }
  ];

  // Calculate weekly trend
  const weeklyTrend = useMemo(() => {
    if (!brandAnalysisData.weekly_volume_trend) return [];
    const onlineBreakdown = brandAnalysisData.weekly_volume_trend.online?.weekly_breakdown || [];
    const printBreakdown = brandAnalysisData.weekly_volume_trend.print?.weekly_breakdown || [];
    return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map(week => ({
      week,
      onlineMedia: onlineBreakdown.find((w: any) => w.week === week)?.count || 0,
      printMedia: printBreakdown.find((w: any) => w.week === week)?.count || 0
    }));
  }, [brandAnalysisData]);

  // Competitive media share data (sorted by percentage)
  const competitiveData = useMemo(() => {
    return compShares
      .map((s: any) => ({
        name: s.company,
        value: s.percentage
      }))
      .sort((a, b) => b.value - a.value); // Sort descending
  }, [compShares]);

  if (authLoading || dataLoading || !selectedCompany) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">Executive Summary</h2>
        <div className="text-sm text-gray-500">{formattedDate}</div>
      </div>

      <UniversalFilter
        filters={filterOptions}
        values={filterValues}
        onChange={setFilterValues}
        onReset={resetFilters}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <DataCard
          title="Total Media Mentions"
          variant="glass"
          icon={<BarChart2 size={24} className="text-indigo-600" />}
          className="lg:col-span-1 border-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-indigo-600">{summaryData.totalMediaExposure || 0}</div>
            <div className="text-sm text-gray-500">Total mentions</div>
          </div>
        </DataCard>

        <DataCard
          title="Reputation Score"
          variant="glass"
          icon={<Award size={24} className="text-cyan-600" />}
          className="lg:col-span-1 border-cyan-100 hover:border-cyan-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-cyan-600">{summaryData.brandMediaReputationScore || 0}</div>
            <div className="text-sm text-gray-500">Score</div>
          </div>
        </DataCard>

        <DataCard
          title="Local Media Exposure"
          variant="glass"
          icon={<Newspaper size={24} className="text-emerald-600" />}
          className="lg:col-span-1 border-emerald-100 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-emerald-600">{summaryData.brandExposureInLocalMedia || 0}</div>
            <div className="text-sm text-gray-500">Local mentions</div>
          </div>
        </DataCard>

        <DataCard
          title="International Media"
          variant="glass"
          icon={<Globe size={24} className="text-amber-600" />}
          className="lg:col-span-1 border-amber-100 hover:border-amber-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-amber-600">{summaryData.brandExposureInInternationalMedia || 0}</div>
            <div className="text-sm text-gray-500">International mentions</div>
          </div>
        </DataCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DataCard
          title="Sentiment Analysis"
          variant="glass"
          icon={<PieChartIcon size={24} className="text-indigo-600" />}
          className="border-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="h-80 relative p-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="90%"
                  innerRadius="50%"
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={450}
                >
                  {sentimentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Percentage']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-2xl font-bold text-green-600">{sentimentData[0]?.value || 0}%</div>
              <div className="text-xs text-gray-500 font-medium">Positive</div>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Language Distribution"
          variant="glass"
          icon={<Globe size={24} className="text-cyan-600" />}
          className="border-cyan-100 hover:border-cyan-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="h-80 relative p-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languageDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="90%"
                  innerRadius="50%"
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={450}
                >
                  {languageDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Percentage']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-2xl font-bold text-cyan-600">
                {languageDistribution[0]?.value || 0}%
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {languageDistribution[0]?.name || 'N/A'}
              </div>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Media Vehicle Distribution"
          variant="glass"
          icon={<Newspaper size={24} className="text-emerald-600" />}
          className="border-emerald-100 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="h-80 relative p-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mediaVehicleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="90%"
                  innerRadius="50%"
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={3}
                  startAngle={90}
                  endAngle={450}
                >
                  {mediaVehicleDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Percentage']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {mediaVehicleDistribution[0]?.value || 0}%
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {mediaVehicleDistribution[0]?.name || 'N/A'}
              </div>
            </div>
          </div>
        </DataCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard
          title="Weekly Trend on Brand Media Exposure"
          variant="glass"
          icon={<BarChart2 size={24} className="text-amber-600" />}
          className="border-amber-100 hover:border-amber-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyTrend}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPrint" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[2]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[2]} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend iconType="circle" />
                <Area
                  type="monotone"
                  dataKey="onlineMedia"
                  name="Online Media"
                  stroke={COLORS[0]}
                  fillOpacity={1}
                  fill="url(#colorOnline)"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="printMedia"
                  name="Print Media"
                  stroke={COLORS[2]}
                  fillOpacity={1}
                  fill="url(#colorPrint)"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DataCard>

        <DataCard
          title="Competitive Media Share"
          variant="glass"
          icon={<BarChart2 size={24} className="text-purple-600" />}
          className="border-purple-100 hover:border-purple-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="h-80 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={competitiveData}
                layout="horizontal"
                margin={{ top: 20, right: 30, left: 60, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  label={{ value: 'Media Share (%)', position: 'insideBottom', offset: -10 }}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: '#555' }}
                  width={140}
                  interval={0}
                  tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Media Share']}
                  labelFormatter={(label) => `Company: ${label}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 4, 4]}
                  barSize={20}
                >
                  {competitiveData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={1}
                    />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(value: number) => `${value}%`}
                    style={{ fill: '#333', fontSize: 11, fontWeight: 500 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DataCard>
      </div>
    </div>
  );
}