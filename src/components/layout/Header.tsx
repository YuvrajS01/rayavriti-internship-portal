"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
];

export function Header() {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-[#D9FD3A] flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-[#11110B]" />
                        </div>
                        <span className="text-xl font-bold text-[#D9FD3A]">Rayavriti</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                    isActive(link.href)
                                        ? "text-foreground bg-background-tertiary"
                                        : "text-foreground-muted hover:text-foreground hover:bg-background-tertiary"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {status === "loading" ? (
                            <div className="w-20 h-10 bg-background-tertiary rounded-lg animate-pulse" />
                        ) : session ? (
                            <>
                                <Link
                                    href={session.user.role === "admin" ? "/admin" : "/dashboard"}
                                    className="btn btn-secondary text-sm"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="btn btn-ghost text-sm"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="btn btn-ghost text-sm">
                                    Login
                                </Link>
                                <Link href="/signup" className="btn btn-primary text-sm">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-foreground-muted hover:text-foreground"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden glass border-t border-border">
                    <div className="px-4 py-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "block px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                    isActive(link.href)
                                        ? "text-foreground bg-background-tertiary"
                                        : "text-foreground-muted hover:text-foreground"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-border space-y-2">
                            {session ? (
                                <>
                                    <Link
                                        href={session.user.role === "admin" ? "/admin" : "/dashboard"}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block btn btn-secondary text-sm w-full"
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            signOut({ callbackUrl: "/" });
                                        }}
                                        className="btn btn-ghost text-sm w-full"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block btn btn-secondary text-sm w-full"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/signup"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block btn btn-primary text-sm w-full"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
