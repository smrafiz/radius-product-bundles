"use client";

import {
    DashboardBundlesEmpty,
    DashboardBundlesHeader,
    DashboardBundlesList,
} from "@/features/dashboard";
import { BundleTableSkeleton } from "@/features/bundles";
import { useTopBundles, useAnalyticsStore } from "@/features/analytics";
import { useEffect } from "react";

export function DashboardBundles() {
    useEffect(() => {
        const { startDate, endDate, setDays } = useAnalyticsStore.getState();
        if (!startDate || !endDate) {
            setDays(7);
        }
    }, []);

    const { data: bundles, isLoading, error } = useTopBundles(5);

    if (isLoading) {
        return <BundleTableSkeleton />;
    }

    const activeBundles = (bundles ?? []).filter(
        (b) => b.status.toUpperCase() === "ACTIVE",
    );

    return (
        <s-section padding="none">
            {activeBundles.length > 0 ? (
                <>
                    <DashboardBundlesHeader />
                    <DashboardBundlesList bundles={activeBundles} />
                </>
            ) : (
                <DashboardBundlesEmpty error={error?.message || null} />
            )}
        </s-section>
    );
}
