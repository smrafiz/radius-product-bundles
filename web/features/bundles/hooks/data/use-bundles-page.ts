"use client";

import {
    BUNDLE_LISTING_METRICS,
    useBundleListingStore,
    useBundlesData,
    useInitialBundleState,
} from "@/features/bundles";
import { useDashboardData } from "@/features/dashboard";
import { useAppNavigation, useSyncBundles } from "@/shared";
import { useEffect, useState } from "react";

/**
 * Bundles page
 */
export function useBundlesPage() {
    useSyncBundles();

    const [isButtonLoading, setIsButtonLoading] = useState(false);

    const { isLoading } = useBundlesData();
    const { metrics: liveMetrics, isMetricsFetching } = useDashboardData();
    const { bundleData } = useAppNavigation();
    const { bundles, toast, hideToast } = useBundleListingStore();
    const { showSkeleton } = useInitialBundleState({
        hasData: bundles.length > 0,
        isLoading,
    });

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
        metrics: BUNDLE_LISTING_METRICS(liveMetrics),
        isMetricsLoading: isMetricsFetching,
        showTableSkeleton: showSkeleton,
        toast,
        isLoading,
        onCreateBundle: bundleData.create(),
        onBundleStudio: bundleData.studio(),
        onDismissToast: hideToast,
        isButtonLoading,
        setIsButtonLoading,
    };
}
