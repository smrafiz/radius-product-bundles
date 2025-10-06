"use client";

import { useEffect, useMemo } from "react";
import { useBundleListingStore } from "@/stores";
import { useBundleMetrics, useBundles } from "@/hooks/bundle/useBundleQueries";

export const useBundlesData = () => {
    const {
        setBundles,
        setLoading,
        setError,
        showToast,
        pagination,
        filters,
        setPaginationMetadata,
    } = useBundleListingStore();

    // Parse sort from filters
    const [sortBy, sortDirection] = filters.sortSelected[0]?.split(' ') || ['createdAt', 'desc'];

    // Map tab names to status values
    const tabStatusMap = ["ALL", "ACTIVE", "DRAFT", "PAUSED", "SCHEDULED", "ARCHIVED"];

    // Combine tab-based status filter with manual status filter
    const effectiveStatusFilter = useMemo(() => {
        const tabStatus = tabStatusMap[filters.selectedTab];

        // If "All" tab selected, use manual filters only
        if (tabStatus === "ALL") {
            return filters.statusFilter;
        }

        // If a specific tab is selected, combine with manual filters
        // If manual filters exist, use them; otherwise use tab status
        if (filters.statusFilter.length > 0) {
            return filters.statusFilter;
        }

        // Use tab status
        return [tabStatus];
    }, [filters.selectedTab, filters.statusFilter]);

    // Use React Query hooks with pagination and filters from store
    const {
        data: bundlesResponse,
        isLoading: bundlesLoading,
        isFetching: bundlesFetching,
        error: bundlesError,
        refetch: refetchBundles,
    } = useBundles(
        pagination.currentPage,
        pagination.itemsPerPage,
        {
            search: filters.search,
            status: effectiveStatusFilter,
            type: filters.typeFilter,
            sortBy,
            sortDirection: sortDirection as 'asc' | 'desc',
        }
    );

    const {
        data: metricsData,
        isLoading: metricsLoading,
        error: metricsError,
    } = useBundleMetrics();

    // Update store when data changes
    useEffect(() => {
        if (bundlesResponse?.bundles && bundlesResponse?.pagination) {
            setBundles(bundlesResponse.bundles);
            setPaginationMetadata({
                totalItems: bundlesResponse.pagination.totalItems,
                totalPages: bundlesResponse.pagination.totalPages,
            });
        }
    }, [bundlesResponse, setBundles, setPaginationMetadata]);

    // Handle loading states - include fetching for pagination/filter changes
    useEffect(() => {
        setLoading(bundlesLoading || metricsLoading || bundlesFetching);
    }, [bundlesLoading, metricsLoading, bundlesFetching, setLoading]);

    // Handle errors
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