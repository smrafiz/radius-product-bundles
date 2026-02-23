"use client";

import React from "react";
import {
    DashboardSetUpGuideProps,
    DashboardSetupSteps,
} from "@/features/dashboard";
import { SkeletonLine } from "@/shared";

export function DashboardSetUpGuide({
    isLoading,
    dismissed,
    ...rest
}: DashboardSetUpGuideProps) {
    if (isLoading) {
        return (
            <s-section padding="none">
                <s-box padding="base">
                    <s-grid gap="small-300">
                        <s-grid
                            gridTemplateColumns="1fr auto auto"
                            gap="small-300"
                            alignItems="center"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full bg-[#e1e1e1] animate-pulse shrink-0" />
                                <div className="w-36">
                                    <SkeletonLine
                                        height="h-4"
                                        width={100}
                                        duration={1.8}
                                    />
                                </div>
                            </div>
                            <s-button
                                accessibilityLabel="Dismiss setup guide"
                                variant="tertiary"
                                tone="neutral"
                                icon="x"
                            />
                            <s-button
                                accessibilityLabel="Toggle setup guide"
                                variant="tertiary"
                                tone="neutral"
                                icon="chevron-up"
                            />
                        </s-grid>
                        <s-stack gap="small">
                            <div className="w-64">
                                <SkeletonLine
                                    height="h-4"
                                    width={100}
                                    duration={1.8}
                                />
                            </div>
                            <div className="w-80">
                                <SkeletonLine
                                    height="h-4"
                                    width={100}
                                    duration={1.8}
                                />
                            </div>
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
