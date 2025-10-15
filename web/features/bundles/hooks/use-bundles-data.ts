"use client";

import {
    BUNDLE_FILTERS,
    bundlesQueries,
    useBundleListingStore,
} from "@/features/bundles";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";

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

    // Parse sort from filters
    const [sortBy, sortDirection] = filters.sortSelected[0]?.split(" ") || [
        "createdAt",
        "desc",
    ];

    const effectiveStatusFilter = useMemo(() => {
        const tabStatus = BUNDLE_FILTERS.tabs.statusMap[filters.selectedTab];

        if (tabStatus === "ALL") {
            return [];
        }

        if (filters.statusFilter.length > 0) {
            return filters.statusFilter;
        }

        // Otherwise, use the status from the selected tab
        return [tabStatus];
    }, [filters.selectedTab, filters.statusFilter]);

    const { list, metrics } = bundlesQueries(
        app,
        pagination.currentPage,
        pagination.itemsPerPage,
        {
            search: filters.search,
            status: effectiveStatusFilter,
            type: filters.typeFilter,
            sortBy,
            sortDirection: sortDirection as "asc" | "desc",
        },
    );

    // Use React Query hooks with pagination and filters from store
    const {
        data: bundlesResponse,
        isLoading: bundlesLoading,
        isFetching: bundlesFetching,
        error: bundlesError,
        refetch: refetchBundles,
    } = useQuery({
        ...list,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const {
        data: metricsData,
        isLoading: metricsLoading,
        error: metricsError,
    } = useQuery({
        ...metrics,
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

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
