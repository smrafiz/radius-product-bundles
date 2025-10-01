"use client";

import { useEffect } from "react";
import { useBundleListingStore } from "@/stores";
import { useBundles, useBundleMetrics } from "@/hooks/bundle/useBundleQueries";

export const useBundlesData = () => {
    const {
        setBundles,
        setLoading,
        setError,
        showToast,
        pagination,
        setPaginationMetadata,
    } = useBundleListingStore();

    // Use React Query hooks with pagination from store
    const {
        data: bundlesResponse,
        isLoading: bundlesLoading,
        isFetching: bundlesFetching,
        error: bundlesError,
        refetch: refetchBundles,
    } = useBundles(pagination.currentPage, pagination.itemsPerPage);

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

    // Handle loading states
    useEffect(() => {
        setLoading(bundlesLoading || metricsLoading);
    }, [bundlesLoading, metricsLoading, setLoading]);

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