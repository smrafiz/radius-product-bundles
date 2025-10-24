"use client";

import { useAppNavigation } from "@/shared";
import { PlusIcon } from "@shopify/polaris-icons";
import { BundleTableEmptyStatesProps } from "@/features/bundles";
import { Box, EmptySearchResult, EmptyState } from "@shopify/polaris";

/**
 * Bundle table empty states
 */
export function BundleTableEmptyStates({
    totalBundles,
    filteredBundlesCount,
}: BundleTableEmptyStatesProps) {
    const { bundleData } = useAppNavigation();

    if (totalBundles === 0) {
        return (
            <EmptyState
                heading="No bundles created yet"
                action={{
                    content: "Create Bundle",
                    icon: PlusIcon,
                    onAction: bundleData.create(),
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
                <p>
                    Get started by creating your first bundle to manage product
                    offers.
                </p>
            </EmptyState>
        );
    }

    // No bundles match filters
    if (filteredBundlesCount === 0) {
        return (
            <Box padding="600">
                <EmptySearchResult
                    title={"No bundles match your filters"}
                    description={
                        "Try adjusting your search terms or filters to see more results."
                    }
                    withIllustration
                />
            </Box>
        );
    }

    return null;
}
