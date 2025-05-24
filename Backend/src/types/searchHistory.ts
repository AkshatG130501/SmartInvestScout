/**
 * @file Search history types
 * @description Type definitions for search history
 */

/**
 * Search history item interface
 */
export interface SearchHistoryItem {
  id: string;
  query: string;
  user_id?: string;
  timestamp: string;
}

/**
 * Search suggestion interface
 */
export interface SearchSuggestion {
  suggestion: string;
  type: 'stock' | 'company' | 'domain' | 'history';
}
