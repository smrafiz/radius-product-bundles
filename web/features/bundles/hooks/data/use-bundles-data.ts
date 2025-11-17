"use client";

import {
    BUNDLE_FILTERS,
    BUNDLE_STATUSES,
    bundlesQueries,
    BundleStatus,
    useBundleListingStore,
} from "@/features/bundles";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";

/**
 * Get the bundles-data
 */
export const useBundlesData = () => {
    const app = useAppBridge();
    const {
        setBundles,
        setLoading,
        setError,
        showToast,
        pagination,
        filters,
        setPaginationMetadata,
    } = useBundleListingStore();

    const sortValue = filters.sortSelected || "createdAt desc";
    const [sortBy, sortDirection] = sortValue.trim().split(" ");

    const validSortDirection = (sortDirection?.toLowerCase() === "asc" ? "asc" : "desc") as "asc" | "desc";
    const validSortBy = sortBy || "createdAt";

    const VALID_STATUSES = Object.keys(BUNDLE_STATUSES) as BundleStatus[];

    /**
     * Calculate effective status filter from tab and filter selections
     */
    const effectiveStatusFilter = useMemo((): BundleStatus[] => {
        const tabStatus =
            filters.selectedTab !== undefined
                ? BUNDLE_FILTERS.tabs.statusMap[filters.selectedTab]
                : undefined;

        // If explicit status filters are set, use those
        if (filters.statusFilter && filters.statusFilter.length > 0) {
            return filters.statusFilter.filter(
                (status): status is BundleStatus =>
                    VALID_STATUSES.includes(status as BundleStatus),
            );
        }

        // Otherwise use tab status
        if (!tabStatus || tabStatus === "ALL") {
            return [];
        }

        return VALID_STATUSES.includes(tabStatus as BundleStatus)
            ? [tabStatus as BundleStatus]
            : [];
    }, [filters.selectedTab, filters.statusFilter]);

    /**
     * Get queries with current filters
     */
    const { list, metrics } = bundlesQueries(
        app,
        pagination.currentPage,
        pagination.itemsPerPage,
        {
            search: filters.search,
            status: effectiveStatusFilter,
            sortBy: validSortBy,
            sortDirection: validSortDirection,
        },
    );

    /**
     * Fetch bundles list
     */
    const {
        data: bundlesResponse,
        isLoading: bundlesLoading,
        isFetching: bundlesFetching,
        error: bundlesError,
        refetch: refetchBundles,
    } = useQuery({
        ...list,
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    /**
     * Fetch metrics
     */
    const {
        data: metricsData,
        isLoading: metricsLoading,
        error: metricsError,
    } = useQuery({
        ...metrics,
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    /**
     * Update store when data changes
     */
    useEffect(() => {
        if (bundlesResponse?.bundles && bundlesResponse?.pagination) {
            // Only update if we have data or not currently fetching
            if (!bundlesFetching || bundlesResponse.bundles.length > 0) {
                setBundles(bundlesResponse.bundles);
            }
            setPaginationMetadata({
                totalItems: bundlesResponse.pagination.totalItems,
                totalPages: bundlesResponse.pagination.totalPages,
            });
        }
    }, [bundlesResponse, bundlesFetching, setBundles, setPaginationMetadata]);

    /**
     * Handle loading states - include fetching for pagination/filter changes
     */
    useEffect(() => {
        setLoading(bundlesLoading || metricsLoading || bundlesFetching);
    }, [bundlesLoading, metricsLoading, bundlesFetching, setLoading]);

    /**
     * Handle errors
     */
    useEffect(() => {
        const error = bundlesError || metricsError;
        if (error) {
            const errorMsg = error.message || "Failed to load bundle data";
            setError(errorMsg);
            showToast(errorMsg);
            setBundles([]);
        } else {
            setError(null);
        }
    }, [bundlesError, metricsError, setError, showToast, setBundles]);

    return {
        bundles: bundlesResponse?.bundles || [],
        metrics: metricsData,
        isLoading: bundlesLoading || metricsLoading,
        isFetching: bundlesFetching,
        error: bundlesError || metricsError,
        refetch: refetchBundles,
    };
};