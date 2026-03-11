"use server";

import type { TopBundle } from "@/features/analytics";
import { handleSessionToken } from "@/lib/shopify";
import { ApiResponse } from "@/shared";
import { getRecentBundlesService } from "@/features/dashboard/services/recent-bundles.service";

export async function getRecentActiveBundlesAction(
    sessionToken: string,
    limit: number = 5,
): Promise<ApiResponse<TopBundle[]>> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const data = await getRecentBundlesService({ shop, limit });

        return { status: "success", data };
    } catch (error) {
        console.error("[Dashboard] Failed to fetch recent bundles:", error);
        return {
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
            data: [],
        };
    }
}
