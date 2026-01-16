"use client";

/**
 * All Bundles Query - React Query hooks
 */

import {
    AllBundlesData,
    BundleWithAnalytics,
    PaginatedAllBundlesData,
    SortField,
    SortOrder,
    useAllBundlesTableStore,
    useAnalyticsStore,
} from "@/features/analytics";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getAllBundlesAction, getPaginatedBundlesAction, } from "@/features/analytics/actions";

/**
 * Hook for fetching all bundles (original, non-paginated)
 *
 * Use this when you need all bundles without pagination.
 */
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
 * Hook for fetching paginated bundles with server-side search
 *
 * Use this for the main all bundles table with pagination.
 */
export function usePaginatedBundles() {
    const app = useAppBridge();
    const { startDate, endDate } = useAnalyticsStore();
    const { sortBy, sortOrder, page, perPage, debouncedSearchQuery } =
        useAllBundlesTableStore();

    return useQuery({
        queryKey: [
            "paginated-bundles",
            startDate,
            endDate,
            sortBy,
            sortOrder,
            page,
            perPage,
            debouncedSearchQuery,
        ],
        queryFn: async () => {
            const token = await app.idToken();

            if (!token || !startDate || !endDate) {
                throw new Error("Missing required parameters");
            }

            const response = await getPaginatedBundlesAction({
                sessionToken: token,
                startDate,
                endDate,
                sortBy,
                sortOrder,
                page,
                perPage,
                search: debouncedSearchQuery,
            });

            if (response.status === "error") {
                throw new Error(response.message || "Failed to fetch bundles");
            }

            return response.data as PaginatedAllBundlesData;
        },
        enabled: !!startDate && !!endDate,
        staleTime: 5 * 60 * 1000, // 5 minutes
        placeholderData: (previousData) => previousData, // Keep previous data while loading
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
 * Hook to manage table filters (client-side)
 */
export function useBundleFilters() {
    const [searchQuery, setSearchQuery] = useState<string>("");

    /**
     * Filter bundles based on current filters
     */
    const filterBundles = (
        bundles: BundleWithAnalytics[],
    ): BundleWithAnalytics[] => {
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

/**
 * Custom hook for debounced search with store integration
 *
 * Debounces the search input to prevent excessive API calls.
 */
export function useAllBundlesSearch(delay: number = 300) {
    const { searchQuery, setSearchQuery, setDebouncedSearchQuery } =
        useAllBundlesTableStore();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, delay);

        return () => clearTimeout(timer);
    }, [searchQuery, delay, setDebouncedSearchQuery]);

    /**
     * Clear the search query
     */
    const clearSearch = useCallback(() => {
        setSearchQuery("");
        setDebouncedSearchQuery("");
    }, [setSearchQuery, setDebouncedSearchQuery]);

    return {
        searchQuery,
        setSearchQuery,
        clearSearch,
    };
}

/**
 * Combined hook for all bundles table with pagination
 *
 * Provides all state and handlers for the paginated table.
 * Designed to work with the native s-table pagination.
 */
export function useAllBundlesTableWithPagination() {
    const { data, isLoading, error, isFetching } = usePaginatedBundles();
    const { searchQuery, setSearchQuery, clearSearch } = useAllBundlesSearch();
    const {
        sortBy,
        sortOrder,
        handleSort,
        resetFilters,
        nextPage,
        prevPage,
        page,
        perPage,
        setPerPage,
    } = useAllBundlesTableStore();

    return {
        // Data
        bundles: data?.bundles ?? [],
        pagination: data?.pagination ?? null,
        statusCounts: data?.statusCounts ?? {},
        totalBundles: data?.totalBundles ?? 0,

        // Loading states
        isLoading,
        isFetching,
        error,

        // Search
        searchQuery,
        setSearchQuery,
        clearSearch,

        // Sorting
        sortBy,
        sortOrder,
        handleSort,

        // Pagination (for native s-table)
        page,
        perPage,
        setPerPage,
        nextPage,
        prevPage,

        // Utils
        resetFilters,
        hasFilters: searchQuery.trim() !== "",
    };
}
