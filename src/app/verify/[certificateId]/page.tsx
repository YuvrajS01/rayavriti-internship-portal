import { notFound } from "next/navigation";
import { CheckCircle, XCircle, GraduationCap, Calendar, User, BookOpen } from "lucide-react";
import { db, certificates } from "@/db";
import { eq } from "drizzle-orm";

// Prevent static prerendering - requires database connection
export const dynamic = "force-dynamic";

async function getCertificate(certificateId: string) {
    const [cert] = await db
        .select()
        .from(certificates)
        .where(eq(certificates.certificateId, certificateId))
        .limit(1);

    return cert;
}

export default async function VerifyCertificatePage({
    params,
}: {
    params: Promise<{ certificateId: string }>;
}) {
    const { certificateId } = await params;
    const certificate = await getCertificate(certificateId);

    if (!certificate) {
        notFound();
    }

    const isValid = !certificate.isRevoked;

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-tertiary/10 rounded-full blur-[128px]" />
            </div>

            <div className="relative w-full max-w-lg">
                <div className="card-glass p-8 text-center">
                    {/* Status Icon */}
                    <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${isValid ? "bg-success/20" : "bg-error/20"
                        }`}>
                        {isValid ? (
                            <CheckCircle className="w-10 h-10 text-success" />
                        ) : (
                            <XCircle className="w-10 h-10 text-error" />
                        )}
                    </div>

                    {/* Status Text */}
                    <h1 className={`text-2xl font-bold mb-2 ${isValid ? "text-success" : "text-error"}`}>
                        {isValid ? "Valid Certificate" : "Revoked Certificate"}
                    </h1>
                    <p className="text-foreground-muted mb-8">
                        {isValid
                            ? "This certificate has been verified and is authentic."
                            : "This certificate has been revoked and is no longer valid."}
                    </p>

                    {/* Certificate Details */}
                    <div className="space-y-4 text-left">
                        <div className="flex items-center gap-3 p-4 bg-background-tertiary rounded-lg">
                            <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-accent-primary" />
                            </div>
                            <div>
                                <div className="text-sm text-foreground-muted">Recipient</div>
                                <div className="font-medium">{certificate.userName}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-background-tertiary rounded-lg">
                            <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-info" />
                            </div>
                            <div>
                                <div className="text-sm text-foreground-muted">Course</div>
                                <div className="font-medium">{certificate.courseName}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-background-tertiary rounded-lg">
                            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-warning" />
                            </div>
                            <div>
                                <div className="text-sm text-foreground-muted">Issue Date</div>
                                <div className="font-medium">
                                    {new Date(certificate.issuedAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-background-tertiary rounded-lg">
                            <div className="w-10 h-10 rounded-lg bg-accent-tertiary/20 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-accent-tertiary" />
                            </div>
                            <div>
                                <div className="text-sm text-foreground-muted">Certificate ID</div>
                                <div className="font-mono text-sm">{certificate.certificateId}</div>
                            </div>
                        </div>
                    </div>

                    {/* Issuer */}
                    <div className="mt-8 pt-6 border-t border-border">
                        <p className="text-sm text-foreground-muted">
                            Issued by <span className="font-semibold text-foreground">Rayavriti</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
