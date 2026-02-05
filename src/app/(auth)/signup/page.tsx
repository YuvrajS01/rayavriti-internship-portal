"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, GraduationCap, ArrowLeft, Check } from "lucide-react";
import { signupSchema, type SignupInput } from "@/lib/validations";

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<SignupInput>({
        resolver: zodResolver(signupSchema),
    });

    const password = watch("password", "");

    const passwordStrength = {
        hasLength: password.length >= 6,
        hasNumber: /\d/.test(password),
        hasLetter: /[a-zA-Z]/.test(password),
    };

    const onSubmit = async (data: SignupInput) => {
        setError(null);

        try {
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Something went wrong");
                return;
            }

            // Redirect to login on success
            router.push("/login?registered=true");
        } catch {
            setError("Network error. Please try again.");
        }
    };

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
                        <h1 className="text-2xl font-bold mb-2">Create Account</h1>
                        <p className="text-foreground-muted text-sm">
                            Start your learning journey today
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="label">Full Name</label>
                            <input
                                {...register("name")}
                                type="text"
                                id="name"
                                placeholder="John Doe"
                                className="input"
                                disabled={isSubmitting}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-error">{errors.name.message}</p>
                            )}
                        </div>

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
                            <label htmlFor="mobile" className="label">
                                Mobile Number <span className="text-foreground-subtle">(Optional)</span>
                            </label>
                            <input
                                {...register("mobile")}
                                type="tel"
                                id="mobile"
                                placeholder="9876543210"
                                className="input"
                                disabled={isSubmitting}
                            />
                            {errors.mobile && (
                                <p className="mt-1 text-sm text-error">{errors.mobile.message}</p>
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

                            {/* Password Strength */}
                            {password && (
                                <div className="mt-2 space-y-1">
                                    {Object.entries({
                                        "At least 6 characters": passwordStrength.hasLength,
                                        "Contains a number": passwordStrength.hasNumber,
                                        "Contains a letter": passwordStrength.hasLetter,
                                    }).map(([label, met]) => (
                                        <div
                                            key={label}
                                            className={`flex items-center gap-2 text-xs ${met ? "text-success" : "text-foreground-subtle"}`}
                                        >
                                            <Check className={`w-3 h-3 ${met ? "opacity-100" : "opacity-30"}`} />
                                            {label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                            <input
                                {...register("confirmPassword")}
                                type={showPassword ? "text" : "password"}
                                id="confirmPassword"
                                placeholder="••••••••"
                                className="input"
                                disabled={isSubmitting}
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-error">{errors.confirmPassword.message}</p>
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
                                    Creating account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-foreground-muted">
                        Already have an account?{" "}
                        <Link href="/login" className="text-accent-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
