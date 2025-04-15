import { useState, useEffect } from 'react';

type SetValue<T> = React.Dispatch<React.SetStateAction<T>>;

/**
 * Custom hook for managing state in session storage
 * @param key - The key to store the value under in session storage
 * @param initialValue - The initial value to use if no value is found in session storage
 * @returns A tuple containing the current value and a function to update it
 */
function useSessionStorage<T>(key: string, initialValue: T): [T, SetValue<T>] {
  // Get stored value from session storage or use initial value
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to sessionStorage
  const setValue: SetValue<T> = value => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to sessionStorage
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Dispatch a custom event so other instances can update
        window.dispatchEvent(new Event('session-storage-change'));
      }
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  // Listen for changes to this sessionStorage value from other instances
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };
    
    // Listen for the custom event
    window.addEventListener('session-storage-change', handleStorageChange);
    
    return () => {
      window.removeEventListener('session-storage-change', handleStorageChange);
    };
  }, []);

  return [storedValue, setValue];
}

export default useSessionStorage;
