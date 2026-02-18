"use server";

/**
 * Bundle Analytics Actions - Auth Layer
 *
 * Handles authentication and delegates to cached service layer.
 * Caching via `use cache` directive in analytics.cached.ts.
 */

import { ApiResponse } from "@/shared";
import { handleSessionToken } from "@/lib/shopify";
import {
    GetPaginatedBundlesParams,
    SortField,
    SortOrder,
} from "@/features/analytics";
import {
    getCachedTopBundles,
    getCachedAllBundlesAnalytics,
    getCachedPaginatedBundlesAnalytics,
} from "@/features/analytics/services/analytics.cached";

/**
 * Get top-performing bundles (cached via use cache: 10 min)
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

        const topBundles = await getCachedTopBundles(
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

/**
 * Get all bundles with analytics data (cached via use cache: 5 min)
 */
export async function getAllBundlesAction(
    sessionToken: string,
    startDate: string,
    endDate: string,
    sortBy: SortField = "revenue",
    sortOrder: SortOrder = "desc",
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const data = await getCachedAllBundlesAnalytics(
            shop,
            startDate,
            endDate,
            sortBy,
            sortOrder,
        );

        return {
            status: "success",
            data,
        };
    } catch (error) {
        console.error("[getAllBundles] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch bundles",
            data: null,
        };
    }
}

/**
 * Get paginated bundles with analytics (cached via use cache: 5 min)
 */
export async function getPaginatedBundlesAction(
    params: GetPaginatedBundlesParams,
): Promise<ApiResponse> {
    try {
        const {
            sessionToken,
            startDate,
            endDate,
            sortBy = "revenue",
            sortOrder = "desc",
            page = 1,
            perPage = 10,
            search = "",
        } = params;

        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const data = await getCachedPaginatedBundlesAnalytics({
            shop,
            startDateStr: startDate,
            endDateStr: endDate,
            sortBy,
            sortOrder,
            page,
            perPage,
            search,
        });

        return {
            status: "success",
            data,
        };
    } catch (error) {
        console.error("[getPaginatedBundles] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch bundles",
            data: null,
        };
    }
}
