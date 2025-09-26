"use client";

import { useRouter } from "next/navigation";
import { Button, ButtonGroup, Toast, Tooltip } from "@shopify/polaris";

import { withLoader } from "@/utils";
import { BundleListItem } from "@/types";
import { LISTING_DEFAULT_ACTIONS } from "@/lib/constants";
import { useState } from "react";
import { DeleteBundleModal } from "@/bundles/_components";
import { useBundleListingStore } from "@/stores";
import { useSessionToken } from "@/hooks";
import { duplicateBundle } from "@/actions/bundleActions";

interface Props {
    bundle: BundleListItem;
}

export default function BundleActionsGroup({ bundle }: Props) {
    const router = useRouter();
    const showToast = useBundleListingStore((s) => s.showToast);
    const removeBundleFromStore = useBundleListingStore((s) => s.removeBundleFromStore);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [toast, setToast] = useState({ active: false, message: "" });
    const sessionToken = useSessionToken();

    const handleActionClick = (actionKey: string, bundle: BundleListItem) => {
        switch (actionKey) {
            case "edit":
                withLoader(() => router.push(`/bundles/${bundle.id}/edit`))();
                break;
            case "view":
                window.open(`/bundles/${bundle.id}/preview`, "_blank");
                break;
            case "duplicate":
                await handleDuplicateBundle(bundle);
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

    const handleDuplicateBundle = async (bundle: BundleListItem) => {
        if (!sessionToken) {
            setToast({
                active: true,
                message: "Session expired. Please refresh the page and try again.",
            });
            return;
        }

        setIsDuplicating(true);
        try {
            const result = await duplicateBundle(sessionToken, bundle.id);
            if (result.status === "success") {
                router.push(`/bundles/${result.data.id}/edit`);
                showToast(`Bundle "${bundle.name}" duplicated successfully`);
            } else {
                setToast({
                    active: true,
                    message: result.message || "Failed to duplicate bundle",
                });
            }
        } catch (error) {
            console.error("Error duplicating bundle:", error);
            setToast({
                active: true,
                message: "An error occurred while duplicating the bundle",
            });
        } finally {
            setIsDuplicating(false);
        }
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
