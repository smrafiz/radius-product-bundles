"use client";

import { AnalyticsOrderBundlesList, useAnalytics } from "@/features/analytics";

import { BundleTableSkeleton } from "@/features/bundles";
/**
 * Dashboard Bundles Component
 */
export function AnalyticsOrderBundles() {
    const { isLoading } = useAnalytics();

    if (isLoading) {
        return <BundleTableSkeleton />;
    }

    return (
        <s-section padding="none">
            <AnalyticsOrderBundlesList />
        </s-section>
    );
}
