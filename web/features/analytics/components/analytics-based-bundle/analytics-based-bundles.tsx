"use client";

import { BundleTableSkeleton } from "@/features/bundles";
import { DashboardBundlesEmpty } from "@/features/dashboard";
import { AnalyticsBasedBundlesList, useAnalytics } from "@/features/analytics";

/**
 * Dashboard Bundles Component
 */
export function AnalyticsBasedBundles() {
    const { bundles, isLoading, error } = useAnalytics(30);

    if (isLoading) {
        return <BundleTableSkeleton />;
    }

    return (
        <s-section padding="none">
            {bundles.length > 0 ? (
                <AnalyticsBasedBundlesList bundles={bundles} />
            ) : (
                <DashboardBundlesEmpty error={error?.message || null} />
            )}
        </s-section>
    );
}
