"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";
import { Loader2, GraduationCap, ArrowLeft, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";

function VerifyEmailForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Auto-focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Take last character
        setOtp(newOtp);
        setError(null);

        // Auto-advance to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        if (value && index === 5 && newOtp.every((d) => d !== "")) {
            handleVerify(newOtp.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Handle backspace
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pastedData.length === 0) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);
        setError(null);

        // Focus the next empty input or the last one
        const nextEmptyIndex = newOtp.findIndex((d) => d === "");
        inputRefs.current[nextEmptyIndex === -1 ? 5 : nextEmptyIndex]?.focus();

        // Auto-submit if all filled
        if (newOtp.every((d) => d !== "")) {
            handleVerify(newOtp.join(""));
        }
    };

    const handleVerify = async (code: string) => {
        if (!email) {
            setError("Email address is missing. Please go back and sign up again.");
            return;
        }

        setIsVerifying(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp: code }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Invalid verification code");
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
                setIsVerifying(false);
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/login?verified=true");
            }, 2000);
        } catch {
            setError("Network error. Please try again.");
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || !email) return;

        setIsResending(true);
        setError(null);

        try {
            const response = await fetch("/api/auth/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || "Failed to resend code");
            } else {
                setResendCooldown(60); // 60 second cooldown
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">Email Verified!</h2>
                <p className="text-foreground-muted text-sm">Redirecting you to login...</p>
            </div>
        );
    }

    return (
        <>
            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                    {error}
                </div>
            )}

            {/* Email Display */}
            <div className="mb-6 p-4 rounded-lg bg-background-secondary/50 border border-border-primary">
                <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-accent-primary shrink-0" />
                    <div className="min-w-0">
                        <p className="text-xs text-foreground-muted">Verification code sent to</p>
                        <p className="text-sm font-medium truncate">{email || "your email"}</p>
                    </div>
                </div>
            </div>

            {/* OTP Input */}
            <div className="flex gap-3 justify-center mb-8">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        disabled={isVerifying}
                        className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-border-primary bg-background-secondary/50 text-foreground
                                   focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20
                                   disabled:opacity-50 transition-all duration-200"
                        aria-label={`Digit ${index + 1}`}
                    />
                ))}
            </div>

            {/* Verify Button */}
            <button
                onClick={() => handleVerify(otp.join(""))}
                disabled={isVerifying || otp.some((d) => d === "")}
                className="btn btn-primary w-full py-3 mb-4"
            >
                {isVerifying ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                    </>
                ) : (
                    "Verify Email"
                )}
            </button>

            {/* Resend Button */}
            <div className="text-center">
                <button
                    onClick={handleResend}
                    disabled={isResending || resendCooldown > 0}
                    className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
                    {resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : isResending
                            ? "Sending..."
                            : "Resend code"}
                </button>
            </div>
        </>
    );
}

function VerifyEmailSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-16 bg-background-tertiary rounded-lg" />
            <div className="flex gap-3 justify-center">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-12 h-14 bg-background-tertiary rounded-xl" />
                ))}
            </div>
            <div className="h-12 bg-background-tertiary rounded" />
        </div>
    );
}

export default function VerifyEmailPage() {
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
                    href="/signup"
                    className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to signup
                </Link>

                {/* Card */}
                <div className="card-glass p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                            <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
                        <p className="text-foreground-muted text-sm">
                            Enter the 6-digit code we sent to your email
                        </p>
                    </div>

                    <Suspense fallback={<VerifyEmailSkeleton />}>
                        <VerifyEmailForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
