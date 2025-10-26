import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

interface OutcomeInsightFormProps {
  onClose: (refresh: boolean) => void;
  initialData?: {
    company_id?: number;
    date?: string;
    analystNote?: string;
    supervisorNote?: string;
    social_media_engagement?: { analysis: string }[];
    brand_awareness?: { analysis: string }[];
    media_coverage?: { analysis: string }[];
    competitor_analysis?: { analysis: string }[];
    id?: number;
  };
  isEdit?: boolean;
}

interface OutcomeEntry {
  id: number;
  category: string;
  analysis: string;
}

export function OutcomeInsightForm({
  onClose,
  initialData,
  isEdit = false,
}: OutcomeInsightFormProps) {
  // Compute initial outcomeEntries outside useState to avoid circular reference
  const getInitialOutcomeEntries = () => {
    if (initialData) {
      const baseId = 1;
      const entries = [
        ...(initialData.social_media_engagement?.map((s, i) => ({ id: baseId + i, category: 'social_media_engagement', analysis: s.analysis })) || []),
        ...(initialData.brand_awareness?.map((b, i) => ({ id: baseId + i + (initialData.social_media_engagement?.length || 0), category: 'brand_awareness', analysis: b.analysis })) || []),
        ...(initialData.media_coverage?.map((m, i) => ({ id: baseId + i + (initialData.social_media_engagement?.length || 0) + (initialData.brand_awareness?.length || 0), category: 'media_coverage', analysis: m.analysis })) || []),
        ...(initialData.competitor_analysis?.map((c, i) => ({ id: baseId + i + (initialData.social_media_engagement?.length || 0) + (initialData.brand_awareness?.length || 0) + (initialData.media_coverage?.length || 0), category: 'competitor_analysis', analysis: c.analysis })) || []),
      ];
      if (entries.length === 0) {
        entries.push({ id: baseId, category: 'social_media_engagement', analysis: '' });
      }
      return entries;
    }
    return [{ id: 1, category: 'social_media_engagement', analysis: '' }];
  };

  const [formData, setFormData] = useState({
    company_id: initialData?.company_id || 0,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    analystNote: initialData?.analystNote || '',
    supervisorNote: initialData?.supervisorNote || '',
  });

  const [outcomeEntries, setOutcomeEntries] = useState<OutcomeEntry[]>(getInitialOutcomeEntries());

  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  const companies = [
    { id: 1, name: 'Access Bank' },
    { id: 2, name: 'GTBank' },
    { id: 3, name: 'First Bank' },
    { id: 4, name: 'UBA' },
    { id: 5, name: 'Zenith Bank' },
    { id: 6, name: 'Fidelity Bank' },
    { id: 7, name: 'Sterling Bank' },
    { id: 8, name: 'Union Bank' },
    { id: 9, name: 'Wema Bank' },
    { id: 10, name: 'FCMB' },
    { id: 11, name: 'Stanbic IBTC' },
    { id: 12, name: 'Ecobank' },
  ];

  const filteredCompanies = React.useMemo(() => {
    if (!companySearchTerm) return companies;
    return companies.filter(company =>
      company.name.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
  }, [companySearchTerm]);

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOutcomeEntryChange = (id: number, field: string, value: string) => {
    setOutcomeEntries(prev => prev.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const addNewOutcomeEntry = () => {
    const newEntry = {
      id: outcomeEntries.length + 1,
      category: 'social_media_engagement',
      analysis: '',
    };
    setOutcomeEntries(prev => [...prev, newEntry]);
  };

  const removeOutcomeEntry = (id: number) => {
    if (outcomeEntries.length > 1) {
      setOutcomeEntries(prev => prev.filter(entry => entry.id !== id));
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
      analyst_note: formData.analystNote || null,
      supervisor_note: formData.supervisorNote || null,
      social_media_engagement: outcomeEntries.filter(e => e.category === 'social_media_engagement').map(e => ({ analysis: e.analysis })),
      brand_awareness: outcomeEntries.filter(e => e.category === 'brand_awareness').map(e => ({ analysis: e.analysis })),
      media_coverage: outcomeEntries.filter(e => e.category === 'media_coverage').map(e => ({ analysis: e.analysis })),
      competitor_analysis: outcomeEntries.filter(e => e.category === 'competitor_analysis').map(e => ({ analysis: e.analysis })),
    };

    const url = isEdit && initialData?.id ? `/api/outcome-insights/update/${initialData.id}` : '/api/outcome-insights/create';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      console.log('Sending request to:', `https://pplus-6xcn.onrender.com${url}`, 'with method:', method, 'and payload:', payload); // Debug log
      const response = await fetch(`https://pplus-6xcn.onrender.com${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(isEdit ? 'Outcome insight updated successfully' : 'Outcome insight created successfully');
        onClose(true);
      } else {
        toast.error(result.message || `Failed to ${isEdit ? 'update' : 'create'} outcome insight`);
      }
    } catch (error) {
      toast.error(`Error ${isEdit ? 'updating' : 'creating'} outcome insight`);
      console.error('Fetch error:', error);
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
                    value={companies.find(c => c.id === formData.company_id)?.name || companySearchTerm}
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
                              setShowCompanyDropdown(false);
                              setCompanySearchTerm('');
                            }}
                          >
                            {company.name}
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
              {outcomeEntries.map((entry, index) => (
                <div key={entry.id} className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-1">
                    {index === 0 ? (
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={addNewOutcomeEntry}
                        className="h-8 w-8 p-0 rounded bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 text-white" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeOutcomeEntry(entry.id)}
                        className="h-8 w-8 p-0 rounded"
                      >
                        <X className="h-4 w-4 text-white" />
                      </Button>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={entry.category}
                      onValueChange={(value) => handleOutcomeEntryChange(entry.id, 'category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Outcome Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social_media_engagement">Social Media Engagement</SelectItem>
                        <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                        <SelectItem value="media_coverage">Media Coverage</SelectItem>
                        <SelectItem value="competitor_analysis">Competitor Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-9">
                    <Textarea
                      value={entry.analysis}
                      onChange={(e) => handleOutcomeEntryChange(entry.id, 'analysis', e.target.value)}
                      placeholder="Analysis"
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="analystNote" className="text-sm text-gray-600">Analyst Note</Label>
                <Textarea
                  id="analystNote"
                  name="analystNote"
                  value={formData.analystNote}
                  onChange={(e) => handleFieldChange('analystNote', e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>
              <div>
                <Label htmlFor="supervisorNote" className="text-sm text-gray-600">Supervisor Note</Label>
                <Textarea
                  id="supervisorNote"
                  name="supervisorNote"
                  value={formData.supervisorNote}
                  onChange={(e) => handleFieldChange('supervisorNote', e.target.value)}
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
              onClick={() => onClose(false)}
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}