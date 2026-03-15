"use client";

import { Fragment } from "react";
import {
    DashboardSetupGuideProps,
    DashboardSetupItem,
} from "@/features/dashboard";
import { useTranslations } from "@/lib/i18n/provider";

const RING_SIZE = 16;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function ProgressRing({
    completed,
    total,
}: {
    completed: number;
    total: number;
}) {
    const progress = total > 0 ? completed / total : 0;
    const offset = RING_CIRCUMFERENCE * (1 - progress);

    return (
        <svg
            width="16"
            height="16"
            viewBox={`0 0 16 16`}
            className="shrink-0 -rotate-90"
        >
            <circle
                cx="8"
                cy="8"
                r={RING_RADIUS}
                fill="none"
                stroke="#e1e1e1"
                strokeWidth={RING_STROKE}
            />
            {progress > 0 && (
                <circle
                    cx="8"
                    cy="8"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="#303030"
                    strokeWidth={RING_STROKE}
                    strokeDashoffset={offset}
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeLinecap="round"
                    className="transition-[stroke-dashoffset] duration-500 ease-in-out"
                />
            )}
        </svg>
    );
}

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
    const t = useTranslations("Dashboard.SetupGuide");
    const nextIncompleteItem = items.find((item) => !item.complete);

    return (
        <s-section padding="none">
            <s-stack gap="small-300">
                {/* Header */}
                <s-box padding="base" paddingBlockEnd="none">
                    <s-grid gap="small-300">
                        <s-grid
                            gridTemplateColumns="1fr auto auto"
                            gap="small-300"
                            alignItems="center"
                        >
                            <div className="flex items-center gap-3">
                                <ProgressRing
                                    completed={completedItemsLength}
                                    total={items.length}
                                />
                                <s-text>
                                    <span className="text-[12px]">
                                        {t("tasksComplete", { completed: String(completedItemsLength), total: String(items.length) })}
                                    </span>
                                </s-text>
                            </div>
                            <s-tooltip id="dismiss-guide-tooltip">
                                {t("dismiss")}
                            </s-tooltip>
                            <s-button
                                interestFor="dismiss-guide-tooltip"
                                accessibilityLabel={t("dismissGuide")}
                                variant="tertiary"
                                tone="neutral"
                                icon="x"
                                onClick={onDismiss}
                                disabled={isDismissing}
                                loading={isDismissing}
                            />
                            <s-tooltip id="toggle-guide-tooltip">
                                {isGuideOpen ? t("collapse") : t("expand")}
                            </s-tooltip>
                            <s-button
                                interestFor="toggle-guide-tooltip"
                                accessibilityLabel={t("toggleGuide")}
                                variant="tertiary"
                                tone="neutral"
                                icon={
                                    isGuideOpen ? "chevron-up" : "chevron-down"
                                }
                                onClick={toggleGuide}
                            />
                        </s-grid>

                        <s-stack gap="small-300">
                            <s-heading>
                                <span className="text-[14px]">
                                    {t("heading")}
                                </span>
                            </s-heading>
                            <s-paragraph>
                                {t("subheading")}
                            </s-paragraph>
                        </s-stack>
                    </s-grid>
                </s-box>

                {/* Expanded: Step list */}
                <s-box
                    borderRadius="base"
                    display={isGuideOpen ? "auto" : "none"}
                    padding="small-200"
                >
                    <s-stack gap="small-500">
                        {items.map((item) => (
                            <Fragment key={item.id}>
                                <DashboardSetupItem
                                    expanded={expanded === item.id}
                                    setExpanded={() => setExpanded(item.id)}
                                    checkboxLoading={
                                        checkboxLoadingId === item.id
                                    }
                                    buttonLoading={
                                        buttonLoading?.itemId === item.id
                                            ? buttonLoading.type
                                            : null
                                    }
                                    onCheckboxChange={() =>
                                        onItemComplete(item.id)
                                    }
                                    onPrimaryClick={() =>
                                        onPrimaryClick(item.id)
                                    }
                                    onSecondaryClick={() =>
                                        onSecondaryClick(item.id)
                                    }
                                    {...item}
                                />
                            </Fragment>
                        ))}
                    </s-stack>
                </s-box>

                {/* Collapsed: "Up next" bar */}
                {!isGuideOpen && nextIncompleteItem && (
                    <s-box padding="small-200">
                        <s-box
                            padding="small-200"
                            paddingInlineStart="small"
                            background="subdued"
                            borderRadius="base"
                        >
                            <div className="flex items-center justify-between">
                                <s-text>
                                    <s-text>
                                        <span className="font-semibold">
                                            {t("upNext")}{" "}
                                        </span>
                                    </s-text>
                                    {nextIncompleteItem.title}
                                </s-text>
                                <s-button
                                    variant="secondary"
                                    onClick={toggleGuide}
                                >
                                    {t("resumeGuide")}
                                </s-button>
                            </div>
                        </s-box>
                    </s-box>
                )}

                {/* Collapsed: All complete */}
                {!isGuideOpen && !nextIncompleteItem && (
                    <s-box padding="small-200">
                        <s-box
                            padding="small-200"
                            paddingInlineStart="small-200"
                            background="subdued"
                            borderRadius="base"
                        >
                            <div className="flex items-center justify-between">
                                <s-stack
                                    direction="inline"
                                    gap="small-200"
                                    alignItems="center"
                                >
                                    <s-icon
                                        type="check-circle-filled"
                                        tone="success"
                                    />
                                    <s-text type="strong">
                                        {t("allComplete")}
                                    </s-text>
                                </s-stack>
                                <s-button
                                    variant="tertiary"
                                    onClick={onDismiss}
                                    disabled={isDismissing}
                                >
                                    {t("dismissGuide")}
                                </s-button>
                            </div>
                        </s-box>
                    </s-box>
                )}
            </s-stack>
        </s-section>
    );
}
