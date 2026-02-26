import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { Inbox, Mail, MailOpen, User, Building, Eye, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MentionItem {
  id: string;
  title: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  reporter: string | null;
  source: string;
  page: string | null;
  publicationDate: string;
  urls: string[];
  category: string;
  company: string;
  isRead: boolean;
}

const STORAGE_KEY = 'daily-mentions-read-status';

export function DailyMentionsInboxPage() {
  const { token, activePair } = useAuth();
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const [selectedMention, setSelectedMention] = useState<MentionItem | null>(null);
  const [mentions, setMentions] = useState<MentionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readStatus, setReadStatus] = useState<Record<string, boolean>>({});

  const hasValidDateRange = filterValues.dateRange && 
    Array.isArray(filterValues.dateRange) && 
    filterValues.dateRange[0] && 
    filterValues.dateRange[1];

  const startDate = (hasValidDateRange ? filterValues.dateRange[0] : '') as string;
  const endDate = (hasValidDateRange ? filterValues.dateRange[1] : '') as string;

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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readStatus));
    } catch (e) {
      console.warn('Failed to save read status');
    }
  }, [readStatus]);

  const fetchDailyMentions = useCallback(async () => {
    if (!token || !activePair || !hasValidDateRange) {
      setMentions([]);
      setLoading(false);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      toast.error('Start date must be before or equal to end date');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://pplus-7q0p.onrender.com/api/v1/report/daily-mentions`,
        {
          params: {
            pair_id: activePair.pair_id,
            startDate,
            endDate,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success || !response.data.data?.daily_mentions) {
        setMentions([]);
        setLoading(false);
        return;
      }

      const rawMentions = response.data.data.daily_mentions;
      const flattened: MentionItem[] = [];

      rawMentions.forEach((daily: any) => {
        const baseDate = daily.date.split('T')[0];
        const companyName = daily.company.company_name;

        Object.entries(daily.categories).forEach(([category, items]: [string, any[]]) => {
          if (!Array.isArray(items) || items.length === 0) return;

          items.forEach((item: any) => {
            const id = `${daily.id}-${category}-${item.headline || flattened.length}`;
            flattened.push({
              id,
              title: item.headline || 'Untitled Mention',
              content: item.content || 'No content available',
              sentiment: (item.sentiment?.toLowerCase() || 'neutral') as 'positive' | 'negative' | 'neutral',
              reporter: item.reporter || null,
              source: item.source || daily.publication,
              page: item.page || null,
              publicationDate: item.publication_date || baseDate,
              urls: item.urls || [],
              category: category.toUpperCase(),
              company: companyName,
              isRead: readStatus[id] || false,
            });
          });
        });
      });

      setMentions(flattened);
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.data?.message?.includes('No daily mentions')) {
        setMentions([]);
        setError(null);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load daily mentions');
        setMentions([]);
      }
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, activePair, hasValidDateRange, startDate, endDate, readStatus]);

  useEffect(() => {
    fetchDailyMentions();
  }, [fetchDailyMentions]);

  const displayedMentions = mentions;

  const handleMentionClick = (mention: MentionItem) => {
    setSelectedMention(mention);

    if (!mention.isRead) {
      setReadStatus(prev => ({ ...prev, [mention.id]: true }));
      setMentions(prev =>
        prev.map(m => m.id === mention.id ? { ...m, isRead: true } : m)
      );
    }
  };

  const resetFilters = () => {
    setFilterValues({ date: ['', ''] });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'INDUSTRY': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPETITORS': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'SUBSIDIARIES': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PASSIVE': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'ADVERT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const unreadCount = displayedMentions.filter(m => !m.isRead).length;
  const totalCount = displayedMentions.length;
  const todayCount = displayedMentions.filter(m => {
    const today = new Date().toISOString().split('T')[0];
    return m.publicationDate === today;
  }).length;

  const filterOptions = [
    {
      key: 'dateRange',
      label: 'Select Date Range',
      type: 'daterange',
      placeholder: 'Pick date range',
      closeOnSelect: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">
          Loading daily mentions for {activePair?.base_company.company_name || 'your company'}...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchDailyMentions}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-6 animate-fade-in">
      {/* Header - Responsive */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-xl md:rounded-2xl p-5 md:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2 tracking-tight">
                Daily Mentions Inbox
              </h1>
              <p className="text-blue-100 text-base md:text-lg">
                Review and manage daily media mentions
              </p>
              {activePair && (
                <p className="text-blue-200 text-sm mt-1">
                  Currently viewing: <strong>{activePair.base_company.company_name}</strong>
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 md:p-4">
                <Inbox size={28} className="md:size-32 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-6 text-right">
                <div>
                  <div className="text-xs md:text-sm text-blue-100">Total Mentions</div>
                  <div className="text-xl md:text-2xl font-bold text-white">{totalCount}</div>
                  <div className="text-xs text-blue-200">{unreadCount} unread</div>
                </div>
                <div>
                  <div className="text-xs md:text-sm text-blue-100">Today's Mentions</div>
                  <div className="text-xl md:text-2xl font-bold text-white">{todayCount}</div>
                </div>
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
        onReset={resetFilters}
      />

      {/* Main content - stack on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Mention List */}
        <div className="lg:col-span-2 space-y-4">
          {displayedMentions.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center h-64 md:h-96 text-center p-6">
                <Inbox size={48} className="md:size-64 text-gray-400 mb-6" />
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                  {hasValidDateRange
                    ? 'No daily mentions found for the selected period'
                    : 'Select a date range to load mentions'}
                </h3>
                <p className="text-sm md:text-base text-gray-500 max-w-md">
                  {hasValidDateRange
                    ? `No mentions were submitted for ${activePair?.base_company.company_name || 'this company'} between ${format(new Date(startDate), 'MMM dd, yyyy')} and ${format(new Date(endDate), 'MMM dd, yyyy')}.`
                    : 'Use the date picker above to fetch daily media mentions.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            displayedMentions.map((mention) => (
              <Card
                key={mention.id}
                className={cn(
                  "border-0 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4",
                  !mention.isRead
                    ? 'bg-white border-l-indigo-500'
                    : 'bg-gray-50/80 border-l-gray-300',
                  selectedMention?.id === mention.id && 'ring-2 ring-indigo-400 shadow-indigo-100'
                )}
                onClick={() => handleMentionClick(mention)}
              >
                <CardContent className="p-4 md:p-6">
                  {/* Top row: date + badges */}
                  <div className="flex flex-wrap items-start justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2.5">
                      {mention.isRead ? (
                        <MailOpen size={16} className="text-gray-400 flex-shrink-0" />
                      ) : (
                        <Mail size={16} className="text-indigo-600 flex-shrink-0" />
                      )}
                      <span className={cn(
                        "text-xs md:text-sm font-medium",
                        mention.isRead ? 'text-gray-500' : 'text-gray-900'
                      )}>
                        {format(new Date(mention.publicationDate), 'MMM dd, yyyy')}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 justify-end">
                      <Badge className={cn("text-xs", getSentimentColor(mention.sentiment))}>
                        {mention.sentiment}
                      </Badge>
                      <Badge className={cn("text-xs", getCategoryColor(mention.category))}>
                        {mention.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className={cn(
                    "text-base md:text-lg leading-tight mb-2",
                    mention.isRead ? 'text-gray-700' : 'font-semibold text-gray-900'
                  )}>
                    {mention.title}
                  </h3>

                  {/* Content preview */}
                  <p className={cn(
                    "text-sm mb-4 line-clamp-3 md:line-clamp-4 leading-relaxed",
                    mention.isRead ? 'text-gray-500' : 'text-gray-700'
                  )}>
                    {mention.content}
                  </p>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    {mention.reporter && (
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-gray-500" />
                        <span className="font-medium text-gray-600">Reporter:</span>
                        <span className={mention.isRead ? 'text-gray-500' : 'text-gray-700'}>
                          {mention.reporter}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Building size={12} className="text-gray-500" />
                      <span className="font-medium text-gray-600">Source:</span>
                      <span className={mention.isRead ? 'text-gray-500' : 'text-gray-700'}>
                        {mention.source}
                      </span>
                    </div>
                    {mention.page && (
                      <div className="text-gray-600">
                        <span className="font-medium">Page:</span> {mention.page}
                      </div>
                    )}
                    <div className="text-gray-600">
                      <span className="font-medium">Company:</span>{' '}
                      <span className={mention.isRead ? 'text-gray-500' : 'text-gray-700'}>
                        {mention.company}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Detail View - full width on mobile, sticky sidebar on desktop */}
        <div className={cn(
          "lg:col-span-1",
          selectedMention ? "block" : "hidden lg:block"
        )}>
          {selectedMention ? (
            <Card className="border-0 shadow-lg sticky top-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2.5">
                  <Eye size={20} className="text-indigo-600 flex-shrink-0" />
                  Mention Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 md:space-y-6 text-sm">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-gray-900 text-base md:text-lg leading-tight">
                      {selectedMention.title}
                    </h3>
                    <Badge className={cn("self-start sm:self-auto text-xs", getSentimentColor(selectedMention.sentiment))}>
                      {selectedMention.sentiment}
                    </Badge>
                  </div>
                  <Badge className={cn("text-xs", getCategoryColor(selectedMention.category))}>
                    {selectedMention.category}
                  </Badge>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 md:p-5">
                  <h4 className="text-sm font-medium text-gray-700 mb-2.5">Content</h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedMention.content}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1.5">
                    Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Company:</span>
                      <span className="font-medium text-right">{selectedMention.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Source:</span>
                      <span className="font-medium text-right">{selectedMention.source}</span>
                    </div>
                    {selectedMention.reporter && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reporter:</span>
                        <span className="font-medium text-right">{selectedMention.reporter}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="font-medium text-right">
                        {format(new Date(selectedMention.publicationDate), 'PPP')}
                      </span>
                    </div>
                    {selectedMention.page && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Page:</span>
                        <span className="font-medium text-right">{selectedMention.page}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedMention.urls.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1.5 mb-3">
                      Links
                    </h4>
                    <div className="space-y-2.5">
                      {selectedMention.urls.map((url, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs py-4 h-auto"
                          onClick={() => window.open(url, '_blank')}
                        >
                          <ExternalLink size={14} className="mr-2 flex-shrink-0" />
                          <span className="truncate">View Article {i + 1}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg hidden lg:block">
              <CardContent className="flex items-center justify-center h-64 md:h-96 text-center p-6">
                <div>
                  <Eye size={48} className="mx-auto text-gray-400 mb-6" />
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
                    Select a mention
                  </h3>
                  <p className="text-sm md:text-base text-gray-500">
                    Click on a mention from the list to view full details.
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