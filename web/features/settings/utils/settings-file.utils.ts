/**
 * Utility functions for handling settings file operations
 */

import { AppSettingsFormData } from "@/features/settings";

/**
 * Trigger download of settings data as a JSON file
 */
export function downloadSettingsFile(data: AppSettingsFormData): void {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    // Format filename with timestamp: radius-settings-YYYY-MM-DD.json
    const date = new Date().toISOString().split("T")[0];
    link.download = `radius-settings-${date}.json`;
    link.href = url;

    // Append to body to ensure click works in some browsers
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Read and parse a JSON file containing settings
 */
export async function readSettingsFile(file: File): Promise<any> {
    const text = await file.text();
    let data;

    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error("Invalid JSON file");
    }

    if (!data || typeof data !== "object") {
        throw new Error("Invalid settings format");
    }

    return data;
}
