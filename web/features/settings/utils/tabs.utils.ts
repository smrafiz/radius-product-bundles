import { SettingsTabConfig } from "@/features/settings";
import { SETTINGS_TABS } from "@/features/settings/configs/tabs.config";

/**
 * Get tab config by ID
 */
export function getTabConfig(tabId: string): SettingsTabConfig | undefined {
    return SETTINGS_TABS.find((tab) => tab.id === tabId);
}

/**
 * Get all tab IDs
 */
export function getTabIds(): string[] {
    return SETTINGS_TABS.map((tab) => tab.id);
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT VALUES EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extracts default values from all field configs
 */
export function getDefaultValues(): Record<string, any> {
    const defaults: Record<string, any> = {};

    for (const tab of SETTINGS_TABS) {
        // Standard sections
        if (tab.sections) {
            for (const section of tab.sections) {
                for (const field of section.fields) {
                    if (
                        field.type !== "custom" &&
                        field.defaultValue !== undefined
                    ) {
                        defaults[field.name] = field.defaultValue;
                    }
                }
            }
        }

        // Label sections
        if (tab.labelSections) {
            const labelDefaults: Record<string, string> = {};
            for (const section of tab.labelSections) {
                for (const field of section.fields) {
                    if (field.defaultValue !== undefined) {
                        labelDefaults[field.name] = field.defaultValue;
                    }
                }
            }
            if (Object.keys(labelDefaults).length > 0) {
                defaults.labels = labelDefaults;
            }
        }
    }

    return defaults;
}

/**
 * Pre-computed default values
 */
export const DEFAULT_SETTINGS = getDefaultValues();
