import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, payments, enrollments } from "@/db";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Reject a payment
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
                status: "rejected",
                verifiedAt: new Date(),
                verifiedBy: session.user.id,
            })
            .where(eq(payments.id, id));

        // Cancel the enrollment by userId and courseId
        await db
            .update(enrollments)
            .set({ status: "cancelled" })
            .where(
                and(
                    eq(enrollments.userId, payment.userId),
                    eq(enrollments.courseId, payment.courseId)
                )
            );

        // Redirect back to payments page
        return NextResponse.redirect(new URL("/admin/payments", request.url));
    } catch (error) {
        console.error("Error rejecting payment:", error);
        return NextResponse.json(
            { error: "Failed to reject payment" },
            { status: 500 }
        );
    }
}
