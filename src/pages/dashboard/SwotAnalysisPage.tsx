import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { Mail, MailOpen, Clock, Eye, Target, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SwotItem {
  id: string;
  title: string;
  date: string;
  strengths: Array<{ analysis: string }>;
  weaknesses: Array<{ analysis: string }>;
  opportunities: Array<{ analysis: string }>;
  threats: Array<{ analysis: string }>;
  isRead: boolean;
}

const STORAGE_KEY = 'swot-read-status';

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default function SwotAnalysisPage() {
  const { token, activePair } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [selectedSwot, setSelectedSwot] = useState<SwotItem | null>(null);
  const [swotItems, setSwotItems] = useState<SwotItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [readStatus, setReadStatus] = useState<Record<string, boolean>>({});

  const hasValidDateRange = filterValues.dateRange && 
    Array.isArray(filterValues.dateRange) && 
    filterValues.dateRange[0] && 
    filterValues.dateRange[1];

  const startDate = (hasValidDateRange ? filterValues.dateRange[0] : '') as string;
  const endDate = (hasValidDateRange ? filterValues.dateRange[1] : '') as string;

  // Load read status
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

  // Save read status
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readStatus));
    } catch (e) {
      console.warn('Failed to save read status');
    }
  }, [readStatus]);

  const fetchSwotAnalyses = useCallback(async () => {
    if (!token || !activePair) {
      setSwotItems([]);
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

      const url = `https://p-fw0o.onrender.com/api/v1/report/swot-analysis?${params.toString()}`;
      console.log('Fetching SWOT →', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success && result.data?.analyses) {
        const analyses: SwotItem[] = result.data.analyses.map((item: any) => ({
          id: item.id.toString(),
          title: item.analyst_note || `SWOT Analysis - ${format(new Date(item.date), 'MMM d, yyyy')}`,
          date: item.date,
          strengths: item.strengths || [],
          weaknesses: item.weaknesses || [],
          opportunities: item.opportunities || [],
          threats: item.threats || [],
          isRead: readStatus[item.id] || false,
        }));
        setSwotItems(analyses);
      } else {
        setSwotItems([]);
        if (result.message && !result.message.includes('No SWOT')) {
          toast.info(result.message);
        }
      }
    } catch (err: any) {
      console.error('Error fetching SWOT:', err);
      if (err.response?.status === 404 || err.message?.includes('No SWOT')) {
        setSwotItems([]);
      } else {
        toast.error('Failed to load SWOT analyses');
        setSwotItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [token, activePair, filterValues.dateRange, hasValidDateRange, startDate, readStatus]);

  useEffect(() => {
    fetchSwotAnalyses();
  }, [fetchSwotAnalyses]);

  const handleSwotClick = (swot: SwotItem) => {
    setSelectedSwot(swot);

    if (!swot.isRead) {
      setReadStatus(prev => ({ ...prev, [swot.id]: true }));
      setSwotItems(prev =>
        prev.map(s => s.id === swot.id ? { ...s, isRead: true } : s)
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const unreadCount = swotItems.filter(s => !s.isRead).length;
  const totalCount = swotItems.length;

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
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col items-center space-y-4 border border-gray-100 max-w-sm mx-4">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-indigo-600" />
            <div className="text-center">
              <p className="text-base md:text-lg font-semibold text-gray-800">
                Loading SWOT analyses...
              </p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {formatDate(displayDates.start)} – {formatDate(displayDates.end)}
              </p>
            </div>
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
                SWOT Analysis
              </h1>
              <p className="text-purple-100 text-base md:text-lg">
                Strategic insights and analysis
              </p>
              {activePair && (
                <p className="text-purple-200 text-sm mt-1">
                  Currently viewing: <strong>{activePair.base_company.company_name}</strong>
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 md:p-4">
                <Target size={28} className="md:size-32 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs md:text-sm text-purple-100">Total Analyses</div>
                <div className="text-xl md:text-2xl font-bold text-white">{totalCount}</div>
                <div className="text-xs text-purple-200">{unreadCount} unread</div>
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
        {/* SWOT List */}
        <div className="lg:col-span-2 space-y-4">
          {swotItems.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center h-64 md:h-96 text-center p-6">
                <Target size={48} className="md:size-64 text-gray-400 mb-6" />
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                  {hasValidDateRange
                    ? 'No SWOT analyses found for the selected period'
                    : 'Select a date range to load SWOT analyses'}
                </h3>
                <p className="text-sm md:text-base text-gray-500 max-w-md">
                  {hasValidDateRange
                    ? `No analyses found for ${activePair?.base_company.company_name || 'this company'} in the selected period.`
                    : 'Use the date picker above to fetch SWOT analyses.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            swotItems.map((swot) => (
              <Card
                key={swot.id}
                className={cn(
                  "border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4",
                  !swot.isRead
                    ? 'bg-white border-l-purple-500'
                    : 'bg-gray-50/80 border-l-gray-300',
                  selectedSwot?.id === swot.id && 'ring-2 ring-purple-400 shadow-purple-100'
                )}
                onClick={() => handleSwotClick(swot)}
              >
                <CardContent className="p-4 md:p-6">
                  {/* Top row: date + read icon */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      {swot.isRead ? (
                        <MailOpen size={16} className="text-gray-400 flex-shrink-0" />
                      ) : (
                        <Mail size={16} className="text-purple-600 flex-shrink-0" />
                      )}
                      <span className={cn(
                        "text-xs md:text-sm font-medium",
                        swot.isRead ? 'text-gray-500' : 'text-gray-900'
                      )}>
                        {format(new Date(swot.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={cn(
                    "text-base md:text-lg leading-tight mb-3",
                    swot.isRead ? 'text-gray-700' : 'font-semibold text-gray-900'
                  )}>
                    {swot.title}
                  </h3>

                  {/* Counts */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Strengths:</span> {swot.strengths.length}
                    </div>
                    <div>
                      <span className="font-medium">Weaknesses:</span> {swot.weaknesses.length}
                    </div>
                    <div>
                      <span className="font-medium">Opportunities:</span> {swot.opportunities.length}
                    </div>
                    <div>
                      <span className="font-medium">Threats:</span> {swot.threats.length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Detail View - full width on mobile, sticky on desktop */}
        <div className={cn(
          "lg:col-span-1",
          selectedSwot ? "block" : "hidden lg:block"
        )}>
          {selectedSwot ? (
            <Card className="border-0 shadow-lg sticky top-4 lg:top-20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2.5">
                  <Eye size={20} className="text-purple-600 flex-shrink-0" />
                  Analysis Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 md:space-y-6 text-sm">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-gray-900 text-base md:text-lg leading-tight">
                      {selectedSwot.title}
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600">
                    {format(new Date(selectedSwot.date), 'PPPP')}
                  </p>
                </div>

                {/* Strengths */}
                <div className="bg-green-50 rounded-lg p-4 md:p-5">
                  <h4 className="text-sm font-semibold text-green-800 mb-2.5 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-green-600 rounded-full flex-shrink-0"></span>
                    Strengths ({selectedSwot.strengths.length})
                  </h4>
                  <ul className="space-y-1.5 text-sm">
                    {selectedSwot.strengths.map((s, i) => (
                      <li key={i} className="text-green-900 leading-relaxed">• {s.analysis}</li>
                    ))}
                    {selectedSwot.strengths.length === 0 && (
                      <li className="text-gray-500 italic">No strengths recorded</li>
                    )}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-red-50 rounded-lg p-4 md:p-5">
                  <h4 className="text-sm font-semibold text-red-800 mb-2.5 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-600 rounded-full flex-shrink-0"></span>
                    Weaknesses ({selectedSwot.weaknesses.length})
                  </h4>
                  <ul className="space-y-1.5 text-sm">
                    {selectedSwot.weaknesses.map((w, i) => (
                      <li key={i} className="text-red-900 leading-relaxed">• {w.analysis}</li>
                    ))}
                    {selectedSwot.weaknesses.length === 0 && (
                      <li className="text-gray-500 italic">No weaknesses recorded</li>
                    )}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="bg-blue-50 rounded-lg p-4 md:p-5">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2.5 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                    Opportunities ({selectedSwot.opportunities.length})
                  </h4>
                  <ul className="space-y-1.5 text-sm">
                    {selectedSwot.opportunities.map((o, i) => (
                      <li key={i} className="text-blue-900 leading-relaxed">• {o.analysis}</li>
                    ))}
                    {selectedSwot.opportunities.length === 0 && (
                      <li className="text-gray-500 italic">No opportunities recorded</li>
                    )}
                  </ul>
                </div>

                {/* Threats */}
                <div className="bg-orange-50 rounded-lg p-4 md:p-5">
                  <h4 className="text-sm font-semibold text-orange-800 mb-2.5 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-orange-600 rounded-full flex-shrink-0"></span>
                    Threats ({selectedSwot.threats.length})
                  </h4>
                  <ul className="space-y-1.5 text-sm">
                    {selectedSwot.threats.map((t, i) => (
                      <li key={i} className="text-orange-900 leading-relaxed">• {t.analysis}</li>
                    ))}
                    {selectedSwot.threats.length === 0 && (
                      <li className="text-gray-500 italic">No threats recorded</li>
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
                    Select an analysis
                  </h3>
                  <p className="text-sm md:text-base text-gray-500">
                    Click on a SWOT analysis from the list to view full details.
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