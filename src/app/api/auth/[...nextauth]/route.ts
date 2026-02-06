import { handlers } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { authRateLimiter, getClientIP, rateLimitHeaders } from "@/lib/ratelimit";

// GET handler (not rate limited - used for session checks)
export const { GET } = handlers;

// POST handler with rate limiting for login attempts
export async function POST(request: NextRequest) {
    // Rate limiting: 5 login attempts per minute per IP
    const ip = getClientIP(request);
    const rateLimit = authRateLimiter.limit(ip);

    if (!rateLimit.success) {
        return NextResponse.json(
            { error: "Too many login attempts. Please try again later." },
            { status: 429, headers: rateLimitHeaders(rateLimit) }
        );
    }

    // Pass to NextAuth handler
    return handlers.POST(request);
}
