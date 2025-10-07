"use client";

import { Card, EmptyState } from "@shopify/polaris";
import { useDashboardStore } from "@/stores/dashboard";

/**
 * Dashboard bundles section - shows recent/featured bundles
 */
export function DashboardBundles() {
    const { bundles } = useDashboardStore();

    // Show only first 5 bundles on dashboard
    const recentBundles = bundles.slice(0, 5);

    if (recentBundles.length === 0) {
        return (
            <Card>
                <EmptyState
                    heading="No bundles yet"
                    action={{ content: "Create Bundle", url: "/bundles/create" }}
                    image="/empty-bundles.svg"
                >
                    <p>Create your first bundle to get started</p>
                </EmptyState>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Recent Bundles</h2>
                <a href="/bundles" className="text-sm text-blue-600 hover:underline">
                    View all →
                </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/*{recentBundles.map((bundle) => (*/}
                {/*    <BundleCard key={bundle.id} bundle={bundle} />*/}
                {/*))}*/}
            </div>
        </div>
    );
}