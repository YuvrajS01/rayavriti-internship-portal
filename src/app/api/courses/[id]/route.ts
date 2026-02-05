import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, courses, enrollments, payments, certificates } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Delete a course
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Check if course exists
        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, id))
            .limit(1);

        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // Delete course (cascade will handle related records)
        await db.delete(courses).where(eq(courses.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting course:", error);
        return NextResponse.json(
            { error: "Failed to delete course" },
            { status: 500 }
        );
    }
}

// Get a single course
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, id))
            .limit(1);

        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        return NextResponse.json(course);
    } catch (error) {
        console.error("Error fetching course:", error);
        return NextResponse.json(
            { error: "Failed to fetch course" },
            { status: 500 }
        );
    }
}

// Update a course
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // Check if course exists
        const [existing] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, id))
            .limit(1);

        if (!existing) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // Update course
        const [updated] = await db
            .update(courses)
            .set({
                title: body.title,
                slug: body.slug,
                description: body.description,
                shortDescription: body.shortDescription,
                thumbnail: body.thumbnail,
                syllabus: body.syllabus,
                mode: body.mode,
                fee: body.fee?.toString() || "0",
                duration: body.duration,
                isActive: body.isActive ?? true,
                isFeatured: body.isFeatured ?? false,
                updatedAt: new Date(),
            })
            .where(eq(courses.id, id))
            .returning();

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating course:", error);
        return NextResponse.json(
            { error: "Failed to update course" },
            { status: 500 }
        );
    }
}
