import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, progress, enrollments, courses } from "@/db";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Mark lesson as complete
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse form data
        const formData = await request.formData();
        const enrollmentId = formData.get("enrollmentId") as string;
        const moduleIndex = parseInt(formData.get("moduleIndex") as string);
        const lessonIndex = parseInt(formData.get("lessonIndex") as string);

        if (!enrollmentId || isNaN(moduleIndex) || isNaN(lessonIndex)) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify enrollment belongs to user
        const [enrollment] = await db
            .select()
            .from(enrollments)
            .where(
                and(
                    eq(enrollments.id, enrollmentId),
                    eq(enrollments.userId, session.user.id)
                )
            )
            .limit(1);

        if (!enrollment) {
            return NextResponse.json(
                { error: "Enrollment not found" },
                { status: 404 }
            );
        }

        // Check if progress exists
        const [existingProgress] = await db
            .select()
            .from(progress)
            .where(
                and(
                    eq(progress.enrollmentId, enrollmentId),
                    eq(progress.moduleIndex, moduleIndex),
                    eq(progress.lessonIndex, lessonIndex)
                )
            )
            .limit(1);

        if (existingProgress) {
            // Toggle completion
            await db
                .update(progress)
                .set({
                    isCompleted: !existingProgress.isCompleted,
                    completedAt: existingProgress.isCompleted ? null : new Date(),
                })
                .where(eq(progress.id, existingProgress.id));
        } else {
            // Create new progress entry
            await db.insert(progress).values({
                enrollmentId,
                moduleIndex,
                lessonIndex,
                isCompleted: true,
                completedAt: new Date(),
            });
        }

        // Get the course to calculate total lessons from syllabus
        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, enrollment.courseId))
            .limit(1);

        // Calculate total lessons from syllabus
        let totalLessons = 0;
        if (course?.syllabus) {
            const syllabus = course.syllabus as { modules: { lessons: unknown[] }[] };
            for (const module of syllabus.modules || []) {
                totalLessons += module.lessons?.length || 0;
            }
        }

        // Get completed lessons count
        const allProgress = await db
            .select()
            .from(progress)
            .where(eq(progress.enrollmentId, enrollmentId));

        const completedCount = allProgress.filter(p => p.isCompleted).length;

        // Calculate progress percentage (ensure we don't divide by zero)
        const progressPercentage = totalLessons > 0
            ? Math.round((completedCount / totalLessons) * 100)
            : 0;

        await db
            .update(enrollments)
            .set({
                progressPercentage,
                // Mark as completed if 100%
                status: progressPercentage >= 100 ? "completed" : enrollment.status,
                completedAt: progressPercentage >= 100 ? new Date() : null,
            })
            .where(eq(enrollments.id, enrollmentId));

        // Get the course slug to redirect back
        const referer = request.headers.get("referer") || "/dashboard/courses";

        return NextResponse.redirect(referer, { status: 303 });
    } catch (error) {
        console.error("Error updating progress:", error);
        return NextResponse.json(
            { error: "Failed to update progress" },
            { status: 500 }
        );
    }
}
