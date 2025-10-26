import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface SwotEntry {
  id: number;
  category: string;
  analysis: string;
}

interface Company {
  id: number;
  company_name: string;
}

interface SwotMentionFormProps {
  onClose: () => void;
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
  const [formData, setFormData] = useState({
    company_id: initialData?.company_id || 0,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    analyst_note: initialData?.analyst_note || '',
    supervisor_note: initialData?.supervisor_note || '',
  });
  const [swotEntries, setSwotEntries] = useState<SwotEntry[]>(initialData ? [
    ...(initialData.strengths?.map((s, i) => ({ id: i + 1, category: 'strengths', analysis: s.analysis })) || []),
    ...(initialData.weaknesses?.map((w, i) => ({ id: i + 1 + (initialData.strengths?.length || 0), category: 'weaknesses', analysis: w.analysis })) || []),
    ...(initialData.opportunities?.map((o, i) => ({ id: i + 1 + (initialData.strengths?.length || 0) + (initialData.weaknesses?.length || 0), category: 'opportunities', analysis: o.analysis })) || []),
    ...(initialData.threats?.map((t, i) => ({ id: i + 1 + (initialData.strengths?.length || 0) + (initialData.weaknesses?.length || 0) + (initialData.opportunities?.length || 0), category: 'threats', analysis: t.analysis })) || []),
  ] : [{ id: 1, category: 'strengths', analysis: '' }]);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);

  // Replace with your actual token retrieval logic
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`, // Adjust based on your auth mechanism
  });

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('https://pplus-6xcn.onrender.com/api/companies', {
          headers: getAuthHeaders(),
        });
        const result = await response.json();
        if (result.success) {
          setCompanies(result.data.data || []); // Access nested data array
        } else {
          toast.error(result.message || 'Failed to fetch companies');
        }
      } catch (error) {
        toast.error('Error fetching companies');
        console.error(error);
      }
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = React.useMemo(() => {
    if (!companySearchTerm) return companies;
    return companies.filter(company =>
      company.company_name.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
  }, [companySearchTerm, companies]);

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSwotEntryChange = (id: number, field: string, value: string) => {
    setSwotEntries(prev => prev.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const addNewSwotEntry = () => {
    const newEntry = {
      id: swotEntries.length + 1,
      category: 'strengths',
      analysis: '',
    };
    setSwotEntries(prev => [...prev, newEntry]);
  };

  const removeSwotEntry = (id: number) => {
    if (swotEntries.length > 1) {
      setSwotEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const handleSave = async () => {
    if (!formData.company_id) {
      toast.error('Please select a company');
      return;
    }
    const payload = {
      company_id: formData.company_id,
      date: formData.date,
      analyst_note: formData.analyst_note || null,
      supervisor_note: formData.supervisor_note || null,
      strengths: swotEntries.filter(e => e.category === 'strengths').map(e => ({ analysis: e.analysis })),
      weaknesses: swotEntries.filter(e => e.category === 'weaknesses').map(e => ({ analysis: e.analysis })),
      opportunities: swotEntries.filter(e => e.category === 'opportunities').map(e => ({ analysis: e.analysis })),
      threats: swotEntries.filter(e => e.category === 'threats').map(e => ({ analysis: e.analysis })),
    };

    try {
      const url = isEdit && initialData?.id
        ? `https://pplus-6xcn.onrender.com/api/swot-analysis/update/${initialData.id}`
        : 'https://pplus-6xcn.onrender.com/api/swot-analysis/create';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(isEdit ? 'SWOT analysis updated successfully' : 'SWOT analysis created successfully');
        onClose();
      } else {
        toast.error(result.message || `Failed to ${isEdit ? 'update' : 'create'} SWOT analysis`);
      }
    } catch (error) {
      toast.error(`Error ${isEdit ? 'updating' : 'creating'} SWOT analysis`);
      console.error(error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.company-search-container')) {
        setShowCompanyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)] overflow-hidden">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="company-search-container">
                <div className="relative">
                  <Input
                    value={companySearchTerm}
                    onChange={(e) => {
                      setCompanySearchTerm(e.target.value);
                      setShowCompanyDropdown(true);
                    }}
                    onFocus={() => setShowCompanyDropdown(true)}
                    placeholder="Search for a company"
                  />
                  {showCompanyDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredCompanies.length > 0 ? (
                        filteredCompanies.map((company) => (
                          <div
                            key={company.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
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
                        <div className="px-3 py-2 text-gray-500">No companies found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  placeholder="mm/dd/yyyy"
                />
              </div>
            </div>
            <div className="space-y-4">
              {swotEntries.map((entry, index) => (
                <div key={entry.id} className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-1">
                    {index === 0 ? (
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={addNewSwotEntry}
                        className="h-8 w-8 p-0 rounded bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 text-white" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSwotEntry(entry.id)}
                        className="h-8 w-8 p-0 rounded"
                      >
                        <X className="h-4 w-4 text-white" />
                      </Button>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={entry.category}
                      onValueChange={(value) => handleSwotEntryChange(entry.id, 'category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="SWOT" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strengths">Strengths</SelectItem>
                        <SelectItem value="weaknesses">Weaknesses</SelectItem>
                        <SelectItem value="opportunities">Opportunities</SelectItem>
                        <SelectItem value="threats">Threats</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-9">
                    <Textarea
                      value={entry.analysis}
                      onChange={(e) => handleSwotEntryChange(entry.id, 'analysis', e.target.value)}
                      placeholder="Analysis"
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="analystNote" className="text-sm text-gray-600">Analyst Note</Label>
                <Textarea
                  id="analystNote"
                  name="analystNote"
                  value={formData.analyst_note}
                  onChange={(e) => handleFieldChange('analyst_note', e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
              <div>
                <Label htmlFor="supervisorNote" className="text-sm text-gray-600">Supervisor Note</Label>
                <Textarea
                  id="supervisorNote"
                  name="supervisorNote"
                  value={formData.supervisor_note}
                  onChange={(e) => handleFieldChange('supervisor_note', e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <div className="border-t bg-card p-6">
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
            >
              Save & Send
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onClose}
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};