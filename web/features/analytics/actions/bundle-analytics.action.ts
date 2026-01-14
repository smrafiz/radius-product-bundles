"use server";

/**
 * Bundle Analytics Actions - Auth Layer
 *
 * Handles authentication and calls service layer
 */

import { ApiResponse } from "@/shared";
import { handleSessionToken } from "@/lib/shopify";
import { getTopBundlesService } from "@/features/analytics/services";

/**
 * Get top-performing bundles with all enhancements
 */
export async function getTopBundlesAction(
    sessionToken: string,
    startDate: string,
    endDate: string,
    limit: number = 10,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const topBundles = await getTopBundlesService(
            shop,
            startDate,
            endDate,
            limit,
        );

        return {
            status: "success",
            data: topBundles,
        };
    } catch (error) {
        console.error("[getTopBundles] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch top bundles",
            data: null,
        };
    }
}
