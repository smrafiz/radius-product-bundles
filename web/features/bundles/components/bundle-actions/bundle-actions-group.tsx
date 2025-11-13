"use client";

import { useModalStore } from "@/shared";
import { BUNDLE_LISTING_ACTIONS, BundleActionsGroupProps, } from "@/features/bundles";

/**
 * Bundle actions group
 */
export function BundleActionsGroup({
    bundle,
    onAction,
}: BundleActionsGroupProps) {
    const { openModal } = useModalStore();

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
                // Set modal data BEFORE it opens
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
                    const modalId = `${action.key}-modal`;

                    return (
                        <s-button
                            key={action.key}
                            slot="secondary-actions"
                            interestFor={tooltipId}
                            accessibilityLabel={action.tooltip}
                            commandFor="app-modal"
                            command="--show"
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
