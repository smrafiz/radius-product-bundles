"use client";

import { useDashboardStore } from "@/features/dashboard";

import { AnalyticsOrderBundlesList } from "@/features/analytics";

import { BundleTableSkeleton } from "@/features/bundles";
/**
 * Dashboard Bundles Component
 */
export function AnalyticsOrderBundles() {
    const { isLoading } = useAnalytics(30);

    if (isLoading) {
        return <BundleTableSkeleton />;
    }

    return (
        <s-section padding="none">
            <AnalyticsOrderBundlesList />
        </s-section>
    );
}
