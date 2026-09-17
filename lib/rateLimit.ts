import { NextRequest } from "next/server";

interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
  retryAfterMs: number;
}

interface Tracker {
  timestamps: number[];
}

// Global in-memory storage for sliding window timestamps
const storage = new Map<string, Tracker>();
const MAX_TRACKED_KEYS = 5000;

// Periodic cleanup of stale entries every 5 minutes
let lastCleanup = Date.now();
function cleanupStale(now: number) {
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;

  for (const [k, tracker] of storage.entries()) {
    // If no timestamps in the last 1 hour, remove
    if (tracker.timestamps.length === 0 || now - tracker.timestamps[tracker.timestamps.length - 1] > 3600 * 1000) {
      storage.delete(k);
    }
  }
}

/**
 * High-performance sliding-window in-memory rate limiter.
 */
export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const { key, limit, windowMs } = options;
  const now = Date.now();

  cleanupStale(now);

  let tracker = storage.get(key);
  if (!tracker) {
    if (storage.size >= MAX_TRACKED_KEYS) {
      const oldestKey = storage.keys().next().value;
      if (oldestKey) storage.delete(oldestKey);
    }
    tracker = { timestamps: [] };
    storage.set(key, tracker);
  }

  // Filter out timestamps outside the sliding window
  const windowStart = now - windowMs;
  tracker.timestamps = tracker.timestamps.filter((ts) => ts > windowStart);

  if (tracker.timestamps.length >= limit) {
    const oldestInWindow = tracker.timestamps[0];
    const retryAfterMs = Math.max(0, oldestInWindow + windowMs - now);
    return {
      success: false,
      limit,
      remaining: 0,
      resetMs: retryAfterMs,
      retryAfterMs,
    };
  }

  // Record this request
  tracker.timestamps.push(now);

  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - tracker.timestamps.length),
    resetMs: windowMs,
    retryAfterMs: 0,
  };
}

/**
 * Extract reliable client IP from standard proxy/CDN headers.
 */
export function getClientIp(req: Request | NextRequest): string {
  const headers = req.headers;
  
  // Cloudflare Connecting IP
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  // Standard X-Forwarded-For (take the client/first IP)
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  // X-Real-IP
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}
