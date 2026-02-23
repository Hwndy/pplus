import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthContext';

interface SentimentBreakdown {
  strongly_positive: { count: number; percentage: number };
  moderately_positive: { count: number; percentage: number };
  positive: { count: number; percentage: number };
  neutral: { count: number; percentage: number };
  moderately_negative: { count: number; percentage: number };
  negative: { count: number; percentage: number };
  strongly_negative: { count: number; percentage: number };
}

interface KeyDrivers {
  strongly_positive: string[] | string;
  positive: string[] | string;
  moderately_positive: string[] | string;
  neutral: string[] | string;
  moderately_negative: string[] | string;
  negative: string[] | string;
  strongly_negative: string[] | string;
}

interface SentimentData {
  sentiment_breakdown: SentimentBreakdown;
  totals: {
    total_categorized: number;
    total_uncategorized: number;
  };
  key_brand_reputational_drivers: KeyDrivers;
}

const DEFAULT_ZERO_DATA: {
  sentiment_breakdown: SentimentBreakdown;
  key_brand_reputational_drivers: KeyDrivers;
  total_categorized: number;
} = {
  sentiment_breakdown: {
    strongly_positive: { count: 0, percentage: 0 },
    moderately_positive: { count: 0, percentage: 0 },
    positive: { count: 0, percentage: 0 },
    neutral: { count: 0, percentage: 0 },
    moderately_negative: { count: 0, percentage: 0 },
    negative: { count: 0, percentage: 0 },
    strongly_negative: { count: 0, percentage: 0 },
  },
  total_categorized: 0,
  key_brand_reputational_drivers: {
    strongly_positive: 'No strongly positive coverage recorded',
    positive: 'No positive coverage recorded',
    moderately_positive: 'No moderately positive coverage recorded',
    neutral: 'No neutral coverage recorded',
    moderately_negative: 'No moderately negative coverage recorded',
    negative: 'No negative coverage recorded',
    strongly_negative: 'No strongly negative coverage recorded',
  },
};

const BrandSentimentPage: React.FC = () => {
  const { token, activePair } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [data, setData] = useState<any>(DEFAULT_ZERO_DATA);
  const [companyName, setCompanyName] = useState<string>('Your Company');
  const [period, setPeriod] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  const API_URL = 'https://pplus-g19c.onrender.com/api/v1/report/brand-media-sentiment-index';

  const fetchData = async () => {
    if (!token || !activePair) {
      setLoading(false);
      return;
    }

    let shouldFetch = true;

    if (filterValues.dateRange) {
      const [startDate, endDate] = filterValues.dateRange as [string | null, string | null];
      if (!startDate || !endDate) {
        shouldFetch = false;
      } else if (new Date(startDate) > new Date(endDate)) {
        toast.error('Start date must be before or equal to end date');
        shouldFetch = false;
      }
    }

    if (!shouldFetch) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('pair_id', String(activePair.pair_id));

      if (filterValues.dateRange) {
        const [startDate, endDate] = filterValues.dateRange as [string, string];
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const url = `${API_URL}?${params.toString()}`;
      console.log('Fetching Brand Sentiment →', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        const apiData = result.data;

        setCompanyName(activePair.base_company.company_name || 'Your Company');
        setPeriod({
          start: apiData.period.start || '',
          end: apiData.period.end || '',
        });

        setData({
          sentiment_breakdown: apiData.sentiment_breakdown,
          total_categorized: apiData.totals.total_categorized,
          key_brand_reputational_drivers: apiData.key_brand_reputational_drivers,
        });

        setHasData(true);
      } else {
        setCompanyName(activePair.base_company.company_name || 'Your Company');
        setPeriod({ start: '', end: '' });
        setData(DEFAULT_ZERO_DATA);
        setHasData(false);

        if (result.message?.includes('No editorials') || result.message?.includes('No data')) {
          toast.info(`No media mentions found for ${companyName} in the selected period`);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load brand sentiment analysis');
      setCompanyName(activePair?.base_company.company_name || 'Your Company');
      setData(DEFAULT_ZERO_DATA);
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, activePair, filterValues.dateRange]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
  };

  // Aggregate for the main sentiment bar: Positive = strongly + moderately + positive
  const totalPositivePercentage = useMemo(() => {
    const sb = data.sentiment_breakdown;
    return (
      sb.strongly_positive.percentage +
      sb.moderately_positive.percentage +
      sb.positive.percentage
    );
  }, [data.sentiment_breakdown]);

  const totalNegativePercentage = useMemo(() => {
    const sb = data.sentiment_breakdown;
    return (
      sb.strongly_negative.percentage +
      sb.negative.percentage +
      sb.moderately_negative.percentage
    );
  }, [data.sentiment_breakdown]);

  const chartData = useMemo(() => {
    return [
      { label: 'Positive', value: totalPositivePercentage, color: '#10B981' },
      { label: 'Neutral', value: data.sentiment_breakdown.neutral.percentage, color: '#94a3b8' },
      { label: 'Negative', value: totalNegativePercentage, color: '#ef4444' },
    ];
  }, [totalPositivePercentage, totalNegativePercentage, data.sentiment_breakdown.neutral.percentage]);

  const filterOptions = [
    {
      key: 'dateRange',
      label: 'Select Period',
      type: 'daterange',
      placeholder: 'Select start and end date',
      closeOnSelect: true,
    },
  ];

  const renderDriverList = (drivers: string[] | string) => {
    if (Array.isArray(drivers)) {
      return drivers.length > 0 ? (
        drivers.map((item, i) => (
          <li key={i} className="list-disc list-inside text-sm md:text-base">
            {item}
          </li>
        ))
      ) : (
        <li className="italic text-gray-500 text-sm md:text-base">No coverage recorded</li>
      );
    }
    return <li className="italic text-sm md:text-base">• {drivers}</li>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
        <span className="ml-4 text-base md:text-lg">
          Loading sentiment analysis for <strong>{activePair?.base_company.company_name || 'your company'}</strong>...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-6 animate-fade-in">
      {/* Header - Responsive */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-xl md:rounded-2xl p-5 md:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 rounded-full bg-white/10 transform translate-x-20 -translate-y-20 md:translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 md:w-48 md:h-48 rounded-full bg-white/5 transform -translate-x-16 translate-y-16 md:-translate-x-24 translate-y-24"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">
              Brand Media Sentiment Distribution Matrix
            </h1>
            <p className="text-pink-100 text-base md:text-lg">
              {companyName} • {period.start ? `${formatDate(period.start)} – ${formatDate(period.end)}` : 'Select a date range'}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 md:p-4 self-center md:self-auto">
            <Heart size={24} className="md:size-28 text-white" />
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

      {!hasData && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
          No media mentions found for {companyName} in the selected period. Showing zero values.
        </div>
      )}

      {/* Sentiment Distribution Bar - Fully responsive */}
      <div className="mb-6 md:mb-8">
        <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">
          Overall Sentiment Distribution
        </h3>
        <div className="flex h-10 md:h-12 w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          {chartData.map((segment, index) => (
            <div
              key={index}
              style={{ width: `${segment.value}%`, backgroundColor: segment.color }}
              className="flex items-center justify-center text-white text-xs md:text-sm font-bold transition-all duration-500 min-w-[40px]"
            >
              {segment.value > 8 && `${segment.value.toFixed(0)}%`}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-2 md:mt-3 text-xs text-gray-500">
          {['0%', '20%', '40%', '60%', '80%', '100%'].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="flex flex-wrap justify-center md:justify-start mt-4 md:mt-5 gap-4 md:gap-6 text-sm">
          {chartData.map((segment) => (
            <div key={segment.label} className="flex items-center gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 rounded" style={{ backgroundColor: segment.color }} />
              <span className="font-medium text-gray-700">
                {segment.label} ({segment.value.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Key Brand Reputational Drivers - Responsive grid */}
      <div>
        <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-gray-800">
          Key Brand Reputational Drivers (Detailed Breakdown)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Strongly Positive */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-300 p-4 md:p-5 rounded-xl shadow-sm">
            <h4 className="font-bold text-emerald-800 mb-2.5 md:mb-3 text-base md:text-lg">
              Strongly Positive
            </h4>
            <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-emerald-700">
              {renderDriverList(data.key_brand_reputational_drivers.strongly_positive)}
            </ul>
          </div>

          {/* Moderately Positive */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-300 p-4 md:p-5 rounded-xl shadow-sm">
            <h4 className="font-bold text-green-800 mb-2.5 md:mb-3 text-base md:text-lg">
              Moderately Positive
            </h4>
            <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-green-700">
              {renderDriverList(data.key_brand_reputational_drivers.moderately_positive)}
            </ul>
          </div>

          {/* Positive */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-300 p-4 md:p-5 rounded-xl shadow-sm">
            <h4 className="font-bold text-teal-800 mb-2.5 md:mb-3 text-base md:text-lg">
              Positive
            </h4>
            <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-teal-700">
              {renderDriverList(data.key_brand_reputational_drivers.positive)}
            </ul>
          </div>

          {/* Neutral */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-300 p-4 md:p-5 rounded-xl shadow-sm">
            <h4 className="font-bold text-gray-800 mb-2.5 md:mb-3 text-base md:text-lg">
              Neutral
            </h4>
            <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-gray-700">
              {renderDriverList(data.key_brand_reputational_drivers.neutral)}
            </ul>
          </div>

          {/* Moderately Negative */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-300 p-4 md:p-5 rounded-xl shadow-sm">
            <h4 className="font-bold text-orange-800 mb-2.5 md:mb-3 text-base md:text-lg">
              Moderately Negative
            </h4>
            <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-orange-700">
              {renderDriverList(data.key_brand_reputational_drivers.moderately_negative)}
            </ul>
          </div>

          {/* Negative & Strongly Negative - spans full width on mobile */}
          <div className="bg-gradient-to-br from-red-50 to-rose-100 border border-red-300 p-4 md:p-5 rounded-xl shadow-sm col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div>
                <h4 className="font-bold text-red-800 mb-2.5 md:mb-3 text-base md:text-lg">
                  Negative
                </h4>
                <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-red-700">
                  {renderDriverList(data.key_brand_reputational_drivers.negative)}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-red-900 mb-2.5 md:mb-3 text-base md:text-lg">
                  Strongly Negative
                </h4>
                <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-red-800">
                  {renderDriverList(data.key_brand_reputational_drivers.strongly_negative)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandSentimentPage;