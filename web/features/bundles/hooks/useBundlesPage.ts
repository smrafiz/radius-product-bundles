"use client";

import { useRouter } from "next/navigation";
import {
    useBundleListingStore,
    useBundleTableBulkActions,
    useInitialBundleState,
} from "@/features/bundles";
import { metricsConfig } from "@/config";
import { useDashboardData } from "@/features/dashboard";
import { useBundlesData, useSyncBundles, withLoader } from "@/shared";

export function useBundlesPage() {
    const router = useRouter();

    // Data hooks
    useSyncBundles();
    const { isLoading } = useBundlesData();
    const { metrics: liveMetrics, isMetricsFetching } = useDashboardData();

    // Store
    const { bundles, toast, hideToast } = useBundleListingStore();
    const { handleCreateBundle } = useBundleTableBulkActions();

    // UI state
    const { showSkeleton } = useInitialBundleState({
        hasData: bundles.length > 0,
        isLoading,
    });

    // Actions
    const handleBundleStudio = () => router.push("/bundles/studio");

    return {
        metrics: metricsConfig(liveMetrics),
        isMetricsLoading: isMetricsFetching,
        showTableSkeleton: showSkeleton,
        toast,
        onCreateBundle: withLoader(handleCreateBundle),
        onBundleStudio: withLoader(handleBundleStudio),
        onDismissToast: hideToast,
    };
}
