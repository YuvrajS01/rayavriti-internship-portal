import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
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
        async jwt({ token, user }) {
            // Persist user data to token on login
            if (user) {
                token.id = user.id as string;
                token.role = (user as { role: string }).role;
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
