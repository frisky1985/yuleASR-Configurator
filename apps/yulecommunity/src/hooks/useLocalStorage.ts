import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
        window.dispatchEvent(new CustomEvent('localStorageChange', { detail: { key } }));
      } catch (error) {
        console.error(`Error writing localStorage key "${key}":`, error);
      }
      return next;
    });
  }, [key]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch {
          // ignore parse errors
        }
      }
    };
    const handleCustom = (e: Event) => {
      const custom = e as CustomEvent<{ key: string }>;
      if (custom.detail?.key === key) {
        const item = window.localStorage.getItem(key);
        if (item) {
          try {
            setStoredValue(JSON.parse(item) as T);
          } catch {
            // ignore parse errors
          }
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('localStorageChange', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('localStorageChange', handleCustom);
    };
  }, [key]);

  return [storedValue, setValue];
}
