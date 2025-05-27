import { Request, Response } from 'express';
import {
  getSearchSuggestions,
  saveSearchQuery,
  getRecentSearches,
} from '../services/searchService';
import { logger } from '../utils/logger';

export class SearchController {
  private static instance: SearchController;

  private constructor() {}

  public static getInstance(): SearchController {
    if (!SearchController.instance) {
      SearchController.instance = new SearchController();
    }
    return SearchController.instance;
  }

  public async getSearchSuggestions(req: Request, res: Response) {
    try {
      const { query } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      const suggestions = await getSearchSuggestions(query);
      return res.json({ suggestions });
    } catch (error) {
      logger.error('Error in search suggestions endpoint:', error);
      return res.status(500).json({ error: 'Failed to fetch search suggestions' });
    }
  }

  public async saveSearchHistory(req: Request, res: Response) {
    try {
      const { query, userId } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      await saveSearchQuery(query, userId);
      return res.json({ success: true });
    } catch (error) {
      logger.error('Error in save search history endpoint:', error);
      return res.status(500).json({ error: 'Failed to save search query' });
    }
  }

  public async getRecentSearches(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const userId = req.query.userId as string | undefined;

      const recentSearches = await getRecentSearches(limit, userId);
      return res.json({ searches: recentSearches });
    } catch (error) {
      logger.error('Error in recent searches endpoint:', error);
      return res.status(500).json({ error: 'Failed to fetch recent searches' });
    }
  }
}
