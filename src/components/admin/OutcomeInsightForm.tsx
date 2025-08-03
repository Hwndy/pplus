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

interface OutcomeInsightFormProps {
  onClose: () => void;
  initialData?: {
    company?: string;
    date?: string;
    analystNote?: string;
    supervisorNote?: string;
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
  isEdit = false
}: OutcomeInsightFormProps) {
  const [formData, setFormData] = useState({
    company: initialData?.company || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    analystNote: initialData?.analystNote || '',
    supervisorNote: initialData?.supervisorNote || ''
  });

  // State for managing multiple outcome entries
  const [outcomeEntries, setOutcomeEntries] = useState<OutcomeEntry[]>([
    {
      id: 1,
      category: 'Article/Photo for leverage',
      analysis: ''
    }
  ]);

  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  // Static data arrays
  const companies = [
    'Access Bank', 'GTBank', 'First Bank', 'UBA', 'Zenith Bank', 'Fidelity Bank',
    'Sterling Bank', 'Union Bank', 'Wema Bank', 'FCMB', 'Stanbic IBTC', 'Ecobank'
  ];

  const filteredCompanies = React.useMemo(() => {
    const allCompanies = companies.map(name => ({ name, id: name }));
    if (!companySearchTerm) return allCompanies;
    return allCompanies.filter(company =>
      company.name.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
  }, [companySearchTerm]);

  const handleFieldChange = (field: string, value: string) => {
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
      category: 'Article/Photo for leverage',
      analysis: ''
    };
    setOutcomeEntries(prev => [...prev, newEntry]);
  };

  const removeOutcomeEntry = (id: number) => {
    if (outcomeEntries.length > 1) {
      setOutcomeEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const handleSave = () => {
    console.log('Saving outcome insight:', { formData, outcomeEntries });
    onClose();
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

            {/* ROW 1: Company Search and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="company-search-container">
                <div className="relative">
                  <Input
                    value={formData.company}
                    onChange={(e) => {
                      handleFieldChange('company', e.target.value);
                      setCompanySearchTerm(e.target.value);
                      setShowCompanyDropdown(true);
                    }}
                    onFocus={() => setShowCompanyDropdown(true)}
                    placeholder="Search for a company"
                  />
                  {showCompanyDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredCompanies.length > 0 ? (
                        filteredCompanies.map((company, index) => (
                          <div
                            key={company.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              handleFieldChange('company', company.name);
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

            {/* ROW 2: Outcome Entries */}
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
                        <SelectValue placeholder="Outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Article/Photo for leverage">Article/Photo for leverage</SelectItem>
                        <SelectItem value="Media Coverage">Media Coverage</SelectItem>
                        <SelectItem value="Social Media Engagement">Social Media Engagement</SelectItem>
                        <SelectItem value="Brand Awareness">Brand Awareness</SelectItem>
                        <SelectItem value="Competitor Analysis">Competitor Analysis</SelectItem>
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

            {/* ROW 3: Notes */}
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

        {/* Action Buttons - Fixed at bottom */}
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
}