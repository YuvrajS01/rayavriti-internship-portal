import Link from "next/link";
import { Award, Download, ExternalLink, QrCode } from "lucide-react";
import { auth } from "@/auth";
import { db, certificates } from "@/db";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getUserCertificates(userId: string) {
    return await db
        .select()
        .from(certificates)
        .where(and(
            eq(certificates.userId, userId),
            eq(certificates.isRevoked, false)
        ))
        .orderBy(desc(certificates.issuedAt));
}

export default async function CertificatesPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    const userCertificates = await getUserCertificates(session.user.id);

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Certificates</h1>
                <p className="text-foreground-muted">
                    View and download your earned certificates.
                </p>
            </div>

            {userCertificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userCertificates.map((cert) => (
                        <div key={cert.id} className="card">
                            {/* Certificate Preview */}
                            <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-[#D9FD3A]/20 to-[#D9FD3A]/5 border border-[#D9FD3A]/20 flex flex-col items-center justify-center mb-4">
                                <Award className="w-12 h-12 text-[#D9FD3A] mb-2" />
                                <p className="text-xs text-foreground-muted uppercase tracking-wider">Certificate of Completion</p>
                                <h3 className="text-lg font-semibold mt-2 text-center px-4">{cert.courseName}</h3>
                            </div>

                            {/* Certificate Info */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-foreground-muted">Recipient</span>
                                    <span className="font-medium">{cert.userName}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-foreground-muted">Issue Date</span>
                                    <span className="font-medium">
                                        {new Date(cert.issuedAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-foreground-muted">Certificate ID</span>
                                    <span className="font-mono text-xs">{cert.certificateId.slice(0, 12)}...</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Link
                                    href={`/api/certificates/${cert.certificateId}/download`}
                                    className="btn btn-primary flex-1 text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </Link>
                                <Link
                                    href={`/verify/${cert.certificateId}`}
                                    target="_blank"
                                    className="btn btn-secondary text-sm"
                                >
                                    <QrCode className="w-4 h-4" />
                                </Link>
                                <Link
                                    href={`/verify/${cert.certificateId}`}
                                    target="_blank"
                                    className="btn btn-ghost text-sm"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-16">
                    <Award className="w-16 h-16 text-foreground-subtle mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No certificates yet</h3>
                    <p className="text-foreground-muted mb-6 max-w-md mx-auto">
                        Complete a course to earn your first certificate.
                        It will appear here once issued by an admin.
                    </p>
                    <Link href="/dashboard/courses" className="btn btn-primary">
                        View My Courses
                    </Link>
                </div>
            )}

            {/* Info Box */}
            <div className="mt-8 card bg-background-tertiary">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#D9FD3A]/20 flex items-center justify-center shrink-0">
                        <QrCode className="w-5 h-5 text-[#D9FD3A]" />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-1">Verify Your Certificate</h4>
                        <p className="text-sm text-foreground-muted">
                            Each certificate includes a unique QR code that employers can scan to verify its authenticity.
                            Share the verification link directly or let them scan the QR code on your PDF certificate.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
