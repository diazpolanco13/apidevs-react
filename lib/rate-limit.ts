import { LRUCache } from 'lru-cache';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface RateLimiterOptions {
  uniqueTokenPerInterval?: number;
  interval?: number;
}

export default function rateLimit(options?: RateLimiterOptions) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000, // Default 1 minuto
  });

  return {
    check: (limit: number, token: string): RateLimitResult => {
      const tokenCount = (tokenCache.get(token) as number[]) || [0];

      if (tokenCount[0] === 0) {
        tokenCache.set(token, tokenCount);
      }

      tokenCount[0] += 1;

      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage > limit;
      const remaining = isRateLimited ? 0 : limit - currentUsage;

      return {
        success: !isRateLimited,
        limit,
        remaining,
        reset: Date.now() + (options?.interval || 60000),
      };
    },
  };
}

// Rate limiters predefinidos para diferentes rutas
export const chatLimiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500,
});

export const stripeLimiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500,
});

export const adminLimiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 100,
});
