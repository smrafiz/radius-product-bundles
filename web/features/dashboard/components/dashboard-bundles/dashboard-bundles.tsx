"use client";

import {
    DashboardBundlesEmpty,
    DashboardBundlesHeader,
    DashboardBundlesList,
    DashboardBundlesTableHeader,
    DashboardTopBundlesSkeleton,
} from "@/features/dashboard";
import { useAnalyticsMetrics, useTopBundles } from "@/features/analytics";

export function DashboardBundles() {
    const { data: bundles, isLoading, error } = useTopBundles(5);
    const { metrics, isLoading: isMetricsLoading } = useAnalyticsMetrics(30);

    if (isLoading || isMetricsLoading) {
        return (
            <DashboardTopBundlesSkeleton
                Header={DashboardBundlesHeader}
                TableHeader={DashboardBundlesTableHeader}
            />
        );
    }

    const activeBundles = (bundles ?? []).filter(
        (b) => b.status.toUpperCase() === "ACTIVE",
    );

    const hasBundles = (metrics?.totals?.totalBundles ?? 0) > 0;

    return (
        <s-section padding="none">
            {activeBundles.length > 0 ? (
                <>
                    <DashboardBundlesHeader />
                    <DashboardBundlesList bundles={activeBundles} />
                </>
            ) : (
                <DashboardBundlesEmpty
                    error={error?.message || null}
                    hasBundles={hasBundles}
                />
            )}
        </s-section>
    );
}
