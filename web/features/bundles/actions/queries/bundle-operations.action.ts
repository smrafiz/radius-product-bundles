"use server";

import {
    analyticsQueries,
    BundleFilters,
    bundleService,
} from "@/features/bundles";
import { transformBundleMetrics } from "@/utils";
import { handleSessionToken } from "@/lib/shopify/verify";

/**
 * Get bundles for a shop
 */
export async function getBundles(
    sessionToken: string,
    page: number = 1,
    itemsPerPage: number = 10,
    filters?: BundleFilters,
) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const result = await bundleService.getBundles(shop, sessionToken, {
            page,
            itemsPerPage,
            filters,
        });

        return {
            status: "success" as const,
            ...result,
        };
    } catch (error) {
        console.error("Failed to fetch bundles:", error);
        return {
            status: "error" as const,
            message: "Failed to fetch bundles",
            data: [],
            pagination: {
                page,
                itemsPerPage,
                totalItems: 0,
                totalPages: 0,
            },
        };
    }
}

/**
 * Get bundle metrics for a shop
 */
export async function getBundleMetrics(sessionToken: string) {
    try {
        const {
            session: { shop },
        } = await handleSessionToken(sessionToken);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const rawMetrics = await analyticsQueries.aggregateMetrics(
            shop,
            thirtyDaysAgo,
            sixtyDaysAgo,
        );

        const metrics = transformBundleMetrics(rawMetrics);

        return { status: "success" as const, data: metrics };
    } catch (error) {
        console.error("Failed to fetch metrics:", error);
        return {
            status: "error" as const,
            message: "Failed to fetch metrics",
            data: null,
        };
    }
}