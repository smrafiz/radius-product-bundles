"use server";

/**
 * Bundle Analytics Actions - Auth Layer
 *
 * Handles authentication and calls service layer
 */

import { ApiResponse } from "@/shared";
import {
    getAllBundlesAnalytics,
    getPaginatedBundlesAnalytics,
    getTopBundlesService,
} from "@/features/analytics/services";
import { handleSessionToken } from "@/lib/shopify";
import { GetPaginatedBundlesParams, SortField, SortOrder, } from "@/features/analytics";

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

/**
 * Get all bundles with analytics data
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

        const data = await getAllBundlesAnalytics(
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
 * Get paginated bundles with analytics, search, and sorting
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

        const data = await getPaginatedBundlesAnalytics({
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
