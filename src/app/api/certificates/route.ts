import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, certificates, users, courses, enrollments } from "@/db";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Generate a certificate ID
function generateCertificateId(): string {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `RAY-${year}-${random}`;
}

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

        // Generate unique certificate ID
        let certificateId = generateCertificateId();
        let attempts = 0;
        while (attempts < 10) {
            const [exists] = await db
                .select()
                .from(certificates)
                .where(eq(certificates.certificateId, certificateId))
                .limit(1);
            if (!exists) break;
            certificateId = generateCertificateId();
            attempts++;
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
