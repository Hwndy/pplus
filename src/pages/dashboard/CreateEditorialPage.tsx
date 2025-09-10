import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Plus, Copy, Save, Send, Loader2, ArrowLeft } from 'lucide-react';
import { Editorial, Company, Person, DataParameter, SentimentKeyword } from '@/types';
import EditorialForm from '@/components/EditorialForm';

const API_BASE_URL = 'https://pplus-86qw.onrender.com/api';

const CreateEditorialPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!location.state?.editorialData;
  const searchParams = new URLSearchParams(location.search);
  const reviewId = searchParams.get('review');
  const isReviewMode = !!reviewId;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionType, setSubmissionType] = useState<'draft' | 'send'>('draft');

  const [apiCompanies, setApiCompanies] = useState<Company[]>([]);
  const [apiPublications, setApiPublications] = useState<DataParameter[]>([]);
  const [apiReporters, setApiReporters] = useState<Person[]>([]);
  const [apiSpokespersons, setApiSpokespersons] = useState<DataParameter[]>([]);
  const [apiPlacements, setApiPlacements] = useState<DataParameter[]>([]);
  const [apiOnlineChannels, setApiOnlineChannels] = useState<DataParameter[]>([]);
  const [apiCeoMediaPresence, setApiCeoMediaPresence] = useState<DataParameter[]>([]);
  const [apiCeoThoughtLeadership, setApiCeoThoughtLeadership] = useState<DataParameter[]>([]);
  const [apiLanguages, setApiLanguages] = useState<DataParameter[]>([]);
  const [apiCountries, setApiCountries] = useState<DataParameter[]>([]);
  const [apiActivities, setApiActivities] = useState<DataParameter[]>([]);
  const [apiPageSizes, setApiPageSizes] = useState<DataParameter[]>([]);
  const [apiSentimentKeywords, setApiSentimentKeywords] = useState<SentimentKeyword[]>([]);

  // static user for now
  const user = { role: { name: 'analyst' } };
  const userRole = user?.role?.name?.toLowerCase() || 'analyst';

  const defaultFormData: Editorial = {
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    company: '',
    brand: '',
    company_id: 0,
    source: '',
    placement: '',
    title: '',
    mediaType: '',
    printWebClips: '',
    reporter: '',
    country: 'Nigeria',
    language: 'English',
    spokesperson: '',
    ceoMediaPresence: '',
    ceoThoughtLeadership: '',
    activity: '',
    circulation: 0,
    audienceReach: 0,
    onlineChannel: '',
    sentiment: '',
    sentimentClassification: '',
    sentimentScore: 0,
    sentiment_keyword_indicator_id: 0,
    advertSpend: 0,
    pageSize: '',
    status: 'DRAFT',
    analystNote: '',
    supervisorNote: '',
    adminNote: '',
  };

  const getSessionKey = () => {
    if (location.state?.editorialData) {
      return `editorial_form_${location.state.editorialData.id}`;
    }
    return 'editorial_form_new';
  };
  const sessionKey = getSessionKey();

  const getInitialFormData = (): Editorial => {
    if (location.state?.editorialData) {
      return location.state.editorialData;
    }
    const savedData = sessionStorage.getItem(sessionKey);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.editorials && parsedData.editorials.length > 0) {
          return parsedData.editorials[0];
        }
      } catch (error) {
        console.error('Error parsing saved editorial data:', error);
      }
    }
    return defaultFormData;
  };

  const initialFormData = getInitialFormData();
  const [editorials, setEditorials] = useState<Editorial[]>([initialFormData]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const companiesPromise = fetch(`${API_BASE_URL}/companies?limit=100`).then(res => res.json());
        const publicationsPromise = fetch(`${API_BASE_URL}/data-parameters/category/Publications`).then(res => res.json());
        const usersPromise = fetch(`${API_BASE_URL}/users`).then(res => res.json());
        const dataParamsPromises = [
          'SpokesPerson', 'Placement', 'Online Channel', 'CEO Media Presence',
          'CEO thought leadership', 'Language', 'Country', 'Activity', 'Page Size'
        ].map(param => fetch(`${API_BASE_URL}/data-parameters/category/${encodeURIComponent(param)}`).then(res => res.json()));
        const sentimentKeywordsPromise = fetch(`${API_BASE_URL}/sentiment-keyword-indicators`).then(res => res.json());

        const [
          companiesResponse, publicationsResponse, usersResponse,
          spokespersonsResponse, placementsResponse, onlineChannelsResponse,
          ceoMediaPresenceResponse, ceoThoughtLeadershipResponse, languagesResponse,
          countriesResponse, activitiesResponse, pageSizesResponse, sentimentKeywordsResponse
        ] = await Promise.all([
          companiesPromise, publicationsPromise, usersPromise,
          ...dataParamsPromises, sentimentKeywordsPromise
        ]);

        setApiCompanies(companiesResponse?.data?.data || []);
        setApiPublications(publicationsResponse?.data?.categories?.values || []);
        setApiReporters((usersResponse?.data?.data || []).filter((u: Person) => (u.role?.name || '').toLowerCase() === 'analyst'));
        setApiSpokespersons(spokespersonsResponse?.data?.categories?.values || []);
        setApiPlacements(placementsResponse?.data?.categories?.values || []);
        setApiOnlineChannels(onlineChannelsResponse?.data?.categories?.values || []);
        setApiCeoMediaPresence(ceoMediaPresenceResponse?.data?.categories?.values || []);
        setApiCeoThoughtLeadership(ceoThoughtLeadershipResponse?.data?.categories?.values || []);
        setApiLanguages(languagesResponse?.data?.categories?.values || []);
        setApiCountries(countriesResponse?.data?.categories?.values || []);
        setApiActivities(activitiesResponse?.data?.categories?.values || []);
        setApiPageSizes(pageSizesResponse?.data?.categories?.values || []);
        setApiSentimentKeywords(sentimentKeywordsResponse?.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch API data:', error);
        toast({
          title: "Error",
          description: "Failed to load form data. Please check your network connection.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const savedData = sessionStorage.getItem(sessionKey);
    if (savedData && !location.state?.editorialData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.editorials && parsedData.editorials.length > 0) {
          setEditorials(parsedData.editorials);
          if (parsedData.activeIndex !== undefined) {
            setActiveIndex(parsedData.activeIndex);
          }
          toast({
            title: "Data Restored",
            description: "Your previously entered data has been restored."
          });
        }
      } catch (error) {
        console.error('Error parsing saved editorial data:', error);
      }
    }

    const saveToSessionStorage = () => {
      const dataToSave = {
        editorials,
        activeIndex,
        lastUpdated: new Date().toISOString()
      };
      sessionStorage.setItem(sessionKey, JSON.stringify(dataToSave));
    };

    const saveInterval = setInterval(saveToSessionStorage, 10000);
    return () => clearInterval(saveInterval);
  }, [sessionKey, location.state, toast, editorials, activeIndex]);

  const handleFieldChange = (name: string, value: string | number) => {
    const updatedEditorials = [...editorials];
    updatedEditorials[activeIndex] = {
      ...updatedEditorials[activeIndex],
      [name]: value
    };
    setEditorials(updatedEditorials);
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const addEditorial = () => {
    const newId = Date.now();
    setEditorials(prev => {
      const newEditorials = [...prev, { ...defaultFormData, id: newId }];
      setActiveIndex(newEditorials.length - 1);
      return newEditorials;
    });
  };

  const cloneEditorial = () => {
    setEditorials(prev => {
      const current = prev[activeIndex] || defaultFormData;
      const cloned = { ...current, id: Date.now() };
      const newEditorials = [...prev, cloned];
      setActiveIndex(newEditorials.length - 1);
      return newEditorials;
    });
  };

  const removeEditorial = (id: number) => {
    setEditorials(prev => {
      const filtered = prev.filter(e => e.id !== id);
      const newIndex = Math.max(0, Math.min(activeIndex, filtered.length - 1));
      setActiveIndex(newIndex);
      return filtered.length ? filtered : [{ ...defaultFormData, id: Date.now() }];
    });
  };

  const switchEditorial = (index: number) => {
    setActiveIndex(index);
  };

  const validateForm = (isDraft: boolean = false) => {
    let hasErrors = false;
    const newErrors: Record<string, string> = {};
    const requiredFields = isDraft
      ? ['title', 'company', 'date', 'mediaType']
      : ['title', 'company', 'source', 'date', 'country', 'language', 'mediaType'];
    requiredFields.forEach(field => {
      const value = editorials[activeIndex][field as keyof Editorial];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        hasErrors = true;
      }
    });
    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async (type: 'draft' | 'send') => {
    const isDraft = type === 'draft';
    if (!validateForm(isDraft)) {
      toast({
        title: "Validation Error",
        description: isDraft
          ? "Please fill in the basic required fields to save as draft."
          : "Please fill in all required fields to send for approval.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionType(type);

    try {
      const editorialData = {
        ...editorials[activeIndex],
        status: isDraft ? 'DRAFT' : 'PENDING',
        reviewedBy: isDraft ? undefined : userRole,
        reviewedAt: isDraft ? undefined : new Date().toISOString()
      };

      const endpoint = isEditMode ? `${API_BASE_URL}/editorials/${location.state.editorialData.id}` : `${API_BASE_URL}/editorials`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editorialData),
      });

      if (!response.ok) {
        throw new Error('Failed to save editorial');
      }

      sessionStorage.removeItem(sessionKey);
      navigate('/dashboard/editorial', {
        state: {
          savedEditorials: [await response.json()],
          isEditMode
        }
      });
      toast({
        title: "Success",
        description: isDraft
          ? (isEditMode ? "Editorial draft updated successfully" : "Editorial saved as draft")
          : (isEditMode ? "Editorial updated and sent for approval" : "Editorial sent for approval")
      });
    } catch (error) {
      console.error('Error saving editorial:', error);
      toast({
        title: "Error",
        description: isDraft
          ? "Failed to save draft"
          : "Failed to send for approval",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = JSON.stringify(editorials) !== JSON.stringify([initialFormData]);
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/dashboard/editorial');
      }
    } else {
      navigate('/dashboard/editorial');
    }
  };

  const isFieldReadOnly = (fieldName: string): boolean => {
    if (isReviewMode) {
      if (fieldName === 'supervisorNote' && userRole === 'supervisor') {
        return false;
      }
      if (fieldName === 'adminNote' && userRole === 'admin') {
        return false;
      }
      return true;
    }

    if (fieldName === 'analystNote' && userRole !== 'analyst') {
      return true;
    }
    if (fieldName === 'supervisorNote' && userRole !== 'supervisor') {
      return true;
    }
    if (fieldName === 'adminNote' && userRole !== 'admin') {
      return true;
    }
    return false;
  };

  const handleReviewAction = async (action: 'approve' | 'reject') => {
    if (!isReviewMode || !reviewId) return;

    try {
      const currentEditorial = editorials[activeIndex];
      if (action === 'reject' && !currentEditorial.supervisorNote?.trim()) {
        toast({
          title: "Validation Error",
          description: "Please add a supervisor note before rejecting.",
          variant: "destructive"
        });
        return;
      }

      const updateData = {
        status: action === 'approve' ? 'approved' : 'rejected',
        supervisorNote: currentEditorial.supervisorNote,
        reviewedBy: userRole,
        reviewedAt: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/editorials/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update editorial');
      }

      toast({
        title: "Success",
        description: `Editorial ${action}d successfully`,
      });

      navigate('/dashboard/review');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} editorial`,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isReviewMode ? 'Review Editorial' : isEditMode ? 'Edit Editorial' : 'Create Editorial'}
          </h1>
        </div>
        {!isReviewMode && (
          <div className="flex space-x-2">
            <Button
              onClick={cloneEditorial}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Copy className="h-4 w-4" />
              Clone
            </Button>
            <Button
              onClick={addEditorial}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <EditorialForm
          editorials={editorials}
          activeIndex={activeIndex}
          errors={errors}
          userRole={userRole}
          onFieldChange={handleFieldChange}
          onSwitchEditorial={switchEditorial}
          onReviewAction={isReviewMode ? handleReviewAction : undefined}
          isFieldReadOnly={isFieldReadOnly}
          apiCompanies={apiCompanies}
          apiPublications={apiPublications}
          apiReporters={apiReporters}
          apiSpokespersons={apiSpokespersons}
          apiPlacements={apiPlacements}
          apiOnlineChannels={apiOnlineChannels}
          apiCeoMediaPresence={apiCeoMediaPresence}
          apiCeoThoughtLeadership={apiCeoThoughtLeadership}
          apiLanguages={apiLanguages}
          apiCountries={apiCountries}
          apiActivities={apiActivities}
          apiPageSizes={apiPageSizes}
          apiSentimentKeywords={apiSentimentKeywords}
          // NEW: pass the local handlers so the form's internal add/remove buttons work
          onAddEditorial={addEditorial}
          onCloneEditorial={cloneEditorial}
          onRemoveEditorial={removeEditorial}
        />
      </div>

      {!isReviewMode && (
        <div className="flex justify-end space-x-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
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
          <Button
            type="button"
            onClick={() => handleSubmit('send')}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
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
        </div>
      )}
    </div>
  );
};

export default CreateEditorialPage;
