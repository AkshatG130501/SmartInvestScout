import { Router } from 'express';
import { PerplexityService } from '../utils/perplexityService';

const router = Router();
const perplexityService = PerplexityService.getInstance();

// get insights for a stock
router.get('/:stock_name', async (req, res) => {
  try {
    const stock_name = req.params.stock_name.toUpperCase();
    const stream = req.query.stream === 'true';

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const dataStream = await perplexityService.getStockInsightsStream(stock_name);

      for await (const chunk of dataStream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(`data: ${content}\n\n`);
        }
      }

      res.end();
    } else {
      const insights = await perplexityService.getStockInsights(stock_name);
      res.json(insights);
    }
  } catch (error) {
    console.error('Error in insights route:', error);
    res.status(500).json({
      error: 'Failed to fetch stock insights',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

export const insightsRouter = router;
