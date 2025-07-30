import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * INTERVIEW QUESTION: "Implement debouncing for search optimization"
 * 
 * Key concepts covered:
 * - Performance optimization with debouncing
 * - useEffect cleanup for memory leaks
 * - Custom hook creation
 * - Ref usage for mutable values
 * - Function reference stability
 */

// Basic debounce hook
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function - CRITICAL for preventing memory leaks
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Advanced debounce hook with callback
export const useDebouncedCallback = (callback, delay = 300, dependencies = []) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when dependencies change
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
};

// Debounced search hook with loading state
export const useDebouncedSearch = (searchFunction, delay = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  // Search effect
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const searchResults = await searchFunction(debouncedSearchTerm);
        setResults(searchResults);
      } catch (err) {
        setError(err.message || 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, searchFunction]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setResults([]);
    setError(null);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    error,
    clearSearch,
    debouncedSearchTerm
  };
};

// Advanced debounce with immediate execution option
export const useAdvancedDebounce = (value, delay = 300, immediate = false) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef(null);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const callNow = immediate && !timeoutRef.current;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      if (!immediate) {
        setDebouncedValue(value);
      }
    }, delay);

    if (callNow) {
      setDebouncedValue(value);
    }

    previousValueRef.current = value;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, immediate]);

  return debouncedValue;
};

// Throttle hook (different from debounce - executes at regular intervals)
export const useThrottle = (value, limit = 300) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// Debounced API call hook with caching
export const useDebouncedAPI = (apiCall, delay = 300, cacheSize = 10) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  
  const cache = useRef(new Map());
  const abortController = useRef(null);
  
  const debouncedQuery = useDebounce(query, delay);

  // Manage cache size
  const addToCache = useCallback((key, value) => {
    if (cache.current.size >= cacheSize) {
      const firstKey = cache.current.keys().next().value;
      cache.current.delete(firstKey);
    }
    cache.current.set(key, value);
  }, [cacheSize]);

  useEffect(() => {
    const fetchData = async () => {
      if (!debouncedQuery.trim()) {
        setData(null);
        setLoading(false);
        return;
      }

      // Check cache first
      if (cache.current.has(debouncedQuery)) {
        setData(cache.current.get(debouncedQuery));
        setLoading(false);
        return;
      }

      // Cancel previous request
      if (abortController.current) {
        abortController.current.abort();
      }

      abortController.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall(debouncedQuery, {
          signal: abortController.current.signal
        });
        
        setData(result);
        addToCache(debouncedQuery, result);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'API call failed');
          setData(null);
        }
      } finally {
        setLoading(false);
        abortController.current = null;
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [debouncedQuery, apiCall, addToCache]);

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  const refetch = useCallback(() => {
    cache.current.delete(debouncedQuery);
    setQuery(prev => prev + ' '); // Force re-fetch
    setQuery(prev => prev.trim());
  }, [debouncedQuery]);

  return {
    data,
    loading,
    error,
    query,
    setQuery,
    clearCache,
    refetch,
    cacheSize: cache.current.size
  };
};

// Hook for debounced form validation
export const useDebouncedValidation = (validationFn, delay = 300) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [validating, setValidating] = useState({});
  
  const debouncedCallback = useDebouncedCallback(async (fieldName, value) => {
    setValidating(prev => ({ ...prev, [fieldName]: true }));
    
    try {
      const error = await validationFn(fieldName, value, values);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    } catch (err) {
      setErrors(prev => ({ ...prev, [fieldName]: 'Validation failed' }));
    } finally {
      setValidating(prev => ({ ...prev, [fieldName]: false }));
    }
  }, delay, [values]);

  const setValue = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    debouncedCallback(fieldName, value);
  }, [debouncedCallback]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    values,
    errors,
    validating,
    setValue,
    clearErrors,
    isValid: Object.values(errors).every(error => !error)
  };
};

export default useDebounce;