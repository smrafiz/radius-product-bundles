import { z } from "zod";
import { sanitizeHtml } from "@/shared";
import { FieldConfig, LabelFieldConfig } from "@/features/settings";
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
 * Builds Zod schema for a label field from its config
 */
function buildLabelFieldSchema(field: LabelFieldConfig): z.ZodTypeAny {
    const { validation } = field;
    let schema = z.string();

    if (validation?.required) {
        schema = schema.min(1, validation.required);
    }
    if (validation?.maxLength) {
        schema = schema.max(
            validation.maxLength.value,
            validation.maxLength.message,
        );
    }

    let finalSchema = schema.transform(sanitizeHtml);
    if (field.defaultValue !== undefined) {
        return finalSchema.default(field.defaultValue);
    }
    return finalSchema;
}

/**
 * Generates the complete app settings Zod schema from config
 */
export function generateSettingsSchema() {
    const schemaShape: Record<string, z.ZodTypeAny> = {};

    for (const tab of SETTINGS_TABS) {
        // Standard sections
        if (tab.sections) {
            for (const section of tab.sections) {
                for (const field of section.fields) {
                    if (field.type !== "custom") {
                        schemaShape[field.name] = buildFieldSchema(field);
                    }
                }
            }
        }

        // Label sections (nested object)
        if (tab.labelSections) {
            const labelSchemaShape: Record<string, z.ZodTypeAny> = {};

            for (const section of tab.labelSections) {
                for (const field of section.fields) {
                    labelSchemaShape[field.name] = buildLabelFieldSchema(field);
                }
            }

            schemaShape.labels = z.object(labelSchemaShape).optional();
        }
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
    const labelsTab = SETTINGS_TABS.find((tab) => tab.id === "labels");
    if (!labelsTab?.labelSections) return z.object({});

    const shape: Record<string, z.ZodTypeAny> = {};
    for (const section of labelsTab.labelSections) {
        for (const field of section.fields) {
            shape[field.name] = buildLabelFieldSchema(field);
        }
    }
    return z.object(shape);
})();
