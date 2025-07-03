import { useState } from 'react';

interface UseLocalStorageOptions<T> {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export function useLocalStorage<T>(
  key: string,
  options?: UseLocalStorageOptions<T>
): [T | null, React.Dispatch<React.SetStateAction<T | null>>] {
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

  const setStoredValue: React.Dispatch<React.SetStateAction<T | null>> = (newValueOrFunc) => {
    setValue((prev) => {
      const newValue =
        typeof newValueOrFunc === 'function'
          ? (newValueOrFunc as (prevState: T | null) => T | null)(prev)
          : newValueOrFunc;

      if (newValue !== null) {
        localStorage.setItem(key, serialize(newValue));
      } else {
        localStorage.removeItem(key);
      }

      return newValue;
    });
  };

  return [value, setStoredValue];
}




