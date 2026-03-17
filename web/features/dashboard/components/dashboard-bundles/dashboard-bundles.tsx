"use client";

import { DashboardBundlesEmpty } from "./dashboard-bundles-empty";
import { DashboardBundlesHeader } from "./dashboard-bundles-header";
import { DashboardBundlesList } from "./dashboard-bundles-list";
import { DashboardBundlesTableHeader } from "./dashboard-bundles-table-header";
import { DashboardTopBundlesSkeleton } from "./dasboard-table-skeletons";
import { useRecentBundles } from "@/features/dashboard/hooks/use-recent-bundles";

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
