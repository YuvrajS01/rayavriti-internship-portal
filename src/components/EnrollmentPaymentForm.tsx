"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Upload, Loader2, Check, QrCode } from "lucide-react";
import Image from "next/image";

interface EnrollPageProps {
    params: { slug: string };
    course: {
        id: string;
        title: string;
        price: number;
        mode: string;
    };
}

export default function EnrollmentPaymentForm({ course }: { course: EnrollPageProps["course"] }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [proofUrl, setProofUrl] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [error, setError] = useState("");

    const upiId = process.env.NEXT_PUBLIC_UPI_ID || "example@upi";
    const merchantName = process.env.NEXT_PUBLIC_UPI_MERCHANT || "Rayavriti";
    const upiLink = `upi://pay?pa=${upiId}&pn=${merchantName}&am=${course.price}&cu=INR&tn=Course-${course.id}`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId: course.id,
                    transactionId,
                    screenshotUrl: proofUrl,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to submit payment");
            }

            setStep(3);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s
                                ? "bg-[#D9FD3A] text-[#11110B]"
                                : "bg-background-tertiary text-foreground-muted"
                                }`}
                        >
                            {step > s ? <Check className="w-4 h-4" /> : s}
                        </div>
                        {s < 3 && (
                            <div
                                className={`w-12 h-0.5 ${step > s ? "bg-[#D9FD3A]" : "bg-border"
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Payment Details */}
            {step === 1 && (
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">Complete Payment</h2>
                    <p className="text-foreground-muted mb-6">
                        Scan the QR code or use UPI to pay for <strong>{course.title}</strong>
                    </p>

                    <div className="bg-white rounded-lg p-6 text-center mb-6">
                        {/* QR Code placeholder - would use qrcode.react in production */}
                        <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                            <QrCode className="w-24 h-24 text-gray-400" />
                        </div>
                        <p className="text-gray-600 text-sm">Scan with any UPI app</p>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg">
                            <span className="text-foreground-muted">UPI ID</span>
                            <span className="font-mono font-medium">{upiId}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg">
                            <span className="text-foreground-muted">Amount</span>
                            <span className="font-bold text-[#D9FD3A]">₹{course.price}</span>
                        </div>
                    </div>

                    <a
                        href={upiLink}
                        className="btn btn-primary w-full mb-4"
                    >
                        <CreditCard className="w-5 h-5" />
                        Pay with UPI App
                    </a>

                    <button
                        onClick={() => setStep(2)}
                        className="btn btn-secondary w-full"
                    >
                        I have made the payment
                    </button>
                </div>
            )}

            {/* Step 2: Upload Proof */}
            {step === 2 && (
                <form onSubmit={handleSubmit} className="card">
                    <h2 className="text-xl font-semibold mb-4">Upload Payment Proof</h2>
                    <p className="text-foreground-muted mb-6">
                        Submit a screenshot of your payment confirmation.
                    </p>

                    {error && (
                        <div className="p-4 rounded-lg bg-error/10 border border-error/20 text-error mb-4">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="label">Transaction ID</label>
                            <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                className="input"
                                placeholder="Enter UPI transaction ID"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Payment Screenshot URL</label>
                            <input
                                type="url"
                                value={proofUrl}
                                onChange={(e) => setProofUrl(e.target.value)}
                                className="input"
                                placeholder="https://example.com/screenshot.png"
                                required
                            />
                            <p className="text-xs text-foreground-muted mt-1">
                                Upload your screenshot to a service like Imgur and paste the URL here.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="btn btn-secondary flex-1"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary flex-1"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Submit Proof
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
                <div className="card text-center">
                    <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-success" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Payment Submitted!</h2>
                    <p className="text-foreground-muted mb-6">
                        Your payment is being verified. You will receive access to the course
                        once confirmed by our team. This usually takes 1-2 business hours.
                    </p>
                    <Link href="/dashboard" className="btn btn-primary">
                        Go to Dashboard
                    </Link>
                </div>
            )}
        </div>
    );
}
