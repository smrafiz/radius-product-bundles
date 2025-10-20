"use server";

import { handleSessionToken } from "@/lib/shopify/verify";
import { BundleFilters, bundleService } from "@/features/bundles";

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