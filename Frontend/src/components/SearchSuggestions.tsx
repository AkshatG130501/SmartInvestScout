/**
 * @file SearchSuggestions component
 * @description Reusable component for displaying search suggestions
 */

import React, { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import useSearchSuggestions from "../hooks/useSearchSuggestions";

interface SearchSuggestionsProps {
  /**
   * Callback when a suggestion is clicked
   */
  onSuggestionClick: (suggestion: string) => void;
  
  /**
   * Additional CSS classes for the input
   */
  inputClassName?: string;
  
  /**
   * Placeholder text for the input
   */
  placeholder?: string;
  
  /**
   * Initial value for the search input
   */
  initialValue?: string;
  
  /**
   * Minimum query length before showing suggestions
   */
  minQueryLength?: number;
  
  /**
   * Debounce delay in milliseconds
   */
  debounceDelay?: number;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  onSuggestionClick,
  inputClassName = "",
  placeholder = "Search...",
  initialValue = "",
  minQueryLength = 2,
  debounceDelay = 300
}) => {
  const {
    query,
    setQuery,
    suggestions,
    isLoading,
    clearSuggestions
  } = useSearchSuggestions({ minQueryLength, debounceDelay });
  
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Set initial value
  useEffect(() => {
    if (initialValue) {
      setQuery(initialValue);
    }
  }, [initialValue, setQuery]);
  
  // Handle clicks outside the suggestions dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSuggestionClick = (suggestion: string) => {
    setShowSuggestions(false);
    clearSuggestions();
    onSuggestionClick(suggestion);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      clearSuggestions();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      setShowSuggestions(false);
      onSuggestionClick(query);
    }
  };
  
  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200 ${inputClassName}`}
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>
      
      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-3 text-center text-gray-500">Loading suggestions...</div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index}
                  className="px-4 py-2 hover:bg-indigo-50 cursor-pointer transition-colors duration-150"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center">
                    <Search className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{suggestion}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : query.trim() !== '' ? (
            <div className="p-3 text-center text-gray-500">No suggestions found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
