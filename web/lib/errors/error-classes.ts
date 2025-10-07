/**
 * Base application error class
 */
export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode: number = 500,
        public metadata?: Record<string, any>,
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, new.target.prototype);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            metadata: this.metadata,
        };
    }
}

/**
 * Validation error - 400
 * Used when input validation fails
 */
export class ValidationError extends AppError {
    constructor(
        message: string,
        public errors: Array<{ field?: string; message: string }>,
    ) {
        super(message, "VALIDATION_ERROR", 400);
    }
}

/**
 * Business rule violation - 400
 * Used when business logic rules are violated
 */
export class BusinessRuleError extends AppError {
    constructor(message: string, metadata?: Record<string, any>) {
        super(message, "BUSINESS_RULE_VIOLATION", 400, metadata);
    }
}

/**
 * Resource not found - 404
 */
export class NotFoundError extends AppError {
    constructor(resource: string, id: string) {
        super(`${resource} with id ${id} not found`, "NOT_FOUND", 404, {
            resource,
            id,
        });
    }
}

/**
 * Unauthorized - 401
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized") {
        super(message, "UNAUTHORIZED", 401);
    }
}

/**
 * Forbidden - 403
 */
export class ForbiddenError extends AppError {
    constructor(message: string = "Forbidden") {
        super(message, "FORBIDDEN", 403);
    }
}

/**
 * Conflict - 409
 * Used for duplicate entries, concurrent modifications
 */
export class ConflictError extends AppError {
    constructor(message: string, metadata?: Record<string, any>) {
        super(message, "CONFLICT", 409, metadata);
    }
}

/**
 * Rate limit exceeded - 429
 */
export class RateLimitError extends AppError {
    constructor(message: string = "Too many requests", retryAfter?: number) {
        super(message, "RATE_LIMIT_EXCEEDED", 429, { retryAfter });
    }
}

/**
 * External service error - 502
 */
export class ExternalServiceError extends AppError {
    constructor(service: string, originalError?: Error) {
        super(
            `External service ${service} failed`,
            "EXTERNAL_SERVICE_ERROR",
            502,
            { service, originalError: originalError?.message },
        );
    }
}
