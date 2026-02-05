"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, Loader2, Search } from "lucide-react";

interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    status: string;
    completedAt: string | null;
    user: {
        id: string;
        name: string;
        email: string;
    };
    course: {
        id: string;
        title: string;
        slug: string;
    };
}

export default function GenerateCertificatePage() {
    const router = useRouter();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        fetchEnrollments();
    }, []);

    useEffect(() => {
        if (search) {
            const filtered = enrollments.filter(
                (e) =>
                    e.user.name.toLowerCase().includes(search.toLowerCase()) ||
                    e.user.email.toLowerCase().includes(search.toLowerCase()) ||
                    e.course.title.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredEnrollments(filtered);
        } else {
            setFilteredEnrollments(enrollments);
        }
    }, [search, enrollments]);

    const fetchEnrollments = async () => {
        try {
            const response = await fetch("/api/admin/enrollments?status=completed");
            if (response.ok) {
                const data = await response.json();
                setEnrollments(data);
                setFilteredEnrollments(data);
            }
        } catch (error) {
            console.error("Failed to fetch enrollments:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async (enrollment: Enrollment) => {
        setIsGenerating(true);
        setMessage(null);

        try {
            const response = await fetch("/api/certificates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: enrollment.userId,
                    courseId: enrollment.courseId,
                    enrollmentId: enrollment.id,
                }),
            });

            if (response.ok) {
                const cert = await response.json();
                setMessage({
                    type: "success",
                    text: `Certificate generated successfully! ID: ${cert.certificateId}`,
                });
                // Remove from list
                setEnrollments((prev) => prev.filter((e) => e.id !== enrollment.id));
            } else {
                const data = await response.json();
                setMessage({
                    type: "error",
                    text: data.error || "Failed to generate certificate",
                });
            }
        } catch (error) {
            setMessage({ type: "error", text: "An error occurred" });
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#D9FD3A]" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
                    <Award className="w-8 h-8 text-[#D9FD3A]" />
                    Generate Certificate
                </h1>
                <p className="text-foreground-muted">
                    Issue certificates to users who have completed courses.
                </p>
            </div>

            {/* Message */}
            {message && (
                <div
                    className={`mb-6 p-4 rounded-lg ${message.type === "success"
                            ? "bg-success/10 border border-success/20 text-success"
                            : "bg-error/10 border border-error/20 text-error"
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input pl-10"
                        placeholder="Search by user name, email, or course..."
                    />
                </div>
            </div>

            {/* Enrollments List */}
            {filteredEnrollments.length > 0 ? (
                <div className="space-y-4">
                    {filteredEnrollments.map((enrollment) => (
                        <div key={enrollment.id} className="card">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold">{enrollment.user.name}</h3>
                                        <span className="badge badge-success text-xs">Completed</span>
                                    </div>
                                    <p className="text-sm text-foreground-muted">{enrollment.user.email}</p>
                                    <p className="text-sm mt-2">
                                        <span className="text-foreground-muted">Course:</span>{" "}
                                        <span className="font-medium">{enrollment.course.title}</span>
                                    </p>
                                    {enrollment.completedAt && (
                                        <p className="text-xs text-foreground-muted mt-1">
                                            Completed on{" "}
                                            {new Date(enrollment.completedAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleGenerate(enrollment)}
                                    disabled={isGenerating}
                                    className="btn btn-primary"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Award className="w-4 h-4" />
                                            Generate Certificate
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <Award className="w-12 h-12 text-foreground-subtle mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No completed enrollments</h3>
                    <p className="text-foreground-muted">
                        {search
                            ? "No matching enrollments found."
                            : "Users who complete courses will appear here for certificate generation."}
                    </p>
                </div>
            )}
        </div>
    );
}
