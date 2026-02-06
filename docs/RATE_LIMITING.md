# Rate Limiting Implementation Guide

## Overview

This guide describes how to implement rate limiting for the authentication endpoints to prevent brute-force attacks.

## Recommended Package

Use `@upstash/ratelimit` with `@upstash/redis` for serverless-compatible rate limiting.

```bash
npm install @upstash/ratelimit @upstash/redis
```

## Setup

### 1. Add Environment Variables

Add to `.env`:
```
UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### 2. Create Rate Limiter

Create `src/lib/ratelimit.ts`:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter that allows 5 requests per minute
export const authRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "ratelimit:auth",
});

// Stricter limiter for signup
export const signupRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: true,
    prefix: "ratelimit:signup",
});
```

### 3. Apply to Routes

In `src/app/api/signup/route.ts`:

```typescript
import { signupRatelimit } from "@/lib/ratelimit";

export async function POST(request: Request) {
    // Get client IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
    
    // Check rate limit
    const { success, limit, remaining } = await signupRatelimit.limit(ip);
    
    if (!success) {
        return NextResponse.json(
            { error: "Too many signup attempts. Try again later." },
            { 
                status: 429,
                headers: {
                    "X-RateLimit-Limit": limit.toString(),
                    "X-RateLimit-Remaining": remaining.toString(),
                }
            }
        );
    }
    
    // Continue with signup logic...
}
```

## Alternative: In-Memory (Development Only)

For development without Redis:

```typescript
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxAttempts = 5, windowMs = 60000): boolean {
    const now = Date.now();
    const record = attempts.get(ip);
    
    if (!record || now > record.resetAt) {
        attempts.set(ip, { count: 1, resetAt: now + windowMs });
        return true;
    }
    
    if (record.count >= maxAttempts) {
        return false;
    }
    
    record.count++;
    return true;
}
```

> **Warning**: In-memory rate limiting doesn't work in serverless environments with multiple instances.

## Endpoints to Protect

| Endpoint | Recommended Limit |
|----------|-------------------|
| POST /api/signup | 3 per hour per IP |
| POST /api/auth/callback/credentials | 5 per minute per IP |
| POST /api/user/password | 3 per hour per user |
