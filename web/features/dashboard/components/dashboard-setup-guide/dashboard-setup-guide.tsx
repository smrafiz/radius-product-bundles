"use client";

import { SkeletonLines } from "@/shared";
import { DashboardSetupSteps, useSetupGuide } from "@/features/dashboard";

export function DashboardSetUpGuide() {
    const {
        items,
        isLoading,
        dismissed,
        isDismissing,
        isShowing,
        isGuideOpen,
        expanded,
        completedItemsLength,
        checkboxLoadingId,
        buttonLoading,
        dismissGuide,
        showGuide,
        toggleGuide,
        setExpanded,
        onItemComplete,
        onPrimaryClick,
        onSecondaryClick,
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
            isGuideOpen={isGuideOpen}
            completedItemsLength={completedItemsLength}
            expanded={expanded}
            isDismissing={isDismissing}
            checkboxLoadingId={checkboxLoadingId}
            buttonLoading={buttonLoading}
            onDismiss={dismissGuide}
            toggleGuide={toggleGuide}
            setExpanded={setExpanded}
            onItemComplete={onItemComplete}
            onPrimaryClick={onPrimaryClick}
            onSecondaryClick={onSecondaryClick}
        />
    );
}
