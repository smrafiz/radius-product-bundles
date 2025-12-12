"use client";

import {
    DashboardBundlesEmpty,
    DashboardBundlesList,
    useDashboardStore,
} from "@/features/dashboard";
import { BundleTableSkeleton } from "@/features/bundles";
/**
 * Dashboard Bundles Component
 */
export function AnalyticsBasedBundles() {
    const { loading, error, bundles } = useDashboardStore();

    if (loading) {
        return <BundleTableSkeleton />;
    }
    const recentBundles = bundles.slice(0, 5);

    return (
        <s-section padding="none">
            {recentBundles.length > 0 ? (
                <>
                    <DashboardBundlesList bundles={recentBundles} />
                </>
            ) : (
                <DashboardBundlesEmpty error={error} />
            )}
        </s-section>
    );
}
