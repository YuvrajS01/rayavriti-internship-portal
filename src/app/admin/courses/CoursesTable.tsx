"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Edit, Archive, Eye, Trash2, Monitor, Users as UsersIcon, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Course {
    id: string;
    title: string;
    slug: string;
    mode: string;
    fee: string;
    isActive: boolean;
    createdAt: Date;
}

export function CourseActionsClient({ course }: { course: Course }) {
    const [isActive, setIsActive] = useState(course.isActive);
    const [isLoading, setIsLoading] = useState(false);

    const toggleStatus = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/courses/${course.id}/toggle`, {
                method: "POST",
            });
            if (response.ok) {
                setIsActive(!isActive);
            }
        } catch (error) {
            console.error("Failed to toggle course status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCourse = async () => {
        if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`/api/courses/${course.id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to delete course:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-1">
            <Link
                href={`/courses/${course.slug}`}
                target="_blank"
                className="btn btn-ghost p-2"
                title="View Public Page"
            >
                <ExternalLink className="w-4 h-4" />
            </Link>
            <Link
                href={`/admin/courses/${course.id}/edit`}
                className="btn btn-ghost p-2"
                title="Edit Course"
            >
                <Edit className="w-4 h-4" />
            </Link>
            <button
                onClick={toggleStatus}
                disabled={isLoading}
                className={`btn btn-ghost p-2 ${isActive ? "text-success" : "text-foreground-muted"}`}
                title={isActive ? "Deactivate Course" : "Activate Course"}
            >
                {isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            </button>
            <button
                onClick={deleteCourse}
                disabled={isLoading}
                className="btn btn-ghost p-2 text-error hover:bg-error/10"
                title="Delete Course"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

interface CoursesTableProps {
    courses: Course[];
}

export function CoursesTable({ courses }: CoursesTableProps) {
    return (
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
                    {courses.length > 0 ? (
                        courses.map((course) => (
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
                                    <CourseActionsClient course={course} />
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
    );
}
