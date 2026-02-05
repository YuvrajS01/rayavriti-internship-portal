import Link from "next/link";
import { Award, Plus, Eye, Ban, RotateCcw, Search } from "lucide-react";
import { db, certificates, users, courses } from "@/db";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getCertificates() {
    return await db
        .select({
            certificate: certificates,
            user: users,
            course: courses,
        })
        .from(certificates)
        .innerJoin(users, eq(certificates.userId, users.id))
        .innerJoin(courses, eq(certificates.courseId, courses.id))
        .orderBy(desc(certificates.issuedAt));
}

async function getCertificateStats() {
    const result = await db
        .select({
            total: sql<number>`count(*)`,
            active: sql<number>`count(*) filter (where is_revoked = false)`,
            revoked: sql<number>`count(*) filter (where is_revoked = true)`,
            thisMonth: sql<number>`count(*) filter (where issued_at >= date_trunc('month', current_date))`,
        })
        .from(certificates);

    return result[0];
}

export default async function CertificatesManagementPage() {
    const [allCertificates, stats] = await Promise.all([
        getCertificates(),
        getCertificateStats(),
    ]);

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1">Certificate Management</h1>
                    <p className="text-foreground-muted">
                        Issue and manage course completion certificates.
                    </p>
                </div>
                <Link href="/admin/certificates/issue" className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    Issue Certificate
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#D9FD3A]/20 flex items-center justify-center">
                            <Award className="w-5 h-5 text-[#D9FD3A]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.total || 0}</p>
                            <p className="text-sm text-foreground-muted">Total Issued</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                            <Award className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.active || 0}</p>
                            <p className="text-sm text-foreground-muted">Active</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-error/20 flex items-center justify-center">
                            <Ban className="w-5 h-5 text-error" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.revoked || 0}</p>
                            <p className="text-sm text-foreground-muted">Revoked</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                            <Award className="w-5 h-5 text-info" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.thisMonth || 0}</p>
                            <p className="text-sm text-foreground-muted">This Month</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Certificates Table */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-4 font-medium text-foreground-muted">Certificate ID</th>
                                <th className="text-left p-4 font-medium text-foreground-muted">Recipient</th>
                                <th className="text-left p-4 font-medium text-foreground-muted">Course</th>
                                <th className="text-left p-4 font-medium text-foreground-muted">Status</th>
                                <th className="text-left p-4 font-medium text-foreground-muted">Issued</th>
                                <th className="text-left p-4 font-medium text-foreground-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allCertificates.map(({ certificate, user, course }) => (
                                <tr
                                    key={certificate.id}
                                    className={`border-b border-border hover:bg-background-tertiary/50 transition-colors ${certificate.isRevoked ? "opacity-50" : ""
                                        }`}
                                >
                                    <td className="p-4">
                                        <code className="text-xs bg-background-tertiary px-2 py-1 rounded">
                                            {certificate.certificateId.slice(0, 12)}...
                                        </code>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium">{certificate.userName}</p>
                                            <p className="text-sm text-foreground-muted">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-medium">{certificate.courseName}</p>
                                    </td>
                                    <td className="p-4">
                                        {certificate.isRevoked ? (
                                            <span className="badge badge-error">Revoked</span>
                                        ) : (
                                            <span className="badge badge-success">Active</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-foreground-muted">
                                        {new Date(certificate.issuedAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/verify/${certificate.certificateId}`}
                                                target="_blank"
                                                className="btn btn-ghost p-2"
                                                title="View Certificate"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            {certificate.isRevoked ? (
                                                <button
                                                    className="btn btn-ghost p-2 text-success hover:bg-success/10"
                                                    title="Restore Certificate"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-ghost p-2 text-error hover:bg-error/10"
                                                    title="Revoke Certificate"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {allCertificates.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-foreground-muted">
                                        No certificates issued yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
