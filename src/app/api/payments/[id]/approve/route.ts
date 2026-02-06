import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateUUID } from "@/lib/validations";
import { processPaymentVerification } from "@/lib/services/payment";

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

        // Validate UUID format
        const validation = validateUUID(id);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // Process payment approval using shared service
        const result = await processPaymentVerification(id, "approved", session.user.id);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: result.status });
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

