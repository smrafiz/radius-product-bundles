"use client";

import { Button, ButtonGroup, Toast, Tooltip } from "@shopify/polaris";
import { BundleListItem } from "@/types";
import { LISTING_DEFAULT_ACTIONS } from "@/lib/constants";
import { useState } from "react";
import { ConfirmationModal } from "@/bundles/_components";
import { useConfirmation } from "@/hooks";

interface Props {
    bundle: BundleListItem;
    onAction: {
        edit: () => void;
        view: () => void;
        duplicate: () => Promise<void>;
        delete: () => void;
    };
}

export default function BundleActionsGroup({ bundle, onAction }: Props) {
    const { confirm, modalProps } = useConfirmation();
    const [toast, setToast] = useState({ active: false, message: "" });

    const handleActionClick = (actionKey: string) => {
        switch (actionKey) {
            case "edit":
                onAction.edit();
                break;
            case "view":
                onAction.view();
                break;
            case "duplicate":
                confirm({
                    title: "Duplicate Bundle",
                    message: `Are you sure you want to duplicate "${bundle.name}"? This will create a new bundle with all the same settings as a draft.`,
                    confirmLabel: "Duplicate Bundle",
                    onConfirm: onAction.duplicate,
                });
                break;
            case "delete":
                confirm({
                    title: "Delete Bundle",
                    message: `Are you sure you want to delete "${bundle.name}"? This action cannot be undone and will permanently remove all bundle data, analytics, and settings.`,
                    confirmLabel: "Delete Bundle",
                    destructive: true,
                    onConfirm: onAction.delete,
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

            {modalProps && <ConfirmationModal {...modalProps} />}

            {toast.active && (
                <Toast
                    content={toast.message}
                    onDismiss={() => setToast({ active: false, message: "" })}
                />
            )}
        </>
    );
}