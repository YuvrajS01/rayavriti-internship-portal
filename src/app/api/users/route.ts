import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db, users } from "@/db";
import { desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Get all users with stats
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get all users
        const allUsers = await db
            .select()
            .from(users)
            .orderBy(desc(users.createdAt));

        // Get stats
        const [stats] = await db
            .select({
                total: sql<number>`count(*)::int`,
                admins: sql<number>`count(*) filter (where role = 'admin')::int`,
                thisMonth: sql<number>`count(*) filter (where created_at >= date_trunc('month', current_date))::int`,
            })
            .from(users);

        return NextResponse.json({
            users: allUsers,
            stats: stats || { total: 0, admins: 0, thisMonth: 0 },
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
