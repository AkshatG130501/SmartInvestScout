/**
 * @file useSearchSuggestions hook
 * @description Custom hook for managing search suggestions with debouncing
 */

import { useState, useEffect } from 'react';
import { getSearchSuggestions } from '../lib/api/search';
import useDebounce from './useDebounce';

interface UseSearchSuggestionsProps {
  /**
   * Minimum query length before fetching suggestions
   */
  minQueryLength?: number;
  
  /**
   * Debounce delay in milliseconds
   */
  debounceDelay?: number;
}

/**
 * Custom hook for managing search suggestions with debouncing
 */
function useSearchSuggestions({
  minQueryLength = 2,
  debounceDelay = 300
}: UseSearchSuggestionsProps = {}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debounce the search query to avoid excessive API calls
  const debouncedQuery = useDebounce(query, debounceDelay);
  
  // Fetch suggestions when debounced query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Don't fetch if query is too short
      if (!debouncedQuery || debouncedQuery.length < minQueryLength) {
        setSuggestions([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getSearchSuggestions(debouncedQuery);
        setSuggestions(data);
      } catch (err) {
        console.error('Error fetching search suggestions:', err);
        setError('Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuggestions();
  }, [debouncedQuery, minQueryLength]);
  
  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    error,
    // Helper function to clear suggestions
    clearSuggestions: () => setSuggestions([])
  };
}

export default useSearchSuggestions;
