"use server";

/**
 * Settings Actions - Auth Layer
 */

import { ApiResponse } from "@/shared";
import { handleSessionToken } from "@/lib/shopify";
import {
    getSettingsService,
    resetSettingsService,
    saveSettingsService,
} from "@/features/settings/services/settings.service";
import { AppSettingsFormData } from "@/features/settings";

/**
 * Get app settings for the current shop
 */
export async function getSettingsAction(
    sessionToken: string,
): Promise<ApiResponse<AppSettingsFormData | null>> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const settings = await getSettingsService({ shop });

        return {
            status: "success",
            data: settings,
        };
    } catch (error) {
        console.error("[getSettings] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch settings",
            data: null,
        };
    }
}

/**
 * Save app settings for the current shop
 */
export async function saveSettingsAction(
    sessionToken: string,
    data: AppSettingsFormData,
): Promise<ApiResponse<AppSettingsFormData>> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const savedSettings = await saveSettingsService({ shop, data });

        return {
            status: "success",
            data: savedSettings,
            message: "Settings saved successfully",
        };
    } catch (error) {
        console.error("[saveSettings] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to save settings",
            data: null as any,
        };
    }
}

/**
 * Reset app settings to defaults
 */
export async function resetSettingsAction(
    sessionToken: string,
): Promise<ApiResponse<null>> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        await resetSettingsService({ shop });

        return {
            status: "success",
            data: null,
            message: "Settings reset to defaults",
        };
    } catch (error) {
        console.error("[resetSettings] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to reset settings",
            data: null,
        };
    }
}
