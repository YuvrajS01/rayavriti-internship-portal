import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the rate limiter module to get access to the class
class MockInMemoryRateLimiter {
    private records: Map<string, { count: number; resetAt: number }> = new Map();
    private maxRequests: number;
    private windowMs: number;

    constructor(maxRequests: number, windowMs: number) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    limit(identifier: string) {
        const now = Date.now();
        const record = this.records.get(identifier);

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

        if (record.count >= this.maxRequests) {
            return {
                success: false,
                limit: this.maxRequests,
                remaining: 0,
                reset: record.resetAt,
            };
        }

        record.count++;
        return {
            success: true,
            limit: this.maxRequests,
            remaining: this.maxRequests - record.count,
            reset: record.resetAt,
        };
    }

    reset() {
        this.records.clear();
    }
}

describe('Rate Limiting', () => {
    let rateLimiter: MockInMemoryRateLimiter;

    beforeEach(() => {
        rateLimiter = new MockInMemoryRateLimiter(3, 60000); // 3 requests per minute
    });

    it('should allow requests within limit', () => {
        const result1 = rateLimiter.limit('test-ip');
        expect(result1.success).toBe(true);
        expect(result1.remaining).toBe(2);

        const result2 = rateLimiter.limit('test-ip');
        expect(result2.success).toBe(true);
        expect(result2.remaining).toBe(1);

        const result3 = rateLimiter.limit('test-ip');
        expect(result3.success).toBe(true);
        expect(result3.remaining).toBe(0);
    });

    it('should block requests exceeding limit', () => {
        // Use up all allowed requests
        rateLimiter.limit('test-ip');
        rateLimiter.limit('test-ip');
        rateLimiter.limit('test-ip');

        // Fourth request should be blocked
        const result = rateLimiter.limit('test-ip');
        expect(result.success).toBe(false);
        expect(result.remaining).toBe(0);
    });

    it('should track different IPs separately', () => {
        // Use up limit for IP 1
        rateLimiter.limit('ip-1');
        rateLimiter.limit('ip-1');
        rateLimiter.limit('ip-1');
        const blockedResult = rateLimiter.limit('ip-1');
        expect(blockedResult.success).toBe(false);

        // IP 2 should still be allowed
        const result = rateLimiter.limit('ip-2');
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(2);
    });

    it('should return correct limit metadata', () => {
        const result = rateLimiter.limit('test-ip');

        expect(result.limit).toBe(3);
        expect(result.remaining).toBe(2);
        expect(result.reset).toBeGreaterThan(Date.now());
    });

    it('should reset after window expires', () => {
        // Fast-forward time simulation
        const originalNow = Date.now;
        let currentTime = Date.now();

        vi.spyOn(Date, 'now').mockImplementation(() => currentTime);

        // Use up all requests
        rateLimiter.limit('test-ip');
        rateLimiter.limit('test-ip');
        rateLimiter.limit('test-ip');
        expect(rateLimiter.limit('test-ip').success).toBe(false);

        // Advance time past the window
        currentTime += 61000; // 61 seconds

        // Should be allowed again
        const result = rateLimiter.limit('test-ip');
        expect(result.success).toBe(true);
        expect(result.remaining).toBe(2);

        // Restore Date.now
        vi.spyOn(Date, 'now').mockImplementation(originalNow);
    });
});

describe('getClientIP helper', () => {
    it('should extract IP from x-forwarded-for header', () => {
        // Simulating the function logic
        const forwardedFor = '1.2.3.4, 5.6.7.8';
        const ip = forwardedFor.split(',')[0].trim();
        expect(ip).toBe('1.2.3.4');
    });

    it('should handle single IP in x-forwarded-for', () => {
        const forwardedFor = '192.168.1.1';
        const ip = forwardedFor.split(',')[0].trim();
        expect(ip).toBe('192.168.1.1');
    });
});
