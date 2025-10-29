"use client";

import { useAppNavigation } from "@/shared";
import { BundleTableEmptyStatesProps } from "@/features/bundles";

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
            <s-section>
                <s-grid
                    gap="base"
                    justifyItems="center"
                    paddingBlock="large-400"
                >
                    <s-box maxInlineSize="200px" maxBlockSize="200px">
                        <s-image
                            aspectRatio="1/1"
                            src="/assets/empty.png"
                            alt="No bundles created yet"
                        />
                    </s-box>
                    <s-grid
                        justifyItems="center"
                        maxInlineSize="450px"
                        gap="base"
                    >
                        <s-stack alignItems="center">
                            <s-heading>No bundles created yet</s-heading>
                            <s-paragraph>
                                Get started by creating your first bundle to
                                manage product offers.
                            </s-paragraph>
                        </s-stack>
                        <s-button
                            icon="plus"
                            variant="primary"
                            accessibilityLabel="Create Bundle"
                            onClick={bundleData.create()}
                        >
                            Create Bundle
                        </s-button>
                    </s-grid>
                </s-grid>
            </s-section>
        );
    }

    // No bundles match filters
    if (filteredBundlesCount === 0) {
        return (
            <s-section>
                <s-grid
                    gap="base"
                    justifyItems="center"
                    paddingBlock="large-400"
                >
                    <s-box maxInlineSize="200px" maxBlockSize="200px">
                        <s-image
                            aspectRatio="1/1"
                            src="/assets/search_icon.svg"
                            alt="No bundles match your filters"
                        />
                    </s-box>
                    <s-grid
                        justifyItems="center"
                        maxInlineSize="450px"
                        gap="base"
                    >
                        <s-stack alignItems="center">
                            <s-heading>No bundles match your filters</s-heading>
                            <s-paragraph>
                                Try adjusting your search terms or filters to see more results.
                            </s-paragraph>
                        </s-stack>
                    </s-grid>
                </s-grid>
            </s-section>
        );
    }

    return null;
}
