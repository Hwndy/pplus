// import React, { useState, useEffect } from 'react';
// import { useAuth } from '@/components/auth/AuthContext';
// import { toast } from 'sonner';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { DataCard } from '@/components/ui/DataCard';
// import { BarChart2, Users } from 'lucide-react';

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

// export function CompetitiveCEOsPage() {
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

//   // Prepare media share data
//   const mediaShareData = Object.entries(data.competitive_intelligence).flatMap(([_, sector]) =>
//     sector.analysis.competitive_media_share.shares.map(share => ({
//       name: share.company,
//       value: parseFloat(share.percentage),
//     }))
//   );

//   // Prepare thought leadership data (using Market Share prominence as proxy)
//   const thoughtLeadershipData = Object.entries(data.competitive_intelligence).flatMap(([_, sector]) => {
//     const prominence = sector.analysis.media_prominence_analysis['Market Share'];
//     return prominence ? prominence.companies.map(company => ({
//       name: company.company,
//       value: parseFloat(company.percentage),
//     })) : [];
//   });

//   // Prepare top CEOs data
//   const topCEOsData = Object.entries(data.competitive_intelligence).flatMap(([_, sector]) => {
//     const ceos = sector.analysis.top_ceos_with_media_prominence.ceos;
//     return ceos.map(ceo => ({
//       name: ceo.ceo,
//       value: parseFloat(ceo.percentage),
//     }));
//   });

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
//         <div className="absolute inset-0 bg-black/10"></div>
//         <div className="relative z-10 flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold mb-2">Competitive CEOs Intelligence - Holdings</h1>
//             <p className="text-indigo-100">Insights across monitored sub-sectors</p>
//           </div>
//           <div className="text-right">
//             <div className="text-sm text-indigo-100">Last Updated</div>
//             <div className="text-white font-medium">{formattedDate}</div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Top - Competitive Media Share */}
//         <DataCard title="Top – Competitive Media Share" variant="glass" icon={<BarChart2 size={24} />}>
//           <div className="h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={mediaShareData}
//                 layout="vertical"
//                 margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis type="number" domain={[0, 100]} />
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
//                 <Tooltip formatter={(value) => `${value}%`} />
//                 <Bar dataKey="value" fill="#0088FE" name="Percentage" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </DataCard>

//         {/* Top - Thought Leadership */}
//         <DataCard title="Top – Thought Leadership" variant="glass" icon={<Users size={24} />}>
//           <div className="h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={thoughtLeadershipData}
//                 layout="vertical"
//                 margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis type="number" domain={[0, 100]} />
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
//                 <Tooltip formatter={(value) => `${value}%`} />
//                 <Bar dataKey="value" fill="#0088FE" name="Percentage" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </DataCard>

//         {/* Top - CEOs with Media Prominence */}
//         <DataCard title="Top – CEOs with Media Prominence" variant="glass" icon={<Users size={24} />}>
//           <div className="h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 data={topCEOsData}
//                 layout="vertical"
//                 margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis type="number" domain={[0, 100]} />
//                 <YAxis
//                   dataKey="name"
//                   type="category"
//                   width={150}
//                   tick={(props) => {
//                     const { x, y, payload } = props;
//                     return (
//                       <g transform={`translate(${x},${y})`}>
//                         <text x={0} y={4} textAnchor="start" fill="#666" fontSize={12} width={150} style={{ wordWrap: 'break-word', maxWidth: '150px' }}>
//                           {payload.value}
//                         </text>
//                       </g>
//                     );
//                   }}
//                 />
//                 <Tooltip formatter={(value) => `${value}%`} />
//                 <Bar dataKey="value" fill="#0088FE" name="Percentage" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </DataCard>
//       </div>

//       <div className="text-xs text-gray-500 mt-8 border-t pt-4">
//         <p>Copyright © 2023, P+ Measurement Services. All rights reserved. This audit report, including all its methodologies, contents, and analysis, is the intellectual property of P+ Measurement Services. It is intended solely for the use of the specifically named clients. Any unauthorized use is strictly prohibited.</p>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DataCard } from '@/components/ui/DataCard';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { BarChart2, Users, Loader2 } from 'lucide-react';

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

export function CompetitiveCEOsPage() {
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

    // Require both start and end dates
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
      console.log('Fetching Competitive CEOs Intelligence →', url);

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
        toast.info('No CEO intelligence data found for the selected period');
      }
    } catch (err) {
      console.error('Error fetching competitive CEOs intelligence:', err);
      toast.error('Failed to load CEO intelligence data');
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
      placeholder: 'Pick start and end date',
      closeOnSelect: true,
    },
  ];

  // Calculate aggregate stats
  const totalEditorials = hasData
    ? Object.values(data.competitive_intelligence || {}).reduce(
        (sum: number, sector: any) => sum + (sector.summary?.total_editorials || 0),
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

  // Prepare chart data
  const mediaShareData = hasData
    ? Object.values(data.competitive_intelligence || {}).flatMap((sector: any) =>
        sector.analysis?.competitive_media_share?.shares?.map((share: any) => ({
          name: share.company,
          value: parseFloat(share.percentage) || 0,
        })) || []
      )
    : [];

  const thoughtLeadershipData = hasData
    ? Object.values(data.competitive_intelligence || {}).flatMap((sector: any) => {
        const prominence = sector.analysis?.media_prominence_analysis?.['Market Share'];
        return prominence
          ? prominence.companies.map((c: any) => ({
              name: c.company,
              value: parseFloat(c.percentage) || 0,
            }))
          : [];
      })
    : [];

  const topCEOsData = hasData
    ? Object.values(data.competitive_intelligence || {}).flatMap((sector: any) => {
        const ceos = sector.analysis?.top_ceos_with_media_prominence?.ceos || [];
        return ceos.map((ceo: any) => ({
          name: ceo.ceo,
          value: parseFloat(ceo.percentage) || 0,
        }));
      })
    : [];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <span className="ml-4 text-lg">
          Loading CEO intelligence for {activePair?.base_company.company_name || 'your company'} ({industryName} Industry)...
        </span>
      </div>
    );
  }

  // No date selected
  if (!displayDates) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
          Competitive CEOs Intelligence - {activePair?.base_company.company_name || 'your company'} ({industryName} Industry)
        </h2>

        <UniversalFilter
          filters={filterOptions}
          values={filterValues}
          onChange={setFilterValues}
          onReset={() => setFilterValues({})}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center text-blue-800">
          <Users className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <p className="text-lg font-medium">Select a date range to view CEO intelligence</p>
          <p className="text-sm mt-2 text-blue-600">
            Compare media prominence of CEOs across competing organizations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Competitive CEOs Intelligence - {activePair?.base_company.company_name || 'your company'} ({industryName} Industry)
              </h1>
              <p className="text-indigo-100">Media prominence of industry leaders</p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm text-indigo-100">Reporting Period</div>
              <div className="font-medium">
                {formatDate(displayDates.start)} – {formatDate(displayDates.end)}
              </div>
              {hasData && (
                <div className="text-xs text-indigo-200 mt-2">
                  {totalEditorials} editorials • {uniqueActivities} unique activities
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
          No CEO intelligence data available for the selected period. Try a different date range.
        </div>
      )}

      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Competitive Media Share (Company Level) */}
          {mediaShareData.length > 0 && (
            <DataCard title="Competitive Media Share" variant="glass" icon={<BarChart2 size={24} className="text-indigo-600" />}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mediaShareData} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
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
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                      {mediaShareData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DataCard>
          )}

          {/* Thought Leadership (Company Level via Market Share Prominence) */}
          {thoughtLeadershipData.length > 0 && (
            <DataCard title="Thought Leadership" variant="glass" icon={<BarChart2 size={24} className="text-purple-600" />}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={thoughtLeadershipData} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
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
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                      {thoughtLeadershipData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DataCard>
          )}

          {/* Top CEOs with Media Prominence */}
          {topCEOsData.length > 0 && (
            <DataCard title="Top CEOs with Media Prominence" variant="glass" icon={<Users size={24} className="text-emerald-600" />}>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCEOsData} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={(props) => {
                        const { x, y, payload } = props;
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <EntityIcon name={payload.value} />
                            <text x={50} y={4} textAnchor="start" fill="#374151" fontSize={12}>
                              {payload.value.length > 18 ? payload.value.slice(0, 15) + '...' : payload.value}
                            </text>
                          </g>
                        );
                      }}
                    />
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                      {topCEOsData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DataCard>
          )}
        </div>
      )}

      {hasData && mediaShareData.length === 0 && thoughtLeadershipData.length === 0 && topCEOsData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <p>No CEO or company intelligence available for this period</p>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-8 border-t pt-4">
        <p>
          Copyright © 2023, P+ Measurement Services. All rights reserved. This audit report, including all its
          methodologies, contents, and analysis, is the intellectual property of P+ Measurement Services. It is
          intended solely for the use of the specifically named clients. Any unauthorized use is strictly prohibited.
        </p>
      </div>
    </div>
  );
}