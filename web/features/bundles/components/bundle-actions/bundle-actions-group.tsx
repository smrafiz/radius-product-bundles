"use client";

import { Fragment } from "react";
import { useModalStore } from "@/shared";
import { BUNDLE_LISTING_ACTIONS, BundleActionsGroupProps, } from "@/features/bundles";

/**
 * Bundle actions group
 */
export function BundleActionsGroup({
    bundle,
    onAction,
}: BundleActionsGroupProps) {
    const { modal, openModal } = useModalStore();
    const modalId = modal.type;

    const handleActionClick = (actionKey: string) => {
        switch (actionKey) {
            case "edit":
                onAction.edit();
                break;

            case "view":
                onAction.view();
                break;

            case "duplicate":
                openModal({
                    type: "duplicate",
                    bundle,
                    onConfirm: async () => {
                        await onAction.duplicate();
                    },
                });
                break;

            case "delete":
                openModal({
                    type: "delete",
                    bundle,
                    onConfirm: async () => {
                        await onAction.delete();
                    },
                });
                break;
        }
    };

    return (
        <>
            {/* Tooltips */}
            {BUNDLE_LISTING_ACTIONS.map((action) => {
                const tooltipId = `${action.key}-${bundle.id}`;
                return (
                    <s-tooltip key={`tooltip-${action.key}`} id={tooltipId}>
                        <s-text>{action.tooltip}</s-text>
                    </s-tooltip>
                );
            })}

            {/* Segmented button group */}
            <s-button-group gap="none">
                {BUNDLE_LISTING_ACTIONS.map((action) => {
                    const tooltipId = `${action.key}-${bundle.id}`;
                    return (
                        <s-button
                            key={action.key}
                            slot="secondary-actions"
                            interestFor={tooltipId}
                            accessibilityLabel={action.tooltip}
                            commandFor={modalId || undefined}
                            icon={action.icon}
                            tone={action.tone}
                            onClick={() => handleActionClick(action.key)}
                        />
                    );
                })}
            </s-button-group>
        </>
    );
}
