import Link from "next/link";
import { BookOpen, Clock, ArrowRight, Play, CheckCircle } from "lucide-react";
import { auth } from "@/auth";
import { db, enrollments, courses } from "@/db";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getUserEnrollments(userId: string) {
    return await db
        .select({
            enrollment: enrollments,
            course: courses,
        })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(enrollments.userId, userId))
        .orderBy(desc(enrollments.enrolledAt));
}

export default async function MyCoursesPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return null;
    }

    const userEnrollments = await getUserEnrollments(session.user.id);

    const activeEnrollments = userEnrollments.filter(
        (e) => e.enrollment.status === "active"
    );
    const completedEnrollments = userEnrollments.filter(
        (e) => e.enrollment.status === "completed"
    );

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Courses</h1>
                <p className="text-foreground-muted">
                    Continue learning or browse completed courses.
                </p>
            </div>

            {/* Active Courses */}
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Play className="w-5 h-5 text-[#D9FD3A]" />
                    In Progress ({activeEnrollments.length})
                </h2>

                {activeEnrollments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeEnrollments.map(({ enrollment, course }) => (
                            <div key={enrollment.id} className="card group">
                                {/* Course Thumbnail */}
                                {course.thumbnail && (
                                    <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-background-tertiary">
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`badge ${course.mode === "online" ? "badge-primary" : "badge-info"}`}>
                                        {course.mode}
                                    </span>
                                </div>

                                <h3 className="font-semibold mb-2 group-hover:text-[#D9FD3A] transition-colors">
                                    {course.title}
                                </h3>

                                <p className="text-sm text-foreground-muted mb-4 line-clamp-2">
                                    {course.shortDescription}
                                </p>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-foreground-muted">Progress</span>
                                        <span className="font-medium text-[#D9FD3A]">{enrollment.progressPercentage}%</span>
                                    </div>
                                    <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#D9FD3A] rounded-full transition-all duration-300"
                                            style={{ width: `${enrollment.progressPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                <Link
                                    href={`/dashboard/courses/${course.slug}`}
                                    className="btn btn-primary w-full text-sm"
                                >
                                    Continue Learning
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
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

            {/* Completed Courses */}
            {completedEnrollments.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-success" />
                        Completed ({completedEnrollments.length})
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {completedEnrollments.map(({ enrollment, course }) => (
                            <div key={enrollment.id} className="card">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="badge badge-success">Completed</span>
                                </div>

                                <h3 className="font-semibold mb-2">{course.title}</h3>

                                <p className="text-sm text-foreground-muted mb-4">
                                    Completed on {new Date(enrollment.completedAt || enrollment.enrolledAt).toLocaleDateString()}
                                </p>

                                <div className="flex gap-2">
                                    <Link
                                        href={`/dashboard/courses/${course.slug}`}
                                        className="btn btn-secondary flex-1 text-sm"
                                    >
                                        Review
                                    </Link>
                                    <Link
                                        href="/dashboard/certificates"
                                        className="btn btn-ghost text-sm"
                                    >
                                        Certificate
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
