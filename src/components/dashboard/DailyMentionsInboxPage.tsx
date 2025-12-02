import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UniversalFilter, FilterValues } from '@/components/ui/UniversalFilter';
import { Inbox, Mail, MailOpen, User, Building, Eye, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

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
  submittedAt: string;
  analystName: string;
}

const STORAGE_KEY = 'daily-mentions-read-status';

export function DailyMentionsInboxPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    date: ['', ''],
  });

  const [selectedMention, setSelectedMention] = useState<MentionItem | null>(null);
  const [mentions, setMentions] = useState<MentionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readStatus, setReadStatus] = useState<Record<string, boolean>>({});

  const hasValidDateRange = filterValues.date?.[0] && filterValues.date?.[1];
  const startDate = filterValues.date?.[0] || '';
  const endDate = filterValues.date?.[1] || '';

  // Load read status from localStorage on mount
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

  // Save to localStorage whenever readStatus changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readStatus));
    } catch (e) {
      console.warn('Failed to save read status');
    }
  }, [readStatus]);

  const fetchDailyMentions = useCallback(async () => {
    if (!hasValidDateRange) {
      setMentions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://pplus-07cr.onrender.com/api/report/daily-mentions?pair_id=5&startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.data.success || !response.data.data?.daily_mentions) {
        throw new Error(response.data.message || 'Failed to fetch mentions');
      }

      const rawMentions = response.data.data.daily_mentions;
      const flattened: MentionItem[] = [];

      rawMentions.forEach((daily: any) => {
        const baseDate = daily.date.split('T')[0];
        const companyName = daily.company.company_name;
        const analystName = daily.created_by?.username || 'Unknown Analyst';
        const submittedAt = daily.created_at;

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
              submittedAt,
              analystName,
            });
          });
        });
      });

      setMentions(flattened);
    } catch (err: any) {
      setError(err.message || 'Failed to load daily mentions');
      setMentions([]);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [hasValidDateRange, startDate, endDate, readStatus]);

  useEffect(() => {
    fetchDailyMentions();
  }, [fetchDailyMentions]);

  const filteredMentions = useMemo(() => {
    if (!hasValidDateRange || mentions.length === 0) return mentions;

    const start = new Date(filterValues.date![0]);
    const end = new Date(filterValues.date![1]);
    end.setHours(23, 59, 59, 999);

    return mentions.filter((m) => {
      const mentionDate = new Date(m.publicationDate);
      return mentionDate >= start && mentionDate <= end;
    });
  }, [mentions, filterValues.date, hasValidDateRange]);

  // Mark mention as read when clicked
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
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'INDUSTRY': return 'bg-purple-100 text-purple-800';
      case 'COMPETITORS': return 'bg-orange-100 text-orange-800';
      case 'SUBSIDIARIES': return 'bg-blue-100 text-blue-800';
      case 'PASSIVE': return 'bg-gray-100 text-gray-800';
      case 'ADVERT': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = filteredMentions.filter(m => !m.isRead).length;
  const totalCount = filteredMentions.length;
  const todayCount = filteredMentions.filter(m => {
    const today = new Date().toISOString().split('T')[0];
    return m.publicationDate === today;
  }).length;

  const filterOptions = [
    { key: 'date', label: 'Date Range', type: 'daterange', placeholder: 'Select date range' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Loading daily mentions...</div>
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Daily Mentions Inbox</h1>
            <p className="text-blue-100 text-lg">Review and manage daily media mentions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Inbox size={32} className="text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-right">
              <div>
                <div className="text-sm text-blue-100">Total Mentions</div>
                <div className="text-2xl font-bold text-white">{totalCount}</div>
                <div className="text-sm text-blue-200">{unreadCount} unread</div>
              </div>
              <div>
                <div className="text-sm text-blue-100">Today's Mentions</div>
                <div className="text-2xl font-bold text-white">{todayCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UniversalFilter
        filters={filterOptions}
        values={filterValues}
        onChange={setFilterValues}
        onReset={resetFilters}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredMentions.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center h-96 text-center">
                <Inbox size={64} className="text-gray-400 mb-6" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {hasValidDateRange
                    ? 'No mentions found for the selected period'
                    : 'Select a date range to load mentions'}
                </h3>
                <p className="text-gray-500 max-w-md">
                  {hasValidDateRange
                    ? 'Try choosing a different date range.'
                    : 'Use the date picker above to fetch daily media mentions.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredMentions.map((mention) => (
              <Card
                key={mention.id}
                className={`border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border-l-4 ${
                  !mention.isRead
                    ? 'bg-white border-l-indigo-500 font-medium'
                    : 'bg-gray-50/70 border-l-gray-300 text-gray-600'
                } ${selectedMention?.id === mention.id ? 'ring-2 ring-indigo-500' : ''}`}
                onClick={() => handleMentionClick(mention)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {mention.isRead ? (
                        <MailOpen size={16} className="text-gray-400" />
                      ) : (
                        <Mail size={16} className="text-indigo-600" />
                      )}
                      <span className={`text-sm font-medium ${mention.isRead ? 'text-gray-500' : 'text-gray-900'}`}>
                        {format(new Date(mention.publicationDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSentimentColor(mention.sentiment)}>
                        {mention.sentiment}
                      </Badge>
                      <Badge className={getCategoryColor(mention.category)}>
                        {mention.category}
                      </Badge>
                    </div>
                  </div>

                  <h3 className={`text-lg leading-tight mb-2 ${mention.isRead ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>
                    {mention.title}
                  </h3>

                  <p className={`text-sm mb-4 line-clamp-3 leading-relaxed ${mention.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                    {mention.content}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                    {mention.reporter && (
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        <span className="font-medium">Reporter:</span>{' '}
                        <span className={mention.isRead ? 'text-gray-500' : 'text-gray-700'}>{mention.reporter}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Building size={12} />
                      <span className="font-medium">Source:</span>{' '}
                      <span className={mention.isRead ? 'text-gray-500' : 'text-gray-700'}>{mention.source}</span>
                    </div>
                    {mention.page && (
                      <div>
                        <span className="font-medium">Page:</span> {mention.page}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Company:</span>{' '}
                      <span className={mention.isRead ? 'text-gray-500' : 'text-gray-700'}>{mention.company}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className={`text-xs ${mention.isRead ? 'text-gray-400' : 'text-gray-600 font-medium'}`}>
                      {mention.analystName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(mention.submittedAt), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selectedMention ? (
            <Card className="border-0 shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Eye size={20} className="text-indigo-600" />
                  Mention Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Same detailed view as before */}
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight pr-4">
                      {selectedMention.title}
                    </h3>
                    <Badge className={getSentimentColor(selectedMention.sentiment)}>
                      {selectedMention.sentiment}
                    </Badge>
                  </div>
                  <Badge className={getCategoryColor(selectedMention.category)}>
                    {selectedMention.category}
                  </Badge>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Content</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{selectedMention.content}</p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">Details</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Company:</span><span className="font-medium text-right">{selectedMention.company}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Source:</span><span className="font-medium text-right">{selectedMention.source}</span></div>
                    {selectedMention.reporter && <div className="flex justify-between"><span className="text-gray-500">Reporter:</span><span className="font-medium text-right">{selectedMention.reporter}</span></div>}
                    <div className="flex justify-between"><span className="text-gray-500">Date:</span><span className="font-medium text-right">{format(new Date(selectedMention.publicationDate), 'PPP')}</span></div>
                    {selectedMention.page && <div className="flex justify-between"><span className="text-gray-500">Page:</span><span className="font-medium text-right">{selectedMention.page}</span></div>}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">Analyst</h4>
                  <div className="text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Submitted by:</span><span className="font-medium text-right">{selectedMention.analystName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Submitted at:</span><span className="font-medium text-right">{format(new Date(selectedMention.submittedAt), 'PPp')}</span></div>
                  </div>
                </div>

                {selectedMention.urls.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1 mb-3">Links</h4>
                    <div className="space-y-2">
                      {selectedMention.urls.map((url, i) => (
                        <Button key={i} variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => window.open(url, '_blank')}>
                          <ExternalLink size={12} className="mr-2" />
                          View Article {i + 1}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="flex items-center justify-center h-64"> 
                <div className="text-center">
                  <Eye size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Select a mention</h3>
                  <p className="text-gray-500">Click on a mention to view details.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}