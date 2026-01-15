"use client";

import {
    TopBundlesHeader,
    TopBundlesSkeleton,
    TopBundlesTable,
    TopBundlesTableHeader,
    useAnalyticsWithBundles,
} from "@/features/analytics";
import { DashboardBundlesEmpty } from "@/features/dashboard";

/**
 * Analytics-Based Bundles Component
 *
 * Displays bundle performance with full product details.
 */
export function AnalyticsBasedBundles() {
    const { bundles, isLoading, error } = useAnalyticsWithBundles();

    if (isLoading) {
        return (
            <TopBundlesSkeleton
                Header={TopBundlesHeader}
                TableHeader={TopBundlesTableHeader}
            />
        );
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
