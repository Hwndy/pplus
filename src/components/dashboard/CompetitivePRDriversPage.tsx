// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Target, Building } from 'lucide-react';
// import { useAuth } from '@/components/auth/AuthContext';
// import { toast } from 'sonner';

// export function CompetitivePRDriversPage() {
//   const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const currentDate = new Date();
//   const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()} ${currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short', hour12: true })}`;

//   useEffect(() => {
//     if (authLoading || !isAuthenticated || !user || !token) return;

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

//   const prDriversData = Object.entries(data.competitive_intelligence).reduce((acc, [subSector, sectorData]) => {
//     const drivers = sectorData.analysis.competitive_pr_drivers;
//     Object.entries(drivers).forEach(([company, driverData]) => {
//       if (!acc[company]) {
//         acc[company] = { name: company, color: getCompanyColor(company), drivers: [] };
//       }
//       acc[company].drivers.push(...driverData.sample_titles);
//     });
//     return acc;
//   }, {});

//   const companies = Object.values(prDriversData);

//   return (
//     <div className="space-y-8 animate-fade-in">
//       <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
//         <div className="absolute inset-0 bg-black/10"></div>
//         <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
//         <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>
//         <div className="relative z-10 flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold mb-2 tracking-tight">Competitive PR Drivers - Holdings</h1>
//             <p className="text-blue-100 text-lg">Key PR initiatives and strategic communications from competitive holdings</p>
//           </div>
//           <div className="flex items-center gap-4">
//             <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
//               <Target size={32} className="text-white" />
//             </div>
//             <div className="text-right">
//               <div className="text-sm text-indigo-100">Last Updated</div>
//               <div className="text-white font-medium">{formattedDate}</div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="space-y-8">
//         {companies.map((company: any) => (
//           <Card
//             key={company.name}
//             className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
//             style={{
//               background: `linear-gradient(135deg, ${company.color}15 0%, ${company.color}05 100%)`,
//               borderLeft: `4px solid ${company.color}`
//             }}
//           >
//             <div className="absolute inset-0 opacity-5">
//               <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-current transform translate-x-16 -translate-y-16"></div>
//               <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-current transform -translate-x-12 translate-y-12"></div>
//             </div>
//             <CardHeader className="pb-4 relative z-10">
//               <CardTitle className="text-2xl font-bold flex items-center gap-4" style={{ color: company.color }}>
//                 <div
//                   className="p-3 rounded-xl shadow-lg flex items-center justify-center"
//                   style={{ background: `linear-gradient(135deg, ${company.color}, ${company.color}CC)` }}
//                 >
//                   <Building size={24} className="text-white" />
//                 </div>
//                 {company.name}
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="relative z-10">
//               <div className="space-y-4">
//                 {company.drivers.map((driver: string, driverIndex: number) => (
//                   <div
//                     key={driverIndex}
//                     className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/40 hover:bg-white/90 transition-all duration-200 group"
//                   >
//                     <div className="flex items-start gap-3">
//                       <div
//                         className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
//                         style={{ backgroundColor: company.color }}
//                       ></div>
//                       <p className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
//                         {driver}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//       {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
//         <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
//           <CardContent className="p-6 text-center">
//             <div className="bg-gradient-to-br from-blue-500 to-indigo-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Building size={24} className="text-white" />
//             </div>
//             <h3 className="text-2xl font-bold text-gray-800 mb-2">
//               {companies.length}
//             </h3>
//             <p className="text-gray-600">Competitive Holdings</p>
//           </CardContent>
//         </Card>
//         <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-xl transition-all duration-300">
//           <CardContent className="p-6 text-center">
//             <div className="bg-gradient-to-br from-emerald-500 to-teal-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Target size={24} className="text-white" />
//             </div>
//             <h3 className="text-2xl font-bold text-gray-800 mb-2">
//               {companies.reduce((total, company) => total + company.drivers.length, 0)}
//             </h3>
//             <p className="text-gray-600">Total PR Drivers</p>
//           </CardContent>
//         </Card>
//         <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all duration-300">
//           <CardContent className="p-6 text-center">
//             <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Target size={24} className="text-white" />
//             </div>
//             <h3 className="text-2xl font-bold text-gray-800 mb-2">
//               {companies.length > 0 ? Math.round(companies.reduce((total, company) => total + company.drivers.length, 0) / companies.length) : 0}
//             </h3>
//             <p className="text-gray-600">Avg. Drivers per Company</p>
//           </CardContent>
//         </Card>
//       </div> */}
//     </div>
//   );
// }

// // Helper function to assign colors based on company name
// function getCompanyColor(company: string): string {
//   const colors = {
//     'MTN Nigeria': '#EF4444',
//     'Airtel Nigeria': '#3B82F6',
//     'Ecobank Nigeria': '#10B981',
//     'Interswitch': '#F59E0B',
//     'Flutterwave': '#8B5CF6',
//   };
//   return colors[company as keyof typeof colors] || '#6B7280';
// }

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { Target, Building, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';

const COMPANY_COLORS: Record<string, string> = {
  'MTN Nigeria': '#EF4444',
  'Airtel Nigeria': '#3B82F6',
  'Ecobank Nigeria': '#10B981',
  'Interswitch': '#F59E0B',
  'Flutterwave': '#8B5CF6',
  'default': '#6B7280',
};

const getCompanyColor = (company: string): string => {
  return COMPANY_COLORS[company] || COMPANY_COLORS['default'];
};

export function CompetitivePRDriversPage() {
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
      console.log('Fetching Competitive PR Drivers →', url);

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
        toast.info('No PR drivers data found for the selected period');
      }
    } catch (err) {
      console.error('Error fetching PR drivers:', err);
      toast.error('Failed to load competitive PR drivers');
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

  // Extract PR drivers per company
  const companiesWithDrivers = hasData
    ? Object.entries(data.competitive_intelligence || {}).reduce((acc: any[], [_subSector, sectorData]: [string, any]) => {
        const drivers = sectorData.analysis?.competitive_pr_drivers || {};
        Object.entries(drivers).forEach(([company, driverData]: [string, any]) => {
          const existing = acc.find(c => c.name === company);
          const color = getCompanyColor(company);
          if (existing) {
            existing.drivers.push(...driverData.sample_titles);
          } else {
            acc.push({
              name: company,
              color,
              drivers: driverData.sample_titles || [],
            });
          }
        });
        return acc;
      }, [])
    : [];

  const totalPRDrivers = companiesWithDrivers.reduce((sum, company) => sum + company.drivers.length, 0);
  const totalHoldings = companiesWithDrivers.length;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <span className="ml-4 text-lg">
          Loading PR drivers for {activePair?.base_company.company_name || 'your company'} ({industryName} Industry)...
        </span>
      </div>
    );
  }

  // No date selected
  if (!displayDates) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
          Competitive PR Drivers - {activePair?.base_company.company_name || 'your company'} ({industryName} Industry)
        </h2>

        <UniversalFilter
          filters={filterOptions}
          values={filterValues}
          onChange={setFilterValues}
          onReset={() => setFilterValues({})}
        />

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-8 text-center text-purple-800">
          <Target className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <p className="text-lg font-medium">Select a date range to view competitive PR drivers</p>
          <p className="text-sm mt-2 text-purple-600">
            Discover key strategic communications and PR initiatives from competitor holdings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 tracking-tight">
                Competitive PR Drivers - Holdings
              </h1>
              <p className="text-blue-100 text-lg">
                Key PR initiatives and strategic communications from competitive holdings
              </p>
            </div>
            <div className="text-right space-y-2">
              <div className="text-sm text-indigo-100">Reporting Period</div>
              <div className="font-medium">
                {formatDate(displayDates.start)} – {formatDate(displayDates.end)}
              </div>
              {hasData && (
                <div className="text-xs text-indigo-200 mt-3">
                  {totalHoldings} holdings • {totalPRDrivers} PR drivers identified
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
          No PR drivers data available for the selected period. Try expanding the date range.
        </div>
      )}

      {hasData && companiesWithDrivers.length > 0 && (
        <div className="space-y-8">
          {companiesWithDrivers.map((company: any) => (
            <Card
              key={company.name}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${company.color}15 0%, ${company.color}05 100%)`,
                borderLeft: `5px solid ${company.color}`,
              }}
            >
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-current transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-current transform -translate-x-12 translate-y-12"></div>
              </div>

              <CardHeader className="pb-4 relative z-10">
                <CardTitle className="text-2xl font-bold flex items-center gap-4" style={{ color: company.color }}>
                  <div
                    className="p-3 rounded-xl shadow-lg flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${company.color}, ${company.color}CC)` }}
                  >
                    <Building size={28} className="text-white" />
                  </div>
                  {company.name}
                  <span className="ml-auto text-sm font-normal opacity-75">
                    {company.drivers.length} driver{company.drivers.length !== 1 ? 's' : ''}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {company.drivers.length === 0 ? (
                    <p className="text-gray-500 italic">No PR drivers recorded in this period</p>
                  ) : (
                    company.drivers.map((driver: string, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/40 hover:bg-white/95 transition-all duration-200 group"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                            style={{ backgroundColor: company.color }}
                          ></div>
                          <p className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                            {driver}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasData && companiesWithDrivers.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Target className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No competitive PR drivers found in this period</p>
        </div>
      )}
    </div>
  );
}