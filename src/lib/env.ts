import { z } from "zod";

/**
 * Server-side environment variable validation
 * Validates all required environment variables at startup
 */

const serverEnvSchema = z.object({
    // Database
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

    // Auth
    AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
    NEXTAUTH_URL: z.string().url().optional(),

    // UPI Payment
    UPI_ID: z.string().min(1, "UPI_ID is required"),
    UPI_MERCHANT_NAME: z.string().min(1, "UPI_MERCHANT_NAME is required"),

    // Email (Resend)
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().optional(),

    // Google OAuth
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    // App
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const clientEnvSchema = z.object({
    NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL"),
    NEXT_PUBLIC_APP_NAME: z.string().min(1, "NEXT_PUBLIC_APP_NAME is required"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validate server environment variables
 * Call this at application startup
 */
function validateServerEnv(): ServerEnv {
    const result = serverEnvSchema.safeParse(process.env);

    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        const errorMessages = Object.entries(errors)
            .map(([key, messages]) => `  ${key}: ${messages?.join(", ")}`)
            .join("\n");

        console.error("❌ Invalid environment variables:\n" + errorMessages);

        // In production, throw to prevent startup with invalid config
        if (process.env.NODE_ENV === "production") {
            throw new Error("Invalid environment configuration");
        }
    }

    return result.data as ServerEnv;
}

/**
 * Validate client environment variables
 */
function validateClientEnv(): ClientEnv {
    const result = clientEnvSchema.safeParse({
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    });

    if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        const errorMessages = Object.entries(errors)
            .map(([key, messages]) => `  ${key}: ${messages?.join(", ")}`)
            .join("\n");

        console.error("❌ Invalid public environment variables:\n" + errorMessages);
    }

    return result.data as ClientEnv;
}

// Validate on module load (will run at startup)
export const serverEnv = validateServerEnv();
export const clientEnv = validateClientEnv();

/**
 * Check if running in production
 */
export function isProduction(): boolean {
    return process.env.NODE_ENV === "production";
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
}
