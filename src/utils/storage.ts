/**
 * Type-safe wrapper for localStorage and sessionStorage
 */

// Type for storage options
type StorageType = 'local' | 'session';

/**
 * Get the appropriate storage object based on type
 * @param type - Storage type ('local' or 'session')
 * @returns Storage object
 */
const getStorageObject = (type: StorageType): Storage => {
  return type === 'local' ? window.localStorage : window.sessionStorage;
};

/**
 * Get an item from storage with type safety
 * @param key - Storage key
 * @param type - Storage type
 * @returns Parsed value or null if not found
 */
export function getStorageItem<T>(key: string, type: StorageType = 'local'): T | null {
  try {
    const storage = getStorageObject(type);
    const item = storage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  } catch (error) {
    console.error(`Error getting ${type} storage item:`, error);
    return null;
  }
}

/**
 * Set an item in storage
 * @param key - Storage key
 * @param value - Value to store
 * @param type - Storage type
 * @returns True if successful, false otherwise
 */
export function setStorageItem<T>(key: string, value: T, type: StorageType = 'local'): boolean {
  try {
    const storage = getStorageObject(type);
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting ${type} storage item:`, error);
    return false;
  }
}

/**
 * Remove an item from storage
 * @param key - Storage key
 * @param type - Storage type
 */
export function removeStorageItem(key: string, type: StorageType = 'local'): void {
  try {
    const storage = getStorageObject(type);
    storage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${type} storage item:`, error);
  }
}

/**
 * Clear all items from storage
 * @param type - Storage type
 */
export function clearStorage(type: StorageType = 'local'): void {
  try {
    const storage = getStorageObject(type);
    storage.clear();
  } catch (error) {
    console.error(`Error clearing ${type} storage:`, error);
  }
}

/**
 * Check if an item exists in storage
 * @param key - Storage key
 * @param type - Storage type
 * @returns True if the item exists
 */
export function hasStorageItem(key: string, type: StorageType = 'local'): boolean {
  try {
    const storage = getStorageObject(type);
    return storage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking ${type} storage item:`, error);
    return false;
  }
}

/**
 * Get all keys from storage
 * @param type - Storage type
 * @returns Array of storage keys
 */
export function getStorageKeys(type: StorageType = 'local'): string[] {
  try {
    const storage = getStorageObject(type);
    return Object.keys(storage);
  } catch (error) {
    console.error(`Error getting ${type} storage keys:`, error);
    return [];
  }
}

/**
 * Get the size of storage in bytes
 * @param type - Storage type
 * @returns Size in bytes
 */
export function getStorageSize(type: StorageType = 'local'): number {
  try {
    const storage = getStorageObject(type);
    let size = 0;
    for (const key in storage) {
      if (storage.hasOwnProperty(key)) {
        size += (storage.getItem(key) || '').length;
      }
    }
    return size;
  } catch (error) {
    console.error(`Error getting ${type} storage size:`, error);
    return 0;
  }
}
