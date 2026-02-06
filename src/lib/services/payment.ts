import { db, payments, enrollments } from "@/db";
import { eq, and } from "drizzle-orm";

export type PaymentStatus = "approved" | "rejected";

interface ApprovePaymentResult {
    success: true;
    payment: typeof payments.$inferSelect;
}

interface PaymentError {
    success: false;
    error: string;
    status: number;
}

export type PaymentResult = ApprovePaymentResult | PaymentError;

/**
 * Process payment approval/rejection
 * Creates enrollment if approved
 */
export async function processPaymentVerification(
    paymentId: string,
    status: PaymentStatus,
    verifiedBy: string,
    adminNotes?: string
): Promise<PaymentResult> {
    // Get payment
    const [payment] = await db
        .select()
        .from(payments)
        .where(eq(payments.id, paymentId))
        .limit(1);

    if (!payment) {
        return { success: false, error: "Payment not found", status: 404 };
    }

    if (payment.status !== "pending") {
        return { success: false, error: "Payment already processed", status: 400 };
    }

    // Update payment status
    const [updatedPayment] = await db
        .update(payments)
        .set({
            status,
            adminNotes: adminNotes || null,
            verifiedAt: new Date(),
            verifiedBy,
        })
        .where(eq(payments.id, paymentId))
        .returning();

    // Handle enrollment based on status
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
    } else if (status === "rejected") {
        // Cancel any pending enrollment
        await db
            .update(enrollments)
            .set({ status: "cancelled" })
            .where(
                and(
                    eq(enrollments.userId, payment.userId),
                    eq(enrollments.courseId, payment.courseId)
                )
            );
    }

    return { success: true, payment: updatedPayment };
}
