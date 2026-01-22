"use client";

import { useGlobalBanner, useModalStore, withLoader } from "@/shared";
import {
    BundleStatus,
    invalidateBundleCache,
    useBundleListingStore,
} from "@/features/bundles";
import {
    bulkToggleBundleStatusAction,
    deleteBundlesAction,
    updateBundleStatusAction,
} from "@/features/bundles/actions";
import { useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";

/**
 * Get bundle table bulk actions
 */
export function useBundleTableBulkActions(clearSelection?: () => void) {
    const queryClient = useQueryClient();
    const app = useAppBridge();
    const { showError } = useGlobalBanner();
    const { openModal, setLoading } = useModalStore();
    const updateBundleInStore = useBundleListingStore(
        (s) => s.updateBundleInStore,
    );
    const showToast = useBundleListingStore((s) => s.showToast);

    /**
     * Toggle bundle status (ACTIVE ↔ DRAFT)
     */
    const handleToggleBundleStatus = (
        bundleId: string,
        currentStatus: BundleStatus,
        bundleName: string,
    ) => {
        if (!app) {
            return;
        }

        const newStatus: BundleStatus =
            currentStatus === "ACTIVE" ? "DRAFT" : "ACTIVE";

        openModal({
            type: "status",
            bundle: {
                id: bundleId,
                name: bundleName,
                status: currentStatus,
            } as any,
            newStatus,
            onConfirm: async () => {
                setLoading(true);
                try {
                    const sessionToken = await app.idToken();
                    const result = await updateBundleStatusAction(
                        sessionToken,
                        bundleId,
                        newStatus,
                    );
                    if (result.status === "success") {
                        updateBundleInStore(bundleId, {
                            status: result.data.status,
                        });
                        await invalidateBundleCache(queryClient);
                        showToast(
                            result.message ||
                                "Bundle status updated successfully",
                        );
                    } else {
                        showError("Status update failed", {
                            content: result.message,
                        });
                    }
                } catch {
                    showError("Status update failed", {
                        content: "An unexpected error occurred.",
                    });
                }
            },
        });
    };

    /**
     * Bulk activate bundles
     */
    const handleBulkActivate = (bundleIds: string[]) => {
        if (!app) {
            return;
        }

        openModal({
            type: "status",
            newStatus: "ACTIVE",
            bundle: { name: "selected bundles" } as any,
            onConfirm: async () => {
                try {
                    const sessionToken = await app.idToken();
                    const result = await bulkToggleBundleStatusAction(
                        sessionToken,
                        bundleIds,
                        "ACTIVE",
                    );
                    if (result.status === "success") {
                        await invalidateBundleCache(queryClient);
                        showToast(
                            result.message ||
                                `${result.data.updatedCount} bundles activated`,
                        );
                    } else {
                        showError("Bulk activation failed", {
                            content: result.message,
                        });
                    }
                } catch {
                    showError("Bulk activation failed", {
                        content: "An unexpected error occurred.",
                    });
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    /**
     * Bulk draft bundles
     */
    const handleBulkDraft = (bundleIds: string[]) => {
        if (!app) return;

        openModal({
            type: "status",
            newStatus: "DRAFT",
            bundle: { name: "selected bundles" } as any,
            onConfirm: async () => {
                setLoading(true);
                try {
                    const sessionToken = await app.idToken();
                    const result = await bulkToggleBundleStatusAction(
                        sessionToken,
                        bundleIds,
                        "DRAFT",
                    );
                    if (result.status === "success") {
                        await invalidateBundleCache(queryClient);
                        showToast(
                            result.message ||
                                `${result.data.updatedCount} bundles set as draft`,
                        );
                    } else {
                        showError("Bulk draft failed", {
                            content: result.message,
                        });
                    }
                } catch {
                    showError("Bulk draft failed", {
                        content: "An unexpected error occurred.",
                    });
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    /*
     * Bulk delete bundles
     */
    const handleBulkDelete = (bundleIds: string[]) => {
        if (!app) return;

        openModal({
            type: "delete",
            bundle: { name: "selected bundles" } as any,
            onConfirm: async () => {
                setLoading(true);
                try {
                    const sessionToken = await app.idToken();
                    const result = await deleteBundlesAction(
                        sessionToken,
                        bundleIds,
                    );

                    if (result.status === "success") {
                        await invalidateBundleCache(queryClient);
                        showToast(
                            result.message ||
                                "Selected bundles have been deleted successfully",
                        );
                        if (clearSelection) {
                            clearSelection();
                        }
                    } else {
                        showError("Bulk delete failed", {
                            content: result.message,
                        });
                    }
                } catch {
                    showError("Bulk delete failed", {
                        content: "An unexpected error occurred.",
                    });
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    /**
     * Get bulk actions for promoted rows
     */
    const getPromotedBulkActions = (
        selectedResources: string[],
        selectedBundle: any,
        rowActions: any,
    ) => {
        const actions = [];

        if (selectedResources.length === 1 && selectedBundle) {
            actions.push(
                {
                    content: "Edit",
                    onAction: withLoader(rowActions.edit),
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
                            selectedBundle.name,
                        ),
                },
            );
        } else if (selectedResources.length > 1) {
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

    /*
     * Get bulk actions for non-promoted rows
     */
    const getBulkActions = (
        selectedResources: string[],
        selectedBundle: any,
        rowActions: any,
    ): {
        content: string;
        icon: "delete" | "duplicate";
        destructive?: boolean | undefined;
        onAction: () => void | Promise<void>;
    }[] => {
        if (selectedResources.length === 1 && selectedBundle) {
            return [
                {
                    content: "Duplicate",
                    icon: "duplicate",
                    onAction: () => {
                        openModal({
                            type: "duplicate",
                            bundle: selectedBundle,
                            onConfirm: async () => {
                                await rowActions.duplicate();
                                await invalidateBundleCache(queryClient);
                            },
                        });
                    },
                },
                {
                    content: "Delete bundle",
                    icon: "delete",
                    destructive: true,
                    onAction: () => {
                        openModal({
                            type: "delete",
                            bundle: selectedBundle,
                            onConfirm: async () => {
                                await rowActions.delete();
                                await invalidateBundleCache(queryClient);
                            },
                        });
                    },
                },
            ];
        } else if (selectedResources.length > 1) {
            return [
                {
                    content: "Delete bundles",
                    icon: "delete",
                    destructive: true,
                    onAction: () => handleBulkDelete(selectedResources),
                },
            ];
        }
        return [];
    };

    return {
        handleToggleBundleStatus,
        handleBulkActivate,
        handleBulkDraft,
        handleBulkDelete,
        getPromotedBulkActions,
        getBulkActions,
    };
}
