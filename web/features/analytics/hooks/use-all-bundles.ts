"use client";

/**
 * All Bundles Query - React Query hooks
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getAllBundlesAction } from "@/features/analytics/actions";
import { AllBundlesData, BundleWithAnalytics, SortField, SortOrder, useAnalyticsStore, } from "@/features/analytics";

export function useAllBundles(
    sortBy: SortField = "revenue",
    sortOrder: SortOrder = "desc",
) {
    const app = useAppBridge();
    const { startDate, endDate } = useAnalyticsStore();

    return useQuery({
        queryKey: ["all-bundles", startDate, endDate, sortBy, sortOrder],
        queryFn: async () => {
            const token = await app.idToken();

            if (!token || !startDate || !endDate) {
                throw new Error("Missing required parameters");
            }

            const response = await getAllBundlesAction(
                token,
                startDate,
                endDate,
                sortBy,
                sortOrder,
            );

            if (response.status === "error") {
                throw new Error(response.message || "Failed to fetch bundles");
            }

            return response.data as AllBundlesData;
        },
        enabled: !!startDate && !!endDate,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to manage table sorting
 */
export function useBundleSort() {
    const [sortBy, setSortBy] = useState<SortField>("revenue");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    /**
     * Handle sort column change
     */
    const handleSort = (field: SortField) => {
        if (sortBy === field) {
            // Toggle order if same field
            setSortOrder(sortOrder === "desc" ? "asc" : "desc");
        } else {
            // New field, default to desc
            setSortBy(field);
            setSortOrder("desc");
        }
    };

    return {
        sortBy,
        sortOrder,
        handleSort,
    };
}

/**
 * Hook to manage table filters
 */
export function useBundleFilters() {
    const [searchQuery, setSearchQuery] = useState<string>("");

    /**
     * Filter bundles based on current filters
     */
    const filterBundles = (bundles: BundleWithAnalytics[]): BundleWithAnalytics[] => {
        let filtered = [...bundles];

        // Search filter
        if (searchQuery && searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((b) =>
                b.title.toLowerCase().includes(query),
            );
        }

        return filtered;
    };

    return {
        searchQuery,
        setSearchQuery,
        filterBundles,
    };
}
