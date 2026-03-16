import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSettings, updateSettings } from "@/lib/actions/settings";

export async function GET() {
    try {
        const settings = await getSettings();
        return NextResponse.json(settings);
    } catch (error) {
        console.error("GET /api/admin/settings error:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await auth();

        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const updatedSettings = await updateSettings(body);

        return NextResponse.json(updatedSettings);
    } catch (error) {
        console.error("PATCH /api/admin/settings error:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
