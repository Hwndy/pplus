import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UniversalFilter, FilterOption, FilterValues } from '@/components/ui/UniversalFilter';
import { Inbox, Mail, MailOpen, Calendar, User, Building, TrendingUp, Eye, ExternalLink, CheckSquare, Archive, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

// Enhanced mock data for daily mentions with more comprehensive structure
const mockDailyMentions = [
  {
    id: '1',
    date: '2024-01-15',
    title: 'Stanbic IBTC Promotes Financial Inclusion With Digital Solutions',
    content: 'Stanbic IBTC Bank, a subsidiary of Stanbic IBTC Holdings Plc, has restated its commitment to enhancing financial inclusion through innovative digital solutions. The bank announced this at the launch of its new mobile banking application designed to simplify financial transactions for underbanked populations across Nigeria.',
    sentiment: 'Positive',
    reporter: 'Sarah Johnson',
    publication: 'BusinessDay',
    publicationPage: 'Page 12',
    publicationDate: '2024-01-15',
    source: 'Online',
    category: 'SUBSIDIARIES',
    isRead: false,
    links: [
      { url: 'https://businessday.ng/news/article/stanbic-ibtc-promotes-financial-inclusion', label: 'BusinessDay Article' }
    ],
    analystName: 'John Doe',
    submittedAt: '2024-01-15T09:30:00Z',
    priority: 'high'
  },
  {
    id: '2',
    date: '2024-01-15',
    title: 'Banking Sector Shows Resilience Amid Economic Challenges',
    content: 'The Nigerian banking sector continues to demonstrate remarkable resilience despite ongoing economic challenges, with major players like Stanbic IBTC leading the charge in digital transformation and customer service excellence. Industry experts note the sector\'s ability to adapt to changing market conditions.',
    sentiment: 'Positive',
    reporter: 'Michael Chen',
    publication: 'The Guardian',
    publicationPage: 'Page 8',
    publicationDate: '2024-01-15',
    source: 'Print',
    category: 'INDUSTRY',
    isRead: true,
    links: [
      { url: 'https://guardian.ng/business/banking-sector-resilience', label: 'Guardian Business' }
    ],
    analystName: 'Jane Smith',
    submittedAt: '2024-01-15T11:45:00Z',
    priority: 'medium'
  },
  {
    id: '3',
    date: '2024-01-14',
    title: 'Competitive Analysis: Market Share Dynamics in Nigerian Banking',
    content: 'Recent market analysis shows shifting dynamics in the financial services sector, with traditional banks facing increased competition from fintech startups. However, established players like Stanbic IBTC maintain strong positions through strategic partnerships and technological innovation.',
    sentiment: 'Neutral',
    reporter: 'David Wilson',
    publication: 'Financial Times Nigeria',
    publicationPage: 'Page 15',
    publicationDate: '2024-01-14',
    source: 'Online',
    category: 'COMPETITORS',
    isRead: false,
    links: [
      { url: 'https://ft.com/content/market-share-dynamics', label: 'FT Analysis' }
    ],
    analystName: 'Robert Brown',
    submittedAt: '2024-01-14T16:20:00Z',
    priority: 'high'
  },
  {
    id: '4',
    date: '2024-01-14',
    title: 'CBN Announces New Regulatory Framework for Digital Banking',
    content: 'New regulatory frameworks announced by the Central Bank of Nigeria are expected to significantly impact banking operations across the sector. The new guidelines focus on digital banking services, cybersecurity requirements, and customer data protection measures.',
    sentiment: 'Negative',
    reporter: 'Lisa Anderson',
    publication: 'Punch',
    publicationPage: 'Page 5',
    publicationDate: '2024-01-14',
    source: 'Print',
    category: 'INDUSTRY',
    isRead: false,
    links: [
      { url: 'https://punchng.com/regulatory-changes-banking', label: 'Punch News' }
    ],
    analystName: 'Emily Davis',
    submittedAt: '2024-01-14T14:10:00Z',
    priority: 'high'
  },
  {
    id: '5',
    date: '2024-01-13',
    title: 'Stanbic IBTC Asset Management Launches ESG Investment Fund',
    content: 'Stanbic IBTC Asset Management has announced the launch of a new investment fund targeting sustainable development goals and environmental, social, and governance (ESG) criteria. The fund aims to attract institutional and retail investors interested in responsible investing.',
    sentiment: 'Positive',
    reporter: 'Ahmed Hassan',
    publication: 'Vanguard',
    publicationPage: 'Page 20',
    publicationDate: '2024-01-13',
    source: 'Online',
    category: 'SUBSIDIARIES',
    isRead: true,
    links: [
      { url: 'https://vanguardngr.com/stanbic-ibtc-new-fund', label: 'Vanguard Report' }
    ],
    analystName: 'John Doe',
    submittedAt: '2024-01-13T10:15:00Z',
    priority: 'medium'
  },
  {
    id: '6',
    date: '2024-01-12',
    title: 'Stanbic IBTC CEO Speaks on Future of Banking in Africa',
    content: 'In an exclusive interview, the CEO of Stanbic IBTC Holdings discussed the future of banking in Africa, emphasizing the importance of digital transformation, financial inclusion, and sustainable banking practices. The conversation highlighted the bank\'s strategic vision for the next decade.',
    sentiment: 'Positive',
    reporter: 'Fatima Abdullahi',
    publication: 'ThisDay',
    publicationPage: 'Page 3',
    publicationDate: '2024-01-12',
    source: 'Print',
    category: 'SUBSIDIARIES',
    isRead: false,
    links: [
      { url: 'https://thisdaylive.com/stanbic-ibtc-ceo-interview', label: 'ThisDay Interview' }
    ],
    analystName: 'Jane Smith',
    submittedAt: '2024-01-12T15:30:00Z',
    priority: 'high'
  },
  {
    id: '7',
    date: '2024-01-11',
    title: 'Fintech Partnerships Reshape Traditional Banking Landscape',
    content: 'The collaboration between traditional banks and fintech companies is reshaping the Nigerian financial landscape. Industry leaders, including Stanbic IBTC, are forming strategic partnerships to enhance service delivery and reach underserved markets.',
    sentiment: 'Positive',
    reporter: 'Chinedu Okafor',
    publication: 'Daily Trust',
    publicationPage: 'Page 18',
    publicationDate: '2024-01-11',
    source: 'Online',
    category: 'INDUSTRY',
    isRead: true,
    links: [
      { url: 'https://dailytrust.com/fintech-banking-partnerships', label: 'Daily Trust' }
    ],
    analystName: 'Robert Brown',
    submittedAt: '2024-01-11T13:45:00Z',
    priority: 'medium'
  },
  {
    id: '8',
    date: '2024-01-10',
    title: 'Stanbic IBTC Pension Managers Reports Strong Q4 Performance',
    content: 'Stanbic IBTC Pension Managers has reported strong performance in the fourth quarter, with significant growth in assets under management and improved customer satisfaction scores. The company attributes this success to strategic investments in technology and customer service.',
    sentiment: 'Positive',
    reporter: 'Blessing Okoye',
    publication: 'Leadership',
    publicationPage: 'Page 22',
    publicationDate: '2024-01-10',
    source: 'Print',
    category: 'SUBSIDIARIES',
    isRead: false,
    links: [
      { url: 'https://leadership.ng/stanbic-pension-q4-performance', label: 'Leadership News' }
    ],
    analystName: 'Emily Davis',
    submittedAt: '2024-01-10T11:20:00Z',
    priority: 'medium'
  }
];

export function DailyMentionsInboxPage() {
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [selectedMention, setSelectedMention] = useState<any>(null);

  // Filter options for daily mentions
  const filterOptions: FilterOption[] = [
    {
      key: 'search',
      label: 'Search',
      type: 'search',
      placeholder: 'Search mentions, titles, content...'
    },
    {
      key: 'date',
      label: 'Date',
      type: 'daterange',
      placeholder: 'Select date range'
    },
    {
      key: 'sentiment',
      label: 'Sentiment',
      type: 'multiselect',
      options: [
        { value: 'Positive', label: 'Positive' },
        { value: 'Neutral', label: 'Neutral' },
        { value: 'Negative', label: 'Negative' }
      ]
    },
    {
      key: 'category',
      label: 'Category',
      type: 'multiselect',
      options: [
        { value: 'SUBSIDIARIES', label: 'Subsidiaries' },
        { value: 'INDUSTRY', label: 'Industry' },
        { value: 'COMPETITORS', label: 'Competitors' },
        { value: 'PHOTO', label: 'Photo' },
        { value: 'ADVERT', label: 'Advertisement' }
      ]
    },
    {
      key: 'source',
      label: 'Source',
      type: 'select',
      options: [
        { value: 'Online', label: 'Online' },
        { value: 'Print', label: 'Print' }
      ]
    },
    {
      key: 'publication',
      label: 'Publication',
      type: 'multiselect',
      options: [
        { value: 'BusinessDay', label: 'BusinessDay' },
        { value: 'The Guardian', label: 'The Guardian' },
        { value: 'Financial Times Nigeria', label: 'Financial Times Nigeria' },
        { value: 'Punch', label: 'Punch' },
        { value: 'Vanguard', label: 'Vanguard' },
        { value: 'ThisDay', label: 'ThisDay' },
        { value: 'Daily Trust', label: 'Daily Trust' },
        { value: 'Leadership', label: 'Leadership' }
      ]
    },
    {
      key: 'analyst',
      label: 'Analyst',
      type: 'select',
      options: [
        { value: 'John Doe', label: 'John Doe' },
        { value: 'Jane Smith', label: 'Jane Smith' },
        { value: 'Robert Brown', label: 'Robert Brown' },
        { value: 'Emily Davis', label: 'Emily Davis' }
      ]
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'multiselect',
      options: [
        { value: 'high', label: 'High Priority' },
        { value: 'medium', label: 'Medium Priority' },
        { value: 'low', label: 'Low Priority' }
      ]
    },
    {
      key: 'isRead',
      label: 'Read Status',
      type: 'select',
      options: [
        { value: 'unread', label: 'Unread Only' },
        { value: 'read', label: 'Read Only' }
      ]
    }
  ];

  // Filter the mentions based on filter values
  const filteredMentions = useMemo(() => {
    return mockDailyMentions.filter(mention => {
      // Search filter
      if (filterValues.search) {
        const searchTerm = filterValues.search.toLowerCase();
        const searchableText = `${mention.title} ${mention.content} ${mention.reporter} ${mention.publication}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }

      // Date range filter
      if (filterValues.date && filterValues.date[0] && filterValues.date[1]) {
        const mentionDate = new Date(mention.date);
        const startDate = new Date(filterValues.date[0]);
        const endDate = new Date(filterValues.date[1]);
        if (mentionDate < startDate || mentionDate > endDate) return false;
      }

      // Sentiment filter
      if (filterValues.sentiment && filterValues.sentiment.length > 0) {
        if (!filterValues.sentiment.includes(mention.sentiment)) return false;
      }

      // Category filter
      if (filterValues.category && filterValues.category.length > 0) {
        if (!filterValues.category.includes(mention.category)) return false;
      }

      // Source filter
      if (filterValues.source && mention.source !== filterValues.source) return false;

      // Publication filter
      if (filterValues.publication && filterValues.publication.length > 0) {
        if (!filterValues.publication.includes(mention.publication)) return false;
      }

      // Analyst filter
      if (filterValues.analyst && mention.analystName !== filterValues.analyst) return false;

      // Priority filter
      if (filterValues.priority && filterValues.priority.length > 0) {
        if (!filterValues.priority.includes(mention.priority)) return false;
      }

      // Read status filter
      if (filterValues.isRead) {
        if (filterValues.isRead === 'read' && !mention.isRead) return false;
        if (filterValues.isRead === 'unread' && mention.isRead) return false;
      }

      return true;
    });
  }, [filterValues]);

  const resetFilters = () => {
    setFilterValues({});
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return 'bg-green-100 text-green-800';
      case 'Negative': return 'bg-red-100 text-red-800';
      case 'Neutral': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SUBSIDIARIES': return 'bg-blue-100 text-blue-800';
      case 'INDUSTRY': return 'bg-purple-100 text-purple-800';
      case 'COMPETITORS': return 'bg-orange-100 text-orange-800';
      case 'PHOTO': return 'bg-pink-100 text-pink-800';
      case 'ADVERT': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const unreadCount = filteredMentions.filter(m => !m.isRead).length;
  const totalCount = filteredMentions.length;
  const highPriorityCount = filteredMentions.filter(m => m.priority === 'high').length;
  const todayCount = filteredMentions.filter(m => {
    const today = new Date().toISOString().split('T')[0];
    return m.date === today;
  }).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Beautiful Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Daily Mentions Inbox</h1>
            <p className="text-blue-100 text-lg">Review and manage daily media mentions from analysts</p>
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
                <div className="text-sm text-blue-200">{highPriorityCount} high priority</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <UniversalFilter
        filters={filterOptions}
        values={filterValues}
        onChange={setFilterValues}
        onReset={resetFilters}
      />

      {/* Quick Actions Bar */}
      <Card className="border-0 shadow-md bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-medium text-gray-700">Quick Actions:</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs hover:bg-indigo-50 hover:border-indigo-300"
                  onClick={() => console.log('Mark all as read')}
                >
                  <CheckSquare size={14} className="mr-1" />
                  Mark All Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs hover:bg-gray-50"
                  onClick={() => console.log('Archive all read')}
                >
                  <Archive size={14} className="mr-1" />
                  Archive Read
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredMentions.length} of {mockDailyMentions.length} mentions
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentions List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mentions List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredMentions.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Inbox size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No mentions found</h3>
                  <p className="text-gray-500">Try adjusting your filters to see more results.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredMentions.map((mention) => (
              <Card
                key={mention.id}
                className={`border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border-l-4 ${
                  !mention.isRead ? 'bg-blue-50/50 border-l-indigo-500' : 'bg-white border-l-gray-300'
                } ${selectedMention?.id === mention.id ? 'ring-2 ring-indigo-500' : ''}`}
                onClick={() => setSelectedMention(mention)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {mention.isRead ? (
                        <MailOpen size={16} className="text-gray-400" />
                      ) : (
                        <Mail size={16} className="text-indigo-600" />
                      )}
                      <span className="text-sm text-gray-500 font-medium">
                        {format(new Date(mention.date), 'MMM dd, yyyy')}
                      </span>
                      <Badge className={getPriorityColor(mention.priority)} variant="outline">
                        {mention.priority?.toUpperCase()}
                      </Badge>
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

                  <h3 className={`text-lg font-semibold mb-2 leading-tight ${!mention.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                    {mention.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {mention.content}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      <span className="font-medium">Reporter:</span> {mention.reporter}
                    </div>
                    <div className="flex items-center gap-1">
                      <Building size={12} />
                      <span className="font-medium">Publication:</span> {mention.publication}
                    </div>
                    {mention.publicationPage && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Page:</span> {mention.publicationPage}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Source:</span> {mention.source}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      <span className="font-medium">Analyst:</span> {mention.analystName}
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

        {/* Mention Details */}
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
                {/* Title and Badges */}
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight pr-4">{selectedMention.title}</h3>
                    <div className="flex flex-col gap-2">
                      <Badge className={getSentimentColor(selectedMention.sentiment)}>
                        {selectedMention.sentiment}
                      </Badge>
                      <Badge className={getPriorityColor(selectedMention.priority)} variant="outline">
                        {selectedMention.priority?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={getCategoryColor(selectedMention.category)} variant="outline">
                    {selectedMention.category}
                  </Badge>
                </div>

                {/* Content */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Article Content</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{selectedMention.content}</p>
                </div>

                {/* Publication Details */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">Publication Details</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Publication:</span>
                      <span className="font-medium text-right">{selectedMention.publication}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reporter:</span>
                      <span className="font-medium text-right">{selectedMention.reporter}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="font-medium text-right">{format(new Date(selectedMention.publicationDate), 'PPP')}</span>
                    </div>
                    {selectedMention.publicationPage && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Page:</span>
                        <span className="font-medium text-right">{selectedMention.publicationPage}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Source:</span>
                      <span className="font-medium text-right">{selectedMention.source}</span>
                    </div>
                  </div>
                </div>

                {/* Analyst Information */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">Analyst Information</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Submitted by:</span>
                      <span className="font-medium text-right">{selectedMention.analystName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Submitted at:</span>
                      <span className="font-medium text-right">{format(new Date(selectedMention.submittedAt), 'PPp')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`font-medium text-right ${selectedMention.isRead ? 'text-gray-600' : 'text-indigo-600'}`}>
                        {selectedMention.isRead ? 'Read' : 'Unread'}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedMention.links && selectedMention.links.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1 mb-3">External Links</h4>
                    <div className="space-y-2">
                      {selectedMention.links.map((link: any, index: number) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs hover:bg-indigo-50 hover:border-indigo-300"
                          onClick={() => window.open(link.url, '_blank')}
                        >
                          <ExternalLink size={12} className="mr-2" />
                          {link.label || 'View Article'}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                  <Button
                    size="sm"
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => {
                      // Mark as read logic here
                      console.log('Mark as read:', selectedMention.id);
                    }}
                    disabled={selectedMention.isRead}
                  >
                    {selectedMention.isRead ? 'Already Read' : 'Mark as Read'}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-gray-50"
                      onClick={() => {
                        // Archive logic here
                        console.log('Archive:', selectedMention.id);
                      }}
                    >
                      Archive
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                      onClick={() => {
                        // Delete logic here
                        console.log('Delete:', selectedMention.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Eye size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Select a mention</h3>
                  <p className="text-gray-500">Click on a mention to view its details.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
