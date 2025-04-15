/**
 * Utility functions for handling form data
 */
import { toast } from 'sonner';

/**
 * Serialize form data to a query string
 * @param data - Form data object
 * @returns URL-encoded query string
 */
export const serializeFormData = (data: Record<string, any>): string => {
  return Object.entries(data)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value
          .map(item => `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`)
          .join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    })
    .join('&');
};

/**
 * Parse a query string into an object
 * @param queryString - URL query string (without the leading '?')
 * @returns Parsed object
 */
export const parseQueryString = (queryString: string): Record<string, string | string[]> => {
  if (!queryString) return {};

  const params: Record<string, string | string[]> = {};
  const cleanQuery = queryString.startsWith('?') ? queryString.substring(1) : queryString;

  cleanQuery.split('&').forEach(param => {
    const [key, value] = param.split('=').map(decodeURIComponent);

    if (key) {
      if (params[key]) {
        // If the parameter already exists, convert it to an array
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    }
  });

  return params;
};

/**
 * Convert FormData to a plain object
 * @param formData - FormData instance
 * @returns Plain object representation
 */
export const formDataToObject = (formData: FormData): Record<string, any> => {
  const result: Record<string, any> = {};

  formData.forEach((value, key) => {
    // Handle array fields (fields with the same name)
    if (key.endsWith('[]')) {
      const cleanKey = key.slice(0, -2);
      if (!result[cleanKey]) {
        result[cleanKey] = [];
      }
      result[cleanKey].push(value);
    } else if (result[key]) {
      // If the key already exists, convert it to an array
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  });

  return result;
};

/**
 * Convert a plain object to FormData
 * @param data - Plain object
 * @returns FormData instance
 */
export const objectToFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(item => {
        if (item instanceof File) {
          formData.append(key, item);
        } else {
          formData.append(`${key}[]`, String(item));
        }
      });
    } else if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      formData.append(key, JSON.stringify(value));
    } else if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
};

/**
 * Validate required fields in a form
 * @param data - Form data
 * @param requiredFields - Array of required field names
 * @returns Object with validation errors
 */
export const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: string[]
): Record<string, string> => {
  const errors: Record<string, string> = {};

  requiredFields.forEach(field => {
    const value = data[field];

    if (value === undefined || value === null || value === '') {
      errors[field] = 'This field is required';
    } else if (Array.isArray(value) && value.length === 0) {
      errors[field] = 'Please select at least one option';
    }
  });

  return errors;
};

/**
 * Check if a form has any validation errors
 * @param errors - Validation errors object
 * @returns True if there are any errors
 */
export const hasFormErrors = (errors: Record<string, any>): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Reset a form element
 * @param formElement - HTML form element
 */
export const resetForm = (formElement: HTMLFormElement): void => {
  formElement.reset();

  // Also reset any custom form elements that might not be reset by the native reset method
  formElement.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(element => {
    const input = element as HTMLInputElement;
    input.checked = input.defaultChecked;
  });

  formElement.querySelectorAll('select').forEach(select => {
    const selectElement = select as HTMLSelectElement;
    Array.from(selectElement.options).forEach(option => {
      option.selected = option.defaultSelected;
    });
  });
};
