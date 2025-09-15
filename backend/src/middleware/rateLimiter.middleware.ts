import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = req.ip || 'unknown';
      const now = Date.now();

      if (!this.store[key] || now > this.store[key].resetTime) {
        this.store[key] = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        return next();
      }

      if (this.store[key].count >= this.maxRequests) {
        return res.status(429).json({
          message: 'Too many requests. Please try again later.',
          resetTime: this.store[key].resetTime,
        });
      }

      this.store[key].count++;
      next();
    };
  }
}

// Auth endpoints rate limiting (stricter)
export const authRateLimit = new RateLimiter(15 * 60 * 1000, 5).middleware(); // 5 requests per 15 minutes

// General API rate limiting
export const apiRateLimit = new RateLimiter(15 * 60 * 1000, 100).middleware(); // 100 requests per 15 minutes