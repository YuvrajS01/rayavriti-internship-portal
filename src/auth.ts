import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

// Login credentials schema
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // Validate credentials
                const parsed = loginSchema.safeParse(credentials);
                if (!parsed.success) {
                    return null;
                }

                const { email, password } = parsed.data;

                // Find user by email
                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email.toLowerCase()))
                    .limit(1);

                if (!user) {
                    return null;
                }

                // Check if user has a password (OAuth-only users don't)
                if (!user.password) {
                    return null;
                }

                // Check if email is verified
                if (!user.emailVerified) {
                    throw new Error("EMAIL_NOT_VERIFIED");
                }

                // Verify password
                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    return null;
                }

                // Return user object (excluding password)
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    image: user.image,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            // Handle Google OAuth sign-in
            if (account?.provider === "google") {
                if (!user.email) return false;

                const email = user.email.toLowerCase();

                // Check if user already exists
                const [existingUser] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email))
                    .limit(1);

                if (existingUser) {
                    // Update existing user with Google info if not already set
                    if (!existingUser.emailVerified || !existingUser.image) {
                        await db
                            .update(users)
                            .set({
                                emailVerified: existingUser.emailVerified || new Date(),
                                image: existingUser.image || user.image || null,
                                updatedAt: new Date(),
                            })
                            .where(eq(users.id, existingUser.id));
                    }
                } else {
                    // Create new user from Google account
                    await db.insert(users).values({
                        name: user.name || "Google User",
                        email: email,
                        password: null, // No password for OAuth users
                        role: "user",
                        emailVerified: new Date(), // Google emails are pre-verified
                        image: user.image || null,
                    });
                }
            }

            return true;
        },
        async jwt({ token, user, account }) {
            // On initial sign-in, get user data from DB
            if (user && user.email) {
                const [dbUser] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, user.email.toLowerCase()))
                    .limit(1);

                if (dbUser) {
                    token.id = dbUser.id;
                    token.role = dbUser.role;
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Add user data to session
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Handle redirects after login
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
    },
    trustHost: true,
});
