"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    Award,
    User,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
    { href: "/dashboard/certificates", label: "Certificates", icon: Award },
    { href: "/dashboard/profile", label: "Profile", icon: User },
];

function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <aside className={cn("w-64 bg-background-secondary border-r border-border", className)}>
            <div className="h-full flex flex-col">
                {/* Nav Links */}
                <nav className="flex-1 p-4 space-y-1">
                    {sidebarLinks.map((link) => {
                        const isActive = link.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname.startsWith(link.href);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-accent-primary/10 text-accent-primary"
                                        : "text-foreground-muted hover:text-foreground hover:bg-background-tertiary"
                                )}
                            >
                                <link.icon className="w-5 h-5" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sign Out */}
                <div className="p-4 border-t border-border">
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-background-tertiary transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-[calc(100vh-4rem)] flex">
            {/* Desktop Sidebar */}
            <Sidebar className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)]" />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div
                className={cn(
                    "fixed left-0 top-16 h-[calc(100vh-4rem)] z-50 transform transition-transform lg:hidden",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64">
                {/* Mobile Header */}
                <div className="lg:hidden sticky top-16 z-30 bg-background border-b border-border px-4 py-3">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="flex items-center gap-2 text-foreground-muted hover:text-foreground"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        <span className="text-sm font-medium">Menu</span>
                    </button>
                </div>

                {/* Page Content */}
                <div className="p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
