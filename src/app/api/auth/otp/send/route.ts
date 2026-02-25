import { NextRequest, NextResponse } from "next/server";
import { db, users, verificationTokens } from "@/db";
import { eq, and, gt } from "drizzle-orm";
import { otpResendSchema } from "@/lib/validations";
import { generateOTP, sendOTPEmail } from "@/lib/email";
import { otpRateLimiter, getClientIP, rateLimitHeaders } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
    try {
        // Rate limit by IP
        const ip = getClientIP(req);
        const rateLimit = otpRateLimiter.limit(ip);

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Too many OTP requests. Please try again later." },
                { status: 429, headers: rateLimitHeaders(rateLimit) }
            );
        }

        const body = await req.json();

        // Validate input
        const result = otpResendSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid email address" },
                { status: 400 }
            );
        }

        const { email } = result.data;

        // Find user
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);

        if (!user) {
            // Don't reveal if user exists or not
            return NextResponse.json(
                { message: "If an account exists, a verification code has been sent." },
                { status: 200 }
            );
        }

        // Check if already verified
        if (user.emailVerified) {
            return NextResponse.json(
                { error: "Email is already verified" },
                { status: 400 }
            );
        }

        // Also rate limit by email specifically
        const emailRateLimit = otpRateLimiter.limit(`email:${email.toLowerCase()}`);
        if (!emailRateLimit.success) {
            return NextResponse.json(
                { error: "Too many OTP requests for this email. Please wait a few minutes." },
                { status: 429, headers: rateLimitHeaders(emailRateLimit) }
            );
        }

        // Delete any existing tokens for this user
        await db
            .delete(verificationTokens)
            .where(eq(verificationTokens.userId, user.id));

        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP
        await db.insert(verificationTokens).values({
            userId: user.id,
            token: otp,
            type: "email",
            expiresAt,
        });

        // Send email
        const emailResult = await sendOTPEmail(email, otp, user.name);

        if (!emailResult.success) {
            return NextResponse.json(
                { error: "Failed to send verification email. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Verification code sent to your email." },
            { status: 200 }
        );
    } catch (error) {
        console.error("OTP send error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
