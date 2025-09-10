import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Editorial {
  id: number;
  serialNumber?: number;
  date: string;
  company: string;
  brand?: string;
  company_id?: number;
  source: string;
  placement: string;
  title: string;
  mediaType: string;
  printWebClips: string;
  reporter: string;
  country: string;
  language: string;
  spokesperson: string;
  ceoMediaPresence: string;
  ceoThoughtLeadership: string;
  activity: string;
  circulation?: number;
  audienceReach?: number;
  onlineChannel?: string;
  sentiment: string;
  sentimentClassification: string;
  sentimentScore: number;
  sentiment_keyword_indicator_id?: number;
  advertSpend?: number;
  pageSize?: string;
  analystNote?: string;
  supervisorNote?: string;
  adminNote?: string;
}

interface Company {
  id: number;
  company_name: string;
}

interface Person {
  id: number;
  username: string;
  role?: {
    name?: string;
  };
}

interface DataParameter {
  id: number;
  value: string;
}

interface SentimentKeyword {
  id: number;
  keyword_indicator: string;
}

interface EditorialFormProps {
  editorials: Editorial[];
  activeIndex: number;
  errors: Record<string, string>;
  userRole: string;
  onEditorialChange?: (editorials: Editorial[]) => void;
  onAddEditorial?: () => void;
  onCloneEditorial?: () => void;
  onSwitchEditorial: (index: number) => void;
  onFieldChange: (name: string, value: string | number) => void;
  onRemoveEditorial?: (id: number) => void;
  onReviewAction?: (action: 'approve' | 'reject') => void;
  isFieldReadOnly?: (fieldName: string) => boolean;
  apiCompanies: Company[];
  apiReporters: Person[];
  apiSpokespersons: DataParameter[];
  apiPlacements: DataParameter[];
  apiOnlineChannels: DataParameter[];
  apiPublications: DataParameter[];
  apiCeoMediaPresence: DataParameter[];
  apiCeoThoughtLeadership: DataParameter[];
  apiLanguages: DataParameter[];
  apiCountries: DataParameter[];
  apiActivities: DataParameter[];
  apiPageSizes: DataParameter[];
  apiSentimentKeywords: SentimentKeyword[];
}

const EditorialForm: React.FC<EditorialFormProps> = ({
  editorials,
  activeIndex,
  errors,
  userRole,
  onAddEditorial,
  onCloneEditorial,
  onSwitchEditorial,
  onFieldChange,
  onRemoveEditorial,
  onReviewAction,
  isFieldReadOnly: propIsFieldReadOnly,
  apiCompanies = [],
  apiReporters = [],
  apiSpokespersons = [],
  apiPlacements = [],
  apiOnlineChannels = [],
  apiPublications = [],
  apiCeoMediaPresence = [],
  apiCeoThoughtLeadership = [],
  apiLanguages = [],
  apiCountries = [],
  apiActivities = [],
  apiPageSizes = [],
  apiSentimentKeywords = []
}) => {
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const [showDropdown, setShowDropdown] = useState<{ [key: string]: boolean }>({});

  const currentEditorial = editorials[activeIndex] || ({} as Editorial);

  useEffect(() => {
    if (currentEditorial) {
      setSearchTerms({
        company: currentEditorial.company ?? '',
        source: currentEditorial.source ?? '',
        reporter: currentEditorial.reporter ?? '',
        spokesperson: currentEditorial.spokesperson ?? '',
        placement: currentEditorial.placement ?? '',
        mediaType: currentEditorial.mediaType ?? '',
        ceoMediaPresence: currentEditorial.ceoMediaPresence ?? '',
        ceoThoughtLeadership: currentEditorial.ceoThoughtLeadership ?? '',
        language: currentEditorial.language ?? '',
        country: currentEditorial.country ?? '',
        activity: currentEditorial.activity ?? '',
        pageSize: currentEditorial.pageSize ?? '',
        sentiment: currentEditorial.sentiment ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, editorials]);

  const printWebClipsOptions = ['Print Only', 'Web Only', 'Both Print and Web', 'Social Media'];

  const isFieldReadOnly = (fieldName: string) => {
    if (propIsFieldReadOnly) return propIsFieldReadOnly(fieldName);
    if (fieldName === 'analystNote' && userRole !== 'analyst') return true;
    if (fieldName === 'supervisorNote' && userRole !== 'supervisor') return true;
    if (fieldName === 'adminNote' && userRole !== 'admin') return true;
    return false;
  };

  const handleFieldChangeLocal = (fieldName: string, value: string | number) => {
    onFieldChange(fieldName, value);
    if (Object.prototype.hasOwnProperty.call(searchTerms, fieldName)) {
      setSearchTerms(prev => ({ ...prev, [fieldName]: value as string }));
    }
  };

  const renderSearchableDropdown = (
    fieldName: string,
    options: any[],
    displayKey: string,
    onSelectCallback?: (value: string, option?: any) => void
  ) => {
    const searchTerm = searchTerms[fieldName] || '';
    const filteredOptions = Array.isArray(options)
      ? options.filter(option => {
          const value = typeof option === 'string' ? option : (option as any)[displayKey] || '';
          return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      : [];

    const onItemSelect = (option: any) => {
      const displayValue = typeof option === 'string' ? option : option[displayKey];
      handleFieldChangeLocal(fieldName, displayValue ?? '');
      // special-case: if selecting a company set company_id too
      if (displayKey === 'company_name' && option?.id) {
        onFieldChange('company_id', option.id);
      }
      if (fieldName === 'sentiment' && option?.id) {
        onFieldChange('sentiment_keyword_indicator_id', option.id);
      }
      if (onSelectCallback) onSelectCallback(displayValue, option);
      setShowDropdown(prev => ({ ...prev, [fieldName]: false }));
    };

    return (
      <div className="relative w-full">
        <Input
          id={fieldName}
          name={fieldName}
          value={searchTerm}
          onChange={(e) => setSearchTerms(prev => ({ ...prev, [fieldName]: e.target.value }))}
          onFocus={() => setShowDropdown(prev => ({ ...prev, [fieldName]: true }))}
          onBlur={() => setTimeout(() => setShowDropdown(prev => ({ ...prev, [fieldName]: false })), 200)}
          className={errors[fieldName] ? "border-red-500" : ""}
          placeholder={`Search or type ${fieldName}`}
        />
        {showDropdown[fieldName] && filteredOptions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.map((option, idx) => {
              const displayValue = typeof option === 'string' ? option : option[displayKey];
              return (
                <div
                  key={option?.id ?? `${displayValue}-${idx}`}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onMouseDown={(e) => { e.preventDefault(); onItemSelect(option); }}
                >
                  {displayValue}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {editorials.length > 1 && (
        <div className="flex overflow-x-auto space-x-2 mb-4 pb-2">
          {editorials.map((editorial, index) => (
            <Button
              key={editorial.id}
              variant={activeIndex === index ? "default" : "outline"}
              className="whitespace-nowrap"
              onClick={() => onSwitchEditorial(index)}
            >
              Editorial {index + 1}
            </Button>
          ))}
        </div>
      )}

      <Card className="w-full flex flex-col h-full">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="flex gap-4 w-full">
                <div className="flex-1">
                  <Label htmlFor="date">Date (Auto-picked) <span className="text-red-500">*</span></Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={currentEditorial?.date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleFieldChangeLocal('date', e.target.value)}
                    className={errors.date ? "border-red-500" : ""}
                    readOnly={isFieldReadOnly('date')}
                    disabled={isFieldReadOnly('date')}
                  />
                  {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                </div>

                <div className="flex-1">
                  <Label htmlFor="company">Company (Search) <span className="text-red-500">*</span></Label>
                  {renderSearchableDropdown('company', apiCompanies, 'company_name', (value, option) => {
                    if (option?.id) onFieldChange('company_id', option.id);
                  })}
                  {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
                </div>

                <div className="flex-1">
                  <Label htmlFor="mediaType">Media Type <span className="text-red-500">*</span></Label>
                  {renderSearchableDropdown('mediaType', apiOnlineChannels, 'value')}
                  {errors.mediaType && <p className="text-red-500 text-sm">{errors.mediaType}</p>}
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-max space-y-4">
                  <div className="flex gap-4 min-w-max">
                    <div className="flex flex-col items-center pt-6 min-w-[40px] space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => { if (onAddEditorial) onAddEditorial(); }}
                        className="h-8 w-8 p-0 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      {editorials.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => { if (onRemoveEditorial) onRemoveEditorial(currentEditorial.id); }}
                          className="h-8 w-8 p-0 rounded-full border-2 border-dashed border-gray-300 hover:border-red-500 hover:bg-red-50"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="source">Source <span className="text-red-500">*</span></Label>
                      {renderSearchableDropdown('source', apiPublications, 'value')}
                      {errors.source && <p className="text-red-500 text-sm">{errors.source}</p>}
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="placement">Placement</Label>
                      {renderSearchableDropdown('placement', apiPlacements, 'value')}
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                      <Input
                        id="title"
                        name="title"
                        value={currentEditorial?.title ?? ''}
                        onChange={(e) => handleFieldChangeLocal('title', e.target.value)}
                        className={errors.title ? "border-red-500" : ""}
                        placeholder="Enter article title"
                      />
                      {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="printWebClips">Print/Web Clips</Label>
                      <Select
                        value={currentEditorial?.printWebClips ?? ''}
                        onValueChange={(value) => handleFieldChangeLocal('printWebClips', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {printWebClipsOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="reporter">Reporter</Label>
                      {renderSearchableDropdown('reporter', apiReporters, 'username')}
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                      {renderSearchableDropdown('country', apiCountries, 'value')}
                      {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="language">Language <span className="text-red-500">*</span></Label>
                      {renderSearchableDropdown('language', apiLanguages, 'value')}
                      {errors.language && <p className="text-red-500 text-sm">{errors.language}</p>}
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="spokesperson">Spokesperson</Label>
                      {renderSearchableDropdown('spokesperson', apiSpokespersons, 'value')}
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="ceoMediaPresence">CEO Media Presence</Label>
                      {renderSearchableDropdown('ceoMediaPresence', apiCeoMediaPresence, 'value')}
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="ceoThoughtLeadership">CEO Thought Leadership</Label>
                      {renderSearchableDropdown('ceoThoughtLeadership', apiCeoThoughtLeadership, 'value')}
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="activity">Activity</Label>
                      {renderSearchableDropdown('activity', apiActivities, 'value')}
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="circulation">Circulation</Label>
                      <Input
                        id="circulation"
                        name="circulation"
                        type="number"
                        value={(currentEditorial?.circulation ?? '').toString()}
                        onChange={(e) => handleFieldChangeLocal('circulation', parseInt(e.target.value || '0'))}
                        placeholder="Enter circulation number"
                      />
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="audienceReach">Audience Reach</Label>
                      <Input
                        id="audienceReach"
                        name="audienceReach"
                        type="number"
                        value={(currentEditorial?.audienceReach ?? '').toString()}
                        onChange={(e) => handleFieldChangeLocal('audienceReach', parseInt(e.target.value || '0'))}
                        placeholder="Enter audience reach"
                      />
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="onlineChannel">Online Channel</Label>
                      <Input
                        id="onlineChannel"
                        name="onlineChannel"
                        value={currentEditorial?.onlineChannel ?? ''}
                        onChange={(e) => handleFieldChangeLocal('onlineChannel', e.target.value)}
                        placeholder="e.g., Website"
                      />
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="sentiment">Sentiment</Label>
                      {renderSearchableDropdown('sentiment', apiSentimentKeywords, 'keyword_indicator')}
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="sentimentClassification">Sentiment Classification</Label>
                      <Input
                        id="sentimentClassification"
                        name="sentimentClassification"
                        value={currentEditorial?.sentimentClassification ?? ''}
                        onChange={(e) => handleFieldChangeLocal('sentimentClassification', e.target.value)}
                        placeholder="e.g., Positive"
                      />
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="sentimentScore">Sentiment Score</Label>
                      <Input
                        id="sentimentScore"
                        name="sentimentScore"
                        type="number"
                        min={-3}
                        max={3}
                        step={0.1}
                        value={(currentEditorial?.sentimentScore ?? '').toString()}
                        onChange={(e) => handleFieldChangeLocal('sentimentScore', parseFloat(e.target.value || '0'))}
                        placeholder="Enter score (-3 to 3)"
                      />
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="advertSpend">Advert Spend</Label>
                      <Input
                        id="advertSpend"
                        name="advertSpend"
                        type="number"
                        value={(currentEditorial?.advertSpend ?? '').toString()}
                        onChange={(e) => handleFieldChangeLocal('advertSpend', parseInt(e.target.value || '0'))}
                        placeholder="Enter amount"
                      />
                    </div>

                    <div className="min-w-[160px]">
                      <Label htmlFor="pageSize">Page Size</Label>
                      {renderSearchableDropdown('pageSize', apiPageSizes, 'value')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 bg-gray-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="analystNote" className="flex items-center mb-2">
                  Analyst Note
                  {isFieldReadOnly('analystNote') && <span className="ml-2 text-xs text-gray-500">(Read-only)</span>}
                </Label>
                <Textarea
                  id="analystNote"
                  name="analystNote"
                  value={currentEditorial?.analystNote ?? ''}
                  onChange={(e) => handleFieldChangeLocal('analystNote', e.target.value)}
                  className="h-32 resize-none"
                  placeholder="Add analyst notes here..."
                  readOnly={isFieldReadOnly('analystNote')}
                  disabled={isFieldReadOnly('analystNote')}
                />
              </div>

              <div>
                <Label htmlFor="supervisorNote" className="flex items-center mb-2">
                  Supervisor Note
                  {isFieldReadOnly('supervisorNote') && <span className="ml-2 text-xs text-gray-500">(Read-only)</span>}
                </Label>
                <Textarea
                  id="supervisorNote"
                  name="supervisorNote"
                  value={currentEditorial?.supervisorNote ?? ''}
                  onChange={(e) => handleFieldChangeLocal('supervisorNote', e.target.value)}
                  className="h-32 resize-none"
                  placeholder="Add supervisor notes here..."
                  readOnly={isFieldReadOnly('supervisorNote')}
                  disabled={isFieldReadOnly('supervisorNote')}
                />
              </div>

              <div>
                <Label htmlFor="adminNote" className="flex items-center mb-2">
                  Admin Note
                  {isFieldReadOnly('adminNote') && <span className="ml-2 text-xs text-gray-500">(Read-only)</span>}
                </Label>
                <Textarea
                  id="adminNote"
                  name="adminNote"
                  value={currentEditorial?.adminNote ?? ''}
                  onChange={(e) => handleFieldChangeLocal('adminNote', e.target.value)}
                  className="h-32 resize-none"
                  placeholder="Add admin notes here..."
                  readOnly={isFieldReadOnly('adminNote')}
                  disabled={isFieldReadOnly('adminNote')}
                />
              </div>
            </div>

            {onReviewAction && (
              <div className="flex justify-center space-x-4 mt-6 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => onReviewAction('reject')}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-2"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => onReviewAction('approve')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                >
                  Approve
                </Button>
              </div>
            )}

            {onReviewAction && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                Review the content above and add your notes before approving or rejecting.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorialForm;
