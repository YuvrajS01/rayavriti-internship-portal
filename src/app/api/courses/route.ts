import { NextRequest, NextResponse } from "next/server";
import { db, courses } from "@/db";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/auth";
import { courseSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

// GET - List all courses (public)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("mode");
        const activeOnly = searchParams.get("active") !== "false";

        const conditions = [];

        if (activeOnly) {
            conditions.push(eq(courses.isActive, true));
        }

        if (mode === "online" || mode === "offline") {
            conditions.push(eq(courses.mode, mode));
        }

        const allCourses = await db
            .select()
            .from(courses)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(courses.createdAt));

        return NextResponse.json(allCourses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        return NextResponse.json(
            { error: "Failed to fetch courses" },
            { status: 500 }
        );
    }
}

// POST - Create new course (admin only)
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        // Validate input
        const result = courseSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const data = result.data;

        // Generate slug
        const slug = slugify(data.title);

        // Check if slug already exists
        const [existing] = await db
            .select()
            .from(courses)
            .where(eq(courses.slug, slug))
            .limit(1);

        if (existing) {
            return NextResponse.json(
                { error: "A course with this title already exists" },
                { status: 409 }
            );
        }

        // Create course
        const [newCourse] = await db
            .insert(courses)
            .values({
                title: data.title,
                slug,
                description: data.description || null,
                shortDescription: data.shortDescription || null,
                thumbnail: data.thumbnail || null,
                mode: data.mode,
                fee: data.fee.toString(),
                duration: data.duration || null,
                youtubePlaylistUrl: data.youtubePlaylistUrl || null,
                syllabus: data.syllabus || null,
                isActive: data.isActive,
                isFeatured: data.isFeatured,
            })
            .returning();

        return NextResponse.json(newCourse, { status: 201 });
    } catch (error) {
        console.error("Error creating course:", error);
        return NextResponse.json(
            { error: "Failed to create course" },
            { status: 500 }
        );
    }
}
