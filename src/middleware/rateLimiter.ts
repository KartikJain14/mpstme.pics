import rateLimit from 'express-rate-limit';

// Apply this globally in index.ts
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min window
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
