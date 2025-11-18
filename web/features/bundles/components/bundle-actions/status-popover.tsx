"use client";

import {
    BUNDLE_STATUSES,
    BundleStatus,
    getBundleStatusBadge,
    StatusPopoverProps,
    useBundleActions,
} from "@/features/bundles";
import { useModalStore } from "@/shared";

/**
 * Bundle status popover
 */
export function StatusPopover({ bundle }: StatusPopoverProps) {
    const { openModal } = useModalStore();
    const { actions } = useBundleActions(bundle);
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
            onConfirm: async () => {
                await actions.status(status);
            },
        });

        // Show modal element
        setTimeout(() => {
            const modalElement = document.getElementById(
                "radius-bundles-app-modal",
            ) as any;
            if (modalElement?.showOverlay) {
                modalElement.showOverlay();
            }
        }, 100);
    };

    const badge = getBundleStatusBadge(bundle.status);

    return (
        <>
            {/* Clickable badge */}
            <s-clickable commandFor={popoverId} type="reset">
                <s-stack direction="inline" gap="none" alignItems="center">
                    <s-badge tone={badge.tone}>{badge.text}</s-badge>
                    <s-icon type="caret-down" />
                </s-stack>
            </s-clickable>

            {/* Popover */}
            <s-popover id={popoverId}>
                <s-box padding="small">
                    <s-stack gap="small">
                        {Object.entries(BUNDLE_STATUSES).map(
                            ([statusKey, status]) => {
                                const isCurrentStatus =
                                    statusKey === bundle.status;

                                return (
                                    <div
                                        key={statusKey}
                                        onClick={() => {
                                            if (!isCurrentStatus) {
                                                handleStatusClick(
                                                    statusKey as BundleStatus,
                                                );
                                            }
                                        }}
                                        style={{
                                            cursor: isCurrentStatus
                                                ? "default"
                                                : "pointer",
                                        }}
                                    >
                                        <s-clickable>
                                            {isCurrentStatus ? (
                                                <s-stack direction="inline">
                                                    <s-text type="strong">
                                                        {status.text}
                                                    </s-text>
                                                </s-stack>
                                            ) : (
                                                <s-text>{status.text}</s-text>
                                            )}
                                        </s-clickable>
                                    </div>
                                );
                            },
                        )}
                    </s-stack>
                </s-box>
            </s-popover>
        </>
    );
}
