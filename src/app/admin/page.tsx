import Link from "next/link";
import { Users, BookOpen, CreditCard, Award, TrendingUp, ArrowRight, AlertCircle } from "lucide-react";
import { db, users, courses, enrollments, payments, certificates } from "@/db";
import { eq, count, desc } from "drizzle-orm";

// Prevent static prerendering - requires database connection
export const dynamic = "force-dynamic";

async function getAdminStats() {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [courseCount] = await db.select({ count: count() }).from(courses);
    const [enrollmentCount] = await db.select({ count: count() }).from(enrollments);
    const [certificateCount] = await db.select({ count: count() }).from(certificates);

    const pendingPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.status, "pending"))
        .limit(5);

    const recentEnrollments = await db
        .select({
            enrollment: enrollments,
            user: users,
            course: courses,
        })
        .from(enrollments)
        .innerJoin(users, eq(enrollments.userId, users.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .orderBy(desc(enrollments.enrolledAt))
        .limit(5);

    return {
        totalUsers: userCount.count,
        totalCourses: courseCount.count,
        totalEnrollments: enrollmentCount.count,
        totalCertificates: certificateCount.count,
        pendingPayments,
        recentEnrollments,
    };
}

export default async function AdminDashboardPage() {
    const stats = await getAdminStats();

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-foreground-muted">
                    Manage your courses, users, and platform settings.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-accent-primary" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.totalUsers}</div>
                            <div className="text-sm text-foreground-muted">Total Users</div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-info/20 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-info" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.totalCourses}</div>
                            <div className="text-sm text-foreground-muted">Active Courses</div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-success" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
                            <div className="text-sm text-foreground-muted">Enrollments</div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                            <Award className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
                            <div className="text-sm text-foreground-muted">Certificates</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Payments Alert */}
            {stats.pendingPayments.length > 0 && (
                <div className="mb-8 p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-warning" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-warning">Pending Payments</h3>
                        <p className="text-sm text-foreground-muted">
                            You have {stats.pendingPayments.length} payment(s) waiting for verification.
                        </p>
                    </div>
                    <Link href="/admin/payments" className="btn btn-secondary text-sm">
                        Review
                    </Link>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Link href="/admin/courses/new" className="card group hover:border-accent-primary/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold mb-1">Add New Course</h3>
                            <p className="text-sm text-foreground-muted">Create a new course</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-foreground-muted group-hover:text-accent-primary transition-colors" />
                    </div>
                </Link>

                <Link href="/admin/users" className="card group hover:border-accent-primary/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold mb-1">Manage Users</h3>
                            <p className="text-sm text-foreground-muted">View and edit users</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-foreground-muted group-hover:text-accent-primary transition-colors" />
                    </div>
                </Link>

                <Link href="/admin/certificates/generate" className="card group hover:border-accent-primary/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold mb-1">Generate Certificate</h3>
                            <p className="text-sm text-foreground-muted">Issue a new certificate</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-foreground-muted group-hover:text-accent-primary transition-colors" />
                    </div>
                </Link>
            </div>

            {/* Recent Enrollments */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Recent Enrollments</h2>
                    <Link
                        href="/admin/users"
                        className="text-sm text-accent-primary hover:underline flex items-center gap-1"
                    >
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-background-tertiary">
                                <th className="text-left px-4 py-3 text-sm font-medium text-foreground-muted">User</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-foreground-muted">Course</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-foreground-muted">Status</th>
                                <th className="text-left px-4 py-3 text-sm font-medium text-foreground-muted">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentEnrollments.length > 0 ? (
                                stats.recentEnrollments.map(({ enrollment, user, course }) => (
                                    <tr key={enrollment.id} className="border-b border-border last:border-0 hover:bg-background-tertiary/50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-foreground-muted">{user.email}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm">{course.title}</td>
                                        <td className="px-4 py-3">
                                            <span className={`badge ${enrollment.status === "active" ? "badge-info" :
                                                enrollment.status === "completed" ? "badge-success" :
                                                    ""
                                                }`}>
                                                {enrollment.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-foreground-muted">
                                            {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-foreground-muted">
                                        No enrollments yet
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
