import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { Mail, MailOpen, Clock, Eye, Target, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';

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

  const hasValidDateRange = filterValues.dateRange && Array.isArray(filterValues.dateRange) && filterValues.dateRange[0] && filterValues.dateRange[1];
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

  const fetchSwotAnalyses = useCallback(async () => {
    if (!token || !activePair) {
      setSwotItems([]);
      setLoading(false);
      return;
    }

    // Only fetch if both dates are selected
    if (filterValues.dateRange) {
      const [start, end] = filterValues.dateRange as [string | null, string | null];
      if (!start || !end) {
        console.log('Waiting for both dates to be selected...');
        setLoading(false);
        return;
      }
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('pair_id', String(activePair.pair_id));

      if (hasValidDateRange) {
        // Convert to month format for API
        const startDateObj = new Date(startDate);
        const month = `${startDateObj.getFullYear()}-${String(startDateObj.getMonth() + 1).padStart(2, '0')}`;
        params.append('month', month);
      }

      const url = `https://pplus-ipn6.onrender.com/api/report/swot-analysis?${params.toString()}`;
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
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = swotItems.filter(s => !s.isRead).length;
  const totalCount = swotItems.length;

  const filterOptions = [
    { key: 'dateRange', label: 'Select Month', type: 'daterange', placeholder: 'Pick a month' },
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
    <div className="space-y-8 animate-fade-in relative">
      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-4 border border-gray-100">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">
                Loading SWOT analyses for {activePair?.company_name || 'your company'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(displayDates.start)} – {formatDate(displayDates.end)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">SWOT Analysis</h1>
            <p className="text-purple-100 text-lg">Strategic insights and analysis</p>
            {activePair && (
              <p className="text-purple-200 text-sm mt-1">Currently viewing: <strong>{activePair.company_name}</strong></p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Target size={32} className="text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-100">Total Analyses</div>
              <div className="text-2xl font-bold text-white">{totalCount}</div>
              <div className="text-sm text-purple-200">{unreadCount} unread</div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {swotItems.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center h-96 text-center">
                <Target size={64} className="text-gray-400 mb-6" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {hasValidDateRange
                    ? 'No SWOT analyses found for the selected period'
                    : 'Select a date range to load SWOT analyses'}
                </h3>
                <p className="text-gray-500 max-w-md">
                  {hasValidDateRange
                    ? `No analyses found for ${activePair?.company_name || 'this company'} in the selected period.`
                    : 'Use the date picker above to fetch SWOT analyses.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            swotItems.map((swot) => (
              <Card
                key={swot.id}
                className={cn(
                  "border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border-l-4",
                  !swot.isRead
                    ? 'bg-white border-l-purple-500 font-medium'
                    : 'bg-gray-50/70 border-l-gray-300 text-gray-600',
                  selectedSwot?.id === swot.id ? 'ring-2 ring-purple-500' : ''
                )}
                onClick={() => handleSwotClick(swot)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {swot.isRead ? (
                        <MailOpen size={16} className="text-gray-400" />
                      ) : (
                        <Mail size={16} className="text-purple-600" />
                      )}
                      <span className={cn("text-sm font-medium", swot.isRead ? 'text-gray-500' : 'text-gray-900')}>
                        {format(new Date(swot.date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>

                  <h3 className={cn("text-lg leading-tight mb-2", swot.isRead ? 'text-gray-700' : 'font-semibold text-gray-900')}>
                    {swot.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
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

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selectedSwot ? (
            <Card className="border-0 shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Eye size={20} className="text-purple-600" />
                  Analysis Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight pr-4">
                      {selectedSwot.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">{format(new Date(selectedSwot.date), 'PPPP')}</p>
                </div>

                {/* Strengths */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Strengths ({selectedSwot.strengths.length})
                  </h4>
                  <ul className="space-y-1">
                    {selectedSwot.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-green-900 leading-relaxed">• {s.analysis}</li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                    Weaknesses ({selectedSwot.weaknesses.length})
                  </h4>
                  <ul className="space-y-1">
                    {selectedSwot.weaknesses.map((w, i) => (
                      <li key={i} className="text-sm text-red-900 leading-relaxed">• {w.analysis}</li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    Opportunities ({selectedSwot.opportunities.length})
                  </h4>
                  <ul className="space-y-1">
                    {selectedSwot.opportunities.map((o, i) => (
                      <li key={i} className="text-sm text-blue-900 leading-relaxed">• {o.analysis}</li>
                    ))}
                  </ul>
                </div>

                {/* Threats */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                    Threats ({selectedSwot.threats.length})
                  </h4>
                  <ul className="space-y-1">
                    {selectedSwot.threats.map((t, i) => (
                      <li key={i} className="text-sm text-orange-900 leading-relaxed">• {t.analysis}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Eye size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Select an analysis</h3>
                  <p className="text-gray-500">Click on a SWOT analysis to view details.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}