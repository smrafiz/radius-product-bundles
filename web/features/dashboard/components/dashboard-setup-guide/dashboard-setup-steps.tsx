"use client";

import { Fragment } from "react";
import { DashboardSetupGuideProps, DashboardSetupItem } from "@/features/dashboard";

export function DashboardSetupSteps({
    items,
    isGuideOpen,
    completedItemsLength,
    expanded,
    isDismissing,
    checkboxLoadingId,
    buttonLoading,
    onDismiss,
    toggleGuide,
    setExpanded,
    onItemComplete,
    onPrimaryClick,
    onSecondaryClick,
}: DashboardSetupGuideProps) {
    return (
        <s-section padding="none">
            <s-box padding="base" paddingBlockEnd="none">
                <s-grid gap="small-200">
                    <s-grid
                        gridTemplateColumns="1fr auto auto"
                        gap="small-300"
                        alignItems="center"
                    >
                        <s-heading>Setup guide</s-heading>
                        <s-tooltip id="dismiss-guide-tooltip">Dismiss</s-tooltip>
                        <s-button
                            interestFor="dismiss-guide-tooltip"
                            accessibilityLabel="Dismiss setup guide"
                            variant="tertiary"
                            tone="neutral"
                            icon="x"
                            onClick={onDismiss}
                            disabled={isDismissing}
                            loading={isDismissing}
                        />
                        <s-tooltip id="toggle-guide-tooltip">
                            {isGuideOpen ? "Collapse" : "Expand"}
                        </s-tooltip>
                        <s-button
                            interestFor="toggle-guide-tooltip"
                            accessibilityLabel="Toggle setup guide"
                            variant="tertiary"
                            tone="neutral"
                            icon={isGuideOpen ? "chevron-up" : "chevron-down"}
                            onClick={toggleGuide}
                        />
                    </s-grid>
                    <s-stack gap="base">
                        <s-paragraph>
                            Use this personalized guide to get your app up and
                            running.
                        </s-paragraph>

                        <s-stack
                            direction="inline"
                            alignItems="center"
                            gap="small-300"
                            paddingBlockEnd={!isGuideOpen ? "small" : "none"}
                        >
                            <div className="flex gap-4 w-full items-center">
                                <s-text color="subdued">
                                    <div className="min-w-25">
                                        {completedItemsLength === items.length ? (
                                            <s-stack
                                                direction="inline"
                                                gap="small-200"
                                                alignItems="center"
                                            >
                                                <s-icon
                                                    type="check-circle-filled"
                                                    tone="success"
                                                />
                                                <span>Done</span>
                                            </s-stack>
                                        ) : (
                                            `${completedItemsLength} / ${items.length} completed`
                                        )}
                                    </div>
                                </s-text>
                                <div className="w-full">
                                    <div className="w-full h-2 bg-[#ebebeb] rounded-md overflow-hidden">
                                        <div
                                            className="h-full bg-[#1a1a1a] rounded-sm transition-all duration-300 ease-in-out"
                                            style={{
                                                width: `${(completedItemsLength / items.length) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </s-stack>
                    </s-stack>
                </s-grid>
            </s-box>

            <s-box
                borderRadius="base"
                display={isGuideOpen ? "auto" : "none"}
            >
                <s-box padding="small-300">
                    {items.map((item, index) => (
                        <Fragment key={item.id}>
                            {index > 0 && <s-divider />}
                            <DashboardSetupItem
                                expanded={expanded === item.id}
                                setExpanded={() => setExpanded(item.id)}
                                checkboxLoading={checkboxLoadingId === item.id}
                                buttonLoading={
                                    buttonLoading?.itemId === item.id
                                        ? buttonLoading.type
                                        : null
                                }
                                onCheckboxChange={() => onItemComplete(item.id)}
                                onPrimaryClick={() => onPrimaryClick(item.id)}
                                onSecondaryClick={() => onSecondaryClick(item.id)}
                                {...item}
                            />
                        </Fragment>
                    ))}
                </s-box>
            </s-box>
        </s-section>
    );
}
