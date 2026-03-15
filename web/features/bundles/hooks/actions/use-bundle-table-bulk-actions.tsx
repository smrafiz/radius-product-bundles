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
import { useTranslations } from "@/lib/i18n/provider";

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
    const t = useTranslations("Bundles.Actions");
    const tb = useTranslations("Bundles.BulkActions");
    const tc = useTranslations("Bundles.Common");

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
                                t("statusUpdated"),
                        );
                    } else {
                        showError(t("statusFailed"), {
                            content: result.message,
                        });
                    }
                } catch {
                    showError(t("statusFailed"), {
                        content: t("unexpectedError"),
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
            bundle: { name: tb("selectedBundles") } as any,
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
                                `${result.data.updatedCount} ${tb("bundlesActivated")}`,
                        );
                    } else {
                        showError(tb("bulkActivateFailed"), {
                            content: result.message,
                        });
                    }
                } catch {
                    showError(tb("bulkActivateFailed"), {
                        content: t("unexpectedError"),
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
        if (!app) {
            return;
        }

        openModal({
            type: "status",
            bundle: { name: tb("selectedBundles") } as any,
            newStatus: "DRAFT",
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
                                `${result.data.updatedCount} ${tb("bundlesDrafted")}`,
                        );
                    } else {
                        showError(tb("bulkDraftFailed"), {
                            content: result.message,
                        });
                    }
                } catch {
                    showError(tb("bulkDraftFailed"), {
                        content: t("unexpectedError"),
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
            bundle: { name: tb("selectedBundles") } as any,
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
                                tb("bulkDeleteSuccess"),
                        );
                        if (clearSelection) {
                            clearSelection();
                        }
                    } else {
                        showError(tb("bulkDeleteFailed"), {
                            content: result.message,
                        });
                    }
                } catch {
                    showError(tb("bulkDeleteFailed"), {
                        content: t("unexpectedError"),
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
                    content: tb("edit"),
                    onAction: withLoader(rowActions.edit),
                },
                {
                    content:
                        selectedBundle.status === "ACTIVE"
                            ? tb("setDraft")
                            : tb("setActive"),
                    onAction: () => {
                        handleToggleBundleStatus(
                            selectedBundle.id,
                            selectedBundle.status,
                            selectedBundle.name,
                        );
                    },
                },
            );
        } else if (selectedResources.length > 1) {
            actions.push(
                {
                    content: tb("setActive"),
                    onAction: () => handleBulkActivate(selectedResources),
                },
                {
                    content: tb("setDraft"),
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
                    content: tc("duplicate"),
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
                    content: tc("deleteBundle"),
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
                    content: tb("deleteBundles"),
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
