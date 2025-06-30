import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate =
  (schema: ZodSchema<any>, key: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[key]);
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }
    next();
  };
