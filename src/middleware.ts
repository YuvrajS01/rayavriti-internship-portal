import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/dashboard/:path*"];

// Routes that require admin role
const adminRoutes = ["/admin", "/admin/:path*"];

// Routes that should redirect to dashboard if already logged in
const authRoutes = ["/login", "/signup", "/verify-email"];

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;

    const pathname = nextUrl.pathname;

    // Check if accessing auth routes while logged in
    if (authRoutes.some((route) => pathname.startsWith(route.replace(":path*", "")))) {
        if (isLoggedIn) {
            // Redirect to appropriate dashboard based on role
            const redirectUrl = userRole === "admin" ? "/admin" : "/dashboard";
            return NextResponse.redirect(new URL(redirectUrl, nextUrl));
        }
        return NextResponse.next();
    }

    // Check if accessing admin routes
    if (adminRoutes.some((route) => pathname.startsWith(route.replace(":path*", "")))) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", nextUrl));
        }
        if (userRole !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
        return NextResponse.next();
    }

    // Check if accessing protected routes
    if (protectedRoutes.some((route) => pathname.startsWith(route.replace(":path*", "")))) {
        if (!isLoggedIn) {
            const callbackUrl = encodeURIComponent(pathname);
            return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
});

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
