"use client";

import { SkeletonLines } from "@/shared";
import { DashboardSetUpGuideProps, DashboardSetupSteps } from "@/features/dashboard";

export function DashboardSetUpGuide({
    isLoading,
    dismissed,
    ...rest
}: DashboardSetUpGuideProps) {
    if (isLoading) {
        return (
            <s-section padding="base">
                <div className="p-4">
                    <SkeletonLines lines={12} random={true} />
                </div>
            </s-section>
        );
    }

    if (dismissed) return null;

    return <DashboardSetupSteps {...rest} />;
}
