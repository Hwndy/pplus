import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseFormWithStorageOptions<T> {
  /**
   * The key to use for storing the form data in session storage
   */
  storageKey: string;
  
  /**
   * Initial form data
   */
  initialData: T;
  
  /**
   * Whether to show a toast notification when data is restored
   */
  showRestoreNotification?: boolean;
  
  /**
   * Whether to save data automatically on change
   */
  autoSave?: boolean;
  
  /**
   * Interval in milliseconds for auto-saving (default: 5000ms)
   */
  autoSaveInterval?: number;
  
  /**
   * Optional validation function
   */
  validate?: (data: T) => Record<string, string> | null;
}

/**
 * Custom hook for managing form state with session storage persistence
 */
function useFormWithStorage<T extends Record<string, any>>({
  storageKey,
  initialData,
  showRestoreNotification = true,
  autoSave = true,
  autoSaveInterval = 5000,
  validate,
}: UseFormWithStorageOptions<T>) {
  // Form state
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  
  // Load data from session storage on mount
  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData) as T;
        setFormData(parsedData);
        setIsRestored(true);
        
        if (showRestoreNotification) {
          toast({
            title: 'Data Restored',
            description: 'Your previously entered data has been restored.',
          });
        }
      }
    } catch (error) {
      console.error(`Error loading form data from session storage (${storageKey}):`, error);
    }
  }, [storageKey, showRestoreNotification]);
  
  // Save data to session storage
  const saveToStorage = useCallback((data: T) => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving form data to session storage (${storageKey}):`, error);
    }
  }, [storageKey]);
  
  // Auto-save data to session storage
  useEffect(() => {
    if (!autoSave || !isDirty) return;
    
    const interval = setInterval(() => {
      saveToStorage(formData);
    }, autoSaveInterval);
    
    return () => clearInterval(interval);
  }, [formData, autoSave, autoSaveInterval, isDirty, saveToStorage]);
  
  // Update form data
  const updateFormData = useCallback((newData: Partial<T>) => {
    setFormData(prev => {
      const updated = { ...prev, ...newData };
      
      // Validate if a validation function is provided
      if (validate) {
        const validationErrors = validate(updated);
        setErrors(validationErrors || {});
      }
      
      setIsDirty(true);
      return updated;
    });
  }, [validate]);
  
  // Handle field change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle different input types
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      updateFormData({ [name]: checked } as Partial<T>);
    } else if (type === 'number') {
      updateFormData({ [name]: parseFloat(value) } as Partial<T>);
    } else {
      updateFormData({ [name]: value } as Partial<T>);
    }
  }, [updateFormData]);
  
  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsDirty(false);
    sessionStorage.removeItem(storageKey);
  }, [initialData, storageKey]);
  
  // Submit form
  const submitForm = useCallback(async (onSubmit: (data: T) => Promise<void> | void) => {
    // Validate if a validation function is provided
    if (validate) {
      const validationErrors = validate(formData);
      setErrors(validationErrors || {});
      
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        return false;
      }
    }
    
    try {
      await onSubmit(formData);
      // Clear session storage after successful submission
      sessionStorage.removeItem(storageKey);
      setIsDirty(false);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    }
  }, [formData, storageKey, validate]);
  
  return {
    formData,
    errors,
    isDirty,
    isRestored,
    updateFormData,
    handleChange,
    resetForm,
    submitForm,
    saveToStorage,
  };
}

export default useFormWithStorage;
