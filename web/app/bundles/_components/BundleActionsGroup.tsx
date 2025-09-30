"use client";

import { useState } from "react";
import { LISTING_DEFAULT_ACTIONS } from "@/lib/constants";
import { Button, ButtonGroup, Toast, Tooltip } from "@shopify/polaris";

import { BundleListItem } from "@/types";
import { useModalStore } from "@/stores";

interface Props {
    bundle: BundleListItem;
    onAction: {
        edit: () => void;
        view: () => void;
        duplicate: () => Promise<void>;
        delete: () => Promise<void>;
    };
}

export default function BundleActionsGroup({ bundle, onAction }: Props) {
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
                {LISTING_DEFAULT_ACTIONS.map((action, index) => (
                    <Tooltip key={index} content={action.tooltip}>
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
