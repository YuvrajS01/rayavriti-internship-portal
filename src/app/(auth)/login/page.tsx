"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, GraduationCap, ArrowLeft } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        setError(null);

        const result = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid email or password");
        } else {
            // Fetch the session to check user role
            const response = await fetch("/api/auth/session");
            const session = await response.json();

            // Redirect based on role
            if (session?.user?.role === "admin") {
                router.push("/admin");
            } else {
                router.push(callbackUrl);
            }
            router.refresh();
        }
    };

    return (
        <>
            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                    {error}
                </div>
            )}

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
