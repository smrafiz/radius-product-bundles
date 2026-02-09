"use client";

import { SkeletonLines } from "@/shared";
import { useSetupGuide } from "@/features/dashboard/hooks/use-setup-guide";
import { DashboardSetupSteps } from "@/features/dashboard";

export function DashboardSetUpGuide() {
    const {
        items,
        isLoading,
        dismissed,
        shopDomain,
        allComplete,
        completeStep,
        verifyAppEmbed,
        dismissGuide,
        showGuide,
        isVerifying,
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
            <s-button onClick={showGuide} disabled={isShowing} loading={isShowing}>
                Show setup guide
            </s-button>
        );
    }

    return (
        <DashboardSetupSteps
            items={items}
            shopDomain={shopDomain}
            onDismiss={dismissGuide}
            onStepComplete={completeStep}
            onVerifyAppEmbed={verifyAppEmbed}
            isVerifying={isVerifying}
            isDismissing={isDismissing}
        />
    );
}
