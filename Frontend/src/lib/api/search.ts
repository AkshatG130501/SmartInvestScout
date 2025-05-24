/**
 * @file Search API client
 * @description Client functions for search-related API endpoints
 */

import api from './client';

/**
 * Interface for search suggestion response
 */
export interface SearchSuggestionsResponse {
  suggestions: string[];
}

/**
 * Interface for recent search item
 */
export interface RecentSearchItem {
  id: string;
  query: string;
  timestamp: string;
}

/**
 * Interface for recent searches response
 */
export interface RecentSearchesResponse {
  searches: RecentSearchItem[];
}

/**
 * Get search suggestions based on user input
 * @param query The search query to get suggestions for
 * @returns Promise with array of search suggestions
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    const response = await api.get<SearchSuggestionsResponse>(
      `/api/search/suggestions?query=${encodeURIComponent(query)}`
    );
    return response.data.suggestions;
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return [];
  }
}

/**
 * Save a search query to history
 * @param query The search query to save
 * @param userId Optional user ID
 */
export async function saveSearchQuery(query: string, userId?: string): Promise<void> {
  try {
    await api.post('/api/search/history', { query, userId });
  } catch (error) {
    console.error('Error saving search query:', error);
  }
}

/**
 * Get recent search queries
 * @param limit Maximum number of searches to return (default: 10)
 * @param userId Optional user ID to filter searches by user
 * @returns Promise with array of recent search items
 */
export async function getRecentSearches(limit: number = 10, userId?: string): Promise<RecentSearchItem[]> {
  try {
    let url = `/api/search/recent?limit=${limit}`;
    if (userId) {
      url += `&userId=${encodeURIComponent(userId)}`;
    }
    
    const response = await api.get<RecentSearchesResponse>(url);
    return response.data.searches;
  } catch (error) {
    console.error('Error fetching recent searches:', error);
    return [];
  }
}
