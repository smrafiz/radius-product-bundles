"use client";

import { memo, useState } from "react";
import { DeleteBundleModal, DuplicateBundleModal } from "@/bundles/_components";
import { LISTING_DEFAULT_ACTIONS } from "@/lib/constants";
import { Button, ButtonGroup, Toast, Tooltip } from "@shopify/polaris";

import { BundleListItem } from "@/types";
import { useBundleListingStore } from "@/stores";

interface Props {
    bundle: BundleListItem;
    onAction: {
        edit: () => void;
        view: () => void;
        duplicate: () => Promise<void>;
        delete: () => void;
    };
}

export default memo(function BundleActionsGroup({ bundle, onAction }: Props) {
    const showToast = useBundleListingStore((s) => s.showToast);
    const removeBundleFromStore = useBundleListingStore(
        (s) => s.removeBundleFromStore,
    );

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
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
                setDuplicateModalOpen(true);
                break;
            case "delete":
                setDeleteModalOpen(true);
                break;
            default:
                console.warn(`Unknown action: ${actionKey}`);
        }
    };

    const handleDeleteSuccess = (bundleName: string) => {
        removeBundleFromStore(bundle.id);
        showToast(`Bundle "${bundleName}" has been deleted successfully`);
    };

    const handleDuplicateSuccess = () => {
        void onAction.duplicate();
        setDuplicateModalOpen(false);
    };

    const handleError = (error: string) => {
        setToast({
            active: true,
            message: error,
        });
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

            {/* Delete Confirmation Modal */}
            <DeleteBundleModal
                open={deleteModalOpen}
                bundle={bundle}
                onClose={() => setDeleteModalOpen(false)}
                onSuccess={handleDeleteSuccess}
                onError={handleError}
            />

            {/* Duplicate Confirmation Modal */}
            <DuplicateBundleModal
                open={duplicateModalOpen}
                bundle={bundle}
                onClose={() => setDuplicateModalOpen(false)}
                onSuccess={handleDuplicateSuccess}
                onError={handleError}
            />

            {/* Toast Notification */}
            {toast.active && (
                <Toast
                    content={toast.message}
                    onDismiss={() => setToast({ active: false, message: "" })}
                />
            )}
        </>
    );
});
