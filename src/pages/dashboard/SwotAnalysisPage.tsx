import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Mail, MailOpen, Clock } from 'lucide-react';

// Utility function for className concatenation
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Interface for EmailItem
interface EmailItem {
  id: string;
  title?: string;
  sender?: {
    name: string;
    email: string;
  };
  date?: string;
  content: string;
  isRead: boolean;
  preview?: string;
}

// Convert SWOT data to EmailItem format
function convertSwotDataToEmailFormat(analyses: any[]): EmailItem[] {
  return analyses.map((item) => ({
    id: item.id.toString(),
    title: item.analyst_note || `SWOT Analysis - ${format(new Date(item.date), 'MMM d, yyyy')}`,
    sender: {
      name: item.created_by?.username || 'Unknown Analyst',
      email: item.created_by?.email || 'N/A',
    },
    date: item.date,
    content: `
      <h3>Status: ${item.status}</h3>
      <h3>Strengths</h3>
      <ul>${item.strengths.map((s: any) => `<li>${s.analysis}</li>`).join('')}</ul>
      <h3>Weaknesses</h3>
      <ul>${item.weaknesses.map((s: any) => `<li>${s.analysis}</li>`).join('')}</ul>
      <h3>Opportunities</h3>
      <ul>${item.opportunities.map((s: any) => `<li>${s.analysis}</li>`).join('')}</ul>
      <h3>Threats</h3>
      <ul>${item.threats.map((s: any) => `<li>${s.analysis}</li>`).join('')}</ul>
      <p><strong>Analyst Note:</strong> ${item.analyst_note || 'N/A'}</p>
      <p><strong>Supervisor Note:</strong> ${item.supervisor_note || 'N/A'}</p>
      ${item.approved_by ? `<p><strong>Approved by:</strong> ${item.approved_by.username} (${item.approved_by.email})</p>` : '<p><strong>Approved by:</strong> Not yet approved</p>'}
      <p><strong>Created at:</strong> ${format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}</p>
      <p><strong>Updated at:</strong> ${format(new Date(item.updated_at), 'MMM d, yyyy HH:mm')}</p>
    `,
    isRead: false,
    preview: item.analyst_note ? item.analyst_note.substring(0, 120) + '...' : 'SWOT analysis details...',
  }));
}

// Embedded EmailListView component
function EmailListView({ emails, title, description }: { emails: EmailItem[], title: string, description: string }) {
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [emailsState, setEmailsState] = useState<EmailItem[]>(emails);

  useEffect(() => {
    setEmailsState(emails);
    setSelectedEmail(null); // Reset selection when emails change
  }, [emails]);

  const handleEmailClick = (email: EmailItem) => {
    if (!email.isRead) {
      const updatedEmails = emailsState.map(e =>
        e.id === email.id ? { ...e, isRead: true } : e
      );
      setEmailsState(updatedEmails);
    }
    setSelectedEmail(email);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="flex flex-col md:flex-row h-[600px]">
        {/* Email List */}
        <div className="w-full md:w-2/5 border-r overflow-y-auto">
          {emailsState.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No SWOT analyses available</div>
          ) : (
            emailsState.map((email) => (
              <div
                key={email.id}
                onClick={() => handleEmailClick(email)}
                className={cn(
                  "p-4 border-b cursor-pointer transition-colors",
                  "hover:bg-blue-50",
                  selectedEmail?.id === email.id ? "bg-blue-50" : "",
                  email.isRead ? "bg-gray-50" : ""
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {email.isRead ? (
                      <MailOpen size={18} className="text-gray-400" />
                    ) : (
                      <Mail size={18} className="text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "text-sm font-medium truncate mb-1",
                      email.isRead ? "text-gray-500" : "text-gray-900"
                    )}>
                      {email.title}
                    </h4>
                    {email.sender && (
                      <p className="text-xs text-gray-500 font-medium">{email.sender.name}</p>
                    )}
                    {email.preview && (
                      <p className={cn(
                        "text-xs line-clamp-2 mt-1",
                        email.isRead ? "text-gray-400" : "text-gray-600"
                      )}>
                        {email.preview}
                      </p>
                    )}
                    {email.date && (
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <Clock size={12} className="mr-1" />
                        {format(new Date(email.date), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Email Content */}
        <div className="w-full md:w-3/5 p-6 overflow-y-auto bg-white">
          {selectedEmail ? (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedEmail.title}
                </h2>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                  {selectedEmail.sender && (
                    <div>
                      From: <span className="font-medium">{selectedEmail.sender.name}</span> &lt;{selectedEmail.sender.email}&gt;
                    </div>
                  )}
                  {selectedEmail.date && (
                    <div>
                      {format(new Date(selectedEmail.date), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 border-t pt-4">
                <div dangerouslySetInnerHTML={{ __html: selectedEmail.content }} />
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
}

const SwotAnalysisPage: React.FC = () => {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [filterValues, setFilterValues] = useState<{ dateRange?: { start: string; end: string } }>({});
  const [swotData, setSwotData] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Simplified filter component embedded in the file
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

  // Function to get month from date range
  const getMonthFromDateRange = (dateRange: any): string | null => {
    if (!dateRange?.start) return null;
    const start = new Date(dateRange.start);
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
  };

  // Determine company based on user role
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;

    const determineCompany = async () => {
      setDataLoading(true);
      try {
        console.log('Determining company...');
        const month = getMonthFromDateRange(filterValues.dateRange);
        let url = 'https://pplus-nl5o.onrender.com/api/report/competitive-intelligence';
        if (month) url += `?month=${month}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('Competitive Intelligence Response:', await response.clone().json());
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
        // Fallback to default if no competitive data
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

  // Fetch SWOT data once company is determined
  useEffect(() => {
    if (!selectedCompany || authLoading || !isAuthenticated) return;

    const fetchSwot = async () => {
      setDataLoading(true);
      try {
        console.log('Fetching SWOT data for company:', selectedCompany);
        const month = getMonthFromDateRange(filterValues.dateRange);
        let url = 'https://pplus-nl5o.onrender.com/api/report/swot-analysis';
        url += `?company=${encodeURIComponent(selectedCompany)}`;
        if (month) url += `&month=${month}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('SWOT Analysis Response:', await response.clone().json());
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (result.success) {
          setSwotData(result.data.analyses || []);
        } else {
          throw new Error(result.message || 'Failed to fetch SWOT analyses');
        }
      } catch (err) {
        console.error('Error fetching SWOT data:', err);
        toast.error('Error fetching SWOT data');
        setSwotData([]);
      } finally {
        setDataLoading(false);
      }
    };

    fetchSwot();
  }, [selectedCompany, filterValues, token, authLoading, isAuthenticated]);

  const emails = useMemo(() => convertSwotDataToEmailFormat(swotData), [swotData]);

  if (authLoading || dataLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">SWOT Analysis</h2>

      <FilterComponent
        values={filterValues}
        onChange={setFilterValues}
        onReset={() => setFilterValues({})}
      />

      <EmailListView
        emails={emails}
        title="SWOT Analyses Inbox"
        description={`Latest SWOT analyses for ${selectedCompany || 'your business'}`}
      />
    </div>
  );
};

export default SwotAnalysisPage;