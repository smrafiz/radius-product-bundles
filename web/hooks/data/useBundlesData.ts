// web/hooks/data/useBundlesData.ts (Updated to work with React Query)
import { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useBundleListingStore } from "@/stores";
import { useBundles, useBundleMetrics } from "@/hooks/bundle/useBundleQueries";

export const useBundlesData = () => {
    const { setBundles, setLoading, setError, showToast } = useBundleListingStore();

    // Use React Query hooks
    const {
        data: bundlesData,
        isLoading: bundlesLoading,
        error: bundlesError,
        refetch: refetchBundles
    } = useBundles();

    const {
        data: metricsData,
        isLoading: metricsLoading,
        error: metricsError
    } = useBundleMetrics();

    // Update store when data changes
    useEffect(() => {
        if (bundlesData) {
            setBundles(bundlesData);
        }
    }, [bundlesData, setBundles]);

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
        bundles: bundlesData || [],
        metrics: metricsData,
        isLoading: bundlesLoading || metricsLoading,
        error: bundlesError || metricsError,
        refetch: refetchBundles,
    };
};