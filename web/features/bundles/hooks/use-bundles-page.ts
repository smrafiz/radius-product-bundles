"use client";

import {
    BUNDLE_LISTING_METRICS,
    invalidateBundleCache,
    useBundleListingStore,
    useBundlesData,
    useInitialBundleState,
} from "@/features/bundles";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDashboardData } from "@/features/dashboard";
import { useAppNavigation, useSyncBundles } from "@/shared";

/**
 * Bundles page
 */
export function useBundlesPage() {
    const queryClient = useQueryClient();

    useSyncBundles();

    useEffect(() => {
        const invalidate = async () => {
            await invalidateBundleCache(queryClient);
        };

        void invalidate();
    }, [queryClient]);

    const { isLoading } = useBundlesData();
    const { metrics: liveMetrics, isMetricsFetching } = useDashboardData();
    const { bundleData } = useAppNavigation();
    const { bundles, toast, hideToast } = useBundleListingStore();
    const { showSkeleton } = useInitialBundleState({
        hasData: bundles.length > 0,
        isLoading,
    });

    return {
        metrics: BUNDLE_LISTING_METRICS(liveMetrics),
        isMetricsLoading: isMetricsFetching,
        showTableSkeleton: showSkeleton,
        toast,
        onCreateBundle: bundleData.create(),
        onBundleStudio: bundleData.list(),
        onDismissToast: hideToast,
    };
}
