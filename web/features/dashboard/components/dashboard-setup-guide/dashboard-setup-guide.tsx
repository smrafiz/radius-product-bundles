"use client";

import { SkeletonLines } from "@/shared";
import {
    DashboardSetUpGuideProps,
    DashboardSetupSteps,
} from "@/features/dashboard";

export function DashboardSetUpGuide({
    isLoading,
    dismissed,
    ...rest
}: DashboardSetUpGuideProps) {
    if (isLoading) {
        return (
            <s-section padding="none">
                <s-box padding="base" paddingBlockEnd="small-300">
                    <s-grid gap="small-500">
                        <s-grid
                            gridTemplateColumns="1fr auto auto"
                            gap="small-300"
                            alignItems="center"
                        >
                            <s-heading>Setup guide</s-heading>
                            <s-button
                                accessibilityLabel="Dismiss setup guide"
                                variant="tertiary"
                                tone="neutral"
                                icon="x"
                            />
                            <s-button
                                interestFor="toggle-guide-tooltip"
                                accessibilityLabel="Toggle setup guide"
                                variant="tertiary"
                                tone="neutral"
                                icon="chevron-up"
                            />
                        </s-grid>
                        <s-stack gap="large">
                            <s-paragraph>
                                Use this personalized guide to get your app up
                                and running.
                            </s-paragraph>

                            <s-stack
                                direction="inline"
                                alignItems="center"
                                gap="small-300"
                                paddingBlockEnd="small"
                            >
                                <div className="w-full">
                                    <SkeletonLines lines={10} />
                                </div>
                            </s-stack>
                        </s-stack>
                    </s-grid>
                </s-box>
            </s-section>
        );
    }

    if (dismissed) {
        return null;
    }

    return <DashboardSetupSteps {...rest} />;
}
