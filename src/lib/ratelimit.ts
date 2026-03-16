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

function firstHeaderIP(value: string | null): string | null {
    if (!value) return null;
    const ip = value.split(",")[0]?.trim();
    return ip || null;
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
    // Prefer platform-set headers over generic forwarding headers.
    const platformIP =
        firstHeaderIP(request.headers.get("x-vercel-forwarded-for")) ||
        firstHeaderIP(request.headers.get("cf-connecting-ip")) ||
        firstHeaderIP(request.headers.get("x-real-ip"));

    if (platformIP) {
        return platformIP;
    }

    // Generic forwarding headers are easily spoofed unless explicitly trusted.
    if (process.env.TRUST_X_FORWARDED_FOR === "true") {
        const forwardedFor = firstHeaderIP(request.headers.get("x-forwarded-for"));
        if (forwardedFor) {
            return forwardedFor;
        }
    }

    // Stable fallback identifier.
    return "unknown";
}

/**
 * Create rate limit response headers
 */
export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
    const headers: HeadersInit = {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
    };

    if (!result.success) {
        (headers as Record<string, string>)["Retry-After"] = Math.ceil(
            (result.reset - Date.now()) / 1000
        ).toString();
    }

    return headers;
}
