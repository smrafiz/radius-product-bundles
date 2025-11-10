"use client";

import {
    BUNDLE_LISTING_METRICS,
    useBundleListingStore,
    useBundlesData,
    useInitialBundleState,
} from "@/features/bundles";
import { useDashboardData } from "@/features/dashboard";
import { useAppNavigation, useSyncBundles } from "@/shared";

/**
 * Bundles page
 */
export function useBundlesPage() {
    useSyncBundles();

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
