"use client";

import { ROUTES, SkeletonLine, useAppNavigation } from "@/shared";

export function DashboardBundlesHeader({
    isLoading = false,
}: {
    isLoading?: boolean;
}) {
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
                <s-heading>Recent Active Bundles</s-heading>
                <s-text>
                    Your most recently updated active bundles.
                </s-text>
            </s-stack>
            <s-stack>
                {isLoading ? (
                    <div className="w-20">
                        <SkeletonLine height="h-8" width={100} duration={1.8} />
                    </div>
                ) : (
                    <s-button
                        icon="view"
                        variant="secondary"
                        accessibilityLabel="View All"
                        onClick={goTo(ROUTES.BUNDLES)}
                    >
                        View All
                    </s-button>
                )}
            </s-stack>
        </s-grid>
    );
}
