
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Plus, Copy, Save, Send, Loader2 } from 'lucide-react';
import { useCreateEditorial, useUpdateEditorial, useCompanies, usePublications } from '@/hooks/useApi';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import EditorialForm from '@/components/EditorialForm';

import { Editorial } from '@/components/EditorialForm';



const CreateEditorialPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!location.state?.editorialData;

  // Check if we're in review mode
  const searchParams = new URLSearchParams(location.search);
  const reviewId = searchParams.get('review');
  const isReviewMode = !!reviewId;

  // API hooks
  const createEditorial = useCreateEditorial();
  const updateEditorial = useUpdateEditorial();
  const { data: companiesResponse } = useCompanies({ limit: 100 });
  const { data: publicationsResponse } = usePublications({ limit: 100 });

  // Extract real data from API
  const apiCompanies = companiesResponse || [];
  const apiPublications = publicationsResponse || [];

  // Get user role from authentication context
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || 'analyst';

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionType, setSubmissionType] = useState<'draft' | 'send'>('draft');

  // Default initial form data
  const defaultFormData: Editorial = {
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    company: '',
    industry: 'Financial Services',
    brand: '',
    subIndustry: '',
    source: '',
    placement: '',
    title: '',
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
    mediaType: 'Print',
    onlineChannel: '',
    sentiment: '',
    sentimentClassification: '',
    sentimentScore: 0,
    advertSpend: 0,
    pageSize: '',
    status: 'DRAFT',
    analystNote: '',
    supervisorNote: '',
    adminNote: '',
  };

  // Generate a unique session key for this form
  const getSessionKey = () => {
    // If editing, use the editorial ID to ensure we don't mix up different editorials
    if (location.state?.editorialData) {
      return `editorial_form_${location.state.editorialData.id}`;
    }
    // For new editorials, use a consistent key
    return 'editorial_form_new';
  };

  const sessionKey = getSessionKey();

  // Initialize form data from location state, session storage, or default
  const getInitialFormData = (): Editorial => {
    // If we're in edit mode, use the provided editorial data
    if (location.state?.editorialData) {
      return location.state.editorialData;
    }

    // Try to get data from session storage
    const savedData = sessionStorage.getItem(sessionKey);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // If we have saved editorials, return them
        if (parsedData.editorials && parsedData.editorials.length > 0) {
          return parsedData.editorials[0];
        }
      } catch (error) {
        console.error('Error parsing saved editorial data:', error);
      }
    }

    // Fall back to default data
    return defaultFormData;
  };

  const initialFormData = getInitialFormData();

  // Initialize state
  const [editorials, setEditorials] = useState<Editorial[]>([initialFormData]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dates, setDates] = useState<(Date | undefined)[]>(
    [initialFormData.date ? new Date(initialFormData.date) : new Date()]
  );

  // Load saved data from session storage or fetch review data
  useEffect(() => {
    if (isReviewMode && reviewId) {
      // In review mode, fetch the editorial data from API
      // For now, we'll use the existing data loading mechanism
      // In a real implementation, you'd fetch the specific editorial by ID
      console.log('Review mode: loading editorial', reviewId);
      return;
    }

    const savedData = sessionStorage.getItem(sessionKey);
    if (savedData && !location.state?.editorialData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.editorials && parsedData.editorials.length > 0) {
          setEditorials(parsedData.editorials);

          // Reconstruct dates array from editorials
          const newDates = parsedData.editorials.map((editorial: Editorial) =>
            editorial.date ? new Date(editorial.date) : undefined
          );
          setDates(newDates);

          // Set active index (default to 0 if not saved)
          if (parsedData.activeIndex !== undefined) {
            setActiveIndex(parsedData.activeIndex);
          }

          toast({
            title: "Data Restored",
            description: "Your previously entered data has been restored."
          });
        }
      } catch (error) {
        console.error('Error loading saved editorial data:', error);
      }
    }
  }, [sessionKey, location.state, toast, isReviewMode, reviewId]);

  // Save data to session storage whenever it changes
  useEffect(() => {
    // Save current state to session storage
    const saveToSessionStorage = () => {
      const dataToSave = {
        editorials,
        activeIndex,
        lastUpdated: new Date().toISOString()
      };
      sessionStorage.setItem(sessionKey, JSON.stringify(dataToSave));
    };

    // Save data when it changes
    saveToSessionStorage();

    // Also set up an interval to save periodically (every 10 seconds)
    const saveInterval = setInterval(saveToSessionStorage, 10000);

    // Clean up interval on unmount
    return () => clearInterval(saveInterval);
  }, [editorials, activeIndex, sessionKey]);

  // Handle changes to form inputs for the active editorial
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    const updatedEditorials = [...editorials];
    updatedEditorials[activeIndex] = {
      ...updatedEditorials[activeIndex],
      [name]: value
    };

    setEditorials(updatedEditorials);

    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle field changes from the form component
  const handleFieldChange = (name: string, value: string | number) => {
    const updatedEditorials = [...editorials];
    updatedEditorials[activeIndex] = {
      ...updatedEditorials[activeIndex],
      [name]: value
    };

    setEditorials(updatedEditorials);

    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle clearing errors
  const handleClearError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors({
        ...errors,
        [fieldName]: ''
      });
    }
  };

  // Handle select changes for the active editorial
  const handleSelectChange = (name: string, value: string) => {
    const updatedEditorials = [...editorials];
    updatedEditorials[activeIndex] = {
      ...updatedEditorials[activeIndex],
      [name]: value
    };

    setEditorials(updatedEditorials);

    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle date change for the active editorial
  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const updatedDates = [...dates];
      updatedDates[activeIndex] = selectedDate;
      setDates(updatedDates);

      const updatedEditorials = [...editorials];
      updatedEditorials[activeIndex] = {
        ...updatedEditorials[activeIndex],
        date: selectedDate.toISOString().split('T')[0]
      };

      setEditorials(updatedEditorials);
    }
  };

  // Add a new editorial
  const addEditorial = () => {
    const newId = Date.now();
    setEditorials([...editorials, { ...initialFormData, id: newId }]);
    setDates([...dates, new Date()]);
    setActiveIndex(editorials.length);
  };

  // Clone the current editorial
  const cloneEditorial = () => {
    const currentEditorial = editorials[activeIndex];
    const clonedEditorial = { ...currentEditorial, id: Date.now() };

    setEditorials([...editorials, clonedEditorial]);
    setDates([...dates, dates[activeIndex] ? new Date(dates[activeIndex]!) : new Date()]);
    setActiveIndex(editorials.length);
  };

  // Switch to a different editorial
  const switchEditorial = (index: number) => {
    setActiveIndex(index);
  };

  // Form validation
  const validateForm = (isDraft: boolean = false) => {
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    // Required fields - less strict for drafts
    const requiredFields = isDraft
      ? ['title', 'company', 'date'] // Minimal requirements for draft
      : ['title', 'company', 'brand', 'source', 'date', 'industry', 'country', 'language', 'mediaType'];

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

  // Handle form submission
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
      // Prepare editorial data for API
      const editorialData = {
        ...editorials[activeIndex],
        status: isDraft ? 'DRAFT' : 'PENDING',
        // Map form fields to API expected fields
        subIndustry: editorials[activeIndex].subIndustry,
        source: editorials[activeIndex].source,
        printWebClips: editorials[activeIndex].printWebClips,
        ceoMediaPresence: editorials[activeIndex].ceoMediaPresence,
        ceoThoughtLeadership: editorials[activeIndex].ceoThoughtLeadership,
        sentimentClassification: editorials[activeIndex].sentimentClassification,
        sentimentScore: editorials[activeIndex].sentimentScore,
      };

      let result;
      if (isEditMode && location.state?.editorialData?.id) {
        result = await updateEditorial.mutate({
          id: location.state.editorialData.id,
          data: editorialData
        });
      } else {
        result = await createEditorial.mutate(editorialData);
      }

      // Clear session storage after successful submission
      sessionStorage.removeItem(sessionKey);

      navigate('/dashboard/editorial', {
        state: {
          savedEditorials: [result],
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

  // Cancel and go back
  const handleCancel = () => {
    // Check if there are unsaved changes by comparing with the initial data
    const hasChanges = JSON.stringify(editorials) !== JSON.stringify([initialFormData]);

    if (hasChanges) {
      // Show confirmation dialog
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        // User confirmed, navigate away
        navigate('/dashboard/editorial');
      }
      // If user cancels, stay on the page
    } else {
      // No changes, navigate away directly
      navigate('/dashboard/editorial');
    }
  };

  // Determine if a field should be read-only based on user role and review mode
  const isFieldReadOnly = (fieldName: string): boolean => {
    // In review mode, only allow editing of role-specific note fields
    if (isReviewMode) {
      if (fieldName === 'supervisorNote' && userRole === 'supervisor') {
        return false; // Supervisors can edit their notes in review mode
      }
      if (fieldName === 'adminNote' && userRole === 'admin') {
        return false; // Admins can edit their notes in review mode
      }
      // All other fields are read-only in review mode
      return true;
    }

    // In normal mode (not review), apply standard note field restrictions
    if (fieldName === 'analystNote' && userRole !== 'analyst') {
      return true;
    }
    if (fieldName === 'supervisorNote' && userRole !== 'supervisor') {
      return true;
    }
    if (fieldName === 'adminNote' && userRole !== 'admin') {
      return true;
    }

    // All other fields are editable in normal mode for all roles
    return false;
  };

  // Handle review actions (approve/reject)
  const handleReviewAction = async (action: 'approve' | 'reject') => {
    if (!isReviewMode || !reviewId) return;

    try {
      const currentEditorial = editorials[activeIndex];

      // Validate supervisor note if rejecting
      if (action === 'reject' && !currentEditorial.supervisorNote?.trim()) {
        toast({
          title: "Validation Error",
          description: "Please add a supervisor note before rejecting.",
          variant: "destructive"
        });
        return;
      }

      // Update the editorial with review status
      const updateData = {
        status: action === 'approve' ? 'approved' : 'rejected',
        supervisorNote: currentEditorial.supervisorNote,
        reviewedBy: userRole, // Current user
        reviewedAt: new Date().toISOString()
      };

      // Call the update API
      await updateEditorial.mutate({
        id: reviewId,
        data: updateData
      });

      toast({
        title: "Success",
        description: `Editorial ${action}d successfully`,
      });

      // Navigate back to review page
      navigate('/dashboard/review');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} editorial`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isReviewMode ? 'Review Editorial' : isEditMode ? 'Edit Editorial' : 'Create Editorial'}
        </h1>
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

      <div className="flex-1 min-h-0">
        <EditorialForm
        editorials={editorials}
        activeIndex={activeIndex}
        errors={errors}
        dates={dates}
        apiCompanies={apiCompanies}
        apiPublications={apiPublications}
        userRole={userRole}
        onEditorialChange={setEditorials}
        onDateChange={setDates}
        onAddEditorial={addEditorial}
        onCloneEditorial={cloneEditorial}
        onSwitchEditorial={switchEditorial}
        onFieldChange={handleFieldChange}
        onSelectChange={handleSelectChange}
        onDateSelect={handleDateChange}
        onClearError={handleClearError}
        onReviewAction={isReviewMode ? handleReviewAction : undefined}
        isFieldReadOnly={isFieldReadOnly}
      />
      </div>

      {/* Form Actions - Hidden in review mode */}
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