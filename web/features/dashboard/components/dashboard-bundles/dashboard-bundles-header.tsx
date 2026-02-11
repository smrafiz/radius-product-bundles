"use client";

import { ROUTES, useAppNavigation } from "@/shared";

export function DashboardBundlesHeader() {
    const { goTo } = useAppNavigation();

    return (
        <s-grid
            gap="small"
            gridTemplateColumns="1fr auto"
            padding="base"
            paddingBlockEnd="large"
            alignItems="center"
        >
            <s-stack gap="small-300">
                <s-heading>Top Performing Bundles</s-heading>
                <s-text>
                    Check out the top performing bundles across your store.
                </s-text>
            </s-stack>
            <s-stack>
                <s-button
                    icon="view"
                    variant="secondary"
                    accessibilityLabel="View All"
                    onClick={goTo(ROUTES.ANALYTICS + "?tab=bundle-performance")}
                >
                    View All
                </s-button>
            </s-stack>
        </s-grid>
    );
}
