"use client";

import { BundleTableSkeleton } from "@/features/bundles";
import { DashboardBundlesEmpty } from "@/features/dashboard";
import {
    AnalyticsBasedBundlesList,
    TopBundlesTable,
    useAnalyticsWithBundles,
} from "@/features/analytics";

/**
 * Analytics-Based Bundles Component
 *
 * Displays bundle performance with full product details.
 */
export function AnalyticsBasedBundles() {
    const { bundles, isLoading, error } = useAnalyticsWithBundles();

    if (isLoading) {
        return <BundleTableSkeleton />;
    }

    return (
        <s-section padding="none">
            {bundles.length > 0 ? (
                <TopBundlesTable />
            ) : (
                <DashboardBundlesEmpty error={error?.message || null} />
            )}
        </s-section>
    );
}
