import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

/**
 * Rate limiting middleware
 * Limits requests per user based on their user ID
 */
export function rateLimitMiddleware(config: RateLimitConfig) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const userId = req.user.id;
      const key = `rate-limit:${userId}`;

      // Get current request count
      const currentCount = await redis.get(key);

      if (currentCount === null) {
        // First request in the window
        await redis.set(key, '1', 'PX', config.windowMs);
        next();
        return;
      }

      const count = parseInt(currentCount, 10);

      if (count >= config.maxRequests) {
        // Rate limit exceeded
        const ttl = await redis.pttl(key);
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil(ttl / 1000), // Convert to seconds
        });
        return;
      }

      // Increment counter
      await redis.incr(key);
      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      // On Redis error, allow the request to proceed
      next();
    }
  };
}

/**
 * AI chat rate limiter - 10 requests per minute
 */
export const aiChatRateLimit = rateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
});
