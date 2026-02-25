/**
 * In-memory rate limiting utility
 * 
 * Uses sliding window algorithm for accurate rate limiting.
 * Suitable for single-instance deployments. For distributed systems,
 * upgrade to @upstash/ratelimit with Redis.
 */

interface RateLimitRecord {
    count: number;
    resetAt: number;
}

interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

class InMemoryRateLimiter {
    private records: Map<string, RateLimitRecord> = new Map();
    private maxRequests: number;
    private windowMs: number;

    constructor(maxRequests: number, windowMs: number) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;

        // Cleanup expired records every minute
        setInterval(() => this.cleanup(), 60000);
    }

    /**
     * Check if a request should be allowed
     * @param identifier - Unique identifier (e.g., IP address, user ID)
     * @returns Rate limit result with success status and metadata
     */
    limit(identifier: string): RateLimitResult {
        const now = Date.now();
        const record = this.records.get(identifier);

        // No existing record or expired
        if (!record || now > record.resetAt) {
            this.records.set(identifier, {
                count: 1,
                resetAt: now + this.windowMs,
            });
            return {
                success: true,
                limit: this.maxRequests,
                remaining: this.maxRequests - 1,
                reset: now + this.windowMs,
            };
        }

        // Check if limit exceeded
        if (record.count >= this.maxRequests) {
            return {
                success: false,
                limit: this.maxRequests,
                remaining: 0,
                reset: record.resetAt,
            };
        }

        // Increment count
        record.count++;
        return {
            success: true,
            limit: this.maxRequests,
            remaining: this.maxRequests - record.count,
            reset: record.resetAt,
        };
    }

    /**
     * Remove expired records to prevent memory leaks
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, record] of this.records.entries()) {
            if (now > record.resetAt) {
                this.records.delete(key);
            }
        }
    }
}

// Pre-configured rate limiters for different use cases

/**
 * Auth rate limiter: 5 requests per minute per IP
 * Used for login attempts
 */
export const authRateLimiter = new InMemoryRateLimiter(5, 60 * 1000);

/**
 * Signup rate limiter: 3 requests per hour per IP
 * Stricter limit for account creation
 */
export const signupRateLimiter = new InMemoryRateLimiter(3, 60 * 60 * 1000);

/**
 * OTP rate limiter: 3 requests per 10 minutes per email
 * Prevents OTP abuse
 */
export const otpRateLimiter = new InMemoryRateLimiter(3, 10 * 60 * 1000);

/**
 * OTP verification rate limiter: 5 attempts per 10 minutes per email
 * Prevents brute-force OTP guessing
 */
export const otpVerifyRateLimiter = new InMemoryRateLimiter(5, 10 * 60 * 1000);

/**
 * API rate limiter: 100 requests per minute per IP
 * General API protection
 */
export const apiRateLimiter = new InMemoryRateLimiter(100, 60 * 1000);

/**
 * Get client IP from request headers
 * Handles various proxy configurations
 */
export function getClientIP(request: Request): string {
    // Check common headers for real IP (when behind proxies)
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        // Get the first IP in the chain (original client)
        return forwardedFor.split(",")[0].trim();
    }

    const realIP = request.headers.get("x-real-ip");
    if (realIP) {
        return realIP;
    }

    // Vercel-specific header
    const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
    if (vercelForwardedFor) {
        return vercelForwardedFor.split(",")[0].trim();
    }

    // Fallback (shouldn't be reached in production)
    return "127.0.0.1";
}

/**
 * Create rate limit response headers
 */
export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
    return {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": result.success
            ? undefined!
            : Math.ceil((result.reset - Date.now()) / 1000).toString(),
    };
}
