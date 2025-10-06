import {
    AppError,
    BusinessRuleError,
    NotFoundError,
    ValidationError,
} from "./error-classes";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export interface ApiResponse<T = unknown> {
    status: "success" | "error";
    data?: T;
    message?: string;
    code?: string;
    errors?: Array<{ field?: string; message: string }>;
    metadata?: Record<string, any>;
}

export class ErrorFormatter {
    /**
     * Format any error into a standardized API response
     */
    static toApiResponse(error: unknown): ApiResponse {
        console.error("Error occurred:", error);

        // Handle ValidationError
        if (error instanceof ValidationError) {
            return {
                status: "error",
                message: error.message,
                code: error.code,
                errors: error.errors,
            };
        }

        // Handle other AppErrors
        if (error instanceof AppError) {
            return {
                status: "error",
                message: error.message,
                code: error.code,
                metadata: error.metadata,
            };
        }

        // Handle Zod validation errors
        if (error instanceof ZodError) {
            return this.formatZodError(error);
        }

        // Handle Prisma errors
        if (error instanceof PrismaClientKnownRequestError) {
            return this.formatPrismaError(error);
        }

        // Handle standard errors
        if (error instanceof Error) {
            return {
                status: "error",
                message: error.message,
                code: "INTERNAL_ERROR",
            };
        }

        // Unknown error type
        return {
            status: "error",
            message: "An unexpected error occurred",
            code: "INTERNAL_ERROR",
        };
    }

    /**
     * Format Zod validation errors
     */
    private static formatZodError(error: ZodError): ApiResponse {
        return {
            status: "error",
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            errors: error.issues.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            })),
        };
    }

    /**
     * Format Prisma errors into user-friendly messages
     */
    private static formatPrismaError(
        error: PrismaClientKnownRequestError,
    ): ApiResponse {
        switch (error.code) {
            case "P2002": {
                // Unique constraint violation
                const target = error.meta?.target as string[] | undefined;
                const field = target?.[0] || "field";
                return {
                    status: "error",
                    message: "A record with this value already exists",
                    code: "DUPLICATE_ENTRY",
                    errors: [{ field, message: "Must be unique" }],
                };
            }

            case "P2025": {
                // Record not found
                return {
                    status: "error",
                    message: "Record not found",
                    code: "NOT_FOUND",
                };
            }

            case "P2003": {
                // Foreign key constraint failed
                return {
                    status: "error",
                    message: "Related record not found",
                    code: "CONSTRAINT_VIOLATION",
                };
            }

            case "P2014": {
                // Required relation violation
                return {
                    status: "error",
                    message: "Cannot delete record due to related records",
                    code: "CONSTRAINT_VIOLATION",
                };
            }

            default: {
                return {
                    status: "error",
                    message: "Database operation failed",
                    code: "DATABASE_ERROR",
                    metadata: { prismaCode: error.code },
                };
            }
        }
    }

    /**
     * Get a user-friendly message from any error
     */
    static toUserMessage(error: unknown): string {
        if (error instanceof AppError) {
            return error.message;
        }
        if (error instanceof ZodError) {
            return "Please check your input and try again";
        }
        if (error instanceof Error) {
            return error.message;
        }
        return "Something went wrong. Please try again.";
    }

    /**
     * Check if an error should be logged (not validation errors)
     */
    static shouldLog(error: unknown): boolean {
        if (error instanceof ValidationError) {
            return false;
        }
        if (error instanceof BusinessRuleError) {
            return false;
        }
        return !(error instanceof NotFoundError);
    }
}
