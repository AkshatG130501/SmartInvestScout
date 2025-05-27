/**
 * @file Search routes
 * @description API endpoints for search-related functionality
 */

import express from 'express';
import { SearchController } from '../controllers/searchController';

const router = express.Router();
const searchController = SearchController.getInstance();

/**
 * GET /api/search/suggestions
 * @description Get search suggestions based on user input
 */
router.get('/suggestions', searchController.getSearchSuggestions.bind(searchController));

/**
 * POST /api/search/history
 * @description Save a search query to history
 */
router.post('/history', searchController.saveSearchHistory.bind(searchController));

/**
 * GET /api/search/recent
 * @description Get recent search queries
 */
router.get('/recent', searchController.getRecentSearches.bind(searchController));

export default router;
