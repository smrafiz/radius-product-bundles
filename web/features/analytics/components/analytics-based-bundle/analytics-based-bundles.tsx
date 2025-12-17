"use client";

import { useDashboardStore, DashboardBundlesEmpty } from "@/features/dashboard";

import { AnalyticsBasedBundlesList } from "@/features/analytics";
import { BundleTableSkeleton } from "@/features/bundles";
/**
 * Dashboard Bundles Component
 */
export function AnalyticsBasedBundles() {

    const { bundles, loading, error } = useDashboardStore();

    if (loading) {
        return <BundleTableSkeleton />;
    }

    return (
        <s-section padding="none">
            {bundles.length > 0 ? (
                <AnalyticsBasedBundlesList bundles={bundles} />
            ) : (
                <DashboardBundlesEmpty error={error} />
            )}
        </s-section>
    );
}
