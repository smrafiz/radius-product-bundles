import React from "react";
import { PlusIcon } from "@shopify/polaris-icons";
import { Box, EmptySearchResult, EmptyState } from "@shopify/polaris";
import { useBundleTableActions } from "@/hooks/useBundleTableActions";

interface BundleTableEmptyStatesProps {
    totalBundles: number;
    filteredBundlesCount: number;
}

export function BundleTableEmptyStates({
    totalBundles,
    filteredBundlesCount,
}: BundleTableEmptyStatesProps) {
    const { handleCreateBundle } = useBundleTableActions();

    // No bundles created yet
    if (totalBundles === 0) {
        return (
            <EmptyState
                heading="No bundles created yet"
                action={{
                    content: "Create Bundle",
                    icon: PlusIcon,
                    onAction: handleCreateBundle,
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
