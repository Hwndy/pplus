import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { Heart, Loader2 } from 'lucide-react';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';

interface SentimentData {
  positive: { count: number; percentage: number };
  negative: { count: number; percentage: number };
  neutral: { count: number; percentage: number };
  total_categorized: number;
  key_brand_reputational_drivers: {
    positive: string[] | string;
    negative: string[] | string;
    neutral: string[] | string;
  };
}

const DEFAULT_ZERO_DATA: SentimentData = {
  positive: { count: 0, percentage: 0 },
  negative: { count: 0, percentage: 0 },
  neutral: { count: 0, percentage: 0 },
  total_categorized: 0,
  key_brand_reputational_drivers: {
    positive: 'No positive coverage recorded this month',
    negative: 'No negative coverage recorded this month',
    neutral: 'No neutral coverage recorded this month',
  },
};

const BrandSentimentPage: React.FC = () => {
  const { token, activePair } = useAuth(); // ← Now using activePair
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [data, setData] = useState<SentimentData>(DEFAULT_ZERO_DATA);
  const [companyName, setCompanyName] = useState<string>('Your Company');
  const [period, setPeriod] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  const API_URL = 'https://pplus-5kdv.onrender.com/api/report/brand-media-sentiment-index';

  const fetchData = async () => {
    if (!token || !activePair) {
      setLoading(false);
      return;
    }

    if (filterValues.dateRange) {
      const [startDate, endDate] = filterValues.dateRange as [string | null, string | null];
      if (new Date(startDate) > new Date(endDate)) {
        toast.error('Start date must be before or equal to end date');
        setLoading(false);
        return;
      }
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();

      // Always send pair_id
      params.append('pair_id', String(activePair.pair_id));

      // Send month if selected
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
          positive: apiData.sentiment_breakdown.positive,
          negative: apiData.sentiment_breakdown.negative,
          neutral: apiData.sentiment_breakdown.neutral,
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
          toast.info(`No media mentions found for ${activePair.base_company.company_name} this month`);
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

  // Re-fetch when pair or month changes
  useEffect(() => {
    fetchData();
  }, [token, activePair, filterValues.dateRange]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
  };

  const chartData = useMemo(() => {
    if (!data) return [];
    return [
      { label: 'Positive', value: data.positive.percentage, color: '#10B981' },
      { label: 'Neutral', value: data.neutral.percentage, color: '#94a3b8' },
      { label: 'Negative', value: data.negative.percentage, color: '#ef4444' },
    ];
  }, [data]);

  const filterOptions = [
    {
      key: 'dateRange',
      label: 'Select Month',
      type: 'daterange',
      placeholder: 'Select start and end date',
      closeOnSelect: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-pink-600" />
        <span className="ml-4 text-lg">
          Loading sentiment analysis for <strong>{activePair?.base_company.company_name || 'your company'}</strong>...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Brand Media Sentiment Distribution Matrix
            </h1>
            <p className="text-pink-100">
              {companyName} • {period.start ? `${formatDate(period.start)} – ${formatDate(period.end)}` : 'Select a date range'}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Heart size={28} className="text-white" />
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

      {/* No Data Banner */}
      {!hasData && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
          No media mentions found for {companyName} in the selected month. Showing zero values.
        </div>
      )}

      {/* Sentiment Bar */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Sentiment Distribution</h3>
        <div className="flex h-12 w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          {chartData.map((segment, index) => (
            <div
              key={index}
              style={{ width: `${segment.value}%`, backgroundColor: segment.color }}
              className="flex items-center justify-center text-white text-sm font-bold transition-all duration-500"
            >
              {segment.value > 8 && `${segment.value.toFixed(0)}%`}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-3 text-xs text-gray-500">
          {['0%', '20%', '40%', '60%', '80%', '100%'].map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="flex justify-center mt-5 gap-6 text-sm">
          {chartData.map((segment) => (
            <div key={segment.label} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: segment.color }}
              />
              <span className="font-medium text-gray-700">
                {segment.label} ({segment.value.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Drivers */}
      <div>
        <h3 className="text-xl font-bold mb-5 text-gray-800">
          Key Brand Reputational Drivers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Positive */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 p-6 rounded-xl shadow-sm">
            <h4 className="font-bold text-emerald-800 mb-3 text-lg">Positive Drivers</h4>
            <ul className="space-y-2 text-sm text-emerald-700">
              {Array.isArray(data.key_brand_reputational_drivers.positive) ? (
                data.key_brand_reputational_drivers.positive.length > 0 ? (
                  data.key_brand_reputational_drivers.positive.map((item, i) => (
                    <li key={i} className="list-disc list-inside">• {item}</li>
                  ))
                ) : (
                  <li className="italic text-gray-500">No positive drivers recorded</li>
                )
              ) : (
                <li className="italic">• {data.key_brand_reputational_drivers.positive}</li>
              )}
            </ul>
          </div>

          {/* Negative */}
          <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 p-6 rounded-xl shadow-sm">
            <h4 className="font-bold text-red-800 mb-3 text-lg">Negative Drivers</h4>
            <ul className="space-y-2 text-sm text-red-700">
              {Array.isArray(data.key_brand_reputational_drivers.negative) ? (
                data.key_brand_reputational_drivers.negative.length > 0 ? (
                  data.key_brand_reputational_drivers.negative.map((item, i) => (
                    <li key={i} className="list-disc list-inside">• {item}</li>
                  ))
                ) : (
                  <li className="italic text-gray-500">No negative drivers recorded</li>
                )
              ) : (
                <li className="italic">• {data.key_brand_reputational_drivers.negative}</li>
              )}
            </ul>
          </div>

          {/* Neutral */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-300 p-6 rounded-xl shadow-sm">
            <h4 className="font-bold text-gray-800 mb-3 text-lg">Neutral Drivers</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {Array.isArray(data.key_brand_reputational_drivers.neutral) ? (
                data.key_brand_reputational_drivers.neutral.length > 0 ? (
                  data.key_brand_reputational_drivers.neutral.map((item, i) => (
                    <li key={i} className="list-disc list-inside">• {item}</li>
                  ))
                ) : (
                  <li className="italic text-gray-500">No neutral drivers recorded</li>
                )
              ) : (
                <li className="italic">• {data.key_brand_reputational_drivers.neutral}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandSentimentPage;