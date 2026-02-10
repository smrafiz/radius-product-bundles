"use client";

import { SkeletonLines } from "@/shared";
import { DashboardSetupSteps, useSetupGuide } from "@/features/dashboard";

export function DashboardSetUpGuide() {
    const {
        items,
        isLoading,
        dismissed,
        shopDomain,
        apiKey,
        completeStep,
        dismissGuide,
        showGuide,
        isDismissing,
        isShowing,
    } = useSetupGuide();

    if (isLoading) {
        return (
            <s-section padding="base">
                <div className="p-4">
                    <SkeletonLines lines={12} random={true} />
                </div>
            </s-section>
        );
    }

    if (dismissed) {
        return (
            <s-button
                onClick={showGuide}
                disabled={isShowing}
                loading={isShowing}
            >
                Show setup guide
            </s-button>
        );
    }

    return (
        <DashboardSetupSteps
            items={items}
            shopDomain={shopDomain}
            apiKey={apiKey}
            onDismiss={dismissGuide}
            onStepComplete={completeStep}
            isDismissing={isDismissing}
        />
    );
}
