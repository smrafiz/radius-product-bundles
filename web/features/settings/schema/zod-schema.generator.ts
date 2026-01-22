import { z } from "zod";
import { sanitizeHtml } from "@/shared";
import { FieldConfig } from "@/features/settings";
import { SETTINGS_TABS } from "@/features/settings/configs/tabs.config";

/**
 * Builds Zod schema for a single field from its config
 */
function buildFieldSchema(field: FieldConfig): z.ZodTypeAny {
    const { validation } = field;

    switch (field.type) {
        case "text":
        case "textarea": {
            let schema = z.string();

            if (validation?.required) {
                schema = schema.min(1, validation.required);
            }
            if (validation?.minLength) {
                schema = schema.min(
                    validation.minLength.value,
                    validation.minLength.message,
                );
            }
            if (validation?.maxLength) {
                schema = schema.max(
                    validation.maxLength.value,
                    validation.maxLength.message,
                );
            }
            if (validation?.pattern) {
                schema = schema.regex(
                    validation.pattern.value,
                    validation.pattern.message,
                );
            }

            // Apply default and sanitize
            let finalSchema = schema.transform(sanitizeHtml);
            if (field.defaultValue !== undefined) {
                return finalSchema.default(field.defaultValue);
            }
            return finalSchema;
        }

        case "number": {
            // Use coerce to convert string input from Shopify components to number
            let schema = z.coerce.number();

            if (validation?.min) {
                schema = schema.min(
                    validation.min.value,
                    validation.min.message,
                );
            }
            if (validation?.max) {
                schema = schema.max(
                    validation.max.value,
                    validation.max.message,
                );
            }
            if (validation?.minLength) {
                schema = schema.min(
                    validation.minLength.value,
                    validation.minLength.message,
                );
            }

            if (field.defaultValue !== undefined) {
                return schema.default(field.defaultValue);
            }
            return schema;
        }

        case "select": {
            const values = field.options.map((opt) => opt.value);
            let schema = z.enum(values as [string, ...string[]]);

            if (field.defaultValue !== undefined) {
                return schema.default(field.defaultValue as any);
            }
            return schema;
        }

        case "switch": {
            // Use coerce to handle string "true"/"false" from form data
            let schema = z.coerce.boolean();
            if (field.defaultValue !== undefined) {
                return schema.default(field.defaultValue);
            }
            return schema;
        }

        case "custom": {
            return z.any().optional();
        }

        default:
            return z.any();
    }
}

/**
 * Generates the complete app settings Zod schema from config
 */
export function generateSettingsSchema() {
    const schemaShape: Record<string, z.ZodTypeAny> = {};
    const nestedSchemas: Record<string, Record<string, z.ZodTypeAny>> = {};

    for (const tab of SETTINGS_TABS) {
        if (!tab.sections) continue;

        for (const section of tab.sections) {
            for (const field of section.fields) {
                if (field.type === "custom") continue;

                const fieldSchema = buildFieldSchema(field);

                // Check if fields should be nested (e.g., labels.headingLabel)
                if (tab.parentPath) {
                    if (!nestedSchemas[tab.parentPath]) {
                        nestedSchemas[tab.parentPath] = {};
                    }
                    nestedSchemas[tab.parentPath][field.name] = fieldSchema;
                } else {
                    schemaShape[field.name] = fieldSchema;
                }
            }
        }
    }

    // Add nested schemas
    for (const [parentPath, fields] of Object.entries(nestedSchemas)) {
        schemaShape[parentPath] = z.object(fields).optional();
    }

    // Add globalStyles as optional JSON
    schemaShape.globalStyles = z.any().optional();

    return z.object(schemaShape);
}

/**
 * Pre-generated schema
 */
export const appSettingsSchema = generateSettingsSchema();

/**
 * Labels schema (extracted for separate use)
 */
export const labelsSchema = (() => {
    const labelsTab = SETTINGS_TABS.find((tab) => tab.parentPath === "labels");
    if (!labelsTab?.sections) return z.object({});

    const shape: Record<string, z.ZodTypeAny> = {};
    for (const section of labelsTab.sections) {
        for (const field of section.fields) {
            if (field.type !== "custom") {
                shape[field.name] = buildFieldSchema(field);
            }
        }
    }
    return z.object(shape);
})();
