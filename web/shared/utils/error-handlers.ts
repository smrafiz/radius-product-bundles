/**
 * Error Handlers - Shared Utilities
 */

import { ApiError } from "@/shared/types";

/**
 * Handle bundle operation errors
 */
export function handleBundleError(error: unknown): ApiError {
    console.error("[handleBundleError] Bundle operation failed:", error);

    if (error instanceof Error) {
        // Name conflict errors
        if (error.message.includes("already exists")) {
            return {
                status: "error",
                message: error.message,
                errors: [error.message],
            };
        }

        // Not found errors
        if (error.message.includes("not found")) {
            return {
                status: "error",
                message: error.message,
            };
        }

        // Permission errors
        if (error.message.includes("permission") || error.message.includes("unauthorized")) {
            return {
                status: "error",
                message: "You don't have permission to perform this action",
            };
        }

        // Validation errors
        if (error.message.includes("validation") || error.message.includes("invalid")) {
            return {
                status: "error",
                message: error.message,
                errors: [error.message],
            };
        }

        // Generic error with message
        return {
            status: "error",
            message: error.message,
        };
    }

    // Unknown error type
    return {
        status: "error",
        message: "Operation failed. Please try again.",
    };
}

/**
 * Handle API operation errors
 */
export function handleApiError(
    error: unknown,
    defaultMessage: string = "Operation failed"
): ApiError {
    console.error("[handleApiError]", error);

    if (error instanceof Error) {
        return {
            status: "error",
            message: error.message || defaultMessage,
            errors: [error.message],
        };
    }

    return {
        status: "error",
        message: defaultMessage,
    };
}

/**
 * Handle validation errors
 */
export function handleValidationError(error: unknown): ApiError {
    if (error instanceof Error) {
        return {
            status: "error",
            message: "Validation failed",
            errors: [error.message],
        };
    }

    return {
        status: "error",
        message: "Validation failed. Please check your input.",
    };
}

/**
 * Handle database errors
 */
export function handleDatabaseError(error: unknown): ApiError {
    console.error("[handleDatabaseError]", error);

    if (error instanceof Error) {
        // Prisma errors
        if (error.message.includes("Unique constraint")) {
            return {
                status: "error",
                message: "This record already exists",
            };
        }

        if (error.message.includes("Foreign key constraint")) {
            return {
                status: "error",
                message: "Cannot perform this action due to related records",
            };
        }
    }

    return {
        status: "error",
        message: "Database operation failed. Please try again.",
    };
}

/**
 * Handle transaction errors
 */
export function handleTransactionError(error: unknown): ApiError {
    console.error("[handleTransactionError] Transaction failed:", error);

    return {
        status: "error",
        message: "Transaction failed. No changes were made.",
    };
}

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