import { Router } from 'express';

const router = Router();

// get insights for a stock
router.get('/:stock_name', (req, res) => {
  const stock_name = req.params.stock_name;
  res.json({ message: `Get insights for ${stock_name}` });
});

export const insightsRouter = router;
