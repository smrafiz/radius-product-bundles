"use client";

import {
    DashboardBundlesEmpty,
    DashboardBundlesHeader,
    DashboardBundlesList,
    DashboardBundlesTableHeader,
    DashboardTopBundlesSkeleton,
    useRecentBundles,
} from "@/features/dashboard";

export function DashboardBundles() {
    const { data: bundles, isLoading, error } = useRecentBundles(5);

    if (isLoading) {
        return (
            <DashboardTopBundlesSkeleton
                Header={DashboardBundlesHeader}
                TableHeader={DashboardBundlesTableHeader}
            />
        );
    }

    const activeBundles = bundles ?? [];

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
