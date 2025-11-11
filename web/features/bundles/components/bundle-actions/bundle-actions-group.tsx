"use client";

import { useModalStore } from "@/shared";
import { Button, ButtonGroup, Tooltip } from "@shopify/polaris";
import {
    BUNDLE_LISTING_ACTIONS,
    BundleActionsGroupProps,
} from "@/features/bundles";

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
            <ButtonGroup variant="segmented">
                {BUNDLE_LISTING_ACTIONS.map((action, index) => (
                    <Tooltip key={index} content={action.tooltip} dismissOnMouseOut>
                        <Button
                            icon={action.icon}
                            tone={action.tone}
                            disabled={action.disabled}
                            onClick={() => handleActionClick(action.key)}
                            accessibilityLabel={action.tooltip}
                        />
                    </Tooltip>
                ))}
            </ButtonGroup>
        </>
    );
}
