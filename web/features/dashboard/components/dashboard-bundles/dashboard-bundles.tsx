"use client";

import { useTopBundles, useAnalyticsStore } from "@/features/analytics";
import {
    DashboardBundlesEmpty,
    DashboardBundlesHeader,
    DashboardBundlesList,
    DashboardBundlesTableHeader,
    DashboardTopBundlesSkeleton,
} from "@/features/dashboard";
import { useEffect } from "react";

export function DashboardBundles() {
    useEffect(() => {
        const { startDate, endDate, setDays } = useAnalyticsStore.getState();
        if (!startDate || !endDate) {
            setDays(30);
        }
    }, []);

    const { data: bundles, isLoading, error } = useTopBundles(5);

    if (isLoading) {
        return (
            <DashboardTopBundlesSkeleton
                Header={DashboardBundlesHeader}
                TableHeader={DashboardBundlesTableHeader}
            />
        );
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
