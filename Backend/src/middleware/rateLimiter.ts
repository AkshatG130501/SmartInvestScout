import rateLimit from 'express-rate-limit';
import { AppError } from './errorHandler';

export const createRateLimiter = () => {
  return rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    handler: (req, res) => {
      throw new AppError(429, 'Too many requests from this IP, please try again later.');
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};
