/**
 * Error handling utilities
 */

/**
 * Format error for API responses
 */
export function formatErrorResponse(
    error: unknown,
    defaultMessage: string = "An error occurred",
) {
    if (error instanceof Error) {
        return {
            error: error.message,
            details: error.name,
        };
    }
    return {
        error: defaultMessage,
        details: "Unknown error",
    };
}

/**
 * Check if the error is related to authentication
 */
export function isAuthError(error: unknown): boolean {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        return (
            message.includes("unauthorized") ||
            message.includes("invalid token") ||
            message.includes("session") ||
            message.includes("oauth")
        );
    }
    return false;
}

/**
 * Log error with context
 */
export function logError(
    context: string,
    error: unknown,
    additionalInfo?: any,
) {
    console.error(`❌ ${context}:`, error);
    if (additionalInfo) {
        console.error("Additional info:", additionalInfo);
    }
}

/**
 * Create a retry function with exponential backoff
 */
export function createRetryFunction<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
): () => Promise<T> {
    return async () => {
        let lastError: unknown;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                if (attempt === maxRetries) {
                    throw error;
                }

                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        throw lastError;
    };
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json);
    } catch (error) {
        logError("JSON Parse failed", error, { json });
        return fallback;
    }
}
