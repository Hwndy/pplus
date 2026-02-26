import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Plus, ClipboardCopy, Save, Send, Loader2, ArrowLeft, MinusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';

// Axios interceptor
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interfaces
interface Company {
  id: number;
  company_name: string;
}

interface SentimentKeyword {
  id: number;
  keyword_indicator: string;
}

export interface Editorial {
  id?: number;
  date: string;
  online_channel: string;
  source: string;
  company_id?: number;
  media_type: string;
  audience_reach?: number;
  placement: string;
  language: string;
  ceo_thought_leadership: string;
  title: string;
  print_web_clips: string;
  reporter: string;
  country: string;
  spokesperson: string;
  activity: string;
  sentiment: string;
  sentiment_keyword_indicator_id?: number;
  advert_spend?: number;
  circulation?: number;
  page_size?: string;
  page_number?: string;
  analyst_note?: string;
  supervisor_note?: string;
  admin_note?: string;
  is_deleted?: boolean;
  filename?: string | null;
  original_name?: string | null;
  file_path?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  file_type?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// ──────────────────────────────────────────────────────────────────────
// SearchableSelect Component (with proper scrolling)
// ──────────────────────────────────────────────────────────────────────
interface SearchableSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: { value: string; label: string }[];
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onValueChange,
  placeholder = 'Select an option',
  options,
  loading = false,
  disabled = false,
  className,
}) => {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
      setSearch('');
    }
  };

  const filtered = useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(lower));
  }, [options, search]);

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      onOpenChange={handleOpenChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[var(--radix-select-content-available-height)]">
        <div className="flex items-center border-b px-3 py-2" onClick={(e) => e.stopPropagation()}>
          <Input
            ref={inputRef}
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 border-0 focus-visible:ring-0"
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </div>
        )}
        <ScrollArea className="h-[250px]">
          {filtered.length === 0 && !loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found
            </div>
          ) : (
            filtered.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))
          )}
          <ScrollBar />
        </ScrollArea>
      </SelectContent>
    </Select>
  );
};

// ──────────────────────────────────────────────────────────────────────
// EditorialForm Component
// ──────────────────────────────────────────────────────────────────────
interface EditorialFormProps {
  editorials: Editorial[];
  activeIndex: number;
  errors: Record<string, string>;
  apiCompanies: Company[];
  userRole: string;
  apiSpokespersons: string[];
  apiPlacements: string[];
  apiOnlineChannels: string[];
  apiPublications: string[];
  apiCeoThoughtLeadership: string[];
  apiLanguages: string[];
  apiCountries: string[];
  apiActivities: string[];
  apiPageSizes: string[];
  apiMediaTypes: string[];
  apiSentimentKeywords: SentimentKeyword[];
  apiReporters: string[];
  onEditorialChange: (editorials: Editorial[]) => void;
  onSwitchEditorial: (index: number) => void;
  onFieldChange: (index: number, name: string, value: string | number) => void;
  onClearError: (fieldName: string) => void;
  onReviewAction?: (action: 'approve' | 'reject') => void;
  isReviewMode: boolean;
}

const EditorialForm: React.FC<EditorialFormProps> = ({
  editorials,
  activeIndex,
  errors,
  apiCompanies = [],
  userRole,
  onEditorialChange,
  onSwitchEditorial,
  onFieldChange,
  onClearError,
  onReviewAction,
  isReviewMode,
  apiSpokespersons = [],
  apiPlacements = [],
  apiOnlineChannels = [],
  apiPublications = [],
  apiCeoThoughtLeadership = [],
  apiLanguages = [],
  apiCountries = [],
  apiActivities = [],
  apiPageSizes = [],
  apiMediaTypes = [],
  apiSentimentKeywords = [],
  apiReporters = [],
}) => {
  const safeEditorials = Array.isArray(editorials) ? editorials : [];
  const currentEditorial: Editorial = safeEditorials[activeIndex] || {
    date: '',
    online_channel: '',
    source: '',
    media_type: '',
    placement: '',
    language: '',
    ceo_thought_leadership: '',
    title: '',
    print_web_clips: '',
    reporter: '',
    country: '',
    spokesperson: '',
    activity: '',
    sentiment: '',
    audience_reach: 0,
    advert_spend: 0,
    circulation: 0,
  };

  const isFieldReadOnly = (fieldName: string): boolean => {
    if (isReviewMode) return true;
    // if (fieldName === 'analyst_note' && userRole !== 'Analyst') return true;
    if (fieldName === 'supervisor_note' && userRole !== 'Supervisor') return true;
    if (fieldName === 'admin_note' && userRole !== 'Admin') return true;
    return false;
  };

  // Add a new blank row at the end
  const handleAddRow = () => {
    const newEditorial: Editorial = {
      date: currentEditorial.date || new Date().toISOString().split('T')[0],
      online_channel: '',
      source: '',
      company_id: currentEditorial.company_id,
      media_type: currentEditorial.media_type || '',
      audience_reach: 0,
      placement: '',
      language: '',
      ceo_thought_leadership: '',
      title: '',
      print_web_clips: '',
      reporter: '',
      country: '',
      spokesperson: '',
      activity: '',
      sentiment: '',
      sentiment_keyword_indicator_id: undefined,
      advert_spend: 0,
      circulation: 0,
      page_size: '',
      page_number: '',
      analyst_note: '',
      supervisor_note: '',
      admin_note: '',
    };
    onEditorialChange([...safeEditorials, newEditorial]);
    onSwitchEditorial(safeEditorials.length);
  };

  // Clone a specific row (insert right after it)
  const handleCloneRow = (index: number) => {
    const cloned = { ...safeEditorials[index], id: Date.now() + Math.random() };
    const newEditorials = [...safeEditorials];
    newEditorials.splice(index + 1, 0, cloned);
    onEditorialChange(newEditorials);
    onSwitchEditorial(index + 1);
  };

  // Remove a specific row (prevent deleting the last one)
  const handleRemoveRow = (indexToRemove: number) => {
    if (safeEditorials.length <= 1) return;
    const newEditorials = safeEditorials.filter((_, i) => i !== indexToRemove);
    onEditorialChange(newEditorials);
    if (activeIndex >= indexToRemove && activeIndex > 0) {
      onSwitchEditorial(activeIndex - 1);
    }
  };

  const SENTIMENT_OPTIONS = ['Positive', 'Negative', 'Neutral'];

  return (
    <div className="w-full">
      <Card className="w-full flex flex-col h-full">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="flex gap-4 w-full">
                <div className="flex-1">
                  <Label htmlFor="date">
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={currentEditorial.date?.split('T')[0] || ''}
                    onChange={(e) => onFieldChange(activeIndex, 'date', e.target.value)}
                    className={errors.date ? 'border-red-500' : ''}
                    readOnly={isFieldReadOnly('date')}
                    disabled={isFieldReadOnly('date')}
                  />
                  {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                </div>
                <div className="flex-1">
                  <Label htmlFor="company">
                    Company <span className="text-red-500">*</span>
                  </Label>
                  <SearchableSelect
                    value={currentEditorial.company_id?.toString() || ''}
                    onValueChange={(v) => onFieldChange(activeIndex, 'company_id', parseInt(v))}
                    placeholder="Select a company"
                    options={apiCompanies.map((c) => ({
                      value: c.id.toString(),
                      label: c.company_name,
                    }))}
                    disabled={isFieldReadOnly('company_id')}
                    className={errors.company_id ? 'border-red-500' : ''}
                  />
                  {errors.company_id && <p className="text-red-500 text-sm">{errors.company_id}</p>}
                </div>
                <div className="flex-1">
                  <Label htmlFor="media_type">Media Type</Label>
                  <SearchableSelect
                    value={currentEditorial.media_type || ''}
                    onValueChange={(v) => onFieldChange(activeIndex, 'media_type', v)}
                    placeholder="Select media type"
                    options={apiMediaTypes.map((t) => ({ value: t, label: t }))}
                    disabled={isFieldReadOnly('media_type')}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-max space-y-6">
                  {safeEditorials.length > 0 ? (
                    safeEditorials.map((editorial, index) => (
                      <div key={editorial.id || index} className="flex gap-4 min-w-max items-center">
                        {/* Action Buttons - Horizontal line */}
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCloneRow(index)}
                            className="h-8 w-8 p-0"
                            title="Clone this row"
                          >
                            <ClipboardCopy className="h-4 w-4" />
                          </Button>

                          {index === safeEditorials.length - 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddRow}
                              className="h-8 w-8 p-0"
                              title="Add new row"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}

                          {safeEditorials.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveRow(index)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              title="Remove this row"
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {/* Source */}
                        <div className="min-w-[160px]">
                          {index === 0 && (
                            <Label htmlFor="source">
                              Source <span className="text-red-500">*</span>
                            </Label>
                          )}
                          <SearchableSelect
                            value={editorial.source || ''}
                            onValueChange={(v) => onFieldChange(index, 'source', v)}
                            placeholder="Select source"
                            options={apiPublications.map((p) => ({ value: p, label: p }))}
                            className={index === 0 && errors.source ? 'border-red-500' : ''}
                          />
                          {index === 0 && errors.source && <p className="text-red-500 text-sm">{errors.source}</p>}
                        </div>

                        {/* Placement */}
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="placement">Placement</Label>}
                          <SearchableSelect
                            value={editorial.placement || ''}
                            onValueChange={(v) => onFieldChange(index, 'placement', v)}
                            placeholder="Select placement"
                            options={apiPlacements.map((p) => ({ value: p, label: p }))}
                          />
                        </div>

                        {/* Title */}
                        <div className="min-w-[160px]">
                          {index === 0 && (
                            <Label htmlFor="title">
                              Title <span className="text-red-500">*</span>
                            </Label>
                          )}
                          <Input
                            value={editorial.title || ''}
                            onChange={(e) => onFieldChange(index, 'title', e.target.value)}
                            className={index === 0 && errors.title ? 'border-red-500' : ''}
                            placeholder="Enter article title"
                          />
                          {index === 0 && errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                        </div>

                        {/* Print/Web Clips */}
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="print_web_clips">Print/Web Clips (URL)</Label>}
                          <Input
                            value={editorial.print_web_clips || ''}
                            onChange={(e) => onFieldChange(index, 'print_web_clips', e.target.value)}
                            placeholder="Enter URL"
                          />
                        </div>

                        {/* Reporter */}
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="reporter">Reporter</Label>}
                          <SearchableSelect
                            value={editorial.reporter || ''}
                            onValueChange={(v) => onFieldChange(index, 'reporter', v)}
                            placeholder="Select reporter"
                            options={apiReporters.map((r) => ({ value: r, label: r }))}
                          />
                        </div>

                        {/* Country */}
                        <div className="min-w-[160px]">
                          {index === 0 && (
                            <Label htmlFor="country">
                              Country <span className="text-red-500">*</span>
                            </Label>
                          )}
                          <SearchableSelect
                            value={editorial.country || ''}
                            onValueChange={(v) => onFieldChange(index, 'country', v)}
                            placeholder="Select country"
                            options={apiCountries.map((c) => ({ value: c, label: c }))}
                          />
                          {index === 0 && errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
                        </div>

                        {/* Language */}
                        <div className="min-w-[160px]">
                          {index === 0 && (
                            <Label htmlFor="language">
                              Language <span className="text-red-500">*</span>
                            </Label>
                          )}
                          <SearchableSelect
                            value={editorial.language || ''}
                            onValueChange={(v) => onFieldChange(index, 'language', v)}
                            placeholder="Select language"
                            options={apiLanguages.map((l) => ({ value: l, label: l }))}
                          />
                          {index === 0 && errors.language && <p className="text-red-500 text-sm">{errors.language}</p>}
                        </div>

                        {/* Spokesperson */}
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="spokesperson">Spokesperson</Label>}
                          <SearchableSelect
                            value={editorial.spokesperson || ''}
                            onValueChange={(v) => onFieldChange(index, 'spokesperson', v)}
                            placeholder="Select spokesperson"
                            options={apiSpokespersons.map((s) => ({ value: s, label: s }))}
                          />
                        </div>

                        {/* CEO Thought Leadership */}
                        <div className="min-w-[160px]">
                          {index === 0 && <Label>CEO Thought Leadership</Label>}
                          <SearchableSelect
                            value={editorial.ceo_thought_leadership || ''}
                            onValueChange={(v) => onFieldChange(index, 'ceo_thought_leadership', v)}
                            placeholder="Select leadership"
                            options={apiCeoThoughtLeadership.map((o) => ({ value: o, label: o }))}
                          />
                        </div>

                        {/* Activity */}
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="activity">Activity</Label>}
                          <SearchableSelect
                            value={editorial.activity || ''}
                            onValueChange={(v) => onFieldChange(index, 'activity', v)}
                            placeholder="Select activity"
                            options={apiActivities.map((a) => ({ value: a, label: a }))}
                          />
                        </div>

                        {/* Circulation */}
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="circulation">Circulation</Label>}
                          <Input
                            type="number"
                            value={editorial.circulation?.toString() || ''}
                            onChange={(e) => onFieldChange(index, 'circulation', parseInt(e.target.value) || 0)}
                            placeholder="Enter number"
                          />
                        </div>

                        {/* Audience Reach */}
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="audience_reach">Audience Reach</Label>}
                          <Input
                            type="number"
                            value={editorial.audience_reach?.toString() || ''}
                            onChange={(e) => onFieldChange(index, 'audience_reach', parseInt(e.target.value) || 0)}
                            placeholder="Enter number"
                          />
                        </div>

                        {/* Online Channel */}
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="online_channel">Online Channel</Label>}
                          <SearchableSelect
                            value={editorial.online_channel || ''}
                            onValueChange={(v) => onFieldChange(index, 'online_channel', v)}
                            placeholder="Select channel"
                            options={apiOnlineChannels.map((c) => ({ value: c, label: c }))}
                          />
                        </div>

                        {/* Sentiment */}
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="sentiment">Sentiment</Label>}
                          <Select
                            value={editorial.sentiment || ''}
                            onValueChange={(v) => onFieldChange(index, 'sentiment', v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select sentiment" />
                            </SelectTrigger>
                            <SelectContent>
                              {SENTIMENT_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Sentiment Keyword */}
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="sentiment_keyword_indicator_id">Sentiment Keyword</Label>}
                          <SearchableSelect
                            value={editorial.sentiment_keyword_indicator_id?.toString() || ''}
                            onValueChange={(v) => onFieldChange(index, 'sentiment_keyword_indicator_id', parseInt(v))}
                            placeholder="Select keyword"
                            options={apiSentimentKeywords.map((kw) => ({
                              value: kw.id.toString(),
                              label: kw.keyword_indicator,
                            }))}
                          />
                        </div>

                        {/* Advert Spend */}
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="advert_spend">Advert Spend</Label>}
                          <Input
                            type="number"
                            value={editorial.advert_spend?.toString() || ''}
                            onChange={(e) => onFieldChange(index, 'advert_spend', parseInt(e.target.value) || 0)}
                            placeholder="Enter amount"
                          />
                        </div>

                        {/* Page Size */}
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="page_size">Page Size</Label>}
                          <SearchableSelect
                            value={editorial.page_size || ''}
                            onValueChange={(v) => onFieldChange(index, 'page_size', v)}
                            placeholder="Select page size"
                            options={apiPageSizes.map((s) => ({ value: s, label: s }))}
                          />
                        </div>

                        {/* Page Number */}
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="page_number">Page Number</Label>}
                          <Input
                            value={editorial.page_number || ''}
                            onChange={(e) => onFieldChange(index, 'page_number', e.target.value)}
                            placeholder="Enter page number"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">No editorials available</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="border-t border-gray-300 bg-gray-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="analyst_note" className="flex items-center mb-2">
                  Analyst Note
                </Label>
                <Textarea
                  id="analyst_note"
                  name="analyst_note"
                  value={currentEditorial.analyst_note || ''}
                  onChange={(e) => onFieldChange(activeIndex, 'analyst_note', e.target.value)}
                  className="h-32 resize-none"
                  placeholder="Add analyst notes here..."
                  // readOnly={isFieldReadOnly('analyst_note')}
                  disabled={isFieldReadOnly('analyst_note')}
                />
              </div>
            </div>
            {onReviewAction && (
              <div className="flex justify-center space-x-4 mt-6 pt-4 border-t border-gray-200">
                <Button onClick={() => onReviewAction('reject')} variant="destructive">
                  Reject
                </Button>
                <Button onClick={() => onReviewAction('approve')} className="bg-green-600 hover:bg-green-700">
                  Approve
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────
// Main Page Component (with Back button and proper edit handling)
// ──────────────────────────────────────────────────────────────────────
const CreateEditorialPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const reviewId = searchParams.get('review');
  const isReviewMode = !!reviewId;
  const BASE_URL = 'https://pplus-7q0p.onrender.com/api/v1';
  const { user, isSessionValidated } = useAuth();

  // Safely extract navigation state
  const locationState = location.state as { editorialData?: any } | null;
  const isEditMode = !!locationState?.editorialData;

  const [editorials, setEditorials] = useState<Editorial[]>(() => {
    if (isEditMode && locationState?.editorialData) {
      const data = locationState.editorialData;

      // Preferred: API returns { editorials: [...] } array
      if (Array.isArray(data.editorials) && data.editorials.length > 0) {
        return data.editorials.map((e: any) => ({
          ...e,
          date: data.date || new Date().toISOString().split('T')[0],
          company_id: data.company_id,
          media_type: data.media_type || '',
          analyst_note: data.analyst_note || '',
          supervisor_note: data.supervisor_note || '',
          admin_note: data.admin_note || '',
        }));
      }

      // FIXED: Fallback for single editorial object from GET /editorials/:id
      return [{
        id: data.id,
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        online_channel: data.online_channel || '',
        source: data.source || '',
        company_id: data.company?.id ?? data.company_id, // Extract from nested company object
        media_type: data.media_type || '',
        audience_reach: data.audience_reach || 0,
        placement: data.placement || '',
        language: data.language || '',
        ceo_thought_leadership: data.ceo_thought_leadership || '',
        title: data.title || '',
        print_web_clips: data.print_web_clips || '',
        reporter: data.reporter || '',
        country: data.country || '',
        spokesperson: data.spokesperson || '',
        activity: data.activity || '',
        sentiment: data.sentiment || '',
        sentiment_keyword_indicator_id: data.sentiment_keyword_indicator?.id ?? data.sentiment_keyword_indicator_id,
        advert_spend: data.advert_spend || 0,
        circulation: data.circulation || 0,
        page_size: data.page_size || '',
        page_number: data.page_number || '',
        analyst_note: data.analyst_note || '',
        supervisor_note: data.supervisor_note || '',
        admin_note: data.admin_note || '',
        is_deleted: data.is_deleted,
        filename: data.filename,
        original_name: data.original_name,
        file_path: data.file_path,
        file_size: data.file_size,
        mime_type: data.mime_type,
        file_type: data.file_type,
      }];
    }

    // Default new entry
    return [{
      date: new Date().toISOString().split('T')[0],
      online_channel: '',
      source: '',
      company_id: undefined,
      media_type: '',
      audience_reach: 0,
      placement: '',
      language: '',
      ceo_thought_leadership: '',
      title: '',
      print_web_clips: '',
      reporter: '',
      country: '',
      spokesperson: '',
      activity: '',
      sentiment: '',
      sentiment_keyword_indicator_id: undefined,
      advert_spend: 0,
      circulation: 0,
      page_size: '',
      page_number: '',
      analyst_note: '',
      supervisor_note: '',
      admin_note: '',
    }];
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionType, setSubmissionType] = useState('');
  const [loading, setLoading] = useState(true);

  // API State
  const [apiSpokespersons, setApiSpokespersons] = useState<string[]>([]);
  const [apiPlacements, setApiPlacements] = useState<string[]>([]);
  const [apiOnlineChannels, setApiOnlineChannels] = useState<string[]>([]);
  const [apiPublications, setApiPublications] = useState<string[]>([]);
  const [apiCeoThoughtLeadership, setApiCeoThoughtLeadership] = useState<string[]>([]);
  const [apiLanguages, setApiLanguages] = useState<string[]>([]);
  const [apiCountries, setApiCountries] = useState<string[]>([]);
  const [apiActivities, setApiActivities] = useState<string[]>([]);
  const [apiPageSizes, setApiPageSizes] = useState<string[]>([]);
  const [apiMediaTypes, setApiMediaTypes] = useState<string[]>([]);
  const [apiSentimentKeywords, setApiSentimentKeywords] = useState<SentimentKeyword[]>([]);
  const [apiCompanies, setApiCompanies] = useState<Company[]>([]);
  const [apiReporters, setApiReporters] = useState<string[]>([]);

  useEffect(() => {
    if (isSessionValidated) {
      const fetchDropdownOptions = async () => {
        setLoading(true);
        try {
          const [
            spokespersonRes,
            placementRes,
            onlineChannelRes,
            publicationRes,
            ceoThoughtLeadershipRes,
            languageRes,
            countryRes,
            activityRes,
            pageSizeRes,
            mediaTypeRes,
            sentimentKeywordRes,
            companyRes,
            reporterRes,
          ] = await Promise.all([
            axios.get(`${BASE_URL}/data-parameters/category/SpokesPerson`),
            axios.get(`${BASE_URL}/data-parameters/category/Placement`),
            axios.get(`${BASE_URL}/data-parameters/category/Online_Channel`),
            axios.get(`${BASE_URL}/data-parameters/category/Publications`),
            axios.get(`${BASE_URL}/data-parameters/category/CEO_Thought_Leadership`),
            axios.get(`${BASE_URL}/data-parameters/category/Language`),
            axios.get(`${BASE_URL}/data-parameters/category/Country`),
            axios.get(`${BASE_URL}/data-parameters/category/Activities`),
            axios.get(`${BASE_URL}/data-parameters/category/Page_Size`),
            axios.get(`${BASE_URL}/data-parameters/category/Media_Type`),
            axios.get(`${BASE_URL}/sentiment-keyword-indicators/?limit=1000`),
            axios.get(`${BASE_URL}/companies/?limit=1000`),
            axios.get(`${BASE_URL}/data-parameters/category/Reporter`),
          ]);

          setApiSpokespersons(spokespersonRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiPlacements(placementRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiOnlineChannels(onlineChannelRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiPublications(publicationRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiCeoThoughtLeadership(ceoThoughtLeadershipRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiLanguages(languageRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiCountries(countryRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiActivities(activityRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiPageSizes(pageSizeRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiMediaTypes(mediaTypeRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiSentimentKeywords(sentimentKeywordRes.data?.data?.data || []);
          setApiCompanies(companyRes.data?.data?.data || []);
          setApiReporters(reporterRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
        } catch (err) {
          console.error('API fetch error:', err);
          toast({
            title: 'Failed to load options',
            description: `Error: ${err.response?.data?.message || err.message}`,
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      };
      fetchDropdownOptions();
    }
  }, [isSessionValidated, toast]);

  const validateForm = (data: Editorial) => {
    const newErrors: Record<string, string> = {};
    if (!data.date) newErrors.date = 'Date is required.';
    if (!data.source) newErrors.source = 'Source is required.';
    if (!data.company_id) newErrors.company_id = 'Company is required.';
    if (!data.title) newErrors.title = 'Title is required.';
    if (!data.country) newErrors.country = 'Country is required.';
    if (!data.language) newErrors.language = 'Language is required.';
    return newErrors;
  };

  const handleEditorialChange = (newEditorials: Editorial[]) => {
    setEditorials(newEditorials);
  };

  const handleFieldChange = (index: number, name: string, value: string | number) => {
    const updatedEditorials = [...editorials];
    updatedEditorials[index] = {
      ...updatedEditorials[index],
      [name]: value,
    };
    setEditorials(updatedEditorials);
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleClearError = (fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const currentEditorial = editorials[activeIndex];

  // FIXED: Correct payload structure for create vs update
  const handleSubmit = async (status: 'draft' | 'send') => {
    const validationErrors = validateForm(currentEditorial);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmissionType(status);

    try {
      const basePayload = {
        date: editorials[activeIndex].date,
        company_id: editorials[activeIndex].company_id,
        media_type: editorials[activeIndex].media_type,
        ...(user?.role === 'Analyst' && { analyst_note: editorials[activeIndex].analyst_note || '' }),
        ...(user?.role === 'Supervisor' && { supervisor_note: editorials[activeIndex].supervisor_note || '' }),
        ...(user?.role === 'Admin' && { admin_note: editorials[activeIndex].admin_note || '' }),
      };

      let payload;
      let url;
      let method;

      if (isEditMode && currentEditorial.id) {
        // UPDATE: Send flat fields only (no 'editorials' array)
        url = `${BASE_URL}/editorials/update/${currentEditorial.id}`;
        method = 'PUT';

        payload = {
          ...basePayload,
          online_channel: currentEditorial.online_channel,
          source: currentEditorial.source,
          audience_reach: currentEditorial.audience_reach,
          placement: currentEditorial.placement,
          title: currentEditorial.title,
          reporter: currentEditorial.reporter,
          country: currentEditorial.country,
          spokesperson: currentEditorial.spokesperson,
          activity: currentEditorial.activity,
          sentiment: currentEditorial.sentiment,
          sentiment_keyword_indicator_id: currentEditorial.sentiment_keyword_indicator_id,
          advert_spend: currentEditorial.advert_spend,
          circulation: currentEditorial.circulation,
          page_size: currentEditorial.page_size,
          page_number: currentEditorial.page_number,
          language: currentEditorial.language,
          ceo_thought_leadership: currentEditorial.ceo_thought_leadership,
          print_web_clips: currentEditorial.print_web_clips,
        };
      } else {
        // CREATE: Send batch format with 'editorials' array
        url = `${BASE_URL}/editorials/create`;
        method = 'POST';

        payload = {
          ...basePayload,
          editorials: editorials.map((e) => ({
            online_channel: e.online_channel,
            source: e.source,
            audience_reach: e.audience_reach,
            placement: e.placement,
            title: e.title,
            reporter: e.reporter,
            country: e.country,
            spokesperson: e.spokesperson,
            activity: e.activity,
            sentiment: e.sentiment,
            sentiment_keyword_indicator_id: e.sentiment_keyword_indicator_id,
            advert_spend: e.advert_spend,
            circulation: e.circulation,
            page_size: e.page_size,
            page_number: e.page_number,
            language: e.language,
            ceo_thought_leadership: e.ceo_thought_leadership,
            print_web_clips: e.print_web_clips,
            filename: e.filename,
            original_name: e.original_name,
            file_path: e.file_path,
            file_size: e.file_size,
            mime_type: e.mime_type,
            file_type: e.file_type,
          })),
        };
      }

      await axios({
        method,
        url,
        data: payload,
      });

      toast({
        title: 'Success',
        description: isEditMode ? 'Editorial updated successfully!' : 'Editorial created successfully!',
      });

      navigate('/dashboard/editorial');
    } catch (err: any) {
      toast({
        title: 'Submission failed',
        description: Array.isArray(err.response?.data?.message)
          ? err.response.data.message.map((e: any) => e.message).join('; ')
          : err.response?.data?.message || err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewAction = async (action: 'approve' | 'reject') => {
    setIsSubmitting(true);
    setSubmissionType(action);
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      await axios.patch(`${BASE_URL}/editorials/${currentEditorial.id}/status`, { status: newStatus });
      toast({ title: 'Success', description: `Editorial status updated to ${newStatus}.` });
      navigate('/editorials');
    } catch (err: any) {
      toast({
        title: 'Failed to update status',
        description: Array.isArray(err.response?.data?.message)
          ? err.response.data.message.map((e: any) => e.message).join('; ')
          : err.response?.data?.message || err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate(-1);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            {isReviewMode ? 'Review Editorial' : isEditMode ? 'Edit Editorial' : 'Create Editorial'}
          </h2>
        </div>
      </div>

      <div className="w-full h-full flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Loading...</p>
          </div>
        ) : (
          <EditorialForm
            editorials={editorials}
            activeIndex={activeIndex}
            errors={errors}
            apiCompanies={apiCompanies}
            userRole={(user?.role as string) || ''}
            onEditorialChange={handleEditorialChange}
            onSwitchEditorial={setActiveIndex}
            onFieldChange={handleFieldChange}
            onClearError={handleClearError}
            onReviewAction={isReviewMode ? handleReviewAction : undefined}
            isReviewMode={isReviewMode}
            apiSpokespersons={apiSpokespersons}
            apiPlacements={apiPlacements}
            apiOnlineChannels={apiOnlineChannels}
            apiPublications={apiPublications}
            apiCeoThoughtLeadership={apiCeoThoughtLeadership}
            apiLanguages={apiLanguages}
            apiCountries={apiCountries}
            apiActivities={apiActivities}
            apiPageSizes={apiPageSizes}
            apiMediaTypes={apiMediaTypes}
            apiSentimentKeywords={apiSentimentKeywords}
            apiReporters={apiReporters}
          />
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        {!isReviewMode && (
          <>
            <Button type="button" variant="outline" onClick={() => handleSubmit('draft')} disabled={isSubmitting}>
              {isSubmitting && submissionType === 'draft' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save as Draft
                </>
              )}
            </Button>
            <Button type="button" onClick={() => handleSubmit('send')} disabled={isSubmitting}>
              {isSubmitting && submissionType === 'send' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Save & Send for Approval
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateEditorialPage;