import { Request, Response } from 'express';
import { PerplexityService } from '../utils/perplexityService';
import { logger } from '../utils/logger';

export class InsightsController {
  private static instance: InsightsController;
  private perplexityService: PerplexityService;

  private constructor() {
    this.perplexityService = PerplexityService.getInstance();
  }

  public static getInstance(): InsightsController {
    if (!InsightsController.instance) {
      InsightsController.instance = new InsightsController();
    }
    return InsightsController.instance;
  }

  public async getStockInsights(req: Request, res: Response) {
    try {
      const stock_name = req.params.stock_name.toUpperCase();
      const stream = req.query.stream === 'true';

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const dataStream = await this.perplexityService.getStockInsightsStream(stock_name);

        for await (const chunk of dataStream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            res.write(`data: ${content}\n\n`);
          }
        }

        res.end();
      } else {
        const insights = await this.perplexityService.getStockInsights(stock_name);
        res.json(insights);
      }
    } catch (error) {
      logger.error('Error in insights route:', error);
      res.status(500).json({
        error: 'Failed to fetch stock insights',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }
}
