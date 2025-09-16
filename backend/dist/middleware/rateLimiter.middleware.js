"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRateLimit = exports.authRateLimit = void 0;
class RateLimiter {
    constructor(windowMs, maxRequests) {
        this.store = {};
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }
    middleware() {
        return (req, res, next) => {
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
exports.authRateLimit = new RateLimiter(15 * 60 * 1000, 5).middleware(); // 5 requests per 15 minutes
// General API rate limiting
exports.apiRateLimit = new RateLimiter(15 * 60 * 1000, 100).middleware(); // 100 requests per 15 minutes
