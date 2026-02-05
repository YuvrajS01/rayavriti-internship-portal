import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, payments, enrollments } from "@/db";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Approve a payment
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

        // Get the payment
        const [payment] = await db
            .select()
            .from(payments)
            .where(eq(payments.id, id))
            .limit(1);

        if (!payment) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        if (payment.status !== "pending") {
            return NextResponse.json(
                { error: "Payment already processed" },
                { status: 400 }
            );
        }

        // Update payment status
        await db
            .update(payments)
            .set({
                status: "approved",
                verifiedAt: new Date(),
                verifiedBy: session.user.id,
            })
            .where(eq(payments.id, id));

        // Check if enrollment exists
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

        if (existingEnrollment) {
            // Update existing enrollment to active
            await db
                .update(enrollments)
                .set({ status: "active" })
                .where(eq(enrollments.id, existingEnrollment.id));
        } else {
            // Create new enrollment
            await db.insert(enrollments).values({
                userId: payment.userId,
                courseId: payment.courseId,
                status: "active",
                progressPercentage: 0,
            });
        }

        // Redirect back to payments page
        return NextResponse.redirect(new URL("/admin/payments", request.url));
    } catch (error) {
        console.error("Error approving payment:", error);
        return NextResponse.json(
            { error: "Failed to approve payment" },
            { status: 500 }
        );
    }
}
