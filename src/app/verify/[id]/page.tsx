import { notFound } from "next/navigation";
import Link from "next/link";
import { Award, CheckCircle, Calendar, User, BookOpen, Shield } from "lucide-react";
import { db, certificates } from "@/db";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getCertificate(id: string) {
    const [cert] = await db
        .select()
        .from(certificates)
        .where(eq(certificates.certificateId, id))
        .limit(1);
    return cert;
}

export default async function VerifyCertificatePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const certificate = await getCertificate(id);

    if (!certificate) {
        notFound();
    }

    const isValid = !certificate.isRevoked;

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-2xl mx-auto px-4">
                {/* Status Card */}
                <div className={`card mb-8 ${isValid ? "border-success/30" : "border-error/30"}`}>
                    <div className="flex items-center gap-4">
                        <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center ${isValid ? "bg-success/20" : "bg-error/20"
                                }`}
                        >
                            {isValid ? (
                                <CheckCircle className="w-8 h-8 text-success" />
                            ) : (
                                <Shield className="w-8 h-8 text-error" />
                            )}
                        </div>
                        <div>
                            <h1 className={`text-2xl font-bold ${isValid ? "text-success" : "text-error"}`}>
                                {isValid ? "Certificate Verified" : "Certificate Revoked"}
                            </h1>
                            <p className="text-foreground-muted">
                                {isValid
                                    ? "This certificate is authentic and valid."
                                    : "This certificate has been revoked and is no longer valid."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Certificate Details */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-lg bg-[#D9FD3A]/20 flex items-center justify-center">
                            <Award className="w-6 h-6 text-[#D9FD3A]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Certificate of Completion</h2>
                            <p className="text-sm text-foreground-muted font-mono">{certificate.certificateId}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-background-tertiary">
                            <User className="w-5 h-5 text-foreground-muted mt-0.5" />
                            <div>
                                <p className="text-sm text-foreground-muted">Recipient</p>
                                <p className="font-semibold">{certificate.userName}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-lg bg-background-tertiary">
                            <BookOpen className="w-5 h-5 text-foreground-muted mt-0.5" />
                            <div>
                                <p className="text-sm text-foreground-muted">Course</p>
                                <p className="font-semibold">{certificate.courseName}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-lg bg-background-tertiary">
                            <Calendar className="w-5 h-5 text-foreground-muted mt-0.5" />
                            <div>
                                <p className="text-sm text-foreground-muted">Issue Date</p>
                                <p className="font-semibold">
                                    {new Date(certificate.issuedAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-foreground-muted">Issued by</p>
                                <p className="font-semibold text-[#D9FD3A]">Rayavriti Learning</p>
                            </div>
                            <Link href="/" className="btn btn-secondary text-sm">
                                Visit Website
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <p className="text-center text-sm text-foreground-muted mt-8">
                    This verification page confirms the authenticity of the certificate.
                    <br />
                    Share this URL to allow others to verify the certificate.
                </p>
            </div>
        </div>
    );
}
