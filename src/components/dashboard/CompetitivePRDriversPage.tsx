import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { Target, Building2, Loader2 } from 'lucide-react';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

const getColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

const CompanyIcon = ({ name }: { name: string }) => {
  const initial = name.charAt(0).toUpperCase();
  const bgColor = getColor(name);

  return (
    <div
      className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white font-bold text-base md:text-lg shadow-lg flex-shrink-0"
      style={{ backgroundColor: bgColor }}
    >
      {initial}
    </div>
  );
};

export function CompetitivePRDriversPage() {
  const { token, activePair } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  const API_URL = 'https://pplus-g19c.onrender.com/api/v1/report/competitive-intelligence';

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
      placeholder: 'Select start and end date',
      closeOnSelect: true,
    },
  ];

  // Aggregate PR drivers across all sectors
  const companiesWithDrivers = hasData
    ? (() => {
        const companyMap = new Map<string, string[]>();

        Object.values(data.competitive_intelligence || {}).forEach((sector: any) => {
          const drivers = sector.analysis?.competitive_pr_drivers || {};
          Object.entries(drivers).forEach(([companyName, driverData]: [string, any]) => {
            const titles = driverData.sample_titles || [];
            const trimmedName = companyName.trim();

            if (!companyMap.has(trimmedName)) {
              companyMap.set(trimmedName, []);
            }
            companyMap.get(trimmedName)!.push(...titles);
          });
        });

        return Array.from(companyMap.entries())
          .map(([name, drivers]) => ({
            name,
            color: getColor(name),
            drivers: [...new Set(drivers)], // Remove duplicates
          }))
          .sort((a, b) => b.drivers.length - a.drivers.length); // Most active first
      })()
    : [];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-purple-600" />
        <span className="ml-3 md:ml-4 text-base md:text-lg">
          Loading PR drivers for {activePair?.base_company.company_name || 'your company'} ({industryName} Industry)...
        </span>
      </div>
    );
  }

  // No date selected
  if (!displayDates) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl md:rounded-2xl p-5 md:p-8 text-white relative overflow-hidden">
          <h2 className="text-xl md:text-2xl font-bold">
            Competitive PR Drivers
          </h2>
        </div>

        <UniversalFilter
          filters={filterOptions}
          values={filterValues}
          onChange={setFilterValues}
          onReset={() => setFilterValues({})}
        />

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 md:p-6 text-center text-purple-800">
          <Target className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-purple-500" />
          <p className="text-base md:text-lg font-medium">Select a date range to explore PR drivers</p>
          <p className="text-sm md:text-base mt-2 text-purple-600">
            Discover key strategic communications, initiatives, and media narratives driving competitor visibility
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-6 animate-fade-in">
      {/* Header - Responsive */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl md:rounded-2xl p-5 md:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 h-48 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl -translate-x-32 -translate-y-32 md:-translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 md:w-80 md:h-80 bg-white/5 rounded-full blur-3xl translate-x-16 translate-y-16 md:translate-x-32 translate-y-32"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 md:gap-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-3 tracking-tight">
              Competitive PR Drivers
            </h1>
            <p className="text-purple-100 text-base md:text-lg opacity-90">
              Key PR initiatives and strategic communications from competitive holdings
            </p>
          </div>

          <div className="text-right space-y-1">
            <div className="text-xs md:text-sm text-purple-100">Reporting Period</div>
            <div className="text-base md:text-2xl font-semibold">
              {formatDate(displayDates.start)} – {formatDate(displayDates.end)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <UniversalFilter
        filters={filterOptions}
        values={filterValues}
        onChange={setFilterValues}
        onReset={() => setFilterValues({})}
      />

      {!hasData && displayDates && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 md:p-6 text-amber-800 text-sm md:text-base text-center">
          No PR drivers data available for the selected period. Try a broader date range.
        </div>
      )}

      {hasData && companiesWithDrivers.length > 0 && (
        <div className="space-y-5 md:space-y-8">
          {companiesWithDrivers.map((company) => (
            <Card
              key={company.name}
              className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/95 backdrop-blur"
              style={{
                borderLeft: `6px solid ${company.color}`,
              }}
            >
              <CardHeader className="pb-3 md:pb-5">
                <CardTitle className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
                  <div className="flex items-center gap-3 md:gap-5">
                    <CompanyIcon name={company.name} />
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold" style={{ color: company.color }}>
                        {company.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">
                        {company.drivers.length} PR driver{company.drivers.length !== 1 ? 's' : ''} identified
                      </p>
                    </div>
                  </div>
                  <Building2 size={24} className="text-gray-300 md:size-32 opacity-70" />
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 md:p-6">
                <div className="space-y-3 md:space-y-4">
                  {company.drivers.length === 0 ? (
                    <p className="text-gray-500 italic py-6 md:py-8 text-center text-sm md:text-base">
                      No notable PR drivers recorded in this period
                    </p>
                  ) : (
                    company.drivers.map((title: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex gap-3 md:gap-4 p-3 md:p-5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-gray-100 hover:to-gray-200/70 transition-all duration-300 group"
                      >
                        <div
                          className="w-2.5 h-full rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: company.color }}
                        />
                        <p className="text-gray-800 leading-relaxed text-sm md:text-base group-hover:text-gray-900">
                          {title}
                        </p>
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
        <div className="text-center py-16 md:py-20 text-gray-500">
          <Target className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-6 text-gray-300" />
          <p className="text-lg md:text-xl font-medium">No competitive PR drivers identified in this period</p>
          <p className="text-sm md:text-base mt-3">
            Competitors may have had limited media activity or strategic communications.
          </p>
        </div>
      )}
    </div>
  );
}