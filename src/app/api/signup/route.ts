import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, users } from "@/db";
import { eq, or } from "drizzle-orm";
import { signupSchema } from "@/lib/validations";
import { signupRateLimiter, getClientIP, rateLimitHeaders } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
    try {
        // Rate limiting: 3 signups per hour per IP
        const ip = getClientIP(req);
        const rateLimit = signupRateLimiter.limit(ip);

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: "Too many signup attempts. Please try again later." },
                { status: 429, headers: rateLimitHeaders(rateLimit) }
            );
        }

        const body = await req.json();

        // Validate input
        const result = signupSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { name, email, mobile, password } = result.data;

        // Check if user already exists
        const existingUser = await db
            .select()
            .from(users)
            .where(
                or(
                    eq(users.email, email.toLowerCase()),
                    mobile ? eq(users.mobile, mobile) : undefined
                )
            )
            .limit(1);

        if (existingUser.length > 0) {
            const existing = existingUser[0];
            if (existing.email === email.toLowerCase()) {
                return NextResponse.json(
                    { error: "Email already registered" },
                    { status: 409 }
                );
            }
            if (mobile && existing.mobile === mobile) {
                return NextResponse.json(
                    { error: "Mobile number already registered" },
                    { status: 409 }
                );
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const [newUser] = await db
            .insert(users)
            .values({
                name,
                email: email.toLowerCase(),
                mobile: mobile || null,
                password: hashedPassword,
                role: "user",
            })
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
            });

        return NextResponse.json(
            { message: "Account created successfully", user: newUser },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
