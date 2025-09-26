"use client";

import { useRouter } from "next/navigation";
import { Button, ButtonGroup, Toast, Tooltip } from "@shopify/polaris";

import { withLoader } from "@/utils";
import { BundleListItem } from "@/types";
import { LISTING_DEFAULT_ACTIONS } from "@/lib/constants";
import { useState } from "react";
import { DeleteBundleModal } from "@/bundles/_components";
import { useBundleListingStore } from "@/stores";

interface Props {
    bundle: BundleListItem;
}

export default function BundleActionsGroup({ bundle }: Props) {
    const router = useRouter();
    const showToast = useBundleListingStore((s) => s.showToast);
    const removeBundleFromStore = useBundleListingStore((s) => s.removeBundleFromStore);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [toast, setToast] = useState({ active: false, message: "" });

    const handleActionClick = (actionKey: string, bundle: BundleListItem) => {
        switch (actionKey) {
            case "edit":
                withLoader(() => router.push(`/bundles/${bundle.id}/edit`))();
                break;
            case "view":
                window.open(`/bundles/${bundle.id}/preview`, "_blank");
                break;
            case "duplicate":
                console.log("Duplicate", bundle.id);
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

    const handleDeleteError = (error: string) => {
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
                            onClick={() =>
                                handleActionClick(action.key, bundle)
                            }
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
                onError={handleDeleteError}
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
}
