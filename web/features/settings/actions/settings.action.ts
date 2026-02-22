"use server";

/**
 * Settings Actions - Auth Layer
 */

import { ApiResponse } from "@/shared";
import { revalidatePath } from "next/cache";
import { handleSessionToken } from "@/lib/shopify";
import { syncAllSettingsToMetafields, updateDiscountCombinesWith } from "@/lib";
import {
    getSettingsService,
    resetSettingsService,
    saveSettingsService,
} from "@/features/settings/services/settings.service";
import { AppSettingsFormData } from "@/features/settings";

/**
 * Get app settings for the current shop.
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
 * Save app settings for the current shop.
 *
 * Also syncs settings to Shopify metafields for storefront access.
 */
export async function saveSettingsAction(
    sessionToken: string,
    data: AppSettingsFormData,
): Promise<ApiResponse<AppSettingsFormData>> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        // Save to database
        const savedSettings = await saveSettingsService({ shop, data });

        const syncOps: Promise<any>[] = [
            syncAllSettingsToMetafields(sessionToken, shop, savedSettings),
        ];
        if (
            data.allowDiscountStacking !== undefined &&
            data.allowDiscountStacking !== null
        ) {
            syncOps.push(
                updateDiscountCombinesWith(
                    sessionToken,
                    Boolean(data.allowDiscountStacking),
                    shop,
                ),
            );
        }
        await Promise.allSettled(syncOps);

        // Revalidate cached pages
        revalidatePath("/settings");
        revalidatePath("/settings/customizer");
        revalidatePath("/dashboard");

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
 * Reset app settings to defaults.
 *
 * Also syncs reset settings to Shopify metafields.
 */
export async function resetSettingsAction(
    sessionToken: string,
): Promise<ApiResponse<null>> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        // Reset in database
        await resetSettingsService({ shop });

        // Sync to Shopify metafields (will use default values)
        const syncResult = await syncAllSettingsToMetafields(
            sessionToken,
            shop,
        );

        if (!syncResult.success) {
            console.warn(
                "[resetSettings] Metafield sync warning:",
                syncResult.error,
            );
            // Don't fail the whole operation, just log warning
        }

        // Revalidate cached pages
        revalidatePath("/settings");
        revalidatePath("/settings/customizer");
        revalidatePath("/dashboard");

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
