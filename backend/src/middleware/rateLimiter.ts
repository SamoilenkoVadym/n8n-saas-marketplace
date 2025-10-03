import { Response, NextFunction } from 'express';
import { createClient } from 'redis';
import { AuthRequest } from './auth';

// Create Redis client
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect().catch(console.error);

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
  keyPrefix?: string;
}

/**
 * Create a rate limiter middleware
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later',
    keyPrefix = 'rl',
  } = options;

  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Get identifier (IP or user ID)
      const identifier = req.user?.id || req.ip || 'anonymous';
      const key = `${keyPrefix}:${identifier}`;

      // Get current count
      const current = await redisClient.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= max) {
        res.status(429).json({
          error: message,
          retryAfter: Math.ceil(windowMs / 1000),
        });
        return;
      }

      // Increment count
      const newCount = count + 1;
      await redisClient.set(key, newCount.toString(), {
        PX: windowMs,
        NX: count === 0, // Only set expiry on first request
      });

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', max.toString());
      res.setHeader('X-RateLimit-Remaining', (max - newCount).toString());
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail open - don't block requests if Redis is down
      next();
    }
  };
}

/**
 * Predefined rate limiters for different endpoints
 */

// Auth endpoints: 5 requests per minute
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many authentication attempts, please try again in a minute',
  keyPrefix: 'rl:auth',
});

// AI endpoints: 10 requests per minute
export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many AI requests, please try again in a minute',
  keyPrefix: 'rl:ai',
});

// Template endpoints: 100 requests per minute
export const templateRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests, please try again in a minute',
  keyPrefix: 'rl:template',
});

// General API: 60 requests per minute
export const generalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: 'Too many requests, please try again in a minute',
  keyPrefix: 'rl:general',
});

export default {
  createRateLimiter,
  authRateLimiter,
  aiRateLimiter,
  templateRateLimiter,
  generalRateLimiter,
};
