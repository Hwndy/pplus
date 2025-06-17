/**
 * API utility functions for making HTTP requests
 */

// Base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://p-analytics.onrender.com/api';

// Default request timeout in milliseconds
const DEFAULT_TIMEOUT = 30000;

// Types
export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

export type RequestOptions = {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
};

/**
 * Creates an AbortController with timeout
 * @param ms - Timeout in milliseconds
 * @returns AbortController and abort signal
 */
const createAbortController = (ms: number = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  
  // Return both the controller and a cleanup function
  return {
    controller,
    signal: controller.signal,
    clear: () => clearTimeout(timeout)
  };
};

/**
 * Handles API response and converts to ApiResponse format
 * @param response - Fetch Response object
 * @returns Formatted API response
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const status = response.status;
  
  try {
    // For successful responses, parse JSON
    if (response.ok) {
      const data = await response.json();
      return { data, error: null, status };
    }
    
    // For error responses, try to parse error message
    try {
      const errorData = await response.json();
      const errorMessage = errorData.message || errorData.error || response.statusText;
      return { data: null, error: errorMessage, status };
    } catch {
      // If error response is not JSON
      return { data: null, error: response.statusText, status };
    }
  } catch (error) {
    // Handle any parsing errors
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error', 
      status 
    };
  }
};

/**
 * Makes a GET request to the API
 * @param endpoint - API endpoint
 * @param options - Request options
 * @returns API response
 */
export const get = async <T>(
  endpoint: string, 
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const { timeout = DEFAULT_TIMEOUT, headers = {}, signal } = options;
  const abortHandler = signal ? { signal } : createAbortController(timeout);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: abortHandler.signal,
    });
    
    if (!signal) abortHandler.clear();
    return handleResponse<T>(response);
  } catch (error) {
    if (!signal) abortHandler.clear();
    
    if (error instanceof Error) {
      // Handle abort error
      if (error.name === 'AbortError') {
        return { data: null, error: 'Request timed out', status: 408 };
      }
      
      return { data: null, error: error.message, status: 500 };
    }
    
    return { data: null, error: 'Unknown error', status: 500 };
  }
};

/**
 * Makes a POST request to the API
 * @param endpoint - API endpoint
 * @param data - Request body data
 * @param options - Request options
 * @returns API response
 */
export const post = async <T>(
  endpoint: string, 
  data: unknown, 
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const { timeout = DEFAULT_TIMEOUT, headers = {}, signal } = options;
  const abortHandler = signal ? { signal } : createAbortController(timeout);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
      signal: abortHandler.signal,
    });
    
    if (!signal) abortHandler.clear();
    return handleResponse<T>(response);
  } catch (error) {
    if (!signal) abortHandler.clear();
    
    if (error instanceof Error) {
      // Handle abort error
      if (error.name === 'AbortError') {
        return { data: null, error: 'Request timed out', status: 408 };
      }
      
      return { data: null, error: error.message, status: 500 };
    }
    
    return { data: null, error: 'Unknown error', status: 500 };
  }
};

/**
 * Makes a PUT request to the API
 * @param endpoint - API endpoint
 * @param data - Request body data
 * @param options - Request options
 * @returns API response
 */
export const put = async <T>(
  endpoint: string, 
  data: unknown, 
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const { timeout = DEFAULT_TIMEOUT, headers = {}, signal } = options;
  const abortHandler = signal ? { signal } : createAbortController(timeout);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
      signal: abortHandler.signal,
    });
    
    if (!signal) abortHandler.clear();
    return handleResponse<T>(response);
  } catch (error) {
    if (!signal) abortHandler.clear();
    
    if (error instanceof Error) {
      // Handle abort error
      if (error.name === 'AbortError') {
        return { data: null, error: 'Request timed out', status: 408 };
      }
      
      return { data: null, error: error.message, status: 500 };
    }
    
    return { data: null, error: 'Unknown error', status: 500 };
  }
};

/**
 * Makes a DELETE request to the API
 * @param endpoint - API endpoint
 * @param options - Request options
 * @returns API response
 */
export const del = async <T>(
  endpoint: string, 
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const { timeout = DEFAULT_TIMEOUT, headers = {}, signal } = options;
  const abortHandler = signal ? { signal } : createAbortController(timeout);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: abortHandler.signal,
    });
    
    if (!signal) abortHandler.clear();
    return handleResponse<T>(response);
  } catch (error) {
    if (!signal) abortHandler.clear();
    
    if (error instanceof Error) {
      // Handle abort error
      if (error.name === 'AbortError') {
        return { data: null, error: 'Request timed out', status: 408 };
      }
      
      return { data: null, error: error.message, status: 500 };
    }
    
    return { data: null, error: 'Unknown error', status: 500 };
  }
};
