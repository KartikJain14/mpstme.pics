import rateLimit from "express-rate-limit";

// Apply this globally in index.ts
export const rateLimiter = rateLimit({
    windowMs: 3 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
});
