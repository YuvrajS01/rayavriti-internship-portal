import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface HealthStatus {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    version: string;
    checks: {
        database: {
            status: "up" | "down";
            latency?: number;
            error?: string;
        };
        environment: {
            status: "ok" | "missing";
            missing?: string[];
        };
    };
}

/**
 * Health check endpoint for monitoring and deployment platforms
 * GET /api/health
 */
export async function GET() {
    const health: HealthStatus = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "0.1.0",
        checks: {
            database: { status: "up" },
            environment: { status: "ok" },
        },
    };

    // Check database connection
    try {
        const dbStart = Date.now();
        await db.execute(sql`SELECT 1`);
        health.checks.database.latency = Date.now() - dbStart;
    } catch (error) {
        health.checks.database.status = "down";
        health.checks.database.error = error instanceof Error ? error.message : "Unknown error";
        health.status = "unhealthy";
    }

    // Check required environment variables
    const requiredEnvVars = [
        "DATABASE_URL",
        "AUTH_SECRET",
        "UPI_ID",
        "UPI_MERCHANT_NAME",
        "NEXT_PUBLIC_APP_URL",
        "NEXT_PUBLIC_APP_NAME",
    ];

    const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

    if (missingVars.length > 0) {
        health.checks.environment.status = "missing";
        health.checks.environment.missing = missingVars;
        if (health.status !== "unhealthy") {
            health.status = "degraded";
        }
    }

    // Determine HTTP status code
    const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503;

    return NextResponse.json(health, {
        status: statusCode,
        headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
    });
}
