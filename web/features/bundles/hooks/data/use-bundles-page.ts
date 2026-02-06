"use client";

import {
    BUNDLE_LISTING_METRICS,
    useBundleListingStore,
    useBundlesData,
    useInitialBundleState,
} from "@/features/bundles";
import { useAppNavigation } from "@/shared";
import { useEffect, useMemo, useState } from "react";
import { useAnalytics } from "@/features/analytics";

/**
 * Bundles page hook
 *
 * Manages bundle listing page state and data fetching.
 */
export function useBundlesPage() {
    const { isLoading } = useBundlesData();
    const { metrics: analyticsMetrics, isMetricsFetching } = useAnalytics();
    const { bundleData } = useAppNavigation();
    const { bundles, toast, hideToast } = useBundleListingStore();
    const { showSkeleton } = useInitialBundleState({
        hasData: bundles.length > 0,
        isLoading,
    });

    /**
     * Transform analytics data to flat structure for metric cards
     */
    const transformedMetrics = useMemo(() => {
        if (!analyticsMetrics) {
            return null;
        }

        return {
            activeBundles: analyticsMetrics.totals?.activeBundles ?? 0,
            totalBundles: analyticsMetrics.totals?.totalBundles ?? 0,
            totalViews: analyticsMetrics.totals?.views ?? 0,
            revenueAllTime: analyticsMetrics.totals?.revenueAllTime ?? 0,
        };
    }, [analyticsMetrics]);

    useEffect(() => {
        if (
            toast.active &&
            typeof shopify !== "undefined" &&
            shopify.toast?.show
        ) {
            shopify.toast.show(toast.message, {
                duration: 5000,
                onDismiss: hideToast,
            });
        }
    }, [toast.active, toast.message, hideToast]);

    return {
        metrics: BUNDLE_LISTING_METRICS(transformedMetrics),
        isMetricsLoading: isMetricsFetching,
        showTableSkeleton: showSkeleton,
        toast,
        isLoading,
        onCreateBundle: bundleData.create(),
        onBundleStudio: bundleData.studio(),
        onDismissToast: hideToast,
    };
}
