import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { db, courses } from "@/db";
import { desc } from "drizzle-orm";
import { CoursesTable } from "./CoursesTable";

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
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-[#D9FD3A]" />
                        Manage Courses
                    </h1>
                    <p className="text-foreground-muted">
                        Create, edit, and manage your courses. {allCourses.length} course{allCourses.length !== 1 ? "s" : ""} total.
                    </p>
                </div>
                <Link href="/admin/courses/new" className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    Add New Course
                </Link>
            </div>

            {/* Courses Table */}
            <CoursesTable courses={allCourses} />
        </div>
    );
}
