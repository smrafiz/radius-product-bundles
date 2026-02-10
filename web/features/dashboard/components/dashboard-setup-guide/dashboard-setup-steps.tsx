"use client";

import {
    DashboardSetupGuideProps,
    DashboardSetupItem,
} from "@/features/dashboard";
import { Fragment, useState } from "react";

export function DashboardSetupSteps({
    onDismiss,
    onStepComplete,
    isDismissing,
    items,
    shopDomain,
    apiKey,
}: DashboardSetupGuideProps) {
    const [expanded, setExpanded] = useState<number>(
        items.findIndex((item) => !item.complete),
    );
    const [isGuideOpen, setIsGuideOpen] = useState(true);
    const completedItemsLength = items.filter((item) => item.complete).length;

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
                            icon={
                                isGuideOpen
                                    ? "chevron-up"
                                    : "chevron-down"
                            }
                            onClick={() => {
                                setIsGuideOpen((prev) => {
                                    if (!prev)
                                        setExpanded(
                                            items.findIndex(
                                                (item) => !item.complete,
                                            ),
                                        );
                                    return !prev;
                                });
                            }}
                        />
                    </s-grid>
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
                </s-grid>
            </s-box>

            <s-box
                borderRadius="base"
                display={isGuideOpen ? "auto" : "none"}
                paddingBlockStart="base"
            >
                <s-box padding="small-300">
                    {items.map((item, index) => (
                        <Fragment key={item.id}>
                            {index > 0 && <s-divider />}
                            <DashboardSetupItem
                                expanded={expanded === item.id}
                                setExpanded={() =>
                                    setExpanded(
                                        expanded === item.id ? -1 : item.id,
                                    )
                                }
                                onComplete={onStepComplete}
                                shopDomain={shopDomain}
                                apiKey={apiKey}
                                {...item}
                            />
                        </Fragment>
                    ))}
                </s-box>
            </s-box>
        </s-section>
    );
}
