/**
 * @file Search routes
 * @description API endpoints for search-related functionality
 */

import express from 'express';
import { getSearchSuggestions, saveSearchQuery, getRecentSearches } from '../services/searchService';

const searchRouter = express.Router();

/**
 * GET /api/search/suggestions
 * @description Get search suggestions based on user input
 */
searchRouter.get('/suggestions', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const suggestions = await getSearchSuggestions(query);
    return res.json({ suggestions });
  } catch (error) {
    console.error('Error in search suggestions endpoint:', error);
    return res.status(500).json({ error: 'Failed to fetch search suggestions' });
  }
});

/**
 * POST /api/search/history
 * @description Save a search query to history
 */
searchRouter.post('/history', async (req, res) => {
  try {
    const { query, userId } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    await saveSearchQuery(query, userId);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error in save search history endpoint:', error);
    return res.status(500).json({ error: 'Failed to save search query' });
  }
});

/**
 * GET /api/search/recent
 * @description Get recent search queries
 */
searchRouter.get('/recent', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const userId = req.query.userId as string | undefined;
    
    const recentSearches = await getRecentSearches(limit, userId);
    return res.json({ searches: recentSearches });
  } catch (error) {
    console.error('Error in recent searches endpoint:', error);
    return res.status(500).json({ error: 'Failed to fetch recent searches' });
  }
});

export { searchRouter };
