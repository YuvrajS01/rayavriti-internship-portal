import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, enrollments, users, courses, certificates } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Get completed enrollments for certificate generation (excluding those with certificates)
export async function GET(request: Request) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        // Get enrollments with user and course data
        const allEnrollments = await db
            .select({
                id: enrollments.id,
                userId: enrollments.userId,
                courseId: enrollments.courseId,
                status: enrollments.status,
                completedAt: enrollments.completedAt,
                user: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                },
                course: {
                    id: courses.id,
                    title: courses.title,
                    slug: courses.slug,
                },
            })
            .from(enrollments)
            .innerJoin(users, eq(enrollments.userId, users.id))
            .innerJoin(courses, eq(enrollments.courseId, courses.id))
            .where(status === "completed" ? eq(enrollments.status, "completed") : undefined);

        // Get all certificates to filter out enrollments that already have them
        const allCertificates = await db
            .select({
                userId: certificates.userId,
                courseId: certificates.courseId,
            })
            .from(certificates);

        // Create a set of existing certificates for fast lookup
        const existingCerts = new Set(
            allCertificates.map((c) => `${c.userId}-${c.courseId}`)
        );

        // Filter out enrollments that already have certificates
        const enrollmentsWithoutCerts = allEnrollments.filter(
            (e) => !existingCerts.has(`${e.userId}-${e.courseId}`)
        );

        return NextResponse.json(enrollmentsWithoutCerts);
    } catch (error) {
        console.error("Error fetching enrollments:", error);
        return NextResponse.json(
            { error: "Failed to fetch enrollments" },
            { status: 500 }
        );
    }
}
