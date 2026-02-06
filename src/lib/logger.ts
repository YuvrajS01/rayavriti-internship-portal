/**
 * Structured logging utility
 * 
 * Features:
 * - JSON output in production for log aggregation (Vercel, etc.)
 * - Colorful, readable output in development
 * - Request ID tracking
 * - Log levels: error, warn, info, debug
 */

type LogLevel = "error" | "warn" | "info" | "debug";

interface LogContext {
    requestId?: string;
    userId?: string;
    path?: string;
    method?: string;
    statusCode?: number;
    duration?: number;
    [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

const isProduction = process.env.NODE_ENV === "production";
const currentLevel = isProduction ? "info" : "debug";

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[currentLevel];
}

function formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
): string | object {
    const timestamp = new Date().toISOString();

    if (isProduction) {
        // JSON format for production (easier to parse in log aggregators)
        return {
            timestamp,
            level,
            message,
            ...context,
        };
    }

    // Colorful format for development
    const colors: Record<LogLevel, string> = {
        error: "\x1b[31m", // Red
        warn: "\x1b[33m",  // Yellow
        info: "\x1b[36m",  // Cyan
        debug: "\x1b[90m", // Gray
    };
    const reset = "\x1b[0m";
    const color = colors[level];

    let output = `${color}[${level.toUpperCase()}]${reset} ${timestamp} - ${message}`;

    if (context && Object.keys(context).length > 0) {
        output += ` ${JSON.stringify(context)}`;
    }

    return output;
}

function log(level: LogLevel, message: string, context?: LogContext): void {
    if (!shouldLog(level)) return;

    const formatted = formatMessage(level, message, context);

    if (isProduction) {
        // In production, output as JSON string
        console[level](JSON.stringify(formatted));
    } else {
        console[level](formatted);
    }
}

export const logger = {
    error: (message: string, context?: LogContext) => log("error", message, context),
    warn: (message: string, context?: LogContext) => log("warn", message, context),
    info: (message: string, context?: LogContext) => log("info", message, context),
    debug: (message: string, context?: LogContext) => log("debug", message, context),

    /**
     * Log an API request
     */
    request: (
        method: string,
        path: string,
        statusCode: number,
        duration: number,
        context?: Omit<LogContext, "method" | "path" | "statusCode" | "duration">
    ) => {
        const level: LogLevel = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
        log(level, `${method} ${path} ${statusCode}`, {
            method,
            path,
            statusCode,
            duration,
            ...context,
        });
    },

    /**
     * Log an error with stack trace
     */
    exception: (error: Error, context?: LogContext) => {
        log("error", error.message, {
            ...context,
            stack: error.stack,
            name: error.name,
        });
    },
};

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}
