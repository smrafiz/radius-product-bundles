"use client";

import {
    BUNDLE_STATUSES,
    BundleStatus,
    StatusPopoverProps,
    useBundleActions,
} from "@/features/bundles";
import { useTranslations } from "@/lib/i18n/provider";
import { ProBadge, useCrossSellStore, useModalStore, usePlan } from "@/shared";

/**
 * Bundle status popover
 */
export function StatusPopover({ bundle }: StatusPopoverProps) {
    const ts = useTranslations("Bundles.Statuses");
    const { openModal } = useModalStore();
    const { actions } = useBundleActions(bundle);
    const { plan } = usePlan();
    const { open: openCrossSell } = useCrossSellStore();
    const popoverId = `bundle-status-popover-${bundle.id}`;

    /**
     * Handle status change
     */
    const handleStatusClick = (status: BundleStatus) => {
        if (!status || status === bundle.status) {
            return;
        }

        // Close popover first
        const popoverBtn = document.querySelector(
            `[commandFor="${popoverId}"]`,
        ) as HTMLElement;
        if (popoverBtn) {
            popoverBtn.click();
        }

        // Open modal
        openModal({
            type: "status",
            bundle,
            newStatus: status,
            onConfirm: async (data) => {
                await actions.status(status, data?.startDate, data?.endDate);
            },
        });
    };

    const statusConfig =
        BUNDLE_STATUSES[bundle.status] ?? BUNDLE_STATUSES.DRAFT;

    return (
        <>
            {/* Clickable badge */}
            <s-clickable commandFor={popoverId} type="reset">
                <s-stack direction="inline" gap="none" alignItems="center">
                    <s-badge tone={statusConfig.tone}>
                        {ts(bundle.status)}
                    </s-badge>
                    <s-icon type="caret-down" />
                </s-stack>
            </s-clickable>

            {/* Popover */}
            <s-popover id={popoverId}>
                <s-box padding="small-300">
                    <s-stack gap="small-400">
                        {Object.entries(BUNDLE_STATUSES)
                            .filter(([key]) => key !== "DELETED")
                            .map(([statusKey]) => {
                                const isCurrentStatus =
                                    statusKey === bundle.status;
                                const isLocked =
                                    !plan.limits.allowedStatuses.includes(
                                        statusKey as BundleStatus,
                                    );

                                return (
                                    <div
                                        className={
                                            isCurrentStatus || isLocked
                                                ? "cursor-default"
                                                : "cursor-pointer"
                                        }
                                        key={statusKey}
                                        onClick={() => {
                                            if (isLocked) {
                                                openCrossSell(ts(statusKey));
                                            } else if (!isCurrentStatus) {
                                                handleStatusClick(
                                                    statusKey as BundleStatus,
                                                );
                                            }
                                        }}
                                    >
                                        <s-clickable
                                            disabled={
                                                isCurrentStatus ||
                                                isLocked ||
                                                undefined
                                            }
                                            background={
                                                isCurrentStatus
                                                    ? "subdued"
                                                    : "base"
                                            }
                                            padding="small-300"
                                            borderRadius="base"
                                        >
                                            <s-stack
                                                direction="inline"
                                                justifyContent="space-between"
                                                alignItems="center"
                                            >
                                                {isCurrentStatus ? (
                                                    <span className="font-semibold">
                                                        {ts(statusKey)}
                                                    </span>
                                                ) : (
                                                    <s-text>
                                                        {ts(statusKey)}
                                                    </s-text>
                                                )}
                                                {isLocked && (
                                                    <ProBadge
                                                        label={ts(statusKey)}
                                                    />
                                                )}
                                            </s-stack>
                                        </s-clickable>
                                    </div>
                                );
                            })}
                    </s-stack>
                </s-box>
            </s-popover>
        </>
    );
}
