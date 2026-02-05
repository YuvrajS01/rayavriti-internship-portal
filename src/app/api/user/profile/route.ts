import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Update user profile
export async function PUT(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        await db
            .update(users)
            .set({
                name: body.name,
                mobile: body.mobile,
                updatedAt: new Date(),
            })
            .where(eq(users.id, session.user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
