"use client";

import {
    DashboardBundlesEmpty,
    useDashboardStore,
} from "@/features/dashboard";

import {
    AnalyticsBasedBundlesList,
} from "@/features/analytics";
import { BundleTableSkeleton } from "@/features/bundles";
/**
 * Dashboard Bundles Component
 */
export function AnalyticsBasedBundles() {
    const { loading } = useDashboardStore();

    if (loading) {
        return <BundleTableSkeleton />;
    }

    return (
        <s-section padding="none">
            <AnalyticsBasedBundlesList />
        </s-section>
    );
}
