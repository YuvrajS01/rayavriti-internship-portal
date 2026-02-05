import Link from "next/link";
import { Plus, Edit, Archive, MoreHorizontal, Monitor, Users as UsersIcon } from "lucide-react";
import { db, courses } from "@/db";
import { desc } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils";

// Prevent static prerendering - requires database connection
export const dynamic = "force-dynamic";

async function getCourses() {
    return await db
        .select()
        .from(courses)
        .orderBy(desc(courses.createdAt));
}

export default async function AdminCoursesPage() {
    const allCourses = await getCourses();

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">Course Management</h1>
                    <p className="text-foreground-muted">
                        Create, edit, and manage your courses.
                    </p>
                </div>
                <Link href="/admin/courses/new" className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    Add Course
                </Link>
            </div>

            {/* Courses Table */}
            <div className="card overflow-hidden p-0">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-background-tertiary">
                            <th className="text-left px-4 py-3 text-sm font-medium text-foreground-muted">Course</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-foreground-muted">Mode</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-foreground-muted">Fee</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-foreground-muted">Status</th>
                            <th className="text-left px-4 py-3 text-sm font-medium text-foreground-muted">Created</th>
                            <th className="text-right px-4 py-3 text-sm font-medium text-foreground-muted">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allCourses.length > 0 ? (
                            allCourses.map((course) => (
                                <tr key={course.id} className="border-b border-border last:border-0 hover:bg-background-tertiary/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-background-tertiary flex items-center justify-center">
                                                {course.mode === "online" ? (
                                                    <Monitor className="w-5 h-5 text-foreground-muted" />
                                                ) : (
                                                    <UsersIcon className="w-5 h-5 text-foreground-muted" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">{course.title}</div>
                                                <div className="text-sm text-foreground-muted">{course.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`badge ${course.mode === "online" ? "badge-info" : "badge-warning"}`}>
                                            {course.mode}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {parseFloat(course.fee) === 0 ? (
                                            <span className="text-success">Free</span>
                                        ) : (
                                            formatCurrency(course.fee)
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`badge ${course.isActive ? "badge-success" : "badge-error"}`}>
                                            {course.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-foreground-muted">
                                        {new Date(course.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/courses/${course.id}/edit`}
                                                className="btn btn-ghost p-2"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button className="btn btn-ghost p-2" title="Archive">
                                                <Archive className="w-4 h-4" />
                                            </button>
                                            <button className="btn btn-ghost p-2" title="More">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center">
                                    <Monitor className="w-12 h-12 text-foreground-subtle mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                                    <p className="text-foreground-muted mb-4">
                                        Create your first course to get started.
                                    </p>
                                    <Link href="/admin/courses/new" className="btn btn-primary">
                                        <Plus className="w-5 h-5" />
                                        Add Course
                                    </Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
