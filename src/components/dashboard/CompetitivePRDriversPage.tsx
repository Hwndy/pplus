import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { Target, Building2, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';

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
      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
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

  const API_URL = 'https://pplus-5kdv.onrender.com/api/report/competitive-intelligence';

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

  const totalHoldings = companiesWithDrivers.length;
  const totalPRDrivers = companiesWithDrivers.reduce((sum, c) => sum + c.drivers.length, 0);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
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
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
          Competitive PR Drivers
        </h2>

        <UniversalFilter
          filters={filterOptions}
          values={filterValues}
          onChange={setFilterValues}
          onReset={() => setFilterValues({})}
        />

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-10 text-center text-purple-800">
          <Target className="w-20 h-20 mx-auto mb-6 text-purple-500" />
          <p className="text-xl font-semibold">Select a date range to explore PR drivers</p>
          <p className="text-base mt-3 text-purple-600 max-w-2xl mx-auto">
            Discover key strategic communications, initiatives, and media narratives driving competitor visibility
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl translate-x-32 translate-y-32"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-3 tracking-tight">Competitive PR Drivers</h1>
              <p className="text-purple-100 text-lg opacity-90">
                Key PR initiatives and strategic communications from competitive holdings
              </p>
            </div>
            <div className="text-right space-y-2">
              <div className="text-sm text-purple-100">Reporting Period</div>
              <div className="text-2xl font-semibold">
                {formatDate(displayDates.start)} – {formatDate(displayDates.end)}
              </div>
              {hasData && totalPRDrivers > 0 && (
                <div className="text-sm text-purple-200 mt-4">
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
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800 text-center">
          <p className="text-lg">No PR drivers data available for the selected period.</p>
          <p className="text-sm mt-2">Try selecting a broader date range.</p>
        </div>
      )}

      {hasData && companiesWithDrivers.length > 0 && (
        <div className="grid gap-8">
          {companiesWithDrivers.map((company) => (
            <Card
              key={company.name}
              className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/95 backdrop-blur"
              style={{
                borderLeft: `6px solid ${company.color}`,
              }}
            >
              <CardHeader className="pb-5">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <CompanyIcon name={company.name} />
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: company.color }}>
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {company.drivers.length} PR driver{company.drivers.length !== 1 ? 's' : ''} identified
                      </p>
                    </div>
                  </div>
                  <Building2 size={32} className="text-gray-300" />
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {company.drivers.length === 0 ? (
                    <p className="text-gray-500 italic py-8 text-center">
                      No notable PR drivers recorded in this period
                    </p>
                  ) : (
                    company.drivers.map((title: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex gap-4 p-5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-gray-100 hover:to-gray-200/70 transition-all duration-300 group"
                      >
                        <div
                          className="w-3 h-full rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: company.color }}
                        />
                        <p className="text-gray-800 leading-relaxed group-hover:text-gray-900">
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
        <div className="text-center py-20 text-gray-500">
          <Target className="w-24 h-24 mx-auto mb-6 text-gray-300" />
          <p className="text-xl font-medium">No competitive PR drivers identified in this period</p>
          <p className="text-base mt-3">Competitors may have had limited media activity or strategic communications.</p>
        </div>
      )}
    </div>
  );
}