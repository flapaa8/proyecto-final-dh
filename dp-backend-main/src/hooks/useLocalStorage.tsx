import { useState } from 'react';

interface UseLocalStorageOptions<T> {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export function useLocalStorage<T>(key: string, options?: UseLocalStorageOptions<T>): [T | null, (value: T | null) => void] {
  const serialize = options?.serialize ?? JSON.stringify;
  const deserialize = options?.deserialize ?? JSON.parse;

  let initialValue: T | null;

  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      initialValue = deserialize(stored);
    } else {
      initialValue = null;
    }
  } catch {
    initialValue = null;
  }

  const [value, setValue] = useState<T | null>(initialValue);

  const setStoredValue = (newValue: T | null) => {
    setValue(newValue);
    if (newValue !== null) {
      localStorage.setItem(key, serialize(newValue));
    } else {
      localStorage.removeItem(key);
    }
  };

  return [value, setStoredValue];
}



