"use client";

import { useAppNavigation } from "@/shared";

/*
 * Dashboard bundles header
 */
export function DashboardBundlesHeader() {
    const { bundleData } = useAppNavigation();

    return (
        <s-grid
            gap="small"
            gridTemplateColumns="1fr auto"
            padding="base"
            paddingBlockEnd="large"
        >
            <s-stack>
                <s-heading>Top Performing Bundles</s-heading>
                <s-text>
                    Check out the top performing bundles across your store.
                </s-text>
            </s-stack>
            <s-stack>
                <s-button
                    icon="view"
                    variant="secondary"
                    interestFor="sort-tooltip"
                    commandFor="sort-actions"
                    accessibilityLabel="View All"
                    onClick={bundleData.list()}
                >
                    View All
                </s-button>
            </s-stack>
        </s-grid>
    );
}
