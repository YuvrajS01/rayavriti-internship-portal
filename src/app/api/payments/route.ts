import { NextRequest, NextResponse } from "next/server";
import { db, payments, users, courses, enrollments } from "@/db";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@/auth";
import { paymentSchema, paymentVerificationSchema } from "@/lib/validations";

// GET - Get payments (user's own or all for admin)
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
        const status = searchParams.get("status");

        // Admin can view all payments
        if (session.user.role === "admin") {
            const conditions = [];

            if (status === "pending" || status === "approved" || status === "rejected") {
                conditions.push(eq(payments.status, status));
            }

            const allPayments = await db
                .select({
                    payment: payments,
                    user: users,
                    course: courses,
                })
                .from(payments)
                .innerJoin(users, eq(payments.userId, users.id))
                .innerJoin(courses, eq(payments.courseId, courses.id))
                .where(conditions.length > 0 ? and(...conditions) : undefined)
                .orderBy(desc(payments.createdAt));

            return NextResponse.json(allPayments);
        }

        // Regular users can only view their own payments
        const userPayments = await db
            .select({
                payment: payments,
                course: courses,
            })
            .from(payments)
            .innerJoin(courses, eq(payments.courseId, courses.id))
            .where(eq(payments.userId, session.user.id))
            .orderBy(desc(payments.createdAt));

        return NextResponse.json(userPayments);
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json(
            { error: "Failed to fetch payments" },
            { status: 500 }
        );
    }
}

// POST - Create payment (submit payment proof)
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

        const result = paymentSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const data = result.data;

        // Check if course exists
        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, data.courseId))
            .limit(1);

        if (!course) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            );
        }

        // Check for existing pending payment
        const [existingPayment] = await db
            .select()
            .from(payments)
            .where(
                and(
                    eq(payments.userId, session.user.id),
                    eq(payments.courseId, data.courseId),
                    eq(payments.status, "pending")
                )
            )
            .limit(1);

        if (existingPayment) {
            return NextResponse.json(
                { error: "You already have a pending payment for this course" },
                { status: 409 }
            );
        }

        // Create payment
        const [newPayment] = await db
            .insert(payments)
            .values({
                userId: session.user.id,
                courseId: data.courseId,
                amount: course.fee,
                transactionId: data.transactionId,
                screenshotUrl: data.screenshotUrl || null,
                status: "pending",
            })
            .returning();

        return NextResponse.json(newPayment, { status: 201 });
    } catch (error) {
        console.error("Error creating payment:", error);
        return NextResponse.json(
            { error: "Failed to create payment" },
            { status: 500 }
        );
    }
}

// PATCH - Verify payment (admin only)
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const result = paymentVerificationSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { paymentId, status, adminNotes } = result.data;

        // Get payment
        const [payment] = await db
            .select()
            .from(payments)
            .where(eq(payments.id, paymentId))
            .limit(1);

        if (!payment) {
            return NextResponse.json(
                { error: "Payment not found" },
                { status: 404 }
            );
        }

        // Update payment status
        const [updatedPayment] = await db
            .update(payments)
            .set({
                status,
                adminNotes: adminNotes || null,
                verifiedAt: new Date(),
                verifiedBy: session.user.id,
            })
            .where(eq(payments.id, paymentId))
            .returning();

        // If approved, create enrollment
        if (status === "approved") {
            // Check if enrollment already exists
            const [existingEnrollment] = await db
                .select()
                .from(enrollments)
                .where(
                    and(
                        eq(enrollments.userId, payment.userId),
                        eq(enrollments.courseId, payment.courseId)
                    )
                )
                .limit(1);

            if (!existingEnrollment) {
                await db.insert(enrollments).values({
                    userId: payment.userId,
                    courseId: payment.courseId,
                    status: "active",
                    progressPercentage: 0,
                });
            }
        }

        return NextResponse.json(updatedPayment);
    } catch (error) {
        console.error("Error verifying payment:", error);
        return NextResponse.json(
            { error: "Failed to verify payment" },
            { status: 500 }
        );
    }
}
