import Link from "next/link";
import { BookOpen, Award, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { auth } from "@/auth";
import { db, enrollments, courses, certificates } from "@/db";
import { eq, and } from "drizzle-orm";

// Prevent static prerendering - requires database connection
export const dynamic = "force-dynamic";

async function getDashboardData(userId: string) {
    // Get enrollments with course data
    const userEnrollments = await db
        .select({
            enrollment: enrollments,
            course: courses,
        })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(enrollments.userId, userId));

    // Get certificates
    const userCertificates = await db
        .select()
        .from(certificates)
        .where(and(
            eq(certificates.userId, userId),
            eq(certificates.isRevoked, false)
        ));

    const activeEnrollments = userEnrollments.filter(
        (e) => e.enrollment.status === "active"
    );
    const completedEnrollments = userEnrollments.filter(
        (e) => e.enrollment.status === "completed"
    );

    return {
        enrollments: userEnrollments,
        activeEnrollments,
        completedEnrollments,
        certificates: userCertificates,
    };
}

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    const data = await getDashboardData(session.user.id);

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    Welcome back, <span className="gradient-text">{session.user.name?.split(" ")[0]}</span>
                </h1>
                <p className="text-foreground-muted">
                    Track your learning progress and manage your courses.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-accent-primary" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{data.enrollments.length}</div>
                            <div className="text-sm text-foreground-muted">Enrolled Courses</div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-info/20 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-info" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{data.activeEnrollments.length}</div>
                            <div className="text-sm text-foreground-muted">In Progress</div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-success" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{data.completedEnrollments.length}</div>
                            <div className="text-sm text-foreground-muted">Completed</div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                            <Award className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{data.certificates.length}</div>
                            <div className="text-sm text-foreground-muted">Certificates</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Courses */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Continue Learning</h2>
                    <Link
                        href="/dashboard/courses"
                        className="text-sm text-accent-primary hover:underline flex items-center gap-1"
                    >
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {data.activeEnrollments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.activeEnrollments.slice(0, 3).map(({ enrollment, course }) => (
                            <Link
                                key={enrollment.id}
                                href={`/dashboard/courses/${course.slug}`}
                                className="card group"
                            >
                                <h3 className="font-semibold mb-2 group-hover:text-accent-primary transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-foreground-muted mb-4 line-clamp-2">
                                    {course.shortDescription}
                                </p>

                                {/* Progress Bar */}
                                <div className="mb-2">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-foreground-muted">Progress</span>
                                        <span className="font-medium">{enrollment.progressPercentage}%</span>
                                    </div>
                                    <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                                        <div
                                            className="h-full gradient-primary rounded-full transition-all duration-300"
                                            style={{ width: `${enrollment.progressPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                <button className="btn btn-secondary w-full mt-2 text-sm">
                                    Continue
                                </button>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12">
                        <BookOpen className="w-12 h-12 text-foreground-subtle mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No active courses</h3>
                        <p className="text-foreground-muted mb-4">
                            Start learning by enrolling in a course.
                        </p>
                        <Link href="/courses" className="btn btn-primary">
                            Browse Courses
                        </Link>
                    </div>
                )}
            </div>

            {/* Recent Certificates */}
            {data.certificates.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Recent Certificates</h2>
                        <Link
                            href="/dashboard/certificates"
                            className="text-sm text-accent-primary hover:underline flex items-center gap-1"
                        >
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.certificates.slice(0, 3).map((cert) => (
                            <div key={cert.id} className="card">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                                        <Award className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{cert.courseName}</h3>
                                        <p className="text-xs text-foreground-muted">
                                            {new Date(cert.issuedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/dashboard/certificates/${cert.certificateId}`}
                                        className="btn btn-secondary text-sm flex-1"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        href={`/verify/${cert.certificateId}`}
                                        className="btn btn-ghost text-sm"
                                    >
                                        Verify
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
