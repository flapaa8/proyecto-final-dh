import { useState } from 'react';

interface UseLocalStorageOptions<T> {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export function useLocalStorage<T>(
  key: string,
  options?: UseLocalStorageOptions<T>
): [T, (value: T) => void] {
  const serialize = options?.serialize ?? JSON.stringify;
  const deserialize = options?.deserialize ?? JSON.parse;

  let initialValue: T;

  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      initialValue = deserialize(stored);
    } else {
      initialValue = null as T;
    }
  } catch {
    initialValue = null as T;
  }

  const [value, setValue] = useState<T>(initialValue);

  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, serialize(newValue));
  };

  return [value, setStoredValue];
}


