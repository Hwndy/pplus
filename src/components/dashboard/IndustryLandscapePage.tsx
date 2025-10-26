import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Mail, MailOpen, Clock } from 'lucide-react';
import { EmailListView } from '@/components/dashboard/EmailListView';

// Utility to concatenate class names
const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(' ');

// Interface for EmailItem
interface EmailItem {
  id: string;
  title?: string;
  sender?: { name: string; email: string };
  date?: string;
  content: string;
  isRead: boolean;
  preview?: string;
}

// Convert industry landscape data to EmailItem format
const convertIndustryDataToEmailFormat = (overviews: any[]): EmailItem[] =>
  overviews.map((item) => ({
    id: item.id.toString(),
    title: item.analyst_note || `Industry Update - ${format(new Date(item.date), 'MMM d, yyyy')}`,
    sender: {
      name: item.created_by?.username || 'Unknown Analyst',
      email: item.created_by?.email || 'N/A',
    },
    date: item.date,
    content: `
      <h3>Status: ${item.status}</h3>
      <h3>Sector: ${item.sector}</h3>
      <h3>Highlights:</h3>
      <ul>${item.highlights.map((h: string) => `<li>${h}</li>`).join('')}</ul>
      <p><strong>Total Highlights:</strong> ${item.total_highlights}</p>
      <p><strong>Analyst Note:</strong> ${item.analyst_note || 'N/A'}</p>
      <p><strong>Supervisor Note:</strong> ${item.supervisor_note || 'N/A'}</p>
      ${item.approved_by
        ? `<p><strong>Approved by:</strong> ${item.approved_by.username} (${item.approved_by.email})</p>`
        : '<p><strong>Approved by:</strong> Not yet approved</p>'}
      <p><strong>Created at:</strong> ${format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}</p>
      <p><strong>Updated at:</strong> ${format(new Date(item.updated_at), 'MMM d, yyyy HH:mm')}</p>
    `,
    isRead: false,
    preview: item.analyst_note ? item.analyst_note.substring(0, 120) + '...' : 'Industry update details...',
  }));

// Filter component
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

// Main IndustryLandscapePage component
const IndustryLandscapePage: React.FC = () => {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [filterValues, setFilterValues] = useState<{ dateRange?: { start: string; end: string } }>({});
  const [industryData, setIndustryData] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Get month from date range
  const getMonthFromDateRange = (dateRange: any): string | null => {
    if (!dateRange?.start) return null;
    const start = new Date(dateRange.start);
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
  };

  // Determine company
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;

    const determineCompany = async () => {
      setDataLoading(true);
      try {
        const month = getMonthFromDateRange(filterValues.dateRange);
        let url = 'https://pplus-6xcn.onrender.com/api/report/competitive-intelligence';
        if (month) url += `?month=${month}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
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

  // Fetch industry landscape data
  useEffect(() => {
    if (!selectedCompany || authLoading || !isAuthenticated) return;

    const fetchIndustryData = async () => {
      setDataLoading(true);
      try {
        const month = getMonthFromDateRange(filterValues.dateRange);
        let url = `https://pplus-6xcn.onrender.com/api/report/industry-landscape-overview?company=${encodeURIComponent(
          selectedCompany
        )}`;
        if (month) url += `&month=${month}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (result.success) {
          setIndustryData(result.data.overviews || []);
        } else {
          throw new Error(result.message || 'Failed to fetch industry landscape overviews');
        }
      } catch (err) {
        console.error('Error fetching industry landscape data:', err);
        toast.error('Error fetching industry landscape data');
        setIndustryData([]);
      } finally {
        setDataLoading(false);
      }
    };

    fetchIndustryData();
  }, [selectedCompany, filterValues, token, authLoading, isAuthenticated]);

  const emails = useMemo(() => convertIndustryDataToEmailFormat(industryData), [industryData]);

  if (authLoading || dataLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
        Industry Updates
      </h2>

      <FilterComponent values={filterValues} onChange={setFilterValues} onReset={() => setFilterValues({})} />

      <EmailListView
        emails={emails}
        title="Industry Updates Inbox"
        description={`Latest industry updates for ${selectedCompany || 'your business'}`}
      />
    </div>
  );
};

export default IndustryLandscapePage;