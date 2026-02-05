import { NextRequest, NextResponse } from "next/server";
import { db, enrollments, payments, courses } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/auth";

// GET - Get user's enrollments or all enrollments (admin)
export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        // Admin can view any user's enrollments
        if (session.user.role === "admin" && userId) {
            const userEnrollments = await db
                .select({
                    enrollment: enrollments,
                    course: courses,
                })
                .from(enrollments)
                .innerJoin(courses, eq(enrollments.courseId, courses.id))
                .where(eq(enrollments.userId, userId))
                .orderBy(desc(enrollments.enrolledAt));

            return NextResponse.json(userEnrollments);
        }

        // Regular users can only view their own enrollments
        const userEnrollments = await db
            .select({
                enrollment: enrollments,
                course: courses,
            })
            .from(enrollments)
            .innerJoin(courses, eq(enrollments.courseId, courses.id))
            .where(eq(enrollments.userId, session.user.id))
            .orderBy(desc(enrollments.enrolledAt));

        return NextResponse.json(userEnrollments);
    } catch (error) {
        console.error("Error fetching enrollments:", error);
        return NextResponse.json(
            { error: "Failed to fetch enrollments" },
            { status: 500 }
        );
    }
}

// POST - Create enrollment (when payment is approved or course is free)
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { courseId } = body;

        if (!courseId) {
            return NextResponse.json(
                { error: "Course ID is required" },
                { status: 400 }
            );
        }

        // Check if course exists
        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, courseId))
            .limit(1);

        if (!course) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        // Check if already enrolled
        const [existingEnrollment] = await db
            .select()
            .from(enrollments)
            .where(
                and(
                    eq(enrollments.userId, session.user.id),
                    eq(enrollments.courseId, courseId)
                )
            )
            .limit(1);

        if (existingEnrollment) {
            return NextResponse.json(
                { error: "Already enrolled in this course" },
                { status: 409 }
            );
        }

        // If course is free, enroll directly
        if (parseFloat(course.fee) === 0) {
            const [newEnrollment] = await db
                .insert(enrollments)
                .values({
                    userId: session.user.id,
                    courseId,
                    status: "active",
                    progressPercentage: 0,
                })
                .returning();

            return NextResponse.json(newEnrollment, { status: 201 });
        }

        // For paid courses, check if payment is approved
        const [approvedPayment] = await db
            .select()
            .from(payments)
            .where(
                and(
                    eq(payments.userId, session.user.id),
                    eq(payments.courseId, courseId),
                    eq(payments.status, "approved")
                )
            )
            .limit(1);

        if (!approvedPayment) {
            return NextResponse.json(
                { error: "Payment required for this course" },
                { status: 402 }
            );
        }

        // Create enrollment
        const [newEnrollment] = await db
            .insert(enrollments)
            .values({
                userId: session.user.id,
                courseId,
                status: "active",
                progressPercentage: 0,
            })
            .returning();

        return NextResponse.json(newEnrollment, { status: 201 });
    } catch (error) {
        console.error("Error creating enrollment:", error);
        return NextResponse.json(
            { error: "Failed to create enrollment" },
            { status: 500 }
        );
    }
}
