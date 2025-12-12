import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Mail, MailOpen, Clock } from 'lucide-react';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

interface InsightItem {
  id: string;
  title?: string;
  sender?: { name: string; email: string };
  date?: string;
  content: string;
  isRead: boolean;
  preview?: string;
}

const convertOutcomeInsightsToEmailFormat = (insights: any[]): InsightItem[] =>
  insights.map((item) => ({
    id: item.id.toString(),
    title:
      item.analyst_note ||
      `Outcome Insight - ${format(new Date(item.date), 'MMM d, yyyy')}`,
    sender: {
      name: item.created_by?.username || 'Unknown Analyst',
      email: item.created_by?.email || 'N/A',
    },
    date: item.date,
    content: `
      <h3>Status: ${item.status}</h3>
      <h3>Insights:</h3>
      <ul>${item.insights
        .map((i: any) => `<li><strong>${i.category}:</strong> ${i.insight}</li>`)
        .join('')}</ul>
      <p><strong>Total Insights:</strong> ${item.total_insights}</p>
      <p><strong>Analyst Note:</strong> ${item.analyst_note || 'N/A'}</p>
      <p><strong>Supervisor Note:</strong> ${item.supervisor_note || 'N/A'}</p>
      ${
        item.approved_by
          ? `<p><strong>Approved by:</strong> ${item.approved_by.username} (${item.approved_by.email})</p>`
          : '<p><strong>Approved by:</strong> Not yet approved</p>'
      }
      <p><strong>Created at:</strong> ${format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}</p>
      <p><strong>Updated at:</strong> ${format(new Date(item.updated_at), 'MMM d, yyyy HH:mm')}</p>
    `,
    isRead: localStorage.getItem(`insight-read-${item.id}`) === 'true',
    preview: item.analyst_note
      ? item.analyst_note.substring(0, 120) + '...'
      : 'Outcome insight details...',
  }));

const InsightListView: React.FC<{
  insights: InsightItem[];
  title: string;
  description: string;
}> = ({ insights, title, description }) => {
  const [selectedInsight, setSelectedInsight] = useState<InsightItem | null>(null);
  const [insightsState, setInsightsState] = useState<InsightItem[]>(insights);

  useEffect(() => {
    setInsightsState(insights);
    setSelectedInsight(null);
  }, [insights]);

  const handleInsightClick = (insight: InsightItem) => {
    if (!insight.isRead) {
      localStorage.setItem(`insight-read-${insight.id}`, 'true');
      const updatedInsights = insightsState.map((i) =>
        i.id === insight.id ? { ...i, isRead: true } : i
      );
      setInsightsState(updatedInsights);
    }
    setSelectedInsight(insight);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="flex flex-col md:flex-row h-[600px]">
        <div className="w-full md:w-2/5 border-r overflow-y-auto">
          {insightsState.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No outcome insights available
            </div>
          ) : (
            insightsState.map((insight) => (
              <div
                key={insight.id}
                onClick={() => handleInsightClick(insight)}
                className={cn(
                  'p-4 border-b cursor-pointer transition-colors hover:bg-blue-50',
                  selectedInsight?.id === insight.id ? 'bg-blue-50' : '',
                  insight.isRead ? 'bg-gray-50' : ''
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {insight.isRead ? (
                      <MailOpen size={18} className="text-gray-400" />
                    ) : (
                      <Mail size={18} className="text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className={cn(
                        'text-sm font-medium truncate mb-1',
                        insight.isRead ? 'text-gray-500' : 'text-gray-900'
                      )}
                    >
                      {insight.title}
                    </h4>
                    {insight.sender && (
                      <p className="text-xs text-gray-500 font-medium">
                        {insight.sender.name}
                      </p>
                    )}
                    {insight.preview && (
                      <p
                        className={cn(
                          'text-xs line-clamp-2 mt-1',
                          insight.isRead ? 'text-gray-400' : 'text-gray-600'
                        )}
                      >
                        {insight.preview}
                      </p>
                    )}
                    {insight.date && (
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <Clock size={12} className="mr-1" />
                        {format(new Date(insight.date), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="w-full md:w-3/5 p-6 overflow-y-auto bg-white">
          {selectedInsight ? (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedInsight.title}
                </h2>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                  {selectedInsight.sender && (
                    <div>
                      From:{' '}
                      <span className="font-medium">
                        {selectedInsight.sender.name}
                      </span>{' '}
                      &lt;{selectedInsight.sender.email}&gt;
                    </div>
                  )}
                  {selectedInsight.date && (
                    <div>
                      {format(new Date(selectedInsight.date), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 border-t pt-4">
                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedInsight.content,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Mail size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Select an item to view its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OutcomeInsightsPage: React.FC = () => {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [filterValues, setFilterValues] = useState<{
    dateRange?: { start: string; end: string };
  }>({});
  const [insightData, setInsightData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Get company directly from authenticated user
  const companyName = user?.company_name || user?.company || 'Your Company';

  const FilterComponent: React.FC<{
    onChange: (values: { dateRange?: { start: string; end: string } }) => void;
    onReset: () => void;
    values: { dateRange?: { start: string; end: string } };
  }> = ({ onChange, onReset, values }) => {
    const [startDate, setStartDate] = useState(values.dateRange?.start || '');
    const [endDate, setEndDate] = useState(values.dateRange?.end || '');

    const handleApply = () => {
      if (startDate && endDate) {
        onChange({ dateRange: { start: startDate, end: endDate } });
      } else {
        toast.error('Please select both start and end dates');
      }
    };

    const handleReset = () => {
      setStartDate('');
      setEndDate('');
      onReset();
    };

    return (
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Date Range</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={handleApply}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Apply
          </button>
          <button
            onClick={handleReset}
            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
          >
            Reset
          </button>
        </div>
      </div>
    );
  };

  const getMonthFromDateRange = (dateRange: any): string | null => {
    if (!dateRange?.start) return null;
    const start = new Date(dateRange.start);
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated || !token || !companyName) return;

    const fetchInsights = async () => {
      setDataLoading(true);
      try {
        const month = getMonthFromDateRange(filterValues.dateRange);
        let url = `https://backend-55pc.onrender.com/api/report/outcome-insights?company=${encodeURIComponent(companyName)}`;
        if (month) url += `&month=${month}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();

        if (result.success && result.data?.insights) {
          setInsightData(result.data.insights);
        } else {
          setInsightData([]);
          if (result.message) toast.info(result.message);
        }
      } catch (err) {
        console.error('Error fetching outcome insights:', err);
        toast.error('Failed to load outcome insights');
        setInsightData([]);
      } finally {
        setDataLoading(false);
      }
    };

    fetchInsights();
  }, [authLoading, isAuthenticated, token, companyName, filterValues.dateRange]);

  const insights = useMemo(
    () => convertOutcomeInsightsToEmailFormat(insightData),
    [insightData]
  );

  if (authLoading || dataLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
        Outcome Insights
      </h2>

      <FilterComponent
        values={filterValues}
        onChange={setFilterValues}
        onReset={() => setFilterValues({})}
      />

      <InsightListView
        insights={insights}
        title="Outcome Insights Inbox"
        description={`Latest outcome insights for ${companyName}`}
      />
    </div>
  );
};

export default OutcomeInsightsPage;