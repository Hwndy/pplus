
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Plus, Copy, Save, Send, Loader2 } from 'lucide-react';
import { useCreateEditorial, useUpdateEditorial, useCompanies, usePublications } from '@/hooks/useApi';
import { toast } from 'sonner';
import EditorialForm from '@/components/EditorialForm';

import { Editorial } from '@/components/EditorialForm';



const CreateEditorialPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!location.state?.editorialData;

  // API hooks
  const createEditorial = useCreateEditorial();
  const updateEditorial = useUpdateEditorial();
  const { data: companiesResponse } = useCompanies({ limit: 100 });
  const { data: publicationsResponse } = usePublications({ limit: 100 });

  // Extract real data from API
  const apiCompanies = companiesResponse?.data || [];
  const apiPublications = publicationsResponse?.data || [];

  // Detect user role - this would normally come from authentication
  // For demo purposes, we'll use a hardcoded role
  const userRole = 'analyst'; // Options: 'analyst', 'supervisor', 'admin'

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

  // Load saved data from session storage
  useEffect(() => {
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
  }, [sessionKey, location.state, toast]);

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

  // Determine if a field should be read-only based on user role
  const isFieldReadOnly = (fieldName: string): boolean => {
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

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Editorial' : 'Create Editorial'}
        </h1>
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
      </div>

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
      />

      {/* Form Actions */}
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
    </div>
  );
};

export default CreateEditorialPage;