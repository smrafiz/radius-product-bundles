"use client";

/**
 * All Bundles Query - React Query hooks
 *
 * Provides hooks for fetching all bundles data with pagination and search.
 */

import {
    analyticsQueries,
    BundleWithAnalytics,
    SortField,
    SortOrder,
    useAllBundlesTableStore,
    useAnalyticsStore,
} from "@/features/analytics";
import { useDebounce } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook for fetching all bundles (non-paginated)
 *
 * Use this when you need all bundles without pagination.
 */
export function useAllBundles(
    sortBy: SortField = "revenue",
    sortOrder: SortOrder = "desc",
) {
    const app = useAppBridge();
    const { startDate, endDate } = useAnalyticsStore();
    const queries = analyticsQueries(app);

    return useQuery(queries.allBundles(startDate, endDate, sortBy, sortOrder));
}

/**
 * Hook for fetching paginated bundles with server-side search
 *
 * Use this for the main all bundles table with pagination.
 */
export function usePaginatedBundles() {
    const app = useAppBridge();
    const { startDate, endDate } = useAnalyticsStore();
    const { sortBy, sortOrder, page, perPage, searchQuery, setPage } =
        useAllBundlesTableStore();
    const queries = analyticsQueries(app);

    // Debounce search query to prevent excessive API calls
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Track if dates have changed to show skeleton
    const [isDateChanging, setIsDateChanging] = useState(false);
    const prevDatesRef = useRef<{ startDate?: string; endDate?: string }>({
        startDate: undefined,
        endDate: undefined,
    });

    // Detect date changes
    useEffect(() => {
        const prevStartDate = prevDatesRef.current.startDate;
        const prevEndDate = prevDatesRef.current.endDate;

        // Only consider it a "change" if we had previous dates (not initial load)
        const hadPreviousDates =
            prevStartDate !== undefined && prevEndDate !== undefined;
        const datesChanged =
            prevStartDate !== startDate || prevEndDate !== endDate;

        if (hadPreviousDates && datesChanged) {
            setIsDateChanging(true);
            // Reset page to 1 when dates change
            if (page !== 1) {
                setPage(1);
            }
        }

        // Update ref
        prevDatesRef.current = { startDate, endDate };
    }, [startDate, endDate, page, setPage]);

    const queryResult = useQuery(
        queries.paginatedBundles(
            startDate,
            endDate,
            sortBy,
            sortOrder,
            page,
            perPage,
            debouncedSearch,
        ),
    );

    // Reset date changing flag when data loads
    useEffect(() => {
        if (!queryResult.isFetching && isDateChanging) {
            setIsDateChanging(false);
        }
    }, [queryResult.isFetching, isDateChanging]);

    return {
        ...queryResult,
        isDateChanging,
        debouncedSearch,
    };
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
            setSortOrder(sortOrder === "desc" ? "asc" : "desc");
        } else {
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
 * Hook for managing search field with autofocus
 *
 * Returns a ref and handles autofocus when search is shown.
 */
export function useAllBundlesSearch() {
    const {
        searchQuery,
        setSearchQuery,
        showSearch,
        toggleSearch,
        clearSearch,
    } = useAllBundlesTableStore();

    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Check if there's an active search query
    const hasSearchQuery = searchQuery.trim() !== "";

    /**
     * Handle search input change
     */
    const handleSearchInput = useCallback(
        (event: Event) => {
            const target = event.target as HTMLInputElement;
            setSearchQuery(target.value);
        },
        [setSearchQuery],
    );

    /**
     * Autofocus search field when shown
     */
    useEffect(() => {
        if (showSearch && searchContainerRef.current) {
            const timer = setTimeout(() => {
                const searchField =
                    searchContainerRef.current?.querySelector("s-search-field");
                if (searchField) {
                    const input =
                        searchField.shadowRoot?.querySelector("input") ||
                        searchField.querySelector("input");
                    if (input) {
                        input.focus();
                    }
                }
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [showSearch]);

    return {
        searchQuery,
        showSearch,
        hasSearchQuery,
        searchContainerRef,
        handleSearchInput,
        toggleSearch,
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
    const { startDate, endDate } = useAnalyticsStore();
    const {
        data,
        isLoading,
        error,
        isFetching,
        isDateChanging,
        debouncedSearch,
    } = usePaginatedBundles();
    const {
        searchQuery,
        setSearchQuery,
        sortBy,
        sortOrder,
        handleSort,
        resetFilters,
        nextPage,
        prevPage,
        page,
        perPage,
        setPerPage,
        showSearch,
        toggleSearch,
        clearSearch,
    } = useAllBundlesTableStore();

    // Show skeleton on:
    // 1. Initial load (dates not set or isLoading with no data)
    // 2. Date change (isDateChanging flag)
    const showSkeleton =
        !startDate || !endDate || (isLoading && !data) || isDateChanging;

    // Use debouncedSearch to determine if we have active filters
    // This ensures the empty state matches the actual query being used
    const hasFilters = debouncedSearch.trim() !== "";

    return {
        // Data
        bundles: data?.bundles ?? [],
        pagination: data?.pagination ?? null,
        statusCounts: data?.statusCounts ?? {},
        totalBundles: data?.totalBundles ?? 0,

        // Loading states
        isLoading: showSkeleton,
        isFetching,
        error,

        // Search
        searchQuery,
        setSearchQuery,
        showSearch,
        toggleSearch,
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
        hasFilters,
    };
}
