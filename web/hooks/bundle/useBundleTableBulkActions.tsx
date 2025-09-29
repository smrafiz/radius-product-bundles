"use client";

import { useRouter } from "next/navigation";
import type { BundleStatus } from "@/types";
import { useBundleListingStore } from "@/stores";
import { useGlobalBanner, useSessionToken } from "@/hooks";
import { DeleteIcon, DuplicateIcon } from "@shopify/polaris-icons";
import { bulkToggleBundleStatus, deleteBundle, deleteBundles, toggleBundleStatus, } from "@/actions";

export function useBundleTableBulkActions() {
    const router = useRouter();
    const { refreshBundles } = useBundleListingStore();
    const { showSuccess, showError } = useGlobalBanner();
    const sessionToken = useSessionToken();

    const handleCreateBundle = () => {
        router.push("/bundles/create");
    };

    const handleToggleBundleStatus = async (
        bundleId: string,
        currentStatus: BundleStatus,
    ) => {
        if (!sessionToken) {
            return;
        }

        const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";

        try {
            const result = await toggleBundleStatus(
                sessionToken,
                bundleId,
                newStatus,
            );
            console.log(result);

            if (result.status === "success") {
                await refreshBundles();
                showSuccess(`Bundle ${newStatus.toLowerCase()}`, {
                    content: result.message,
                    autoHide: true,
                    duration: 2000,
                });
            } else {
                showError("Status update failed", {
                    content: result.message,
                });
            }
        } catch (error) {
            showError("Status update failed", {
                content: "An unexpected error occurred.",
            });
        }
    };

    const handleBulkActivate = async (bundleIds: string[]) => {
        // showToast(`Activated ${selectedCount} bundles`);
        if (!sessionToken) {
            return;
        }

        try {
            const result = await bulkToggleBundleStatus(
                sessionToken,
                bundleIds,
                "ACTIVE",
            );

            if (result.status === "success") {
                await refreshBundles();
                showSuccess(`${result.data.updatedCount} bundles activated`, {
                    content: "Selected bundles have been activated.",
                    autoHide: true,
                    duration: 2000,
                });
            } else {
                showError("Bulk activation failed", {
                    content: result.message,
                });
            }
        } catch (error) {
            showError("Bulk activation failed", {
                content: "An unexpected error occurred.",
            });
        }
    };

    const handleBulkDraft = async (bundleIds: string[]) => {
        if (!sessionToken) {
            return;
        }

        try {
            const result = await bulkToggleBundleStatus(
                sessionToken,
                bundleIds,
                "DRAFT",
            );

            if (result.status === "success") {
                showSuccess(`${result.data.updatedCount} bundles draft`, {
                    content: "Selected bundles have been set as draft.",
                    autoHide: true,
                    duration: 2000,
                });
            } else {
                showError("Bulk draft failed", {
                    content: result.message,
                });
            }
        } catch (error) {
            showError("Bulk draft failed", {
                content: "An unexpected error occurred.",
            });
        }
    };

    const handleBulkDelete = async (bundleIds: string[]) => {
        if (!sessionToken) {
            return;
        }

        try {
            const result = await deleteBundles(sessionToken, bundleIds);

            if (result.status === "success") {
                await refreshBundles();
                showSuccess(`${result.data.deletedCount} bundles deleted`, {
                    content: "Selected bundles have been deleted successfully.",
                    autoHide: true,
                    duration: 3000,
                });
            } else {
                showError("Bulk delete failed", {
                    content: result.message,
                });
            }
        } catch (error) {
            showError("Bulk delete failed", {
                content: "An unexpected error occurred.",
            });
        }
    };

    // Get promoted bulk actions
    const getPromotedBulkActions = (
        selectedResources: string[],
        selectedBundle: any,
        rowActions: any,
    ) => {
        const actions = [];

        if (selectedResources.length === 1 && selectedBundle) {
            // Single selection actions
            actions.push(
                {
                    content: "Edit",
                    onAction: rowActions.edit,
                },
                {
                    content:
                        selectedBundle.status === "ACTIVE"
                            ? "Set as draft"
                            : "Set as active",
                    onAction: () =>
                        handleToggleBundleStatus(
                            selectedBundle.id,
                            selectedBundle.status,
                        ),
                },
            );
        } else if (selectedResources.length > 1) {
            // Multiple selection actions
            actions.push(
                {
                    content: "Set as active",
                    onAction: () => handleBulkActivate(selectedResources),
                },
                {
                    content: "Set as draft",
                    onAction: () => handleBulkDraft(selectedResources),
                },
            );
        }

        return actions;
    };

    // Get bulk actions (dropdown)
    const getBulkActions = (
        selectedResources: string[],
        selectedBundle: any,
        rowActions: any,
    ) => {
        if (selectedResources.length === 1 && selectedBundle) {
            // Single selection dropdown actions
            return [
                {
                    content: "Duplicate",
                    icon: DuplicateIcon,
                    onAction: () => rowActions.duplicate,
                },
                {
                    content: "Delete bundle",
                    icon: DeleteIcon,
                    destructive: true,
                    onAction: () => rowActions.delete,
                },
            ];
        } else if (selectedResources.length > 1) {
            // Multiple selection dropdown actions
            return [
                {
                    content: "Delete bundles",
                    icon: DeleteIcon,
                    destructive: true,
                    onAction: () => handleBulkDelete(selectedResources),
                },
            ];
        }
        return [];
    };

    return {
        handleCreateBundle,
        handleToggleBundleStatus,
        handleBulkActivate,
        handleBulkDraft,
        handleBulkDelete,
        getPromotedBulkActions,
        getBulkActions,
    };
}
