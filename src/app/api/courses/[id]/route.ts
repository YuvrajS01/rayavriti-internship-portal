import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, courses } from "@/db";
import { eq } from "drizzle-orm";
import { validateUUID, courseUpdateSchema } from "@/lib/validations";

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

        // Validate UUID format
        const validation = validateUUID(id);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

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

        // Validate UUID format
        const validation = validateUUID(id);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

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

        // Validate UUID format
        const uuidValidation = validateUUID(id);
        if (!uuidValidation.valid) {
            return NextResponse.json({ error: uuidValidation.error }, { status: 400 });
        }

        const body = await request.json();

        // Validate input
        const result = courseUpdateSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const data = result.data;

        // Check if course exists
        const [existing] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, id))
            .limit(1);

        if (!existing) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // Update course with validated data
        const [updated] = await db
            .update(courses)
            .set({
                title: data.title ?? existing.title,
                slug: data.slug ?? existing.slug,
                description: data.description ?? existing.description,
                shortDescription: data.shortDescription ?? existing.shortDescription,
                thumbnail: data.thumbnail ?? existing.thumbnail,
                syllabus: data.syllabus ?? existing.syllabus,
                mode: data.mode ?? existing.mode,
                fee: data.fee?.toString() ?? existing.fee,
                mrp: data.mrp?.toString() ?? existing.mrp,
                duration: data.duration ?? existing.duration,
                isActive: data.isActive ?? existing.isActive,
                isFeatured: data.isFeatured ?? existing.isFeatured,
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

