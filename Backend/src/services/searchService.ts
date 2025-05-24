/**
 * @file Search service
 * @description Provides search-related functionality including search suggestions
 */

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { popularStocks, investmentDomains } from '../data/stockSymbols';

// Initialize Supabase client (assuming it's used in the project based on memories)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Cache for suggestions to reduce API calls
const suggestionsCache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get search suggestions based on user input
 * Uses a combination of popular stocks/companies and cached search terms
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  // If query is empty, return empty array
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.trim().toLowerCase();
  
  // Check cache first
  if (suggestionsCache.has(normalizedQuery)) {
    const cached = suggestionsCache.get(normalizedQuery);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    let suggestions: string[] = [];
    
    try {
      // Try to get suggestions from Financial Modeling Prep API
      const response = await axios.get(
        `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(normalizedQuery)}&limit=10&apikey=${process.env.FMP_API_KEY || 'demo'}`,
        { timeout: 3000 } // Set a timeout to fail fast if API is unavailable
      );
      
      if (response.data && Array.isArray(response.data)) {
        // Extract company names and symbols
        suggestions = response.data.map((item: any) => 
          item.symbol ? `${item.symbol} - ${item.name}` : item.name
        );
      }
    } catch (apiError) {
      console.warn('API request failed, using fallback data:', apiError);
      // Use fallback data source if API request fails
      suggestions = popularStocks
        .filter(stock => 
          stock.symbol.toLowerCase().includes(normalizedQuery) || 
          stock.name.toLowerCase().includes(normalizedQuery) ||
          (stock.sector && stock.sector.toLowerCase().includes(normalizedQuery))
        )
        .map(stock => `${stock.symbol} - ${stock.name}`)
        .slice(0, 10);
    }
    
    // Add domain-specific suggestions
    const matchingDomains = investmentDomains.filter(
      domain => domain.toLowerCase().includes(normalizedQuery)
    ).slice(0, 5);
    
    if (matchingDomains.length > 0) {
      suggestions = [...suggestions, ...matchingDomains];
    }

    // Also check user's previous searches from the database
    // Using simple ILIKE query that works with standard B-tree index
    const { data: historyData } = await supabase
      .from('search_history')
      .select('query')
      .or(`query.ilike.%${normalizedQuery}%,query.eq.${normalizedQuery}`)
      .order('timestamp', { ascending: false })
      .limit(5);

    if (historyData && historyData.length > 0) {
      const historyItems = historyData.map(item => item.query);
      suggestions = [...new Set([...suggestions, ...historyItems])];
    }

    // Limit to top 10 suggestions
    const limitedSuggestions = suggestions.slice(0, 10);
    
    // Cache the results
    suggestionsCache.set(normalizedQuery, {
      data: limitedSuggestions,
      timestamp: Date.now()
    });

    return limitedSuggestions;
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return [];
  }
}

/**
 * Save a search query to history
 */
export async function saveSearchQuery(query: string, userId?: string): Promise<void> {
  if (!query || query.trim().length === 0) {
    return;
  }

  try {
    await supabase.from('search_history').insert({
      query: query.trim(),
      user_id: userId || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving search query:', error);
  }
}

/**
 * Get recent search queries
 * @param limit Maximum number of searches to return
 * @param userId Optional user ID to filter searches by user
 * @returns Array of recent search queries
 */
export async function getRecentSearches(limit: number = 10, userId?: string): Promise<{ id: string; query: string; timestamp: string }[]> {
  try {
    let query = supabase
      .from('search_history')
      .select('id, query, timestamp')
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    // Filter by user ID if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching recent searches:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching recent searches:', error);
    return [];
  }
}
