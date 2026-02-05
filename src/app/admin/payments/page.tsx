import Link from "next/link";
import { CreditCard, Check, X, Clock, Eye, Image as ImageIcon } from "lucide-react";
import { db, payments, users, courses } from "@/db";
import { eq, desc, sql } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getPayments() {
    return await db
        .select({
            payment: payments,
            user: users,
            course: courses,
        })
        .from(payments)
        .innerJoin(users, eq(payments.userId, users.id))
        .innerJoin(courses, eq(payments.courseId, courses.id))
        .orderBy(desc(payments.createdAt));
}

async function getPaymentStats() {
    const result = await db
        .select({
            total: sql<number>`count(*)`,
            pending: sql<number>`count(*) filter (where status = 'pending')`,
            approved: sql<number>`count(*) filter (where status = 'approved')`,
            rejected: sql<number>`count(*) filter (where status = 'rejected')`,
            totalAmount: sql<number>`sum(amount) filter (where status = 'approved')`,
        })
        .from(payments);

    return result[0];
}

export default async function PaymentsPage() {
    const [allPayments, stats] = await Promise.all([getPayments(), getPaymentStats()]);

    const pendingPayments = allPayments.filter((p) => p.payment.status === "pending");

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">Payment Verification</h1>
                <p className="text-foreground-muted">
                    Review and approve payment submissions.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.pending || 0}</p>
                            <p className="text-sm text-foreground-muted">Pending</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-success" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.approved || 0}</p>
                            <p className="text-sm text-foreground-muted">Approved</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-error/20 flex items-center justify-center">
                            <X className="w-5 h-5 text-error" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.rejected || 0}</p>
                            <p className="text-sm text-foreground-muted">Rejected</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#D9FD3A]/20 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-[#D9FD3A]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{formatCurrency(stats?.totalAmount || 0)}</p>
                            <p className="text-sm text-foreground-muted">Total Revenue</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Payments Alert */}
            {pendingPayments.length > 0 && (
                <div className="card bg-warning/10 border-warning/20 mb-6">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-warning" />
                        <p className="text-warning font-medium">
                            {pendingPayments.length} payment{pendingPayments.length !== 1 ? "s" : ""} awaiting verification
                        </p>
                    </div>
                </div>
            )}

            {/* Payments Table */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-4 font-medium text-foreground-muted">User</th>
                                <th className="text-left p-4 font-medium text-foreground-muted">Course</th>
                                <th className="text-left p-4 font-medium text-foreground-muted">Amount</th>
                                <th className="text-left p-4 font-medium text-foreground-muted">Payment Details</th>
                                <th className="text-left p-4 font-medium text-foreground-muted">Status</th>
                                <th className="text-left p-4 font-medium text-foreground-muted">Date</th>
                                <th className="text-left p-4 font-medium text-foreground-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allPayments.map(({ payment, user, course }) => (
                                <tr
                                    key={payment.id}
                                    className={`border-b border-border hover:bg-background-tertiary/50 transition-colors ${payment.status === "pending" ? "bg-warning/5" : ""
                                        }`}
                                >
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-foreground-muted">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-medium">{course.title}</p>
                                    </td>
                                    <td className="p-4 font-medium">
                                        {formatCurrency(payment.amount)}
                                    </td>
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            {payment.transactionId ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-foreground-muted">TXN:</span>
                                                    <span className="font-mono text-sm">{payment.transactionId}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-foreground-muted">No TXN ID</span>
                                            )}
                                            {payment.screenshotUrl && (
                                                <Link
                                                    href={payment.screenshotUrl}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1 text-xs text-[#D9FD3A] hover:underline"
                                                >
                                                    <ImageIcon className="w-3 h-3" />
                                                    View Proof
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`badge ${payment.status === "pending"
                                                ? "badge-warning"
                                                : payment.status === "approved"
                                                    ? "badge-success"
                                                    : "badge-error"
                                                }`}
                                        >
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-foreground-muted">
                                        {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {payment.screenshotUrl && (
                                                <Link
                                                    href={payment.screenshotUrl}
                                                    target="_blank"
                                                    className="btn btn-ghost p-2"
                                                    title="View Proof"
                                                >
                                                    <ImageIcon className="w-4 h-4" />
                                                </Link>
                                            )}

                                            {payment.status === "pending" && (
                                                <>
                                                    <form action={`/api/payments/${payment.id}/approve`} method="POST">
                                                        <button
                                                            type="submit"
                                                            className="btn btn-ghost p-2 text-success hover:bg-success/10"
                                                            title="Approve"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    </form>
                                                    <form action={`/api/payments/${payment.id}/reject`} method="POST">
                                                        <button
                                                            type="submit"
                                                            className="btn btn-ghost p-2 text-error hover:bg-error/10"
                                                            title="Reject"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </form>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {allPayments.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-foreground-muted">
                                        No payment submissions yet.
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
