import { NextResponse } from "next/server";

/**
 * Standardized API error response
 */
export function errorResponse(message: string, status: number, details?: Record<string, unknown>) {
    const response: { success: false; error: string; details?: Record<string, unknown> } = {
        success: false,
        error: message,
    };
    if (details) {
        response.details = details;
    }
    return NextResponse.json(response, { status });
}

/**
 * Standardized API success response
 */
export function successResponse<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
}

/**
 * Common error responses
 */
export const ApiErrors = {
    unauthorized: () => errorResponse("Unauthorized", 401),
    notFound: (resource = "Resource") => errorResponse(`${resource} not found`, 404),
    badRequest: (message = "Bad request") => errorResponse(message, 400),
    invalidId: () => errorResponse("Invalid ID format", 400),
    serverError: (message = "Internal server error") => errorResponse(message, 500),
} as const;
