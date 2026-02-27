import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { Mail, MailOpen, Clock, Eye, Lightbulb, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface InsightItem {
  id: string;
  title: string;
  date: string;
  insights: Array<{
    category: string;
    analysis: string;
  }>;
  totalInsights: number;
  isRead: boolean;
}

const STORAGE_KEY = 'outcome-insights-read-status';

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default function OutcomeInsightsPage() {
  const { token, activePair } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [selectedInsight, setSelectedInsight] = useState<InsightItem | null>(null);
  const [insightItems, setInsightItems] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [readStatus, setReadStatus] = useState<Record<string, boolean>>({});

  const hasValidDateRange = filterValues.dateRange && 
    Array.isArray(filterValues.dateRange) && 
    filterValues.dateRange[0] && 
    filterValues.dateRange[1];

  const startDate = (hasValidDateRange ? filterValues.dateRange[0] : '') as string;
  const endDate = (hasValidDateRange ? filterValues.dateRange[1] : '') as string;

  // Load read status from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setReadStatus(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load read status from localStorage');
    }
  }, []);

  // Save read status to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readStatus));
    } catch (e) {
      console.warn('Failed to save read status');
    }
  }, [readStatus]);

  const fetchOutcomeInsights = useCallback(async () => {
    if (!token || !activePair) {
      setInsightItems([]);
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
        const startDateObj = new Date(startDate);
        const month = `${startDateObj.getFullYear()}-${String(startDateObj.getMonth() + 1).padStart(2, '0')}`;
        params.append('month', month);
      }

      const url = `https://p-fw0o.onrender.com/api/v1/report/outcome-insights?${params.toString()}`;
      console.log('Fetching Outcome Insights →', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success && result.data?.insights) {
        const insights: InsightItem[] = result.data.insights.map((item: any) => ({
          id: item.id.toString(),
          title: item.analyst_note || `Outcome Insight - ${format(new Date(item.date), 'MMM d, yyyy')}`,
          date: item.date,
          insights: item.insights || [],
          totalInsights: item.total_insights || 0,
          isRead: readStatus[item.id] || false,
        }));
        setInsightItems(insights);
      } else {
        setInsightItems([]);
        if (result.message && !result.message.includes('No outcome insights')) {
          toast.info(result.message);
        }
      }
    } catch (err: any) {
      console.error('Error fetching outcome insights:', err);
      if (err.response?.status === 404 || err.message?.includes('No outcome insights')) {
        setInsightItems([]);
      } else {
        toast.error('Failed to load outcome insights');
        setInsightItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [token, activePair, filterValues.dateRange, hasValidDateRange, startDate, readStatus]);

  useEffect(() => {
    fetchOutcomeInsights();
  }, [fetchOutcomeInsights]);

  const handleInsightClick = (insight: InsightItem) => {
    setSelectedInsight(insight);

    if (!insight.isRead) {
      setReadStatus(prev => ({ ...prev, [insight.id]: true }));
      setInsightItems(prev =>
        prev.map(i => i.id === insight.id ? { ...i, isRead: true } : i)
      );
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-cyan-100 text-cyan-800 border-cyan-200',
      'bg-teal-100 text-teal-800 border-teal-200',
      'bg-amber-100 text-amber-800 border-amber-200',
    ];
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const unreadCount = insightItems.filter(i => !i.isRead).length;
  const totalCount = insightItems.length;

  const filterOptions = [
    {
      key: 'dateRange',
      label: 'Select Date Range',
      type: 'daterange',
      placeholder: 'Pick date range',
      closeOnSelect: true,
    },
  ];

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

  return (
    <div className="space-y-6 md:space-y-8 pb-6 animate-fade-in relative">
      {/* Full-screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col items-center space-y-4 border border-gray-100 max-w-sm mx-4 text-center">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-amber-600" />
            <p className="text-base md:text-lg font-semibold text-gray-800">
              Loading outcome insights...
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              {formatDate(displayDates.start)} – {formatDate(displayDates.end)}
            </p>
          </div>
        </div>
      )}

      {/* Header - Responsive */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-xl md:rounded-2xl p-5 md:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 tracking-tight">
                Outcome Insights
              </h1>
              <p className="text-white text-base md:text-lg">
                Strategic insights and recommendations
              </p>
              {activePair && (
                <p className="text-white text-sm mt-1">
                  Currently viewing: <strong>{activePair.base_company.company_name}</strong>
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 md:p-4">
                <Lightbulb size={28} className="md:size-32 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs md:text-sm text-white">Total Insights</div>
                <div className="text-xl md:text-2xl font-bold text-white">{totalCount}</div>
                <div className="text-xs text-white">{unreadCount} unread</div>
              </div>
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

      {/* Main content - stack on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Insight List */}
        <div className="lg:col-span-2 space-y-4">
          {insightItems.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center h-64 md:h-96 text-center p-6">
                <Lightbulb size={48} className="md:size-64 text-gray-400 mb-6" />
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                  {hasValidDateRange
                    ? 'No outcome insights found for the selected period'
                    : 'Select a date range to load outcome insights'}
                </h3>
                <p className="text-sm md:text-base text-gray-500 max-w-md">
                  {hasValidDateRange
                    ? `No insights found for ${activePair?.base_company.company_name || 'this company'} in the selected period.`
                    : 'Use the date picker above to fetch outcome insights.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            insightItems.map((insight) => (
              <Card
                key={insight.id}
                className={cn(
                  "border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4",
                  !insight.isRead
                    ? 'bg-white border-l-amber-500'
                    : 'bg-gray-50/80 border-l-gray-300',
                  selectedInsight?.id === insight.id && 'ring-2 ring-amber-400 shadow-amber-100'
                )}
                onClick={() => handleInsightClick(insight)}
              >
                <CardContent className="p-4 md:p-6">
                  {/* Top row: date + read icon */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      {insight.isRead ? (
                        <MailOpen size={16} className="text-gray-400 flex-shrink-0" />
                      ) : (
                        <Mail size={16} className="text-amber-600 flex-shrink-0" />
                      )}
                      <span className={cn(
                        "text-xs md:text-sm font-medium",
                        insight.isRead ? 'text-gray-500' : 'text-gray-900'
                      )}>
                        {format(new Date(insight.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={cn(
                    "text-base md:text-lg leading-tight mb-3",
                    insight.isRead ? 'text-gray-700' : 'font-semibold text-gray-900'
                  )}>
                    {insight.title}
                  </h3>

                  {/* Counts */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {insight.totalInsights} insights
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {insight.insights.length} categories
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Detail View - full width on mobile, sticky on desktop */}
        <div className={cn(
          "lg:col-span-1",
          selectedInsight ? "block" : "hidden lg:block"
        )}>
          {selectedInsight ? (
            <Card className="border-0 shadow-lg sticky top-4 lg:top-20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2.5">
                  <Eye size={20} className="text-amber-600 flex-shrink-0" />
                  Insight Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 md:space-y-6 text-sm">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-gray-900 text-base md:text-lg leading-tight">
                      {selectedInsight.title}
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600">
                    {format(new Date(selectedInsight.date), 'PPPP')}
                  </p>
                </div>

                {/* Insights by Category */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1.5">
                    Insights by Category
                  </h4>
                  <div className="space-y-3">
                    {selectedInsight.insights.length === 0 ? (
                      <p className="text-sm text-gray-500 italic text-center py-4">
                        No insights recorded for this analysis
                      </p>
                    ) : (
                      selectedInsight.insights.map((insight, i) => (
                        <div 
                          key={i} 
                          className="bg-gray-50 rounded-lg p-4 md:p-5 border border-gray-100"
                        >
                          <Badge 
                            className={cn("mb-2.5 text-xs", getCategoryColor(insight.category))}
                          >
                            {insight.category}
                          </Badge>
                          <p className="text-gray-700 leading-relaxed text-sm">
                            {insight.analysis}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg hidden lg:block">
              <CardContent className="flex items-center justify-center h-64 md:h-96 text-center p-6">
                <div>
                  <Eye size={48} className="mx-auto text-gray-400 mb-6" />
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                    Select an insight
                  </h3>
                  <p className="text-sm md:text-base text-gray-500">
                    Click on an outcome insight from the list to view full details.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 