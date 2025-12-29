"use client";

import {
    DashboardBundlesEmpty,
    DashboardBundlesHeader,
    DashboardBundlesList,
} from "@/features/dashboard";
import { BundleTableSkeleton, useBundlesData } from "@/features/bundles";
import { useAnalytics } from "@/features/analytics";

/**
 * Dashboard Bundles Component
 */
export function DashboardBundles() {
    const { isLoading, error, bundles } = useBundlesData();

    if (isLoading) {
        return <BundleTableSkeleton />;
    }

    const recentBundles = bundles.slice(0, 5);

    return (
        <s-section padding="none">
            {recentBundles.length > 0 ? (
                <>
                    {/* Header */}
                    <DashboardBundlesHeader />

                    {/* Bundle list */}
                    <DashboardBundlesList bundles={recentBundles} />
                </>
            ) : (
                <DashboardBundlesEmpty error={error?.message || null} />
            )}
        </s-section>
    );
}
