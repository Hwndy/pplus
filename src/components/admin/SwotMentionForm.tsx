import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/auth/AuthContext'; // Critical: Use context

interface SwotEntry {
  id: number;
  category: 'strengths' | 'weaknesses' | 'opportunities' | 'threats';
  analysis: string;
}

interface Company {
  id: number;
  company_name: string;
}

interface SwotMentionFormProps {
  onClose: (refresh?: boolean) => void;
  initialData?: {
    id?: string;
    company_id?: number;
    date?: string;
    strengths?: { analysis: string }[];
    weaknesses?: { analysis: string }[];
    opportunities?: { analysis: string }[];
    threats?: { analysis: string }[];
    analyst_note?: string;
    supervisor_note?: string;
  };
  isEdit?: boolean;
}

export const SwotMentionForm: React.FC<SwotMentionFormProps> = ({
  onClose,
  initialData,
  isEdit = false,
}) => {
  const { token, user } = useAuth(); // Use authenticated token & user

  const [formData, setFormData] = useState({
    company_id: initialData?.company_id || 0,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    analyst_note: initialData?.analyst_note || '',
    supervisor_note: initialData?.supervisor_note || '',
  });

  const [swotEntries, setSwotEntries] = useState<SwotEntry[]>(
    initialData
      ? [
          ...(initialData.strengths?.map((s, i) => ({
            id: i + 1,
            category: 'strengths' as const,
            analysis: s.analysis,
          })) || []),
          ...(initialData.weaknesses?.map((w, i) => ({
            id: i + 100 + (initialData.strengths?.length || 0),
            category: 'weaknesses' as const,
            analysis: w.analysis,
          })) || []),
          ...(initialData.opportunities?.map((o, i) => ({
            id: i + 200 + (initialData.strengths?.length || 0) + (initialData.weaknesses?.length || 0),
            category: 'opportunities' as const,
            analysis: o.analysis,
          })) || []),
          ...(initialData.threats?.map((t, i) => ({
            id: i + 300 + (initialData.strengths?.length || 0) + (initialData.weaknesses?.length || 0) + (initialData.opportunities?.length || 0),
            category: 'threats' as const,
            analysis: t.analysis,
          })) || []),
        ]
      : [{ id: 1, category: 'strengths' as const, analysis: '' }]
  );

  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  // Use token from context — never localStorage directly
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token || ''}`,
  });

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch('https://pplus-oez4.onrender.com/api/companies', {
          headers: getAuthHeaders(),
        });
        const result = await response.json();
        if (result.success && result.data?.data) {
          setCompanies(result.data.data);
          // Auto-select company if editing
          if (initialData?.company_id) {
            const selected = result.data.data.find((c: Company) => c.id === initialData.company_id);
            if (selected) setCompanySearchTerm(selected.company_name);
          }
        } else {
          toast.error(result.message || 'Failed to load companies');
        }
      } catch (error) {
        toast.error('Network error loading companies');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [token, initialData?.company_id]);

  const filteredCompanies = React.useMemo(() => {
    if (!companySearchTerm) return companies;
    return companies.filter((company) =>
      company.company_name.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
  }, [companySearchTerm, companies]);

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSwotEntryChange = (id: number, field: 'category' | 'analysis', value: string) => {
    setSwotEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    );
  };

  const addNewSwotEntry = () => {
    const newId = Math.max(...swotEntries.map((e) => e.id), 0) + 1;
    setSwotEntries((prev) => [
      ...prev,
      { id: newId, category: 'strengths', analysis: '' },
    ]);
  };

  const removeSwotEntry = (id: number) => {
    if (swotEntries.length <= 1) {
      toast.error('At least one entry is required');
      return;
    }
    setSwotEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleSave = async () => {
    if (!formData.company_id) {
      toast.error('Please select a company');
      return;
    }

    if (!token) {
      toast.error('Authentication required');
      return;
    }

    const payload = {
      company_id: formData.company_id,
      date: formData.date,
      analyst_note: formData.analyst_note || null,
      supervisor_note: user?.role.name === 'Supervisor' ? formData.supervisor_note || null : null,
      strengths: swotEntries
        .filter((e) => e.category === 'strengths')
        .map((e) => ({ analysis: e.analysis.trim() }))
        .filter((s) => s.analysis),
      weaknesses: swotEntries
        .filter((e) => e.category === 'weaknesses')
        .map((e) => ({ analysis: e.analysis.trim() }))
        .filter((w) => w.analysis),
      opportunities: swotEntries
        .filter((e) => e.category === 'opportunities')
        .map((e) => ({ analysis: e.analysis.trim() }))
        .filter((o) => o.analysis),
      threats: swotEntries
        .filter((e) => e.category === 'threats')
        .map((e) => ({ analysis: e.analysis.trim() }))
        .filter((t) => t.analysis),
    };

    // Validation
    if (
      payload.strengths.length === 0 &&
      payload.weaknesses.length === 0 &&
      payload.opportunities.length === 0 &&
      payload.threats.length === 0
    ) {
      toast.error('Please add at least one SWOT point');
      return;
    }

    setLoading(true);
    try {
      const url = isEdit && initialData?.id
        ? `https://pplus-oez4.onrender.com/api/swot-analysis/update/${initialData.id}`
        : 'https://pplus-oez4.onrender.com/api/swot-analysis/create';

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(isEdit ? 'SWOT updated successfully' : 'SWOT created successfully');
        onClose(true); // Trigger refresh
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Network error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.company-search-container')) {
        setShowCompanyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!token || !user) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Authentication required. Please log in.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)] overflow-hidden">
      <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-none">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Company + Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="company-search-container relative">
              <Label>Company</Label>
              <Input
                value={companySearchTerm}
                onChange={(e) => {
                  setCompanySearchTerm(e.target.value);
                  setShowCompanyDropdown(true);
                }}
                onFocus={() => setShowCompanyDropdown(true)}
                placeholder="Search company..."
                className="w-full"
              />
              {showCompanyDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company) => (
                      <div
                        key={company.id}
                        className="px-4 py-2 hover:bg-accent cursor-pointer text-sm"
                        onClick={() => {
                          handleFieldChange('company_id', company.id);
                          setCompanySearchTerm(company.company_name);
                          setShowCompanyDropdown(false);
                        }}
                      >
                        {company.company_name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      {companySearchTerm ? 'No companies found' : 'Type to search...'}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
              />
            </div>
          </div>

          {/* SWOT Entries */}
          <div className="space-y-4">
            <Label>SWOT Analysis</Label>
            {swotEntries.map((entry, index) => (
              <div key={entry.id} className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-1">
                  {index === 0 ? (
                    <Button
                      variant="default"
                      size="icon"
                      onClick={addNewSwotEntry}
                      className="h-9 w-9"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeSwotEntry(entry.id)}
                      className="h-9 w-9"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="col-span-3">
                  <Select
                    value={entry.category}
                    onValueChange={(v) => handleSwotEntryChange(entry.id, 'category', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strengths">Strengths</SelectItem>
                      <SelectItem value="weaknesses">Weaknesses</SelectItem>
                      <SelectItem value="opportunities">Opportunities</SelectItem>
                      <SelectItem value="threats">Threats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-8">
                  <Textarea
                    value={entry.analysis}
                    onChange={(e) => handleSwotEntryChange(entry.id, 'analysis', e.target.value)}
                    placeholder="Enter analysis..."
                    className="min-h-24 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Analyst Note</Label>
              <Textarea
                value={formData.analyst_note}
                onChange={(e) => handleFieldChange('analyst_note', e.target.value)}
                placeholder="Add your insights..."
                className="min-h-32"
              />
            </div>
            {user.role.name === 'Supervisor' && (
              <div>
                <Label>Supervisor Note</Label>
                <Textarea
                  value={formData.supervisor_note}
                  onChange={(e) => handleFieldChange('supervisor_note', e.target.value)}
                  placeholder="Supervisor comments..."
                  className="min-h-32"
                />
              </div>
            )}
          </div>
        </CardContent>

        {/* Footer */}
        <div className="border-t bg-background px-6 py-4">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onClose(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Save & Send'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};