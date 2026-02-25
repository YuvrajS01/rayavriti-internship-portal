"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, GraduationCap, ArrowLeft, CheckCircle2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";

function GoogleIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const verified = searchParams.get("verified");

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        setError(null);

        try {
            const result = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false,
            });

            if (result?.error) {
                // Check for specific error types
                if (result.error.includes("EMAIL_NOT_VERIFIED")) {
                    setError("Please verify your email before logging in.");
                    return;
                }
                setError("Invalid email or password");
                return;
            }

            // Fetch the session to check user role
            const response = await fetch("/api/auth/session");
            if (!response.ok) {
                throw new Error("Failed to fetch session");
            }
            const session = await response.json();

            // Redirect based on role
            if (session?.user?.role === "admin") {
                router.push("/admin");
            } else {
                router.push(callbackUrl);
            }
            router.refresh();
        } catch {
            setError("Something went wrong. Please try again.");
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        setError(null);
        try {
            await signIn("google", { callbackUrl: callbackUrl });
        } catch {
            setError("Failed to sign in with Google");
            setIsGoogleLoading(false);
        }
    };

    return (
        <>
            {/* Verification Success Banner */}
            {verified && (
                <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/20 text-success text-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    Email verified successfully! You can now sign in.
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                    {error}
                </div>
            )}

            {/* Google Sign-In Button */}
            <button
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-border-primary
                           bg-background-secondary/50 hover:bg-background-secondary text-foreground
                           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
                {isGoogleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <GoogleIcon />
                )}
                <span className="font-medium">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border-primary" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background-primary px-3 text-foreground-subtle">or sign in with email</span>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label htmlFor="email" className="label">Email</label>
                    <input
                        {...register("email")}
                        type="email"
                        id="email"
                        placeholder="you@example.com"
                        className="input"
                        disabled={isSubmitting}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-error">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className="label">Password</label>
                    <div className="relative">
                        <input
                            {...register("password")}
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="••••••••"
                            className="input pr-10"
                            disabled={isSubmitting}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground-muted"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1 text-sm text-error">{errors.password.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary w-full py-3"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Signing in...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </button>
            </form>
        </>
    );
}

function LoginFormSkeleton() {
    return (
        <div className="space-y-5 animate-pulse">
            <div className="h-12 bg-background-tertiary rounded-xl" />
            <div className="h-px bg-background-tertiary" />
            <div>
                <div className="h-4 w-12 bg-background-tertiary rounded mb-2" />
                <div className="h-12 bg-background-tertiary rounded" />
            </div>
            <div>
                <div className="h-4 w-16 bg-background-tertiary rounded mb-2" />
                <div className="h-12 bg-background-tertiary rounded" />
            </div>
            <div className="h-12 bg-background-tertiary rounded" />
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-tertiary/10 rounded-full blur-[128px]" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to home
                </Link>

                {/* Card */}
                <div className="card-glass p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-foreground-muted text-sm">
                            Sign in to continue to your dashboard
                        </p>
                    </div>

                    <Suspense fallback={<LoginFormSkeleton />}>
                        <LoginForm />
                    </Suspense>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-foreground-muted">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-accent-primary hover:underline font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
