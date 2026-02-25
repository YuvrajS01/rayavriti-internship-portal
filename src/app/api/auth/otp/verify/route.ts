import { NextRequest, NextResponse } from "next/server";
import { db, users, verificationTokens } from "@/db";
import { eq, and, gt } from "drizzle-orm";
import { otpVerifySchema } from "@/lib/validations";
import { otpVerifyRateLimiter, getClientIP, rateLimitHeaders } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
    try {
        // Rate limit by IP
        const ip = getClientIP(req);
        const rateLimit = otpVerifyRateLimiter.limit(ip);

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Too many verification attempts. Please try again later." },
                { status: 429, headers: rateLimitHeaders(rateLimit) }
            );
        }

        const body = await req.json();

        // Validate input
        const result = otpVerifySchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid verification code or email" },
                { status: 400 }
            );
        }

        const { email, otp } = result.data;

        // Find user
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);

        if (!user) {
            return NextResponse.json(
                { error: "Invalid verification code" },
                { status: 400 }
            );
        }

        // Check if already verified
        if (user.emailVerified) {
            return NextResponse.json(
                { message: "Email is already verified", verified: true },
                { status: 200 }
            );
        }

        // Also rate limit by email
        const emailRateLimit = otpVerifyRateLimiter.limit(`verify:${email.toLowerCase()}`);
        if (!emailRateLimit.success) {
            return NextResponse.json(
                { error: "Too many attempts for this email. Please wait and try again." },
                { status: 429, headers: rateLimitHeaders(emailRateLimit) }
            );
        }

        // Find valid token
        const [token] = await db
            .select()
            .from(verificationTokens)
            .where(
                and(
                    eq(verificationTokens.userId, user.id),
                    eq(verificationTokens.token, otp),
                    eq(verificationTokens.type, "email"),
                    gt(verificationTokens.expiresAt, new Date())
                )
            )
            .limit(1);

        if (!token) {
            return NextResponse.json(
                { error: "Invalid or expired verification code" },
                { status: 400 }
            );
        }

        // Mark email as verified
        await db
            .update(users)
            .set({ emailVerified: new Date(), updatedAt: new Date() })
            .where(eq(users.id, user.id));

        // Delete all tokens for this user
        await db
            .delete(verificationTokens)
            .where(eq(verificationTokens.userId, user.id));

        return NextResponse.json(
            { message: "Email verified successfully!", verified: true },
            { status: 200 }
        );
    } catch (error) {
        console.error("OTP verify error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
