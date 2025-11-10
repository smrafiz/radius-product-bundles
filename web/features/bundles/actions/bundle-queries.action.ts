"use server";

/**
 * Bundle Query Actions - Auth Layer
 *
 * Handles authentication and calls service layer.
 */

import {
    ApiResponse,
    getSixtyDaysAgo,
    getThirtyDaysAgo,
    transformBundleMetrics,
} from "@/shared";
import {
    aggregateBundleMetrics,
    BundleFilters,
    getBundleDetails,
    getBundlesListService,
} from "@/features/bundles";
import { handleSessionToken } from "@/lib/shopify";

/**
 * Get bundles for a shop
 */
export async function getBundlesAction(
    sessionToken: string,
    page: number = 1,
    itemsPerPage: number = 10,
    filters?: BundleFilters,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const result = await getBundlesListService({
            shop,
            sessionToken,
            pagination: { page, itemsPerPage },
            filters,
        });

        return {
            status: "success" as const,
            data: { ...result },
        };
    } catch (error) {
        console.error("[getBundles] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch bundles",
            data: [],
        };
    }
}

/**
 * Get bundle metrics for a shop
 */
export async function getBundleMetricsAction(
    sessionToken: string,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const thirtyDaysAgo = getThirtyDaysAgo();
        const sixtyDaysAgo = getSixtyDaysAgo();

        const rawMetrics = await aggregateBundleMetrics(
            shop,
            thirtyDaysAgo,
            sixtyDaysAgo,
        );

        const metrics = transformBundleMetrics(rawMetrics);

        return {
            status: "success",
            data: metrics,
        };
    } catch (error) {
        console.error("[getBundleMetrics] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch metrics",
            data: null,
        };
    }
}

/**
 * Get a single bundle with details
 */
export async function getBundleAction(
    sessionToken: string,
    bundleId: string,
): Promise<ApiResponse> {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const bundle = await getBundleDetails({
            bundleId,
            shop,
            sessionToken,
        });

        return {
            status: "success",
            data: bundle,
        };
    } catch (error) {
        console.error("[getBundle] Error:", error);

        return {
            status: "error",
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch bundle",
            data: null,
        };
    }
}
