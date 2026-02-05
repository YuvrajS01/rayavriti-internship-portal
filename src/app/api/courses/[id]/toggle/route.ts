import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, courses } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Toggle course active status
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Get current course status
        const [course] = await db
            .select({ isActive: courses.isActive })
            .from(courses)
            .where(eq(courses.id, id))
            .limit(1);

        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // Toggle status
        await db
            .update(courses)
            .set({ isActive: !course.isActive })
            .where(eq(courses.id, id));

        return NextResponse.json({
            success: true,
            isActive: !course.isActive
        });
    } catch (error) {
        console.error("Error toggling course status:", error);
        return NextResponse.json(
            { error: "Failed to toggle course status" },
            { status: 500 }
        );
    }
}
