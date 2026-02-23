import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { Mail, MailOpen, Eye, TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface IndustryOverview {
  id: string;
  title: string;
  date: string;
  sector: string;
  highlights: string[];
  totalHighlights: number;
  isRead: boolean;
}

const STORAGE_KEY = 'industry-landscape-read-status';

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default function IndustryLandscapePage() {
  const { token, activePair } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [selectedOverview, setSelectedOverview] = useState<IndustryOverview | null>(null);
  const [overviews, setOverviews] = useState<IndustryOverview[]>([]);
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

  const fetchIndustryOverviews = useCallback(async () => {
    if (!token || !activePair) {
      setOverviews([]);
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
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const url = `https://pplus-g19c.onrender.com/api/v1/report/industry-landscape-overview?${params.toString()}`;
      console.log('Fetching Industry Landscape →', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success && result.data?.overviews) {
        const items: IndustryOverview[] = result.data.overviews.map((item: any) => ({
          id: item.id.toString(),
          title: item.analyst_note || `Industry Update - ${format(new Date(item.date), 'MMM d, yyyy')}`,
          date: item.date,
          sector: item.sector,
          highlights: item.highlights || [],
          totalHighlights: item.total_highlights || 0,
          isRead: readStatus[item.id] || false,
        }));
        setOverviews(items);
      } else {
        setOverviews([]);
        if (result.message && !result.message.includes('No industry landscape')) {
          toast.info(result.message);
        }
      }
    } catch (err: any) {
      console.error('Error fetching industry landscape:', err);
      if (err.response?.status === 404 || err.message?.includes('No industry landscape')) {
        setOverviews([]);
      } else {
        toast.error('Failed to load industry updates');
        setOverviews([]);
      }
    } finally {
      setLoading(false);
    }
  }, [token, activePair, filterValues.dateRange, hasValidDateRange, startDate, endDate, readStatus]);

  useEffect(() => {
    fetchIndustryOverviews();
  }, [fetchIndustryOverviews]);

  const handleOverviewClick = (overview: IndustryOverview) => {
    setSelectedOverview(overview);

    if (!overview.isRead) {
      setReadStatus(prev => ({ ...prev, [overview.id]: true }));
      setOverviews(prev =>
        prev.map(o => o.id === overview.id ? { ...o, isRead: true } : o)
      );
    }
  };

  const unreadCount = overviews.filter(o => !o.isRead).length;
  const totalCount = overviews.length;

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
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-teal-600" />
            <p className="text-base md:text-lg font-semibold text-gray-800">
              Loading industry updates...
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
                Industry Landscape
              </h1>
              <p className="text-white text-base md:text-lg">
                Sector updates and market insights
              </p>
              {activePair && (
                <p className="text-white text-sm mt-1">
                  Currently viewing: <strong>{activePair.base_company.company_name}</strong>
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 md:p-4">
                <TrendingUp size={28} className="md:size-32 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs md:text-sm text-white">Total Updates</div>
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
        {/* Overview List */}
        <div className="lg:col-span-2 space-y-4">
          {overviews.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center h-64 md:h-96 text-center p-6">
                <TrendingUp size={48} className="md:size-64 text-gray-400 mb-6" />
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                  {hasValidDateRange
                    ? 'No industry updates found for the selected period'
                    : 'Select a date range to load industry updates'}
                </h3>
                <p className="text-sm md:text-base text-gray-500 max-w-md">
                  {hasValidDateRange
                    ? `No updates found for ${activePair?.base_company.company_name || 'this company'} in the selected period.`
                    : 'Use the date picker above to fetch industry landscape updates.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            overviews.map((overview) => (
              <Card
                key={overview.id}
                className={cn(
                  "border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4",
                  !overview.isRead
                    ? 'bg-white border-l-teal-500'
                    : 'bg-gray-50/80 border-l-gray-300',
                  selectedOverview?.id === overview.id && 'ring-2 ring-teal-400 shadow-teal-100'
                )}
                onClick={() => handleOverviewClick(overview)}
              >
                <CardContent className="p-4 md:p-6">
                  {/* Top row: date + read icon */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      {overview.isRead ? (
                        <MailOpen size={16} className="text-gray-400 flex-shrink-0" />
                      ) : (
                        <Mail size={16} className="text-teal-600 flex-shrink-0" />
                      )}
                      <span className={cn(
                        "text-xs md:text-sm font-medium",
                        overview.isRead ? 'text-gray-500' : 'text-gray-900'
                      )}>
                        {format(new Date(overview.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Sector badge + title */}
                  <div className="mb-3">
                    <Badge 
                      variant="secondary" 
                      className="bg-teal-100 text-teal-800 text-xs mb-2"
                    >
                      {overview.sector}
                    </Badge>
                  </div>

                  <h3 className={cn(
                    "text-base md:text-lg leading-tight mb-3",
                    overview.isRead ? 'text-gray-700' : 'font-semibold text-gray-900'
                  )}>
                    {overview.title}
                  </h3>

                  {/* Highlights count */}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {overview.totalHighlights} highlights
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
          selectedOverview ? "block" : "hidden lg:block"
        )}>
          {selectedOverview ? (
            <Card className="border-0 shadow-lg sticky top-4 lg:top-20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2.5">
                  <Eye size={20} className="text-teal-600 flex-shrink-0" />
                  Overview Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 md:space-y-6 text-sm">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-gray-900 text-base md:text-lg leading-tight">
                      {selectedOverview.title}
                    </h3>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-teal-100 text-teal-800 text-xs"
                  >
                    {selectedOverview.sector}
                  </Badge>
                  <p className="text-xs md:text-sm text-gray-600 mt-2">
                    {format(new Date(selectedOverview.date), 'PPPP')}
                  </p>
                </div>

                {/* Highlights */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1.5">
                    Key Highlights ({selectedOverview.totalHighlights})
                  </h4>
                  <ul className="space-y-2.5">
                    {selectedOverview.highlights.length === 0 ? (
                      <p className="text-sm text-gray-500 italic text-center py-4">
                        No highlights recorded for this update
                      </p>
                    ) : (
                      selectedOverview.highlights.map((highlight, i) => (
                        <li 
                          key={i} 
                          className="text-gray-700 leading-relaxed text-sm flex items-start gap-2"
                        >
                          <span className="text-teal-600 mt-1 text-lg">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg hidden lg:block">
              <CardContent className="flex items-center justify-center h-64 md:h-96 text-center p-6">
                <div>
                  <Eye size={48} className="mx-auto text-gray-400 mb-6" />
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                    Select an update
                  </h3>
                  <p className="text-sm md:text-base text-gray-500">
                    Click on an industry update from the list to view full details.
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