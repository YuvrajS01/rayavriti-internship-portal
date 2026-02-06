import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { validateUUID } from "@/lib/validations";

export const dynamic = "force-dynamic";

// Update user role
export async function PUT(
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

        const body = await request.json();

        // Cannot change own role
        if (id === session.user.id) {
            return NextResponse.json(
                { error: "Cannot change your own role" },
                { status: 400 }
            );
        }

        const newRole = body.role === "admin" ? "admin" : "user";

        await db
            .update(users)
            .set({ role: newRole })
            .where(eq(users.id, id));

        return NextResponse.json({ success: true, role: newRole });
    } catch (error) {
        console.error("Error updating user role:", error);
        return NextResponse.json(
            { error: "Failed to update user role" },
            { status: 500 }
        );
    }
}

