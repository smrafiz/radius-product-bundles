import { useRouter } from "next/navigation";
import type { BundleStatus } from "@/types";
import { useBundleListingStore } from "@/stores";
import { DeleteIcon, DuplicateIcon } from "@shopify/polaris-icons";
import { useGlobalBanner, useSessionToken } from "@/hooks";
import {
    bulkToggleBundleStatus,
    deleteBundle,
    deleteBundles,
    toggleBundleStatus,
} from "@/actions";

export function useBundleTableActions() {
    const router = useRouter();
    const { showToast, refreshBundles } = useBundleListingStore();
    const { showSuccess, showError } = useGlobalBanner();
    const sessionToken = useSessionToken();

    const handleCreateBundle = () => {
        router.push("/bundles/create");
    };

    const handleEditBundle = (bundleId: string) => {
        router.push(`/bundles/${bundleId}/edit`);
    };

    const handleDuplicateBundle = (bundleId: string) => {
        showToast(`Duplicating bundle ${bundleId}...`);
    };

    const handleToggleBundleStatus = async (
        bundleId: string,
        currentStatus: BundleStatus,
    ) => {
        // const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
        // showToast(`Bundle status changed to ${newStatus.toLowerCase()}`);

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

    const handleDeleteBundle = async (bundleId: string) => {
        if (!sessionToken) {
            return;
        }

        try {
            const result = await deleteBundle(sessionToken, bundleId);

            if (result.status === "success") {
                await refreshBundles();
                showSuccess("Bundle deleted successfully", {
                    content: `"${result.data.name}" has been deleted.`,
                    autoHide: true,
                    duration: 3000,
                });
            } else {
                showError("Failed to delete bundle", {
                    content: result.message,
                });
            }
        } catch (error) {
            showError("Delete failed", {
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

    const handleBulkPause = async (bundleIds: string[]) => {
        // showToast(`Paused ${selectedCount} bundles`);
        if (!sessionToken) {
            return;
        }

        try {
            const result = await bulkToggleBundleStatus(
                sessionToken,
                bundleIds,
                "PAUSED",
            );

            if (result.status === "success") {
                showSuccess(`${result.data.updatedCount} bundles paused`, {
                    content: "Selected bundles have been paused.",
                    autoHide: true,
                    duration: 2000,
                });
            } else {
                showError("Bulk pause failed", {
                    content: result.message,
                });
            }
        } catch (error) {
            showError("Bulk pause failed", {
                content: "An unexpected error occurred.",
            });
        }
    };

    const handleBulkDelete = async (bundleIds: string[]) => {
        // showToast(`Deleted ${selectedCount} bundles`);
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
    ) => {
        const actions = [];

        if (selectedResources.length === 1 && selectedBundle) {
            // Single selection actions
            actions.push(
                {
                    content: "Edit",
                    onAction: () => handleEditBundle(selectedBundle.id),
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
                    onAction: () => handleBulkPause(selectedResources),
                },
            );
        }

        return actions;
    };

    // Get bulk actions (dropdown)
    const getBulkActions = (
        selectedResources: string[],
        selectedBundle: any,
    ) => {
        if (selectedResources.length === 1 && selectedBundle) {
            // Single selection dropdown actions
            return [
                {
                    content: "Duplicate",
                    icon: DuplicateIcon,
                    onAction: () => handleDuplicateBundle(selectedBundle.id),
                },
                {
                    content: "Delete bundle",
                    icon: DeleteIcon,
                    destructive: true,
                    onAction: () => handleDeleteBundle(selectedBundle.id),
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
        handleEditBundle,
        handleDuplicateBundle,
        handleToggleBundleStatus,
        handleDeleteBundle,
        handleBulkActivate,
        handleBulkPause,
        handleBulkDelete,
        getPromotedBulkActions,
        getBulkActions,
    };
}
