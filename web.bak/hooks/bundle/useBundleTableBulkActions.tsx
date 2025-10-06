"use client";

import {
    bulkToggleBundleStatus,
    deleteBundles,
    toggleBundleStatus,
} from "@/actions";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateBundleCache, withLoader } from "@/utils";
import { DeleteIcon, DuplicateIcon } from "@shopify/polaris-icons";

import type { BundleStatus } from "@/types";
import { useGlobalBanner, useSessionToken } from "@/hooks";
import { useBundleListingStore, useModalStore } from "@/stores";

export function useBundleTableBulkActions() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { refreshBundles } = useBundleListingStore();
    const { showError } = useGlobalBanner();
    const sessionToken = useSessionToken();
    const { openModal, setLoading, closeModal } = useModalStore();
    const updateBundleInStore = useBundleListingStore(
        (s) => s.updateBundleInStore,
    );
    const showToast = useBundleListingStore((s) => s.showToast);

    const handleCreateBundle = () => {
        router.push("/bundles/create");
    };

    const handleToggleBundleStatus = (bundleId: string, currentStatus: BundleStatus, bundleName: string) => {
        if (!sessionToken) return;

        const newStatus: BundleStatus =
            currentStatus === "ACTIVE" ? "DRAFT" : "ACTIVE";

        openModal({
            type: "status",
            bundle: { id: bundleId, name: bundleName, status: currentStatus } as any,
            newStatus,
            onConfirm: async () => {
                setLoading(true);
                try {
                    const result = await toggleBundleStatus(sessionToken, bundleId, newStatus);
                    if (result.status === "success") {
                        updateBundleInStore(bundleId, { status: result.data.status });
                        await invalidateBundleCache(queryClient);
                        showToast(result.message);
                    } else {
                        showError("Status update failed", { content: result.message });
                    }
                } catch {
                    showError("Status update failed", { content: "An unexpected error occurred." });
                }
            },
        });
    };

    // 🔹 Bulk activate
    const handleBulkActivate = (bundleIds: string[]) => {
        if (!sessionToken) return;

        openModal({
            type: "status",
            newStatus: "ACTIVE",
            bundle: { name: "selected bundles" } as any,
            onConfirm: async () => {
                try {
                    const result = await bulkToggleBundleStatus(sessionToken, bundleIds, "ACTIVE");
                    if (result.status === "success") {
                        await refreshBundles();
                        await invalidateBundleCache(queryClient);
                        showToast(`${result.data.updatedCount} bundles activated`);
                    } else {
                        showError("Bulk activation failed", { content: result.message });
                    }
                } catch {
                    showError("Bulk activation failed", { content: "An unexpected error occurred." });
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    // 🔹 Bulk draft
    const handleBulkDraft = (bundleIds: string[]) => {
        if (!sessionToken) return;

        openModal({
            type: "status",
            newStatus: "DRAFT",
            bundle: { name: "selected bundles" } as any,
            onConfirm: async () => {
                setLoading(true);
                try {
                    const result = await bulkToggleBundleStatus(sessionToken, bundleIds, "DRAFT");
                    if (result.status === "success") {
                        await refreshBundles();
                        await invalidateBundleCache(queryClient);
                        showToast(`${result.data.updatedCount} bundles set as draft`);
                    } else {
                        showError("Bulk draft failed", { content: result.message });
                    }
                } catch {
                    showError("Bulk draft failed", { content: "An unexpected error occurred." });
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    // 🔹 Bulk delete
    const handleBulkDelete = (bundleIds: string[]) => {
        if (!sessionToken) return;

        openModal({
            type: "delete",
            bundle: { name: "selected bundles" } as any,
            onConfirm: async () => {
                setLoading(true);
                try {
                    const result = await deleteBundles(sessionToken, bundleIds);
                    if (result.status === "success") {
                        await refreshBundles();
                        await invalidateBundleCache(queryClient);
                        showToast("Selected bundles have been deleted successfully");
                    } else {
                        showError("Bulk delete failed", { content: result.message });
                    }
                } catch {
                    showError("Bulk delete failed", { content: "An unexpected error occurred." });
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    // Promoted actions (inline buttons above the table)
    const getPromotedBulkActions = (
        selectedResources: string[],
        selectedBundle: any,
        rowActions: any
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
                        selectedBundle.status === "ACTIVE" ? "Set as draft" : "Set as active",
                    onAction: () =>
                        handleToggleBundleStatus(selectedBundle.id, selectedBundle.status, selectedBundle.name),
                }
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
                }
            );
        }

        return actions;
    };

    // Dropdown bulk actions
    const getBulkActions = (
        selectedResources: string[],
        selectedBundle: any,
        rowActions: any
    ) => {
        if (selectedResources.length === 1 && selectedBundle) {
            return [
                {
                    content: "Duplicate",
                    icon: DuplicateIcon,
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
                    icon: DeleteIcon,
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