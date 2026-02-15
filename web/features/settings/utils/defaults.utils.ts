import { SETTINGS_TABS } from "@/features/settings/configs/tabs.config";
import { FieldConfig } from "@/features/settings";

/**
 * Extracts default values from all tab configs.
 */
export function getDefaultValuesFromConfig(): Record<string, any> {
    const defaults: Record<string, any> = {};

    for (const tab of SETTINGS_TABS) {
        if (!tab.sections) continue;

        for (const section of tab.sections) {
            for (const field of section.fields) {
                if (field.type === "custom") continue;

                const defaultValue = (field as any).defaultValue;
                if (defaultValue === undefined) continue;

                // Check if fields should be nested
                if (tab.parentPath) {
                    if (!defaults[tab.parentPath]) {
                        defaults[tab.parentPath] = {};
                    }
                    defaults[tab.parentPath][field.name] = defaultValue;
                } else {
                    defaults[field.name] = defaultValue;
                }
            }
        }
    }

    return defaults;
}

/**
 * Merges initial data with defaults from config.
 */
export function mergeWithDefaults(
    initialData?: Partial<Record<string, any>>,
): Record<string, any> {
    const defaults = getDefaultValuesFromConfig();

    if (!initialData) {
        return defaults;
    }

    // Deep merge for nested objects like labels
    const merged = { ...defaults };

    for (const [key, value] of Object.entries(initialData)) {
        if (value === undefined || value === null) continue;

        // If both are objects, merge them
        if (
            typeof value === "object" &&
            !Array.isArray(value) &&
            typeof merged[key] === "object" &&
            !Array.isArray(merged[key])
        ) {
            merged[key] = { ...merged[key], ...value };
        } else {
            merged[key] = value;
        }
    }

    return merged;
}
