/**
 * Format validation errors into user-friendly messages
 */

import DOMPurify from "isomorphic-dompurify";
import { Config, ExtractLabelsOptions, ValidationErrors } from "@/shared";

/**
 * Format errors as a single concatenated string
 */
export function formatValidationErrorsAsString(
    errors: ValidationErrors,
): string {
    if (!errors || Object.keys(errors).length === 0) {
        return "Validation failed";
    }

    return Object.entries(errors)
        .map(([field, error]) => {
            const fieldName = formatFieldName(field);
            const messages = error._errors.join(", ");
            return `${fieldName}: ${messages}`;
        })
        .join("; ");
}

/**
 * Format errors as an array of messages
 */
export function formatValidationErrorsAsArray(
    errors: ValidationErrors,
): string[] {
    if (!errors || Object.keys(errors).length === 0) {
        return ["Validation failed"];
    }

    return Object.entries(errors).map(([field, error]) => {
        const fieldName = formatFieldName(field);
        const messages = error._errors.join(", ");
        return `${fieldName}: ${messages}`;
    });
}

/**
 * Format errors as bullet points
 */
export function formatValidationErrorsAsBullets(
    errors: ValidationErrors,
): string {
    if (!errors || Object.keys(errors).length === 0) {
        return "Validation failed";
    }

    return Object.entries(errors)
        .map(([field, error]) => {
            const fieldName = formatFieldName(field);
            const messages = error._errors.join(", ");
            return `• ${fieldName}: ${messages}`;
        })
        .join("\n");
}

/**
 * Get only the first error message
 */
export function formatFirstValidationError(errors: ValidationErrors): string {
    if (!errors || Object.keys(errors).length === 0) {
        return "Validation failed";
    }

    const [field, error] = Object.entries(errors)[0];
    const fieldName = formatFieldName(field);
    const firstMessage = error._errors[0];

    return `${fieldName}: ${firstMessage}`;
}

/**
 * Format errors as HTML for rich display
 */
export function formatValidationErrorsAsHTML(errors: ValidationErrors): string {
    if (!errors || Object.keys(errors).length === 0) {
        return "<p>Validation failed</p>";
    }

    const items = Object.entries(errors)
        .map(([field, error]) => {
            const fieldName = formatFieldName(field);
            const messages = error._errors.join(", ");
            return `<li><strong>${fieldName}:</strong> ${messages}</li>`;
        })
        .join("");

    return `<ul>${items}</ul>`;
}

/**
 * Convert camelCase or snake_case field names to Title Case
 */
function formatFieldName(field: string): string {
    // Handle snake_case
    const words = field
        .replace(/_/g, " ")
        // Handle camelCase
        .replace(/([A-Z])/g, " $1")
        .trim()
        .split(" ");

    // Capitalize the first letter of each word
    return words
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
}

/**
 * Get error count
 */
export function getValidationErrorCount(errors: ValidationErrors): number {
    if (!errors) return 0;
    return Object.keys(errors).length;
}

/**
 * Check if specific field has error
 */
export function hasFieldError(
    errors: ValidationErrors,
    field: string,
): boolean {
    return errors && errors[field] && errors[field]._errors.length > 0;
}

/**
 * Get error message for specific field
 */
export function getFieldErrorMessage(
    errors: ValidationErrors,
    field: string,
): string | null {
    if (!errors || !errors[field] || errors[field]._errors.length === 0) {
        return null;
    }
    return errors[field]._errors.join(", ");
}

/**
 * Sanitizes HTML content by removing all tags and attributes.
 */
export const sanitizeHtml = (value: string) => {
    return DOMPurify.sanitize(value, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    }).trim();
};

/**
 * Extract field labels from a config object.
 */
export function extractFieldLabelsFromConfig(
    config: Config,
    options: ExtractLabelsOptions = {},
): Record<string, string> {
    const { includeSectionTitle = true, separator = " - " } = options;
    const labels: Record<string, string> = {};

    config.sections.forEach((section) => {
        section.fields.forEach((field) => {
            if (includeSectionTitle) {
                labels[field.name] =
                    `${section.title}${separator}${field.label}`;
            } else {
                labels[field.name] = field.label;
            }
        });
    });

    return labels;
}

/**
 * Format validation errors with custom field labels from config.
 */
export function formatValidationErrorsWithConfig(
    errors: ValidationErrors,
    config: Config,
    options: ExtractLabelsOptions = {},
): string {
    if (!errors || Object.keys(errors).length === 0) {
        return "Validation failed";
    }

    const fieldLabels = extractFieldLabelsFromConfig(config, options);

    return Object.entries(errors)
        .map(([field, error]) => {
            const label = fieldLabels[field] || formatFieldName(field);
            const messages = error._errors.join(", ");
            return `${label}: ${messages}`;
        })
        .join("; ");
}
