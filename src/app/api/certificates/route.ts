import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, certificates, users, courses, enrollments } from "@/db";
import { eq, and } from "drizzle-orm";
import { validateUUID } from "@/lib/validations";
import { generateCertificateId } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Create a new certificate
export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { userId, courseId, enrollmentId } = body;

        if (!userId || !courseId || !enrollmentId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate UUID formats
        const userIdValidation = validateUUID(userId);
        const courseIdValidation = validateUUID(courseId);
        const enrollmentIdValidation = validateUUID(enrollmentId);

        if (!userIdValidation.valid || !courseIdValidation.valid || !enrollmentIdValidation.valid) {
            return NextResponse.json(
                { error: "Invalid ID format" },
                { status: 400 }
            );
        }

        // Validate enrollment exists and is completed
        const [enrollment] = await db
            .select()
            .from(enrollments)
            .where(eq(enrollments.id, enrollmentId))
            .limit(1);

        if (!enrollment) {
            return NextResponse.json(
                { error: "Enrollment not found" },
                { status: 404 }
            );
        }

        if (enrollment.status !== "completed") {
            return NextResponse.json(
                { error: "Certificate can only be issued for completed courses" },
                { status: 400 }
            );
        }

        // Get user and course info
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, courseId))
            .limit(1);

        if (!user || !course) {
            return NextResponse.json(
                { error: "User or course not found" },
                { status: 404 }
            );
        }

        // Check if certificate already exists
        const [existing] = await db
            .select()
            .from(certificates)
            .where(
                and(
                    eq(certificates.userId, userId),
                    eq(certificates.courseId, courseId)
                )
            )
            .limit(1);

        if (existing) {
            return NextResponse.json(
                { error: "Certificate already exists for this user and course" },
                { status: 409 }
            );
        }

        // Generate unique certificate ID with collision protection
        let certificateId = generateCertificateId();
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            const [exists] = await db
                .select()
                .from(certificates)
                .where(eq(certificates.certificateId, certificateId))
                .limit(1);
            if (!exists) break;
            certificateId = generateCertificateId();
            attempts++;
        }

        // Fail if unique ID could not be generated
        if (attempts >= maxAttempts) {
            return NextResponse.json(
                { error: "Failed to generate unique certificate ID. Please try again." },
                { status: 500 }
            );
        }

        // Create certificate
        const [newCertificate] = await db
            .insert(certificates)
            .values({
                certificateId,
                userId,
                courseId,
                enrollmentId,
                userName: user.name || "Unknown",
                courseName: course.title,
            })
            .returning();

        return NextResponse.json(newCertificate, { status: 201 });
    } catch (error) {
        console.error("Error creating certificate:", error);
        return NextResponse.json(
            { error: "Failed to create certificate" },
            { status: 500 }
        );
    }
}

