"use client";

import {
    BUNDLE_STATUSES,
    BundleStatus,
    getBundleStatusBadge,
    StatusPopoverProps,
    useBundleActions,
} from "@/features/bundles";
import { useModalStore } from "@/shared";
import { useCallback, useState } from "react";

/**
 * Bundle status popover
 */
export function StatusPopover({ bundle }: StatusPopoverProps) {
    const [popoverActive, setPopoverActive] = useState(false);

    const { modal, openModal } = useModalStore();
    const { actions } = useBundleActions(bundle);
    const popoverId = `bundle-status-popover-${bundle.id}`;
    const modalId = modal.type || undefined;

    const togglePopover = useCallback(
        () => setPopoverActive((active) => !active),
        [],
    );

    const handleStatusClick = (status: BundleStatus) => {
        if (status !== bundle.status) {
            openModal({
                type: "status",
                bundle,
                newStatus: status,
                onConfirm: async () => {
                    await actions.status(status);
                },
            });
        }
        setPopoverActive(false);
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
                            ([statusKey, status]) => (
                                <div
                                    onClick={() =>
                                        handleStatusClick(
                                            statusKey as BundleStatus,
                                        )
                                    }
                                    key={statusKey}
                                >
                                    <s-clickable commandFor={modalId}>
                                        {status.text}
                                    </s-clickable>
                                </div>
                            ),
                        )}
                    </s-stack>
                </s-box>
            </s-popover>
        </>
    );
}
