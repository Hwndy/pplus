import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';
import { UniversalFilter, FilterOption, FilterValues } from '@/components/ui/UniversalFilter';

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

const BrandSentimentPage: React.FC = () => {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const filterOptions: FilterOption[] = [
    { key: 'dateRange', label: 'Date Range', type: 'daterange', placeholder: 'Select date range' },
    {
      key: 'sentimentType',
      label: 'Sentiment Type',
      type: 'multiselect',
      options: [
        { value: 'positive', label: 'Positive' },
        { value: 'negative', label: 'Negative' },
        { value: 'neutral', label: 'Neutral' },
      ],
    },
    {
      key: 'driverType',
      label: 'Driver Type',
      type: 'multiselect',
      options: [
        { value: 'positive', label: 'Positive Drivers' },
        { value: 'negative', label: 'Negative Drivers' },
        { value: 'neutral', label: 'Neutral Drivers' },
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

    const determineCompany = async () => {
      setDataLoading(true);
      try {
        let url = 'https://pplus-nl5o.onrender.com/api/report/competitive-intelligence';
        const month = getMonthFromDateRange(filterValues.dateRange);
        if (month) url += `?month=${month}`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (result.success) {
          const compInt = result.data.competitive_intelligence;
          const subSectors = Object.keys(compInt);
          if (subSectors.length > 0) {
            const firstSub = subSectors[0];
            const companies = compInt[firstSub].companies_in_category;
            if (companies.length > 0) {
              setSelectedCompany(companies[0]);
              return;
            }
          }
        }
        setSelectedCompany('Glo Nigeria');
      } catch (err) {
        console.error('Error determining company:', err);
        toast.error('Error determining company');
        setSelectedCompany('Glo Nigeria');
      } finally {
        setDataLoading(false);
      }
    };

    determineCompany();
  }, [authLoading, isAuthenticated, user, token, filterValues]);

  useEffect(() => {
    if (!selectedCompany || authLoading || !isAuthenticated) return;

    const fetchSentimentData = async () => {
      setDataLoading(true);
      try {
        let url = `https://pplus-nl5o.onrender.com/api/report/brand-media-sentiment-index?company=${encodeURIComponent(
          selectedCompany
        )}`;
        const month = getMonthFromDateRange(filterValues.dateRange);
        if (month) url += `&month=${month}`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (result.success) {
          setSentimentData({
            positive: result.data.sentiment_breakdown.positive,
            negative: result.data.sentiment_breakdown.negative,
            neutral: result.data.sentiment_breakdown.neutral,
            total_categorized: result.data.totals.total_categorized,
            key_brand_reputational_drivers: result.data.key_brand_reputational_drivers,
          });
        } else {
          throw new Error(result.message || 'Failed to fetch sentiment data');
        }
      } catch (err) {
        console.error('Error fetching sentiment data:', err);
        toast.error('Error fetching sentiment data');
        setSentimentData(null);
      } finally {
        setDataLoading(false);
      }
    };

    fetchSentimentData();
  }, [selectedCompany, filterValues, token, authLoading, isAuthenticated]);

  const chartData = useMemo(() => {
    if (!sentimentData) return [];
    return [
      { label: 'Positive', value: sentimentData.positive.percentage, color: '#1dd1a1' },
      { label: 'Neutral', value: sentimentData.neutral.percentage, color: '#c8d6e5' },
      { label: 'Negative', value: sentimentData.negative.percentage, color: '#ff6b6b' },
    ];
  }, [sentimentData]);

  if (authLoading || dataLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-8 p-6">
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Brand Media Sentiment Distribution Matrix</h1>
            <p className="text-pink-100">Comprehensive sentiment analysis and reputation drivers</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Heart size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      <UniversalFilter filters={filterOptions} values={filterValues} onChange={setFilterValues} onReset={resetFilters} />

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Sentiment Distribution</h3>
        <div className="flex h-10 w-full rounded overflow-hidden border border-gray-200">
          {chartData.map((segment, index) => (
            <div
              key={index}
              style={{ width: `${segment.value}%`, backgroundColor: segment.color }}
              className="flex items-center justify-center text-white text-xs font-semibold transition-all"
            >
              {segment.value > 5 && `${segment.value}%`}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4 text-xs text-gray-600">
          {['0%', '20%', '40%', '60%', '80%', '100%'].map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>

        <div className="flex justify-center mt-4 gap-4 text-xs">
          {chartData.map((segment, index) => (
            <div key={index} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: segment.color }}></div>
              <span>{segment.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Key Brand Reputational Drivers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-100 p-4 rounded-lg shadow">
            <h4 className="font-semibold text-green-800 mb-2">Positive</h4>
            <ul className="list-disc pl-5 space-y-1">
              {Array.isArray(sentimentData?.key_brand_reputational_drivers.positive)
                ? sentimentData.key_brand_reputational_drivers.positive.map((item, idx) => (
                    <li key={idx} className="text-sm text-green-700">{item}</li>
                  ))
                : <li className="text-sm text-green-700">{sentimentData?.key_brand_reputational_drivers.positive}</li>}
            </ul>
          </div>
          <div className="bg-red-100 p-4 rounded-lg shadow">
            <h4 className="font-semibold text-red-800 mb-2">Negative</h4>
            <ul className="list-disc pl-5 space-y-1">
              {Array.isArray(sentimentData?.key_brand_reputational_drivers.negative)
                ? sentimentData.key_brand_reputational_drivers.negative.map((item, idx) => (
                    <li key={idx} className="text-sm text-red-700">{item}</li>
                  ))
                : <li className="text-sm text-red-700">{sentimentData?.key_brand_reputational_drivers.negative}</li>}
            </ul>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg shadow">
            <h4 className="font-semibold text-gray-800 mb-2">Neutral</h4>
            <ul className="list-disc pl-5 space-y-1">
              {Array.isArray(sentimentData?.key_brand_reputational_drivers.neutral)
                ? sentimentData.key_brand_reputational_drivers.neutral.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700">{item}</li>
                  ))
                : <li className="text-sm text-gray-700">{sentimentData?.key_brand_reputational_drivers.neutral}</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandSentimentPage;
