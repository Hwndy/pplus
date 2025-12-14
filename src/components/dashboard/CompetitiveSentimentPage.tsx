// import React, { useState, useEffect } from 'react';
// import { useAuth } from '@/components/auth/AuthContext';
// import { toast } from 'sonner';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
// import { DataCard } from '@/components/ui/DataCard';
// import { TrendingUp, BarChart2 } from 'lucide-react';

// const CompanyIcon = ({ company }: { company: string }) => {
//   if (company.includes('MTN') || company.includes('Airtel')) {
//     return <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">T</div>;
//   } else if (company.includes('Ecobank')) {
//     return <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">E</div>;
//   } else if (company.includes('Interswitch')) {
//     return <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xs">I</div>;
//   } else if (company.includes('Flutterwave')) {
//     return <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-xs">F</div>;
//   }
//   return <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-xs">?</div>;
// };

// export function CompetitiveSentimentPage() {
//   const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const currentDate = new Date();
//   const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()} ${currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short', hour12: true })}`;

//   useEffect(() => {
//     if (authLoading || !isAuthenticated || !user) return;

//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch('https://pplus-ipn6.onrender.com/api/report/competitive-intelligence', {
//           headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
//         });
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//         const result = await response.json();
//         if (result.success) {
//           setData(result.data);
//         } else {
//           throw new Error(result.message || 'Failed to fetch competitive intelligence');
//         }
//       } catch (err) {
//         console.error('Error fetching competitive intelligence:', err);
//         toast.error('Error fetching competitive intelligence');
//         setData(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [authLoading, isAuthenticated, user, token]);

//   if (loading) {
//     return <div className="flex justify-center items-center h-screen">Loading...</div>;
//   }

//   if (!data || !data.competitive_intelligence) {
//     return <div className="text-center text-gray-500">No data available</div>;
//   }

//   // Calculate sentiment score (-1 to +1) based on percentage differences
//   const calculateSentimentScore = (companyData: any) => {
//     const { positive, negative, neutral } = companyData;
//     const total = positive.frequency + negative.frequency + neutral.frequency;
//     if (total === 0) return 0;
//     const positiveWeight = (positive.frequency / total) * (positive.percentage / 100);
//     const negativeWeight = (negative.frequency / total) * (negative.percentage / 100);
//     return (positiveWeight - negativeWeight).toFixed(2);
//   };

//   // Prepare sentiment score data
//   const sentimentScoreData = Object.entries(data.competitive_intelligence).flatMap(([_, sector]) =>
//     Object.entries(sector.analysis.media_sentiment_index).map(([company, sentiment]) => ({
//       name: company,
//       value: parseFloat(calculateSentimentScore(sentiment)),
//     }))
//   );

//   // Prepare sentiment frequency data
//   const sentimentFrequencyData = Object.entries(data.competitive_intelligence).flatMap(([_, sector]) =>
//     Object.entries(sector.analysis.media_sentiment_index).map(([company, sentiment]) => ({
//       name: company,
//       positive: sentiment.positive.frequency,
//       negative: sentiment.negative.frequency,
//       neutral: sentiment.neutral.frequency,
//     }))
//   );

//   // Colors for sentiment bars
//   const positiveColor = "#10b981"; // Green
//   const negativeColor = "#ef4444"; // Red
//   const neutralColor = "#9ca3af"; // Gray

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
//         <div className="absolute inset-0 bg-black/10"></div>
//         <div className="relative z-10 flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold mb-2">Competitive Sentiment Intelligence</h1>
//             <p className="text-indigo-100">Insights across monitored sub-sectors</p>
//           </div>
//           <div className="text-right">
//             <div className="text-sm text-indigo-100">Last Updated</div>
//             <div className="text-white font-medium">{formattedDate}</div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Competitive Media Sentiment Score */}
//         <DataCard title="Competitive Media Sentiment Score" variant="glass" icon={<TrendingUp size={24} />}>
//           <div className="p-2 text-xs text-center text-gray-500">Sentiment Score (-1 to +1)</div>
//           <div className="h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={sentimentScoreData}
//                 layout="vertical"
//                 margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis type="number" domain={[-1, 1]} tickCount={11} />
//                 <YAxis
//                   dataKey="name"
//                   type="category"
//                   width={0}
//                   tick={(props) => {
//                     const { x, y, payload } = props;
//                     return (
//                       <g transform={`translate(${x},${y})`}>
//                         <CompanyIcon company={payload.value} />
//                         <text x={10} y={4} textAnchor="start" fill="#666" fontSize={12}>
//                           {payload.value}
//                         </text>
//                       </g>
//                     );
//                   }}
//                 />
//                 <Tooltip formatter={(value) => value.toFixed(2)} />
//                 <Bar dataKey="value" name="Score">
//                   {sentimentScoreData.map((entry, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={entry.value >= 0 ? positiveColor : negativeColor}
//                     />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </DataCard>

//         {/* Competitive Media Sentiment Frequency */}
//         <DataCard title="Competitive Media Sentiment Frequency" variant="glass" icon={<BarChart2 size={24} />}>
//           <div className="h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={sentimentFrequencyData}
//                 layout="vertical"
//                 margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis type="number" domain={[0, Math.max(...sentimentFrequencyData.map(d => d.positive + d.negative + d.neutral)) * 1.2]} />
//                 <YAxis
//                   dataKey="name"
//                   type="category"
//                   width={0}
//                   tick={(props) => {
//                     const { x, y, payload } = props;
//                     return (
//                       <g transform={`translate(${x},${y})`}>
//                         <CompanyIcon company={payload.value} />
//                         <text x={10} y={4} textAnchor="start" fill="#666" fontSize={12}>
//                           {payload.value}
//                         </text>
//                       </g>
//                     );
//                   }}
//                 />
//                 <Tooltip />
//                 <Bar dataKey="positive" stackId="a" fill={positiveColor} name="Positive" />
//                 <Bar dataKey="negative" stackId="a" fill={negativeColor} name="Negative" />
//                 <Bar dataKey="neutral" stackId="a" fill={neutralColor} name="Neutral" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//           <div className="flex justify-center mt-2 space-x-4">
//             <div className="flex items-center">
//               <div className="w-3 h-3 bg-green-500 mr-1"></div>
//               <span className="text-xs">Positive</span>
//             </div>
//             <div className="flex items-center">
//               <div className="w-3 h-3 bg-red-500 mr-1"></div>
//               <span className="text-xs">Negative</span>
//             </div>
//             <div className="flex items-center">
//               <div className="w-3 h-3 bg-gray-400 mr-1"></div>
//               <span className="text-xs">Neutral</span>
//             </div>
//           </div>
//         </DataCard>
//       </div>

//       <div className="text-xs text-gray-500 mt-8 border-t pt-4">
//          </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DataCard } from '@/components/ui/DataCard';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { TrendingUp, BarChart2, Loader2 } from 'lucide-react';

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const EntityIcon = ({ name }: { name: string }) => {
  const initial = name.charAt(0).toUpperCase();
  const bgColor = COLORS[name.length % COLORS.length];

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

  const API_URL = 'https://pplus-ipn6.onrender.com/api/report/competitive-intelligence';

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

  // Calculate sentiment score (-1 to +1)
  const calculateSentimentScore = (sentiment: any) => {
    const { positive, negative, neutral } = sentiment;
    const total = positive.frequency + negative.frequency + neutral.frequency;
    if (total === 0) return 0;
    const posWeight = (positive.frequency / total) * (positive.percentage / 100);
    const negWeight = (negative.frequency / total) * (negative.percentage / 100);
    return parseFloat((posWeight - negWeight).toFixed(3));
  };

  // Prepare data
  const sentimentScoreData = hasData
    ? Object.values(data.competitive_intelligence || {}).flatMap((sector: any) =>
        Object.entries(sector.analysis?.media_sentiment_index || {}).map(([company, sentiment]: [string, any]) => ({
          name: company,
          value: calculateSentimentScore(sentiment),
        }))
      )
    : [];

  const sentimentFrequencyData = hasData
    ? Object.values(data.competitive_intelligence || {}).flatMap((sector: any) =>
        Object.entries(sector.analysis?.media_sentiment_index || {}).map(([company, sentiment]: [string, any]) => ({
          name: company,
          positive: sentiment.positive.frequency || 0,
          negative: sentiment.negative.frequency || 0,
          neutral: sentiment.neutral.frequency || 0,
        }))
      )
    : [];

  // Aggregate stats
  const totalMentions = sentimentFrequencyData.reduce(
    (sum, d) => sum + d.positive + d.negative + d.neutral,
    0
  );

  const overallSentiment =
    sentimentScoreData.length > 0
      ? (sentimentScoreData.reduce((sum, d) => sum + d.value, 0) / sentimentScoreData.length).toFixed(3)
      : '0.000';

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
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
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
          Competitive Sentiment Intelligence - {activePair?.base_company.company_name || 'your company'} ({industryName} Industry)
        </h2>

        <UniversalFilter
          filters={filterOptions}
          values={filterValues}
          onChange={setFilterValues}
          onReset={() => setFilterValues({})}
        />

        <div className="bg-teal-50 border border-teal-200 rounded-lg p-8 text-center text-teal-800">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-teal-500" />
          <p className="text-lg font-medium">Select a date range to view sentiment analysis</p>
          <p className="text-sm mt-2 text-teal-600">
            Compare public perception and media tone across competitors
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white relative overflow-hidden">
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
              {hasData && (
                <div className="text-xs text-cyan-200 mt-2">
                  {totalMentions.toLocaleString()} total mentions • Overall Sentiment: {overallSentiment}
                </div>
              )}
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

      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sentiment Score (-1 to +1) */}
          <DataCard
            title="Competitive Media Sentiment Score"
            variant="glass"
            icon={<TrendingUp size={24} className="text-emerald-600" />}
          >
            <div className="text-center text-xs text-gray-500 mb-2">
              Sentiment Score: -1 (Very Negative) → +1 (Very Positive)
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sentimentScoreData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" domain={[-1, 1]} ticks={[-1, -0.5, 0, 0.5, 1]} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    tick={(props) => {
                      const { x, y, payload } = props;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <EntityIcon name={payload.value} />
                          <text x={45} y={4} textAnchor="start" fill="#374151" fontSize={12}>
                            {payload.value.length > 14 ? payload.value.slice(0, 11) + '...' : payload.value}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <Tooltip formatter={(value: number) => value.toFixed(3)} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                    {sentimentScoreData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.value >= 0 ? '#10b981' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DataCard>

          {/* Sentiment Frequency (Stacked) */}
          <DataCard
            title="Competitive Media Sentiment Frequency"
            variant="glass"
            icon={<BarChart2 size={24} className="text-indigo-600" />}
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sentimentFrequencyData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    tick={(props) => {
                      const { x, y, payload } = props;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <EntityIcon name={payload.value} />
                          <text x={45} y={4} textAnchor="start" fill="#374151" fontSize={12}>
                            {payload.value.length > 14 ? payload.value.slice(0, 11) + '...' : payload.value}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="positive" stackId="a" fill="#10b981" name="Positive" />
                  <Bar dataKey="neutral" stackId="a" fill="#9ca3af" name="Neutral" />
                  <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Negative" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Positive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                <span>Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Negative</span>
              </div>
            </div>
          </DataCard>
        </div>
      )}

      {hasData && sentimentScoreData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <TrendingUp className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <p>No sentiment data available for this period</p>
        </div>
      )}
    </div>
  );
}