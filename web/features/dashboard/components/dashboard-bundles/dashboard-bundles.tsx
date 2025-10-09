"use client";

import {
    DashboardBundlesEmpty,
    DashboardBundlesHeader,
    DashboardBundlesList,
    useDashboardStore,
} from "@/features/dashboard";
import { BlockStack, Box, Card } from "@shopify/polaris";
import { BundleTableSkeleton } from "@/features/bundles";

/**
 * Dashboard Bundles Component
 */
export function DashboardBundles() {
    const { loading, error, bundles } = useDashboardStore();

    if (loading) {
        return <BundleTableSkeleton />;
    }

    const recentBundles = bundles.slice(0, 5);

    return (
        <Card>
            <Box padding="400">
                <BlockStack gap="400">
                    {recentBundles.length > 0 ? (
                        <>
                            <DashboardBundlesHeader />
                            <DashboardBundlesList bundles={recentBundles} />
                        </>
                    ) : (
                        <DashboardBundlesEmpty error={error} />
                    )}
                </BlockStack>
            </Box>
        </Card>
    );
}
