import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

export interface SwotAnalysis {
  id: number;
  date: string;
  company: string;
  currentCategory?: string;
  currentAnalysis?: string;
  analystNote?: string;
  supervisorNote?: string;
  adminNote?: string;
  status?: string;
}

interface Company {
  id: string;
  name: string;
}

// Interface for SwotMentionForm (used by SwotMentionsPage)
interface SwotMentionFormProps {
  onClose: () => void;
  initialData?: {
    company?: string;
    date?: string;
    strengths?: any[];
    weaknesses?: any[];
    opportunities?: any[];
    threats?: any[];
    analystNote?: string;
    supervisorNote?: string;
  };
  isEdit?: boolean;
}

// Interface for SwotForm (used by SwotAnalysisEntryPage)
interface SwotFormProps {
  swotAnalyses: SwotAnalysis[];
  activeIndex: number;
  errors: Record<string, string>;
  apiCompanies: Company[];
  userRole: string;
  onSwotChange: (swotAnalyses: SwotAnalysis[]) => void;
  onAddSwot: () => void;
  onCloneSwot: () => void;
  onSwitchSwot: (index: number) => void;
  onFieldChange: (name: string, value: string | string[]) => void;
  onClearError: (fieldName: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

const companies = [
  'Access Bank', 'GTBank', 'First Bank', 'UBA', 'Zenith Bank', 'Fidelity Bank',
  'Sterling Bank', 'Union Bank', 'Wema Bank', 'FCMB', 'Stanbic IBTC', 'Ecobank'
];

// SwotMentionForm component (for SwotMentionsPage)
export const SwotMentionForm: React.FC<SwotMentionFormProps> = ({
  onClose,
  initialData,
  isEdit = false
}) => {
  const [formData, setFormData] = useState({
    company: initialData?.company || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    currentCategory: 'strengths' as string,
    currentAnalysis: '',
    analystNote: initialData?.analystNote || '',
    supervisorNote: initialData?.supervisorNote || ''
  });

  // State for managing multiple SWOT entries
  const [swotEntries, setSwotEntries] = useState([
    {
      id: 1,
      category: 'strengths' as string,
      analysis: ''
    }
  ]);

  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

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

  const handleSwotEntryChange = (id: number, field: string, value: string) => {
    setSwotEntries(prev => prev.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const addNewSwotEntry = () => {
    const newEntry = {
      id: swotEntries.length + 1,
      category: 'strengths' as string,
      analysis: ''
    };
    setSwotEntries(prev => [...prev, newEntry]);
  };

  const removeSwotEntry = (id: number) => {
    if (swotEntries.length > 1) {
      setSwotEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const handleSave = () => {
    console.log('Saving SWOT mention:', { formData, swotEntries });
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

            {/* ROW 2: SWOT Entries */}
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

            {/* ROW 3: Notes */}
            <div className="grid grid-cols-2 gap-4">
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
};

// SwotForm component (for SwotAnalysisEntryPage)
export const SwotForm: React.FC<SwotFormProps> = ({
  swotAnalyses,
  activeIndex,
  errors,
  apiCompanies = [],
  userRole,
  onSwotChange,
  onAddSwot,
  onCloneSwot,
  onSwitchSwot,
  onFieldChange,
  onClearError,
  onSave,
  onCancel
}) => {
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  const filteredCompanies = React.useMemo(() => {
    const safeApiCompanies = Array.isArray(apiCompanies) ? apiCompanies : [];
    const allCompanies = [...safeApiCompanies, ...companies.map(name => ({ name, id: name }))];
    if (!companySearchTerm) return allCompanies;
    return allCompanies.filter(company =>
      (typeof company === 'string' ? company : company.name)
        .toLowerCase()
        .includes(companySearchTerm.toLowerCase())
    );
  }, [companySearchTerm, apiCompanies]);

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
            <div className="grid grid-cols-2 gap-4">
              <div className="company-search-container">
                <div className="relative">
                  <Input
                    id="company"
                    name="company"
                    value={swotAnalyses[activeIndex]?.company || ''}
                    onChange={(e) => {
                      onFieldChange('company', e.target.value);
                      setCompanySearchTerm(e.target.value);
                      setShowCompanyDropdown(true);
                    }}
                    onFocus={() => setShowCompanyDropdown(true)}
                    className={errors.company ? "border-red-500" : ""}
                    placeholder="Search for a company"
                  />
                  {showCompanyDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredCompanies.length > 0 ? (
                        filteredCompanies.map((company, index) => (
                          <div
                            key={typeof company === 'string' ? company : company.id}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              const companyName = typeof company === 'string' ? company : company.name;
                              onFieldChange('company', companyName);
                              setShowCompanyDropdown(false);
                              setCompanySearchTerm('');
                            }}
                          >
                            {typeof company === 'string' ? company : company.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500">No companies found</div>
                      )}
                    </div>
                  )}
                </div>
                {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
              </div>

              <div>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={swotAnalyses[activeIndex]?.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => onFieldChange('date', e.target.value)}
                  className={errors.date ? "border-red-500" : ""}
                  placeholder="mm/dd/yyyy"
                />
                {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
              </div>
            </div>

            {/* ROW 2: Action, SWOT Category, and Analysis */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={onAddSwot}
                  className="h-8 w-8 p-0 rounded bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 text-white" />
                </Button>
              </div>

              <div className="col-span-2">
                <Select
                  value={swotAnalyses[activeIndex]?.currentCategory || 'strengths'}
                  onValueChange={(value) => onFieldChange('currentCategory', value)}
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
                  value={swotAnalyses[activeIndex]?.currentAnalysis || ''}
                  onChange={(e) => onFieldChange('currentAnalysis', e.target.value)}
                  placeholder="Analysis"
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>

            {/* ROW 3: Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="analystNote" className="text-sm text-gray-600">Analyst Note</Label>
                <Textarea
                  id="analystNote"
                  name="analystNote"
                  value={swotAnalyses[activeIndex]?.analystNote || ''}
                  onChange={(e) => onFieldChange('analystNote', e.target.value)}
                  className="min-h-[100px] resize-none"
                  readOnly={userRole !== 'analyst' && userRole !== 'admin'}
                  disabled={userRole !== 'analyst' && userRole !== 'admin'}
                />
              </div>

              <div>
                <Label htmlFor="supervisorNote" className="text-sm text-gray-600">Supervisor Note</Label>
                <Textarea
                  id="supervisorNote"
                  name="supervisorNote"
                  value={swotAnalyses[activeIndex]?.supervisorNote || ''}
                  onChange={(e) => onFieldChange('supervisorNote', e.target.value)}
                  className="min-h-[100px] resize-none"
                  readOnly={userRole !== 'supervisor' && userRole !== 'admin'}
                  disabled={userRole !== 'supervisor' && userRole !== 'admin'}
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
              onClick={onSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
            >
              Save & Send
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onCancel}
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

export default SwotForm