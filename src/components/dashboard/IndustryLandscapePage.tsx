import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { EmailListView } from '@/components/dashboard/EmailListView';

// Interface for EmailItem (shared with EmailListView)
interface EmailItem {
  id: string;
  title?: string;
  sender?: { name: string; email: string };
  date?: string;
  content: string;
  isRead: boolean;
  preview?: string;
}

// Convert industry landscape data to EmailItem format — persistent read state
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
    isRead: localStorage.getItem(`industry-read-${item.id}`) === 'true',
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

// Main IndustryLandscapePage component — NOW FULLY PROFILE-AWARE
const IndustryLandscapePage: React.FC = () => {
  const { token, isAuthenticated, isLoading: authLoading, activePair } = useAuth();
  const [filterValues, setFilterValues] = useState<{ dateRange?: { start: string; end: string } }>({});
  const [industryData, setSpecialData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Use activePair — safe fallback
  const companyName = activePair?.company_name || 'Your Company';

  // Get month from date range
  const getMonthFromDateRange = (dateRange: any): string | null => {
    if (!dateRange?.start) return null;
    const start = new Date(dateRange.start);
    return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
  };

  // Fetch industry landscape data — now uses activePair.pair_id
  useEffect(() => {
    if (authLoading || !isAuthenticated || !token || !activePair) return;

    const fetchIndustryData = async () => {
      setDataLoading(true);
      try {
        const month = getMonthFromDateRange(filterValues.dateRange);
        let url = `https://pplus-ipn6.onrender.com/api/report/industry-landscape-overview?pair_id=${activePair.pair_id}`;
        if (month) url += `&month=${month}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();

        if (result.success && result.data?.overviews) {
          setSpecialData(result.data.overviews);
        } else {
          setSpecialData([]);
          if (result.message) toast.info(result.message);
        }
      } catch (err) {
        console.error('Error fetching industry landscape:', err);
        toast.error('Failed to load industry updates');
        setSpecialData([]);
      } finally {
        setDataLoading(false);
      }
    };

    fetchIndustryData();
  }, [authLoading, isAuthenticated, token, activePair, filterValues.dateRange]); // ← activePair in deps

  const emails = useMemo(() => convertIndustryDataToEmailFormat(industryData), [industryData]);

  if (authLoading || dataLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading industry updates for <strong>{companyName}</strong>...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
        Industry Updates - {companyName}
      </h2>

      <FilterComponent
        values={filterValues}
        onChange={setFilterValues}
        onReset={() => setFilterValues({})}
      />

      <EmailListView
        emails={emails}
        title="Industry Updates Inbox"
        description={`Latest industry updates for ${companyName}`}
        storagePrefix="industry-read-" // ← Preserves read state per item
      />
    </div>
  );
};

export default IndustryLandscapePage;