import React, { useState, useEffect } from 'react';
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
import { Plus, Copy, Save, Send, Loader2, ArrowLeft, MinusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';

// Set up axios interceptor to add token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interface for API data structures
interface Company {
  id: number;
  company_name: string;
}

interface SentimentKeyword {
  id: number;
  keyword_indicator: string;
}

// Updated Editorial interface
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
  ceo_media_presence: string;
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
  apiCeoMediaPresence: string[];
  apiCeoThoughtLeadership: string[];
  apiLanguages: string[];
  apiCountries: string[];
  apiActivities: string[];
  apiPageSizes: string[];
  apiMediaTypes: string[];
  apiSentimentKeywords: SentimentKeyword[];
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
  apiCeoMediaPresence = [],
  apiCeoThoughtLeadership = [],
  apiLanguages = [],
  apiCountries = [],
  apiActivities = [],
  apiPageSizes = [],
  apiMediaTypes = [],
  apiSentimentKeywords = [],
}) => {
  // Ensure editorials is an array
  const safeEditorials = Array.isArray(editorials) ? editorials : [];
  const currentEditorial = safeEditorials[activeIndex] || {};

  const isFieldReadOnly = (fieldName: string): boolean => {
    if (isReviewMode) return true;
    if (fieldName === 'analyst_note' && userRole !== 'Analyst') return true;
    if (fieldName === 'supervisor_note' && userRole !== 'Supervisor') return true;
    if (fieldName === 'admin_note' && userRole !== 'Admin') return true;
    return false;
  };

  const handleAddRow = () => {
    const newEditorial: Editorial = {
      ...currentEditorial,
      id: Date.now() + Math.random(),
      title: '',
      source: '',
      placement: '',
      print_web_clips: '',
      reporter: '',
      spokesperson: '',
      ceo_media_presence: '',
      ceo_thought_leadership: '',
      activity: '',
      circulation: 0,
      audience_reach: 0,
      online_channel: '',
      sentiment: '',
      sentiment_keyword_indicator_id: undefined,
      advert_spend: 0,
      page_size: '',
      analyst_note: '',
      supervisor_note: '',
      admin_note: '',
    };
    onEditorialChange([...safeEditorials, newEditorial]);
  };

  const handleRemoveRow = (indexToRemove: number) => {
    if (safeEditorials.length > 1) {
      const newEditorials = safeEditorials.filter((_, index) => index !== indexToRemove);
      onEditorialChange(newEditorials);
      if (activeIndex >= indexToRemove) {
        onSwitchEditorial(Math.max(0, activeIndex - 1));
      }
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
                  <Select
                    value={currentEditorial.company_id?.toString() || ''}
                    onValueChange={(value) => onFieldChange(activeIndex, 'company_id', parseInt(value))}
                    disabled={isFieldReadOnly('company_id')}
                  >
                    <SelectTrigger className={errors.company_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {apiCompanies.length > 0 ? (
                        apiCompanies.map((company) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.company_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.company_id && <p className="text-red-500 text-sm">{errors.company_id}</p>}
                </div>
                <div className="flex-1">
                  <Label htmlFor="media_type">Media Type</Label>
                  <Select
                    value={currentEditorial.media_type || ''}
                    onValueChange={(value) => onFieldChange(activeIndex, 'media_type', value)}
                    disabled={isFieldReadOnly('media_type')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select media type" />
                    </SelectTrigger>
                    <SelectContent>
                      {apiMediaTypes.length > 0 ? (
                        apiMediaTypes.map((mediaType) => (
                          <SelectItem key={mediaType} value={mediaType}>
                            {mediaType}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-max space-y-4">
                  {safeEditorials.length > 0 ? (
                    safeEditorials.map((editorial, index) => (
                      <div key={editorial.id || index} className="flex gap-4 min-w-max">
                        <div className="flex flex-col items-center pt-6 min-w-[40px]">
                          {index === safeEditorials.length - 1 ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleAddRow}
                              className="h-8 w-8 p-0 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRow(index)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && (
                            <Label htmlFor="source">
                              Source <span className="text-red-500">*</span>
                            </Label>
                          )}
                          <Select
                            value={editorial.source || ''}
                            onValueChange={(value) => onFieldChange(index, 'source', value)}
                          >
                            <SelectTrigger className={index === 0 && errors.source ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                              {apiPublications.length > 0 ? (
                                apiPublications.map((pub) => (
                                  <SelectItem key={pub} value={pub}>
                                    {pub}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          {index === 0 && errors.source && <p className="text-red-500 text-sm">{errors.source}</p>}
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="placement">Placement</Label>}
                          <Select
                            value={editorial.placement || ''}
                            onValueChange={(value) => onFieldChange(index, 'placement', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select placement" />
                            </SelectTrigger>
                            <SelectContent>
                              {apiPlacements.length > 0 ? (
                                apiPlacements.map((placement) => (
                                  <SelectItem key={placement} value={placement}>
                                    {placement}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && (
                            <Label htmlFor="title">
                              Title <span className="text-red-500">*</span>
                            </Label>
                          )}
                          <Input
                            id="title"
                            name="title"
                            value={editorial.title || ''}
                            onChange={(e) => onFieldChange(index, 'title', e.target.value)}
                            className={index === 0 && errors.title ? 'border-red-500' : ''}
                            placeholder="Enter article title"
                          />
                          {index === 0 && errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="print_web_clips">Print/Web Clips (URL)</Label>}
                          <Input
                            id="print_web_clips"
                            name="print_web_clips"
                            value={editorial.print_web_clips || ''}
                            onChange={(e) => onFieldChange(index, 'print_web_clips', e.target.value)}
                            placeholder="Enter URL"
                          />
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="reporter">Reporter</Label>}
                          <Input
                            id="reporter"
                            name="reporter"
                            value={editorial.reporter || ''}
                            onChange={(e) => onFieldChange(index, 'reporter', e.target.value)}
                            placeholder="Enter reporter name"
                          />
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && (
                            <Label htmlFor="country">
                              Country <span className="text-red-500">*</span>
                            </Label>
                          )}
                          <Select
                            value={editorial.country || ''}
                            onValueChange={(value) => onFieldChange(index, 'country', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {apiCountries.length > 0 ? (
                                apiCountries.map((country) => (
                                  <SelectItem key={country} value={country}>
                                    {country}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          {index === 0 && errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && (
                            <Label htmlFor="language">
                              Language <span className="text-red-500">*</span>
                            </Label>
                          )}
                          <Select
                            value={editorial.language || ''}
                            onValueChange={(value) => onFieldChange(index, 'language', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              {apiLanguages.length > 0 ? (
                                apiLanguages.map((language) => (
                                  <SelectItem key={language} value={language}>
                                    {language}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          {index === 0 && errors.language && <p className="text-red-500 text-sm">{errors.language}</p>}
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="spokesperson">Spokesperson</Label>}
                          <Select
                            value={editorial.spokesperson || ''}
                            onValueChange={(value) => onFieldChange(index, 'spokesperson', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select spokesperson" />
                            </SelectTrigger>
                            <SelectContent>
                              {apiSpokespersons.length > 0 ? (
                                apiSpokespersons.map((spokesperson) => (
                                  <SelectItem key={spokesperson} value={spokesperson}>
                                    {spokesperson}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="ceo_media_presence">CEO Media Presence</Label>}
                          <Select
                            value={editorial.ceo_media_presence || ''}
                            onValueChange={(value) => onFieldChange(index, 'ceo_media_presence', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select presence" />
                            </SelectTrigger>
                            <SelectContent>
                              {apiCeoMediaPresence.length > 0 ? (
                                apiCeoMediaPresence.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="ceo_thought_leadership">CEO Thought Leadership</Label>}
                          <Select
                            value={editorial.ceo_thought_leadership || ''}
                            onValueChange={(value) => onFieldChange(index, 'ceo_thought_leadership', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select leadership" />
                            </SelectTrigger>
                            <SelectContent>
                              {apiCeoThoughtLeadership.length > 0 ? (
                                apiCeoThoughtLeadership.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="activity">Activity</Label>}
                          <Select
                            value={editorial.activity || ''}
                            onValueChange={(value) => onFieldChange(index, 'activity', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select activity" />
                            </SelectTrigger>
                            <SelectContent>
                              {apiActivities.length > 0 ? (
                                apiActivities.map((activity) => (
                                  <SelectItem key={activity} value={activity}>
                                    {activity}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="circulation">Circulation</Label>}
                          <Input
                            id="circulation"
                            name="circulation"
                            type="number"
                            value={editorial.circulation?.toString() || ''}
                            onChange={(e) => onFieldChange(index, 'circulation', parseInt(e.target.value) || 0)}
                            placeholder="Enter number"
                          />
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="audience_reach">Audience Reach</Label>}
                          <Input
                            id="audience_reach"
                            name="audience_reach"
                            type="number"
                            value={editorial.audience_reach?.toString() || ''}
                            onChange={(e) => onFieldChange(index, 'audience_reach', parseInt(e.target.value) || 0)}
                            placeholder="Enter number"
                          />
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="online_channel">Online Channel</Label>}
                          <Select
                            value={editorial.online_channel || ''}
                            onValueChange={(value) => onFieldChange(index, 'online_channel', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select channel" />
                            </SelectTrigger>
                            <SelectContent>
                              {apiOnlineChannels.length > 0 ? (
                                apiOnlineChannels.map((channel) => (
                                  <SelectItem key={channel} value={channel}>
                                    {channel}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="sentiment">Sentiment</Label>}
                          <Select
                            value={editorial.sentiment || ''}
                            onValueChange={(value) => onFieldChange(index, 'sentiment', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select sentiment" />
                            </SelectTrigger>
                            <SelectContent>
                              {SENTIMENT_OPTIONS.map((sentiment) => (
                                <SelectItem key={sentiment} value={sentiment}>
                                  {sentiment}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="sentiment_keyword_indicator_id">Sentiment Keyword</Label>}
                          <Select
                            value={editorial.sentiment_keyword_indicator_id?.toString() || ''}
                            onValueChange={(value) => onFieldChange(index, 'sentiment_keyword_indicator_id', parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select keyword" />
                            </SelectTrigger>
                            <SelectContent>
                              {apiSentimentKeywords.length > 0 ? (
                                apiSentimentKeywords.map((kw) => (
                                  <SelectItem key={kw.id} value={kw.id.toString()}>
                                    {kw.keyword_indicator}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="advert_spend">Advert Spend</Label>}
                          <Input
                            id="advert_spend"
                            name="advert_spend"
                            type="number"
                            value={editorial.advert_spend?.toString() || ''}
                            onChange={(e) => onFieldChange(index, 'advert_spend', parseInt(e.target.value) || 0)}
                            placeholder="Enter amount"
                          />
                        </div>
                        <div className="min-w-[160px]">
                          {index === 0 && <Label htmlFor="page_size">Page Size</Label>}
                          <Select
                            value={editorial.page_size || ''}
                            onValueChange={(value) => onFieldChange(index, 'page_size', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select page size" />
                            </SelectTrigger>
                            <SelectContent>
                              {apiPageSizes.length > 0 ? (
                                apiPageSizes.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="loading" disabled>
                                  Loading...
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
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
                  readOnly={isFieldReadOnly('analyst_note')}
                  disabled={isFieldReadOnly('analyst_note')}
                />
              </div>
              <div>
                <Label htmlFor="supervisor_note" className="flex items-center mb-2">
                  Supervisor Note
                </Label>
                <Textarea
                  id="supervisor_note"
                  name="supervisor_note"
                  value={currentEditorial.supervisor_note || ''}
                  onChange={(e) => onFieldChange(activeIndex, 'supervisor_note', e.target.value)}
                  className="h-32 resize-none"
                  placeholder="Add supervisor notes here..."
                  readOnly={isFieldReadOnly('supervisor_note')}
                  disabled={isFieldReadOnly('supervisor_note')}
                />
              </div>
              <div>
                <Label htmlFor="admin_note" className="flex items-center mb-2">
                  Admin Note
                </Label>
                <Textarea
                  id="admin_note"
                  name="admin_note"
                  value={currentEditorial.admin_note || ''}
                  onChange={(e) => onFieldChange(activeIndex, 'admin_note', e.target.value)}
                  className="h-32 resize-none"
                  placeholder="Add admin notes here..."
                  readOnly={isFieldReadOnly('admin_note')}
                  disabled={isFieldReadOnly('admin_note')}
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

const CreateEditorialPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!location.state?.editorialData;
  const searchParams = new URLSearchParams(location.search);
  const reviewId = searchParams.get('review');
  const isReviewMode = !!reviewId;

  const BASE_URL = 'https://backend-e79r.onrender.com/api';
  const { user, isSessionValidated } = useAuth();
  const [editorials, setEditorials] = useState<Editorial[]>([
    isEditMode && location.state?.editorialData
      ? Array.isArray(location.state.editorialData)
        ? location.state.editorialData
        : [location.state.editorialData]
      : {
          date: new Date().toISOString().split('T')[0],
          online_channel: '',
          source: '',
          company_id: undefined,
          media_type: '',
          audience_reach: 0,
          placement: '',
          language: '',
          ceo_media_presence: '',
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
          analyst_note: '',
          supervisor_note: '',
          admin_note: '',
        },
  ].filter(Boolean)); // Ensure no undefined/null entries
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
  const [apiCeoMediaPresence, setApiCeoMediaPresence] = useState<string[]>([]);
  const [apiCeoThoughtLeadership, setApiCeoThoughtLeadership] = useState<string[]>([]);
  const [apiLanguages, setApiLanguages] = useState<string[]>([]);
  const [apiCountries, setApiCountries] = useState<string[]>([]);
  const [apiActivities, setApiActivities] = useState<string[]>([]);
  const [apiPageSizes, setApiPageSizes] = useState<string[]>([]);
  const [apiMediaTypes, setApiMediaTypes] = useState<string[]>([]);
  const [apiSentimentKeywords, setApiSentimentKeywords] = useState<SentimentKeyword[]>([]);
  const [apiCompanies, setApiCompanies] = useState<Company[]>([]);

  useEffect(() => {
    if (isSessionValidated) {
      const fetchDropdownOptions = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          console.log('Token used for API calls:', token);
          const [
            spokespersonRes,
            placementRes,
            onlineChannelRes,
            publicationRes,
            ceoMediaPresenceRes,
            ceoThoughtLeadershipRes,
            languageRes,
            countryRes,
            activityRes,
            pageSizeRes,
            mediaTypeRes,
            sentimentKeywordRes,
            companyRes,
          ] = await Promise.all([
            axios.get(`${BASE_URL}/data-parameters/category/SpokesPerson`),
            axios.get(`${BASE_URL}/data-parameters/category/Placement`),
            axios.get(`${BASE_URL}/data-parameters/category/Online_Channel`),
            axios.get(`${BASE_URL}/data-parameters/category/Publications`),
            axios.get(`${BASE_URL}/data-parameters/category/CEO_Media_Presence`),
            axios.get(`${BASE_URL}/data-parameters/category/CEO_Thought_Leadership`),
            axios.get(`${BASE_URL}/data-parameters/category/Language`),
            axios.get(`${BASE_URL}/data-parameters/category/Country`),
            axios.get(`${BASE_URL}/data-parameters/category/Activities`),
            axios.get(`${BASE_URL}/data-parameters/category/Page_Size`),
            axios.get(`${BASE_URL}/data-parameters/category/Media_Type`),
            axios.get(`${BASE_URL}/sentiment-keyword-indicators/?limit=1000`),
            axios.get(`${BASE_URL}/companies/?limit=1000`),
          ]);
          setApiSpokespersons(spokespersonRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiPlacements(placementRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiOnlineChannels(onlineChannelRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiPublications(publicationRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiCeoMediaPresence(ceoMediaPresenceRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiCeoThoughtLeadership(ceoThoughtLeadershipRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiLanguages(languageRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiCountries(countryRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiActivities(activityRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiPageSizes(pageSizeRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiMediaTypes(mediaTypeRes.data?.data?.[0]?.categories?.[0]?.values?.map((v: any) => v.value) || []);
          setApiSentimentKeywords(sentimentKeywordRes.data?.data?.data || []);
          setApiCompanies(companyRes.data?.data?.data || []);
        } catch (err) {
          console.error('API fetch error:', err.response?.data || err.message);
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
    if (!data.online_channel) newErrors.online_channel = 'Online Channel is required.';
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
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleClearError = (fieldName: string) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const handleSubmit = async (status: 'draft' | 'send') => {
    const currentEditorial = editorials[activeIndex];
    const validationErrors = validateForm(currentEditorial);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmissionType(status);
    try {
      const payload = {
        date: editorials[activeIndex].date,
        company_id: editorials[activeIndex].company_id,
        media_type: editorials[activeIndex].media_type,
        ...(user?.role === 'Analyst' && { analyst_note: editorials[activeIndex].analyst_note || '' }),
        ...(user?.role === 'Supervisor' && { supervisor_note: editorials[activeIndex].supervisor_note || '' }),
        ...(user?.role === 'Admin' && { admin_note: editorials[activeIndex].admin_note || '' }),
        editorials: editorials.map((editorial) => ({
          online_channel: editorial.online_channel,
          source: editorial.source,
          audience_reach: editorial.audience_reach,
          placement: editorial.placement,
          title: editorial.title,
          reporter: editorial.reporter,
          country: editorial.country,
          spokesperson: editorial.spokesperson,
          activity: editorial.activity,
          sentiment: editorial.sentiment,
          sentiment_keyword_indicator_id: editorial.sentiment_keyword_indicator_id,
          advert_spend: editorial.advert_spend,
          circulation: editorial.circulation,
          page_size: editorial.page_size,
          language: editorial.language,
          ceo_media_presence: editorial.ceo_media_presence,
          ceo_thought_leadership: editorial.ceo_thought_leadership,
          print_web_clips: editorial.print_web_clips,
          filename: editorial.filename,
          original_name: editorial.original_name,
          file_path: editorial.file_path,
          file_size: editorial.file_size,
          mime_type: editorial.mime_type,
          file_type: editorial.file_type,
        })),
      };

      const response = isEditMode
        ? await axios.put(`${BASE_URL}/editorials/update/${currentEditorial.id}`, payload)
        : await axios.post(`${BASE_URL}/editorials/create`, payload);
      toast({
        title: 'Success',
        description: `Editorial ${isEditMode ? 'updated' : 'created'} successfully!`,
      });
      navigate('/dashboard/editorial');
    } catch (err) {
      console.error('Submission error:', err);
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
    const currentEditorial = editorials[activeIndex];
    setIsSubmitting(true);
    setSubmissionType(action);
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      await axios.patch(`${BASE_URL}/editorials/${currentEditorial.id}/status`, { status: newStatus });
      toast({
        title: 'Success',
        description: `Editorial status updated to ${newStatus}.`,
      });
      navigate('/editorials');
    } catch (err) {
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

  const handleAddEditorial = () => {
    setEditorials([
      ...editorials,
      {
        date: new Date().toISOString().split('T')[0],
        online_channel: '',
        source: '',
        company_id: undefined,
        media_type: '',
        audience_reach: 0,
        placement: '',
        language: '',
        ceo_media_presence: '',
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
        analyst_note: '',
        supervisor_note: '',
        admin_note: '',
      },
    ]);
    setActiveIndex(editorials.length);
  };

  const handleCloneEditorial = () => {
    const currentEditorial = editorials[activeIndex];
    const clonedEditorial = { ...currentEditorial, id: Date.now() + Math.random() };
    setEditorials([...editorials, clonedEditorial]);
    setActiveIndex(editorials.length);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {isReviewMode ? 'Review Editorial' : isEditMode ? 'Edit Editorial' : 'Create Editorial'}
        </h2>
        {isEditMode && !isReviewMode && (
          <div className="flex items-center space-x-2">
            <Button onClick={handleCloneEditorial}>
              <Copy className="mr-2 h-4 w-4" />Clone
            </Button>
            <Button onClick={handleAddEditorial}>
              <Plus className="mr-2 h-4 w-4" />Add New
            </Button>
          </div>
        )}
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
            userRole={user?.role || ''}
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
            apiCeoMediaPresence={apiCeoMediaPresence}
            apiCeoThoughtLeadership={apiCeoThoughtLeadership}
            apiLanguages={apiLanguages}
            apiCountries={apiCountries}
            apiActivities={apiActivities}
            apiPageSizes={apiPageSizes}
            apiMediaTypes={apiMediaTypes}
            apiSentimentKeywords={apiSentimentKeywords}
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