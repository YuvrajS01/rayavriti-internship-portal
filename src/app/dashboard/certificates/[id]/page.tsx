import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, Download, ExternalLink } from "lucide-react";
import { auth } from "@/auth";
import { db, certificates } from "@/db";
import { eq, and } from "drizzle-orm";
import CopyButton from "@/components/CopyButton";

export const dynamic = "force-dynamic";

async function getCertificate(certificateId: string, userId: string) {
    const [cert] = await db
        .select()
        .from(certificates)
        .where(
            and(
                eq(certificates.certificateId, certificateId),
                eq(certificates.userId, userId),
                eq(certificates.isRevoked, false)
            )
        )
        .limit(1);
    return cert;
}

export default async function CertificateViewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const { id } = await params;
    const certificate = await getCertificate(id, session.user.id);

    if (!certificate) {
        notFound();
    }

    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${certificate.certificateId}`;

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/dashboard/certificates"
                    className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground text-sm mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Certificates
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Certificate Details</h1>
                <p className="text-foreground-muted">
                    View and share your certificate of completion.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Certificate Preview */}
                <div className="card aspect-[4/3] bg-gradient-to-br from-[#D9FD3A]/10 to-transparent border-[#D9FD3A]/30 flex flex-col items-center justify-center p-8">
                    <Award className="w-16 h-16 text-[#D9FD3A] mb-4" />
                    <p className="text-xs text-foreground-muted uppercase tracking-widest mb-2">
                        Certificate of Completion
                    </p>
                    <h2 className="text-2xl font-bold text-center mb-6">{certificate.courseName}</h2>
                    <p className="text-foreground-muted mb-1">Awarded to</p>
                    <p className="text-xl font-semibold mb-6">{certificate.userName}</p>
                    <p className="text-sm text-foreground-muted">
                        Issued on{" "}
                        {new Date(certificate.issuedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                    <p className="text-xs font-mono text-foreground-subtle mt-4">
                        ID: {certificate.certificateId}
                    </p>
                </div>

                {/* Actions & Info */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="card">
                        <h3 className="font-semibold mb-4">Actions</h3>
                        <div className="space-y-3">
                            <Link
                                href={`/api/certificates/${certificate.certificateId}/download`}
                                target="_blank"
                                className="btn btn-primary w-full"
                            >
                                <Download className="w-5 h-5" />
                                Download Certificate
                            </Link>
                            <Link
                                href={verifyUrl}
                                target="_blank"
                                className="btn btn-secondary w-full"
                            >
                                <ExternalLink className="w-5 h-5" />
                                View Verification Page
                            </Link>
                            <CopyButton text={verifyUrl} />
                        </div>
                    </div>

                    {/* Certificate Info */}
                    <div className="card">
                        <h3 className="font-semibold mb-4">Certificate Information</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-foreground-muted">Certificate ID</span>
                                <span className="font-mono text-sm">{certificate.certificateId}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-foreground-muted">Recipient</span>
                                <span className="font-medium">{certificate.userName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-foreground-muted">Course</span>
                                <span className="font-medium">{certificate.courseName}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-foreground-muted">Issue Date</span>
                                <span className="font-medium">
                                    {new Date(certificate.issuedAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Verification Info */}
                    <div className="card bg-background-tertiary">
                        <div className="flex items-start gap-3">
                            <Award className="w-6 h-6 text-[#D9FD3A] mt-0.5" />
                            <div>
                                <h4 className="font-semibold mb-1">Share Your Achievement</h4>
                                <p className="text-sm text-foreground-muted">
                                    Share your certificate verification link with employers or on social media.
                                    Anyone with the link can verify the authenticity of your certificate.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
